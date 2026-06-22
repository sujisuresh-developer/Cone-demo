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
  ChevronRight,
  User,
  Heart,
  Thermometer,
  Activity,
  Wind,
  Droplets,
  AlertCircle,
  Clock,
  Stethoscope,
  Pill,
  Shield,
  FileText,
  Search,
  LogOut,
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

const CATEGORIES = ['All', 'Cardiology', 'ICU']

// ─── Patient Detail Data ────────────────────────────────────────────────────
const PATIENT_DATA = {
  hpi: 'Sudden onset substernal crushing chest pain, 9/10 severity. Began 45 minutes prior to arrival. Radiates to left arm and jaw. Associated symptoms: diaphoresis, nausea, dyspnea',
  vitals: [
    { label: 'BP',   value: '148/92', unit: 'mmHg',     icon: Activity,    color: '#0057FF' },
    { label: 'HR',   value: '96',     unit: 'bpm',      icon: Heart,       color: '#0078d7' },
    { label: 'RR',   value: '18',     unit: '/min',     icon: Wind,        color: '#0099cc' },
    { label: 'SpO₂', value: '97%',   unit: 'room air', icon: Droplets,    color: '#0057FF' },
    { label: 'Temp', value: '36.8',  unit: '°C',       icon: Thermometer, color: '#005fcc' },
  ],
  pmh: ['Hypertension', 'Hyperlipidemia', 'Tobacco use (30 pack-years)'],
  medications: ['Lisinopril', 'Atorvastatin'],
  allergies: 'No known drug allergies',
}

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
        className="fixed top-0 right-0 h-screen bg-white z-50 flex flex-col"
        style={{
          width: 400,
          boxShadow: '-8px 0 40px rgba(0,87,255,0.12)',
          animation: 'cs-slide-in 0.35s cubic-bezier(0.16,1,0.3,1)',
        }}
      >
        {/* Header */}
        <div
          className="px-5 pt-5 pb-4 flex items-start justify-between gap-3 flex-shrink-0"
          style={{ borderBottom: '1px solid #e8f0ff', background: '#f0f7ff' }}
        >
          <div className="flex-1 min-w-0">
            <span
              className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full mb-2"
              style={{ background: `${BLUE}18`, color: BLUE }}
            >
              {caseItem.category}
            </span>
            <h2 className="text-[15px] font-bold text-gray-900 leading-snug">{caseItem.title}</h2>
            <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-gray-500">
              <User size={12} />
              <span>{caseItem.patient} · {caseItem.age}yr · {caseItem.weight}kg · {caseItem.gender}</span>
            </div>
          </div>
          <button
            className="w-8 h-8 rounded-xl border border-blue-100 bg-white flex items-center justify-center flex-shrink-0 transition-colors hover:bg-blue-50"
            style={{ color: BLUE }}
            onClick={onClose}
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <div
          className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-5"
          style={{ scrollbarWidth: 'none' }}
        >
          {/* HPI */}
          <section>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: BLUE }}>
              <FileText size={12} />
              History of Present Illness
            </div>
            <p
              className="text-[13px] text-gray-700 leading-relaxed rounded-2xl px-4 py-3"
              style={{ background: '#f0f7ff', border: `1px solid ${BLUE}25` }}
            >
              {PATIENT_DATA.hpi}
            </p>
          </section>

          {/* Vitals */}
          <section>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: BLUE }}>
              <Activity size={12} />
              Initial Vitals
            </div>
            <div
              className="rounded-2xl p-3 grid grid-cols-3 gap-2"
              style={{ background: '#e8f0ff', border: `1.5px solid ${BLUE}30` }}
            >
              {PATIENT_DATA.vitals.map(({ label, value, unit, icon: Icon, color }) => (
                <div
                  key={label}
                  className="rounded-xl bg-white flex flex-col items-center text-center py-3 px-2"
                  style={{ border: `1.5px solid ${BLUE}20`, boxShadow: '0 1px 4px rgba(0,87,255,0.06)' }}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center mb-1"
                    style={{ background: `${color}15` }}
                  >
                    <Icon size={14} style={{ color }} />
                  </div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</div>
                  <div className="text-[16px] font-bold text-gray-900 leading-tight mt-0.5">{value}</div>
                  <div className="text-[9px] text-gray-400 mt-0.5">{unit}</div>
                </div>
              ))}
            </div>
          </section>

          {/* PMH */}
          <section>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: BLUE }}>
              <Clock size={12} />
              Past Medical History
            </div>
            <div className="flex flex-wrap gap-2">
              {PATIENT_DATA.pmh.map(item => (
                <span
                  key={item}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: '#e8f0ff', color: BLUE, border: `1px solid ${BLUE}30` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          {/* Medications */}
          <section>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: BLUE }}>
              <Pill size={12} />
              Medications
            </div>
            <div className="flex flex-wrap gap-2">
              {PATIENT_DATA.medications.map(med => (
                <span
                  key={med}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-full"
                  style={{ background: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' }}
                >
                  {med}
                </span>
              ))}
            </div>
          </section>

          {/* Allergies */}
          <section>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: BLUE }}>
              <Shield size={12} />
              Allergies
            </div>
            <div
              className="flex items-center gap-2 text-[13px] font-medium rounded-2xl px-4 py-2.5"
              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
            >
              <AlertCircle size={14} />
              {PATIENT_DATA.allergies}
            </div>
          </section>
        </div>

        {/* Footer */}
        <div
          className="px-5 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid #e8f0ff', background: 'white' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={13} className="text-gray-400" />
            <span className="text-[12px] text-gray-500">Estimated duration: {caseItem.duration}</span>
          </div>
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-3 rounded-2xl text-white font-bold text-[16px] transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              padding: '16px',
              background: `linear-gradient(135deg, ${BLUE}, #003eb3)`,
              boxShadow: '0 4px 16px rgba(0,87,255,0.4)',
            }}
          >
            <Stethoscope size={18} />
            Start Simulation
            <ChevronRight size={18} />
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
  const [activeCategory, setActiveCategory] = useState('All')

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
      className="flex h-screen w-screen overflow-hidden page-enter"
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
      <main className="flex-1 flex flex-col overflow-hidden py-4 pr-4">
        {/* Page header */}
        <div className="flex items-start justify-between mb-5 flex-shrink-0">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
              Case <span style={{ color: BLUE }}>Library</span>
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Choose a clinical scenario to begin your simulation
            </p>
          </div>
          {/* Profile pill */}
          <div
            className="flex items-center gap-3 rounded-full px-4 py-2"
            style={{ background: '#f0f0ee' }}
          >
            <span className="text-[14px] font-semibold text-gray-700">William Dawson</span>
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 relative"
              style={{ background: '#d1d5db' }}
            >
              <img
                src="/patient-without-monitor.png"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
              <span className="text-[11px] font-bold text-gray-500 absolute">WD</span>
            </div>
          </div>
        </div>

        {/* Search + filter bar */}
        <div className="flex items-center gap-3 mb-5 flex-shrink-0">
          {/* Search input */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: '#9ca3af' }}
            />
            <input
              type="text"
              placeholder="Search cases..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-2xl bg-white border border-gray-200 pl-9 pr-4 py-2.5 text-[13px] text-gray-700 placeholder:text-gray-400 outline-none transition-all"
              style={{
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.boxShadow = `0 0 0 3px ${BLUE}18` }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)' }}
            />
          </div>
          {/* Category capsules */}
          <div className="flex items-center gap-2">
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all"
                  style={{
                    background: isActive ? BLUE : 'white',
                    color: isActive ? 'white' : '#6b7280',
                    border: isActive ? `1.5px solid ${BLUE}` : '1.5px solid #e5e7eb',
                    boxShadow: isActive ? `0 2px 8px ${BLUE}35` : '0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {cat}
                </button>
              )
            })}
          </div>
        </div>

        {/* Cases grid */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          <div
            className="grid gap-5 pb-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
              maxWidth: 860,
            }}
          >
            {filteredCases.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-400">
                <Search size={32} className="mb-3 opacity-30" />
                <p className="text-[14px] font-medium">No cases found</p>
                <p className="text-[12px] mt-1">Try a different search or category</p>
              </div>
            )}
            {filteredCases.map((c, i) => (
              <article
                key={c.id}
                onClick={() => setSelected(c)}
                className="bg-white rounded-3xl overflow-hidden cursor-pointer"
                style={{
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                  border: `1.5px solid ${BLUE}18`,
                  animation: `cs-card-appear 0.5s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms both`,
                  transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.25s ease',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = `0 10px 32px rgba(0,87,255,0.14)`
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
                  ;(e.currentTarget as HTMLElement).style.boxShadow = '0 1px 4px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)'
                }}
              >

                <div className="p-5">
                  {/* Category badge */}
                  <div className="mb-3">
                    <span
                      className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                      style={{ background: `${BLUE}12`, color: BLUE }}
                    >
                      {c.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-[15px] font-bold text-gray-900 leading-snug mb-4">{c.title}</h2>

                  {/* Patient row */}
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: `${BLUE}12` }}
                    >
                      <User size={16} style={{ color: BLUE }} />
                    </div>
                    <div>
                      <div className="text-[13px] font-semibold text-gray-800">{c.patient}</div>
                      <div className="text-[11px] text-gray-500">{c.age} yr · {c.weight} kg · {c.gender}</div>
                    </div>
                  </div>


                  {/* Footer */}
                  <div
                    className="flex items-center justify-between mt-4 pt-4"
                    style={{ borderTop: `1px solid ${BLUE}12` }}
                  >
                    <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
                      <Clock size={12} />
                      {c.duration}
                    </div>
                    <button
                      className="text-[13px] font-bold text-white rounded-xl px-5 py-2.5 transition-all hover:opacity-90 active:scale-[0.97]"
                      style={{
                        background: BLUE,
                        boxShadow: `0 3px 12px ${BLUE}45`,
                      }}
                      onClick={e => { e.stopPropagation(); setSelected(c) }}
                    >
                      View Case
                    </button>
                  </div>
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
