import { useEffect, useRef } from 'react';
import { type Vitals } from '../App';

interface MonitorCanvasProps {
  vitals: Vitals;
}

export default function MonitorCanvas({ vitals }: MonitorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const vitalsRef = useRef<Vitals>(vitals);

  // Keep ref up to date so animation loop uses latest without restarting
  useEffect(() => {
    vitalsRef.current = vitals;
  }, [vitals]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let waveWidth = 0;
    let vitalsWidth = 0;
    let dpr = window.devicePixelRatio || 1;

    // State for animation
    let currentX = 0;
    let lastTime = performance.now();
    
    // Previous Y values for drawing lines
    let prevEcgY = 0;
    let prevSpo2Y = 0;
    let prevRespY = 0;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      
      waveWidth = width * 0.75;
      vitalsWidth = width * 0.25;

      // Full black background initially
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);

      // Reset X on resize
      currentX = 0;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // Initial sizing

    // Waveform functions
    const getEcgValue = (phase: number) => {
      if (phase < 0.1) return Math.sin(phase * Math.PI * 10) * 0.15; // P
      if (phase < 0.15) return 0;
      if (phase < 0.17) return -0.15; // Q
      if (phase < 0.19) return 1.0;  // R
      if (phase < 0.22) return -0.25; // S
      if (phase < 0.3) return 0;
      if (phase < 0.45) return Math.sin((phase - 0.3) * Math.PI / 0.15) * 0.25; // T
      return 0;
    };

    const getPlethValue = (phase: number) => {
      // Smoother dicrotic notch
      const t = phase;
      if (t < 0.2) return Math.sin(t * Math.PI / 0.2) * 0.8;
      if (t < 0.4) return 0.8 - ((t - 0.2) / 0.2) * 0.4;
      if (t < 0.5) return 0.4 + Math.sin((t - 0.4) * Math.PI / 0.1) * 0.05;
      return 0.4 - ((t - 0.5) / 0.5) * 0.4;
    };

    const getRespValue = (phase: number) => {
      return Math.sin(phase * Math.PI * 2) * 0.6;
    };

    const drawVitalsPanel = (v: Vitals) => {
      ctx.fillStyle = '#050505'; // Slightly distinct from true black
      ctx.fillRect(waveWidth, 0, vitalsWidth, height);
      
      const padX = waveWidth + 10;
      let curY = 15;

      const drawStat = (label: string, val: string | number, color: string, isLarge = false) => {
        ctx.fillStyle = color;
        ctx.font = `bold ${height * 0.06}px "Inter", sans-serif`;
        ctx.textAlign = 'left';
        ctx.fillText(label, padX, curY + height * 0.06);
        
        ctx.font = `bold ${isLarge ? height * 0.18 : height * 0.12}px "Inter", sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(String(val), width - 10, curY + (isLarge ? height * 0.16 : height * 0.1));
        
        curY += isLarge ? height * 0.22 : height * 0.16;
      };

      // Heart Rate
      drawStat('ECG', v.hr, '#00ff00', true);
      
      // SpO2
      drawStat('SpO2', v.spo2, '#00ffff', true);
      
      // Resp Rate
      drawStat('RESP', v.rr, '#ffff00', false);
      
      // Blood Pressure
      drawStat('NIBP', v.bp, '#ffffff', false);
      
      // Temp
      drawStat('TEMP', v.temp, '#ffffff', false);
    };

    const draw = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // Max 100ms step to avoid huge jumps
      lastTime = time;

      const v = vitalsRef.current;

      // Speed of sweep (pixels per second)
      const sweepSpeed = width * 0.3; 
      const dx = sweepSpeed * dt;
      
      // Calculate current phases based on absolute time
      // HR
      const ecgBeatDuration = 60 / v.hr;
      const ecgPhase = (time / 1000 % ecgBeatDuration) / ecgBeatDuration;
      
      // Pleth (synced with HR but slightly delayed)
      const plethPhase = ((time / 1000 - 0.1) % ecgBeatDuration) / ecgBeatDuration;

      // Resp
      const respDuration = 60 / v.rr;
      const respPhase = (time / 1000 % respDuration) / respDuration;

      // Calculate Y coords
      const laneH = height / 3;
      // Center lines for each lane
      const ecgBaseY = laneH * 0.5;
      const spo2BaseY = laneH * 1.5;
      const respBaseY = laneH * 2.5;

      const newEcgY = ecgBaseY - getEcgValue(ecgPhase) * (laneH * 0.4);
      const newSpo2Y = spo2BaseY - getPlethValue(plethPhase) * (laneH * 0.3);
      const newRespY = respBaseY - getRespValue(respPhase) * (laneH * 0.3);

      // Eraser bar (draw black rect ahead of the current X)
      ctx.fillStyle = '#000000';
      ctx.fillRect(currentX, 0, dx + 20, height);

      // Draw lines
      if (currentX > 0 && currentX - dx >= 0) { // Don't draw line across the screen wrap
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // ECG
        ctx.beginPath();
        ctx.strokeStyle = '#00ff00';
        ctx.moveTo(currentX - dx, prevEcgY);
        ctx.lineTo(currentX, newEcgY);
        ctx.stroke();

        // SpO2
        ctx.beginPath();
        ctx.strokeStyle = '#00ffff';
        ctx.moveTo(currentX - dx, prevSpo2Y);
        ctx.lineTo(currentX, newSpo2Y);
        ctx.stroke();

        // Resp
        ctx.beginPath();
        ctx.strokeStyle = '#ffff00';
        ctx.moveTo(currentX - dx, prevRespY);
        ctx.lineTo(currentX, newRespY);
        ctx.stroke();
      }

      // Update refs
      prevEcgY = newEcgY;
      prevSpo2Y = newSpo2Y;
      prevRespY = newRespY;

      // Advance X
      currentX += dx;
      if (currentX > waveWidth) {
        currentX = 0;
      }

      // Draw static panel (redrawing it each frame is fast enough and ensures it's always on top of eraser bar)
      drawVitalsPanel(v);

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block"
      style={{
        backgroundColor: '#000', // fallback
      }}
    />
  );
}
