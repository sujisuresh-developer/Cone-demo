import { Info, Search, Bed, Radio, Clock } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ACTIONS, PATIENT, type ActionTab } from '../simulation/pneumothoraxCase'
import PatientMedia, { VIDEO_EXTENSIONS } from './PatientMedia'


/** Diagnostics actions that open a rich result panel (OutcomeModal) instead of just logging "Done". */
export const OUTCOME_ACTION_IDS = new Set(['pocus', 'chest-xray', 'blood-panel', 'troponin', 'ecg', 'd-dimer', 'ct-chest', 'chest-tube', 'physical-exam'])

function formatTimeLabel(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  return `${Math.round(seconds / 60)} min`
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
  performed: string[]
  /** Action ids reachable from the current graph node — only these are ever shown. */
  availableActionIds: Set<string>
  currentStateName: string
  onPerform: (actionId: string) => void
  onViewPatientDetails: () => void
  patientImage: string
}

export default function LeftSidebar({
  monitorAttached,
  onMonitorChange,
  performed,
  availableActionIds,
  currentStateName,
  onPerform,
  onViewPatientDetails,
  patientImage,
}: LeftSidebarProps) {
  const [search, setSearch] = useState('')

  const [selectedTab, setSelectedTab] = useState<ActionTab | null>(null)

  // Build list of actions reachable from current state and matching search — actions already
  // performed in an earlier state are one-time, so they're dropped here instead of lingering
  // as a dead, unclickable entry (see handlePerform's performed.includes guard below).
  const filtered = ACTIONS.filter(
    (a) => availableActionIds.has(a.id) && !performed.includes(a.id) && a.name.toLowerCase().includes(search.toLowerCase())
  );
  // Determine unique tabs from filtered actions
  const availableTabs = Array.from(new Set(filtered.map((a) => a.tab)));


  // Initialize selectedTab on first render or when tabs change
  useEffect(() => {
    if (availableTabs.length && (selectedTab === null || !availableTabs.includes(selectedTab))) {
      setSelectedTab(availableTabs[0] as ActionTab)
    }
  }, [availableTabs])

  // Filter actions further by selected tab
  const tabFiltered = filtered.filter((a) => a.tab === selectedTab)

  const handlePerform = (actionId: string) => {
    if (performed.includes(actionId)) return // already done
    onPerform(actionId)
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
          {VIDEO_EXTENSIONS.test(patientImage) && (
            <PatientMedia
              src="action-images/patient-without-monitor.png"
              alt={PATIENT.name}
              className="h-[170px] w-full object-cover object-top"
            />
          )}
          <PatientMedia
            key={patientImage}
            src={patientImage}
            alt={PATIENT.name}
            className={`${
              VIDEO_EXTENSIONS.test(patientImage) ? 'absolute inset-0' : ''
            } h-[170px] w-full object-cover object-top`}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
          <div className="absolute right-0 bottom-0 left-0 p-3.5">
            <div className="flex items-center justify-between text-white">
              <h3 className="text-[14px] font-semibold">{PATIENT.name}</h3>
              <div className="flex items-center gap-1 text-[10px] text-gray-300">
                <Bed className="h-3 w-3" />
                <span>05/06/26</span>
              </div>
            </div>
            <p className="mt-0.5 text-[10px] text-gray-300">
              {PATIENT.age} Yr • {PATIENT.weight} Kg • {PATIENT.gender}
            </p>
            <button
              type="button"
              onClick={onViewPatientDetails}
              className="mt-3 w-full rounded-xl bg-primary py-2 text-[12px] font-semibold text-white transition-all duration-300 hover:bg-primary-hover shadow-md"
            >
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Choose Action */}
      <div className="card-shadow flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-4">
        <div className="mb-0.5 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold text-gray-800">Choose an Action</h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">
            {currentStateName}
          </span>
          </div>
                    {/* Tab navigation */}
          {availableTabs.length > 0 && (
            <div className="mt-2">
              <div className="action-tab-track no-scrollbar flex space-x-1 overflow-x-auto whitespace-nowrap rounded-full p-1 -mx-2 px-2">
                {availableTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab as ActionTab)}
                    className={`action-tab-pill flex-shrink-0 rounded-full px-3 py-1 text-xs font-medium cursor-pointer ${
                      tab === selectedTab
                        ? 'active text-primary'
                        : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <p className="mb-2 text-[9px] text-gray-400">Only what's clinically available right now is shown here.</p>

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
          <div key={`${currentStateName}-${selectedTab}`} className="action-glass-transition relative h-full">
            <ul className="action-scroll h-full space-y-0.5 overflow-y-auto pl-4">
              <li className="flex items-center justify-between rounded-lg py-1.5 pr-1">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                    <Radio className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                  </div>
                  <span className="block text-[13px] leading-tight text-gray-700">Attach Monitor</span>
                </div>
                <Toggle on={monitorAttached} onChange={onMonitorChange} />
              </li>

              {tabFiltered.map((action) => (
                <li
                  key={action.id}
                  className="flex cursor-pointer items-center justify-between rounded-lg py-1.5 pr-1 transition-colors hover:bg-gray-50"
                  onClick={() => handlePerform(action.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white">
                      <Radio className="h-4 w-4 text-gray-400" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[13px] leading-tight text-gray-700">{action.name}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[10px] text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatTimeLabel(action.timeCost)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePerform(action.id)
                    }}
                    className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
                  >
                    Perform
                  </button>
                </li>
              ))}

              {filtered.length === 0 && (
                <li className="px-1 py-6 text-center text-[12px] text-gray-400">No actions available right now.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  )
}
