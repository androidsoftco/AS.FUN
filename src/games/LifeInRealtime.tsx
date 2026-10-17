import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, Zap, Globe, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface StatItem {
  id: string;
  name: string;
  ratePerSecond: number;
  unit: string;
  emoji: string;
  category: 'cosmos' | 'earth' | 'human' | 'digital';
}

const STATS: StatItem[] = [
  { id: 'earth_orbit', name: 'Earth traveled through space', ratePerSecond: 29.78, unit: 'km', emoji: '🌍', category: 'cosmos' },
  { id: 'milky_way', name: 'Milky Way drifted towards Andromeda', ratePerSecond: 110, unit: 'km', emoji: '🌌', category: 'cosmos' },
  { id: 'sun_light', name: 'Sunlight photons striking Earth', ratePerSecond: 1.74e17, unit: 'Watts', emoji: '☀️', category: 'cosmos' },
  { id: 'lightning', name: 'Lightning strikes on Earth', ratePerSecond: 44, unit: 'strikes', emoji: '⚡', category: 'earth' },
  { id: 'niagara', name: 'Water rushing over Niagara Falls', ratePerSecond: 2400, unit: 'tons', emoji: '🌊', category: 'earth' },
  { id: 'babies', name: 'Babies born around the globe', ratePerSecond: 4.3, unit: 'babies', emoji: '👶', category: 'human' },
  { id: 'heartbeats', name: 'Average human heartbeats', ratePerSecond: 1.25, unit: 'beats', emoji: '💓', category: 'human' },
  { id: 'blinks', name: 'Times your eyes blinked', ratePerSecond: 0.28, unit: 'blinks', emoji: '👀', category: 'human' },
  { id: 'searches', name: 'Google searches performed', ratePerSecond: 99000, unit: 'queries', emoji: '🔍', category: 'digital' },
  { id: 'coke', name: 'Cans of Coca-Cola consumed', ratePerSecond: 21900, unit: 'cans', emoji: '🥤', category: 'human' },
  { id: 'emails', name: 'Emails sent across the globe', ratePerSecond: 3400000, unit: 'emails', emoji: '📧', category: 'digital' },
  { id: 'trees', name: 'Trees chopped down globally', ratePerSecond: 475, unit: 'trees', emoji: '🌲', category: 'earth' },
];

export default function LifeInRealtime() {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [multiplier, setMultiplier] = useState<number>(1);

  // Live timer tick
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 0.1 * multiplier);
    }, 100);
    return () => clearInterval(interval);
  }, [isPaused, multiplier]);

  const handleReset = () => {
    soundManager.playPop(300);
    setElapsedSeconds(0);
    setMultiplier(1);
  };

  const handlePreset = (seconds: number) => {
    soundManager.playPop(480);
    setElapsedSeconds(seconds);
  };

  const formatNumber = (val: number) => {
    if (val >= 1e12) return (val / 1e12).toFixed(2) + ' Trillion';
    if (val >= 1e9) return (val / 1e9).toFixed(2) + ' Billion';
    if (val >= 1e6) return (val / 1e6).toFixed(2) + ' Million';
    if (val >= 1000) return Math.round(val).toLocaleString();
    if (val >= 10) return val.toFixed(1);
    return val.toFixed(2);
  };

  const formatTimer = (secs: number) => {
    const s = Math.floor(secs % 60);
    const m = Math.floor((secs / 60) % 60);
    const h = Math.floor(secs / 3600);
    return `${h > 0 ? `${h}h ` : ''}${m}m ${s}s`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 overflow-y-auto select-none rounded-xl border border-neutral-800 shadow-2xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">⏱️</span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Life in Real Time</h2>
            <div className="text-xs text-neutral-400">
              Watch what happens to humanity and the universe every passing second.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Elapsed Timer Hero */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center space-y-3 shadow-xl">
          <div className="text-xs uppercase tracking-widest font-mono text-neutral-400">
            Observation Time Elapsed
          </div>
          <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 tabular-nums">
            {formatTimer(elapsedSeconds)}
          </div>

          {/* Quick jump presets */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { label: 'Realtime (1x)', val: 0, mult: 1 },
              { label: '1 Minute', val: 60, mult: 1 },
              { label: '1 Hour', val: 3600, mult: 1 },
              { label: '1 Day', val: 86400, mult: 1 },
              { label: '1 Year', val: 31536000, mult: 1 },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  handlePreset(p.val);
                  setMultiplier(p.mult);
                }}
                className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-xs text-neutral-300 font-medium rounded-lg transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Real-time Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STATS.map((stat) => {
            const currentTotal = stat.ratePerSecond * elapsedSeconds;
            return (
              <div
                key={stat.id}
                className="p-5 bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 rounded-2xl flex flex-col justify-between space-y-3 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                    {stat.emoji}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-500">
                    {stat.category}
                  </span>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                    {formatNumber(currentTotal)}
                  </div>
                  <div className="text-xs font-semibold text-neutral-300 mt-1">
                    {stat.name}
                  </div>
                </div>

                <div className="text-[11px] text-neutral-500 font-mono pt-2 border-t border-neutral-900">
                  +{(stat.ratePerSecond).toLocaleString()} {stat.unit} / sec
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
