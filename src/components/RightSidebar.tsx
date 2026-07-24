import { useEffect, useCallback, useRef, useState } from 'react'
import {
  Clock,
  Undo2,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react'
import VitalsDetailModal, {
  getEcgValue,
  getPlethValue,
  getRespValue,
} from './VitalsDetailModal'
import { type Vitals, type ScenarioMode } from '../App'

// Pneumothorax is a respiratory/hemodynamic presentation — Temperature never moves meaningfully
// across any state in this case (36.6-37.4 throughout, arrival through death) and isn't part of
// the clinical picture being taught here, so it's deliberately left off this list.
const PLACEHOLDER_VITALS = [
  { label: 'Heart Rate', unit: 'bpm', normal: '60-100', showTrend: true },
  { label: 'Blood Pressure', unit: 'mmHg', normal: '90-120/60-80', showTrend: false },
  { label: 'SpO2', unit: '%', normal: '95-100', showTrend: true },
  { label: 'Resp Rate', unit: '/min', normal: '12-20', showTrend: true },
]

function PlaceholderVitalCard({
  label,
  unit,
  normal,
  showTrend,
}: {
  label: string
  unit: string
  normal: string
  showTrend: boolean
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-gray-500">{label}</span>
        <span className="text-[13px] font-semibold text-gray-800">
          ---{' '}
          <span className="text-[11px] font-normal text-gray-400">{unit}</span>
        </span>
      </div>
      {showTrend && <div className="vital-dots mt-1 h-10 w-full rounded" />}
      <p className={`${showTrend ? 'mt-0.5' : 'mt-2'} text-right text-[9px] text-gray-400`}>Normal: {normal}</p>
    </div>
  )
}

/* Mini-waveform canvas card */
function LiveVitalCard({
  label,
  value,
  unit,
  status,
  border,
  statusColor,
  waveColor,
  vitalIndex,
  vitals,
  scenario,
  showTrend = true,
}: {
  label: string
  value: string
  unit: string
  status: string
  border: string
  statusColor: string
  waveColor: string
  vitalIndex: number
  vitals: Vitals
  scenario?: ScenarioMode
  showTrend?: boolean
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef(0)
  const stateRef = useRef<{
    yPoints: number[]
    lastTime: number
  }>({
    yPoints: [],
    lastTime: 0,
  })

  useEffect(() => {
    if (!showTrend) return
    const canvas = canvasRef.current
    if (!canvas) return

    const sweepDuration = 6.0 // 6 seconds per sweep

    const draw = () => {
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dpr = window.devicePixelRatio || 1
      const w = Math.floor(canvas.clientWidth)
      const h = Math.floor(canvas.clientHeight)
      if (w === 0 || h === 0) {
        animRef.current = requestAnimationFrame(draw)
        return
      }

      const targetW = Math.round(w * dpr)
      const targetH = Math.round(h * dpr)
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW
        canvas.height = targetH
        stateRef.current.yPoints = new Array(w).fill(vitalIndex === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
      }

      let yPoints = stateRef.current.yPoints
      if (yPoints.length !== w) {
        yPoints = new Array(w).fill(vitalIndex === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
        stateRef.current.yPoints = yPoints
      }

      const now = performance.now() / 1000
      const state = stateRef.current
      if (state.lastTime === 0) {
        state.lastTime = now
      }

      let dt = now - state.lastTime
      if (dt > 1.0) dt = 1.0
      const prevTime = state.lastTime
      state.lastTime = now

      // Calculate sweep positions
      const prevTimeInSweep = prevTime % sweepDuration
      const timeInSweep = now % sweepDuration

      const prevX = Math.floor((prevTimeInSweep / sweepDuration) * w) % w
      const currentX = Math.floor((timeInSweep / sweepDuration) * w) % w

      const stepsToUpdate = (currentX - prevX + w) % w

      if (stepsToUpdate > 0) {
        for (let step = 0; step <= stepsToUpdate; step++) {
          const currIdx = (prevX + step) % w
          let tx = Math.floor(now / sweepDuration) * sweepDuration + (currIdx / w) * sweepDuration
          if (tx > now) {
            tx -= sweepDuration
          }

          let val = 0
          if (vitalIndex === 0) {
            val = getEcgValue(tx, vitals.hr, scenario)
          } else if (vitalIndex === 2) {
            val = getPlethValue(tx, vitals.hr)
          } else if (vitalIndex === 3) {
            val = getRespValue(tx, vitals.rr)
          }
          yPoints[currIdx] = val
        }
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, w, h)

      const pad = 3
      const drawH = h - pad * 2

      // Draw trace line
      ctx.beginPath()
      let first = true
      const gapWidth = 15 // smaller gap for small cards

      for (let x = 0; x < w; x++) {
        const inGap = (currentX < (currentX + gapWidth) % w)
          ? (x >= currentX && x < (currentX + gapWidth))
          : (x >= currentX || x < (currentX + gapWidth) % w)

        if (inGap) {
          first = true
          continue
        }

        const val = yPoints[x] !== undefined ? yPoints[x] : (vitalIndex === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
        const y = pad + drawH * (1 - val)

        if (first) {
          ctx.moveTo(x, y)
          first = false
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.strokeStyle = waveColor
      ctx.lineWidth = 1.5
      ctx.lineJoin = 'round'
      ctx.stroke()

      // Draw a small bright indicator dot at the sweep head
      const headVal = yPoints[currentX] !== undefined ? yPoints[currentX] : (vitalIndex === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
      const headY = pad + drawH * (1 - headVal)
      ctx.beginPath()
      ctx.arc(currentX, headY, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = waveColor
      ctx.fill()

      animRef.current = requestAnimationFrame(draw)
    }

    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [showTrend, waveColor, vitalIndex, vitals, scenario])

  return (
    <div className={`rounded-xl border-2 ${border} bg-white px-4 py-2.5`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-gray-600">{label}</span>
        <span className="text-[13px] font-bold text-gray-900">
          {value}{' '}
          <span className="text-[11px] font-normal text-gray-500">{unit}</span>
        </span>
      </div>
      {showTrend && (
        <canvas
          ref={canvasRef}
          className="mt-1.5 h-10 w-full rounded"
          style={{ display: 'block' }}
        />
      )}
      <p className={`${showTrend ? 'mt-0.5' : 'mt-2'} text-right text-[9px] font-semibold ${statusColor}`}>
        {status}
      </p>
    </div>
  )
}

function HandoffConfirmModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
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
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className={`reports-modal-overlay ${isVisible ? 'reports-modal-visible' : ''}`}
      style={{ zIndex: 10000 }}
      onClick={onCancel}
    >
      <div
        className={`reports-modal-content ${
          isVisible ? 'reports-modal-content-visible' : ''
        } !w-[380px] !max-w-[92vw] !p-6 flex flex-col items-center text-center`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className="reports-close-btn" onClick={onCancel} type="button">
          <X size={16} />
        </button>

        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-6 w-6 text-amber-500" strokeWidth={2} />
        </div>

        <h2 className="mt-3.5 text-[16px] font-bold text-gray-900">Confirm Hand-off?</h2>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-gray-500">
          This ends your active management of the case and passes the patient to the next
          clinician. You won't be able to perform further actions afterward — make sure your
          workup is complete.
        </p>

        <div className="mt-5 flex w-full gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-[13px] font-semibold text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover cursor-pointer"
          >
            <Undo2 className="h-3.5 w-3.5" strokeWidth={2} />
            Confirm Hand-off
          </button>
        </div>
      </div>
    </div>
  )
}

type RightSidebarProps = {
  monitorAttached?: boolean
  secondsLeft: number
  onTickDown: React.Dispatch<React.SetStateAction<number>>
  vitals: Vitals
  onHandOff: () => void
  caseEnded: boolean
  scenario: ScenarioMode
  vitalsModalOpen: boolean
  onVitalsModalOpenChange: (open: boolean) => void
}

export default function RightSidebar({
  monitorAttached,
  secondsLeft,
  onTickDown,
  vitals,
  onHandOff,
  caseEnded,
  scenario,
  vitalsModalOpen,
  onVitalsModalOpenChange,
}: RightSidebarProps) {

  const [handoffInfoOpen, setHandoffInfoOpen] = useState(false)
  const [handoffConfirmOpen, setHandoffConfirmOpen] = useState(false)

  // Baseline reveal: the moment the monitor is attached, show 0s for 2s before
  // jumping to the patient's actual starting vitals — mimics a monitor booting up.
  const [showBaseline, setShowBaseline] = useState(false)

  useEffect(() => {
    if (!monitorAttached) {
      setShowBaseline(false)
      return
    }
    setShowBaseline(false)
    const t = setTimeout(() => setShowBaseline(true), 2000)
    return () => clearTimeout(t)
  }, [monitorAttached])

  const dynamicVitals = [
    {
      label: 'Heart Rate',
      value: showBaseline ? String(vitals.hr) : '0',
      unit: 'bpm',
      status: vitals.hr >= 120 ? 'Severe Tachycardia' : vitals.hr > 100 ? 'Tachycardia' : 'Within Range',
      border: vitals.hr >= 120 ? 'border-red-400' : vitals.hr > 100 ? 'border-yellow-400' : 'border-green-400',
      statusColor: vitals.hr >= 120 ? 'text-red-500' : vitals.hr > 100 ? 'text-yellow-600' : 'text-green-600',
      waveColor: vitals.hr >= 120 ? '#ef4444' : vitals.hr > 100 ? '#eab308' : '#22c55e',
      waveSpeed: vitals.hr >= 120 ? 1.0 : vitals.hr > 100 ? 0.8 : 0.5,
    },
    {
      label: 'Blood Pressure',
      value: showBaseline ? vitals.bp : '0/0',
      unit: 'mmHg',
      status: vitals.bp === '70/40' || vitals.bp === '65/35' ? 'Severe Hypotension' : vitals.bp === '92/58' || vitals.bp === '86/54' ? 'Hypotensive' : vitals.bp === '110/70' ? 'Normal (Stabilized)' : 'Hypertensive',
      border: vitals.bp.startsWith('70') || vitals.bp.startsWith('65') || vitals.bp.startsWith('92') || vitals.bp.startsWith('86') ? 'border-red-400' : vitals.bp === '110/70' ? 'border-green-400' : 'border-yellow-400',
      statusColor: vitals.bp.startsWith('70') || vitals.bp.startsWith('65') || vitals.bp.startsWith('92') || vitals.bp.startsWith('86') ? 'text-red-500' : vitals.bp === '110/70' ? 'text-green-600' : 'text-yellow-600',
      waveColor: vitals.bp.startsWith('70') || vitals.bp.startsWith('65') || vitals.bp.startsWith('92') || vitals.bp.startsWith('86') ? '#ef4444' : vitals.bp === '110/70' ? '#22c55e' : '#eab308',
      waveSpeed: vitals.bp === '110/70' ? 0.45 : 0.6,
      showTrend: false,
    },
    {
      label: 'SpO2',
      value: showBaseline ? String(vitals.spo2) : '0',
      unit: '%',
      status: vitals.spo2 >= 95 ? 'Normal Saturation' : vitals.spo2 >= 90 ? 'Low Saturation' : 'Severe Hypoxia',
      border: vitals.spo2 >= 95 ? 'border-green-400' : vitals.spo2 >= 90 ? 'border-orange-400' : 'border-red-400',
      statusColor: vitals.spo2 >= 95 ? 'text-green-600' : vitals.spo2 >= 90 ? 'text-orange-500' : 'text-red-500',
      waveColor: vitals.spo2 >= 95 ? '#22c55e' : vitals.spo2 >= 90 ? '#f97316' : '#ef4444',
      waveSpeed: vitals.spo2 >= 95 ? 0.4 : 0.6,
    },
    {
      label: 'Resp Rate',
      value: showBaseline ? String(vitals.rr) : '0',
      unit: '/min',
      status: vitals.rr >= 30 ? 'Severe Tachypnea' : vitals.rr > 20 ? 'Tachypneic' : 'Within Range',
      border: vitals.rr >= 30 ? 'border-red-400' : vitals.rr > 20 ? 'border-orange-400' : 'border-green-400',
      statusColor: vitals.rr >= 30 ? 'text-red-500' : vitals.rr > 20 ? 'text-orange-500' : 'text-green-600',
      waveColor: vitals.rr >= 30 ? '#ef4444' : vitals.rr > 20 ? '#f97316' : '#22c55e',
      waveSpeed: vitals.rr >= 30 ? 0.7 : vitals.rr > 20 ? 0.55 : 0.35,
    },
  ]

  useEffect(() => {
    if (secondsLeft <= 0 || caseEnded) return
    const id = setInterval(() => onTickDown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(id)
  }, [secondsLeft, onTickDown, caseEnded])

  const formatTime = useCallback((s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }, [])

  return (
    <aside className="flex h-full flex-col gap-4 overflow-hidden">
      {/* Time Remaining */}
      <div className="card-shadow shrink-0 rounded-3xl bg-white px-5 py-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2">
          <Clock className="h-4 w-4 text-timer" strokeWidth={2} />
          <span className="text-[17px] font-bold text-timer">
            {formatTime(secondsLeft)}
          </span>
        </div>
      </div>

      {/* Case Progress commented out
      <div className="card-shadow shrink-0 rounded-3xl bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[15px] font-semibold text-gray-800">Case Progress</span>
          <span className="text-[15px] font-bold text-gray-800">
            0%
          </span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: '0%' }}
          />
        </div>
        <div className="relative mt-7 px-1">
          <div className="absolute top-1/2 right-6 left-6 h-px -translate-y-1/2 bg-gray-200" />
          <div className="relative flex justify-between">
            {[Heart, Hand, Pencil, ClipboardList].map(
              (Icon, i) => (
                <div
                  key={i}
                  className="flex h-9 w-9 items-center justify-center rounded-full border bg-white border-gray-200 text-gray-400"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </div>
              )
            )}
          </div>
        </div>
      </div>
      */}

      {/* Live Vitals */}
      <div className="card-shadow flex min-h-0 flex-1 flex-col rounded-3xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-800">Live Vitals</h2>
          <button
            type="button"
            onClick={() => onVitalsModalOpenChange(true)}
            className="rounded-full p-1 transition-colors hover:bg-gray-100"
          >
            <Info className="h-4 w-4 text-gray-400" />
          </button>
        </div>
        <div className="space-y-1.5 overflow-y-auto action-scroll">
          {monitorAttached
            ? dynamicVitals.map((vital, i) => <LiveVitalCard key={vital.label} {...vital} vitalIndex={i} vitals={vitals} />)
            : PLACEHOLDER_VITALS.map((vital) => (
                <PlaceholderVitalCard key={vital.label} {...vital} />
              ))}
        </div>
      </div>

      {/* Hand-off */}
      <div className="card-shadow shrink-0 rounded-3xl bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-gray-800">Hand-Off</h2>
          <div
            className="relative"
            onMouseEnter={() => setHandoffInfoOpen(true)}
            onMouseLeave={() => setHandoffInfoOpen(false)}
          >
            <button
              type="button"
              onClick={() => setHandoffInfoOpen((v) => !v)}
              className="rounded-full p-1 transition-colors hover:bg-gray-100 cursor-pointer"
            >
              <Info className="h-4 w-4 text-gray-400" />
            </button>
            <div
              role="tooltip"
              className={`pointer-events-none absolute right-0 top-full z-10 mt-1.5 w-52 rounded-lg bg-gray-900 px-2.5 py-2 text-[10.5px] font-medium leading-snug text-white shadow-lg transition-all duration-150 ${
                handoffInfoOpen ? 'opacity-100 translate-y-0' : 'invisible opacity-0 -translate-y-1'
              }`}
            >
              Ends your active management of the case and passes the patient to the next
              clinician, closing out the simulation.
              <div className="absolute bottom-full right-3 h-2 w-2 translate-y-1/2 rotate-45 bg-gray-900" />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setHandoffConfirmOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover cursor-pointer"
        >
          <Undo2 className="h-4 w-4" strokeWidth={2} />
          Hand-off
        </button>
      </div>

      {/* Vitals Detail Modal */}
      <VitalsDetailModal
        open={vitalsModalOpen}
        onClose={() => onVitalsModalOpenChange(false)}
        vitals={vitals}
        scenario={scenario}
      />

      {/* Hand-off confirmation */}
      <HandoffConfirmModal
        open={handoffConfirmOpen}
        onCancel={() => setHandoffConfirmOpen(false)}
        onConfirm={() => {
          setHandoffConfirmOpen(false)
          onHandOff()
        }}
      />
    </aside>
  )
}
