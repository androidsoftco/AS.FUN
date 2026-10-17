import React, { useState, useEffect } from 'react';
import { Layers, RotateCcw, FastForward, Play, Pause, ChevronRight } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface Milestone {
  fold: number;
  name: string;
  emoji: string;
  distance: string;
  description: string;
}

const MILESTONES: Milestone[] = [
  { fold: 0, name: 'Single Sheet of Paper', emoji: '📄', distance: '0.1 mm', description: 'Standard printer paper thickness.' },
  { fold: 1, name: 'Grain of Fine Sand', emoji: '🏖️', distance: '0.2 mm', description: 'Barely perceptible between two fingers.' },
  { fold: 4, name: 'US Penny', emoji: '🪙', distance: '1.6 mm', description: 'About the thickness of a coin.' },
  { fold: 7, name: 'School Notebook', emoji: '📓', distance: '1.28 cm', description: 'A thick college ruled pad.' },
  { fold: 11, name: 'Basketball Diameter', emoji: '🏀', distance: '20.5 cm', description: 'Easily palpable in both hands.' },
  { fold: 14, name: 'Human Height', emoji: '🧍', distance: '1.64 m', description: 'Taller than an average adult.' },
  { fold: 17, name: '4-Story Apartment', emoji: '🏢', distance: '13.1 m', description: 'Reaching over the rooftop.' },
  { fold: 20, name: 'Statue of Liberty', emoji: '🗽', distance: '104.8 m', description: 'From pedestal to torch.' },
  { fold: 23, name: 'Burj Khalifa', emoji: '🏙️', distance: '839 m', description: 'The tallest skyscraper on Earth.' },
  { fold: 27, name: 'Mount Everest', emoji: '🏔️', distance: '13.4 km', description: 'Higher than commercial jets cruise.' },
  { fold: 30, name: 'Outer Space (Kármán Line)', emoji: '🚀', distance: '107.3 km', description: 'You have left Earth’s atmosphere.' },
  { fold: 35, name: 'Diameter of the Moon', emoji: '🌕', distance: '3,436 km', description: 'Across the entire lunar surface.' },
  { fold: 42, name: 'The Moon (Touchdown!)', emoji: '👨‍🚀', distance: '439,804 km', description: 'In just 42 folds, you reached Earth’s celestial neighbor!' },
  { fold: 51, name: 'Planet Mars', emoji: '🪐', distance: '225 Million km', description: 'Cruising past the Red Planet.' },
  { fold: 55, name: 'Edge of Solar System', emoji: '🌌', distance: '3.6 Billion km', description: 'Beyond Neptune and Pluto.' },
  { fold: 68, name: '1 Light Year', emoji: '✨', distance: '9.46 Trillion km', description: 'The cosmic interstellar void.' },
  { fold: 81, name: 'Milky Way Galactic Center', emoji: '🌠', distance: '25,000 Light Years', description: 'Orbiting the supermassive black hole.' },
  { fold: 90, name: 'Andromeda Galaxy', emoji: '🛸', distance: '2.5 Million Light Years', description: 'Our neighboring spiral galaxy.' },
  { fold: 103, name: 'Observable Universe', emoji: '🎆', distance: '93 Billion Light Years', description: 'The outer edge of all spacetime we can observe.' },
];

export default function PaperFold() {
  const [folds, setFolds] = useState(0);
  const [isAutoFolding, setIsAutoFolding] = useState(false);

  // Thickness in mm = 0.1 * 2^folds
  const formatThickness = (n: number) => {
    if (n === 0) return '0.1 mm';
    const mm = 0.1 * Math.pow(2, n);
    if (mm < 10) return `${mm.toFixed(2)} mm`;
    if (mm < 1000) return `${(mm / 10).toFixed(2)} cm`;
    if (mm < 1_000_000) return `${(mm / 1000).toFixed(2)} meters`;
    if (mm < 1_000_000_000) return `${(mm / 1_000_000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
    if (n < 68) return `${(mm / 1_000_000).toExponential(2)} km`;
    const lightYears = mm / (9.461e12 * 1_000_000);
    return `${lightYears.toExponential(2)} Light Years`;
  };

  const handleFold = () => {
    if (folds >= 103) return;
    soundManager.playFold();
    setFolds((f) => f + 1);
  };

  const handleUnfold = () => {
    if (folds <= 0) return;
    soundManager.playFold();
    setFolds((f) => f - 1);
  };

  const handleReset = () => {
    soundManager.playPop(300);
    setFolds(0);
    setIsAutoFolding(false);
  };

  // Auto folding loop
  useEffect(() => {
    if (!isAutoFolding) return;
    const interval = setInterval(() => {
      setFolds((f) => {
        if (f >= 103) {
          setIsAutoFolding(false);
          return f;
        }
        soundManager.playFold();
        return f + 1;
      });
    }, 180);
    return () => clearInterval(interval);
  }, [isAutoFolding]);

  // Current or closest milestone
  const currentMilestone = [...MILESTONES].reverse().find((m) => m.fold <= folds) || MILESTONES[0];
  const nextMilestone = MILESTONES.find((m) => m.fold > folds);

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 overflow-y-auto select-none rounded-xl border border-neutral-800 shadow-2xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">📄</span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Paper Folding to the Moon</h2>
            <div className="text-xs text-neutral-400">
              Each fold doubles the thickness. How many folds to reach the Moon?
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            Folds: <span className="font-semibold text-amber-400 font-mono text-sm">{folds}</span> / 103
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-8 flex flex-col items-center justify-between space-y-8">
        {/* Central Display Card */}
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
          <div className="text-xs uppercase tracking-widest font-mono text-neutral-400">
            Total Stack Thickness
          </div>
          <div className="text-3xl sm:text-5xl font-black font-mono text-amber-400 tabular-nums">
            {formatThickness(folds)}
          </div>

          {/* Current Milestone Highlight */}
          <div className="pt-4 border-t border-neutral-800/80 flex flex-col items-center space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentMilestone.emoji}</span>
              <span className="text-lg font-bold text-white">{currentMilestone.name}</span>
            </div>
            <p className="text-xs text-neutral-400 max-w-md">
              {currentMilestone.description} ({currentMilestone.distance})
            </p>
          </div>

          {nextMilestone && (
            <div className="text-[11px] text-neutral-500 font-mono">
              Next milestone: {nextMilestone.name} at Fold {nextMilestone.fold} ({nextMilestone.fold - folds} folds away)
            </div>
          )}
        </div>

        {/* Paper visualizer representation */}
        <div className="w-full flex items-center justify-center py-6">
          <div className="relative w-48 h-32 flex items-center justify-center">
            {/* Visual sheet layer representation */}
            {Array.from({ length: Math.min(18, Math.max(1, folds)) }).map((_, i) => (
              <div
                key={i}
                style={{
                  transform: `translateY(${-i * 3.5}px) scale(${1 - i * 0.015})`,
                  zIndex: 20 - i,
                }}
                className="absolute w-40 h-24 bg-gradient-to-br from-neutral-100 to-neutral-300 rounded-lg shadow-md border border-neutral-400/30 transition-transform duration-150"
              />
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full">
          <button
            onClick={handleUnfold}
            disabled={folds === 0}
            className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-40 text-neutral-200 font-semibold text-xs rounded-xl transition-all cursor-pointer active:scale-95"
          >
            Unfold Once
          </button>

          <button
            onClick={handleFold}
            disabled={folds >= 103}
            className="px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-extrabold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          >
            <span>Fold Paper in Half!</span>
          </button>

          <button
            onClick={() => setIsAutoFolding(!isAutoFolding)}
            className="px-5 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs rounded-xl transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            {isAutoFolding ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isAutoFolding ? 'Pause Auto' : 'Auto Fold'}</span>
          </button>
        </div>

        {/* Slider for quick scrubbing */}
        <div className="w-full max-w-lg space-y-1">
          <div className="flex justify-between text-xs text-neutral-400 font-mono">
            <span>Fold 0 (Single Sheet)</span>
            <span>Fold 42 (Moon)</span>
            <span>Fold 103 (Universe)</span>
          </div>
          <input
            type="range"
            min="0"
            max="103"
            value={folds}
            onChange={(e) => {
              setFolds(Number(e.target.value));
              soundManager.playFold();
            }}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
