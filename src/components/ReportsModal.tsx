import { useEffect, useState } from 'react'
import {
  X,
  ClipboardList,
  Radio,
  Pill,
  Scissors,
  Eye,
} from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
  performedActions: string[]
  onViewOutcome: (actionId: string) => void
}

const MEDICATIONS_IDS = new Set(['oxygen', 'nitroglycerin', 'heparin', 'thrombolysis', 'vasopressors'])
const PROCEDURES_IDS = new Set(['needle-decomp', 'intubation-ppv'])

export default function ReportsModal({ open, onClose, performedActions, onViewOutcome }: Props) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  const performedSet = new Set(performedActions)

  // Compute dynamic reports - Diagnostics tab actions
  const diagnosticsItems: { actionId: string; text: string; image?: string }[] = []
  if (performedSet.has('attach-monitor')) {
    diagnosticsItems.push({
      actionId: 'attach-monitor',
      text: 'Monitor: Attached. Live vital signs recording active.',
    })
  }
  if (performedSet.has('lung-ultrasound')) {
    diagnosticsItems.push({
      actionId: 'lung-ultrasound',
      text: 'Bedside Lung US: Absent pleural sliding & A-lines in the right chest (pneumothorax).',
      image: '/us-pneumothorax.png.png',
    })
  }
  if (performedSet.has('chest-xray')) {
    diagnosticsItems.push({
      actionId: 'chest-xray',
      text: 'Portable CXR: Large right-sided pneumothorax with mediastinal shift to the left.',
      image: '/xray-pneumothorax.png.png',
    })
  }
  if (performedSet.has('ecg-troponin')) {
    diagnosticsItems.push({
      actionId: 'ecg-troponin',
      text: '12-Lead ECG: Sinus Tachycardia (108 bpm). Troponin I: Normal (< 0.01 ng/mL).',
      image: '/ecg-sinus-tach.png.png',
    })
  }
  if (performedSet.has('ctpa')) {
    diagnosticsItems.push({
      actionId: 'ctpa',
      text: 'CTPA Scan: No PE. Confirms massive right-sided tension pneumothorax.',
      image: '/ctpa-normal.png.png',
    })
  }
  if (performedSet.has('ddimer-bnp')) {
    diagnosticsItems.push({
      actionId: 'ddimer-bnp',
      text: 'Labs: D-Dimer normal (230 ng/mL), BNP normal (35 pg/mL).',
    })
  }
  if (performedSet.has('leg-ultrasound')) {
    diagnosticsItems.push({
      actionId: 'leg-ultrasound',
      text: 'Leg US: Deep veins patent and compressible; negative for DVT.',
      image: '/dvt-negative.png.png',
    })
  }

  // Diagnostic Images list
  const diagnosticImages = diagnosticsItems.filter((item) => item.image)

  // Medications tab actions
  const medicationsItems: string[] = []
  if (performedSet.has('oxygen')) {
    medicationsItems.push('Supplemental O2: Administered via non-rebreather mask; SpO₂ increased to 96%.')
  }
  if (performedSet.has('nitroglycerin')) {
    medicationsItems.push('Nitroglycerin SL: Administered 0.4mg; BP dropped slightly. Hypoxia/tachypnea persists.')
  }
  if (performedSet.has('heparin')) {
    medicationsItems.push('Heparin IV: Anticoagulant bolus administered. Vitals unchanged.')
  }
  if (performedSet.has('thrombolysis')) {
    medicationsItems.push('Thrombolysis (Alteplase): Administered. WARNING: Major medical error. Thrombolytics contraindicated.')
  }
  if (performedSet.has('vasopressors')) {
    medicationsItems.push('Norepinephrine IV: Infusion started. BP transiently increased to 145/90.')
  }

  // Procedures tab actions
  const proceduresItems: string[] = []
  if (performedSet.has('needle-decomp')) {
    proceduresItems.push('Needle Decompression: 14g angiocath inserted in right 2nd ICS MCL. Air release. Vitals stabilized.')
  }
  if (performedSet.has('intubation-ppv')) {
    proceduresItems.push('Intubation & PPV: WARNING: Positive pressure ventilation initiated in un-decompressed tension pneumothorax. Immediate cardiovascular collapse!')
  }

  const reportCards = [
    {
      title: 'Diagnostics',
      description:
        'Summary of all diagnostic imaging scans, ECG rhythm strips, and lab panels ordered.',
      icon: Radio,
      color: '#0061ff',
      bgGradient: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)',
      items: diagnosticsItems,
      images: diagnosticImages,
    },
    {
      title: 'Medications',
      description:
        'Pharmacological treatments administered, including dosages and clinical vitals responses.',
      icon: Pill,
      color: '#10b981',
      bgGradient: 'linear-gradient(135deg, #eefdf5 0%, #d1fae5 100%)',
      items: medicationsItems,
    },
    {
      title: 'Procedures',
      description:
        'Physical airway interventions and emergency decompressive surgeries performed.',
      icon: Scissors,
      color: '#8b5cf6',
      bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)',
      items: proceduresItems,
    },
  ].filter((card) => card.items.length > 0)

  const firstDiagnosticWithOutcome = diagnosticsItems.find(
    (item) => item.actionId !== 'attach-monitor'
  )?.actionId

  return (
    <div
      className={`reports-modal-overlay ${isVisible ? 'reports-modal-visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`reports-modal-content ${isVisible ? 'reports-modal-content-visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge */}
        <div className="reports-badge">
          Total Categories · {reportCards.length} active
        </div>

        {/* Close button */}
        <button className="reports-close-btn" onClick={onClose} type="button">
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="reports-title">Reports Hub</h2>
        <p className="reports-description">
          Access all diagnostic reports and clinical documentation generated during the
          simulation. Review findings, track orders, and monitor results.
        </p>

        {/* Cards grid / Empty State */}
        {reportCards.length > 0 ? (
          <div className="reports-grid">
            {reportCards.map((card, i) => {
              const Icon = card.icon
              return (
                <div
                  key={card.title}
                  className="reports-card transition-all duration-300"
                  style={{
                    animationDelay: `${i * 0.08}s`,
                    background: card.bgGradient,
                    borderColor: `${card.color}25`,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${card.color}75`
                    e.currentTarget.style.transform = 'translateY(-3px)'
                    e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}15`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${card.color}25`
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Thumbnail / preview area */}
                  <div className="reports-card-preview !flex !flex-row !gap-1 !p-1 bg-gray-50/50">
                    {/* Diagnostics: show images collage */}
                    {card.title === 'Diagnostics' && card.images && card.images.length > 0 ? (
                      <div className="flex w-full h-full gap-1">
                        {card.images.slice(0, 3).map((imgObj, idx) => (
                          <div
                            key={idx}
                            onClick={() => onViewOutcome(imgObj.actionId)}
                            className="relative flex-1 h-full overflow-hidden rounded-lg bg-black flex items-center justify-center border border-gray-200 cursor-pointer transition-all hover:scale-[1.04] active:scale-[0.96] group/img"
                            title="Click to view detailed scan"
                          >
                            <img
                              src={imgObj.image}
                              alt="Diagnostic scan"
                              className="h-full w-full object-cover object-center group-hover/img:opacity-80 transition-opacity"
                            />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye size={16} className="text-white drop-shadow" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : card.title === 'Medications' && performedActions.some(id => MEDICATIONS_IDS.has(id)) ? (
                      /* Medications: show text badges */
                      <div className="flex flex-wrap gap-1 p-1.5 justify-center items-center w-full">
                        {performedActions.filter(id => MEDICATIONS_IDS.has(id)).map((id) => (
                          <span key={id} className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 border border-emerald-200 text-emerald-800 uppercase tracking-wider card-shadow">
                            {id.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : card.title === 'Procedures' && performedActions.some(id => PROCEDURES_IDS.has(id)) ? (
                      /* Procedures: show text badges */
                      <div className="flex flex-wrap gap-1 p-1.5 justify-center items-center w-full">
                        {performedActions.filter(id => PROCEDURES_IDS.has(id)).map((id) => (
                          <span key={id} className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 border uppercase tracking-wider card-shadow ${
                            id === 'needle-decomp' 
                              ? 'border-purple-200 text-purple-800' 
                              : 'border-red-200 text-red-800'
                          }`}>
                            {id.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      /* Fallback: show large centered icon with a soft glowing badge */
                      <div className="flex items-center justify-center w-full h-full opacity-30">
                        <Icon size={32} style={{ color: card.color }} strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Icon badge */}
                    <div
                      className="reports-card-icon"
                      style={{ background: card.color }}
                    >
                      <Icon size={18} color="#fff" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Header/Title block */}
                  <div className="flex items-baseline justify-between mt-3 mx-3.5">
                    <h3
                      className={`reports-card-title !m-0 transition-colors ${
                        card.title === 'Diagnostics' && firstDiagnosticWithOutcome
                          ? 'hover:underline cursor-pointer'
                          : ''
                      }`}
                      style={{ color: card.color }}
                      onClick={() => {
                        if (card.title === 'Diagnostics' && firstDiagnosticWithOutcome) {
                          onViewOutcome(firstDiagnosticWithOutcome)
                        }
                      }}
                      title={
                        card.title === 'Diagnostics' && firstDiagnosticWithOutcome
                          ? 'Click to view report'
                          : undefined
                      }
                    >
                      {card.title}
                    </h3>
                    {card.title === 'Diagnostics' && firstDiagnosticWithOutcome && (
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        Interactive
                      </span>
                    )}
                  </div>
                  <p className="reports-card-desc mt-1">{card.description}</p>

                  {/* Report details list */}
                  <ul className="mt-3 mx-3.5 space-y-1.5 border-t border-gray-200/50 pt-2.5 text-[10.5px] text-gray-600">
                    {card.items.map((item) => {
                      const isDiagnostics = card.title === 'Diagnostics'
                      const text = isDiagnostics ? (item as any).text : (item as string)
                      const actionId = isDiagnostics ? (item as any).actionId : null
                      const isClickable = isDiagnostics && actionId && actionId !== 'attach-monitor'

                      return (
                        <li
                          key={text}
                          onClick={() => {
                            if (isClickable) onViewOutcome(actionId)
                          }}
                          className={`flex items-start gap-1.5 ${
                            isClickable
                              ? 'cursor-pointer hover:text-[#0061ff] transition-colors group/item'
                              : ''
                          }`}
                        >
                          <span
                            className="mt-0.5 shrink-0 transition-transform group-hover/item:scale-125 font-bold"
                            style={{ color: card.color }}
                          >
                            •
                          </span>
                          <span className={`leading-relaxed ${isClickable ? 'group-hover/item:underline font-medium' : ''}`}>
                            {text}
                          </span>
                          {isClickable && (
                            <span className="text-[9px] font-bold text-[#0061ff] ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 uppercase tracking-wider bg-blue-50 border border-blue-200 px-1 rounded shadow-sm">
                              View
                            </span>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-14 px-6 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 my-4">
            <ClipboardList className="h-10 w-10 text-gray-300 mb-3" strokeWidth={1.5} />
            <p className="text-[13px] font-semibold text-gray-700">No clinical reports generated yet</p>
            <p className="text-[11px] text-gray-400 max-w-[280px] mt-1 leading-relaxed">
              Order diagnostic imaging, perform ECG scans, or run lab tests from the left panel to populate the Reports Hub.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
