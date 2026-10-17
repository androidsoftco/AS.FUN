import React, { useState, useMemo } from 'react';
import { DollarSign, RotateCcw, ShoppingBag, Receipt, Printer, ArrowDown } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SpendItem {
  id: string;
  name: string;
  price: number;
  emoji: string;
  category: string;
}

const STARTING_FORTUNE = 250_000_000_000; // $250 Billion

const ITEMS: SpendItem[] = [
  { id: 'big_mac', name: 'Big Mac', price: 5, emoji: '🍔', category: 'Food & Everyday' },
  { id: 'flip_flops', name: 'Flip Flops', price: 3, emoji: '🩴', category: 'Food & Everyday' },
  { id: 'coca_cola', name: 'Coca-Cola Pack', price: 5, emoji: '🥤', category: 'Food & Everyday' },
  { id: 'movie_ticket', name: 'Movie Ticket', price: 12, emoji: '🎟️', category: 'Food & Everyday' },
  { id: 'book', name: 'Bestselling Book', price: 15, emoji: '📖', category: 'Food & Everyday' },
  { id: 'lobster', name: 'Lobster Dinner', price: 45, emoji: '🦞', category: 'Food & Everyday' },
  { id: 'video_game', name: 'AAA Video Game', price: 70, emoji: '🎮', category: 'Food & Everyday' },
  { id: 'netflix', name: 'Year of Netflix', price: 200, emoji: '📺', category: 'Food & Everyday' },
  { id: 'airpods', name: 'AirPods Max', price: 550, emoji: '🎧', category: 'Food & Everyday' },
  { id: 'smartphone', name: 'Pro Smartphone', price: 1200, emoji: '📱', category: 'Food & Everyday' },
  { id: 'gaming_rig', name: 'High-End Gaming PC', price: 3500, emoji: '🖥️', category: 'Food & Everyday' },
  { id: 'acre_farmland', name: 'Acre of Farmland', price: 4000, emoji: '🌾', category: 'Property & Luxury' },
  { id: 'diamond_ring', name: 'Diamond Ring', price: 10000, emoji: '💍', category: 'Property & Luxury' },
  { id: 'rolex', name: 'Rolex Submariner', price: 15000, emoji: '⌚', category: 'Property & Luxury' },
  { id: 'birkin', name: 'Hermès Birkin Bag', price: 25000, emoji: '👜', category: 'Property & Luxury' },
  { id: 'pickup_truck', name: 'Ford F-150 Lightning', price: 55000, emoji: '🛻', category: 'Vehicles' },
  { id: 'tesla', name: 'Tesla Model S Plaid', price: 90000, emoji: '🚗', category: 'Vehicles' },
  { id: 'monster_truck', name: 'Monster Truck', price: 150000, emoji: '🚙', category: 'Vehicles' },
  { id: 'ferrari', name: 'Ferrari SF90 Stradale', price: 520000, emoji: '🏎️', category: 'Vehicles' },
  { id: 'gold_bar', name: 'Kilogram Gold Bar', price: 800000, emoji: '🪙', category: 'Property & Luxury' },
  { id: 'suburban_home', name: 'Suburban Single Family Home', price: 400000, emoji: '🏡', category: 'Property & Luxury' },
  { id: 'mcdonalds', name: "McDonald's Franchise", price: 1800000, emoji: '🍟', category: 'Property & Luxury' },
  { id: 'superbowl_ad', name: 'Super Bowl 30s Commercial', price: 7500000, emoji: '🏈', category: 'Business & Media' },
  { id: 'tank', name: 'M1 Abrams Battle Tank', price: 9000000, emoji: '🛡️', category: 'Vehicles' },
  { id: 'yacht', name: 'Luxury Motor Yacht', price: 25000000, emoji: '🛥️', category: 'Vehicles' },
  { id: 'apache', name: 'Apache Attack Helicopter', price: 35000000, emoji: '🚁', category: 'Vehicles' },
  { id: 'mansion', name: 'Beverly Hills Mega Mansion', price: 65000000, emoji: '🏰', category: 'Property & Luxury' },
  { id: 'private_jet', name: 'Gulfstream G700 Private Jet', price: 75000000, emoji: '✈️', category: 'Vehicles' },
  { id: 'boeing_747', name: 'Boeing 747-8 Airliner', price: 420000000, emoji: '🛫', category: 'Vehicles' },
  { id: 'mona_lisa', name: 'The Mona Lisa (Valuation)', price: 860000000, emoji: '🖼️', category: 'Property & Luxury' },
  { id: 'skyscraper', name: 'Downtown Skyscraper', price: 1200000000, emoji: '🏢', category: 'Property & Luxury' },
  { id: 'cruise_ship', name: 'Icon-Class Mega Cruise Ship', price: 2000000000, emoji: '🚢', category: 'Vehicles' },
  { id: 'nba_team', name: 'NBA Championship Team', price: 3500000000, emoji: '🏀', category: 'Business & Media' },
  { id: 'f1_team', name: 'Formula 1 Racing Team', price: 1500000000, emoji: '🏎️', category: 'Business & Media' },
  { id: 'aircraft_carrier', name: 'Ford-Class Nuclear Aircraft Carrier', price: 13000000000, emoji: '⚓', category: 'Vehicles' },
  { id: 'mars_mission', name: 'Crewed Expedition to Mars', price: 30000000000, emoji: '🚀', category: 'Mega Feats' },
  { id: 'cure_disease', name: 'Fund Global Disease Eradication', price: 45000000000, emoji: '💉', category: 'Mega Feats' },
];

export default function SpendMoney() {
  const [cart, setCart] = useState<Record<string, number>>({});

  const totalSpent = useMemo(() => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = ITEMS.find((i) => i.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [cart]);

  const remainingMoney = STARTING_FORTUNE - totalSpent;
  const percentSpent = ((totalSpent / STARTING_FORTUNE) * 100).toFixed(4);

  const handleBuy = (id: string, amount: number = 1) => {
    const item = ITEMS.find((i) => i.id === id);
    if (!item) return;

    const currentQty = cart[id] || 0;
    const maxAffordable = Math.floor(remainingMoney / item.price);
    const actualAdd = Math.min(amount, maxAffordable);

    if (actualAdd > 0) {
      soundManager.playCash();
      setCart((prev) => ({
        ...prev,
        [id]: currentQty + actualAdd,
      }));
    } else {
      soundManager.playError();
    }
  };

  const handleSell = (id: string, amount: number = 1) => {
    const currentQty = cart[id] || 0;
    if (currentQty <= 0) return;

    soundManager.playPop(340);
    const nextQty = Math.max(0, currentQty - amount);
    setCart((prev) => {
      const updated = { ...prev };
      if (nextQty === 0) {
        delete updated[id];
      } else {
        updated[id] = nextQty;
      }
      return updated;
    });
  };

  const handleSetQty = (id: string, newQty: number) => {
    const item = ITEMS.find((i) => i.id === id);
    if (!item) return;

    const currentQty = cart[id] || 0;
    const diff = newQty - currentQty;
    if (diff > 0) {
      const maxAffordable = Math.floor(remainingMoney / item.price);
      const actualQty = currentQty + Math.min(diff, maxAffordable);
      setCart((prev) => ({ ...prev, [id]: actualQty }));
    } else {
      const actualQty = Math.max(0, newQty);
      setCart((prev) => {
        const updated = { ...prev };
        if (actualQty === 0) delete updated[id];
        else updated[id] = actualQty;
        return updated;
      });
    }
  };

  const handleReset = () => {
    soundManager.playPop(280);
    setCart({});
  };

  const boughtItems = Object.entries(cart).map(([id, qty]) => {
    const item = ITEMS.find((i) => i.id === id)!;
    return { ...item, qty, total: item.price * qty };
  });

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 overflow-y-auto select-none rounded-xl border border-neutral-800 shadow-2xl">
      {/* Sticky Balance Bar */}
      <div className="sticky top-0 z-40 bg-neutral-950/95 backdrop-blur-md border-b border-neutral-800 p-4 sm:p-5 shadow-xl">
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-2">
          <div className="text-xs uppercase tracking-widest font-bold text-neutral-400">
            Remaining Fortune
          </div>
          <div className="text-3xl sm:text-5xl font-extrabold text-emerald-400 font-mono tabular-nums tracking-tight">
            ${remainingMoney.toLocaleString()}
          </div>
          
          {/* Progress bar */}
          <div className="w-full max-w-xl h-2.5 bg-neutral-800 rounded-full overflow-hidden mt-1 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0.1, Number(percentSpent)))}%` }}
            />
          </div>

          <div className="flex items-center justify-between w-full max-w-xl text-xs text-neutral-400 px-1 font-mono">
            <span>{percentSpent}% spent</span>
            <div className="flex items-center gap-4">
              <button
                onClick={handleReset}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Fortune</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Intro hero notice */}
      <div className="max-w-4xl mx-auto w-full px-4 pt-6 pb-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-neutral-800/80 rounded-full text-xs text-neutral-300 mb-2">
          <span>💰</span>
          <span>You have been gifted $250 Billion USD. Can you spend it all?</span>
        </div>
      </div>

      {/* Grid of Items */}
      <div className="max-w-5xl mx-auto w-full p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ITEMS.map((item) => {
          const qty = cart[item.id] || 0;
          const canBuy = remainingMoney >= item.price;
          const canSell = qty > 0;

          return (
            <div
              key={item.id}
              className={`flex flex-col justify-between p-4 bg-neutral-950/70 border rounded-2xl transition-all duration-150 ${
                qty > 0 ? 'border-amber-500/50 shadow-lg shadow-amber-950/20' : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl p-2 bg-neutral-900 rounded-xl border border-neutral-800 shrink-0">
                  {item.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-white truncate">{item.name}</h3>
                  <div className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">
                    ${item.price.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center gap-2">
                <button
                  onClick={() => handleSell(item.id, 1)}
                  disabled={!canSell}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    canSell
                      ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900 cursor-pointer active:scale-95'
                      : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  Sell
                </button>

                <input
                  type="number"
                  min="0"
                  value={qty}
                  onChange={(e) => handleSetQty(item.id, parseInt(e.target.value) || 0)}
                  className="w-16 py-1 px-1.5 bg-neutral-900 border border-neutral-700 text-center font-mono text-xs rounded-lg text-neutral-100 focus:outline-none focus:border-amber-400"
                />

                <button
                  onClick={() => handleBuy(item.id, 1)}
                  disabled={!canBuy}
                  className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                    canBuy
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm cursor-pointer active:scale-95'
                      : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed opacity-50'
                  }`}
                >
                  Buy
                </button>
              </div>

              {/* Quick Multiplier row for large purchases */}
              <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-2 px-1">
                <button
                  onClick={() => handleBuy(item.id, 10)}
                  disabled={remainingMoney < item.price * 10}
                  className="hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                >
                  +10
                </button>
                <button
                  onClick={() => handleBuy(item.id, 100)}
                  disabled={remainingMoney < item.price * 100}
                  className="hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                >
                  +100
                </button>
                <button
                  onClick={() => handleBuy(item.id, 1000)}
                  disabled={remainingMoney < item.price * 1000}
                  className="hover:text-emerald-400 disabled:opacity-30 disabled:hover:text-neutral-400 cursor-pointer"
                >
                  +1k
                </button>
                {canSell && (
                  <button
                    onClick={() => handleSell(item.id, qty)}
                    className="text-rose-400 hover:text-rose-300 cursor-pointer"
                  >
                    Sell All
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Receipt Section */}
      {boughtItems.length > 0 && (
        <div className="max-w-2xl mx-auto w-full p-6 my-8 bg-neutral-950 border border-neutral-800 rounded-2xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-lg">Your Official Receipt</h3>
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              AS.FUN Billionaire Corp
            </div>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {boughtItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-900">
                <div className="flex items-center gap-2">
                  <span>{item.emoji}</span>
                  <span className="font-medium text-neutral-200">{item.name}</span>
                  <span className="text-neutral-500 font-mono">x{item.qty.toLocaleString()}</span>
                </div>
                <span className="font-mono font-semibold text-emerald-400">
                  ${item.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t-2 border-dashed border-neutral-800 pt-4 mt-4 flex items-center justify-between font-mono">
            <span className="font-bold text-sm text-neutral-300">TOTAL SPENT:</span>
            <span className="font-bold text-base text-emerald-400">${totalSpent.toLocaleString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
