import { useState, useCallback, useRef } from 'react'
import LeftSidebar from './components/LeftSidebar'
import CenterView from './components/CenterView'
import RightSidebar from './components/RightSidebar'
import OutcomeModal from './components/OutcomeModal'
import PatientDetailModal from './components/PatientDetailModal'
import CaseSummaryModal from './components/CaseSummaryModal'
import { OUTCOME_ACTION_IDS } from './components/LeftSidebar'
import { useCaseEngine } from './simulation/useCaseEngine'
import { CLINICAL_HINTS, type Vitals } from './simulation/pneumothoraxCase'

// Kept only because VitalsDetailModal/RightSidebar still type against it — the demo runs a single
// hardcoded case, so this is always 'pneumothorax'.
export type ScenarioMode = 'pneumothorax' | 'pe_trap' | 'stemi'
export type { Vitals }

/** Full-screen overlay shown while an action is "in progress", keyed by action id. */
const VIDEO_OVERRIDE_BY_ACTION: Record<string, string> = {
  'history-taking': 'action-history-taking.jpg',
  'physical-exam': 'action-physical-exam.jpg',
  pocus: 'action-pocus.jpg',
  'chest-xray': 'patient-going-xrayroom.png',
  'blood-panel': 'action-blood-test.jpg',
  oxygen: 'action-oxygen.jpg',
  'needle-decompression': 'patient-taking-procedure.png',
  'chest-tube': 'action-chest-tube.jpg',
}

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

  const [chatExpanded, setChatExpanded] = useState(false)
  const [message, setMessage] = useState('')
  const [monitorAttached, setMonitorAttached] = useState(false)
  const [activeOutcomeAction, setActiveOutcomeAction] = useState<string | null>(null)
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [isSoundOn, setIsSoundOn] = useState(true)

  const [patientOverrideImage, setPatientOverrideImage] = useState<string | null>(null)
  const overrideTimerRef = useRef<number | null>(null)

  const triggerImageOverride = useCallback((img: string, duration = 3000) => {
    setPatientOverrideImage(img)
    if (overrideTimerRef.current) window.clearTimeout(overrideTimerRef.current)
    overrideTimerRef.current = window.setTimeout(() => {
      setPatientOverrideImage(null)
      overrideTimerRef.current = null
    }, duration)
  }, [])

  const handleSend = () => {
    if (!message.trim()) return
    engine.sendMessage(message.trim())
    setMessage('')
  }

  const handlePerformAction = useCallback(
    (actionId: string) => {
      const overrideVideo = VIDEO_OVERRIDE_BY_ACTION[actionId]
      const hasOverride = !!overrideVideo
      if (overrideVideo) {
        triggerImageOverride(overrideVideo)
      }

      engine.performAction(actionId)

      if (OUTCOME_ACTION_IDS.has(actionId)) {
        if (hasOverride) {
          window.setTimeout(() => setActiveOutcomeAction(actionId), 3000)
        } else {
          setActiveOutcomeAction(actionId)
        }
      }
    },
    [engine, triggerImageOverride]
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
  const isHappy = vitals.hr >= 60 && vitals.hr <= 100 && vitals.spo2 >= 95 && vitals.rr >= 12 && vitals.rr <= 20 && sys >= 90 && sys <= 130

  let baseImage = 'patient-without-monitor.png'
  if (isBad) {
    baseImage = 'patient-bad.png'
  } else if (isHappy) {
    baseImage = 'patient-happy.png'
  } else if (monitorAttached) {
    baseImage = 'patient-with-monitor.png'
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
        <div className="grid h-full grid-cols-[300px_1fr_300px] gap-5">
          <LeftSidebar
            monitorAttached={monitorAttached}
            onMonitorChange={setMonitorAttached}
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
            performedActions={engine.performedActionIds}
            onViewOutcome={setActiveOutcomeAction}
            onViewPatientDetails={() => setPatientModalOpen(true)}
            onUseHint={handleUseHint}
            isMuted={isMuted}
            isSoundOn={isSoundOn}
            onToggleMute={() => setIsMuted((m) => !m)}
            onToggleSound={() => setIsSoundOn((s) => !s)}
            patientImage={patientImage}
          />
          <RightSidebar
            monitorAttached={monitorAttached}
            secondsLeft={engine.secondsLeft}
            onTickDown={() => {}}
            vitals={vitals}
            onHandOff={engine.handOff}
            caseEnded={engine.ended}
            scenario="pneumothorax"
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
        {/* engine.ended fires the instant a terminal action resolves — wait for any in-progress
            photo overlay to finish its 3s first, so a terminal action doesn't cut straight to
            the summary before the learner sees what just happened. */}
        <CaseSummaryModal
          open={engine.ended && patientOverrideImage === null}
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
