import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Trash2, LayoutGrid, Search, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface ElementItem {
  id: string;
  name: string;
  emoji: string;
  category: 'basic' | 'nature' | 'science' | 'human' | 'cosmic' | 'magic';
}

const INITIAL_ELEMENTS: ElementItem[] = [
  { id: 'water', name: 'Water', emoji: '💧', category: 'basic' },
  { id: 'fire', name: 'Fire', emoji: '🔥', category: 'basic' },
  { id: 'earth', name: 'Earth', emoji: '🌍', category: 'basic' },
  { id: 'wind', name: 'Wind', emoji: '💨', category: 'basic' },
];

// Rich recipe book mapping sorted "elemA+elemB" -> ElementItem
const RECIPES: Record<string, ElementItem> = {
  'fire+water': { id: 'steam', name: 'Steam', emoji: '♨️', category: 'nature' },
  'earth+water': { id: 'mud', name: 'Mud', emoji: '💩', category: 'nature' },
  'earth+fire': { id: 'lava', name: 'Lava', emoji: '🌋', category: 'nature' },
  'earth+wind': { id: 'dust', name: 'Dust', emoji: '🌪️', category: 'nature' },
  'water+wind': { id: 'rain', name: 'Rain', emoji: '🌧️', category: 'nature' },
  'fire+rain': { id: 'rainbow', name: 'Rainbow', emoji: '🌈', category: 'nature' },
  'earth+lava': { id: 'volcano', name: 'Volcano', emoji: '🌋', category: 'nature' },
  'volcano+water': { id: 'island', name: 'Island', emoji: '🏝️', category: 'nature' },
  'island+island': { id: 'continent', name: 'Continent', emoji: '🗺️', category: 'nature' },
  'continent+continent': { id: 'planet', name: 'Planet', emoji: '🪐', category: 'cosmic' },
  'fire+planet': { id: 'sun', name: 'Sun', emoji: '☀️', category: 'cosmic' },
  'planet+sun': { id: 'solarsystem', name: 'Solar System', emoji: '🌌', category: 'cosmic' },
  'solarsystem+solarsystem': { id: 'galaxy', name: 'Galaxy', emoji: '🌠', category: 'cosmic' },
  'galaxy+galaxy': { id: 'universe', name: 'Universe', emoji: '🎆', category: 'cosmic' },
  'earth+rain': { id: 'plant', name: 'Plant', emoji: '🌱', category: 'nature' },
  'plant+sun': { id: 'flower', name: 'Flower', emoji: '🌸', category: 'nature' },
  'earth+plant': { id: 'tree', name: 'Tree', emoji: '🌳', category: 'nature' },
  'plant+water': { id: 'tea', name: 'Tea', emoji: '🍵', category: 'human' },
  'fire+plant': { id: 'coffee', name: 'Coffee', emoji: '☕', category: 'human' },
  'tree+tree': { id: 'forest', name: 'Forest', emoji: '🌲', category: 'nature' },
  'fire+tree': { id: 'charcoal', name: 'Charcoal', emoji: '🪵', category: 'nature' },
  'charcoal+earth': { id: 'diamond', name: 'Diamond', emoji: '💎', category: 'nature' },
  'fire+wind': { id: 'smoke', name: 'Smoke', emoji: '💨', category: 'nature' },
  'cloud+rain': { id: 'storm', name: 'Storm', emoji: '⛈️', category: 'nature' },
  'rain+smoke': { id: 'cloud', name: 'Cloud', emoji: '☁️', category: 'nature' },
  'cloud+wind': { id: 'storm', name: 'Storm', emoji: '⛈️', category: 'nature' },
  'fire+storm': { id: 'lightning', name: 'Lightning', emoji: '⚡', category: 'nature' },
  'earth+lightning': { id: 'energy', name: 'Energy', emoji: '⚡', category: 'science' },
  'energy+mud': { id: 'life', name: 'Life', emoji: '🧬', category: 'science' },
  'earth+life': { id: 'human', name: 'Human', emoji: '🧑', category: 'human' },
  'human+human': { id: 'love', name: 'Love', emoji: '❤️', category: 'human' },
  'fire+human': { id: 'chef', name: 'Chef', emoji: '👨‍🍳', category: 'human' },
  'earth+metal': { id: 'metal', name: 'Metal', emoji: '⚙️', category: 'science' },
  'fire+stone': { id: 'metal', name: 'Metal', emoji: '⚙️', category: 'science' },
  'lava+metal': { id: 'steel', name: 'Steel', emoji: '🔩', category: 'science' },
  'fire+metal': { id: 'blade', name: 'Blade', emoji: '⚔️', category: 'science' },
  'blade+tree': { id: 'wood', name: 'Wood', emoji: '🪵', category: 'nature' },
  'electricity+energy': { id: 'electricity', name: 'Electricity', emoji: '⚡', category: 'science' },
  'energy+metal': { id: 'electricity', name: 'Electricity', emoji: '⚡', category: 'science' },
  'electricity+metal': { id: 'wire', name: 'Wire', emoji: '🔌', category: 'science' },
  'human+wire': { id: 'computer', name: 'Computer', emoji: '💻', category: 'science' },
  'computer+electricity': { id: 'internet', name: 'Internet', emoji: '🌐', category: 'science' },
  'computer+human': { id: 'programmer', name: 'Programmer', emoji: '👨‍💻', category: 'human' },
  'computer+life': { id: 'ai', name: 'Artificial Intelligence', emoji: '🤖', category: 'science' },
  'human+metal': { id: 'robot', name: 'Robot', emoji: '🤖', category: 'science' },
  'life+water': { id: 'fish', name: 'Fish', emoji: '🐟', category: 'nature' },
  'earth+fish': { id: 'lizard', name: 'Lizard', emoji: '🦎', category: 'nature' },
  'fire+lizard': { id: 'dragon', name: 'Dragon', emoji: '🐉', category: 'magic' },
  'life+time': { id: 'death', name: 'Death', emoji: '💀', category: 'human' },
  'dust+wind': { id: 'sand', name: 'Sand', emoji: '🏖️', category: 'nature' },
  'fire+sand': { id: 'glass', name: 'Glass', emoji: '🪟', category: 'science' },
  'glass+sun': { id: 'time', name: 'Time', emoji: '⏳', category: 'cosmic' },
  'lizard+time': { id: 'dinosaur', name: 'Dinosaur', emoji: '🦖', category: 'nature' },
  'dinosaur+earth': { id: 'fossil', name: 'Fossil', emoji: '🦴', category: 'nature' },
  'fossil+pressure': { id: 'oil', name: 'Oil', emoji: '🛢️', category: 'science' },
  'earth+pressure': { id: 'stone', name: 'Stone', emoji: '🪨', category: 'nature' },
  'earth+earth': { id: 'pressure', name: 'Pressure', emoji: '🗜️', category: 'science' },
  'fire+oil': { id: 'gasoline', name: 'Gasoline', emoji: '⛽', category: 'science' },
  'gasoline+metal': { id: 'car', name: 'Car', emoji: '🚗', category: 'science' },
  'car+wind': { id: 'airplane', name: 'Airplane', emoji: '✈️', category: 'science' },
  'airplane+space': { id: 'rocket', name: 'Rocket', emoji: '🚀', category: 'science' },
  'planet+wind': { id: 'atmosphere', name: 'Atmosphere', emoji: '🌌', category: 'cosmic' },
  'astronaut+human': { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', category: 'human' },
  'human+rocket': { id: 'astronaut', name: 'Astronaut', emoji: '👨‍🚀', category: 'human' },
  'clay+water': { id: 'clay', name: 'Clay', emoji: '🏺', category: 'nature' },
  'mud+fire': { id: 'clay', name: 'Clay', emoji: '🏺', category: 'nature' },
  'brick+fire': { id: 'brick', name: 'Brick', emoji: '🧱', category: 'science' },
  'clay+fire': { id: 'brick', name: 'Brick', emoji: '🧱', category: 'science' },
  'brick+brick': { id: 'wall', name: 'Wall', emoji: '🧱', category: 'human' },
  'wall+wall': { id: 'house', name: 'House', emoji: '🏠', category: 'human' },
  'house+house': { id: 'village', name: 'Village', emoji: '🏘️', category: 'human' },
  'village+village': { id: 'city', name: 'City', emoji: '🏙️', category: 'human' },
  'city+city': { id: 'metropolis', name: 'Metropolis', emoji: '🌆', category: 'human' },
  'bread+chef': { id: 'sandwich', name: 'Sandwich', emoji: '🥪', category: 'human' },
  'fire+flour': { id: 'bread', name: 'Bread', emoji: '🍞', category: 'human' },
  'flour+plant': { id: 'flour', name: 'Flour', emoji: '🌾', category: 'nature' },
  'plant+stone': { id: 'flour', name: 'Flour', emoji: '🌾', category: 'nature' },
  'bread+cheese': { id: 'pizza', name: 'Pizza', emoji: '🍕', category: 'human' },
  'cow+human': { id: 'milk', name: 'Milk', emoji: '🥛', category: 'nature' },
  'animal+life': { id: 'animal', name: 'Animal', emoji: '🦌', category: 'nature' },
  'forest+life': { id: 'animal', name: 'Animal', emoji: '🦌', category: 'nature' },
  'animal+earth': { id: 'cow', name: 'Cow', emoji: '🐄', category: 'nature' },
  'cheese+milk': { id: 'cheese', name: 'Cheese', emoji: '🧀', category: 'human' },
  'milk+time': { id: 'cheese', name: 'Cheese', emoji: '🧀', category: 'human' },
  'blackhole+sun': { id: 'blackhole', name: 'Black Hole', emoji: '🕳️', category: 'cosmic' },
  'darkness+sun': { id: 'blackhole', name: 'Black Hole', emoji: '🕳️', category: 'cosmic' },
  'darkness+universe': { id: 'darkness', name: 'Darkness', emoji: '🌑', category: 'cosmic' },
  'death+universe': { id: 'darkness', name: 'Darkness', emoji: '🌑', category: 'cosmic' },
  'moon+planet': { id: 'moon', name: 'Moon', emoji: '🌙', category: 'cosmic' },
  'night+planet': { id: 'moon', name: 'Moon', emoji: '🌙', category: 'cosmic' },
  'night+sun': { id: 'stars', name: 'Stars', emoji: '✨', category: 'cosmic' },
  'astronomy+human': { id: 'astronomy', name: 'Astronomy', emoji: '🔭', category: 'science' },
  'human+stars': { id: 'astronomy', name: 'Astronomy', emoji: '🔭', category: 'science' },
  'concert+human': { id: 'concert', name: 'Concert', emoji: '🎸', category: 'human' },
  'human+music': { id: 'concert', name: 'Concert', emoji: '🎸', category: 'human' },
  'flute+wind': { id: 'music', name: 'Music', emoji: '🎵', category: 'human' },
  'metal+wind': { id: 'music', name: 'Music', emoji: '🎵', category: 'human' },
  'human+magic': { id: 'wizard', name: 'Wizard', emoji: '🧙‍♂️', category: 'magic' },
  'energy+universe': { id: 'magic', name: 'Magic', emoji: '🔮', category: 'magic' },
  'elf+life': { id: 'elf', name: 'Elf', emoji: '🧝', category: 'magic' },
  'life+magic': { id: 'elf', name: 'Elf', emoji: '🧝', category: 'magic' },
  'cold+water': { id: 'ice', name: 'Ice', emoji: '🧊', category: 'nature' },
  'rain+wind': { id: 'snow', name: 'Snow', emoji: '❄️', category: 'nature' },
  'glacier+snow': { id: 'glacier', name: 'Glacier', emoji: '🏔️', category: 'nature' },
  'snow+snow': { id: 'glacier', name: 'Glacier', emoji: '🏔️', category: 'nature' },
  'cold+rain': { id: 'snow', name: 'Snow', emoji: '❄️', category: 'nature' },
  'time+wind': { id: 'cold', name: 'Cold', emoji: '🥶', category: 'nature' },
  'life+universe': { id: 'alien', name: 'Alien', emoji: '👽', category: 'cosmic' },
  'alien+planet': { id: 'ufo', name: 'UFO', emoji: '🛸', category: 'cosmic' },
  'book+human': { id: 'book', name: 'Book', emoji: '📖', category: 'human' },
  'human+paper': { id: 'book', name: 'Book', emoji: '📖', category: 'human' },
  'paper+wood': { id: 'paper', name: 'Paper', emoji: '📄', category: 'science' },
  'pressure+wood': { id: 'paper', name: 'Paper', emoji: '📄', category: 'science' },
  'book+book': { id: 'library', name: 'Library', emoji: '📚', category: 'human' },
  'human+library': { id: 'philosopher', name: 'Philosopher', emoji: '🧐', category: 'human' },
  'philosopher+time': { id: 'wisdom', name: 'Wisdom', emoji: '💡', category: 'human' },
};

function getRecipeKey(aId: string, bId: string): string {
  return [aId, bId].sort().join('+');
}

interface BoardItem {
  uid: string;
  item: ElementItem;
  x: number;
  y: number;
}

export default function AlchemyCraft() {
  const [unlocked, setUnlocked] = useState<ElementItem[]>(() => {
    try {
      const saved = localStorage.getItem('as_fun_alchemy_unlocked');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_ELEMENTS;
  });

  const [boardItems, setBoardItems] = useState<BoardItem[]>([
    { uid: 'init-1', item: INITIAL_ELEMENTS[0], x: 80, y: 100 },
    { uid: 'init-2', item: INITIAL_ELEMENTS[1], x: 220, y: 100 },
    { uid: 'init-3', item: INITIAL_ELEMENTS[2], x: 80, y: 220 },
    { uid: 'init-4', item: INITIAL_ELEMENTS[3], x: 220, y: 220 },
  ]);

  const [search, setSearch] = useState('');
  const [latestDiscovery, setLatestDiscovery] = useState<ElementItem | null>(null);
  const [draggedUid, setDraggedUid] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; text: string }[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);

  // Save unlocked to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('as_fun_alchemy_unlocked', JSON.stringify(unlocked));
    } catch {
      // Ignore
    }
  }, [unlocked]);

  // Spawn element on workspace
  const spawnElement = (elem: ElementItem, customPos?: { x: number; y: number }) => {
    soundManager.playPop(520);
    const rect = boardRef.current?.getBoundingClientRect();
    const x = customPos ? customPos.x : Math.min((rect?.width || 500) - 140, Math.max(40, 60 + Math.random() * 200));
    const y = customPos ? customPos.y : Math.min((rect?.height || 500) - 100, Math.max(40, 60 + Math.random() * 200));

    const newItem: BoardItem = {
      uid: `${elem.id}-${Date.now()}-${Math.random()}`,
      item: elem,
      x,
      y,
    };
    setBoardItems((prev) => [...prev, newItem]);
  };

  // Combine check
  const checkCombination = (targetUid: string, releaseX: number, releaseY: number) => {
    const moving = boardItems.find((b) => b.uid === targetUid);
    if (!moving) return;

    // Find any other item overlapping
    const overlapItem = boardItems.find((b) => {
      if (b.uid === targetUid) return false;
      const dx = Math.abs(b.x - releaseX);
      const dy = Math.abs(b.y - releaseY);
      return dx < 55 && dy < 55;
    });

    if (overlapItem) {
      const key = getRecipeKey(moving.item.id, overlapItem.item.id);
      const result = RECIPES[key];

      if (result) {
        soundManager.playCombine();
        
        // Spawn particle sparkle
        const pId = Date.now();
        setParticles((prev) => [...prev, { id: pId, x: overlapItem.x + 30, y: overlapItem.y + 15, text: `✨ ${result.emoji}` }]);
        setTimeout(() => {
          setParticles((prev) => prev.filter((p) => p.id !== pId));
        }, 900);

        // Check if new discovery
        const isNew = !unlocked.some((u) => u.id === result.id);
        if (isNew) {
          soundManager.playSuccess();
          setUnlocked((prev) => [...prev, result]);
          setLatestDiscovery(result);
          setTimeout(() => setLatestDiscovery(null), 3000);
        }

        // Replace the two items with the combined result
        setBoardItems((prev) => [
          ...prev.filter((b) => b.uid !== moving.uid && b.uid !== overlapItem.uid),
          {
            uid: `${result.id}-${Date.now()}`,
            item: result,
            x: overlapItem.x,
            y: overlapItem.y,
          },
        ]);
        return;
      }
    }

    // Just update position
    setBoardItems((prev) =>
      prev.map((b) => (b.uid === targetUid ? { ...b, x: releaseX, y: releaseY } : b))
    );
  };

  const handlePointerDown = (e: React.PointerEvent, uid: string, currentX: number, currentY: number) => {
    e.stopPropagation();
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    soundManager.playPop(380);
    setDraggedUid(uid);
    setDragOffset({
      x: e.clientX - boardRect.left - currentX,
      y: e.clientY - boardRect.top - currentY,
    });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggedUid) return;
    const boardRect = boardRef.current?.getBoundingClientRect();
    if (!boardRect) return;

    const newX = Math.max(10, Math.min(boardRect.width - 120, e.clientX - boardRect.left - dragOffset.x));
    const newY = Math.max(10, Math.min(boardRect.height - 60, e.clientY - boardRect.top - dragOffset.y));

    setBoardItems((prev) =>
      prev.map((b) => (b.uid === draggedUid ? { ...b, x: newX, y: newY } : b))
    );
  };

  const handlePointerUp = () => {
    if (!draggedUid) return;
    const active = boardItems.find((b) => b.uid === draggedUid);
    if (active) {
      checkCombination(draggedUid, active.x, active.y);
    }
    setDraggedUid(null);
  };

  const handleClearBoard = () => {
    soundManager.playPop(300);
    setBoardItems([]);
  };

  const handleTidy = () => {
    soundManager.playPop(450);
    const cols = 5;
    const spacingX = 130;
    const spacingY = 60;
    const startX = 30;
    const startY = 30;

    setBoardItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        x: startX + (idx % cols) * spacingX,
        y: startY + Math.floor(idx / cols) * spacingY,
      }))
    );
  };

  const handleResetDiscoveries = () => {
    if (confirm('Reset your discovery progress back to the 4 basic elements?')) {
      setUnlocked(INITIAL_ELEMENTS);
      setBoardItems([
        { uid: 'init-1', item: INITIAL_ELEMENTS[0], x: 80, y: 100 },
        { uid: 'init-2', item: INITIAL_ELEMENTS[1], x: 220, y: 100 },
        { uid: 'init-3', item: INITIAL_ELEMENTS[2], x: 80, y: 220 },
        { uid: 'init-4', item: INITIAL_ELEMENTS[3], x: 220, y: 220 },
      ]);
    }
  };

  const filteredUnlocked = unlocked.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalRecipesPossible = Object.keys(RECIPES).length + 4;

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 select-none overflow-hidden rounded-xl border border-neutral-800 shadow-2xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🧪</span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Infinite Alchemy</h2>
            <div className="text-xs text-neutral-400">
              Drag and combine elements to discover the universe
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            Discovered: <span className="font-semibold text-emerald-400">{unlocked.length}</span> / {totalRecipesPossible}
          </div>
          <button
            onClick={handleTidy}
            title="Tidy desk layout"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-lg transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tidy</span>
          </button>
          <button
            onClick={handleClearBoard}
            title="Clear workspace"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-300 bg-neutral-800 hover:bg-neutral-700 hover:text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>
          <button
            onClick={handleResetDiscoveries}
            title="Reset all discoveries"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-rose-400 bg-neutral-900 hover:bg-rose-950/30 rounded-lg border border-neutral-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Workspace Canvas */}
        <div
          ref={boardRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex-1 relative bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 overflow-hidden cursor-crosshair"
          style={{ touchAction: 'none' }}
        >
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {boardItems.length === 0 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 pointer-events-none opacity-40">
              <Sparkles className="w-10 h-10 mb-3 text-neutral-500 animate-pulse" />
              <p className="text-sm text-neutral-400 max-w-sm">
                Your workspace is clear. Click any element on the right drawer to place it here, then drag them together to combine!
              </p>
            </div>
          )}

          {/* Placed Elements on Canvas */}
          {boardItems.map((b) => (
            <div
              key={b.uid}
              onPointerDown={(e) => handlePointerDown(e, b.uid, b.x, b.y)}
              onDoubleClick={() => {
                soundManager.playPop(300);
                setBoardItems((prev) => prev.filter((item) => item.uid !== b.uid));
              }}
              style={{
                transform: `translate3d(${b.x}px, ${b.y}px, 0)`,
                zIndex: draggedUid === b.uid ? 50 : 10,
              }}
              className={`absolute top-0 left-0 flex items-center gap-2 px-3.5 py-2 bg-neutral-800/90 hover:bg-neutral-750 active:scale-95 border border-neutral-700/80 rounded-xl shadow-lg cursor-grab active:cursor-grabbing transition-transform duration-75 select-none ${
                draggedUid === b.uid ? 'ring-2 ring-amber-400/80 shadow-amber-500/20 shadow-2xl scale-105' : ''
              }`}
            >
              <span className="text-xl pointer-events-none">{b.item.emoji}</span>
              <span className="text-sm font-medium text-neutral-100 pointer-events-none whitespace-nowrap">
                {b.item.name}
              </span>
            </div>
          ))}

          {/* Floating Particle Text on Combo */}
          {particles.map((p) => (
            <div
              key={p.id}
              style={{ left: p.x, top: p.y }}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2 text-2xl font-bold animate-bounce text-amber-300 drop-shadow-md z-50 transition-all duration-700"
            >
              {p.text}
            </div>
          ))}

          {/* Discovery Announcement Toast */}
          {latestDiscovery && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 bg-amber-500 text-neutral-950 font-bold rounded-2xl shadow-xl shadow-amber-500/30 animate-in fade-in slide-in-from-bottom-4 duration-300 z-50">
              <span className="text-2xl">{latestDiscovery.emoji}</span>
              <div>
                <div className="text-[10px] uppercase tracking-wider font-extrabold text-amber-950">
                  New Discovery Unlocked!
                </div>
                <div className="text-sm font-bold text-neutral-950">{latestDiscovery.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar of Unlocked Elements */}
        <div className="w-64 sm:w-72 bg-neutral-950 border-l border-neutral-800 flex flex-col z-20">
          <div className="p-3 border-b border-neutral-800">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search elements..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Element Badges List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredUnlocked.length === 0 ? (
              <div className="text-center py-8 text-xs text-neutral-500">
                No matching elements found.
              </div>
            ) : (
              filteredUnlocked.map((elem) => (
                <button
                  key={elem.id}
                  onClick={() => spawnElement(elem)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 bg-neutral-900 hover:bg-neutral-850 active:bg-neutral-800 border border-neutral-800/80 hover:border-neutral-700 rounded-xl text-left transition-all duration-150 group cursor-pointer"
                >
                  <span className="text-lg group-hover:scale-110 transition-transform">
                    {elem.emoji}
                  </span>
                  <span className="text-xs font-medium text-neutral-200 group-hover:text-white truncate">
                    {elem.name}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Quick instructions */}
          <div className="p-3 border-t border-neutral-800/80 text-[11px] text-neutral-500 text-center">
            Click to spawn · Double click element to remove
          </div>
        </div>
      </div>
    </div>
  );
}
