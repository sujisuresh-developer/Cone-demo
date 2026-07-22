import { useEffect, useRef, useState } from 'react'
import { type Vitals, type ScenarioMode } from '../App'
import monitorPhoto from '../assets/patient-monitor.png'

/* ─── Waveform Math Generators ─── */

export function getEcgValue(t: number, hr: number, scenario?: ScenarioMode): number {
  const T = 60 / hr
  const tBeat = t % T
  const Tactive = Math.min(0.55, T)
  if (tBeat >= Tactive) return (0.0 + 0.22) / 1.22
  const p = tBeat / Tactive
  let v = 0
  if (p < 0.08) v = 0
  else if (p < 0.18) v = 0.12 * Math.sin(Math.PI * (p - 0.08) / 0.10)
  else if (p < 0.22) v = 0
  else if (p < 0.24) v = -0.08 * ((p - 0.22) / 0.02)
  else if (p < 0.265) v = -0.08 + 1.08 * ((p - 0.24) / 0.025)
  else if (p < 0.29) v = 1.0 - 1.22 * ((p - 0.265) / 0.025)
  else if (p < 0.325) v = -0.22 + 0.22 * ((p - 0.29) / 0.035)
  else if (p < 0.375) v = 0
  else if (p < 0.525) v = 0.25 * Math.sin(Math.PI * (p - 0.375) / 0.150)
  else if (p < 0.58) v = 0
  else if (p < 0.63) v = 0.015 * Math.sin(Math.PI * (p - 0.58) / 0.05)
  else v = 0
  if (scenario === 'stemi' && p >= 0.29 && p < 0.525) {
    v += 0.35 * Math.sin(Math.PI * (p - 0.29) / (0.525 - 0.29))
  }
  return (v + 0.22) / 1.22
}

export function getBpValue(t: number, hr: number): number {
  const T = 60 / hr
  const Tactive = Math.min(0.55, T)
  const tBp = (t - 0.12 + T * 2) % T
  if (tBp >= Tactive) return 0.0
  const p = tBp / Tactive
  let v = 0
  if (p < 0.10) v = Math.sin((Math.PI / 2) * (p / 0.10))
  else if (p < 0.30) v = 1.0 - 0.40 * Math.sin((Math.PI / 2) * ((p - 0.10) / 0.20))
  else if (p < 0.34) v = 0.60 - 0.05 * Math.sin((Math.PI / 2) * ((p - 0.30) / 0.04))
  else if (p < 0.40) v = 0.55 + 0.11 * Math.sin(Math.PI * ((p - 0.34) / 0.06))
  else v = 0.55 * Math.cos((Math.PI / 2) * ((p - 0.40) / 0.60))
  return v
}

export function getPlethValue(t: number, hr: number): number {
  const beatDuration = 60 / Math.max(hr, 1)
  const phase = ((t - 0.16) % beatDuration + beatDuration) % beatDuration / beatDuration
  const baseline = 0.16
  let pulse = 0

  if (phase < 0.18) {
    // Soft but brisk systolic upstroke, without an ECG-like spike.
    pulse = Math.sin((Math.PI / 2) * (phase / 0.18)) ** 1.35
  } else if (phase < 0.42) {
    // Broad, rounded fall from the peak.
    pulse = 1 - 0.32 * Math.sin((Math.PI / 2) * ((phase - 0.18) / 0.24))
  } else if (phase < 0.50) {
    // Small dicrotic notch after the systolic peak.
    pulse = 0.68 - 0.13 * Math.sin(Math.PI * ((phase - 0.42) / 0.08))
  } else if (phase < 0.60) {
    // Gentle diastolic rebound.
    pulse = 0.55 + 0.08 * Math.sin(Math.PI * ((phase - 0.50) / 0.10))
  } else if (phase < 0.94) {
    // Slow runoff to a consistent baseline.
    pulse = 0.63 * Math.cos((Math.PI / 2) * ((phase - 0.60) / 0.34)) ** 1.4
  }

  return baseline + pulse * 0.72
}

export function getRespValue(t: number, rr: number): number {
  const T = 60 / rr
  const p = (t % T) / T
  if (p < 0.35) { const s = Math.sin((Math.PI / 2) * (p / 0.35)); return s * s }
  if (p < 0.80) return Math.cos((Math.PI / 2) * ((p - 0.35) / 0.45))
  return 0
}

/* ─── Waveform Configurations ─── */

interface WaveformConfig {
  label: string
  color: string
  lineWidth: number
  glowColor: string
  scaleHigh: number
  scaleLow: number
  calLabel: string
}

const WAVEFORMS: WaveformConfig[] = [
  { label: 'ECG  II',  color: '#39ff14', lineWidth: 1.8, glowColor: 'rgba(57,255,20,0.45)',   scaleHigh: 120, scaleLow: 50, calLabel: '1mV' },
  { label: 'ECG  V5',  color: '#39ff14', lineWidth: 1.5, glowColor: 'rgba(57,255,20,0.38)',   scaleHigh: 120, scaleLow: 50, calLabel: '1mV' },
  { label: 'PLETH',    color: '#12b8ff', lineWidth: 1.8, glowColor: 'rgba(18,184,255,0.38)',  scaleHigh: 100, scaleLow: 0,  calLabel: '' },
  { label: 'RESP',     color: '#ffe000', lineWidth: 1.5, glowColor: 'rgba(255,224,0,0.32)',   scaleHigh: 30,  scaleLow: 8,  calLabel: '' },
]

/* ─── Component Props ─── */

type Props = { open: boolean; onClose: () => void; vitals: Vitals; scenario: ScenarioMode }

/* ─── Clock Hook ─── */

function useClock() {
  const [t, setT] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return t
}

function fmtDate(d: Date) {
  const day = String(d.getDate()).padStart(2, '0')
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const mon = months[d.getMonth()]
  const yr = d.getFullYear()
  return `${day}-${mon}-${yr}`
}

function fmtTime(d: Date) {
  const hrs = String(d.getHours()).padStart(2, '0')
  const mins = String(d.getMinutes()).padStart(2, '0')
  const secs = String(d.getSeconds()).padStart(2, '0')
  return `${hrs}:${mins}:${secs}`
}

/* ─── Main Component ─── */

export default function VitalsDetailModal({ open, onClose, vitals, scenario }: Props) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null])
  const animRef = useRef<number>(0)
  const [isVisible, setIsVisible] = useState(false)
  const clock = useClock()

  const [bpSys, bpDia] = vitals.bp.split('/').map(Number)
  const bpMap = isNaN(bpSys) || isNaN(bpDia) ? 93 : Math.round((bpSys + 2 * bpDia) / 3)

  const sweepRef = useRef({
    yPoints: [[] as number[], [], [], []],
    lastTime: 0,
    hr: 0,
    rr: 0,
    spo2: 0,
    bpS: 0,
    bpD: 0
  })

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => setIsVisible(true))
    } else {
      setIsVisible(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const SWEEP = 6.0 // Sweep duration in seconds

    const animate = () => {
      const now = performance.now() / 1000
      const s = sweepRef.current

      if (s.lastTime === 0) {
        s.lastTime = now
        s.hr = vitals.hr
        s.rr = vitals.rr
        s.spo2 = vitals.spo2
        s.bpS = bpSys || 120
        s.bpD = bpDia || 80
      }

      const dt = Math.min(now - s.lastTime, 1.0)
      const prev = s.lastTime
      s.lastTime = now

      const lf = 1.8 * dt // Interpolation speed factor
      s.hr += (vitals.hr - s.hr) * lf
      s.rr += (vitals.rr - s.rr) * lf
      s.spo2 += (vitals.spo2 - s.spo2) * lf
      s.bpS += ((bpSys || 120) - s.bpS) * lf
      s.bpD += ((bpDia || 80) - s.bpD) * lf

      canvasRefs.current.forEach((canvas, i) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        const dpr = window.devicePixelRatio || 1
        const w = Math.floor(canvas.clientWidth)
        const h = Math.floor(canvas.clientHeight)
        if (!w || !h) return

        const tw = Math.round(w * dpr)
        const th = Math.round(h * dpr)
        if (canvas.width !== tw || canvas.height !== th) {
          canvas.width = tw
          canvas.height = th
          s.yPoints[i] = new Array(w).fill(i === 0 ? (0.22 / 1.22) : 0)
        }

        let pts = s.yPoints[i]
        if (pts.length !== w) {
          pts = new Array(w).fill(i === 0 ? (0.22 / 1.22) : 0)
          s.yPoints[i] = pts
        }

        const prevX = Math.floor(((prev % SWEEP) / SWEEP) * w) % w
        const currentX = Math.floor(((now % SWEEP) / SWEEP) * w) % w
        const steps = (currentX - prevX + w) % w

        if (steps > 0) {
          for (let step = 0; step <= steps; step++) {
            const idx = (prevX + step) % w
            let tx = Math.floor(now / SWEEP) * SWEEP + (idx / w) * SWEEP
            if (tx > now) tx -= SWEEP
            let val = 0
            if (i === 0) val = getEcgValue(tx, s.hr, scenario)
            else if (i === 1) val = getEcgValue(tx + 0.055, s.hr, scenario)
            else if (i === 2) val = getPlethValue(tx, s.hr) * Math.max(0.3, Math.min(1, s.spo2 / 100))
            else if (i === 3) val = getRespValue(tx, s.rr) * Math.max(0.5, Math.min(1, 20 / s.rr))
            pts[idx] = val
          }
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)

        // Draw dotted medical monitor grid lines
        ctx.save()
        ctx.strokeStyle = 'rgba(57, 255, 20, 0.06)'
        ctx.lineWidth = 0.5
        ctx.setLineDash([1, 4])
        for (let gx = 0; gx <= w; gx += 20) {
          ctx.beginPath()
          ctx.moveTo(gx, 0)
          ctx.lineTo(gx, h)
          ctx.stroke()
        }
        for (let gy = 0; gy <= h; gy += 20) {
          ctx.beginPath()
          ctx.moveTo(0, gy)
          ctx.lineTo(w, gy)
          ctx.stroke()
        }
        ctx.restore()

        const pad = 6
        const dh = h - pad * 2
        const gap = Math.max(20, Math.round(w * 0.05))

        ctx.strokeStyle = WAVEFORMS[i].color
        ctx.lineWidth = WAVEFORMS[i].lineWidth
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.shadowColor = WAVEFORMS[i].glowColor
        ctx.shadowBlur = 6

        ctx.beginPath()
        let first = true
        for (let x = 0; x < w; x++) {
          const inGap = currentX < (currentX + gap) % w
            ? (x >= currentX && x < currentX + gap)
            : (x >= currentX || x < (currentX + gap) % w)
          if (inGap) {
            first = true
            continue
          }
          const val = pts[x] ?? (i === 0 ? 0.22 / 1.22 : 0)
          const y = pad + dh * (1 - val)
          if (first) {
            ctx.moveTo(x, y)
            first = false
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()

        // Glow sweep cursor dot
        ctx.shadowBlur = 12
        ctx.shadowColor = WAVEFORMS[i].color
        const hv = pts[currentX] ?? (i === 0 ? 0.22 / 1.22 : 0)
        const hy = pad + dh * (1 - hv)
        ctx.beginPath()
        ctx.arc(currentX, hy, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = WAVEFORMS[i].color
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [open, vitals, scenario])

  useEffect(() => {
    if (!open) return
    const hk = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', hk)
    return () => window.removeEventListener('keydown', hk)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className={`icu-overlay${isVisible ? ' icu-overlay-in' : ''}`} onClick={onClose}>
      <div className="icu-modal-frame" onClick={e => e.stopPropagation()}>
        <img src={monitorPhoto} alt="Bedside Monitor Frame" className="icu-monitor-bg" />

        <div className="icu-screen">
          {/* ── Top Header Bar ── */}
          <header className="icu-header">
            <span className="icu-hcell">ICU-01</span>
            <span className="icu-hcell">BED-07</span>
            <span className="icu-hcell icu-hcell-wide">ADULT</span>
            <span className="icu-hcell icu-hcell-clock">
              <span className="icu-date">{fmtDate(clock)}</span>
              <span className="icu-time">{fmtTime(clock)}</span>
            </span>
          </header>

        {/* ── Monitor Body Layout ── */}
        <div className="icu-body">

          {/* Left Panel: Waveforms */}
          <div className="icu-waves">
            {WAVEFORMS.map((wf, i) => (
              <div key={wf.label} className="icu-wave-row">
                <div className="icu-wave-meta">
                  <span className="icu-wave-lbl" style={{ color: wf.color }}>{wf.label}</span>
                  {wf.calLabel && (
                    <div className="icu-wave-cal-box" style={{ color: wf.color }}>
                      <svg viewBox="0 0 20 20" className="icu-cal-svg">
                        <path d="M 4,3 L 1,3 L 1,17 L 4,17 M 1,10 L 6,10 L 6,3 L 12,3 L 12,10 L 20,10" stroke="currentColor" strokeWidth="1.5" fill="none" />
                      </svg>
                      <span className="icu-wave-cal-text">{wf.calLabel}</span>
                    </div>
                  )}
                </div>
                <div className="icu-wave-scale" style={{ color: wf.color }}>
                  <span>{wf.scaleHigh}</span>
                  <span>{wf.scaleLow}</span>
                </div>
                <canvas ref={el => { canvasRefs.current[i] = el }} className="icu-canvas" />
              </div>
            ))}
          </div>

          {/* Right Panel: Vitals Values */}
          <div className="icu-nums">

            {/* HR Card */}
            <div className="icu-ncard icu-hr">
              <div className="icu-ntop">
                <span className="icu-nlbl">HR</span>
                <span className="icu-nheart">
                  <svg viewBox="0 0 24 24" className="icu-heart-svg" fill="currentColor">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </span>
              </div>
              <div className="icu-nval-row">
                <span className="icu-nval">{vitals.hr}</span>
                <span className="icu-nunit">bpm</span>
              </div>
            </div>

            {/* SpO2 Card */}
            <div className="icu-ncard icu-spo2">
              <div className="icu-ntop">
                <span className="icu-nlbl">SpO₂</span>
                <span className="icu-nunit-top">%</span>
              </div>
              <div className="icu-nval-row">
                <span className="icu-nval">{vitals.spo2}</span>
                <div className="icu-nlimits">
                  <span>96</span>
                  <span className="icu-nlim-sep">100</span>
                  <span>90</span>
                </div>
              </div>
            </div>

            {/* NIBP Card */}
            <div className="icu-ncard icu-nibp">
              <div className="icu-ntop">
                <span className="icu-nlbl">NIBP</span>
                <span className="icu-nunit-top">mmHg</span>
              </div>
              <div className="icu-nbp-row">
                <span className="icu-nbp">{vitals.bp}</span>
                <span className="icu-nmap">({bpMap})</span>
              </div>
              <div className="icu-nbp-meta">
                <span>MANUAL</span>
                <span>{fmtTime(clock).slice(0, 5)}</span>
              </div>
            </div>

            {/* RR Card */}
            <div className="icu-ncard icu-rr">
              <div className="icu-ntop">
                <span className="icu-nlbl">RR</span>
                <span className="icu-nunit-top">rpm</span>
              </div>
              <div className="icu-nval-row">
                <span className="icu-nval">{vitals.rr}</span>
                <div className="icu-nlimits">
                  <span>30</span>
                  <span className="icu-nlim-sep">8</span>
                </div>
              </div>
            </div>

            {/* TEMP Card */}
            <div className="icu-ncard icu-temp">
              <div className="icu-ntop">
                <span className="icu-nlbl">TEMP</span>
                <span className="icu-nunit-top">°C</span>
              </div>
              <div className="icu-nval-row">
                <span className="icu-nval">{vitals.temp.toFixed(1)}</span>
                <div className="icu-nlimits">
                  <span>38.0</span>
                  <span className="icu-nlim-sep">35.0</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Bottom Toolbar ── */}
        <footer className="icu-toolbar">
          <button className="icu-tbtn">ALARM<br/>SILENCE</button>
          <button className="icu-tbtn">
            RECORD
            <span className="icu-tbtn-circle">○</span>
          </button>
          <button className="icu-tbtn">ALARM LIMITS</button>
          <button className="icu-tbtn">
            NIBP INTERVAL
            <span className="icu-tbtn-hi">15MIN</span>
          </button>
          <button className="icu-tbtn icu-tbtn-menu-btn">
            MENU
            <span className="icu-tbtn-menu">≡</span>
          </button>
        </footer>

      </div>
      <button className="icu-xbtn" onClick={onClose} aria-label="Close">x</button>
    </div>
  </div>
  )
}
