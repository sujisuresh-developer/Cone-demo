import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Bandage,
  UserCheck,
  Settings,
  Sun,
  Moon,
  X,

  ChevronDown,

  Heart,
  Thermometer,
 
  Droplets,

  Hourglass,

  Search,
  LogOut,
  AlertTriangle,
  ClipboardList
} from 'lucide-react'

// ─── Shared nav config ──────────────────────────────────────────────────────
const NAV = [
  { Icon: Home,      path: '/dashboard', label: 'Dashboard' },
  { Icon: Bandage,   path: '/cases',     label: 'Case Library' },
  { Icon: UserCheck, path: '#',           label: 'Reports' },
  { Icon: Settings,  path: '#',           label: 'Settings' },
]

const BLUE = '#0057FF'

// ─── Types ─────────────────────────────────────────────────────────────────
interface CaseCard {
  id: string
  title: string
  patient: string
  age: number
  weight: number
  gender: string
  category: string
  difficulty: number
  duration: string
  tags: string[]
}

// ─── Case Data ─────────────────────────────────────────────────────────────
const CASES: CaseCard[] = [
  {
    id: 'stemi-01',
    title: '55-Year-Old Male Presenting With Chest Pain',
    patient: 'James Robertson',
    age: 55,
    weight: 82,
    gender: 'Male',
    category: 'Cardiology',
    difficulty: 4,
    duration: '12 min',
    tags: ['STEMI', 'ECG', 'PCI', 'Critical'],
  },
  {
    id: 'pneumo-01',
    title: '42-Year-Old Male Presenting With Chest Pain',
    patient: 'David Mercer',
    age: 42,
    weight: 76,
    gender: 'Male',
    category: 'ICU',
    difficulty: 5,
    duration: '12 min',
    tags: ['Pneumothorax', 'Respiratory', 'Tension', 'Critical'],
  },
]





// ─── Patient Detail Slide-in Panel ─────────────────────────────────────────
function PatientSidebar({
  caseItem,
  onClose,
  onStart,
}: {
  caseItem: CaseCard
  onClose: () => void
  onStart: () => void
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        style={{ animation: 'cs-fade-in 0.25s ease' }}
        onClick={onClose}
      />

      {/* Panel */}
      <aside
        className="fixed top-6 right-6 z-50 flex flex-col bg-white overflow-hidden"
        style={{
          width: 420,
          height: 'calc(100vh - 48px)',
          boxShadow: '-4px 12px 40px rgba(0,0,0,0.08)',
          animation: 'cs-slide-in 0.35s cubic-bezier(0.16,1,0.3,1)',
          borderRadius: '24px',
        }}
      >
        {/* Header */}
        <div className="px-6 pt-8 pb-4 flex-shrink-0 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
              <img src="/patient-without-monitor.png" alt="Patient" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 mb-0.5">{caseItem.patient}</h2>
              <div className="text-[13px] text-gray-500 font-medium">
                {caseItem.gender} • {caseItem.age} Years old
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-300 bg-red-50 text-red-500 text-[12px] font-bold shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Critical
          </div>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* Patient Details */}
          <section>
            <h3 className="text-[16px] font-bold text-gray-900 mb-4">Patient Details</h3>
            <div className="space-y-3 text-[13.5px]">
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="font-bold text-gray-800">Blood Type:</span>
                <span className="text-gray-500">O+(Positive)</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="font-bold text-gray-800">Allergies:</span>
                <span className="text-gray-500">Milk, Penicillin</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="font-bold text-gray-800">Diseases:</span>
                <span className="text-gray-500">Diabetes, Blood Disorder</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="font-bold text-gray-800">Height:</span>
                <span className="text-gray-500">1.78m</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="font-bold text-gray-800">Weight:</span>
                <span className="text-gray-500">{caseItem.weight}kg</span>
              </div>
              <div className="grid grid-cols-[100px_1fr] gap-4">
                <span className="font-bold text-gray-800">Patient ID:</span>
                <span className="text-gray-500">208898786</span>
              </div>
            </div>
          </section>

          {/* Patient Vitals */}
          <section>
            <h3 className="text-[16px] font-bold text-gray-900 mb-4">Patient Vitals</h3>
            <div className="flex gap-3">
              {/* Heart Rate */}
              <div className="flex-1 rounded-2xl bg-[#eff3f8] p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <Heart size={18} className="text-[#0057FF] fill-[#0057FF]" />
                <div className="text-[11px] font-semibold text-gray-500">Heart Rate</div>
                <div className="text-[16px] font-bold text-gray-900">112 bpm</div>
              </div>
              {/* BP */}
              <div className="flex-1 rounded-2xl bg-[#eff3f8] p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <Droplets size={18} className="text-[#0057FF] fill-[#0057FF]" />
                <div className="text-[11px] font-semibold text-gray-500">BLD pressure</div>
                <div className="text-[16px] font-bold text-gray-900">158/98</div>
              </div>
              {/* Temp */}
              <div className="flex-1 rounded-2xl bg-[#eff3f8] p-4 flex flex-col items-center justify-center gap-1.5 shadow-sm">
                <Thermometer size={18} className="text-[#0057FF]" />
                <div className="text-[11px] font-semibold text-gray-500">Body Temp</div>
                <div className="text-[16px] font-bold text-gray-900">37.1</div>
              </div>
            </div>
          </section>

          {/* Chief Complaint */}
          <section>
            <div className="rounded-2xl border-[1.5px] border-[#fcd34d] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#fef3c7]">
                  <AlertTriangle size={13} className="text-[#d97706]" />
                </div>
                <h4 className="text-[14px] font-bold text-[#d97706]">Chief Compliant</h4>
              </div>
              <p className="text-[13.5px] text-gray-500 leading-relaxed font-medium">
                Acute, sudden onset of progressive breathing difficulty and <span className="text-[#d97706] font-bold">sharp right-sided chest pain</span> starting approximately 1 hour ago.
              </p>
            </div>
          </section>

          {/* Medical History */}
          <section>
            <div className="rounded-2xl border-[1.5px] border-[#5eead4] p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-[#ccfbf1]">
                  <ClipboardList size={13} className="text-[#0f766e]" />
                </div>
                <h4 className="text-[14px] font-bold text-[#0f766e]">Medical History</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {['Hypertension', 'Asthma', 'Tobacco Use', 'Hypertension'].map((item, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 rounded-full text-[12px] font-bold text-[#0f766e] bg-[#ccfbf1]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-5 flex items-center gap-4 flex-shrink-0 bg-white">
          <button
            onClick={onClose}
            className="flex-1 rounded-full py-3.5 text-[15px] font-bold text-[#0057FF] border-[1.5px] border-[#0057FF] transition-all hover:bg-blue-50 active:scale-[0.98]"
          >
            Back
          </button>
          <button
            onClick={onStart}
            className="flex-1 rounded-full py-3.5 text-[15px] font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ background: '#0057FF', boxShadow: '0 4px 12px rgba(0,87,255,0.3)' }}
          >
            Start Now
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── Main Cases Page ───────────────────────────────────────────────────────
export default function CasesPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<CaseCard | null>(null)
  const [dark, setDark] = useState(false)
  const [search, setSearch] = useState('')
  const [activeCategory] = useState('All')

  const filteredCases = useMemo(() => {
    return CASES.filter(c => {
      const matchCat = activeCategory === 'All' || c.category === activeCategory
      const q = search.trim().toLowerCase()
      const matchSearch = !q ||
        c.title.toLowerCase().includes(q) ||
        c.patient.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [search, activeCategory])

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#faf9f6', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Sidebar (identical to Dashboard) ── */}
      <aside
        className="flex flex-col items-center gap-3 py-5 mx-4 my-4 rounded-3xl flex-shrink-0"
        style={{ width: 72, background: '#f0f0ee' }}
      >
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center mb-2 flex-shrink-0">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          {NAV.map(({ Icon, path, label }) => {
            const isActive = path === '/cases'
            return (
              <button
                key={label}
                title={label}
                onClick={() => path !== '#' && navigate(path)}
                className="flex items-center justify-center rounded-2xl transition-all"
                style={{
                  width: 48,
                  height: 48,
                  background: isActive ? BLUE : 'transparent',
                  color: isActive ? 'white' : '#9ca3af',
                  boxShadow: isActive ? '0 4px 14px rgba(0,87,255,0.3)' : 'none',
                }}
              >
                <Icon size={20} />
              </button>
            )
          })}
        </nav>

        {/* Vertical theme toggle pill */}
        <div
          className="flex flex-col items-center rounded-2xl overflow-hidden"
          style={{ background: '#e4e4e0', padding: 4, gap: 2 }}
        >
          <button
            title="Light mode"
            onClick={() => setDark(false)}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 40, height: 40,
              background: !dark ? 'white' : 'transparent',
              color: !dark ? BLUE : '#9ca3af',
              boxShadow: !dark ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <Sun size={17} />
          </button>
          <button
            title="Dark mode"
            onClick={() => setDark(true)}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 40, height: 40,
              background: dark ? 'white' : 'transparent',
              color: dark ? BLUE : '#9ca3af',
              boxShadow: dark ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <Moon size={17} />
          </button>
        </div>

        {/* Logout */}
        <button
          title="Logout"
          onClick={() => navigate('/')}
          className="flex items-center justify-center rounded-2xl transition-all hover:scale-105"
          style={{
            width: 48,
            height: 48,
            background: '#fee2e2',
            color: '#ef4444',
          }}
        >
          <LogOut size={18} />
        </button>
      </aside>


      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col overflow-hidden py-8 pr-12 pl-4 page-swipe-up">
        {/* Page header */}
        <div className="flex items-start justify-between mb-8 flex-shrink-0">
          <div>
            <h1 className="text-[36px] font-bold text-gray-800 leading-tight">
              <span style={{ color: BLUE }}>Case Lists</span> Section
            </h1>
            <p className="text-[14px] font-medium text-gray-400 mt-2">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>
          {/* Profile pill */}
          <div
            className="flex items-center gap-3 rounded-full px-4 py-2"
            style={{ background: '#e5e7eb' }}
          >
            <span className="text-[14px] font-bold text-gray-900 ml-1">William Dawson</span>
            <div
              className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-white"
            >
              <video
                src="/patient-without-monitor.mp4"
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                onError={e => { (e.currentTarget as HTMLVideoElement).style.display = 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-4 mb-4 flex-shrink-0">
          {/* Search input */}
          <div className="relative flex-1 max-w-lg">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"
            />
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl border-none bg-[#f3f4f6] pl-12 pr-4 py-3.5 text-[15px] text-gray-700 placeholder:text-gray-400 outline-none transition-all"
            />
          </div>
          {/* Select Location */}
          <div className="relative w-48">
            <select className="w-full appearance-none rounded-2xl border-none bg-[#f3f4f6] pl-5 pr-10 py-3.5 text-[15px] font-medium text-gray-500 outline-none cursor-pointer">
              <option value="">Location</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
          {/* Select Case Type */}
          <div className="relative w-48">
            <select className="w-full appearance-none rounded-2xl border-none bg-[#f3f4f6] pl-5 pr-10 py-3.5 text-[15px] font-medium text-gray-500 outline-none cursor-pointer">
              <option value="">Case Type</option>
            </select>
            <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Selected Tags */}
        <div className="flex items-center gap-3 mb-8 flex-shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eef2ff] text-[#1e1b4b] text-[14px] font-semibold hover:bg-indigo-100 transition-colors">
            <X size={16} className="text-gray-900" />
            Emergency
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#eef2ff] text-[#1e1b4b] text-[14px] font-semibold hover:bg-indigo-100 transition-colors">
            <X size={16} className="text-gray-900" />
            Chest Pain
          </button>
        </div>

        {/* Result Count */}
        <div className="text-[18px] font-medium text-gray-500 mb-6 flex-shrink-0">
          We've found <span style={{ color: BLUE, fontWeight: 'bold' }}>{filteredCases.length || 4}</span> Cases!
        </div>

        {/* Cases grid */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div
            className="grid gap-6 pb-8"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            }}
          >
            {(filteredCases.length > 0 ? filteredCases : CASES).map((c, i) => (
              <article
                key={c.id}
                onClick={() => setSelected(c)}
                className="bg-white rounded-[24px] overflow-hidden cursor-pointer flex flex-col p-6"
                style={{
                  border: `2px solid #e5e7eb`,
                  animation: `cs-card-appear 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms both`,
                  transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#d1d5db'
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = '#e5e7eb'
                }}
              >
                {/* Header: Image + Info */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-[84px] h-[84px] rounded-xl overflow-hidden bg-gray-200">
                     <img src="/patient-without-monitor.png" alt="Patient" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-[18px] font-bold text-gray-900 mb-1">Mr. Will Jacks</h2>
                    <div className="text-[13px] font-semibold text-gray-800">58 Yr · 82 Kg · Male</div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[13px] text-gray-500 leading-relaxed font-semibold mb-6">
                  Lorem It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                </p>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-8">
                  <span className="px-3 py-1 rounded-lg text-[12px] font-bold text-red-500 border border-red-400 bg-red-50/50">
                    Emergency
                  </span>
                  <span className="px-3 py-1 rounded-lg text-[12px] font-bold text-[#f59e0b] border border-[#f59e0b] bg-amber-50/50">
                    Chest Pain
                  </span>
                  <span className="px-2 py-1 rounded-full text-[12px] font-bold text-gray-400 border border-gray-300">
                    +2
                  </span>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-1.5 text-[14px] font-bold text-gray-400">
                    <Hourglass size={16} />
                    30mins
                  </div>
                  <button
                    className="text-[14px] font-bold text-white rounded-full px-8 py-2.5 transition-all hover:opacity-90 active:scale-[0.97]"
                    style={{ background: BLUE }}
                    onClick={e => { e.stopPropagation(); setSelected(c) }}
                  >
                    Start Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </main>

      {/* Patient detail panel */}
      {selected && (
        <PatientSidebar
          caseItem={selected}
          onClose={() => setSelected(null)}
          onStart={() => navigate('/simulation')}
        />
      )}
    </div>
  )
}
