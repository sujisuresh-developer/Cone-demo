import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../components/ChatPanel'
import {
  ACTIONS_BY_ID,
  CASE_CONFIG,
  EDGES,
  STATES,
  edgesFrom,
  findActionEdge,
  findTimerEdge,
  type CaseEdge,
  type StateId,
  type Vitals,
} from './pneumothoraxCase'

export type EngineEvent = {
  id: string
  type: 'action' | 'timer'
  actionId?: string
  edgeId: string
  fromState: StateId
  toState: StateId
  score: number
  /** Seconds since the case started, at the moment this event fired. */
  elapsedSeconds: number
}

type RampState = {
  from: Vitals
  to: Vitals
  startedAt: number
  durationMs: number
}

export type CaseStatus = 'success' | 'partial' | 'failed'

export type ScoreBreakdownEntry = {
  label: string
  points: number
  note?: string
  /** State the learner was in when this decision was made (e.g. "Arrival", "Assessment"). */
  stateName: string
  isCorrect: boolean
  /** Name of the best-scoring action available from that same state — only set when isCorrect
   * is false, so the summary can say what should have been done instead. */
  correctActionLabel?: string
}

/** For every state, the name of its highest-scoring outgoing action edge — used to tell the
 * learner what the correct move would have been at a state where they chose wrong. Computed
 * once at module load since EDGES/ACTIONS_BY_ID never change at runtime. */
const BEST_ACTION_NAME_BY_STATE: Partial<Record<StateId, string>> = (() => {
  const bestScore: Partial<Record<StateId, number>> = {}
  const bestName: Partial<Record<StateId, string>> = {}
  for (const edge of EDGES) {
    if (edge.trigger !== 'action' || !edge.actionId) continue
    const current = bestScore[edge.source]
    if (current === undefined || edge.score > current) {
      bestScore[edge.source] = edge.score
      bestName[edge.source] = ACTIONS_BY_ID[edge.actionId]?.name ?? edge.actionId
    }
  }
  return bestName
})()

export type CaseResult = {
  totalScore: number
  caseStatus: CaseStatus
  /** Every scored decision, in order, positive and negative — what the total is actually built from. */
  scoreBreakdown: ScoreBreakdownEntry[]
  wrongMoveSeconds: number
  hintDeductionPts: number
  /** Whether a terminal state was reached, and whether it was a good one (Recovery/ICU vs Death). */
  reachedTerminal: boolean
  reachedGoodOutcome: boolean
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function lerpVitals(from: Vitals, to: Vitals, t: number): Vitals {
  const [fs, fd] = from.bp.split('/').map(Number)
  const [ts, td] = to.bp.split('/').map(Number)
  return {
    hr: Math.round(lerp(from.hr, to.hr, t)),
    bp: `${Math.round(lerp(fs, ts, t))}/${Math.round(lerp(fd, td, t))}`,
    rr: Math.round(lerp(from.rr, to.rr, t)),
    spo2: Math.round(lerp(from.spo2, to.spo2, t)),
    temp: Math.round(lerp(from.temp, to.temp, t) * 10) / 10,
  }
}

function computeResult(events: EngineEvent[], finalStateId: StateId, hintsUsed: string[]): CaseResult {
  // Every edge's own score is the whole story: +20 the best action, +10 wrong-but-recoverable,
  // -15 completely wrong. No separate time-threshold bonus layered on top.
  const pathScore = events.reduce((sum, e) => sum + e.score, 0)
  const hintDeductionPts = hintsUsed.length * 5
  const totalScore = Math.max(0, Math.min(100, pathScore - hintDeductionPts))

  const finalState = STATES[finalStateId]
  const reachedTerminal = finalState.isTerminal
  const reachedGoodOutcome = reachedTerminal && finalState.outcome === 'good'

  // Status reflects outcome quality, not a specific diagnostic checkpoint — some good-outcome
  // routes (e.g. Oxygen straight from Respiratory Distress or Shock) never pass through
  // Confirmed Pneumothorax at all, but still saved the patient and shouldn't read as "Failed".
  const allBestChoices = events.length > 0 && events.every((e) => e.score >= 30)
  let caseStatus: CaseStatus = 'failed'
  if (reachedGoodOutcome) {
    caseStatus = allBestChoices ? 'success' : 'partial'
  }

  const wrongMoveSeconds = events
    .filter((e) => e.score < 0 && e.actionId)
    .reduce((sum, e) => sum + (ACTIONS_BY_ID[e.actionId as string]?.timeCost ?? 0), 0)

  const scoreBreakdown: ScoreBreakdownEntry[] = events.map((e) => {
    const edge = EDGES.find((edge) => edge.id === e.edgeId)
    const label = e.actionId ? ACTIONS_BY_ID[e.actionId]?.name ?? e.actionId : `${STATES[e.fromState].name} → ${STATES[e.toState].name} (untreated)`
    const note = e.score < 0 ? edge?.deductionText ?? edge?.transitionNote : edge?.transitionNote
    const isCorrect = e.score > 0
    const bestActionName = BEST_ACTION_NAME_BY_STATE[e.fromState]
    // Don't suggest the same action as "correct" if it's what was actually taken (can happen
    // with a timer/untreated event, where actionId is undefined and label is a synthetic string).
    const correctActionLabel = !isCorrect && bestActionName && bestActionName !== label ? bestActionName : undefined
    return { label, points: e.score, note, stateName: STATES[e.fromState].name, isCorrect, correctActionLabel }
  })
  if (hintDeductionPts > 0) {
    scoreBreakdown.push({
      label: `${hintsUsed.length} clinical hint${hintsUsed.length > 1 ? 's' : ''} used`,
      points: -hintDeductionPts,
      stateName: STATES[finalStateId].name,
      isCorrect: false,
    })
  }

  return {
    totalScore,
    caseStatus,
    scoreBreakdown,
    wrongMoveSeconds,
    hintDeductionPts,
    reachedTerminal,
    reachedGoodOutcome,
  }
}

export function useCaseEngine() {
  const currentStateIdRef = useRef<StateId>('arrival')
  const rampRef = useRef<RampState | null>(null)
  const performedRef = useRef<Set<string>>(new Set())
  const eventsRef = useRef<EngineEvent[]>([])
  const endedRef = useRef(false)

  // Single source of truth for "in-case" time: idle real-time ticking (1s per 1s) and an
  // action's own timeCost both advance this the same way, so a slow test (e.g. a 10-minute
  // blood draw/workup) burns exactly as much simulated time as sitting idle for 10 minutes
  // would — and both can push the patient past a deterioration Timer edge. Timer edges fire
  // relative to when the *current* state was entered (enteredStateAtSimRef) — each of
  // Confirmed Pneumothorax and Shock has its own independent countdown.
  const elapsedSimSecondsRef = useRef(0)
  const enteredStateAtSimRef = useRef(0)

  const [, forceTick] = useState(0)
  const rerender = useCallback(() => forceTick((n) => n + 1), [])

  const [vitals, setVitals] = useState<Vitals>(STATES.arrival.vitals)
  const [secondsLeft, setSecondsLeft] = useState(CASE_CONFIG.totalTimeSeconds)
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 'm-init', sender: 'patient', text: STATES.arrival.dialogue },
  ])
  const [ended, setEnded] = useState(false)
  const [endReason, setEndReason] = useState<'handoff' | 'timeout' | null>(null)
  const [hintsUsed, setHintsUsed] = useState<string[]>([])

  const pushMessage = useCallback((sender: ChatMessage['sender'], text: string) => {
    if (!text) return
    setMessages((prev) => [
      ...prev,
      { id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, sender, text },
    ])
  }, [])

  const endCase = useCallback((reason: 'handoff' | 'timeout') => {
    if (endedRef.current) return
    endedRef.current = true
    setEnded(true)
    setEndReason(reason)
  }, [])

  /** Commits the graph-logical side of a transition (current node, dialogue, terminal check)
   * immediately — available actions and further timer checks see the new state right away.
   * Vitals display is handled separately (see applyEdge) so a slow visual ramp never blocks
   * the learner from acting on the state they're already logically in. */
  const commitStateTransition = useCallback(
    (edge: CaseEdge) => {
      currentStateIdRef.current = edge.target
      enteredStateAtSimRef.current = elapsedSimSecondsRef.current
      const dialogue = STATES[edge.target].dialogue
      if (dialogue) pushMessage('patient', dialogue)
      if (STATES[edge.target].isTerminal) {
        endCase('handoff')
      }
    },
    [pushMessage, endCase]
  )

  /** Logs an edge's score/deduction without necessarily moving the graph — see performAction
   * for the case where a wait-triggered deterioration preempts the action that was in flight. */
  const recordEvent = useCallback(
    (edge: CaseEdge) => {
      eventsRef.current = [
        ...eventsRef.current,
        {
          id: `${edge.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          type: edge.trigger,
          actionId: edge.actionId,
          edgeId: edge.id,
          fromState: edge.source,
          toState: edge.target,
          score: edge.score,
          elapsedSeconds: elapsedSimSecondsRef.current,
        },
      ]
      if (edge.transitionNote) pushMessage('system', edge.transitionNote)
    },
    [pushMessage]
  )

  const applyEdge = useCallback(
    (edge: CaseEdge) => {
      recordEvent(edge)

      const isLoop = edge.target === edge.source
      if (isLoop) {
        rerender()
        return
      }

      commitStateTransition(edge)

      if (edge.trigger === 'timer' && edge.changePattern === 'linear' && edge.changeDurationSeconds) {
        // Purely cosmetic: the state has already changed above, this just animates the
        // displayed numbers toward it instead of snapping instantly.
        rampRef.current = {
          from: STATES[edge.source].vitals,
          to: STATES[edge.target].vitals,
          startedAt: Date.now(),
          durationMs: edge.changeDurationSeconds * 1000,
        }
      } else {
        setVitals(STATES[edge.target].vitals)
      }
      rerender()
    },
    [recordEvent, commitStateTransition, rerender]
  )

  /** Checks whether enough simulated time has passed in the current state for its Timer
   * edge (if any) to fire. */
  const checkAndFireTimerEdge = useCallback(() => {
    const edge = findTimerEdge(currentStateIdRef.current)
    if (edge && edge.timerSeconds != null) {
      const timeInState = elapsedSimSecondsRef.current - enteredStateAtSimRef.current
      if (timeInState >= edge.timerSeconds) {
        applyEdge(edge)
      }
    }
  }, [applyEdge])

  /** Advances the shared simulated clock — used both for idle real-time ticking and for an
   * action's own timeCost — and checks whether that push crossed a deterioration threshold. */
  const advanceSimClock = useCallback(
    (seconds: number) => {
      elapsedSimSecondsRef.current += seconds
      setSecondsLeft(Math.max(0, CASE_CONFIG.totalTimeSeconds - elapsedSimSecondsRef.current))
      checkAndFireTimerEdge()
    },
    [checkAndFireTimerEdge]
  )

  const performAction = useCallback(
    (actionId: string) => {
      if (endedRef.current) return
      if (performedRef.current.has(actionId)) return
      const preState = currentStateIdRef.current
      const edge = findActionEdge(preState, actionId)
      if (!edge) return
      const action = ACTIONS_BY_ID[actionId]
      performedRef.current.add(actionId)

      // Time the action costs to perform passes in-universe too — ordering a slow test can
      // itself run the patient past a deterioration timer while the result is pending.
      advanceSimClock(action.timeCost)

      if (action.resultText) pushMessage('system', action.resultText)

      if (currentStateIdRef.current === preState) {
        applyEdge(edge)
      } else {
        // The wait for this action's result already carried the patient into a new state —
        // the action's own consequence arrived too late to change the graph, but its score
        // (e.g. a low-yield test ordered too early) still counts.
        recordEvent(edge)
      }
    },
    [advanceSimClock, applyEdge, recordEvent, pushMessage]
  )

  const useHint = useCallback(
    (hintText: string) => {
      setHintsUsed((prev) => (prev.includes(hintText) ? prev : [...prev, hintText]))
      pushMessage('system', `CLINICAL HINT: ${hintText}`)
    },
    [pushMessage]
  )

  const sendMessage = useCallback((text: string) => pushMessage('doctor', text), [pushMessage])
  // Tracked separately from `ended`/`endReason`: those flip as soon as the case is logically over
  // (terminal state reached, or timeout), but the CaseSummaryModal should only appear once the
  // learner explicitly confirms hand-off — not the instant the case ends behind the scenes.
  const [handoffPerformed, setHandoffPerformed] = useState(false)
  const handOff = useCallback(() => {
    setHandoffPerformed(true)
    endCase('handoff')
  }, [endCase])

  /** Resets the whole engine back to Arrival — lets the same demo be re-run without a page reload. */
  const restart = useCallback(() => {
    currentStateIdRef.current = 'arrival'
    elapsedSimSecondsRef.current = 0
    enteredStateAtSimRef.current = 0
    rampRef.current = null
    performedRef.current = new Set()
    eventsRef.current = []
    endedRef.current = false
    setVitals(STATES.arrival.vitals)
    setSecondsLeft(CASE_CONFIG.totalTimeSeconds)
    setMessages([{ id: `m-init-${Date.now()}`, sender: 'patient', text: STATES.arrival.dialogue }])
    setEnded(false)
    setEndReason(null)
    setHandoffPerformed(false)
    setHintsUsed([])
    rerender()
  }, [rerender])

  // Main tick loop — interpolates any in-flight vitals ramp, and advances the shared
  // simulated clock by one second for every real second that passes while idle. Keeps running
  // past the case logically ending (terminal state reached) so the countdown on screen matches
  // reality until the learner actually confirms hand-off.
  useEffect(() => {
    if (handoffPerformed) return
    let lastSecondTick = Date.now()
    const id = setInterval(() => {
      const now = Date.now()

      if (rampRef.current) {
        const { from, to, startedAt, durationMs } = rampRef.current
        const t = Math.min(1, (now - startedAt) / durationMs)
        setVitals(lerpVitals(from, to, t))
        if (t >= 1) {
          rampRef.current = null
        }
      }

      if (now - lastSecondTick >= 1000) {
        lastSecondTick = now
        advanceSimClock(1)
      }
    }, 200)
    return () => clearInterval(id)
  }, [handoffPerformed, advanceSimClock])

  // Timeout watchdog — the case ends the moment the countdown hits zero, wherever the learner is.
  useEffect(() => {
    if (!ended && secondsLeft <= 0) {
      endCase('timeout')
    }
  }, [secondsLeft, ended, endCase])

  const currentStateId = currentStateIdRef.current
  const availableActionIds = new Set(
    edgesFrom(currentStateId)
      .filter((e) => e.trigger === 'action')
      .map((e) => e.actionId as string)
  )
  const isConscious = STATES[currentStateId].isConscious
  const isRamping = rampRef.current !== null
  const result = ended ? computeResult(eventsRef.current, currentStateId, hintsUsed) : null

  return {
    vitals,
    secondsLeft,
    totalTimeSeconds: CASE_CONFIG.totalTimeSeconds,
    messages,
    sendMessage,
    performedActionIds: Array.from(performedRef.current),
    performAction,
    availableActionIds,
    currentStateId,
    currentStateName: STATES[currentStateId].name,
    isConscious,
    isRamping,
    ended,
    endReason,
    handoffPerformed,
    handOff,
    restart,
    hintsUsed,
    useHint,
    result,
  }
}
