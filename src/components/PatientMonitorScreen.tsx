import { useEffect, useRef } from 'react'
import { type Vitals, type ScenarioMode } from '../App'
import { getEcgValue, getPlethValue, getRespValue } from './VitalsDetailModal'
import monitorPhoto from '../assets/patient-monitor.png'

const WAVEFORMS = [
  { label: 'ECG II', color: '#39ff14', lineWidth: 1.4, high: 120, low: 50 },
  { label: 'ECG V5', color: '#39ff14', lineWidth: 1.2, high: 120, low: 50 },
  { label: 'PLETH', color: '#12b8ff', lineWidth: 1.3, high: 100, low: 0 },
  { label: 'RESP', color: '#ffe000', lineWidth: 1.2, high: 30, low: 8 },
]

type Props = {
  vitals: Vitals
  scenario: ScenarioMode
  active: boolean // pass monitorAttached here
}

export default function PatientMonitorScreen({ vitals, scenario, active }: Props) {
  const canvasRefs = useRef<(HTMLCanvasElement | null)[]>([null, null, null, null])
  const animRef = useRef<number>(0)
  const stateRef = useRef<{ yPoints: number[][]; lastTime: number }>(
    { yPoints: [[], [], [], []], lastTime: 0 }
  )

  useEffect(() => {
    if (!active) return
    const sweepDuration = 5.0

    const animate = () => {
      const now = performance.now() / 1000
      const state = stateRef.current
      if (state.lastTime === 0) state.lastTime = now
      const prevTime = state.lastTime
      state.lastTime = now

      canvasRefs.current.forEach((canvas, i) => {
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const dpr = window.devicePixelRatio || 1
        const w = Math.floor(canvas.clientWidth)
        const h = Math.floor(canvas.clientHeight)
        if (w === 0 || h === 0) return

        const targetW = Math.round(w * dpr)
        const targetH = Math.round(h * dpr)
        if (canvas.width !== targetW || canvas.height !== targetH) {
          canvas.width = targetW
          canvas.height = targetH
          state.yPoints[i] = new Array(w).fill(0)
        }
        let yPoints = state.yPoints[i]
        if (yPoints.length !== w) {
          yPoints = new Array(w).fill(0)
          state.yPoints[i] = yPoints
        }

        const prevTimeInSweep = prevTime % sweepDuration
        const timeInSweep = now % sweepDuration
        const prevX = Math.floor((prevTimeInSweep / sweepDuration) * w) % w
        const currentX = Math.floor((timeInSweep / sweepDuration) * w) % w
        const stepsToUpdate = (currentX - prevX + w) % w

        if (stepsToUpdate > 0) {
          for (let step = 0; step <= stepsToUpdate; step++) {
            const idx = (prevX + step) % w
            let tx = Math.floor(now / sweepDuration) * sweepDuration + (idx / w) * sweepDuration
            if (tx > now) tx -= sweepDuration

            let val = 0
            if (i === 0) val = getEcgValue(tx, vitals.hr, scenario)
            else if (i === 1) val = getEcgValue(tx + 0.055, vitals.hr, scenario)
            else if (i === 2) {
              const scale = Math.max(0.3, Math.min(1, vitals.spo2 / 100))
              val = getPlethValue(tx, vitals.hr) * scale
            } else if (i === 3) {
              const scale = Math.max(0.5, Math.min(1, 20 / vitals.rr))
              val = getRespValue(tx, vitals.rr) * scale
            }
            yPoints[idx] = val
          }
        }

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
        ctx.clearRect(0, 0, w, h)

        const pad = 4
        const drawH = h - pad * 2
        ctx.strokeStyle = WAVEFORMS[i].color
        ctx.lineWidth = WAVEFORMS[i].lineWidth
        ctx.lineJoin = 'round'
        ctx.lineCap = 'round'
        ctx.shadowColor = WAVEFORMS[i].color
        ctx.shadowBlur = 4

        ctx.beginPath()
        let first = true
        const gapWidth = Math.max(14, Math.round(w * 0.05))
        for (let x = 0; x < w; x++) {
          const inGap = currentX < (currentX + gapWidth) % w
            ? x >= currentX && x < currentX + gapWidth
            : x >= currentX || x < (currentX + gapWidth) % w
          if (inGap) { first = true; continue }
          const val = yPoints[x] ?? 0
          const y = pad + drawH * (1 - val)
          if (first) { ctx.moveTo(x, y); first = false } else { ctx.lineTo(x, y) }
        }
        ctx.stroke()

        const headVal = yPoints[currentX] ?? 0
        const headY = pad + drawH * (1 - headVal)
        ctx.beginPath()
        ctx.shadowBlur = 8
        ctx.arc(currentX, headY, 3, 0, Math.PI * 2)
        ctx.fillStyle = WAVEFORMS[i].color
        ctx.fill()
      })

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [active, vitals, scenario])

  const [sys, dia] = vitals.bp.split('/')

  return (
    <div className="monitor-frame">
      <img src={monitorPhoto} alt="Patient bedside monitor" className="monitor-photo" />

      <div className={`monitor-screen ${active ? 'monitor-screen-on' : 'monitor-screen-off'}`}>
        {active ? (
          <>
            <div className="monitor-topbar">
              <span>ICU-01 · BED-07</span>
              <span className="monitor-live"><i /> LIVE</span>
            </div>
            <div className="monitor-body">
              <div className="monitor-waves">
                {WAVEFORMS.map((wf, i) => (
                  <div key={wf.label} className="monitor-wave">
                    <span className="monitor-wave-label" style={{ color: wf.color }}>{wf.label}</span>
                    <span className="monitor-wave-scale monitor-wave-high" style={{ color: wf.color }}>{wf.high}</span>
                    <span className="monitor-wave-scale monitor-wave-low" style={{ color: wf.color }}>{wf.low}</span>
                    <canvas ref={(el) => { canvasRefs.current[i] = el }} className="monitor-canvas" />
                  </div>
                ))}
              </div>
              <div className="monitor-numbers">
                <div className="monitor-num monitor-num-hr">
                  <span className="monitor-num-label">HR</span>
                  <div className="monitor-value-row"><span className="monitor-num-value">{vitals.hr}</span><span className="monitor-unit">bpm</span></div>
                </div>
                <div className="monitor-num monitor-num-spo2">
                  <span className="monitor-num-label">SpO2 <small>%</small></span>
                  <div className="monitor-value-row"><span className="monitor-num-value">{vitals.spo2}</span><span className="monitor-limits">100<br />90</span></div>
                </div>
                <div className="monitor-num monitor-num-bp">
                  <span className="monitor-num-label">NIBP <small>mmHg</small></span>
                  <div className="monitor-value-row"><span className="monitor-num-value monitor-num-bp-value">{sys}/{dia}</span></div>
                </div>
                <div className="monitor-num monitor-num-rr">
                  <span className="monitor-num-label">RR <small>rpm</small></span>
                  <div className="monitor-value-row"><span className="monitor-num-value">{vitals.rr}</span><span className="monitor-limits">30<br />8</span></div>
                </div>
                <div className="monitor-num monitor-num-temp">
                  <span className="monitor-num-label">TEMP <small>°C</small></span>
                  <div className="monitor-value-row"><span className="monitor-num-value">{vitals.temp.toFixed(1)}</span></div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="monitor-off-label">Monitor Off</div>
        )}
      </div>
    </div>
  )
}
