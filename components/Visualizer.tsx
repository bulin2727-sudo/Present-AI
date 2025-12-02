import React, { useEffect, useRef } from 'react';

interface Props {
  volume: number; // 0-255 roughly
  isListening: boolean;
}

const Visualizer: React.FC<Props> = ({ volume, isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Smooth volume
  const smoothVol = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      // Smooth out the volume changes
      smoothVol.current += (volume - smoothVol.current) * 0.1;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);
      
      if (isListening) {
        ctx.beginPath();
        const baseRadius = 30;
        const radius = baseRadius + (smoothVol.current * 0.5); // Sensitivity factor
        
        // Draw glow
        const gradient = ctx.createRadialGradient(width/2, centerY, baseRadius, width/2, centerY, radius + 20);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)'); // Indigo
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        ctx.fillStyle = gradient;
        ctx.arc(width/2, centerY, radius + 20, 0, Math.PI * 2);
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(width/2, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4f46e5';
        ctx.fill();
        
        // Draw pulse ring
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 2;
        ctx.arc(width/2, centerY, radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      } else {
         // Resting state
         ctx.beginPath();
         ctx.arc(width/2, centerY, 10, 0, Math.PI * 2);
         ctx.fillStyle = '#cbd5e1';
         ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [volume, isListening]);

  return (
    <div className="flex justify-center items-center h-48 w-full bg-slate-900 rounded-2xl overflow-hidden relative">
      <div className="absolute top-4 left-4 flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-600'}`}></div>
          <span className="text-xs font-medium text-slate-400">{isListening ? 'LIVE RECORDING' : 'IDLE'}</span>
      </div>
      <canvas ref={canvasRef} width={400} height={200} className="w-full h-full object-contain" />
    </div>
  );
};

export default Visualizer;
