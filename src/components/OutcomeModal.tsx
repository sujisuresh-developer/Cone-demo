import { useEffect, useState } from 'react'
import { Check, X } from 'lucide-react'
import { ACTIONS_BY_ID, PATIENT } from '../simulation/pneumothoraxCase'

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

  // Determine modal header details
  let title = 'Diagnostic Result'

  if (actionId === 'pocus') {
    title = 'POCUS (Lung Ultrasound)'
  } else if (actionId === 'chest-xray') {
    title = 'Chest X-Ray'
  } else if (actionId === 'blood-panel') {
    title = 'Basic Blood Panel'
  } else if (actionId === 'troponin') {
    title = 'Troponin Test'
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

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-1">
                <h4 className="text-[11.5px] font-bold text-gray-800">Professional Suggestion</h4>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  Recommend immediate clinical correlation and appropriate management.
                </p>
              </div>

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

          {/* Chest X-Ray */}
          {actionId === 'chest-xray' && (
            <div className="space-y-3">
              <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/xray-pneumothorax.png.png" alt="Right Pneumothorax Chest X-Ray" className="w-full h-auto" />
              </div>

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-1">
                <span className="text-[11.5px] font-bold text-gray-800 block">Professional Suggestion</span>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  Low-yield PE-differential test for this classic presentation.
                </p>
              </div>

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

          {/* Basic Blood Panel */}
          {actionId === 'blood-panel' && (
            <div className="space-y-3">
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-[340px] overflow-y-auto">
                <img src="/action-images/basic-blood-test-result.webp" alt="Basic Blood Panel Result" className="w-full h-auto block" />
              </div>

              <div className="border border-purple-100 rounded-xl p-2.5 bg-purple-50/40">
                <span className="text-purple-600 font-bold block mb-0.5 text-[11px]">Routine Bloods — Unremarkable</span>
                <span className="text-gray-600 leading-normal block text-[10.5px]">
                  Routine bloods unremarkable — not diagnostic for pneumothorax; this route delays diagnosis.
                </span>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-1">
                <span className="text-[11.5px] font-bold text-gray-800 block">Professional Suggestion</span>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  A normal blood count and chemistry panel neither confirms nor excludes a pneumothorax — imaging or bedside ultrasound is required to make the diagnosis.
                </p>
              </div>

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

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-1">
                <span className="text-[11.5px] font-bold text-gray-800 block">Professional Suggestion</span>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  A normal troponin helps exclude an acute cardiac event but says nothing about the chest — it isn't diagnostic for pneumothorax and shouldn't delay confirmatory imaging.
                </p>
              </div>

              <ObservationQuestion actionId={actionId} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
