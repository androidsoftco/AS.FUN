import React, { useState, useRef, useEffect } from 'react';
import { Flame, Compass, ShieldAlert, Waves, Wind, Activity, Play, RotateCcw } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface AsteroidConfig {
  composition: 'iron' | 'stone' | 'gold' | 'ice';
  diameter: number; // in meters (10 to 10000)
  speed: number; // in km/s (12 to 72)
  angle: number; // in degrees (15 to 90)
  target: 'city' | 'ocean' | 'desert';
}

export default function AsteroidImpact() {
  const [config, setConfig] = useState<AsteroidConfig>({
    composition: 'stone',
    diameter: 300,
    speed: 25,
    angle: 45,
    target: 'city',
  });

  const [isSimulating, setIsSimulating] = useState(false);
  const [hasImpacted, setHasImpacted] = useState(false);
  const [activeTab, setActiveTab] = useState<'crater' | 'fireball' | 'shockwave' | 'seismic' | 'tsunami'>('crater');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Density lookup (kg/m3)
  const densities = {
    ice: 1000,
    stone: 3000,
    iron: 8000,
    gold: 19300,
  };

  // Kinetic energy calculation: E = 0.5 * m * v^2
  // Volume = 4/3 * pi * r^3
  const radius = config.diameter / 2;
  const volume = (4 / 3) * Math.PI * Math.pow(radius, 3);
  const mass = volume * densities[config.composition]; // kg
  const velocityMs = config.speed * 1000; // m/s
  const energyJoules = 0.5 * mass * Math.pow(velocityMs, 2);
  const energyMegatons = energyJoules / 4.184e15; // 1 megaton TNT = 4.184 x 10^15 J

  // Scaled impact results
  const craterDiameterKm = Math.max(0.05, 1.161 * Math.pow(energyJoules, 0.28) / 1000).toFixed(2);
  const craterDepthM = Math.round(Number(craterDiameterKm) * 220);
  const fireballRadiusKm = (0.002 * Math.pow(energyJoules, 0.32)).toFixed(1);
  const shockwaveRadiusKm = (0.003 * Math.pow(energyJoules, 0.30)).toFixed(1);
  const earthquakeMagnitude = Math.min(10, Math.max(2.0, 0.67 * Math.log10(energyJoules) - 5.87)).toFixed(1);
  const tsunamiWaveHeightM = config.target === 'ocean' ? Math.round(Math.min(500, Math.pow(energyMegatons, 0.35) * 15)) : 0;

  // Run Canvas Animation
  useEffect(() => {
    if (!isSimulating) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    const maxFrames = 75;
    let animId: number;

    const render = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Sky gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(0.7, '#1e1b4b');
      skyGrad.addColorStop(1, config.target === 'ocean' ? '#0c4a6e' : config.target === 'desert' ? '#78350f' : '#18181b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Target terrain silhouette
      ctx.fillStyle = config.target === 'ocean' ? '#0369a1' : config.target === 'desert' ? '#d97706' : '#27272a';
      ctx.beginPath();
      ctx.moveTo(0, h * 0.78);
      ctx.lineTo(w, h * 0.78);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.fill();

      // City skyline buildings if city
      if (config.target === 'city') {
        ctx.fillStyle = '#3f3f46';
        const bldgs = [
          { x: 40, w: 30, h: 60 },
          { x: 90, w: 45, h: 110 },
          { x: 150, w: 25, h: 40 },
          { x: 200, w: 60, h: 140 },
          { x: 280, w: 35, h: 80 },
          { x: 340, w: 50, h: 120 },
          { x: 420, w: 40, h: 90 },
          { x: 490, w: 55, h: 130 },
          { x: 570, w: 40, h: 70 },
        ];
        bldgs.forEach((b) => {
          ctx.fillRect(b.x, h * 0.78 - b.h, b.w, b.h);
        });
      }

      // Asteroid flight phase (frames 0 to 30)
      if (frame < 30) {
        const progress = frame / 30;
        const impactX = w * 0.55;
        const impactY = h * 0.78;
        const startX = impactX - Math.cos((config.angle * Math.PI) / 180) * 450;
        const startY = impactY - Math.sin((config.angle * Math.PI) / 180) * 450;

        const curX = startX + (impactX - startX) * progress;
        const curY = startY + (impactY - startY) * progress;

        // Meteor trail
        const trailGrad = ctx.createLinearGradient(curX, curY, startX, startY);
        trailGrad.addColorStop(0, '#fef08a');
        trailGrad.addColorStop(0.3, '#f97316');
        trailGrad.addColorStop(1, 'transparent');
        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = Math.max(3, config.diameter / 50);
        ctx.beginPath();
        ctx.moveTo(curX, curY);
        ctx.lineTo(startX + (impactX - startX) * Math.max(0, progress - 0.35), startY + (impactY - startY) * Math.max(0, progress - 0.35));
        ctx.stroke();

        // Meteor head
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(curX, curY, Math.max(4, config.diameter / 60), 0, Math.PI * 2);
        ctx.fill();
      }

      // Impact phase (frame 30+)
      if (frame >= 30) {
        if (frame === 30) {
          soundManager.playBoom();
        }

        const impactFrame = frame - 30;
        const impactX = w * 0.55;
        const impactY = h * 0.78;

        // Shockwave ring
        const maxWaveR = w * 0.45;
        const waveR = Math.min(maxWaveR, impactFrame * 9);
        const waveAlpha = Math.max(0, 1 - waveR / maxWaveR);

        ctx.strokeStyle = `rgba(255, 255, 255, ${waveAlpha * 0.8})`;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(impactX, impactY, waveR, 0, Math.PI * 2);
        ctx.stroke();

        // Fireball dome
        const fireballR = Math.min(w * 0.25, impactFrame * 6);
        const fbAlpha = Math.max(0, 1 - impactFrame / 40);
        const fbGrad = ctx.createRadialGradient(impactX, impactY, 5, impactX, impactY, fireballR);
        fbGrad.addColorStop(0, `rgba(255, 255, 255, ${fbAlpha})`);
        fbGrad.addColorStop(0.3, `rgba(251, 191, 36, ${fbAlpha * 0.9})`);
        fbGrad.addColorStop(0.7, `rgba(239, 68, 68, ${fbAlpha * 0.7})`);
        fbGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = fbGrad;
        ctx.beginPath();
        ctx.arc(impactX, impactY, fireballR, 0, Math.PI * 2);
        ctx.fill();
      }

      if (frame < maxFrames) {
        animId = requestAnimationFrame(render);
      } else {
        setIsSimulating(false);
        setHasImpacted(true);
      }
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [isSimulating, config]);

  const handleLaunch = () => {
    setIsSimulating(true);
    setHasImpacted(false);
    soundManager.playPop(480);
  };

  const handleReset = () => {
    setIsSimulating(false);
    setHasImpacted(false);
    soundManager.playPop(300);
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 overflow-y-auto select-none rounded-xl border border-neutral-800 shadow-2xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">☄️</span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Cosmic Asteroid Simulator</h2>
            <div className="text-xs text-neutral-400">
              Customize an asteroid and simulate its apocalyptic impact physics.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            Yield: <span className="font-semibold text-rose-400">{energyMegatons > 1000 ? `${(energyMegatons / 1000).toFixed(1)} GT` : `${energyMegatons.toFixed(1)} MT`}</span>
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

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Parameters Controls */}
        <div className="w-full lg:w-80 bg-neutral-950 border-r border-neutral-800 p-5 space-y-5 overflow-y-auto shrink-0">
          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Composition
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'ice', label: 'Comet (Ice)', emoji: '🧊' },
                { id: 'stone', label: 'Dense Rock', emoji: '🪨' },
                { id: 'iron', label: 'Iron-Nickel', emoji: '⚙️' },
                { id: 'gold', label: 'Dense Gold', emoji: '🪙' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setConfig((p) => ({ ...p, composition: c.id as AsteroidConfig['composition'] }));
                    soundManager.playPop(400);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 text-xs rounded-xl border transition-all text-left ${
                    config.composition === c.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span className="truncate">{c.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
              <span>Diameter</span>
              <span className="font-mono text-amber-400">
                {config.diameter >= 1000 ? `${(config.diameter / 1000).toFixed(1)} km` : `${config.diameter} m`}
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="5000"
              step="20"
              value={config.diameter}
              onChange={(e) => setConfig((p) => ({ ...p, diameter: Number(e.target.value) }))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
              <span>20m (Chelyabinsk)</span>
              <span>1km (Canyon)</span>
              <span>5km (Extinction)</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
              <span>Impact Velocity</span>
              <span className="font-mono text-amber-400">{config.speed} km/s</span>
            </div>
            <input
              type="range"
              min="12"
              max="72"
              value={config.speed}
              onChange={(e) => setConfig((p) => ({ ...p, speed: Number(e.target.value) }))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-neutral-300 mb-1">
              <span>Impact Angle</span>
              <span className="font-mono text-amber-400">{config.angle}°</span>
            </div>
            <input
              type="range"
              min="15"
              max="90"
              value={config.angle}
              onChange={(e) => setConfig((p) => ({ ...p, angle: Number(e.target.value) }))}
              className="w-full accent-amber-500 cursor-pointer"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-neutral-300 block mb-2">
              Target Environment
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'city', label: 'Metropolis', emoji: '🏙️' },
                { id: 'ocean', label: 'Ocean', emoji: '🌊' },
                { id: 'desert', label: 'Desert', emoji: '🏜️' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setConfig((p) => ({ ...p, target: t.id as AsteroidConfig['target'] }));
                    soundManager.playPop(420);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 text-xs rounded-xl border transition-all ${
                    config.target === t.id
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-semibold'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  <span className="text-lg">{t.emoji}</span>
                  <span className="text-[11px]">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleLaunch}
            disabled={isSimulating}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:opacity-50 text-neutral-950 font-bold text-sm rounded-xl shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Asteroid</span>
          </button>
        </div>

        {/* Right Side: Simulation Canvas & Impact Breakdown */}
        <div className="flex-1 flex flex-col overflow-hidden bg-neutral-950">
          {/* Animated Canvas */}
          <div className="h-64 sm:h-72 w-full relative bg-neutral-950 border-b border-neutral-800">
            <canvas
              ref={canvasRef}
              width={700}
              height={300}
              className="w-full h-full object-cover"
            />
            {!isSimulating && !hasImpacted && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                <span className="text-xs font-mono text-neutral-400 bg-neutral-900/90 px-3 py-1.5 rounded-lg border border-neutral-800">
                  Ready to launch. Press "Launch Asteroid" to simulate.
                </span>
              </div>
            )}
          </div>

          {/* Damage Report Tabs & Stats */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            <div className="flex items-center gap-2 border-b border-neutral-800 pb-3 overflow-x-auto">
              {[
                { id: 'crater', label: 'Crater', icon: ShieldAlert },
                { id: 'fireball', label: 'Fireball', icon: Flame },
                { id: 'shockwave', label: 'Shockwave', icon: Wind },
                { id: 'seismic', label: 'Earthquake', icon: Activity },
                ...(config.target === 'ocean' ? [{ id: 'tsunami', label: 'Mega Tsunami', icon: Waves }] : []),
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as typeof activeTab);
                      soundManager.playPop(500);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
                      active
                        ? 'bg-neutral-800 text-amber-300 border border-neutral-700'
                        : 'text-neutral-400 hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Details */}
            {activeTab === 'crater' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Crater Width</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">{craterDiameterKm} km</div>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Crater Depth</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">{craterDepthM.toLocaleString()} m</div>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Vaporized Mass</div>
                    <div className="text-xl font-bold font-mono text-rose-400 mt-1">{(mass / 1e9).toFixed(2)} Megatons</div>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Upon hypervelocity touchdown, the kinetic compression excavates a bowl-shaped transient cavity, melting bedrock and throwing millions of tons of ejecta into the upper stratosphere.
                </p>
              </div>
            )}

            {activeTab === 'fireball' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Fireball Radius</div>
                    <div className="text-xl font-bold font-mono text-amber-400 mt-1">{fireballRadiusKm} km</div>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Thermal Radiation</div>
                    <div className="text-xl font-bold font-mono text-rose-400 mt-1">3rd-Degree Burns</div>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Within the thermal fireball zone, radiation is several times brighter than the Sun. Unshielded clothing ignites instantly, and trees combust spontaneously.
                </p>
              </div>
            )}

            {activeTab === 'shockwave' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Blast Wave Radius</div>
                    <div className="text-xl font-bold font-mono text-white mt-1">{shockwaveRadiusKm} km</div>
                  </div>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                    <div className="text-[10px] text-neutral-400 uppercase font-mono">Overpressure Peak</div>
                    <div className="text-xl font-bold font-mono text-rose-400 mt-1">Collapses Multi-Story Bldgs</div>
                  </div>
                </div>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  The hypersonic atmospheric blast creates hurricane-velocity wind shears exceeding 800 km/h, shattering glass across entire counties.
                </p>
              </div>
            )}

            {activeTab === 'seismic' && (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Seismic Magnitude</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">Magnitude {earthquakeMagnitude}</div>
                  <div className="text-xs text-neutral-400 mt-1">Felt worldwide on planetary seismographs</div>
                </div>
              </div>
            )}

            {activeTab === 'tsunami' && (
              <div className="space-y-3">
                <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="text-[10px] text-neutral-400 uppercase font-mono">Coastal Tsunami Height</div>
                  <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">{tsunamiWaveHeightM} meters high</div>
                  <div className="text-xs text-neutral-400 mt-1">Submerges coastal lowlands across the basin</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
