import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Dices,
  ArrowLeft,
  Search,
  Sparkles,
  Play,
  RotateCcw,
  Zap,
  Terminal,
} from 'lucide-react';
import { soundManager } from './utils/sound';
import AlchemyCraft from './games/AlchemyCraft';
import PasswordGame from './games/PasswordGame';
import SpendMoney from './games/SpendMoney';
import PerfectCircle from './games/PerfectCircle';
import AsteroidImpact from './games/AsteroidImpact';
import PaperFold from './games/PaperFold';
import LifeInRealtime from './games/LifeInRealtime';
import WhoWasAlive from './games/WhoWasAlive';
import DebugExe from './games/DebugExe';

export interface GameMetadata {
  id: string;
  hash: string;
  title: string;
  emoji: string;
  tagline: string;
  category: 'sandbox' | 'puzzle' | 'simulator';
  badge?: string;
  accent: string;
}

const GAMES: GameMetadata[] = [
  {
    id: 'alchemy',
    hash: '#alchemy',
    title: 'Infinite Alchemy',
    emoji: '🧪',
    tagline: 'Combine 4 basic elements to craft everything from coffee and dinosaurs to the entire universe.',
    category: 'sandbox',
    badge: 'Popular',
    accent: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400',
  },
  {
    id: 'password',
    hash: '#password',
    title: 'The Password Game',
    emoji: '🔑',
    tagline: 'Please choose a password. Satisfy a relentless stream of increasingly absurd mathematical and astronomical rules.',
    category: 'puzzle',
    badge: 'Viral',
    accent: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 hover:border-rose-400',
  },
  {
    id: 'spend',
    hash: '#spend',
    title: "Spend a Billionaire's Fortune",
    emoji: '💰',
    tagline: 'You have $250,000,000,000 in your bank account. Try to spend every last cent on yachts, sports teams, and skyscrapers.',
    category: 'simulator',
    badge: 'Classic',
    accent: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 hover:border-emerald-400',
  },
  {
    id: 'circle',
    hash: '#circle',
    title: 'Draw a Perfect Circle',
    emoji: '⭕',
    tagline: 'Test your freehand drawing precision against mathematical circularity algorithms in one continuous stroke.',
    category: 'puzzle',
    accent: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 hover:border-sky-400',
  },
  {
    id: 'asteroid',
    hash: '#asteroid',
    title: 'Cosmic Asteroid Simulator',
    emoji: '☄️',
    tagline: 'Configure an asteroid by size, density, velocity, and angle, then simulate the apocalyptic impact and shockwave.',
    category: 'simulator',
    accent: 'from-red-500/20 to-orange-500/20 border-red-500/30 hover:border-red-400',
  },
  {
    id: 'paper',
    hash: '#paper',
    title: 'Paper Folding to the Moon',
    emoji: '📄',
    tagline: 'A standard sheet of paper is 0.1mm thick. Double it with each fold: how many folds until you reach outer space and the Moon?',
    category: 'simulator',
    accent: 'from-violet-500/20 to-purple-500/20 border-violet-500/30 hover:border-violet-400',
  },
  {
    id: 'stats',
    hash: '#stats',
    title: 'Life in Real Time',
    emoji: '⏱️',
    tagline: 'A hypnotic live ticker tracking what happens on Earth and across the cosmos with every passing second.',
    category: 'simulator',
    accent: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30 hover:border-cyan-400',
  },
  {
    id: 'history',
    hash: '#history',
    title: 'Who Was Alive?',
    emoji: '⌛',
    tagline: 'Scrub through historical years from 1450 to 2026 to discover famous figures who lived and breathed at the exact same moment.',
    category: 'simulator',
    accent: 'from-yellow-500/20 to-amber-500/20 border-yellow-500/30 hover:border-yellow-400',
  },
  {
    id: 'debug',
    hash: '#debug',
    title: 'AS.FUN DEBUG.EXE',
    emoji: '💾',
    tagline: 'Retro DOS debug console and memory explorer. Inspect GitHub repo links, activate game cheats, or download the EXE.',
    category: 'sandbox',
    badge: 'Secret EXE',
    accent: 'from-emerald-500/20 to-lime-500/20 border-emerald-500/30 hover:border-emerald-400',
  },
];

export default function App() {
  const [activeGameId, setActiveGameId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      const matched = GAMES.find((g) => g.hash === hash);
      return matched ? matched.id : null;
    }
    return null;
  });

  const [isMuted, setIsMuted] = useState(() => soundManager.isMuted());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'sandbox' | 'puzzle' | 'simulator'>('all');

  // Sync Hash in URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      const matched = GAMES.find((g) => g.hash === hash);
      setActiveGameId(matched ? matched.id : null);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openGame = (id: string) => {
    soundManager.playPop(520);
    const game = GAMES.find((g) => g.id === id);
    if (game) {
      window.location.hash = game.hash;
      setActiveGameId(id);
    }
  };

  const closeGame = () => {
    soundManager.playPop(380);
    window.location.hash = '';
    setActiveGameId(null);
  };

  const toggleSound = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  const playRandomGame = () => {
    const others = GAMES.filter((g) => g.id !== activeGameId);
    const random = others[Math.floor(Math.random() * others.length)];
    openGame(random.id);
  };

  // Keyboard shortcut listener (Esc to return, M to toggle sound)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeGameId) {
        closeGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeGameId]);

  const activeGame = GAMES.find((g) => g.id === activeGameId);

  const filteredGames = GAMES.filter((g) => {
    const matchesCat = selectedCategory === 'all' || g.category === selectedCategory;
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-amber-400 selection:text-neutral-950">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Brand title wordmark (1 line, single element)
        Zone 2: 4 nav items (whitespace-nowrap)
        Zone 3: 1 primary action cluster (Sound + Random)
      */}
      <header className="sticky top-0 z-50 flex items-center justify-between gap-8 px-6 py-3.5 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => closeGame()}
            className="text-xl font-black tracking-tight text-white flex items-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
          >
            <span>as.fun</span>
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
          </button>
        </div>

        {/* Zone 2: Navigation Links / Game Filter Tabs */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <button
            onClick={() => {
              closeGame();
              setSelectedCategory('all');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              !activeGameId && selectedCategory === 'all' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            All Minigames
          </button>
          <button
            onClick={() => {
              closeGame();
              setSelectedCategory('sandbox');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              !activeGameId && selectedCategory === 'sandbox' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Sandboxes
          </button>
          <button
            onClick={() => {
              closeGame();
              setSelectedCategory('puzzle');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              !activeGameId && selectedCategory === 'puzzle' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Puzzles
          </button>
          <button
            onClick={() => {
              closeGame();
              setSelectedCategory('simulator');
            }}
            className={`transition-colors whitespace-nowrap cursor-pointer ${
              !activeGameId && selectedCategory === 'simulator' ? 'text-white font-semibold' : 'hover:text-neutral-200'
            }`}
          >
            Simulators
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => openGame('debug')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800 text-emerald-300 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95"
            title="Launch AS.FUN DEBUG.EXE console"
          >
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">DEBUG.EXE</span>
          </button>

          <button
            onClick={toggleSound}
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
            className="p-2 text-neutral-400 hover:text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={playRandomGame}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 hover:text-white border border-neutral-700/80 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            <Dices className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Surprise Me</span>
          </button>
        </div>
      </header>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col">
        {activeGame ? (
          /* Active Game Viewport */
          <div className="flex-1 flex flex-col p-3 sm:p-5 max-w-7xl mx-auto w-full h-[calc(100vh-65px)]">
            {/* Game Navigation Subbar */}
            <div className="flex items-center justify-between mb-3 px-1">
              <button
                onClick={closeGame}
                className="flex items-center gap-2 text-xs font-semibold text-neutral-400 hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to All Games (Esc)</span>
              </button>

              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>Playing</span>
                <span className="font-semibold text-neutral-200">{activeGame.title}</span>
              </div>
            </div>

            {/* Active Game Component Canvas Container */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeGame.id === 'alchemy' && <AlchemyCraft />}
              {activeGame.id === 'password' && <PasswordGame />}
              {activeGame.id === 'spend' && <SpendMoney />}
              {activeGame.id === 'circle' && <PerfectCircle />}
              {activeGame.id === 'asteroid' && <AsteroidImpact />}
              {activeGame.id === 'paper' && <PaperFold />}
              {activeGame.id === 'stats' && <LifeInRealtime />}
              {activeGame.id === 'history' && <WhoWasAlive />}
              {activeGame.id === 'debug' && <DebugExe />}
            </div>
          </div>
        ) : (
          /* Hub Landing Screen */
          <div className="max-w-6xl mx-auto w-full px-5 py-8 sm:py-12 flex flex-col space-y-10">
            {/* Hub Hero */}
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white text-balance">
                as.fun
              </h1>
              <p className="text-sm sm:text-base text-neutral-400 text-balance leading-relaxed">
                A playground of curious minigames, playful web experiments, and satisfying interactive toys inspired by the best of the web.
              </p>

              {/* Quick Search and Filter Bar */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3 justify-center">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
                  <input
                    type="text"
                    placeholder="Search minigames..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-neutral-900 border border-neutral-800 rounded-xl overflow-x-auto w-full sm:w-auto">
                  {(['all', 'sandbox', 'puzzle', 'simulator'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        soundManager.playPop(450);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap cursor-pointer ${
                        selectedCategory === cat
                          ? 'bg-neutral-800 text-white shadow-sm'
                          : 'text-neutral-400 hover:text-neutral-200'
                      }`}
                    >
                      {cat === 'all' ? 'All Games' : cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Game Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => openGame(game.id)}
                  className={`group relative p-6 bg-gradient-to-br ${game.accent} bg-neutral-900/60 border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-200 flex flex-col justify-between cursor-pointer active:scale-[0.99] hover:-translate-y-0.5`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-4xl p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 group-hover:scale-110 transition-transform">
                        {game.emoji}
                      </span>
                      {game.badge && (
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 bg-amber-400 text-neutral-950 rounded-lg shadow-sm">
                          {game.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                        {game.title}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                        {game.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-semibold">
                    <span className="text-neutral-500 capitalize">{game.category}</span>
                    <span className="text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Play Now →
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <footer className="pt-12 pb-8 border-t border-neutral-800/60 text-center text-xs text-neutral-500 space-y-2">
              <div className="flex items-center justify-center gap-3">
                <span className="font-bold text-neutral-400">as.fun</span>
                <span>·</span>
                <span>All minigames run offline & client-side</span>
                <span>·</span>
                <span>Built for curious minds</span>
              </div>
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
