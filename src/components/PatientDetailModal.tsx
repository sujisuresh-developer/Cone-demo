import { useEffect, useState } from 'react'
import {
  X,
  User,
  Heart,
  AlertTriangle,
  ClipboardList,
  Pill,
  FileText,
  Calendar,
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
        } !w-[680px] !max-w-[95vw] !max-h-[85vh] !p-0 flex flex-col md:flex-row overflow-hidden`}
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
            {/* 1. Chief Complaint & HPI */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <FileText size={14} className="text-blue-500" />
                <span>Chief Complaint & History (HPI)</span>
              </div>
              <div className="bg-blue-50/30 border border-blue-100/50 rounded-xl p-3.5 space-y-2">
                <p className="text-[11.5px] leading-relaxed text-gray-700">
                  <strong className="text-blue-700 font-bold">Chief Complaint:</strong> Acute, sudden onset of progressive breathing difficulty and sharp right-sided chest pain starting approximately 1 hour ago.
                </p>
                <p className="text-[11.5px] leading-relaxed text-gray-500">
                  The patient was at home when he experienced a sudden, sharp, stabbing pain in his right chest, followed immediately by severe shortness of breath. He reports feeling increasingly dizzy, sweaty, and anxious. He denies any recent trauma or fall.
                </p>
              </div>
            </div>

            {/* 2. Physical Examination */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <User size={14} className="text-purple-500" />
                <span>Physical Examination (At Admission)</span>
              </div>
              <div className="bg-purple-50/30 border border-purple-100/50 rounded-xl p-3.5 space-y-2 text-[11.5px] text-gray-600">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <strong className="text-gray-700 block font-semibold">General Status:</strong>
                    Distressed, tachypneic, diaphoretic, using accessory muscles to breathe.
                  </div>
                  <div>
                    <strong className="text-gray-700 block font-semibold">Respiratory System:</strong>
                    Severely diminished breath sounds on the right lung fields. Hyperresonance to percussion on the right side.
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
            </div>

            {/* 3. Allergies & Medications */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <Pill size={14} className="text-emerald-500" />
                <span>Allergies & Home Medications</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Allergies */}
                <div className="border border-red-100 bg-red-50/30 rounded-xl p-3 flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <div className="text-[11.5px]">
                    <span className="font-bold text-red-800 block">Drug Allergies</span>
                    <span className="text-red-700 font-semibold">Penicillin</span>
                    <span className="text-red-500 block text-[10px] mt-0.5">Reaction: Severe Urticaria (Hives)</span>
                  </div>
                </div>
                {/* Home Meds */}
                <div className="border border-emerald-100 bg-emerald-50/30 rounded-xl p-3 flex items-start gap-2.5">
                  <Pill size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-[11.5px]">
                    <span className="font-bold text-emerald-800 block">Home Medications</span>
                    <ul className="list-disc list-inside space-y-0.5 text-emerald-700 mt-1">
                      <li>Lisinopril 10mg daily</li>
                      <li>Albuterol HFA inhaler PRN</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Past Medical History */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-700">
                <FileText size={14} className="text-amber-600" />
                <span>Past Medical History (PMH)</span>
              </div>
              <div className="bg-amber-50/30 border border-amber-100/50 rounded-xl p-3.5 text-[11.5px] text-gray-600 space-y-1.5">
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Hypertension:</strong> Diagnosed 4 years ago, well controlled on home Lisinopril therapy.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Asthma:</strong> Diagnosed in childhood. Frequent albuterol rescue use in the past, last severe exacerbation requiring ED admission was 2 years ago.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span><strong>Tobacco Use:</strong> Former smoker (15 pack-years history), successfully quit smoking 5 years ago.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
