import React, { useState, useMemo } from 'react';
import { Calendar, Search, Sparkles, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface HistoricalPerson {
  name: string;
  birth: number;
  death: number;
  role: string;
  category: 'science' | 'art' | 'leaders' | 'literature';
  emoji: string;
  notable: string;
}

const PEOPLE: HistoricalPerson[] = [
  { name: 'Leonardo da Vinci', birth: 1452, death: 1519, role: 'Polymath & Artist', category: 'art', emoji: '🎨', notable: 'Painted the Mona Lisa and designed flying machines.' },
  { name: 'Niccolò Machiavelli', birth: 1469, death: 1527, role: 'Political Thinker', category: 'literature', emoji: '📜', notable: 'Wrote "The Prince".' },
  { name: 'Nicolaus Copernicus', birth: 1473, death: 1543, role: 'Astronomer', category: 'science', emoji: '🔭', notable: 'Proposed the Earth revolves around the Sun.' },
  { name: 'Michelangelo', birth: 1475, death: 1564, role: 'Sculptor & Painter', category: 'art', emoji: '🏛️', notable: 'Painted the Sistine Chapel ceiling.' },
  { name: 'Queen Elizabeth I', birth: 1533, death: 1603, role: 'Monarch of England', category: 'leaders', emoji: '👑', notable: 'Reigned during England’s Golden Age.' },
  { name: 'William Shakespeare', birth: 1564, death: 1616, role: 'Playwright & Poet', category: 'literature', emoji: '🎭', notable: 'Wrote Hamlet, Romeo & Juliet, Macbeth.' },
  { name: 'Galileo Galilei', birth: 1564, death: 1642, role: 'Physicist & Astronomer', category: 'science', emoji: '🔭', notable: 'Observed Jupiter’s moons through a telescope.' },
  { name: 'Johannes Kepler', birth: 1571, death: 1630, role: 'Astronomer', category: 'science', emoji: '🪐', notable: 'Discovered laws of planetary motion.' },
  { name: 'René Descartes', birth: 1596, death: 1650, role: 'Philosopher', category: 'literature', emoji: '💭', notable: '"I think, therefore I am."' },
  { name: 'John Locke', birth: 1632, death: 1704, role: 'Philosopher of Liberty', category: 'literature', emoji: '⚖️', notable: 'Pioneered natural rights of life, liberty, property.' },
  { name: 'Isaac Newton', birth: 1643, death: 1727, role: 'Mathematician & Physicist', category: 'science', emoji: '🍎', notable: 'Formulated the laws of motion and gravitation.' },
  { name: 'Johann Sebastian Bach', birth: 1685, death: 1750, role: 'Composer', category: 'art', emoji: '🎼', notable: 'Master of Baroque harmony and counterpoint.' },
  { name: 'Benjamin Franklin', birth: 1706, death: 1790, role: 'Statesman & Inventor', category: 'leaders', emoji: '🪁', notable: 'Captured lightning with a kite, signed US Declaration.' },
  { name: 'George Washington', birth: 1732, death: 1799, role: 'First US President', category: 'leaders', emoji: '🦅', notable: 'Led the Continental Army in the American Revolution.' },
  { name: 'Wolfgang Amadeus Mozart', birth: 1756, death: 1791, role: 'Musical Prodigy & Composer', category: 'art', emoji: '🎻', notable: 'Composed over 600 timeless symphonies and operas.' },
  { name: 'Napoleon Bonaparte', birth: 1769, death: 1821, role: 'Emperor of France', category: 'leaders', emoji: '⚔️', notable: 'Conquered much of continental Europe.' },
  { name: 'Ludwig van Beethoven', birth: 1770, death: 1827, role: 'Composer', category: 'art', emoji: '🎹', notable: 'Composed the 9th Symphony while completely deaf.' },
  { name: 'Jane Austen', birth: 1775, death: 1817, role: 'Novelist', category: 'literature', emoji: '📖', notable: 'Authored Pride and Prejudice and Sense and Sensibility.' },
  { name: 'Abraham Lincoln', birth: 1809, death: 1865, role: 'US President', category: 'leaders', emoji: '🎩', notable: 'Preserved the Union and abolished slavery.' },
  { name: 'Charles Darwin', birth: 1809, death: 1882, role: 'Naturalist', category: 'science', emoji: '🐢', notable: 'Formulated the theory of evolution by natural selection.' },
  { name: 'Karl Marx', birth: 1818, death: 1883, role: 'Philosopher & Economist', category: 'literature', emoji: '📕', notable: 'Co-authored The Communist Manifesto.' },
  { name: 'Vincent van Gogh', birth: 1853, death: 1890, role: 'Post-Impressionist Painter', category: 'art', emoji: '🌻', notable: 'Painted The Starry Night.' },
  { name: 'Nikola Tesla', birth: 1856, death: 1943, role: 'Electrical Engineer', category: 'science', emoji: '⚡', notable: 'Invented alternating current (AC) electrical system.' },
  { name: 'Marie Curie', birth: 1867, death: 1934, role: 'Physicist & Chemist', category: 'science', emoji: '☢️', notable: 'Discovered radium and polonium; 2-time Nobel laureate.' },
  { name: 'Winston Churchill', birth: 1874, death: 1965, role: 'Prime Minister of UK', category: 'leaders', emoji: '🎖️', notable: 'Led Britain to victory in World War II.' },
  { name: 'Albert Einstein', birth: 1879, death: 1955, role: 'Theoretical Physicist', category: 'science', emoji: '🧠', notable: 'Developed Theory of General Relativity (E=mc²).' },
  { name: 'Pablo Picasso', birth: 1881, death: 1973, role: 'Pioneering Artist', category: 'art', emoji: '🖼️', notable: 'Co-founded the Cubist movement.' },
  { name: 'Alan Turing', birth: 1912, death: 1954, role: 'Computer Scientist & Codebreaker', category: 'science', emoji: '💻', notable: 'Cracked the Enigma cipher and fathered modern AI.' },
  { name: 'Nelson Mandela', birth: 1918, death: 2013, role: 'Anti-Apartheid Leader', category: 'leaders', emoji: '🕊️', notable: 'Nobel Peace Prize winner and President of South Africa.' },
  { name: 'Queen Elizabeth II', birth: 1926, death: 2022, role: 'British Monarch', category: 'leaders', emoji: '👑', notable: 'Reigned for 70 years across 7 decades.' },
  { name: 'Martin Luther King Jr.', birth: 1929, death: 1968, role: 'Civil Rights Leader', category: 'leaders', emoji: '✊', notable: 'Delivered "I Have a Dream" speech.' },
  { name: 'Stephen Hawking', birth: 1942, death: 2018, role: 'Cosmologist & Physicist', category: 'science', emoji: '🌌', notable: 'Discovered Hawking Radiation from black holes.' },
  { name: 'Steve Jobs', birth: 1955, death: 2011, role: 'Tech Visionary', category: 'leaders', emoji: '🍏', notable: 'Co-founded Apple and launched Macintosh, iPhone.' },
];

export default function WhoWasAlive() {
  const [year, setYear] = useState(1800);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const alivePeople = useMemo(() => {
    return PEOPLE.filter((p) => {
      const isAlive = year >= p.birth && year <= p.death;
      const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.role.toLowerCase().includes(search.toLowerCase());
      return isAlive && matchesCat && matchesSearch;
    });
  }, [year, categoryFilter, search]);

  const handleYearChange = (newYear: number) => {
    const clamped = Math.max(1450, Math.min(2026, newYear));
    setYear(clamped);
    soundManager.playPop(300 + (clamped % 500));
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 overflow-y-auto select-none rounded-xl border border-neutral-800 shadow-2xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">⌛</span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Who Was Alive?</h2>
            <div className="text-xs text-neutral-400">
              Scrub through history to see who walked the Earth at the exact same moment.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            Alive in {year}: <span className="font-semibold text-emerald-400">{alivePeople.length}</span> figures
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Year Scrubbing Header */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <div className="text-xs uppercase tracking-widest font-mono text-neutral-400">
            Selected Historical Year
          </div>

          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => handleYearChange(year - 10)}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-5xl sm:text-6xl font-black font-mono text-amber-400 tabular-nums">
              {year}
            </div>
            <button
              onClick={() => handleYearChange(year + 10)}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-xl text-neutral-300 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Slider */}
          <div className="w-full max-w-2xl mx-auto space-y-1">
            <input
              type="range"
              min="1450"
              max="2026"
              value={year}
              onChange={(e) => handleYearChange(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-neutral-500 font-mono">
              <span>1450 (Renaissance)</span>
              <span>1776 (Revolutions)</span>
              <span>1914 (WWI)</span>
              <span>2026 (Modern)</span>
            </div>
          </div>

          {/* Quick Year Milestones */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {[
              { label: '1500 (Renaissance)', y: 1500 },
              { label: '1600 (Shakespeare & Galileo)', y: 1600 },
              { label: '1776 (American Independence)', y: 1776 },
              { label: '1800 (Beethoven & Napoleon)', y: 1800 },
              { label: '1905 (Einstein Miracle Year)', y: 1905 },
              { label: '1945 (WWII End)', y: 1945 },
              { label: '2000 (New Millennium)', y: 2000 },
            ].map((m, i) => (
              <button
                key={i}
                onClick={() => handleYearChange(m.y)}
                className={`px-3 py-1 text-xs rounded-lg border transition-colors cursor-pointer ${
                  year === m.y
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold'
                    : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-neutral-950 border border-neutral-800 rounded-xl overflow-x-auto w-full sm:w-auto">
            {['all', 'science', 'art', 'leaders', 'literature'].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategoryFilter(cat);
                  soundManager.playPop(420);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-colors whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-neutral-800 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
            <input
              type="text"
              placeholder="Search figure or title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600"
            />
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {alivePeople.length === 0 ? (
            <div className="col-span-full py-12 text-center text-neutral-500 text-sm">
              No recorded historical figures in our directory were alive in {year} matching your filter.
            </div>
          ) : (
            alivePeople.map((p) => {
              const ageInYear = year - p.birth;
              return (
                <div
                  key={p.name}
                  className="p-5 bg-neutral-950/70 border border-neutral-800 hover:border-neutral-700 rounded-2xl flex flex-col justify-between space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl p-2 bg-neutral-900 rounded-xl border border-neutral-800">
                        {p.emoji}
                      </span>
                      <div>
                        <h3 className="font-bold text-white text-sm">{p.name}</h3>
                        <div className="text-xs text-neutral-400">{p.role}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-md">
                      Age {ageInYear}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed">
                    {p.notable}
                  </p>

                  <div className="pt-2 border-t border-neutral-900 flex items-center justify-between text-[11px] font-mono text-neutral-500">
                    <span>Lifespan: {p.birth} – {p.death}</span>
                    <span className="capitalize">{p.category}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
