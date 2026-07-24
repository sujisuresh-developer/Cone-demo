import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import {
  X,
  ClipboardList,
  Radio,
  Pill,
  Scissors,
  FlaskConical,
  FileScan,
  Eye,
} from 'lucide-react'
import { OUTCOME_ACTION_IDS } from './LeftSidebar'
import { ACTIONS, ACTIONS_BY_ID, type ActionTab } from '../simulation/pneumothoraxCase'

type Props = {
  open: boolean
  onClose: () => void
  performedActions: string[]
  onViewOutcome: (actionId: string) => void
}

/** Curated, report-style phrasing for actions where the raw in-chat resultText reads too
 * clinically terse for a standalone report card. Anything not listed here just falls back to
 * the action's own resultText, so every performed action still gets its own card. */
const REPORT_TEXT_OVERRIDES: Record<string, string> = {
  'history-taking': 'Sudden-onset right-sided chest pain and dyspnea ~20 min ago. No trauma. Mild asthma.',
  'physical-exam': 'Diminished breath sounds on the right, hyperresonant to percussion, tachypneic and diaphoretic.',
  'attach-monitor': 'Continuous monitor attached. Live vital signs recording active.',
  pocus: 'Absent lung sliding & barcode sign on M-mode in the right chest (pneumothorax).',
  'chest-xray': 'Visceral pleural line with absent lung markings peripherally — right-sided pneumothorax.',
  'blood-panel': 'Routine bloods unremarkable — not diagnostic for pneumothorax.',
  ecg: 'Sinus tachycardia, no ST changes — helps exclude an acute cardiac event.',
  oxygen: 'Supplemental oxygen administered — buys time, not definitive.',
  'needle-decompression': '2nd intercostal space, midclavicular line. Rush of air — immediate improvement in vitals.',
  'chest-tube': 'Placed. Re-expansion of the lung confirmed on repeat imaging, appropriate drainage.',
}

/** Reference scan/result image for actions that have one — shown as the card's thumbnail
 * instead of a plain icon, and click-through to the full OutcomeModal report. */
const REPORT_IMAGE_BY_ACTION: Record<string, string> = {
  pocus: '/us-pneumothorax.png.png',
  'chest-xray': '/xray-pneumothorax.png.png',
  ecg: '/ecg-sinus-tach.png.png',
  'd-dimer': '/action-images/D_timer_image.jpeg',
  'chest-tube': '/action-images/chest_tube_image.jpeg',
  'ct-chest': '/action-images/CT-Scan Report.jpeg',
  troponin: '/action-images/troponin_result.png',
}

type TabStyle = { label: string; icon: ComponentType<{ size?: number; color?: string; strokeWidth?: number; style?: object }>; color: string; bgGradient: string }

const TAB_STYLE: Record<ActionTab, TabStyle> = {
  diagnostics: {
    label: 'Diagnostics',
    icon: Radio,
    color: '#0061ff',
    bgGradient: 'linear-gradient(135deg, #eef4ff 0%, #dbeafe 100%)',
  },
  laboratory: {
    label: 'Laboratory',
    icon: FlaskConical,
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
  },
  imaging: {
    label: 'Imaging',
    icon: FileScan,
    color: '#6366f1',
    bgGradient: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
  },
  medications: {
    label: 'Medications',
    icon: Pill,
    color: '#10b981',
    bgGradient: 'linear-gradient(135deg, #eefdf5 0%, #d1fae5 100%)',
  },
  procedures: {
    label: 'Procedures',
    icon: Scissors,
    color: '#8b5cf6',
    bgGradient: 'linear-gradient(135deg, #f5f3ff 0%, #e0e7ff 100%)',
  },
}

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

  // One card per performed action, in the order the case defines them, each carrying its own
  // category styling (icon/color) and — where available — a scan/result thumbnail.
  const reportEntries = ACTIONS.filter((a) => performedSet.has(a.id)).map((a) => ({
    actionId: a.id,
    title: a.name,
    text: REPORT_TEXT_OVERRIDES[a.id] ?? ACTIONS_BY_ID[a.id]?.resultText ?? '',
    image: REPORT_IMAGE_BY_ACTION[a.id],
    tab: a.tab,
    isClickable: OUTCOME_ACTION_IDS.has(a.id),
  }))

  return (
    <div
      className={`reports-modal-overlay ${isVisible ? 'reports-modal-visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`reports-modal-content reports-modal-glass ${
          isVisible ? 'reports-modal-content-visible reports-modal-outline-effect' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Badge */}
        <div className="reports-badge">
          Total Reports · {reportEntries.length} generated
        </div>

        {/* Close button */}
        <button className="reports-close-btn" onClick={onClose} type="button">
          <X size={18} />
        </button>

        {/* Title */}
        <h2 className="reports-title">Reports Hub</h2>
        <p className="reports-description">
          Every diagnostic, lab, imaging, medication, and procedure report generated during the
          simulation — each shown separately as its own card. Click an interactive card to open
          the full report.
        </p>

        {/* Cards grid / Empty State */}
        {reportEntries.length > 0 ? (
          <div className="reports-grid">
            {reportEntries.map((entry, i) => {
              const style = TAB_STYLE[entry.tab]
              const Icon = style.icon

              return (
                <div
                  key={entry.actionId}
                  className={`reports-card transition-all duration-300 ${entry.isClickable ? 'cursor-pointer' : ''}`}
                  style={{
                    animationDelay: `${i * 0.06}s`,
                    background: style.bgGradient,
                    borderColor: `${style.color}25`,
                    borderWidth: '2px',
                    borderStyle: 'solid',
                  }}
                  onClick={() => {
                    if (entry.isClickable) onViewOutcome(entry.actionId)
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = `${style.color}75`
                    e.currentTarget.style.transform = 'translateY(-3px) scale(1.008)'
                    e.currentTarget.style.boxShadow = `0 10px 26px ${style.color}20`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${style.color}25`
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Thumbnail / preview area */}
                  <div className="reports-card-preview">
                    {entry.image ? (
                      <div className="group/img relative h-full w-full overflow-hidden rounded-lg bg-black">
                        <img
                          src={entry.image}
                          alt={entry.title}
                          className="h-full w-full object-cover object-center transition-opacity group-hover/img:opacity-80"
                        />
                        {entry.isClickable && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover/img:opacity-100">
                            <Eye size={16} className="text-white drop-shadow" />
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Fallback: large centered icon */
                      <div className="flex h-full w-full items-center justify-center opacity-30">
                        <Icon size={32} style={{ color: style.color }} strokeWidth={1.5} />
                      </div>
                    )}

                    {/* Icon badge */}
                    <div className="reports-card-icon" style={{ background: style.color }}>
                      <Icon size={18} color="#fff" strokeWidth={2} />
                    </div>
                  </div>

                  {/* Header/Title block */}
                  <div className="flex items-baseline justify-between mt-3 mx-3.5 gap-2">
                    <h3
                      className={`reports-card-title !m-0 transition-colors ${entry.isClickable ? 'hover:underline' : ''}`}
                      style={{ color: style.color }}
                      title={entry.isClickable ? 'Click to view report' : undefined}
                    >
                      {entry.title}
                    </h3>
                    <span
                      className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ color: style.color, background: `${style.color}15` }}
                    >
                      {style.label}
                    </span>
                  </div>

                  {/* Result text */}
                  <p className="reports-card-desc mt-1.5 leading-relaxed">{entry.text}</p>

                  {entry.isClickable && (
                    <span className="mt-2.5 mx-3.5 inline-block text-[9px] font-bold uppercase tracking-wider bg-white/80 border px-1.5 py-0.5 rounded shadow-sm" style={{ color: style.color, borderColor: `${style.color}40` }}>
                      View full report
                    </span>
                  )}
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
