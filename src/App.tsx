import { useState, useCallback, useRef, useEffect } from 'react'
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
  // No dedicated photo — clinically identical draw to troponin, reuses its overlay.
  'd-dimer': 'action-images/action_troponin.png',
  abg: 'action-images/action_abg.png',
  'ct-chest': 'action-images/action_ct_chest.png',
  'senior-consult': 'action-images/action_senior_consult.png',
  // 'analgesia-iv' has no sourced photo yet — falls back to the current base patient image.
}

/**
 * Persistent patient look after certain actions are performed (e.g. oxygen mask stays on),
 * as opposed to VIDEO_OVERRIDE_BY_ACTION's 3s in-progress overlay. Only one photo can be shown
 * at a time, so PERSISTENT_LOOK_PRIORITY (below) picks the most visually/clinically significant
 * one when several qualifying actions have been performed.
 */
const AFTER_ACTION_IMAGE: Record<string, string> = {
  'chest-tube': 'action-images/after_taking_chest_tube.png',
  'needle-decompression': 'action-images/after_taking_needle_decompression.png',
  oxygen: 'action-images/after_taking_oxygen.png',
  'iv-fluids': 'action-images/after_taking_iv_fluids.png',
  'iv-access': 'action-images/after_taking_iv_access.png',
  monitoring: 'action-images/after_taking_monitoring.png',
  abg: 'action-images/after_taking_abg.png',
  'blood-panel': 'action-images/after_taking_blood_panel.png',
  troponin: 'action-images/after_taking_blood_panel.png',
  'd-dimer': 'action-images/after_taking_blood_panel.png',
  ecg: 'action-images/after_taking_ecg.png',
}

/** Highest-significance first — determines which persistent look wins when several apply. */
const PERSISTENT_LOOK_PRIORITY = [
  'chest-tube',
  'needle-decompression',
  'oxygen',
  'iv-fluids',
  'iv-access',
  'monitoring',
  'abg',
  'blood-panel',
  'troponin',
  'd-dimer',
  'ecg',
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

  const handleSend = () => {
    if (!message.trim()) return
    engine.sendMessage(message.trim())
    setMessage('')
  }

  const handleMonitorChange = useCallback((attached: boolean) => {
    setMonitorAttached(attached)
    if (attached) setVitalsModalOpen(true)
  }, [])

  const handlePerformAction = useCallback(
    (actionId: string) => {
      if (patientOverrideImage !== null) return // Ignore clicks while video is playing

      const overrideVideo = VIDEO_OVERRIDE_BY_ACTION[actionId]
      const hasOverride = !!overrideVideo

      if (hasOverride) {
        triggerImageOverride(overrideVideo, 6000)
        window.setTimeout(() => {
          engine.performAction(actionId)

          if (OUTCOME_ACTION_IDS.has(actionId)) {
            setActiveOutcomeAction(actionId)
          } else if (actionId === 'history-taking') {
            setPatientModalOpen(true)
          } else if (actionId === 'monitoring') {
            setVitalsModalOpen(true)
          }
        }, 6000)
      } else {
        engine.performAction(actionId)

        if (OUTCOME_ACTION_IDS.has(actionId)) {
          setActiveOutcomeAction(actionId)
        } else if (actionId === 'history-taking') {
          setPatientModalOpen(true)
        } else if (actionId === 'monitoring') {
          setVitalsModalOpen(true)
        }
      }
    },
    [engine, patientOverrideImage, triggerImageOverride]
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

  let baseImage = 'action-images/patient-without-monitor.png'
  if (engine.currentStateId === 'death') {
    baseImage = 'action-images/dead.png'
  } else if (isBad) {
    baseImage = 'action-images/fail.png'
  } else if (isHappy) {
    baseImage = 'action-images/patient-happy.png'
  } else if (persistentLookImage) {
    baseImage = persistentLookImage
  } else if (monitorAttached) {
    baseImage = 'action-images/patient-with-monitor.png'
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
            vitalsModalOpen={vitalsModalOpen}
            onVitalsModalOpenChange={setVitalsModalOpen}
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
