import { useState, useCallback, useRef, useEffect } from 'react'
import LeftSidebar from './components/LeftSidebar'
import CenterView from './components/CenterView'
import RightSidebar from './components/RightSidebar'
import OutcomeModal from './components/OutcomeModal'
import PatientDetailModal from './components/PatientDetailModal'
import CaseSummaryModal from './components/CaseSummaryModal'
import { OUTCOME_ACTION_IDS } from './components/LeftSidebar'
import { useCaseEngine } from './simulation/useCaseEngine'
import { ACTIONS_BY_ID, CLINICAL_HINTS, type Vitals } from './simulation/pneumothoraxCase'
import { appendImpressionToNotepad } from './utils/impressionNotes'

// Kept only because VitalsDetailModal/RightSidebar still type against it — the demo runs a single
// hardcoded case, so this is always 'pneumothorax'.
export type ScenarioMode = 'pneumothorax' | 'pe_trap' | 'stemi'
export type { Vitals }

/** Full-screen overlay shown for 3s while an action is "in progress", keyed by action id. */
const VIDEO_OVERRIDE_BY_ACTION: Record<string, string> = {
  'physical-exam': 'action-images/action_physical_exam.png',
  monitoring: 'action-images/action_monitoring.png',
  'blood-panel': 'action-images/action_blood_panel.png',
  pocus: 'correct_videos/ultra_sound.mp4',//added that ultra sound video
  'chest-xray': 'action-images/action_chest_xray.png',
  oxygen: 'action-images/action_oxygen.png',
  'needle-decompression': 'correct_videos/needle_decompression.mp4',//added that needle decompression video
  'chest-tube': 'action-images/action_chest_tube.png',
  'iv-fluids': 'action-images/action_iv_fluids.png',
  ecg: 'action-images/action_ecg.png',
  'iv-access': 'action-images/action_iv_access.png',
  troponin: 'action-images/action_troponin.png',
  'd-dimer': 'action-images/D-Dimer Test perform.jpeg',
  abg: 'action-images/action_abg.png',
  'ct-chest': 'action-images/action_ct_chest.png',
  'senior-consult': 'action-images/action_senior_consult.png',
  'analgesia-iv': 'action-images/IV_analgesia Perform.jpeg',
}

/**
 * Persistent patient look after certain actions are performed (e.g. oxygen mask stays on),
 * as opposed to VIDEO_OVERRIDE_BY_ACTION's 3s in-progress overlay. Only one photo can be shown
 * at a time, so PERSISTENT_LOOK_PRIORITY (below) picks the most visually/clinically significant
 * one when several qualifying actions have been performed.
 */
const AFTER_ACTION_IMAGE: Record<string, string> = {
  'chest-tube': 'action-images/after_taking_chest_tube.png',
  'needle-decompression': 'action-images/after_taking_oxygen.png',
  oxygen: 'action-images/after_taking_oxygen.png',
  'iv-fluids': 'action-images/after_taking_iv_fluids.png',
  'iv-access': 'action-images/after_taking_iv_access.png',
  monitoring: 'action-images/after_taking_monitoring.png',
  abg: 'action-images/after_taking_abg.png',
  'blood-panel': 'action-images/fail.png',
  troponin: 'action-images/after_taking_blood_panel.png',
  'd-dimer': 'action-images/D-Dimmer Test After.jpeg',
  ecg: 'action-images/after_taking_ecg.png',
  'physical-exam': 'action-images/fail.png',
  'senior-consult': 'action-images/fail.png',
  'analgesia-iv': 'action-images/IV Ang After.jpeg',
}

/** Actions whose after-image is just a generic "this was a poor/low-yield choice" mood shot
 * (fail.png / D-Dimmer After) rather than a photo of actual equipment attached to the patient.
 * These have no with-monitor variant, so once the monitor is attached it should keep showing
 * instead of these — unlike a real treatment photo (chest-tube, iv-fluids, etc.), which should
 * still win over the plain monitor shot since it depicts something genuinely on the patient. */
const MOOD_ONLY_ACTION_IDS = new Set(['physical-exam', 'blood-panel', 'd-dimer', 'senior-consult'])

/** Persistent-look actions whose after-image doesn't depict the bedside monitor at all, so once
 * the monitor is attached it should keep showing instead of the action's own photo replacing it.
 * Handled with the same precedence as oxygen/needle-decompression (before the isBad check) because
 * these actions' own edges can deteriorate vitals into a "bad" reading (e.g. analgesia-iv routes
 * to Respiratory Distress), which would otherwise trip isBad's generic fail.png first. Unlike the
 * mood-only set, this still has a real (non-fail.png) after-image to fall back to when the
 * monitor isn't attached. */
const KEEP_MONITOR_OVER_ACTION_IDS = new Set(['analgesia-iv'])

/** Highest-significance first — determines which persistent look wins when several apply.
 * oxygen sits at the very top: once oxygen therapy is given, its after-image should stick
 * regardless of whichever other action is performed afterward. */
const PERSISTENT_LOOK_PRIORITY = [
  'oxygen',
  'chest-tube',
  'needle-decompression',
  'iv-fluids',
  'iv-access',
  'monitoring',
  'abg',
  // analgesia-iv must outrank every MOOD_ONLY_ACTION_IDS entry (blood-panel, d-dimer,
  // physical-exam, senior-consult below) — otherwise, since physical-exam alone is performed in
  // nearly every playthrough and used to rank above analgesia-iv here, .find() below would keep
  // resolving to 'physical-exam' after analgesia was given, and analgesia's own
  // KEEP_MONITOR_OVER_ACTION_IDS handling upstream would never actually run.
  'analgesia-iv',
  'blood-panel',
  'troponin',
  'd-dimer',
  'ecg',
  'physical-exam',
  'senior-consult',
]

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatPenaltyTime(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00'
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `-${m}:${s.toString().padStart(2, '0')}`
}

export default function App() {
  const engine = useCaseEngine()

  const [showLoading, setShowLoading] = useState(true)
  const [loadingFadingOut, setLoadingFadingOut] = useState(false)

  useEffect(() => {
    const fadeTimer = window.setTimeout(() => setLoadingFadingOut(true), 2600)
    const hideTimer = window.setTimeout(() => setShowLoading(false), 3000)
    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(hideTimer)
    }
  }, [])

  const [chatExpanded, setChatExpanded] = useState(false)
  const [message, setMessage] = useState('')
  const [monitorAttached, setMonitorAttached] = useState(false)
  const [activeOutcomeAction, setActiveOutcomeAction] = useState<string | null>(null)
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isSoundOn, setIsSoundOn] = useState(true)

  const [patientOverrideImage, setPatientOverrideImage] = useState<string | null>(null)
  const overrideTimerRef = useRef<number | null>(null)

  const triggerImageOverride = useCallback((img: string, duration = 6000) => {
    setPatientOverrideImage(img)
    if (overrideTimerRef.current) window.clearTimeout(overrideTimerRef.current)
    overrideTimerRef.current = window.setTimeout(() => {
      setPatientOverrideImage(null)
      overrideTimerRef.current = null
    }, duration)
  }, [])

  // Pending "show result modal" timers, keyed by actionId, so several delayed results (e.g. an
  // xray and a blood panel ordered back to back) can be in flight independently without one
  // clobbering another. The action itself resolves and updates sim state right away — only the
  // modal display is deferred, so the learner can keep interacting while it counts down.
  const resultTimersRef = useRef<Map<string, number>>(new Map())

  const clearResultTimer = useCallback((actionId: string) => {
    const timers = resultTimersRef.current
    const timerId = timers.get(actionId)
    if (timerId != null) {
      window.clearTimeout(timerId)
      timers.delete(actionId)
    }
  }, [])

  const clearAllResultTimers = useCallback(() => {
    resultTimersRef.current.forEach((timerId) => window.clearTimeout(timerId))
    resultTimersRef.current.clear()
  }, [])

  /** Shows an action's result modal either immediately or, if the action's metadata configures
   * a `resultDelay`, after that many milliseconds. Reusable across every result type — outcome
   * reports, exam findings, procedure outcomes, medication feedback, imaging results — since they
   * all funnel through a `show()` callback that flips the relevant modal-open state. */
  const showResult = useCallback(
    (actionId: string, show: () => void) => {
      const delay = ACTIONS_BY_ID[actionId]?.resultDelay ?? 0
      if (delay <= 0) {
        show()
        return
      }
      clearResultTimer(actionId)
      const timerId = window.setTimeout(() => {
        resultTimersRef.current.delete(actionId)
        show()
      }, delay)
      resultTimersRef.current.set(actionId, timerId)
    },
    [clearResultTimer]
  )

  // Cancel every pending result timer on unmount, and whenever the case restarts (state resets
  // back to Arrival) — otherwise a stale timer from a previous run could pop a modal for an
  // action the learner never performed this time around.
  useEffect(() => {
    if (engine.currentStateId === 'arrival') clearAllResultTimers()
  }, [engine.currentStateId, clearAllResultTimers])

  useEffect(() => clearAllResultTimers, [clearAllResultTimers])

  // Show the CaseSummaryModal only once the learner explicitly confirms hand-off — not the
  // instant the case ends behind the scenes (terminal state reached, or timeout) — with no
  // delay and without waiting on unrelated overlays.
  const summaryModalReady = engine.ended && engine.handoffPerformed

  const handleSend = () => {
    if (!message.trim()) return
    engine.sendMessage(message.trim())
    setMessage('')
  }

  const handleMonitorChange = useCallback((attached: boolean) => {
    setMonitorAttached(attached)
  }, [])

  const handlePerformAction = useCallback(
    (actionId: string) => {
      if (patientOverrideImage !== null) return // Ignore clicks while video is playing

      // Automatically record professional impression note in notepad
      appendImpressionToNotepad(actionId)

      const openResultModal = () => {
        if (OUTCOME_ACTION_IDS.has(actionId)) {
          setActiveOutcomeAction(actionId)
        } else if (actionId === 'history-taking') {
          setPatientModalOpen(true)
        } else if (actionId === 'monitoring') {
          setVitalsModalOpen(true)
        }
      }

      const overrideVideo = VIDEO_OVERRIDE_BY_ACTION[actionId]
      const hasOverride = !!overrideVideo

      if (hasOverride) {
        triggerImageOverride(overrideVideo, 2500)
        window.setTimeout(() => {
          engine.performAction(actionId)
          showResult(actionId, openResultModal)
        }, 2500)
      } else {
        engine.performAction(actionId)
        showResult(actionId, openResultModal)
      }
    },
    [engine, patientOverrideImage, triggerImageOverride, showResult]
  )

  const handleUseHint = useCallback(() => {
    if (engine.hintsUsed.length < CLINICAL_HINTS.length) {
      engine.useHint(CLINICAL_HINTS[engine.hintsUsed.length])
    }
  }, [engine])

  const vitals: Vitals = engine.vitals
  const [sysStr] = vitals.bp.split('/')
  const sys = Number(sysStr) || 120

  const isBad = vitals.hr >= 120 || vitals.hr < 50 || vitals.spo2 < 90 || vitals.rr >= 30 || vitals.rr < 10 || sys < 90 || sys >= 180
  // Arrival's own baseline vitals already sit inside these "happy" thresholds, so this is
  // gated on having left Arrival — otherwise the happy photo would show before the learner
  // has done anything, instead of the plain default (patient-without-monitor.png).
  const isHappy =
    engine.currentStateId !== 'arrival' &&
    vitals.hr >= 60 && vitals.hr <= 100 && vitals.spo2 >= 95 && vitals.rr >= 12 && vitals.rr <= 20 && sys >= 90 && sys <= 130

  const persistentLookActionId = PERSISTENT_LOOK_PRIORITY.find((id) =>
    engine.performedActionIds.includes(id)
  )
  const persistentLookImage = persistentLookActionId ? AFTER_ACTION_IMAGE[persistentLookActionId] : null

  // Before the learner has done anything at all (still on Arrival, no actions performed, monitor
  // not yet attached) show the dedicated arrival photo instead of the plain unmonitored default.
  const noActionsYet =
    engine.currentStateId === 'arrival' && engine.performedActionIds.length === 0 && !monitorAttached

  // Baseline reflects the Attach Monitor toggle directly, so any action without a more specific
  // look (persistent after-image, bad/happy vitals override, death) correctly keeps showing the
  // monitor once it's attached, instead of silently falling back to the unmonitored photo.
  let baseImage = noActionsYet
    ? 'action-images/Patient Arrival.jpeg'
    : monitorAttached
      ? 'action-images/patient-with-monitor.png'
      : 'action-images/patient-without-monitor.png'
  if (engine.currentStateId === 'death') {
    baseImage = 'action-images/dead.png'
  } else if (persistentLookActionId === 'oxygen' || persistentLookActionId === 'needle-decompression') {
    // oxygen/needle-decompression's after-image must win even when the state's vitals read as
    // "bad" (e.g. oxygen -> tension-pneumo, or mid-transition out of tension-pneumo after
    // needle decompression) or "happy".
    baseImage = 'action-images/after_taking_oxygen.png'
  } else if (persistentLookActionId && KEEP_MONITOR_OVER_ACTION_IDS.has(persistentLookActionId)) {
    // analgesia-iv's edge deteriorates vitals into Respiratory Distress (spO2 89), which would
    // otherwise trip the isBad check below and show the generic fail.png mood shot before we
    // ever get to decide between the monitor and analgesia's own photo — same precedence
    // oxygen/needle-decompression already get over isBad, just monitor-aware instead of fixed.
    baseImage = monitorAttached ? 'action-images/patient-with-monitor.png' : persistentLookImage ?? baseImage
  } else if (isBad) {
    baseImage = 'action-images/fail.png'
  } else if (
    persistentLookActionId &&
    !MOOD_ONLY_ACTION_IDS.has(persistentLookActionId) &&
    persistentLookImage
  ) {
    // A real treatment/equipment photo (chest-tube, iv-fluids, abg, ecg, monitoring, ...) always
    // wins — it depicts something genuinely on the patient, monitor attached or not.
    baseImage = persistentLookImage
  } else if (monitorAttached) {
    // No monitor-attached variant exists for the generic "poor choice" mood shots (physical-exam,
    // blood-panel, d-dimer, senior-consult), so once the monitor is attached it keeps showing
    // instead of falling back to one of those.
    baseImage = 'action-images/patient-with-monitor.png'
  } else if (persistentLookActionId === 'd-dimer') {
    baseImage = 'action-images/D-Dimmer Test After.jpeg'
  } else if (persistentLookImage) {
    // Remaining mood-only persistent looks (physical-exam, blood-panel, senior-consult -> fail.png).
    baseImage = persistentLookImage
  } else if (isHappy) {
    baseImage = 'action-images/fail.png'
  }

  const patientImage = patientOverrideImage || baseImage

  const timeRemainingStr = formatClock(engine.secondsLeft)
  const wrongMovePenaltyStr = formatPenaltyTime(engine.result?.wrongMoveSeconds ?? 0)
  const decisionSpeedPct = engine.endReason === 'timeout'
    ? 10
    : Math.round(Math.max(15, Math.min(95, (engine.secondsLeft / engine.totalTimeSeconds) * 100)))
  const wrongMoveCount = engine.result?.scoreBreakdown.filter((e) => e.points < 0).length ?? 0
  const guidelineAdherencePct = engine.result ? Math.max(0, 100 - wrongMoveCount * 30) : 100
  const performedDefinitiveTreatment =
    engine.performedActionIds.includes('needle-decompression') || engine.performedActionIds.includes('chest-tube')
  const interventionTimePct = performedDefinitiveTreatment ? Math.max(15, 95 - wrongMoveCount * 15) : 0

  try {
    return (
      <div className="h-screen w-screen overflow-hidden bg-surface p-5">
        {showLoading && (
          <div
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-surface transition-opacity duration-400 ${
              loadingFadingOut ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="text-[14px] font-medium text-gray-500">Loading case...</p>
          </div>
        )}
        <div className="grid h-full grid-cols-[300px_1fr_300px] gap-5">
          <LeftSidebar
            monitorAttached={monitorAttached}
            onMonitorChange={handleMonitorChange}
            performed={engine.performedActionIds}
            availableActionIds={engine.availableActionIds}
            currentStateName={engine.currentStateName}
            onPerform={handlePerformAction}
            onViewPatientDetails={() => setPatientModalOpen(true)}
            patientImage={patientImage}
          />
          <CenterView
            chatExpanded={chatExpanded}
            onToggleChat={() => setChatExpanded((v) => !v)}
            message={message}
            onMessageChange={setMessage}
            messages={engine.messages}
            onSend={handleSend}
            _onViewPatientDetails={() => setPatientModalOpen(true)}
            onUseHint={handleUseHint}
            isMuted={isMuted}
            isSoundOn={isSoundOn}
            onToggleMute={() => setIsMuted((m) => !m)}
            onToggleSound={() => setIsSoundOn((s) => !s)}
            patientImage={patientImage}
            monitorAttached={monitorAttached}
            onOpenVitals={() => setVitalsModalOpen(true)}
          />
          <RightSidebar
            monitorAttached={monitorAttached}
            secondsLeft={engine.secondsLeft}
            onTickDown={() => {}}
            vitals={vitals}
            onHandOff={engine.handOff}
            caseEnded={engine.ended}
            scenario="pneumothorax"
            vitalsModalOpen={vitalsModalOpen}
            onVitalsModalOpenChange={setVitalsModalOpen}
            performedActions={engine.performedActionIds}
            onViewOutcome={setActiveOutcomeAction}
          />
        </div>
        <OutcomeModal
          open={activeOutcomeAction !== null}
          onClose={() => setActiveOutcomeAction(null)}
          actionId={activeOutcomeAction}
        />
        <PatientDetailModal
          open={patientModalOpen}
          onClose={() => setPatientModalOpen(false)}
        />
        <CaseSummaryModal
          open={summaryModalReady}
          onClose={engine.restart}
          endReason={engine.endReason ?? 'handoff'}
          caseStatus={engine.result?.caseStatus ?? 'failed'}
          score={engine.result?.totalScore ?? 0}
          timeRemainingStr={timeRemainingStr}
          wrongMovePenaltyStr={wrongMovePenaltyStr}
          hintDeductionPts={engine.result?.hintDeductionPts ?? 0}
          decisionSpeedPct={decisionSpeedPct}
          guidelineAdherencePct={guidelineAdherencePct}
          interventionTimePct={interventionTimePct}
          scoreBreakdown={engine.result?.scoreBreakdown ?? []}
          hintsUsed={engine.hintsUsed}
        />
      </div>
    )
  } catch (err) {
    console.error('App Render Error:', err)
    return (
      <div className="p-5 text-red-600 bg-red-50 border border-red-200 rounded-xl m-5 font-mono">
        <h3 className="font-extrabold text-[15px] mb-2">Runtime Rendering Error</h3>
        <p className="text-[12px]">{(err as Error).stack || (err as Error).message}</p>
      </div>
    )
  }
}
