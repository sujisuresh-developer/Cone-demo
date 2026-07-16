import { useEffect, useRef, useState } from 'react'
import { X, Activity } from 'lucide-react'
import { type Vitals, type ScenarioMode } from '../App'
import { PATIENT } from '../simulation/pneumothoraxCase'

/* ───────── mathematical waveform generators ───────── */

export function getEcgValue(t: number, hr: number, scenario?: ScenarioMode): number {
  const T = 60 / hr
  const tBeat = t % T
  const Tactive = Math.min(0.55, T)
  
  if (tBeat >= Tactive) {
    return (0.0 + 0.22) / 1.22
  }
  
  const p = tBeat / Tactive
  let v = 0
  
  if (p < 0.08) {
    v = 0
  } else if (p < 0.18) {
    v = 0.12 * Math.sin(Math.PI * (p - 0.08) / 0.10)
  } else if (p < 0.22) {
    v = 0
  } else if (p < 0.24) {
    v = -0.08 * ((p - 0.22) / 0.02)
  } else if (p < 0.265) {
    v = -0.08 + 1.08 * ((p - 0.24) / 0.025)
  } else if (p < 0.29) {
    v = 1.0 - 1.22 * ((p - 0.265) / 0.025)
  } else if (p < 0.325) {
    v = -0.22 + 0.22 * ((p - 0.29) / 0.035)
  } else if (p < 0.375) {
    v = 0
  } else if (p < 0.525) {
    v = 0.25 * Math.sin(Math.PI * (p - 0.375) / 0.150)
  } else if (p < 0.58) {
    v = 0
  } else if (p < 0.63) {
    v = 0.015 * Math.sin(Math.PI * (p - 0.58) / 0.05)
  } else {
    v = 0
  }

  // Inject ST-segment elevation for STEMI
  if (scenario === 'stemi' && p >= 0.29 && p < 0.525) {
    const stOffset = 0.35
    const elevation = stOffset * Math.sin(Math.PI * (p - 0.29) / (0.525 - 0.29))
    v += elevation
  }
  
  return (v + 0.22) / 1.22
}

export function getBpValue(t: number, hr: number): number {
  const T = 60 / hr
  const Tactive = Math.min(0.55, T)
  const delay = 0.12
  const tBp = (t - delay + T * 2) % T
  
  if (tBp >= Tactive) {
    return 0.0
  }
  
  const p = tBp / Tactive
  let v = 0
  if (p < 0.10) {
    v = Math.sin((Math.PI / 2) * (p / 0.10))
  } else if (p < 0.30) {
    const frac = (p - 0.10) / 0.20
    v = 1.0 - 0.40 * Math.sin((Math.PI / 2) * frac)
  } else if (p < 0.34) {
    const frac = (p - 0.30) / 0.04
    v = 0.60 - 0.05 * Math.sin((Math.PI / 2) * frac)
  } else if (p < 0.40) {
    const frac = (p - 0.34) / 0.06
    v = 0.55 + 0.11 * Math.sin(Math.PI * frac)
  } else {
    const frac = (p - 0.40) / (1.0 - 0.40)
    v = 0.55 * Math.cos((Math.PI / 2) * frac)
  }
  return v
}

export function getPlethValue(t: number, hr: number): number {
  const T = 60 / hr
  const Tactive = Math.min(0.60, T)
  const delay = 0.20
  const tPleth = (t - delay + T * 2) % T
  
  if (tPleth >= Tactive) {
    return 0.0
  }
  
  const p = tPleth / Tactive
  let v = 0
  if (p < 0.18) {
    const s = Math.sin((Math.PI / 2) * (p / 0.18))
    v = s * s
  } else if (p < 0.40) {
    const frac = (p - 0.18) / 0.22
    v = 1.0 - 0.45 * Math.sin((Math.PI / 2) * frac)
  } else if (p < 0.48) {
    const frac = (p - 0.40) / 0.08
    v = 0.55 - 0.03 * Math.sin(Math.PI * frac)
  } else {
    const frac = (p - 0.48) / (1.0 - 0.48)
    v = 0.55 * Math.cos((Math.PI / 2) * frac)
  }
  return v
}

export function getRespValue(t: number, rr: number): number {
  const T = 60 / rr
  const tResp = t % T
  const p = tResp / T
  
  let v = 0
  if (p < 0.35) {
    const s = Math.sin((Math.PI / 2) * (p / 0.35))
    v = s * s
  } else if (p < 0.80) {
    const frac = (p - 0.35) / 0.45
    v = Math.cos((Math.PI / 2) * frac)
  } else {
    v = 0
  }
  return v
}

/* ───────── types ───────── */

interface WaveformConfig {
  label: string
  color: string
  lineWidth: number
  glowColor: string
}

const WAVEFORMS: WaveformConfig[] = [
  {
    label: 'ECG - Lead II',
    color: '#22c55e',
    lineWidth: 2.5,
    glowColor: 'rgba(34, 197, 94, 0.3)',
  },
  {
    label: 'ABP',
    color: '#ef4444',
    lineWidth: 2,
    glowColor: 'rgba(239, 68, 68, 0.3)',
  },
  {
    label: 'Pleth / SpO₂',
    color: '#2563eb',
    lineWidth: 2,
    glowColor: 'rgba(37, 99, 235, 0.3)',
  },
  {
    label: 'Resp',
    color: '#ca8a04',
    lineWidth: 2,
    glowColor: 'rgba(202, 138, 4, 0.3)',
  },
]

type Props = {
  open: boolean
  onClose: () => void
  vitals: Vitals
  scenario: ScenarioMode
}

export default function VitalsDetailModal({ open, onClose, vitals, scenario }: Props) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null])
  const animRef = useRef<number>(0)
  const [isVisible, setIsVisible] = useState(false)

  // Persistent waveform buffers and timeline tracker
  const sweepStateRef = useRef<{
    yPoints: number[][]
    lastTime: number
    currentHr: number
    currentRr: number
    currentSpo2: number
    currentBpSys: number
    currentBpDia: number
  }>({
    yPoints: [[], [], [], []],
    lastTime: 0,
    currentHr: 0,
    currentRr: 0,
    currentSpo2: 0,
    currentBpSys: 0,
    currentBpDia: 0,
  })

  // Animate in overlay
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [open])

  // Animation Loop
  useEffect(() => {
    if (!open) return

    const sweepDuration = 6.0 // 6 seconds per sweep

    const animate = () => {
      const now = performance.now() / 1000
      const state = sweepStateRef.current

      if (state.lastTime === 0) {
        state.lastTime = now
        state.currentHr = vitals.hr
        state.currentRr = vitals.rr
        state.currentSpo2 = vitals.spo2
        const [sys, dia] = vitals.bp.split('/').map(Number)
        state.currentBpSys = sys || 120
        state.currentBpDia = dia || 80
      }

      let dt = now - state.lastTime
      if (dt > 1.0) dt = 1.0 // cap lag spike
      const prevTime = state.lastTime
      state.lastTime = now

      // Smoothly interpolate towards the target vitals
      const lerpFactor = 1.5 * dt
      state.currentHr += (vitals.hr - state.currentHr) * lerpFactor
      state.currentRr += (vitals.rr - state.currentRr) * lerpFactor
      state.currentSpo2 += (vitals.spo2 - state.currentSpo2) * lerpFactor
      const [targetSys, targetDia] = vitals.bp.split('/').map(Number)
      state.currentBpSys += ((targetSys || 120) - state.currentBpSys) * lerpFactor
      state.currentBpDia += ((targetDia || 80) - state.currentBpDia) * lerpFactor

      // Render each active canvas
      canvasRefs.current.forEach((canvas, i) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const w = Math.floor(canvas.clientWidth)
        const h = Math.floor(canvas.clientHeight)

        if (w === 0 || h === 0) return

        // Handle high DPI resizing and clean scale
        const targetW = Math.round(w * dpr)
        const targetH = Math.round(h * dpr)
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
          // reset buffer on resize
          state.yPoints[i] = new Array(w).fill(i === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
        }

        let yPoints = state.yPoints[i]
        if (yPoints.length !== w) {
          yPoints = new Array(w).fill(i === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
          state.yPoints[i] = yPoints
        }

        // Calculate sweep positions using normalized time variables
        const prevTimeInSweep = prevTime % sweepDuration
        const timeInSweep = now % sweepDuration

        const prevX = Math.floor((prevTimeInSweep / sweepDuration) * w) % w
        const currentX = Math.floor((timeInSweep / sweepDuration) * w) % w

        // Overwrite indices that the sweep cursor crossed since last frame
        const stepsToUpdate = (currentX - prevX + w) % w

        if (stepsToUpdate > 0) {
          for (let step = 0; step <= stepsToUpdate; step++) {
            const currIdx = (prevX + step) % w
            // Calculate corresponding time for currIdx
            let tx = Math.floor(now / sweepDuration) * sweepDuration + (currIdx / w) * sweepDuration
            if (tx > now) {
              tx -= sweepDuration
            }

            // Evaluate value
            let val = 0
            if (i === 0) {
              val = getEcgValue(tx, state.currentHr, scenario)
            } else if (i === 1) {
              const sysScale = Math.max(0.4, Math.min(1.2, state.currentBpSys / 120))
              val = getBpValue(tx, state.currentHr) * sysScale
            } else if (i === 2) {
              const spo2Scale = Math.max(0.3, Math.min(1.0, state.currentSpo2 / 100))
              val = getPlethValue(tx, state.currentHr) * spo2Scale
            } else if (i === 3) {
              const respScale = Math.max(0.5, Math.min(1.0, 20 / state.currentRr))
              val = getRespValue(tx, state.currentRr) * respScale
            }
            yPoints[currIdx] = val
          }
        }

        // Draw waveform
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)

        // Draw clean medical monitor grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.04)'
        ctx.lineWidth = 1
        for (let gx = 0; gx < w; gx += 40) {
          ctx.beginPath()
          ctx.moveTo(gx, 0)
          ctx.lineTo(gx, h)
          ctx.stroke()
        }
        for (let gy = 0; gy < h; gy += 20) {
          ctx.beginPath()
          ctx.moveTo(0, gy)
          ctx.lineTo(w, gy)
          ctx.stroke()
        }

        const padding = 8
        const drawH = h - padding * 2

        ctx.strokeStyle = WAVEFORMS[i].color
        ctx.lineWidth = WAVEFORMS[i].lineWidth
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'

        // Apply a glowing trace shadow
        ctx.shadowColor = WAVEFORMS[i].glowColor
        ctx.shadowBlur = 6

        ctx.beginPath()
        let first = true
        const gapWidth = 35

        for (let x = 0; x < w; x++) {
          // Check if x is in the cleared gap ahead of the sweep cursor
          const inGap = (currentX < (currentX + gapWidth) % w)
            ? (x >= currentX && x < (currentX + gapWidth))
            : (x >= currentX || x < (currentX + gapWidth) % w)

          if (inGap) {
            first = true
            continue
          }

          const val = yPoints[x] !== undefined ? yPoints[x] : (i === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
          const y = padding + drawH * (1 - val)

          if (first) {
            ctx.moveTo(x, y)
            first = false
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()

        // Draw the bright glowing sweep head dot
        ctx.shadowBlur = 10
        ctx.shadowColor = WAVEFORMS[i].color
        const headVal = yPoints[currentX] !== undefined ? yPoints[currentX] : (i === 0 ? (0.0 + 0.22) / 1.22 : 0.0)
        const headY = padding + drawH * (1 - headVal)
        ctx.beginPath()
        ctx.arc(currentX, headY, 4, 0, Math.PI * 2)
        ctx.fillStyle = WAVEFORMS[i].color
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [open, vitals])

  // Keyboard escape handler
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
      className={`vitals-modal-overlay ${isVisible ? 'vitals-modal-visible' : ''}`}
      onClick={onClose}
    >
      <div
        className={`vitals-modal-content ${isVisible ? 'vitals-modal-content-visible' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="vitals-modal-header">
          <div className="vitals-header-left">
            <Activity className="vitals-header-icon" />
            <div>
              <h2 className="vitals-title">Live Vital Signs Monitor</h2>
              <p className="vitals-subtitle">
                Patient: {PATIENT.name} &nbsp;·&nbsp; {PATIENT.age} Yr &nbsp;·&nbsp; {PATIENT.gender}
              </p>
            </div>
          </div>
          <button className="vitals-close-btn" onClick={onClose} type="button">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="vitals-modal-body">
          {/* Waveforms */}
          <div className="vitals-waveforms">
            {WAVEFORMS.map((wf, i) => (
              <div key={wf.label} className="vitals-waveform-row">
                <span className="vitals-waveform-label" style={{ color: wf.color }}>
                  {wf.label}
                </span>
                <canvas
                  ref={(el) => { canvasRefs.current[i] = el }}
                  className="vitals-canvas"
                />
              </div>
            ))}
          </div>

          {/* Info panels */}
          <div className="vitals-info-panels">
            {/* HR */}
            <div className="vitals-info-card vitals-info-ecg">
              <div className="vitals-info-top">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">ECG</span>
                <span className="text-[10px] text-gray-400 font-medium">HR</span>
              </div>
              <div className="vitals-info-value !text-[#16a34a]">{vitals.hr}</div>
              <div className="vitals-info-meta text-gray-400">bpm</div>
              <div className="vitals-info-detail text-gray-600">
                Sinus Rhythm<br />
                <span className={`vitals-info-status ${
                  vitals.hr >= 120 ? 'vitals-status-danger' : vitals.hr > 100 ? 'vitals-status-warn' : 'vitals-status-ok'
                }`}>
                  {vitals.hr >= 120 ? 'Severe Tachycardia' : vitals.hr > 100 ? 'Tachycardia' : 'Within Range'}
                </span>
              </div>
            </div>

            {/* BP */}
            {(() => {
              const [sys, dia] = vitals.bp.split('/').map(Number)
              const mapVal = isNaN(sys) || isNaN(dia) ? 95 : Math.round((sys + 2 * dia) / 3)
              const isLow = vitals.bp.startsWith('70') || vitals.bp.startsWith('65') || vitals.bp.startsWith('92') || vitals.bp.startsWith('86')
              const isNormal = vitals.bp === '110/70'
              return (
                <div className="vitals-info-card vitals-info-bp">
                  <div className="vitals-info-top">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">NIBP</span>
                    <span className="text-[10px] text-gray-400 font-medium">mmHg</span>
                  </div>
                  <div className="vitals-info-value !text-[#dc2626]">{vitals.bp}</div>
                  <div className="vitals-info-meta text-gray-400">MAP: {mapVal}</div>
                  <div className="vitals-info-detail text-gray-600">
                    <span className={`vitals-info-status ${
                      isLow ? 'vitals-status-danger' : isNormal ? 'vitals-status-ok' : 'vitals-status-warn'
                    }`}>
                      {vitals.bp.startsWith('70') || vitals.bp.startsWith('65')
                        ? 'Severe Hypotension'
                        : vitals.bp.startsWith('92') || vitals.bp.startsWith('86')
                        ? 'Hypotensive'
                        : isNormal
                        ? 'Normal (Stabilized)'
                        : 'Hypertensive'}
                    </span>
                  </div>
                </div>
              )
            })()}

            {/* SpO2 */}
            <div className="vitals-info-card vitals-info-spo2">
              <div className="vitals-info-top">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  SpO<sub>2</sub>
                </span>
                <span className="text-[10px] text-gray-400 font-medium">%</span>
              </div>
              <div className="vitals-info-value !text-[#2563eb]">
                {vitals.spo2}
                <span className="vitals-info-unit !text-[#2563eb]">%</span>
              </div>
              <div className="vitals-info-meta text-gray-400">RA</div>
              <div className="vitals-info-detail text-gray-600">
                <span className={`vitals-info-status ${
                  vitals.spo2 >= 95 ? 'vitals-status-ok' : vitals.spo2 >= 90 ? 'vitals-status-warn' : 'vitals-status-danger'
                }`}>
                  {vitals.spo2 >= 95 ? 'Normal Saturation' : vitals.spo2 >= 90 ? 'Low Saturation' : 'Severe Hypoxia'}
                </span>
              </div>
            </div>

            {/* RR */}
            <div className="vitals-info-card vitals-info-resp">
              <div className="vitals-info-top">
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">RESP</span>
                <span className="text-[10px] text-gray-400 font-medium">/min</span>
              </div>
              <div className="vitals-info-value !text-[#ca8a04]">{vitals.rr}</div>
              <div className="vitals-info-meta text-gray-400">breaths/min</div>
              <div className="vitals-info-detail text-gray-600">
                <span className={`vitals-info-status ${
                  vitals.rr >= 30 ? 'vitals-status-danger' : vitals.rr > 20 ? 'vitals-status-warn' : 'vitals-status-ok'
                }`}>
                  {vitals.rr >= 30 ? 'Severe Tachypnea' : vitals.rr > 20 ? 'Tachypneic' : 'Within Range'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
