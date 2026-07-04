import { useNavigate } from 'react-router-dom'
import {
  Home,
  Bandage,
  UserCheck,
  Settings,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  LogOut,
} from 'lucide-react'
import { useState } from 'react'

// ─── Mountain-valley Sparkline ─────────────────────────────────────────────
// Matches the reference: a wide dip (valley) in the purple area chart
function MountainSparkline({ color = '#8b5cf6' }: { color?: string }) {
  // Path that creates the mountain-valley shape like the reference image
  const pathD = 'M0,10 C10,10 15,10 20,10 C28,10 32,5 38,2 C44,0 46,0 50,2 C54,4 56,40 62,44 C68,48 72,48 78,40 C84,32 86,8 92,4 C98,0 100,0 106,2 C112,4 114,8 120,8'
  const fillD = pathD + ' L120,50 L0,50 Z'
  const id = `grad-${color.replace('#', '')}`

  return (
    <svg viewBox="0 0 120 50" className="w-full h-[80px]" preserveAspectRatio="none">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={fillD} fill={`url(#${id})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Calendar ─────────────────────────────────────────────────────────────
const WEEK_DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']
// December 2025: starts on Monday (offset 0), 31 days
const DEC_DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const DEC_OFFSET = 0 // December 1, 2025 = Monday

function CalendarWidget() {
  const cells: (number | null)[] = [
    ...Array.from({ length: DEC_OFFSET }, () => null),
    ...DEC_DAYS,
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  // Highlighted: 3,4,5,6 = blue filled; 12,13,19,20,26,27 = blue text; 2,3 next month = blue
  const blueCircle = new Set([3, 4, 5, 6])
  const blueText = new Set([12, 13, 19, 20, 26, 27])


  return (
    <div className="card-shadow rounded-3xl bg-white p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[15px] font-semibold text-gray-800">December</h3>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 gap-x-0 mb-1">
        {WEEK_DAYS.map(d => (
          <div key={d} className="text-center text-[11px] font-semibold text-gray-400 py-1">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5 gap-x-0">
        {/* Prev month tail: 30 */}
        <div className="flex items-center justify-center">
          <span className="text-[12px] text-gray-300">30</span>
        </div>
        {cells.map((day, i) => {
          if (day === null) return <div key={`e-${i}`} />
          const isCircle = blueCircle.has(day)
          const isBlueTxt = blueText.has(day)
          return (
            <div key={i} className="flex items-center justify-center">
              <span
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-semibold cursor-default
                  ${isCircle
                    ? 'bg-[#0057FF] text-white shadow-sm'
                    : isBlueTxt
                      ? 'text-[#0057FF]'
                      : 'text-gray-600 hover:bg-gray-100'}
                `}
              >
                {day}
              </span>
            </div>
          )
        })}
        {/* Next month: 1,2,3 */}
        {[1, 2, 3].map(d => (
          <div key={`n-${d}`} className="flex items-center justify-center">
            <span className="flex items-center justify-center w-7 h-7 rounded-full text-[12px] font-semibold text-[#0057FF] cursor-default">{d}</span>
          </div>
        ))}
      </div>
    </div>
  )
}



// ─── Nav Icons ─────────────────────────────────────────────────────────────
const NAV = [
  { Icon: Home, path: '/dashboard', label: 'Dashboard' },
  { Icon: Bandage, path: '/cases', label: 'Simulation' },
  { Icon: UserCheck, path: '/mcq', label: 'MCQ Questions' },
  { Icon: Settings, path: '#', label: 'Settings' },
]

// ─── Main Dashboard ────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#faf9f6', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col items-center gap-3 py-5 mx-4 my-4 rounded-3xl"
        style={{
          width: 72,
          flexShrink: 0,
          background: '#f0f0ee',
        }}
      >
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center mb-2 flex-shrink-0">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>

        {/* Nav */}
        <nav className="flex flex-col items-center gap-2 flex-1">
          {NAV.map(({ Icon, path, label }) => {
            const isActive = path === '/dashboard'
            return (
              <button
                key={label}
                title={label}
                onClick={() => path !== '#' && navigate(path)}
                className="flex items-center justify-center rounded-2xl transition-all"
                style={{
                  width: 48,
                  height: 48,
                  background: isActive ? '#0057FF' : 'transparent',
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
          {/* Sun — light mode */}
          <button
            title="Light mode"
            onClick={() => setDark(false)}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 40,
              height: 40,
              background: !dark ? 'white' : 'transparent',
              color: !dark ? '#0057FF' : '#9ca3af',
              boxShadow: !dark ? '0 1px 4px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <Sun size={17} />
          </button>
          {/* Moon — dark mode */}
          <button
            title="Dark mode"
            onClick={() => setDark(true)}
            className="flex items-center justify-center rounded-xl transition-all"
            style={{
              width: 40,
              height: 40,
              background: dark ? 'white' : 'transparent',
              color: dark ? '#0057FF' : '#9ca3af',
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

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col overflow-hidden py-4 pr-4 page-swipe-down">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-shrink-0">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
              Welcome, <span style={{ color: '#0057FF' }}>William</span>
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>
          {/* Profile pill */}
          <div
            className="flex items-center gap-3 rounded-full px-4 py-2"
            style={{ background: '#f0f0ee' }}
          >
            <span className="text-[14px] font-semibold text-gray-700">William Dawson</span>
            <div
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0"
              style={{ background: '#d1d5db' }}
            >
              <img
                src="/patient-without-monitor.png"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={e => {
                  (e.currentTarget as HTMLImageElement).style.display = 'none'
                }}
              />
              <span className="text-[11px] font-bold text-gray-500 absolute">WD</span>
            </div>
          </div>
        </div>

        {/* ── Content grid ── */}
        <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">
          {/* ── Left column ── */}
          <div className="flex-1 flex flex-col gap-5 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>

            {/* Quick Summary */}
            <div
              className="card-shadow rounded-3xl bg-white p-5"
              style={{ flexShrink: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[15px] font-semibold text-gray-800">Quick Summary</h2>
                <button
                  className="flex items-center gap-1 text-[13px] font-medium text-gray-500 rounded-lg border border-gray-200 px-3 py-1.5 hover:bg-gray-50 transition-colors"
                >
                  Week <ChevronDown size={13} />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {/* No of Case */}
                <div className="rounded-2xl bg-white border border-gray-100 p-4 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <MountainSparkline color="#8b5cf6" />
                  <p className="text-[12px] text-gray-500 mt-1 mb-1">No of Case</p>
                  <p className="text-[22px] font-bold text-gray-900 leading-tight">85 <span className="text-[16px] font-semibold text-gray-700">Solved</span></p>
                  <p className="text-[10px] text-gray-400 mt-1">Goal : 100 Cases</p>
                  <p className="text-[10px] text-gray-400">Average : 65 Cases</p>
                </div>
                {/* Avg Score */}
                <div className="rounded-2xl bg-white border border-gray-100 p-4 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <MountainSparkline color="#8b5cf6" />
                  <p className="text-[12px] text-gray-500 mt-1 mb-1">Avg. Score</p>
                  <p className="text-[22px] font-bold text-gray-900 leading-tight">88.5<span className="text-[16px] font-semibold text-gray-700">%</span></p>
                  <p className="text-[10px] text-gray-400 mt-1">Goal : 100%</p>
                  <p className="text-[10px] text-gray-400">Average : 78.3%</p>
                </div>
                {/* Activity Time */}
                <div className="rounded-2xl bg-white border border-gray-100 p-4 overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <MountainSparkline color="#8b5cf6" />
                  <p className="text-[12px] text-gray-500 mt-1 mb-1">Activity Time</p>
                  <p className="text-[22px] font-bold text-gray-900 leading-tight">8h <span className="text-[16px] font-semibold text-gray-700">32 mins</span></p>
                  <p className="text-[10px] text-gray-400 mt-1">Goal : 10 hrs</p>
                  <p className="text-[10px] text-gray-400">Average : 7 Hr 20 mins</p>
                </div>
              </div>
            </div>



            {/* Continue where you left off */}
            <div style={{ flexShrink: 0 }}>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1">Continue where you left off</h2>
              <p className="text-[12px] text-gray-400 mb-3">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
              <div
                className="flex items-center gap-4 rounded-2xl px-5 py-4 cursor-pointer transition-all hover:shadow-md"
                style={{ background: '#fef9ec', border: '1.5px solid #fde9ab' }}
                onClick={() => navigate('/simulation')}
              >
                {/* Patient avatar */}
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ background: '#d1d5db' }}
                >
                  <img
                    src="/patient-without-monitor.png"
                    alt="Patient"
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-gray-900">Mr. Will Jacks</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">58 Yr · 82 Kg · Male</p>
                  <p className="text-[12px] text-gray-500 mt-1 leading-snug line-clamp-2">
                    Lorem It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>
                </div>
                {/* Badge + arrow */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span
                    className="text-[11px] font-bold text-white px-3 py-1.5 rounded-full"
                    style={{ background: '#f59e0b' }}
                  >
                    0% Completed
                  </span>
                  <button
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all hover:bg-amber-400 hover:border-amber-400 hover:text-white"
                    style={{ borderColor: '#f59e0b', color: '#f59e0b', background: 'white' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Recommended Case */}
            <div style={{ flexShrink: 0, paddingBottom: 16 }}>
              <h2 className="text-[16px] font-bold text-gray-900 mb-1">Recommended Case</h2>
              <p className="text-[12px] text-gray-400 mb-3">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
              <div
                className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-white cursor-pointer transition-all hover:shadow-md"
                style={{ border: '1.5px solid #f0f0ee', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}
                onClick={() => navigate('/simulation')}
              >
                {/* Patient avatar */}
                <div
                  className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0"
                  style={{ background: '#d1d5db' }}
                >
                  <img
                    src="/patient-happy.png"
                    alt="Patient"
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.currentTarget.style.display = 'none' }}
                  />
                </div>
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-gray-900">Mr. Will Jacks</p>
                  <p className="text-[12px] text-gray-500 mt-0.5">58 Yr · 82 Kg · Male</p>
                  <p className="text-[12px] text-gray-500 mt-1 leading-snug line-clamp-2">
                    Lorem It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.
                  </p>
                </div>
                {/* Start Now button */}
                <div className="flex-shrink-0">
                  <button
                    className="px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all hover:opacity-90"
                    style={{ background: '#0057FF', boxShadow: '0 3px 10px rgba(0,87,255,0.3)' }}
                    onClick={e => { e.stopPropagation(); navigate('/simulation') }}
                  >
                    Start Now
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (Calendar) ── */}
          <div
            className="flex-shrink-0"
            style={{ width: 268, alignSelf: 'flex-start' }}
          >
            <CalendarWidget />
          </div>
        </div>
      </main>
    </div>
  )
}
