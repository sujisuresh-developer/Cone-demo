import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Bandage,
  UserCheck,
  Settings,
  Sun,
  Moon,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Clock,
  SkipForward,
} from 'lucide-react'

// ─── Questions Data ─────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    text: 'A 72-year-old man presents with sudden severe chest pain radiating to the back. Blood pressure is higher in the right arm than the left. Chest X-ray shows a widened mediastinum.',
    options: [
      'A. Acute myocardial infarction',
      'B. Pulmonary embolism',
      'C. Aortic dissection',
      'D. Pericarditis',
    ],
    correct: 2,
  },
  {
    id: 2,
    text: 'A 45-year-old woman presents with sudden onset pleuritic chest pain and dyspnea after a long-haul flight. Her O2 saturation is 92%. What is the most likely diagnosis?',
    options: [
      'A. Pneumonia',
      'B. Pulmonary embolism',
      'C. Pneumothorax',
      'D. Costochondritis',
    ],
    correct: 1,
  },
  {
    id: 3,
    text: 'A 60-year-old man with a history of smoking presents with progressive dyspnea and wheezing. Spirometry shows FEV1/FVC ratio < 0.7 that does not fully reverse with bronchodilators. What is the diagnosis?',
    options: [
      'A. Asthma',
      'B. Pulmonary fibrosis',
      'C. COPD',
      'D. Bronchiectasis',
    ],
    correct: 2,
  },
  {
    id: 4,
    text: 'A 25-year-old man collapses during exercise. ECG reveals a delta wave with a short PR interval. What is the most likely underlying condition?',
    options: [
      'A. Long QT syndrome',
      'B. Wolff-Parkinson-White (WPW) syndrome',
      'C. Brugada syndrome',
      'D. Hypertrophic cardiomyopathy',
    ],
    correct: 1,
  },
  {
    id: 5,
    text: 'A 55-year-old woman presents with fatigue, weight gain, and cold intolerance. TSH is markedly elevated and free T4 is low. What is the first-line treatment?',
    options: [
      'A. Methimazole',
      'B. Radioactive iodine',
      'C. Levothyroxine',
      'D. Propylthiouracil',
    ],
    correct: 2,
  },
  {
    id: 6,
    text: 'A 30-year-old pregnant woman at 28 weeks develops severe hypertension (165/110 mmHg) and proteinuria. She is at risk of progressing to which complication?',
    options: [
      'A. Gestational diabetes',
      'B. Eclampsia',
      'C. Placenta previa',
      'D. HELLP syndrome only',
    ],
    correct: 1,
  },
  {
    id: 7,
    text: 'A 68-year-old man has new-onset confusion, fever, and neck stiffness. CSF shows high protein, low glucose, and neutrophilic pleocytosis. What is the most likely causative organism?',
    options: [
      'A. Neisseria meningitidis',
      'B. Streptococcus pneumoniae',
      'C. Listeria monocytogenes',
      'D. Haemophilus influenzae',
    ],
    correct: 1,
  },
  {
    id: 8,
    text: 'A 50-year-old man with type 2 diabetes and chronic kidney disease (GFR 28 mL/min) presents for medication review. Which antidiabetic agent is contraindicated?',
    options: [
      'A. Insulin glargine',
      'B. Sitagliptin',
      'C. Metformin',
      'D. Empagliflozin',
    ],
    correct: 2,
  },
  {
    id: 9,
    text: 'A 40-year-old woman has persistent knee pain and X-ray shows joint space narrowing, subchondral sclerosis, and osteophytes. What is the most appropriate initial management?',
    options: [
      'A. Total knee replacement',
      'B. Methotrexate',
      'C. Weight loss, physical therapy, and NSAIDs',
      'D. IV corticosteroids',
    ],
    correct: 2,
  },
  {
    id: 10,
    text: 'A 22-year-old man has a 3-day history of sore throat, fever, and cervical lymphadenopathy. Monospot test is positive. What complication should be specifically counseled about?',
    options: [
      'A. Hepatic abscess',
      'B. Splenic rupture',
      'C. Meningitis',
      'D. Renal failure',
    ],
    correct: 1,
  },
]

const TOTAL_TIME = 10 * 60

// ─── Sidebar Nav ─────────────────────────────────────────────────────────────
const NAV = [
  { Icon: Home, path: '/dashboard', label: 'Dashboard' },
  { Icon: Bandage, path: '/cases', label: 'Simulation' },
  { Icon: UserCheck, path: '/mcq', label: 'MCQ' },
  { Icon: Settings, path: '#', label: 'Settings' },
]

// ─── Hexagon helper ───────────────────────────────────────────────────────────
function hexPoints(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 180) * (60 * i - 30)
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

// ─── Hex Grid Decoration ─────────────────────────────────────────────────────
function HexGrid() {
  const bgHexes = [
    [40, 55], [100, 55], [160, 55], [220, 55], [280, 55],
    [10, 103], [70, 103], [130, 103], [190, 103], [250, 103], [310, 103],
    [40, 151], [100, 151], [160, 151], [220, 151], [280, 151],
  ]
  const featured = [
    { cx: 160, cy: 48 },
    { cx: 118, cy: 103 },
    { cx: 202, cy: 103 },
    { cx: 160, cy: 158 },
  ]
  return (
    <svg width="320" height="200" viewBox="0 0 320 200" fill="none" style={{ maxWidth: '100%' }}>
      {bgHexes.map(([cx, cy], i) => (
        <polygon key={i} points={hexPoints(cx, cy, 26)} fill="#eef2ff" stroke="#dde3f3" strokeWidth="1" />
      ))}
      {featured.map(({ cx, cy }, i) => (
        <g key={`f${i}`}>
          <polygon points={hexPoints(cx, cy, 30)} fill="white" stroke="#2563eb" strokeWidth="2" />
          <line x1={cx - 8} y1={cy} x2={cx + 8} y2={cy} stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
          <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke="#2563eb" strokeWidth="2" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="3" fill="#0ea5e9" />
        </g>
      ))}
      <line x1="160" y1="10" x2="160" y2="48" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="160" y1="78" x2="118" y2="103" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="160" y1="78" x2="202" y2="103" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="118" y1="133" x2="160" y2="158" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
      <line x1="202" y1="133" x2="160" y2="158" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />
    </svg>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MCQPage() {
  const navigate = useNavigate()
  const [dark, setDark] = useState(false)
  const [started, setStarted] = useState(false)
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(QUESTIONS.length).fill(null))
  const [skipped, setSkipped] = useState<boolean[]>(Array(QUESTIONS.length).fill(false))
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME)
  const [sessionEnded, setSessionEnded] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (started && !sessionEnded) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            clearInterval(timerRef.current!)
            setSessionEnded(true)
            return 0
          }
          return t - 1
        })
      }, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [started, sessionEnded])

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const answered = answers.filter(a => a !== null).length
  const progressPct = Math.round((answered / QUESTIONS.length) * 100)

  const handleSelect = (optIdx: number) => {
    if (sessionEnded) return
    setAnswers(prev => {
      const next = [...prev]
      next[currentQ] = optIdx
      return next
    })
    setSkipped(prev => {
      const next = [...prev]
      next[currentQ] = false
      return next
    })
  }

  const handleSkip = () => {
    if (sessionEnded) return
    setSkipped(prev => {
      const next = [...prev]
      next[currentQ] = true
      return next
    })
    if (currentQ < QUESTIONS.length - 1) setCurrentQ(q => q + 1)
  }

  const handleNext = () => {
    if (currentQ < QUESTIONS.length - 1) setCurrentQ(q => q + 1)
  }

  const handlePrev = () => {
    if (currentQ > 0) setCurrentQ(q => q - 1)
  }

  const handleEndSession = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setSessionEnded(true)
  }

  const q = QUESTIONS[currentQ]
  const timeIsLow = timeLeft < 60

  return (
    <div
      className="flex h-screen w-screen overflow-hidden"
      style={{ background: '#faf9f6', fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Sidebar */}
      <aside
        className="flex flex-col items-center gap-3 py-5 mx-4 my-4 rounded-3xl flex-shrink-0"
        style={{ width: 72, background: '#f0f0ee' }}
      >
        <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center mb-2 flex-shrink-0">
          <div className="w-4 h-4 bg-white rounded-sm" />
        </div>
        <nav className="flex flex-col items-center gap-2 flex-1">
          {NAV.map(({ Icon, path, label }) => {
            const isActive = path === '/mcq'
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
        <div className="flex flex-col items-center rounded-2xl overflow-hidden" style={{ background: '#e4e4e0', padding: 4, gap: 2 }}>
          <button title="Light mode" onClick={() => setDark(false)} className="flex items-center justify-center rounded-xl transition-all" style={{ width: 40, height: 40, background: !dark ? 'white' : 'transparent', color: !dark ? '#0057FF' : '#9ca3af', boxShadow: !dark ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
            <Sun size={17} />
          </button>
          <button title="Dark mode" onClick={() => setDark(true)} className="flex items-center justify-center rounded-xl transition-all" style={{ width: 40, height: 40, background: dark ? 'white' : 'transparent', color: dark ? '#0057FF' : '#9ca3af', boxShadow: dark ? '0 1px 4px rgba(0,0,0,0.12)' : 'none' }}>
            <Moon size={17} />
          </button>
        </div>
        <button title="Logout" onClick={() => navigate('/')} className="flex items-center justify-center rounded-2xl transition-all hover:scale-105" style={{ width: 48, height: 48, background: '#fee2e2', color: '#ef4444' }}>
          <LogOut size={18} />
        </button>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden py-5 pr-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-5 flex-shrink-0">
          <div>
            <h1 className="text-[28px] font-bold text-gray-900 leading-tight">
              <span style={{ color: '#0057FF' }}>MCQ</span> Mock Questions
            </h1>
            <p className="text-[13px] text-gray-400 mt-0.5">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-full px-4 py-2" style={{ background: '#f0f0ee' }}>
            <span className="text-[14px] font-semibold text-gray-700">William Dawson</span>
            <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 bg-gray-300">
              <img
                src="/patient-without-monitor.png"
                alt="Profile"
                className="w-full h-full object-cover"
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {!started ? (
          /* Get Started Modal */
          <div className="flex-1 flex items-center justify-center">
            <div
              className="flex flex-col items-center text-center rounded-3xl p-10 shadow-2xl w-full"
              style={{
                background: 'linear-gradient(145deg, #f8faff 0%, #eef2ff 50%, #f0f7ff 100%)',
                border: '1px solid #e2e8f4',
                maxWidth: 560,
              }}
            >
              <HexGrid />
              <h2 className="mt-3 text-[32px] font-bold text-gray-900 leading-tight">
                <span style={{ color: '#0057FF' }}>MCQ</span> Mock Questions
              </h2>
              <p className="text-[14px] text-gray-500 mt-2 mb-8 max-w-sm">
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </p>
              <button
                id="mcq-get-started-btn"
                onClick={() => setStarted(true)}
                className="px-14 py-3.5 rounded-2xl text-[16px] font-bold text-white transition-all hover:opacity-90 hover:scale-105 active:scale-95"
                style={{ background: '#0057FF', boxShadow: '0 6px 20px rgba(0,87,255,0.35)' }}
              >
                Get Started
              </button>
            </div>
          </div>
        ) : sessionEnded ? (
          /* Session Summary */
          <div className="flex-1 flex items-center justify-center">
            <div
              className="rounded-3xl p-10 text-center shadow-xl w-full"
              style={{ background: 'white', border: '1px solid #e2e8f4', maxWidth: 480 }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: '#eff6ff' }}>
                <UserCheck size={32} color="#0057FF" />
              </div>
              <h2 className="text-[24px] font-bold text-gray-900 mb-1">Session Complete!</h2>
              <p className="text-[13px] text-gray-400 mb-6">Here is how you did in this session.</p>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl p-4" style={{ background: '#f0f7ff' }}>
                  <p className="text-[26px] font-bold" style={{ color: '#0057FF' }}>
                    {answers.filter(a => a !== null).length}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Answered</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#f0fdf4' }}>
                  <p className="text-[26px] font-bold text-green-600">
                    {answers.filter((a, i) => a === QUESTIONS[i].correct).length}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Correct</p>
                </div>
                <div className="rounded-2xl p-4" style={{ background: '#fef2f2' }}>
                  <p className="text-[26px] font-bold text-red-500">
                    {skipped.filter(Boolean).length}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Skipped</p>
                </div>
              </div>
              <p className="text-[13px] text-gray-500 mb-6">
                Score: <span className="font-bold text-gray-800">{answers.filter((a, i) => a === QUESTIONS[i].correct).length} / {QUESTIONS.length}</span>
              </p>
              <button
                onClick={() => {
                  setStarted(false); setSessionEnded(false); setCurrentQ(0)
                  setAnswers(Array(QUESTIONS.length).fill(null))
                  setSkipped(Array(QUESTIONS.length).fill(false))
                  setTimeLeft(TOTAL_TIME)
                }}
                className="w-full py-3 rounded-2xl text-[14px] font-bold text-white transition-all hover:opacity-90"
                style={{ background: '#0057FF', boxShadow: '0 4px 14px rgba(0,87,255,0.3)' }}
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full mt-3 py-3 rounded-2xl text-[14px] font-semibold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          /* MCQ Session */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Progress bar row */}
            <div
              className="flex items-center gap-4 rounded-2xl px-5 py-3 mb-4 flex-shrink-0"
              style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0ee' }}
            >
              <div className="flex flex-col flex-shrink-0">
                <span className="text-[13px] font-semibold text-gray-800">MCQ Mock Tests</span>
                <span className="text-[11px] text-gray-400">Session 1</span>
              </div>
              <div className="flex-1 relative">
                <div className="w-full h-2 rounded-full bg-gray-200 relative overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%`, background: 'linear-gradient(90deg, #0057FF, #38bdf8)' }}
                  />
                </div>
                <div className="absolute top-0 bottom-0 flex items-center justify-between w-full pointer-events-none">
                  {QUESTIONS.map((_, i) => {
                    const isAnswered = answers[i] !== null
                    const isCurrent = i === currentQ
                    return (
                      <button
                        key={i}
                        onClick={() => setCurrentQ(i)}
                        className="pointer-events-auto transition-transform hover:scale-125 focus:outline-none"
                        style={{
                          width: isCurrent ? 14 : 10,
                          height: isCurrent ? 14 : 10,
                          borderRadius: '50%',
                          background: isCurrent ? '#0057FF' : isAnswered ? '#38bdf8' : '#d1d5db',
                          border: isCurrent ? '2.5px solid white' : 'none',
                          boxShadow: isCurrent ? '0 0 0 2px #0057FF' : 'none',
                          cursor: 'pointer',
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      />
                    )
                  })}
                </div>
                <p className="text-[12px] font-bold mt-1" style={{ color: '#0057FF' }}>{progressPct}%</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1.5 rounded-full text-[11px] font-semibold border" style={{ borderColor: '#0057FF', color: '#0057FF' }}>
                  Critical thinking
                </span>
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                  style={{ background: timeIsLow ? '#fef2f2' : '#fff8f8', color: '#e53935', border: '1px solid #fca5a5' }}
                >
                  <Clock size={12} />
                  <div className="flex flex-col leading-none">
                    <span className="text-[12px] font-bold">{formatTime(timeLeft)} mins</span>
                    <span className="text-[9px] font-normal">Time left</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Question + options */}
            <div className="flex-1 flex flex-col overflow-y-auto gap-3 pb-2" style={{ scrollbarWidth: 'none' }}>
              <div
                className="rounded-3xl p-6 flex-shrink-0"
                style={{ background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #f0f0ee' }}
              >
                <p className="text-[12px] font-medium text-gray-400 mb-2">Question {q.id}</p>
                <p className="text-[15px] text-gray-800 leading-relaxed">{q.text}</p>
              </div>
              {q.options.map((opt, i) => {
                const isSelected = answers[currentQ] === i
                return (
                  <button
                    key={i}
                    id={`mcq-option-${i}`}
                    onClick={() => handleSelect(i)}
                    className="flex items-center justify-between rounded-2xl px-5 py-4 text-left transition-all w-full flex-shrink-0 hover:shadow-md"
                    style={{
                      background: isSelected ? '#eff6ff' : 'white',
                      border: isSelected ? '2px solid #0057FF' : '1.5px solid #f0f0ee',
                      boxShadow: isSelected ? '0 4px 14px rgba(0,87,255,0.1)' : '0 1px 4px rgba(0,0,0,0.04)',
                      transform: isSelected ? 'scale(1.005)' : 'scale(1)',
                    }}
                  >
                    <span className="text-[14px] font-medium" style={{ color: isSelected ? '#0057FF' : '#374151' }}>
                      {opt}
                    </span>
                    <div
                      className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ml-4 transition-all"
                      style={{ borderColor: isSelected ? '#0057FF' : '#d1d5db', background: isSelected ? '#0057FF' : 'transparent' }}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-4 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button
                  id="mcq-prev-btn"
                  onClick={handlePrev}
                  disabled={currentQ === 0}
                  className="w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ borderColor: '#d1d5db' }}
                >
                  <ChevronLeft size={18} className="text-gray-500" />
                </button>
                <button
                  id="mcq-next-btn"
                  onClick={handleNext}
                  disabled={currentQ === QUESTIONS.length - 1}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 text-[14px] font-semibold transition-all hover:bg-blue-50 disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ borderColor: '#0057FF', color: '#0057FF' }}
                >
                  Next <ChevronRight size={16} />
                </button>
                <button
                  id="mcq-skip-btn"
                  onClick={handleSkip}
                  disabled={currentQ === QUESTIONS.length - 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-medium text-gray-400 border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <SkipForward size={14} /> Skip
                </button>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-gray-400">{currentQ + 1} / {QUESTIONS.length}</span>
                <button
                  id="mcq-end-session-btn"
                  onClick={handleEndSession}
                  className="px-6 py-3 rounded-2xl text-[14px] font-bold text-white transition-all hover:opacity-90 active:scale-95"
                  style={{ background: '#0057FF', boxShadow: '0 4px 14px rgba(0,87,255,0.3)' }}
                >
                  End Session
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
