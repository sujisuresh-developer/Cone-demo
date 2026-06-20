import { useState, useEffect, useCallback, useRef } from 'react'
import {
  Clock,
  Undo2,
  Info,
} from 'lucide-react'
import VitalsDetailModal, {
  getEcgValue,
  getBpValue,
  getPlethValue,
  getRespValue,
  getTempVal,
} from './VitalsDetailModal'
import { type Vitals, type ScenarioMode } from '../App'

const PLACEHOLDER_VITALS = [
  { label: 'Heart Rate', unit: 'bpm', normal: '60-100' },
  { label: 'Blood Pressure', unit: 'mmHg', normal: '90-120/60-80' },
  { label: 'SpO2', unit: '%', normal: '95-100' },
  { label: 'Resp Rate', unit: '/min', normal: '12-20' },
  { label: 'Temperature', unit: '°C', normal: '36.1-37.2' },
]

function PlaceholderVitalCard({
  label,
  unit,
  normal,
}: {
  label: string
  unit: string
  normal: string
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
      <div className="vital-dots mt-1 h-10 w-full rounded" />
      <p className="mt-0.5 text-right text-[9px] text-gray-400">Normal: {normal}</p>
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
          } else if (vitalIndex === 1) {
            val = getBpValue(tx, vitals.hr)
          } else if (vitalIndex === 2) {
            val = getPlethValue(tx, vitals.hr)
          } else if (vitalIndex === 3) {
            val = getRespValue(tx, vitals.rr)
          } else if (vitalIndex === 4) {
            val = getTempVal(tx)
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
  }, [waveColor, vitalIndex, vitals, scenario])

  return (
    <div className={`rounded-xl border-2 ${border} bg-white px-4 py-2.5`}>
      <div className="flex items-baseline justify-between">
        <span className="text-[12px] font-medium text-gray-600">{label}</span>
        <span className="text-[13px] font-bold text-gray-900">
          {value}{' '}
          <span className="text-[11px] font-normal text-gray-500">{unit}</span>
        </span>
      </div>
      <canvas
        ref={canvasRef}
        className="mt-1.5 h-10 w-full rounded"
        style={{ display: 'block' }}
      />
      <p className={`mt-0.5 text-right text-[9px] font-semibold ${statusColor}`}>
        {status}
      </p>
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
}

export default function RightSidebar({ monitorAttached, secondsLeft, onTickDown, vitals, onHandOff, caseEnded, scenario }: RightSidebarProps) {
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false)

  const dynamicVitals = [
    {
      label: 'Heart Rate',
      value: String(vitals.hr),
      unit: 'bpm',
      status: vitals.hr >= 120 ? 'Severe Tachycardia' : vitals.hr > 100 ? 'Tachycardia' : 'Within Range',
      border: vitals.hr >= 120 ? 'border-red-400' : vitals.hr > 100 ? 'border-yellow-400' : 'border-green-400',
      statusColor: vitals.hr >= 120 ? 'text-red-500' : vitals.hr > 100 ? 'text-yellow-600' : 'text-green-600',
      waveColor: vitals.hr >= 120 ? '#ef4444' : vitals.hr > 100 ? '#eab308' : '#22c55e',
      waveSpeed: vitals.hr >= 120 ? 1.0 : vitals.hr > 100 ? 0.8 : 0.5,
    },
    {
      label: 'Blood Pressure',
      value: vitals.bp,
      unit: 'mmHg',
      status: vitals.bp === '70/40' || vitals.bp === '65/35' ? 'Severe Hypotension' : vitals.bp === '92/58' || vitals.bp === '86/54' ? 'Hypotensive' : vitals.bp === '110/70' ? 'Normal (Stabilized)' : 'Hypertensive',
      border: vitals.bp.startsWith('70') || vitals.bp.startsWith('65') || vitals.bp.startsWith('92') || vitals.bp.startsWith('86') ? 'border-red-400' : vitals.bp === '110/70' ? 'border-green-400' : 'border-yellow-400',
      statusColor: vitals.bp.startsWith('70') || vitals.bp.startsWith('65') || vitals.bp.startsWith('92') || vitals.bp.startsWith('86') ? 'text-red-500' : vitals.bp === '110/70' ? 'text-green-600' : 'text-yellow-600',
      waveColor: vitals.bp.startsWith('70') || vitals.bp.startsWith('65') || vitals.bp.startsWith('92') || vitals.bp.startsWith('86') ? '#ef4444' : vitals.bp === '110/70' ? '#22c55e' : '#eab308',
      waveSpeed: vitals.bp === '110/70' ? 0.45 : 0.6,
    },
    {
      label: 'SpO2',
      value: String(vitals.spo2),
      unit: '%',
      status: vitals.spo2 >= 95 ? 'Normal Saturation' : vitals.spo2 >= 90 ? 'Low Saturation' : 'Severe Hypoxia',
      border: vitals.spo2 >= 95 ? 'border-green-400' : vitals.spo2 >= 90 ? 'border-orange-400' : 'border-red-400',
      statusColor: vitals.spo2 >= 95 ? 'text-green-600' : vitals.spo2 >= 90 ? 'text-orange-500' : 'text-red-500',
      waveColor: vitals.spo2 >= 95 ? '#22c55e' : vitals.spo2 >= 90 ? '#f97316' : '#ef4444',
      waveSpeed: vitals.spo2 >= 95 ? 0.4 : 0.6,
    },
    {
      label: 'Resp Rate',
      value: String(vitals.rr),
      unit: '/min',
      status: vitals.rr >= 30 ? 'Severe Tachypnea' : vitals.rr > 20 ? 'Tachypneic' : 'Within Range',
      border: vitals.rr >= 30 ? 'border-red-400' : vitals.rr > 20 ? 'border-orange-400' : 'border-green-400',
      statusColor: vitals.rr >= 30 ? 'text-red-500' : vitals.rr > 20 ? 'text-orange-500' : 'text-green-600',
      waveColor: vitals.rr >= 30 ? '#ef4444' : vitals.rr > 20 ? '#f97316' : '#22c55e',
      waveSpeed: vitals.rr >= 30 ? 0.7 : vitals.rr > 20 ? 0.55 : 0.35,
    },
    {
      label: 'Temperature',
      value: String(vitals.temp),
      unit: '°C',
      status: 'Within Range',
      border: 'border-green-400',
      statusColor: 'text-green-600',
      waveColor: '#22c55e',
      waveSpeed: 0.25,
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
            onClick={() => setVitalsModalOpen(true)}
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
          <Info className="h-4 w-4 text-gray-400" />
        </div>
        <button
          type="button"
          onClick={onHandOff}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          <Undo2 className="h-4 w-4" strokeWidth={2} />
          Hand-off
        </button>
      </div>

      {/* Vitals Detail Modal */}
      <VitalsDetailModal
        open={vitalsModalOpen}
        onClose={() => setVitalsModalOpen(false)}
        vitals={vitals}
        scenario={scenario}
      />
    </aside>
  )
}
