import { useEffect, useState } from 'react'
import { Check, X, NotebookPen } from 'lucide-react'
import { ACTIONS_BY_ID, PATIENT } from '../simulation/pneumothoraxCase'
import { appendImpressionToNotepad, isImpressionInNotepad, getActionImpression } from '../utils/impressionNotes'

type Props = {
  open: boolean
  onClose: () => void
  actionId: string | null
}

function ObservationQuestion({ actionId }: { actionId: string }) {
  const [selected, setSelected] = useState<number[]>([])
  const action = ACTIONS_BY_ID[actionId]

  useEffect(() => {
    setSelected([])
  }, [actionId])

  if (!action?.observationQuestion || !action.observationChoices?.length) return null

  const toggleChoice = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index))
    } else {
      setSelected([...selected, index])
    }
  }

  const selectedCorrectCount = selected.filter((i) => action.observationChoices?.[i]?.isCorrect).length
  const hasWrongSelected = selected.some((i) => !action.observationChoices?.[i]?.isCorrect)
  const totalCorrectChoices = (action.observationChoices ?? []).filter((c) => c.isCorrect).length
  const isFullyCorrect = selectedCorrectCount === totalCorrectChoices && !hasWrongSelected

  return (
    <div className="border border-blue-100 rounded-xl p-3.5 bg-blue-50/40 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <h4 className="text-[11.5px] font-bold text-gray-800">{action.observationQuestion}</h4>
        <span className="text-[9.5px] font-semibold text-blue-600 bg-blue-100/70 px-1.5 py-0.5 rounded shrink-0">
          Select options
        </span>
      </div>
      <div className="space-y-1.5">
        {action.observationChoices.map((choice, i) => {
          const isSelected = selected.includes(i)
          const showCorrect = isSelected && choice.isCorrect
          const showWrong = isSelected && !choice.isCorrect

          return (
            <button
              key={choice.text}
              type="button"
              onClick={() => toggleChoice(i)}
              className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[11.5px] font-medium transition-colors cursor-pointer ${
                showCorrect
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                  : showWrong
                    ? 'border-red-300 bg-red-50 text-red-800'
                    : isSelected
                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5'
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-0 pointer-events-none"
                />
                <span>{choice.text}</span>
              </div>
              {showCorrect && <Check size={14} className="shrink-0 text-emerald-600" />}
              {showWrong && <X size={14} className="shrink-0 text-red-600" />}
            </button>
          )
        })}
      </div>
      {selected.length > 0 && (
        <p className={`text-[10.5px] font-semibold ${isFullyCorrect ? 'text-emerald-600' : hasWrongSelected ? 'text-red-600' : 'text-blue-600'}`}>
          {isFullyCorrect
            ? 'Correct! All valid findings selected.'
            : hasWrongSelected
              ? 'Includes an incorrect finding. Review the choices above.'
              : `Selected ${selectedCorrectCount} of ${totalCorrectChoices} correct findings.`}
        </p>
      )}
    </div>
  )
}

type BloodPanelRow = { item: string; result: number; low: number; high: number }

const BLOOD_PANEL_ROWS: BloodPanelRow[] = [
  { item: 'White blood count (K/UL)', result: 12.2, low: 4, high: 11 },
  { item: 'Red blood count (M/UL)', result: 3.76, low: 4.2, high: 6.0 },
  { item: 'Hemoglobin (g/dL)', result: 11.9, low: 12.0, high: 16.0 },
  { item: 'Hematocrit (%)', result: 35.7, low: 40, high: 52 },
  { item: 'Platelets (K/UL)', result: 257, low: 150, high: 400 },
  { item: 'Sodium (mmol/L)', result: 134.0, low: 135, high: 145 },
  { item: 'Potassium (mmol/L)', result: 3.8, low: 3.5, high: 5.5 },
  { item: 'Chloride (mmol/L)', result: 107.0, low: 98, high: 107 },
  { item: 'Bicarbonate (mmol/L)', result: 22.0, low: 22, high: 28 },
  { item: 'Blood urea nitrogen (mg/dL)', result: 6.0, low: 7, high: 17 },
  { item: 'Creatinine (mg/dL)', result: 0.71, low: 0.52, high: 1.04 },
  { item: 'Glucose (mg/dL)', result: 122.0, low: 60, high: 110 },
  { item: 'Calcium (mg/dL)', result: 8.9, low: 8.4, high: 10.6 },
  { item: 'Alkaline phosphatase (U/L)', result: 137.0, low: 38, high: 126 },
  { item: 'Alanine transaminase (U/L)', result: 14.0, low: 9, high: 52 },
  { item: 'Aspartate transaminase (U/L)', result: 30.0, low: 15, high: 46 },
  { item: 'Total protein (g/dL)', result: 7.1, low: 6.3, high: 8.2 },
  { item: 'Albumin (g/dL)', result: 3.4, low: 3.5, high: 5.0 },
  { item: 'Total bilirubin (mg/dL)', result: 0.5, low: 0.2, high: 1.3 },
]

function BloodPanelTable() {
  return (
    <table className="w-full text-[11px]">
      <thead>
        <tr className="border-b border-gray-200">
          <th className="text-left font-bold text-gray-700 py-1.5 px-2">Item</th>
          <th className="text-center font-bold text-gray-700 py-1.5 px-2">Result</th>
          <th className="text-center font-bold text-gray-700 py-1.5 px-2">Normal range</th>
        </tr>
      </thead>
      <tbody>
        {BLOOD_PANEL_ROWS.map((row) => {
          const isHigh = row.result > row.high
          const isLow = row.result < row.low
          const isAbnormal = isHigh || isLow
          return (
            <tr key={row.item} className={`border-b border-gray-100 last:border-0 ${isAbnormal ? 'bg-red-50' : ''}`}>
              <td className="py-1.5 px-2 text-gray-700">{row.item}</td>
              <td
                className={`py-1.5 px-2 text-center font-bold ${
                  isAbnormal ? 'text-red-600' : 'text-gray-800'
                }`}
              >
                {row.result}
                {isHigh && <span className="ml-1">&uarr;</span>}
                {isLow && <span className="ml-1">&darr;</span>}
              </td>
              <td className="py-1.5 px-2 text-center text-gray-500">
                {row.low}&ndash;{row.high}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

type ExamFinding = { system: string; finding: string }

const PHYSICAL_EXAM_FINDINGS: ExamFinding[] = [
  { system: 'Gen', finding: 'NAD, well-appearing, alert and oriented ×3' },
  { system: 'HEENT', finding: 'NCAT, PERRL, EOMI, sclerae anicteric, oropharynx clear, MMM' },
  { system: 'Neck', finding: 'Supple, no LAD, no thyromegaly, no JVD' },
  { system: 'CV', finding: 'RRR, normal S1/S2, no murmurs/rubs/gallops, no edema, 2+ distal pulses' },
  { system: 'Pulm', finding: 'CTAB, no wheezes/rales/rhonchi, unlabored respirations' },
  { system: 'Abd', finding: 'Soft, non-tender, non-distended, +BS, no HSM, no rebound or guarding' },
  { system: 'Ext', finding: 'No edema, cyanosis, or clubbing; warm and well-perfused' },
  { system: 'Skin', finding: 'Warm, dry, no rashes or lesions' },
  { system: 'Neuro', finding: 'CN II–XII grossly intact, strength 5/5 throughout, sensation intact, gait normal' },
  { system: 'Psych', finding: 'Normal mood and affect, appropriate behavior' },
]

/**
 * Shows the active finding as an in-flow panel below the chip grid instead of a floating
 * tooltip anchored to each chip — a tooltip positioned off an individual chip gets clipped by
 * the modal's scrollable container (overflow-y: auto forces overflow-x: auto too) whenever the
 * chip sits near an edge, which is exactly what made some hints unreadable. This also makes
 * touch/tap work the same as hover, so it degrades gracefully on narrow/mobile viewports.
 */
function PhysicalExamFindings() {
  const [active, setActive] = useState<ExamFinding>(PHYSICAL_EXAM_FINDINGS[0])

  return (
    <div className="border border-gray-200 rounded-xl p-3 sm:p-3.5 bg-gray-50/60 space-y-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">
        Tap or hover a system for the full finding
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
        {PHYSICAL_EXAM_FINDINGS.map((f) => (
          <button
            key={f.system}
            type="button"
            onMouseEnter={() => setActive(f)}
            onFocus={() => setActive(f)}
            onClick={() => setActive(f)}
            className={`rounded-lg border px-1.5 py-1.5 text-[10.5px] sm:text-[11px] font-bold transition-colors cursor-pointer ${
              active.system === f.system
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-gray-200 bg-white text-gray-700 hover:border-primary/40 hover:bg-primary/5'
            }`}
          >
            {f.system}
          </button>
        ))}
      </div>
      <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
        <span className="block text-[10px] font-bold text-primary mb-0.5">{active.system}</span>
        <span className="block text-[11px] leading-relaxed text-gray-700 break-words">{active.finding}</span>
      </div>
    </div>
  )
}

function ImpressionCard({ actionId }: { actionId: string }) {
  const [saved, setSaved] = useState(false)
  const isSavedAlready = isImpressionInNotepad(actionId)
  const impressionText = getActionImpression(actionId)

  const handleSave = () => {
    appendImpressionToNotepad(actionId)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="border border-blue-100 rounded-xl p-3.5 bg-blue-50/40 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-[12px] font-bold text-gray-800 flex items-center gap-1.5">
          <NotebookPen size={14} className="text-blue-600" />
          <span>Professional Impression</span>
        </h4>
        <button
          type="button"
          onClick={handleSave}
          className={`px-3 py-1 rounded-lg text-[10.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
            saved || isSavedAlready
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-primary hover:bg-primary-hover text-white shadow-xs'
          }`}
        >
          {saved || isSavedAlready ? (
            <>
              <Check size={12} />
              <span>In Notepad</span>
            </>
          ) : (
            <>
              <NotebookPen size={12} />
              <span>Save to Notepad</span>
            </>
          )}
        </button>
      </div>
      <p className="text-[11px] leading-relaxed text-gray-700 font-medium">
        {impressionText}
      </p>
    </div>
  )
}

export default function OutcomeModal({ open, onClose, actionId }: Props) {
  const [isVisible, setIsVisible] = useState(false)

  // Interactive views for the POCUS scan
  const [usView, setUsView] = useState<'right' | 'left_anterior' | 'left_lateral'>('left_anterior')

  // Animate modal entry
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true))
      setUsView('left_anterior')
    } else {
      setIsVisible(false)
    }
  }, [open])

  // Escape key close listener
  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open || !actionId) return null

  const currentAction = ACTIONS_BY_ID[actionId]
  // Determine modal header details
  let title = currentAction ? currentAction.name : 'Diagnostic Result'

  if (actionId === 'pocus') {
    title = 'POCUS (Lung Ultrasound)'
  } else if (actionId === 'chest-xray') {
    title = 'Chest X-Ray'
  } else if (actionId === 'blood-panel') {
    title = 'Basic Blood Panel'
  } else if (actionId === 'troponin') {
    title = 'Troponin Test'
  } else if (actionId === 'physical-exam') {
    title = 'Physical Examination'
  }

  return (
    <div
      className={`reports-modal-overlay ${isVisible ? 'reports-modal-visible' : ''}`}
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className={`reports-modal-content ${
          isVisible ? 'reports-modal-content-visible' : ''
        } !w-[520px] !max-w-[95vw] !max-h-[85vh] !p-6 flex flex-col overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Badge */}
        <div>
          <div className="reports-badge !mb-3">
            Diagnostic Result
          </div>
        </div>

        {/* Close button */}
        <button className="reports-close-btn" onClick={onClose} type="button">
          <X size={16} />
        </button>

        {/* Title */}
        <h2 className="reports-title !text-[20px] !mb-1">{title}</h2>

        {/* Subtitle */}
        <p className="text-[12px] text-gray-500 mb-4 font-medium">
          Patient: {PATIENT.name} &nbsp;·&nbsp; {PATIENT.age} Yr &nbsp;·&nbsp; {PATIENT.gender}
        </p>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">

          {/* POCUS (Lung Ultrasound) */}
          {actionId === 'pocus' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-1.5 bg-gray-50 p-1.5 rounded-xl border border-gray-100">
                <button
                  onClick={() => setUsView('right')}
                  className={`py-1.5 px-2 text-[9px] font-bold rounded-lg border text-center transition-all ${
                    usView === 'right'
                      ? 'bg-white border-gray-200 text-primary shadow-sm'
                      : 'border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Left Chest
                </button>
                <button
                  onClick={() => setUsView('left_anterior')}
                  className={`py-1.5 px-2 text-[9px] font-bold rounded-lg border text-center transition-all ${
                    usView === 'left_anterior'
                      ? 'bg-white border-gray-200 text-primary shadow-sm'
                      : 'border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Right Ant.
                </button>
                <button
                  onClick={() => setUsView('left_lateral')}
                  className={`py-1.5 px-2 text-[9px] font-bold rounded-lg border text-center transition-all ${
                    usView === 'left_lateral'
                      ? 'bg-white border-gray-200 text-primary shadow-sm'
                      : 'border-transparent text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Right Lat. (Scan)
                </button>
              </div>

              <div className="relative border border-gray-900 bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center">
                {usView === 'right' && (
                  <img src="/us-normal.png.png" alt="Normal Lung Ultrasound" className="w-full h-auto" />
                )}
                {usView === 'left_anterior' && (
                  <img src="/us-pneumothorax.png.png" alt="Pneumothorax Lung Ultrasound" className="w-full h-auto" />
                )}
                {usView === 'left_lateral' && (
                  <img src="/us-lungpoint.png.png" alt="Lung Point Ultrasound" className="w-full h-auto" />
                )}
              </div>

              <ImpressionCard actionId={actionId} />

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

          {/* Chest X-Ray */}
          {actionId === 'chest-xray' && (
            <div className="space-y-3">
              <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/xray-pneumothorax.png.png" alt="Right Pneumothorax Chest X-Ray" className="w-full h-auto" />
              </div>

              <ImpressionCard actionId={actionId} />

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

          {/* 12-Lead ECG */}
          {actionId === 'ecg' && (
            <div className="space-y-3">
              <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/ecg-sinus-tach.png.png" alt="Sinus Tachycardia ECG" className="w-full h-auto" />
              </div>

              <ImpressionCard actionId={actionId} />

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

          {/* D-Dimer Test */}
          {actionId === 'd-dimer' && (
            <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/action-images/D_timer_image.jpeg" alt="D-Dimer Test Result" className="w-full h-auto" />
            </div>
          )}

          {/* Chest Tube */}
          {actionId === 'chest-tube' && (
            <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/action-images/chest_tube_image.jpeg" alt="Chest Tube Result" className="w-full h-auto" />
            </div>
          )}

          {/* CT Chest */}
          {actionId === 'ct-chest' && (
            <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
              <img src="/action-images/CT-Scan Report.jpeg" alt="CT Chest Report" className="w-full h-auto" />
            </div>
          )}

          {/* Basic Blood Panel */}
          {actionId === 'blood-panel' && (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[340px] overflow-y-auto action-scroll">
                <BloodPanelTable />
              </div>

              <div className="border border-purple-100 rounded-xl p-2.5 bg-purple-50/40">
                <span className="text-purple-600 font-bold block mb-0.5 text-[11px]">Routine Bloods — Unremarkable</span>
                <span className="text-gray-600 leading-normal block text-[10.5px]">
                  Routine bloods unremarkable — not diagnostic for pneumothorax; this route delays diagnosis.
                </span>
              </div>

              <ImpressionCard actionId={actionId} />

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

          {/* Troponin Test */}
          {actionId === 'troponin' && (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <img src="/action-images/troponin_result.png" alt="Troponin Test Result" className="w-full h-auto block" />
              </div>

              <div className="border border-purple-100 rounded-xl p-2.5 bg-purple-50/40">
                <span className="text-purple-600 font-bold block mb-0.5 text-[11px]">Troponin — Normal</span>
                <span className="text-gray-600 leading-normal block text-[10.5px]">
                  Troponin negative — argues against acute coronary syndrome.
                </span>
              </div>

              <ImpressionCard actionId={actionId} />

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

          {/* Physical Examination */}
          {actionId === 'physical-exam' && (
            <div className="space-y-3">
              <PhysicalExamFindings />
            </div>
          )}

          {/* Fallback for any other action */}
          {actionId !== 'pocus' &&
            actionId !== 'chest-xray' &&
            actionId !== 'blood-panel' &&
            actionId !== 'troponin' &&
            actionId !== 'physical-exam' &&
            actionId !== 'ecg' && (
            <div className="space-y-3">
              <ImpressionCard actionId={actionId} />
              <ObservationQuestion actionId={actionId} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
