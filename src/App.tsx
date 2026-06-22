import { useState, useCallback, useEffect, useRef } from 'react'
import LeftSidebar from './components/LeftSidebar'
import CenterView from './components/CenterView'
import RightSidebar from './components/RightSidebar'
import { INITIAL_MESSAGES, type ChatMessage } from './components/ChatPanel'
import OutcomeModal from './components/OutcomeModal'
import PatientDetailModal from './components/PatientDetailModal'
import CaseSummaryModal from './components/CaseSummaryModal'

export type ScenarioMode = 'pneumothorax' | 'pe_trap' | 'stemi'

const CLINICAL_HINTS = [
  "Check the patient's breath sounds or perform a bedside lung ultrasound (POCUS) to evaluate for a pneumothorax.",
  "A massive right-sided pneumothorax with mediastinal shift requires immediate needle decompression (14g) in the 2nd intercostal space, midclavicular line.",
  "Avoid positive pressure ventilation (intubation) before decompressing, as this will trigger severe cardiovascular collapse."
]

export type Vitals = {
  hr: number
  bp: string
  rr: number
  spo2: number
  temp: number
}

const ACTION_MESSAGES: Record<string, { system: string; patient?: string }> = {
  'lung-ultrasound': {
    system: "Bedside Lung Ultrasound performed: reveals 'absent lung sliding' and 'A-lines' on the right chest, indicating a pneumothorax."
  },
  'chest-xray': {
    system: "Portable Chest X-Ray performed: reveals a large right-sided pneumothorax with mediastinal shift to the left."
  },
  'ecg-troponin': {
    system: "12-Lead ECG & Troponin ordered: ECG shows Sinus Tachycardia. Troponin level is pending."
  },
  'ctpa': {
    system: "CT Pulmonary Angiography performed: shows no pulmonary embolism, but confirms a massive right-sided tension pneumothorax. The delay has severely compromised the patient!"
  },
  'ddimer-bnp': {
    system: "Labs completed: D-Dimer and BNP are within normal range. PE and acute heart failure are ruled out."
  },
  'leg-ultrasound': {
    system: "Leg Ultrasound completed: no deep vein thrombosis (DVT) detected."
  },
  'oxygen': {
    system: "Supplemental oxygen administered via non-rebreather mask. SpO₂ improves, but the patient remains tachypneic (RR stays at 24)."
  },
  'nitroglycerin': {
    system: "Sublingual Nitroglycerin given. Blood pressure drops slightly. Breathing is unimproved and patient remains hypoxic."
  },
  'heparin': {
    system: "Heparin administered. Vitals remain unchanged; anticoagulants cannot treat a mechanical collapsed lung."
  },
  'thrombolysis': {
    system: "Systemic Thrombolysis (Alteplase) administered. WARNING: Major medical error. Thrombolytics do not treat a tension pneumothorax."
  },
  'vasopressors': {
    system: "Norepinephrine infusion started. Blood pressure rises temporarily, but the underlying tension physiology remains uncorrected."
  },
  'needle-decomp': {
    system: "Needle decompression (14g) performed in the 2nd intercostal space at the midclavicular line. A sudden rush of air escapes!",
    patient: "That's better... I can breathe..."
  },
  'intubation-ppv': {
    system: "WARNING: Intubation and positive pressure ventilation started. Positive pressure ventilation in a tension pneumothorax causes immediate cardiovascular collapse!"
  }
}

export function getVitals(scenario: ScenarioMode, performedActions: string[], secondsLeft: number): Vitals {
  const performed = new Set(performedActions)
  const isOxygen = performed.has('oxygen')
  const isNitro = performed.has('nitroglycerin')
  const isVaso = performed.has('vasopressors')
  const isHeparin = performed.has('heparin')
  const isThrombolysis = performed.has('thrombolysis')

  let hr = 108
  let bp = '128/78'
  let rr = 24
  let spo2 = 92
  let temp = 36.8

  if (scenario === 'pneumothorax') {
    const isNeedleDecomp = performed.has('needle-decomp')
    const isIntubated = performed.has('intubation-ppv')
    const isTimeCrashed = (secondsLeft <= 120) && !isNeedleDecomp

    if (isNeedleDecomp) {
      hr = 95
      rr = 18
      spo2 = isOxygen ? 98 : 95
      bp = '110/70'
    } else if (isIntubated) {
      hr = 135
      bp = isNitro ? '65/35' : (isVaso ? '90/55' : '70/40')
      rr = 28
      spo2 = 75
    } else if (isTimeCrashed) {
      hr = 125
      bp = isNitro ? '86/54' : (isVaso ? '110/70' : '92/58')
      rr = 32
      spo2 = isOxygen ? 90 : 86
    } else {
      if (isOxygen) {
        spo2 = 96
      }
      if (isVaso) {
        bp = '145/90'
      } else if (isNitro) {
        bp = '118/72'
      }
    }
  } else if (scenario === 'pe_trap') {
    const isAnticoagulated = isHeparin || isThrombolysis
    const isTimeCrashed = (secondsLeft <= 120) && !isAnticoagulated

    hr = 118
    bp = '98/62'
    rr = 26
    spo2 = 89
    temp = 37.1

    if (isAnticoagulated) {
      hr = 90
      rr = 16
      spo2 = isOxygen ? 98 : 96
      bp = '115/75'
    } else if (isTimeCrashed) {
      hr = 130
      bp = isNitro ? '72/44' : (isVaso ? '105/65' : '82/50')
      rr = 30
      spo2 = isOxygen ? 88 : 82
    } else {
      if (isOxygen) {
        spo2 = 93
      }
      if (isVaso) {
        bp = '115/72'
      } else if (isNitro) {
        bp = '88/54'
      }
    }
  } else if (scenario === 'stemi') {
    const isReperfused = isNitro || isThrombolysis
    const isTimeCrashed = (secondsLeft <= 120) && !isReperfused

    hr = 102
    bp = '142/88'
    rr = 22
    spo2 = 94
    temp = 36.6

    if (isReperfused) {
      hr = 82
      rr = 16
      spo2 = 98
      bp = '120/80'
    } else if (isTimeCrashed) {
      hr = 120
      bp = isNitro ? '100/60' : (isVaso ? '135/85' : '90/60')
      rr = 26
      spo2 = 90
    } else {
      if (isOxygen) {
        spo2 = 97
      }
      if (isVaso) {
        bp = '160/98'
      } else if (isNitro) {
        bp = '122/76'
      }
    }
  }

  return { hr, bp, rr, spo2, temp }
}

export default function App() {
  const [chatExpanded, setChatExpanded] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [monitorAttached, setMonitorAttached] = useState(false)
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'medications' | 'procedures'>('diagnostics')
  const [secondsLeft, setSecondsLeft] = useState(12 * 60) // 12:00
  const [scenario, setScenario] = useState<ScenarioMode>('pneumothorax')
  const [performedActions, setPerformedActions] = useState<string[]>([])
  const [hasCrashedMsg, setHasCrashedMsg] = useState(false)
  const [activeOutcomeAction, setActiveOutcomeAction] = useState<string | null>(null)
  const [patientModalOpen, setPatientModalOpen] = useState(false)
  const [caseEndReason, setCaseEndReason] = useState<'handoff' | 'timeout' | null>(null)
  const [hintsUsed, setHintsUsed] = useState<string[]>([])
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

  useEffect(() => {
    if (monitorAttached) {
      triggerImageOverride('monitor-turningon.mp4')
    }
  }, [monitorAttached, triggerImageOverride])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages((prev) => [
      ...prev,
      { id: String(Date.now()), sender: 'doctor', text: message.trim() },
    ])
    setMessage('')
  }

  const handlePerformAction = useCallback((actionId: string, timePenalty: number) => {
    setPerformedActions((prev) => {
      if (prev.includes(actionId)) return prev
      return [...prev, actionId]
    })
    setSecondsLeft((prev) => Math.max(0, prev - timePenalty))

    const diagnosticActionIds = [
      'lung-ultrasound',
      'chest-xray',
      'ecg-troponin',
      'ctpa',
      'leg-ultrasound',
      'ddimer-bnp'
    ]
    const medIds = ['oxygen', 'nitroglycerin', 'heparin', 'thrombolysis', 'vasopressors']
    const procIds = ['needle-decomp', 'intubation-ppv']

    let hasOverride = false
    if (actionId === 'chest-xray') {
      triggerImageOverride('xrayroom-entry.mp4')
      hasOverride = true
    } else if (medIds.includes(actionId)) {
      triggerImageOverride('patient-taking-medicine.png')
      hasOverride = true
    } else if (procIds.includes(actionId)) {
      triggerImageOverride('patient-taking-procedure.png')
      hasOverride = true
    }

    const showOutcomeAndMsg = () => {
      if (diagnosticActionIds.includes(actionId)) {
        setActiveOutcomeAction(actionId)
      }

      const msg = ACTION_MESSAGES[actionId]
      if (msg) {
        setMessages((prev) => {
          const next = [...prev]
          next.push({
            id: `sys-${actionId}-${Date.now()}`,
            sender: 'system',
            text: msg.system,
          })
          if (msg.patient) {
            next.push({
              id: `pat-${actionId}-${Date.now()}`,
              sender: 'patient',
              text: msg.patient,
            })
          }
          return next
        })
      }
    }

    if (hasOverride) {
      setTimeout(showOutcomeAndMsg, 3000)
    } else {
      showOutcomeAndMsg()
    }

  }, [triggerImageOverride])

  // Auto-crash effect
  const isNeedleDecomp = performedActions.includes('needle-decomp')
  const isTimeCrashed = secondsLeft <= 120 && !isNeedleDecomp
  
  // Auto-timeout effect
  useEffect(() => {
    if (secondsLeft <= 0 && !caseEndReason) {
      setCaseEndReason('timeout')
    }
  }, [secondsLeft, caseEndReason])

  const handleUseHint = useCallback(() => {
    if (hintsUsed.length < CLINICAL_HINTS.length) {
      const hintText = CLINICAL_HINTS[hintsUsed.length]
      setHintsUsed((prev) => [...prev, hintText])
      setMessages((prev) => [
        ...prev,
        {
          id: `hint-${Date.now()}`,
          sender: 'system',
          text: `CLINICAL HINT: ${hintText}`,
        },
      ])
    }
  }, [hintsUsed])

  if (isTimeCrashed && !hasCrashedMsg) {
    setHasCrashedMsg(true)
    setMessages((prev) => [
      ...prev,
      {
        id: `crash-${Date.now()}`,
        sender: 'system',
        text: 'CRITICAL ALERT: 10 minutes have elapsed without needle decompression! The patient has crashed to Tension Pneumothorax: HR 125, BP 92/58, RR 32, SpO₂ 86%.'
      }
    ])
  }

  const performedSet = new Set(performedActions)
  const isXrayBeforeDecomp = performedSet.has('chest-xray') &&
    (!isNeedleDecomp || performedActions.indexOf('chest-xray') < performedActions.indexOf('needle-decomp'))
  const isCtpaBeforeDecomp = performedSet.has('ctpa') &&
    (!isNeedleDecomp || performedActions.indexOf('ctpa') < performedActions.indexOf('needle-decomp'))
  const isIntubationBeforeDecomp = performedSet.has('intubation-ppv') &&
    (!isNeedleDecomp || performedActions.indexOf('intubation-ppv') < performedActions.indexOf('needle-decomp'))
  const isThrombolysisGiven = performedSet.has('thrombolysis')
  const isHeparinGiven = performedSet.has('heparin')

  const deductions: string[] = []
  let deductionPoints = 0

  if (!isNeedleDecomp) {
    deductions.push('Failed to perform emergency needle decompression (Tension Pneumothorax requires mechanical release, -50 pts)')
    deductionPoints += 50
  }
  if (isXrayBeforeDecomp) {
    deductions.push('Portable Chest X-Ray ordered before decompressing (Delayed lifesaving care, -15 pts)')
    deductionPoints += 15
  }
  if (isCtpaBeforeDecomp) {
    deductions.push('CT Pulmonary Angiography ordered before decompressing (Critical delay of emergency care, -20 pts)')
    deductionPoints += 20
  }
  if (isIntubationBeforeDecomp) {
    deductions.push('Positive pressure ventilation initiated on un-decompressed tension pneumothorax (Induced cardiovascular collapse, -30 pts)')
    deductionPoints += 30
  }
  if (isThrombolysisGiven) {
    deductions.push('Thrombolytic therapy administered inappropriately (Contraindicated, risk of major hemorrhage, -20 pts)')
    deductionPoints += 20
  }
  if (isHeparinGiven) {
    deductions.push('Heparin anticoagulation administered inappropriately (Mechanical collapse does not respond to blood thinners, -10 pts)')
    deductionPoints += 10
  }

  const hintDeductionPts = hintsUsed.length * 5
  const baseScore = caseEndReason === 'timeout' ? 10 : 100
  const finalScore = Math.max(0, baseScore - deductionPoints - hintDeductionPts)

  let penaltySeconds = 0
  if (isXrayBeforeDecomp) penaltySeconds += 480
  if (isCtpaBeforeDecomp) penaltySeconds += 600
  if (isThrombolysisGiven) penaltySeconds += 60
  if (performedSet.has('vasopressors')) penaltySeconds += 60
  if (isIntubationBeforeDecomp) penaltySeconds += 60

  const formatPenaltyTime = (totalSec: number) => {
    if (totalSec === 0) return '0:00'
    const min = Math.floor(totalSec / 60)
    const sec = totalSec % 60
    return `-${min}:${sec.toString().padStart(2, '0')}`
  }
  const wrongMovePenaltyStr = formatPenaltyTime(penaltySeconds)

  const formatClock = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }
  const timeRemainingStr = formatClock(secondsLeft)

  const decisionSpeedPct = caseEndReason === 'timeout'
    ? 10
    : Math.round(Math.max(15, Math.min(95, (secondsLeft / 720) * 100)))

  const guidelineAdherencePct = Math.max(10, Math.min(100, 100 - deductionPoints))

  let interventionTimePct = 0
  if (isNeedleDecomp) {
    interventionTimePct = 95
    if (isXrayBeforeDecomp) interventionTimePct -= 30
    if (isCtpaBeforeDecomp) interventionTimePct -= 30
    interventionTimePct = Math.max(15, interventionTimePct)
  }

  const vitals = getVitals(scenario, performedActions, secondsLeft)

  // Calculate patient image
  let baseImage = 'patient-without-monitor.png'
  const [sysStr] = vitals.bp.split('/')
  const sys = Number(sysStr) || 120
  
  const isBad = vitals.hr >= 120 || vitals.hr < 50 || vitals.spo2 < 90 || vitals.rr >= 30 || vitals.rr < 10 || sys < 90 || sys >= 180
  const isHappy = vitals.hr >= 60 && vitals.hr <= 100 && vitals.spo2 >= 95 && vitals.rr >= 12 && vitals.rr <= 20 && sys >= 90 && sys <= 130

  if (isBad) {
    baseImage = 'patient-bad.png'
  } else if (isHappy) {
    baseImage = 'patient-happy.png'
  } else if (monitorAttached) {
    baseImage = 'patient-with-monitor.png'
  }

  const patientImage = patientOverrideImage || baseImage

  try {
    return (
      <div className="h-screen w-screen overflow-hidden bg-surface p-5">
        <div className="grid h-full grid-cols-[300px_1fr_300px] gap-5">
          <LeftSidebar
            monitorAttached={monitorAttached}
            onMonitorChange={setMonitorAttached}
            activeTab={activeTab}
            performed={performedActions}
            onPerform={handlePerformAction}
            onViewOutcome={setActiveOutcomeAction}
            onViewPatientDetails={() => setPatientModalOpen(true)}
            patientImage={patientImage}
          />
          <CenterView
            chatExpanded={chatExpanded}
            onToggleChat={() => setChatExpanded((v) => !v)}
            message={message}
            onMessageChange={setMessage}
            messages={messages}
            onSend={handleSend}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            performedActions={performedActions}
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
            secondsLeft={secondsLeft}
            onTickDown={setSecondsLeft}
            vitals={vitals}
            onHandOff={() => setCaseEndReason('handoff')}
            caseEnded={caseEndReason !== null}
            scenario={scenario}
          />
        </div>
        <OutcomeModal
          open={activeOutcomeAction !== null}
          onClose={() => setActiveOutcomeAction(null)}
          actionId={activeOutcomeAction}
          scenario={scenario}
          onScenarioChange={setScenario}
        />
        <PatientDetailModal
          open={patientModalOpen}
          onClose={() => setPatientModalOpen(false)}
        />
        <CaseSummaryModal
          open={caseEndReason !== null}
          onClose={() => setCaseEndReason(null)}
          endReason={caseEndReason || 'handoff'}
          score={finalScore}
          timeRemainingStr={timeRemainingStr}
          wrongMovePenaltyStr={wrongMovePenaltyStr}
          hintDeductionPts={hintDeductionPts}
          decisionSpeedPct={decisionSpeedPct}
          guidelineAdherencePct={guidelineAdherencePct}
          interventionTimePct={interventionTimePct}
          deductions={deductions}
          hintsUsed={hintsUsed}
        />
      </div>
    )
  } catch (err) {
    console.error("App Render Error:", err)
    return (
      <div className="p-5 text-red-600 bg-red-50 border border-red-200 rounded-xl m-5 font-mono">
        <h3 className="font-extrabold text-[15px] mb-2">Runtime Rendering Error</h3>
        <p className="text-[12px]">{(err as Error).stack || (err as Error).message}</p>
      </div>
    )
  }
}
