import { useEffect, useState } from 'react'
import {
  X,
  Heart,
  AlertTriangle,
  ClipboardList,
  FileText,
  Calendar,
  ShieldAlert,
  Activity,
  Users,
} from 'lucide-react'
import { PATIENT } from '../simulation/pneumothoraxCase'

type Props = {
  open: boolean
  onClose: () => void
}

export default function PatientDetailModal({ open, onClose }: Props) {
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

  return (
    <div
      className={`reports-modal-overlay ${isVisible ? 'reports-modal-visible' : ''}`}
      style={{ zIndex: 9999 }}
      onClick={onClose}
    >
      <div
        className={`reports-modal-content ${
          isVisible ? 'reports-modal-content-visible' : ''
        } !w-[680px] !max-w-[95vw] !max-h-[85vh] !p-0 flex flex-col md:flex-row overflow-hidden patient-modal-outline-effect`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Panel: Profile summary */}
        <div className="w-full md:w-[240px] shrink-0 bg-gray-950 flex flex-col relative text-white border-r border-gray-800">
          <div className="h-[200px] md:h-[260px] relative overflow-hidden">
            <img
              src="/p.png"
              alt={PATIENT.name}
              className="w-full h-full object-cover object-top opacity-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/20 to-transparent" />
          </div>

          <div className="p-5 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-blue-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                <Heart size={10} className="fill-current animate-pulse" />
                <span>Active Patient</span>
              </div>
              <h2 className="text-[19px] font-extrabold tracking-tight">{PATIENT.name}</h2>
              <span className="text-[11px] text-gray-400 font-mono block mt-0.5">MRN: #302-884-A</span>

              <div className="mt-4 space-y-2 text-[12px] text-gray-300 border-t border-gray-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Age / Sex</span>
                  <span className="font-semibold text-gray-200">{PATIENT.age} Yr / {PATIENT.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Weight</span>
                  <span className="font-semibold text-gray-200">{PATIENT.weight} Kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Height</span>
                  <span className="font-semibold text-gray-200">{PATIENT.height} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 font-medium">Blood Type</span>
                  <span className="font-semibold text-gray-200">O Positive</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-gray-800/50">
                  <span className="text-gray-500 font-medium">Code Status</span>
                  <span className="font-extrabold text-[10px] text-emerald-400 bg-emerald-950/90 px-2 py-0.5 rounded border border-emerald-800/80 tracking-wide uppercase">
                    Full Code
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-0 text-[10px] text-gray-500 flex items-center gap-1 bg-gray-900/50 p-2 rounded-lg border border-gray-800/50">
              <Calendar size={12} className="text-gray-400" />
              <span>Admitted: Jun 20, 2026</span>
            </div>
          </div>
        </div>

        {/* Right Panel: Clinical Details */}
        <div className="flex-1 flex flex-col min-h-0 bg-white relative">
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-primary">
                <ClipboardList size={18} />
              </div>
              <div>
                <h3 className="text-[14px] font-extrabold text-gray-800 tracking-tight">Clinical Case File</h3>
                <p className="text-[10px] text-gray-400">Emergency Department Presentation Details</p>
              </div>
            </div>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all shrink-0"
              type="button"
            >
              <X size={16} />
            </button>
          </div>

          {/* Details Scroll Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* 0. Case Status */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <ShieldAlert size={14} className="text-emerald-600" />
                <span>Medical Case & Code Status</span>
              </div>
              <div className="bg-emerald-50/40 border border-emerald-100/80 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11.5px] font-bold text-gray-800 block">Case Resuscitation Status</span>
                  <span className="text-[10.5px] text-gray-500 block">Full Code — All resuscitation, diagnostic & intervention protocols active.</span>
                </div>
                <span className="px-2.5 py-1 text-[10.5px] font-extrabold text-emerald-700 bg-emerald-100 rounded-full border border-emerald-300 shrink-0 uppercase tracking-wider">
                  Full Code
                </span>
              </div>
            </div>

            {/* 1. Chief Complaint & HPI */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <FileText size={14} className="text-blue-500" />
                <span>Chief Complaint & History of Present Illness (HPI)</span>
              </div>
              <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl p-3.5 space-y-2">
                <p className="text-[11.5px] leading-relaxed text-gray-700">
                  <strong className="text-blue-700 font-bold">Chief Complaint:</strong> Sudden onset left-sided chest pain and shortness of breath
                </p>
                <p className="text-[11.5px] leading-relaxed text-gray-600">
                  <strong className="text-blue-700 font-bold">History of Present Illness:</strong> 34M with sudden onset left-sided pleuritic chest pain and dyspnea while at rest, started about an hour ago, no preceding trauma. Denies fever, cough, or leg swelling.
                </p>
              </div>
            </div>

            {/* 2. Physical Examination */}
            {/* <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <User size={14} className="text-purple-500" />
                <span>Physical Examination (At Admission)</span>
              </div>
              <div className="bg-purple-50/30 border border-purple-100/50 rounded-xl p-3.5 space-y-2 text-[11.5px] text-gray-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <strong className="text-gray-700 block font-semibold">General Status:</strong>
                    Distressed, tachypneic, diaphoretic, using accessory muscles to breathe. Tall, thin build.
                  </div>
                  <div>
                    <strong className="text-gray-700 block font-semibold">Respiratory System:</strong>
                    Severely diminished breath sounds on the left lung fields. Hyperresonance to percussion on the left side.
                  </div>
                  <div>
                    <strong className="text-gray-700 block font-semibold">Cardiovascular:</strong>
                    Tachycardic, heart sounds slightly distant but regular. Mild jugular venous distension (JVD) present.
                  </div>
                  <div>
                    <strong className="text-gray-700 block font-semibold">Extremities:</strong>
                    Cool, pale peripheries. No lower extremity swelling or calf tenderness.
                  </div>
                </div>
              </div>
            </div> */}

            {/* 3. Past Medical & Surgical History */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <FileText size={14} className="text-amber-600" />
                <span>Medical & Surgical History</span>
              </div>
              <div className="bg-amber-50/30 border border-amber-100/50 rounded-xl p-3.5 space-y-2 text-[11.5px]">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong className="text-gray-800">Past Medical History:</strong> No significant past medical history</span>
                </div>
                <div className="flex items-start gap-2 pt-1.5 border-t border-amber-100/60">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong className="text-gray-800">Past Surgical History:</strong> No prior surgeries (nill)</span>
                </div>
              </div>
            </div>

            {/* 4. Family History */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <Users size={14} className="text-indigo-500" />
                <span>Family History</span>
              </div>
              <div className="bg-indigo-50/30 border border-indigo-100/50 rounded-xl p-3.5 text-[11.5px] text-gray-700 flex items-start gap-2">
                <span className="text-indigo-500 font-bold">•</span>
                <span>No family history of lung or cardiac disease</span>
              </div>
            </div>

            {/* 5. Drug Allergies */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <AlertTriangle size={14} className="text-emerald-600" />
                <span>Drug Allergies</span>
              </div>
              <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-3.5 text-[11.5px] flex items-center gap-2">
                <span className="font-bold text-emerald-800">NKDA</span>
                <span className="text-emerald-700">(no known drug allergies)</span>
              </div>
            </div>

            {/* 6. Lifestyle & Social History */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <Activity size={14} className="text-rose-500" />
                <span>Lifestyle & Social History</span>
              </div>
              <div className="bg-rose-50/30 border border-rose-100/50 rounded-xl p-3.5 space-y-1.5 text-[11.5px] text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>Smokes half a pack per day</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>Tall, thin build</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                  <span>Works as a delivery driver</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
