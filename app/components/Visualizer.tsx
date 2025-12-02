import React, { useEffect, useRef } from 'react';

interface Props {
  volume: number;
  isListening: boolean;
}

const Visualizer: React.FC<Props> = ({ volume, isListening }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const smoothVol = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      smoothVol.current += (volume - smoothVol.current) * 0.1;
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);
      
      if (isListening) {
        const radius = 30 + (smoothVol.current * 0.5);
        
        const gradient = ctx.createRadialGradient(width/2, centerY, 30, width/2, centerY, radius + 20);
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
        gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(width/2, centerY, radius + 20, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(width/2, centerY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#4f46e5';
        ctx.fill();
      } else {
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
      <canvas ref={canvasRef} width={400} height={200} className="w-full h-full object-contain" />
    </div>
  );
};
export default Visualizer;