import React, { useEffect, useRef } from 'react';
import { audioEngine } from '../services/audioEngine';

export const Visualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const analyser = audioEngine.getAnalyser();

    // Responsive canvas
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      if (!analyser) {
        animationId = requestAnimationFrame(render);
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Wider bars for neon look
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let barHeight;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] * 1.8; // Scale up

        // Neon Gradient: Fuchsia to Cyan
        const r = 217 - (i * 100 / bufferLength); // Pinkish
        const g = 70 + (i * 100 / bufferLength); 
        const b = 239; // Blue-ish
        
        // Alternating colors for vibrant effect
        const fillStyle = i % 2 === 0 
            ? `rgba(217, 70, 239, ${dataArray[i]/255})` // Neon Fuchsia
            : `rgba(34, 211, 238, ${dataArray[i]/255})`; // Neon Cyan

        ctx.fillStyle = fillStyle;
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = fillStyle;
        
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        ctx.shadowBlur = 0; // Reset for performance

        x += barWidth + 1;
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="visualizer-canvas" />;
};