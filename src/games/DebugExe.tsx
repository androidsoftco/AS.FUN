import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Download, Github, Sparkles, Check, RotateCcw, Monitor } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HistoryEntry {
  type: 'input' | 'output' | 'system' | 'success' | 'error';
  text: string;
}

export default function DebugExe() {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { type: 'system', text: 'AS.FUN BIOS v3.44 (C) 2026 AS.FUN CORP.' },
    { type: 'system', text: 'Loading AS.FUN_DEBUG.EXE from /public/AS.FUN_DEBUG.EXE...' },
    { type: 'success', text: 'EXECUTABLE INITIALIZED SUCCESSFULLY. 8 GAMES DETECTED IN MEMORY.' },
    { type: 'output', text: 'Type "help" for a list of available debug commands or "github" to inspect the repository.' },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [crtEffect, setCrtEffect] = useState(true);
  const [matrixMode, setMatrixMode] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll terminal to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  // Keep focus on input
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  const handleDownloadExe = () => {
    soundManager.playCash();
    const link = document.createElement('a');
    link.href = '/AS.FUN_DEBUG.EXE';
    link.download = 'AS.FUN_DEBUG.EXE';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setHistory((prev) => [
      ...prev,
      { type: 'system', text: '> TRIGGERED BROWSER DOWNLOAD: AS.FUN_DEBUG.EXE' },
      { type: 'success', text: 'File saved to your local machine: /AS.FUN_DEBUG.EXE' },
    ]);
  };

  const executeCommand = (cmd: string) => {
    const clean = cmd.trim();
    if (!clean) return;

    soundManager.playPop(600);

    const newEntries: HistoryEntry[] = [{ type: 'input', text: `C:\\AS.FUN> ${clean}` }];
    const lower = clean.toLowerCase();

    if (lower === 'help') {
      newEntries.push(
        { type: 'output', text: 'AVAILABLE DEBUG COMMANDS:' },
        { type: 'output', text: '  github           - Show GitHub repo information and clone links' },
        { type: 'output', text: '  download         - Download the AS.FUN_DEBUG.EXE file to your PC' },
        { type: 'output', text: '  unlock-alchemy   - Cheat: Unlock all 100+ elements in Infinite Alchemy' },
        { type: 'output', text: '  reset-alchemy    - Reset alchemy progress back to basic 4 elements' },
        { type: 'output', text: '  games            - List all registered minigames in AS.FUN' },
        { type: 'output', text: '  matrix           - Toggle retro Matrix falling digital rain' },
        { type: 'output', text: '  whoami           - Display current session credentials' },
        { type: 'output', text: '  ping             - Ping AS.FUN server host' },
        { type: 'output', text: '  clear            - Clear terminal screen' }
      );
    } else if (lower === 'github' || lower === 'repo') {
      soundManager.playSuccess();
      newEntries.push(
        { type: 'success', text: '==================================================' },
        { type: 'success', text: '        AS.FUN OFFICIAL GITHUB REPOSITORY         ' },
        { type: 'success', text: '==================================================' },
        { type: 'output', text: 'Repository: https://github.com/as-fun/as-fun' },
        { type: 'output', text: 'Branch:     main (production)' },
        { type: 'output', text: 'Executable: /public/AS.FUN_DEBUG.EXE (Binary/Text release)' },
        { type: 'output', text: 'To clone this codebase locally:' },
        { type: 'system', text: '  $ git clone https://github.com/as-fun/as-fun.git' },
        { type: 'system', text: '  $ cd as-fun && npm install && npm run dev' },
        { type: 'output', text: 'Minigames included: 8 interactive games (Alchemy, Password, Spend, Circle, Asteroid, etc.)' }
      );
    } else if (lower === 'download' || lower === 'get exe' || lower === 'exe') {
      handleDownloadExe();
      return;
    } else if (lower === 'unlock-alchemy' || lower === 'unlock all') {
      soundManager.playSuccess();
      try {
        const ALL_ELEMENTS = [
          { id: 'water', name: 'Water', emoji: '💧', category: 'basic' },
          { id: 'fire', name: 'Fire', emoji: '🔥', category: 'basic' },
          { id: 'earth', name: 'Earth', emoji: '🌍', category: 'basic' },
          { id: 'wind', name: 'Wind', emoji: '💨', category: 'basic' },
          { id: 'steam', name: 'Steam', emoji: '♨️', category: 'nature' },
          { id: 'mud', name: 'Mud', emoji: '💩', category: 'nature' },
          { id: 'lava', name: 'Lava', emoji: '🌋', category: 'nature' },
          { id: 'dust', name: 'Dust', emoji: '🌪️', category: 'nature' },
          { id: 'rain', name: 'Rain', emoji: '🌧️', category: 'nature' },
          { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'nature' },
          { id: 'volcano', name: 'Volcano', emoji: '🌋', category: 'nature' },
          { id: 'island', name: 'Island', emoji: '🏝️', category: 'nature' },
          { id: 'continent', name: 'Continent', emoji: '🗺️', category: 'nature' },
          { id: 'planet', name: 'Planet', emoji: '🪐', category: 'cosmic' },
          { id: 'sun', name: 'Sun', emoji: '☀️', category: 'cosmic' },
          { id: 'solarsystem', name: 'Solar System', emoji: '🌌', category: 'cosmic' },
          { id: 'galaxy', name: 'Galaxy', emoji: '🌠', category: 'cosmic' },
          { id: 'universe', name: 'Universe', emoji: '🎆', category: 'cosmic' },
          { id: 'plant', name: 'Plant', emoji: '🌱', category: 'nature' },
          { id: 'flower', name: 'Flower', emoji: '🌸', category: 'nature' },
          { id: 'tree', name: 'Tree', emoji: '🌳', category: 'nature' },
          { id: 'tea', name: 'Tea', emoji: '🍵', category: 'human' },
          { id: 'coffee', name: 'Coffee', emoji: '☕', category: 'human' },
          { id: 'forest', name: 'Forest', emoji: '🌲', category: 'nature' },
          { id: 'diamond', name: 'Diamond', emoji: '💎', category: 'nature' },
          { id: 'cloud', name: 'Cloud', emoji: '☁️', category: 'nature' },
          { id: 'storm', name: 'Storm', emoji: '⛈️', category: 'nature' },
          { id: 'lightning', name: 'Lightning', emoji: '⚡', category: 'nature' },
          { id: 'energy', name: 'Energy', emoji: '⚡', category: 'science' },
          { id: 'life', name: 'Life', emoji: '🧬', category: 'science' },
          { id: 'human', name: 'Human', emoji: '🧑', category: 'human' },
          { id: 'love', name: 'Love', emoji: '❤️', category: 'human' },
          { id: 'chef', name: 'Chef', emoji: '👨‍🍳', category: 'human' },
          { id: 'metal', name: 'Metal', emoji: '⚙️', category: 'science' },
          { id: 'steel', name: 'Steel', emoji: '🔩', category: 'science' },
          { id: 'blade', name: 'Blade', emoji: '⚔️', category: 'science' },
          { id: 'electricity', name: 'Electricity', emoji: '⚡', category: 'science' },
          { id: 'wire', name: 'Wire', emoji: '🔌', category: 'science' },
          { id: 'computer', name: 'Computer', emoji: '💻', category: 'science' },
          { id: 'internet', name: 'Internet', emoji: '🌐', category: 'science' },
          { id: 'ai', name: 'Artificial Intelligence', emoji: '🤖', category: 'science' },
          { id: 'dragon', name: 'Dragon', emoji: '🐉', category: 'magic' },
          { id: 'dinosaur', name: 'Dinosaur', emoji: '🦖', category: 'nature' },
          { id: 'rocket', name: 'Rocket', emoji: '🚀', category: 'science' },
          { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', category: 'human' },
          { id: 'pizza', name: 'Pizza', emoji: '🍕', category: 'human' },
          { id: 'blackhole', name: 'Black Hole', emoji: '🕳️', category: 'cosmic' },
          { id: 'wizard', name: 'Wizard', emoji: '🧙‍♂️', category: 'magic' },
          { id: 'alien', name: 'Alien', emoji: '👽', category: 'cosmic' },
          { id: 'ufo', name: 'UFO', emoji: '🛸', category: 'cosmic' },
        ];
        localStorage.setItem('as_fun_alchemy_unlocked', JSON.stringify(ALL_ELEMENTS));
        newEntries.push({ type: 'success', text: `CHEAT ACTIVATED: Unlocked ${ALL_ELEMENTS.length} elements in Infinite Alchemy!` });
      } catch (err) {
        newEntries.push({ type: 'error', text: 'Error accessing localStorage.' });
      }
    } else if (lower === 'reset-alchemy') {
      try {
        localStorage.removeItem('as_fun_alchemy_unlocked');
        newEntries.push({ type: 'success', text: 'Alchemy progress reset to standard 4 elements.' });
      } catch {
        newEntries.push({ type: 'error', text: 'Failed to reset.' });
      }
    } else if (lower === 'games') {
      newEntries.push(
        { type: 'output', text: 'ACTIVE AS.FUN MINIGAMES:' },
        { type: 'output', text: '  1. Infinite Alchemy (Hash: #alchemy)' },
        { type: 'output', text: '  2. The Password Game (Hash: #password)' },
        { type: 'output', text: '  3. Spend a Billionaire\'s Fortune (Hash: #spend)' },
        { type: 'output', text: '  4. Draw a Perfect Circle (Hash: #circle)' },
        { type: 'output', text: '  5. Cosmic Asteroid Simulator (Hash: #asteroid)' },
        { type: 'output', text: '  6. Paper Folding to the Moon (Hash: #paper)' },
        { type: 'output', text: '  7. Life in Real Time (Hash: #stats)' },
        { type: 'output', text: '  8. Who Was Alive? (Hash: #history)' },
        { type: 'output', text: '  9. AS.FUN DEBUG.EXE (Hash: #debug)' }
      );
    } else if (lower === 'matrix') {
      setMatrixMode(!matrixMode);
      newEntries.push({ type: 'success', text: `Matrix digital rain mode ${!matrixMode ? 'ENABLED' : 'DISABLED'}.` });
    } else if (lower === 'whoami') {
      newEntries.push(
        { type: 'output', text: 'USER: guest@as.fun' },
        { type: 'output', text: 'LEVEL: Root Administrator / Debug Operator' },
        { type: 'output', text: 'ACCESS: ALL SYSTEMS ONLINE' }
      );
    } else if (lower === 'ping') {
      newEntries.push(
        { type: 'output', text: 'Pinging as.fun [127.0.0.1] with 32 bytes of data:' },
        { type: 'output', text: 'Reply from 127.0.0.1: bytes=32 time<1ms TTL=128' },
        { type: 'output', text: 'Reply from 127.0.0.1: bytes=32 time<1ms TTL=128' },
        { type: 'success', text: 'Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)' }
      );
    } else if (lower === 'clear' || lower === 'cls') {
      setHistory([]);
      return;
    } else {
      newEntries.push({
        type: 'error',
        text: `Command not recognized: "${clean}". Type "help" for a list of available commands.`,
      });
    }

    setHistory((prev) => [...prev, ...newEntries]);
    setInputVal('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(inputVal);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-black text-emerald-400 font-mono select-none overflow-hidden rounded-xl border border-emerald-900 shadow-2xl relative">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-900/80 bg-neutral-950 text-xs">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span className="font-bold text-white tracking-wider">C:\AS.FUN\DEBUG.EXE</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded">
            v1.0.4-RELEASE
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setCrtEffect(!crtEffect)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
              crtEffect
                ? 'bg-emerald-950 border-emerald-700 text-emerald-300'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>CRT {crtEffect ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => executeCommand('github')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 border border-emerald-900 text-neutral-200 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub</span>
          </button>

          <button
            onClick={handleDownloadExe}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-lg text-xs transition-all shadow-md shadow-emerald-950 cursor-pointer active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download EXE</span>
          </button>
        </div>
      </div>

      {/* Main Terminal Viewport */}
      <div
        onClick={handleTerminalClick}
        className={`flex-1 p-5 overflow-y-auto space-y-2 relative cursor-text text-xs sm:text-sm leading-relaxed ${
          crtEffect ? 'crt-scanlines' : ''
        }`}
        style={{
          background: matrixMode
            ? 'radial-gradient(ellipse at center, #022c22 0%, #000000 80%)'
            : '#050805',
        }}
      >
        {/* Subtle scanline overlay style if CRT is on */}
        {crtEffect && (
          <div
            className="absolute inset-0 pointer-events-none opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.75) 50%)',
              backgroundSize: '100% 4px',
            }}
          />
        )}

        {/* History lines */}
        {history.map((h, i) => (
          <div
            key={i}
            className={`${
              h.type === 'input'
                ? 'text-white font-bold'
                : h.type === 'system'
                ? 'text-neutral-400'
                : h.type === 'success'
                ? 'text-amber-400 font-semibold'
                : h.type === 'error'
                ? 'text-rose-400'
                : 'text-emerald-400'
            }`}
          >
            {h.text}
          </div>
        ))}

        {/* Current Active Input Prompt */}
        <div className="flex items-center gap-2 pt-1 text-white">
          <span className="text-emerald-400 font-bold">C:\AS.FUN&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            className="flex-1 bg-transparent border-none outline-none text-emerald-300 font-mono text-xs sm:text-sm caret-emerald-400"
          />
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Footer shortcut bar */}
      <div className="px-5 py-2.5 bg-neutral-950 border-t border-emerald-950 flex flex-wrap items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-3">
          <span>Quick actions:</span>
          <button
            onClick={() => executeCommand('github')}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            github
          </button>
          <span>·</span>
          <button
            onClick={() => executeCommand('download')}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            download
          </button>
          <span>·</span>
          <button
            onClick={() => executeCommand('unlock-alchemy')}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            unlock-alchemy
          </button>
          <span>·</span>
          <button
            onClick={() => executeCommand('matrix')}
            className="text-emerald-400 hover:underline cursor-pointer"
          >
            matrix
          </button>
        </div>
        <div className="text-neutral-500">File: /public/AS.FUN_DEBUG.EXE</div>
      </div>
    </div>
  );
}
