import { Info, Search, Bed, Radio, Clock, Check } from 'lucide-react'
import { useState } from 'react'
import type { ActionTab } from './CenterView'

/* ─── Action definitions per tab ─── */

type ActionItem = {
  id: string
  label: string
  timePenalty: number        // seconds deducted
  timeLabel: string          // display string
  hasToggle?: boolean        // only for Attach Monitor
}

const DIAGNOSTICS_ACTIONS: ActionItem[] = [
  { id: 'attach-monitor', label: 'Attach Monitor', timePenalty: 0, timeLabel: '—', hasToggle: true },
  { id: 'lung-ultrasound', label: 'Lung Ultrasound (Bedside)', timePenalty: 30, timeLabel: '30s' },
  { id: 'chest-xray', label: 'Chest X-Ray (Portable)', timePenalty: 480, timeLabel: '8 min' },
  { id: 'ecg-troponin', label: '12-Lead ECG & Troponin', timePenalty: 180, timeLabel: '3 min' },
  { id: 'ctpa', label: 'CT Pulmonary Angiography', timePenalty: 600, timeLabel: '10 min' },
  { id: 'ddimer-bnp', label: 'D-Dimer & BNP Labs', timePenalty: 180, timeLabel: '3 min' },
  { id: 'leg-ultrasound', label: 'Leg Ultrasound (DVT)', timePenalty: 120, timeLabel: '2 min' },
]

const MEDICATIONS_ACTIONS: ActionItem[] = [
  { id: 'oxygen', label: 'Administer Oxygen (NC / NRB)', timePenalty: 15, timeLabel: '15s' },
  { id: 'nitroglycerin', label: 'Nitroglycerin 0.4mg SL', timePenalty: 15, timeLabel: '15s' },
  { id: 'heparin', label: 'Administer Heparin', timePenalty: 30, timeLabel: '30s' },
  { id: 'thrombolysis', label: 'Systemic Thrombolysis (Alteplase)', timePenalty: 60, timeLabel: '60s' },
  { id: 'vasopressors', label: 'Vasopressors (Norepinephrine)', timePenalty: 60, timeLabel: '60s' },
]

const PROCEDURES_ACTIONS: ActionItem[] = [
  { id: 'needle-decomp', label: 'Needle Decompression (14g)', timePenalty: 45, timeLabel: '45s' },
  { id: 'intubation-ppv', label: 'Intubation / PPV', timePenalty: 60, timeLabel: '60s' },
]

const TAB_ACTIONS: Record<ActionTab, ActionItem[]> = {
  diagnostics: DIAGNOSTICS_ACTIONS,
  medications: MEDICATIONS_ACTIONS,
  procedures: PROCEDURES_ACTIONS,
}

const TAB_LABELS: Record<ActionTab, string> = {
  diagnostics: 'Diagnostics',
  medications: 'Medications',
  procedures: 'Procedures',
}

/* ─── Toggle component ─── */

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={`relative h-[22px] w-[40px] shrink-0 rounded-full transition-colors ${
        on ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-[18px] w-[18px] rounded-full bg-white shadow transition-transform ${
          on ? 'translate-x-[18px]' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

/* ─── Component ─── */

type LeftSidebarProps = {
  monitorAttached: boolean
  onMonitorChange: (v: boolean) => void
  activeTab: ActionTab
  performed: string[]
  onPerform: (actionId: string, timePenalty: number) => void
  onViewOutcome: (actionId: string) => void
  onViewPatientDetails: () => void
  patientImage: string
}

export default function LeftSidebar({
  monitorAttached,
  onMonitorChange,
  activeTab,
  performed,
  onPerform,
  onViewOutcome,
  onViewPatientDetails,
  patientImage,
}: LeftSidebarProps) {
  const [search, setSearch] = useState('')

  const actions = TAB_ACTIONS[activeTab]
  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(search.toLowerCase())
  )

  const handlePerform = (action: ActionItem) => {
    if (performed.includes(action.id)) return // already done
    onPerform(action.id, action.timePenalty)
  }

  return (
    <aside className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Patient Snapshot */}
      <div className="card-shadow shrink-0 rounded-3xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-800">Patient Snapshot</h2>
          <Info className="h-4 w-4 text-gray-400" />
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gray-900">
          <img
            key={patientImage}
            src={`/${patientImage}`}
            alt="Mr. Will Jacks"
            className="h-[170px] w-full object-cover object-top animate-fade-in"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-3.5">
            <div className="flex items-center justify-between text-white">
              <h3 className="text-[14px] font-semibold">Mr. Will Jacks</h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-300">
                <Bed className="h-3 w-3" />
                <span>05/06/26</span>
              </div>
            </div>
            <p className="mt-0.5 text-[10px] text-gray-300">58 Yr • 82 Kg • Male</p>
            <button
              type="button"
              onClick={onViewPatientDetails}
              className="mt-3 w-full rounded-xl bg-primary py-2 text-[12px] font-semibold text-white transition-all duration-300 hover:bg-primary-hover shadow-md"
            >
              View More
            </button>
          </div>
        </div>
      </div>

      {/* Choose Action */}
      <div className="card-shadow flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-4">
        <div className="mb-0.5 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-gray-800">Choose an Action</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
            {TAB_LABELS[activeTab]}
          </span>
        </div>
        <p className="mb-2 text-[9px] text-gray-400">
          {activeTab === 'diagnostics' && 'Order clinical tests & imaging'}
          {activeTab === 'medications' && 'Administer pharmacological interventions'}
          {activeTab === 'procedures' && 'Perform physical medical interventions'}
        </p>

        <div className="relative mb-2.5">
          <Search className="absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search an action"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-gray-100 py-2 pr-4 pl-9 text-[12px] text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="relative min-h-0 flex-1 pl-1">
          <div className="absolute top-1 bottom-4 left-0 w-[3px] rounded-full bg-primary" />
          <div key={activeTab} className="action-slide-in h-full">
          <ul className="action-scroll h-full space-y-0.5 overflow-y-auto pl-4">
            {filtered.map((action) => {
              const isDone = performed.includes(action.id)
              const hasOutcome = activeTab === 'diagnostics' && action.id !== 'attach-monitor'
              return (
                <li
                  key={action.id}
                  className={`flex items-center justify-between rounded-lg py-1.5 pr-1 transition-colors hover:bg-gray-50 cursor-pointer ${
                    isDone && !hasOutcome ? 'opacity-50' : ''
                  }`}
                  onClick={() => {
                    if (action.hasToggle) return
                    if (isDone) {
                      if (hasOutcome) onViewOutcome(action.id)
                    } else {
                      handlePerform(action)
                    }
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                        isDone
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      {isDone ? (
                        <Check className="h-4 w-4 text-green-500" strokeWidth={2.5} />
                      ) : (
                        <Radio className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <span className={`block text-[13px] leading-tight ${isDone && !hasOutcome ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                        {action.label}
                      </span>
                      {!action.hasToggle && (
                        <span className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-400">
                          <Clock className="h-3 w-3" />
                          {action.timeLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  {action.hasToggle && (
                    <Toggle
                      on={monitorAttached}
                      onChange={(v) => onMonitorChange(v)}
                    />
                  )}
                  {!action.hasToggle && !isDone && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePerform(action)
                      }}
                      className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                      Perform
                    </button>
                  )}
                  {isDone && hasOutcome && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onViewOutcome(action.id)
                      }}
                      className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-primary-hover shadow-sm"
                    >
                      View
                    </button>
                  )}
                  {isDone && !action.hasToggle && !hasOutcome && (
                    <span className="shrink-0 text-[10px] font-medium text-green-500 mr-2">Done</span>
                  )}
                </li>
              )
            })}
          </ul>
          </div>
        </div>
      </div>
    </aside>
  )
}
