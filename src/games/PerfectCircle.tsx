import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Trophy, Target, Sparkles, Check } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface Point {
  x: number;
  y: number;
}

export default function PerfectCircle() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('as_fun_circle_high_score') || 0);
    } catch {
      return 0;
    }
  });

  // Center point of the canvas
  const [center, setCenter] = useState<Point>({ x: 300, y: 300 });

  // Resize canvas to match container
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      }
      setCenter({ x: rect.width / 2, y: rect.height / 2 });
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  // Redraw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width / window.devicePixelRatio;
    const height = canvas.height / window.devicePixelRatio;

    ctx.clearRect(0, 0, width, height);

    // Center target dot
    ctx.beginPath();
    ctx.arc(center.x, center.y, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#64748b';
    ctx.fill();

    // Crosshairs
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(center.x - 20, center.y);
    ctx.lineTo(center.x + 20, center.y);
    ctx.moveTo(center.x, center.y - 20);
    ctx.lineTo(center.x, center.y + 20);
    ctx.stroke();
    ctx.setLineDash([]);

    // If score is evaluated, draw ghost ideal circle
    if (score !== null && points.length > 10) {
      // Calculate average radius from center
      const radii = points.map((p) => Math.hypot(p.x - center.x, p.y - center.y));
      const avgR = radii.reduce((a, b) => a + b, 0) / radii.length;

      ctx.beginPath();
      ctx.arc(center.x, center.y, avgR, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Draw user path
    if (points.length > 1) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.strokeStyle = score !== null ? (score > 90 ? '#10b981' : score > 80 ? '#f59e0b' : '#f43f5e') : '#f8fafc';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();
    }
  }, [points, score, center]);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    setIsDrawing(true);
    setScore(null);
    setFeedback('');
    setPoints([startPt]);
    soundManager.playPop(500);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const newPt = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    setPoints((prev) => [...prev, newPt]);
    if (points.length % 5 === 0) {
      soundManager.playPop(400 + (points.length % 200));
    }
  };

  const evaluateCircle = () => {
    if (points.length < 25) {
      setScore(0);
      setFeedback('Too short! Draw a full circle around the dot.');
      soundManager.playError();
      return;
    }

    // Radii from center dot
    const radii = points.map((p) => Math.hypot(p.x - center.x, p.y - center.y));
    const avgR = radii.reduce((a, b) => a + b, 0) / radii.length;

    if (avgR < 40) {
      setScore(10);
      setFeedback('Too small! Make a wider circle.');
      soundManager.playError();
      return;
    }

    // Radial variance
    const variance =
      radii.reduce((sum, r) => sum + Math.pow(r - avgR, 2), 0) / radii.length;
    const stdDev = Math.sqrt(variance);

    // Closure check: distance between first and last point
    const firstPt = points[0];
    const lastPt = points[points.length - 1];
    const closureDist = Math.hypot(lastPt.x - firstPt.x, lastPt.y - firstPt.y);
    const closurePenalty = Math.min(25, (closureDist / avgR) * 20);

    // Compute raw accuracy percentage
    const deviationRatio = stdDev / avgR;
    let finalScore = Math.max(0, 100 - deviationRatio * 180 - closurePenalty);
    finalScore = Math.round(finalScore * 10) / 10;

    setScore(finalScore);

    if (finalScore >= 95) {
      setFeedback('Incredible! Geometric mastery.');
      soundManager.playSuccess();
    } else if (finalScore >= 90) {
      setFeedback('Great circle! Clean curve.');
      soundManager.playPop(650);
    } else if (finalScore >= 80) {
      setFeedback('Not bad, but slightly wobbly.');
      soundManager.playPop(420);
    } else {
      setFeedback('More like an asteroid or a potato!');
      soundManager.playPop(300);
    }

    // Save high score
    if (finalScore > highScore) {
      setHighScore(finalScore);
      try {
        localStorage.setItem('as_fun_circle_high_score', String(finalScore));
      } catch {
        // Ignore
      }
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    evaluateCircle();
  };

  const handleReset = () => {
    soundManager.playPop(350);
    setPoints([]);
    setScore(null);
    setFeedback('');
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 overflow-hidden rounded-xl border border-neutral-800 shadow-2xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">⭕</span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Draw a Perfect Circle</h2>
            <div className="text-xs text-neutral-400">
              Draw a single continuous circle around the center point in one stroke.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>Best: <strong className="text-amber-400">{highScore > 0 ? `${highScore}%` : '—'}</strong></span>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Main Drawing Canvas Arena */}
      <div className="flex-1 relative bg-neutral-950 select-none overflow-hidden flex flex-col items-center justify-center">
        {/* Floating instruction when empty */}
        {points.length === 0 && (
          <div className="absolute top-8 pointer-events-none text-center px-4">
            <p className="text-sm text-neutral-400 font-medium">
              Click and drag to trace a full circle around the dot.
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          className="w-full h-full cursor-crosshair touch-none"
        />

        {/* Score Card Overlay */}
        {score !== null && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-neutral-900/95 border border-neutral-700 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md flex flex-col items-center text-center space-y-1 animate-in zoom-in-95 duration-200 min-w-[240px]">
            <div className="text-[11px] uppercase tracking-wider font-bold text-neutral-400">
              Roundness Score
            </div>
            <div
              className={`text-4xl font-extrabold font-mono tabular-nums ${
                score >= 95 ? 'text-emerald-400' : score >= 85 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {score}%
            </div>
            <div className="text-xs text-neutral-300 font-medium mt-1">{feedback}</div>
            <button
              onClick={handleReset}
              className="mt-3 px-4 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
