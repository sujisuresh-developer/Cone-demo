import { useEffect, useState } from 'react'
import { X, ShieldAlert } from 'lucide-react'

import { type ScenarioMode } from '../App'

type Props = {
  open: boolean
  onClose: () => void
  actionId: string | null
  scenario: ScenarioMode
  onScenarioChange: (scenario: ScenarioMode) => void
}

export default function OutcomeModal({ open, onClose, actionId, scenario, onScenarioChange }: Props) {
  const [isVisible, setIsVisible] = useState(false)
  
  // Interactive states for Lung Ultrasound
  const [usView, setUsView] = useState<'right' | 'left_anterior' | 'left_lateral'>('left_anterior')
  const [usType, setUsType] = useState<'lung' | 'cardiac'>('lung')

  // Animate modal entry
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true))
      setUsView('left_anterior')
      setUsType('lung')
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

  if (actionId === 'lung-ultrasound') {
    title = 'Bedside Ultrasound (POCUS)'
  } else if (actionId === 'chest-xray') {
    title = 'Portable Chest X-Ray (CXR)'
  } else if (actionId === 'ecg-troponin') {
    title = '12-Lead ECG & Troponin'
  } else if (actionId === 'ctpa') {
    title = 'CT Pulmonary Angiography'
  } else if (actionId === 'leg-ultrasound') {
    title = 'Leg Ultrasound (DVT Check)'
  } else if (actionId === 'ddimer-bnp') {
    title = 'Lab Panels (D-Dimer & BNP)'
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
          Patient: Mr. Will Jacks &nbsp;·&nbsp; 58 Yr &nbsp;·&nbsp; Male
        </p>

        {/* Scenario Switcher (Educational Tool) */}
        <div className="mb-4 shrink-0 flex items-center justify-between gap-2 p-2 bg-gray-50 border border-gray-100 rounded-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500">
            <ShieldAlert size={12} className="text-amber-500" />
            <span>Scenario:</span>
          </div>
          <div className="flex rounded-lg bg-gray-200/50 p-0.5">
            <button
              onClick={() => onScenarioChange('pneumothorax')}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${
                scenario === 'pneumothorax'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              Pneumothorax
            </button>
            <button
              onClick={() => onScenarioChange('pe_trap')}
              className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${
                scenario === 'pe_trap'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              PE Trap
            </button>
            {actionId === 'ecg-troponin' && (
              <button
                onClick={() => onScenarioChange('stemi')}
                className={`px-2.5 py-1 text-[9px] font-bold rounded-md transition-all ${
                  scenario === 'stemi'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                STEMI
              </button>
            )}
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          
          {/* 1. LUNG ULTRASOUND */}
          {actionId === 'lung-ultrasound' && (
            <div className="space-y-4">
              <div className="flex gap-1.5 p-0.5 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setUsType('lung')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                    usType === 'lung'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Lung Scan
                </button>
                <button
                  onClick={() => setUsType('cardiac')}
                  className={`flex-1 py-1.5 text-[10px] font-bold rounded-md transition-all ${
                    usType === 'cardiac'
                      ? 'bg-white text-red-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Cardiac Strain
                </button>
              </div>

              {usType === 'lung' ? (
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
                      Right Chest
                    </button>
                    <button
                      onClick={() => setUsView('left_anterior')}
                      className={`py-1.5 px-2 text-[9px] font-bold rounded-lg border text-center transition-all ${
                        usView === 'left_anterior'
                          ? 'bg-white border-gray-200 text-primary shadow-sm'
                          : 'border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Left Ant.
                    </button>
                    <button
                      onClick={() => setUsView('left_lateral')}
                      className={`py-1.5 px-2 text-[9px] font-bold rounded-lg border text-center transition-all ${
                        usView === 'left_lateral'
                          ? 'bg-white border-gray-200 text-primary shadow-sm'
                          : 'border-transparent text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      Left Lat. (Scan)
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

                    <div className="absolute bottom-3 left-3 right-3 z-20 bg-black/85 border border-gray-800 rounded-lg p-2.5 text-[10.5px]">
                      <span className="text-blue-400 font-bold block mb-0.5">
                        {usView === 'right' ? 'Right Lung (Normal)' : usView === 'left_anterior' ? 'Left Lung (Anterior)' : 'Left Lung (Lateral Scan)'}
                      </span>
                      <span className="text-gray-300 leading-normal">
                        {usView === 'right' && 'Normal pleural sliding. Seashore pattern.'}
                        {usView === 'left_anterior' && 'Absent lung sliding. Multiple A-lines present.'}
                        {usView === 'left_lateral' && 'Lung Point detected: transition zone from seashore to barcode.'}
                      </span>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-1">
                    <h4 className="text-[11.5px] font-bold text-gray-800">Scan Finding</h4>
                    <p className="text-[11px] leading-relaxed text-gray-600">
                      {usView === 'right' && ' pleural sliding is present, ruling out pneumothorax in this zone.'}
                      {usView === 'left_anterior' && 'No sliding is observed anteriorly. Visceral pleura is stationary relative to parietal pleura, confirming gas collection.'}
                      {usView === 'left_lateral' && 'The pathognomonic "Lung Point" confirms the physical border of the collapsed lung tissue.'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative border border-gray-900 bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center">
                    {scenario === 'pe_trap' ? (
                      <img src="/us-cardiac-strain.png.png" alt="RV Dilation Ultrasound" className="w-full h-auto" />
                    ) : (
                      <img src="/us-cardiac-normal.png.png" alt="Normal Cardiac Ultrasound" className="w-full h-auto" />
                    )}

                    <div className="absolute bottom-3 left-3 right-3 z-20 bg-black/85 border border-gray-800 rounded-lg p-2.5 text-[10.5px]">
                      <span className="text-red-400 font-bold block mb-0.5">Echocardiography</span>
                      <span className="text-gray-300">
                        {scenario === 'pe_trap'
                          ? 'RV Dilation (RV > LV) and septal flattening (D-shaped LV).'
                          : 'Normal cardiac chamber sizes. Septum intact.'}
                      </span>
                    </div>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                    <p className="text-[11px] leading-relaxed text-gray-600">
                      {scenario === 'pe_trap'
                        ? 'Cardiac scan displays right ventricular overload (strain), which occurs due to outflow obstruction from a pulmonary embolus.'
                        : 'No signs of right ventricular strain or septal distortion.'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. CHEST X-RAY */}
          {actionId === 'chest-xray' && (
            <div className="space-y-3">
              <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                {scenario === 'pneumothorax' ? (
                  <img src="/xray-pneumothorax.png.png" alt="Left Pneumothorax Chest X-Ray" className="w-full h-auto" />
                ) : (
                  <img src="/xray-normal.png.png" alt="Normal Chest X-Ray" className="w-full h-auto" />
                )}

                <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 border border-gray-150 rounded-lg p-2.5 text-[10.5px] shadow-sm">
                  <span className="text-purple-600 font-bold block mb-0.5">
                    {scenario === 'pneumothorax' ? 'Large Left Pneumothorax' : 'Normal Chest Radiograph'}
                  </span>
                  <span className="text-gray-500 leading-normal block">
                    {scenario === 'pneumothorax'
                      ? 'Absent lung markings in peripheral left zone. Collapsed visceral lung line visible.'
                      : 'No consolidations or pleural air. Normal heart silhouette.'}
                  </span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-1">
                <span className="text-[11.5px] font-bold text-gray-800 block">Interpretation Note</span>
                <p className="text-[11px] leading-relaxed text-gray-600">
                  {scenario === 'pneumothorax'
                    ? 'Portable chest radiograph confirms a moderate/large left-sided pneumothorax. Absent pulmonary vessels at the periphery confirm volume loss.'
                    : 'Surprisingly normal chest X-Ray. Normal radiographic findings occur in up to 30% of acute PE cases, presenting a diagnostic trap.'}
                </p>
              </div>
            </div>
          )}

          {/* 3. ECG & TROPONIN */}
          {actionId === 'ecg-troponin' && (
            <div className="space-y-3">
              {/* ECG graph box */}
              <div className="relative border border-gray-200 bg-white rounded-xl overflow-hidden flex items-center justify-center">
                {scenario === 'stemi' ? (
                  <img src="/ecg-stemi.png.png" alt="STEMI ECG" className="w-full h-auto" />
                ) : (
                  <img src="/ecg-sinus-tach.png.png" alt="Sinus Tachycardia ECG" className="w-full h-auto" />
                )}
              </div>

              {/* Lab Troponin Info */}
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 space-y-2">
                <span className="text-[11.5px] font-bold text-gray-800 block">Troponin Laboratory Report</span>
                <table className="w-full text-[11px] text-gray-600">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-1.5 font-medium">Troponin I</td>
                      <td className="py-1.5 text-right font-bold text-gray-900">
                        {scenario === 'stemi' ? '2.14 ng/mL (High)' : scenario === 'pe_trap' ? '0.05 ng/mL (Borderline)' : '< 0.01 ng/mL (Normal)'}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-1.5 font-medium">Reference</td>
                      <td className="py-1.5 text-right text-gray-400">&lt; 0.03 ng/mL</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50 text-[11px] text-gray-600">
                {scenario === 'stemi' && 'Anterior ST elevations indicating myocardial infarction. Requires immediate reperfusion.'}
                {scenario === 'pe_trap' && 'Sinus tachycardia with slight right ventricular strain indicator.'}
                {scenario === 'pneumothorax' && 'Sinus tachycardia only. Negative troponins, ruling out acute coronary syndrome (ACS).'}
              </div>
            </div>
          )}

          {/* 4. CTPA */}
          {actionId === 'ctpa' && (
            <div className="space-y-3">
              <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                {scenario === 'pe_trap' ? (
                  <img src="/ctpa-pe.png.png" alt="CTPA Pulmonary Embolism" className="w-full h-auto" />
                ) : (
                  <img src="/ctpa-normal.png.png" alt="CTPA Normal" className="w-full h-auto" />
                )}

                <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 border border-gray-150 rounded-lg p-2.5 text-[10.5px] shadow-sm">
                  <span className="text-indigo-600 font-bold block mb-0.5">
                    {scenario === 'pe_trap' ? 'CTPA: Pulmonary Embolism' : 'CTPA: No PE / Large pneumothorax'}
                  </span>
                  <span className="text-gray-500 leading-normal block">
                    {scenario === 'pe_trap'
                      ? 'Dark filling defect in left main pulmonary artery trunk.'
                      : 'Vasculature clear. Massive pleural air collection in left lung.'}
                  </span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="text-[11px] leading-relaxed text-gray-600">
                  {scenario === 'pe_trap'
                    ? 'Angiography confirms a large left pulmonary artery thromboembolism. This represents the primary target of thrombolytic therapy.'
                    : 'No embolism. Confirming chest radiograph findings of mechanical pleural air pressure collapse.'}
                </p>
              </div>
            </div>
          )}

          {/* 5. LEG ULTRASOUND */}
          {actionId === 'leg-ultrasound' && (
            <div className="space-y-3">
              <div className="relative border border-gray-200 bg-black rounded-xl overflow-hidden flex items-center justify-center">
                {scenario === 'pe_trap' ? (
                  <img src="/dvt-positive.png.png" alt="DVT Positive Leg US" className="w-full h-auto" />
                ) : (
                  <img src="/dvt-negative.png.png" alt="DVT Negative Leg US" className="w-full h-auto" />
                )}

                <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/95 border border-gray-150 rounded-lg p-2.5 text-[10.5px] shadow-sm">
                  <span className="text-teal-600 font-bold block mb-0.5">
                    {scenario === 'pe_trap' ? 'Venous US: DVT Present' : 'Venous US: DVT Absent'}
                  </span>
                  <span className="text-gray-500 leading-normal block">
                    {scenario === 'pe_trap'
                      ? 'Right femoral vein fails to compress. Thrombus confirmed.'
                      : 'Femoral vein compresses completely. Normal flow.'}
                  </span>
                </div>
              </div>

              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="text-[11px] leading-relaxed text-gray-600">
                  {scenario === 'pe_trap'
                    ? 'Non-compressible common femoral vein indicates lower extremity deep vein thrombosis (DVT), a common emboli source.'
                    : 'Lower extremity deep veins are patent and compressible, reducing the likelihood of acute DVT.'}
                </p>
              </div>
            </div>
          )}

          {/* 6. LAB PANELS */}
          {actionId === 'ddimer-bnp' && (
            <div className="space-y-3">
              <div className="border border-gray-150 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-[11px] text-gray-600 text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-400 font-bold">
                      <th className="p-2.5">Lab Test</th>
                      <th className="p-2.5 text-right">Value</th>
                      <th className="p-2.5 text-right">Reference</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-2.5 font-semibold text-gray-800">D-Dimer</td>
                      <td className={`p-2.5 text-right font-bold ${scenario === 'pe_trap' ? 'text-red-500' : 'text-gray-800'}`}>
                        {scenario === 'pe_trap' ? '1,450 ng/mL' : '230 ng/mL'}
                      </td>
                      <td className="p-2.5 text-right text-gray-400">&lt; 500</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-semibold text-gray-800">BNP</td>
                      <td className={`p-2.5 text-right font-bold ${scenario === 'pe_trap' ? 'text-red-500' : 'text-gray-800'}`}>
                        {scenario === 'pe_trap' ? '380 pg/mL' : '35 pg/mL'}
                      </td>
                      <td className="p-2.5 text-right text-gray-400">&lt; 100</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="border border-gray-100 rounded-xl p-3 bg-gray-50/50">
                <p className="text-[11px] leading-relaxed text-gray-600">
                  {scenario === 'pe_trap'
                    ? 'Markedly high D-Dimer indicates coagulation cascades active. High BNP reflects RV stress.'
                    : 'Normal D-Dimer and BNP rule out thromboembolism or heart failure.'}
                </p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
