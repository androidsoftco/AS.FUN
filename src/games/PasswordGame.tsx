import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, XCircle, Copy, Check, RotateCcw, Award, AlertCircle } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface Rule {
  id: number;
  title: string;
  description: string;
  validator: (pw: string) => { valid: boolean; hint?: string };
}

const ROMAN_VALUES: Record<string, number> = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000,
};

function parseRomanNumerals(str: string): number[] {
  const matches = str.match(/[IVXLCDM]/g);
  if (!matches) return [];
  return matches.map((ch) => ROMAN_VALUES[ch]);
}

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december'
];

const RULES: Rule[] = [
  {
    id: 1,
    title: 'Rule 1',
    description: 'Your password must be at least 5 characters.',
    validator: (pw) => ({
      valid: pw.length >= 5,
      hint: `${pw.length}/5 characters`,
    }),
  },
  {
    id: 2,
    title: 'Rule 2',
    description: 'Your password must include a number.',
    validator: (pw) => ({
      valid: /\d/.test(pw),
      hint: /\d/.test(pw) ? 'Contains a number' : 'Needs at least one digit (0-9)',
    }),
  },
  {
    id: 3,
    title: 'Rule 3',
    description: 'Your password must include an uppercase letter.',
    validator: (pw) => ({
      valid: /[A-Z]/.test(pw),
      hint: /[A-Z]/.test(pw) ? 'Contains uppercase' : 'Needs at least one A-Z',
    }),
  },
  {
    id: 4,
    title: 'Rule 4',
    description: 'Your password must include a special character (!@#$%^&*).',
    validator: (pw) => ({
      valid: /[!@#$%^&*_\-+=\[\]{}|:;<>?,./~`]/.test(pw),
      hint: 'Requires symbol like ! @ # $ %',
    }),
  },
  {
    id: 5,
    title: 'Rule 5',
    description: 'The digits in your password must add up to 25.',
    validator: (pw) => {
      const digits = (pw.match(/\d/g) || []).map(Number);
      const sum = digits.reduce((a, b) => a + b, 0);
      return {
        valid: sum === 25,
        hint: `Current digit sum: ${sum} / 25`,
      };
    },
  },
  {
    id: 6,
    title: 'Rule 6',
    description: 'Your password must include a month of the year.',
    validator: (pw) => {
      const lower = pw.toLowerCase();
      const found = MONTHS.some((m) => lower.includes(m));
      return {
        valid: found,
        hint: found ? 'Month included' : 'Try "May", "June", "August", etc.',
      };
    },
  },
  {
    id: 7,
    title: 'Rule 7',
    description: 'Your password must include a Roman numeral (I, V, X, L, C, D, M).',
    validator: (pw) => {
      const roman = /[IVXLCDM]/.test(pw);
      return {
        valid: roman,
        hint: roman ? 'Roman numeral found' : 'Include I, V, X, L, C, D, or M',
      };
    },
  },
  {
    id: 8,
    title: 'Rule 8',
    description: 'The Roman numerals in your password must multiply to 35.',
    validator: (pw) => {
      const numerals = parseRomanNumerals(pw);
      if (numerals.length === 0) return { valid: false, hint: 'Current product: 0 (Needs 35)' };
      const product = numerals.reduce((acc, val) => acc * val, 1);
      return {
        valid: product === 35,
        hint: `Current product: ${product} (Hint: V × VII = 35)`,
      };
    },
  },
  {
    id: 9,
    title: 'Rule 9',
    description: 'Your password must include one of our sponsors: PEPSI, SHELL, or STARBUCKS.',
    validator: (pw) => {
      const hasSponsor = /PEPSI|SHELL|STARBUCKS/.test(pw);
      return {
        valid: hasSponsor,
        hint: hasSponsor ? 'Sponsor acknowledged' : 'Insert PEPSI, SHELL, or STARBUCKS (exact caps)',
      };
    },
  },
  {
    id: 10,
    title: 'Rule 10',
    description: 'Your password must include today’s moon phase emoji: 🌑 or 🌓 or 🌕 or 🌗.',
    validator: (pw) => {
      const hasMoon = /[🌑🌓🌕🌗]/.test(pw);
      return {
        valid: hasMoon,
        hint: hasMoon ? 'Moon phase aligned' : 'Copy & paste one: 🌑, 🌓, 🌕, 🌗',
      };
    },
  },
  {
    id: 11,
    title: 'Rule 11',
    description: 'Solve this CAPTCHA: include the number 45 (the answer to 17 + 28).',
    validator: (pw) => ({
      valid: /45/.test(pw),
      hint: /45/.test(pw) ? 'CAPTCHA solved' : 'Include "45" in your password',
    }),
  },
  {
    id: 12,
    title: 'Rule 12',
    description: 'Your password must include a leap year (e.g. 2024, 2028, 2000, 1996).',
    validator: (pw) => {
      const matches = pw.match(/\b\d{4}\b/g) || [];
      const hasLeap = matches.some((yearStr) => {
        const y = Number(yearStr);
        return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
      });
      return {
        valid: hasLeap,
        hint: hasLeap ? 'Leap year verified' : 'Include a 4-digit leap year like 2024',
      };
    },
  },
  {
    id: 13,
    title: 'Rule 13',
    description: 'Your password must include a valid 6-digit hex color code (e.g. #FF5733 or #3B82F6).',
    validator: (pw) => {
      const hasHex = /#[0-9A-Fa-f]{6}/.test(pw);
      return {
        valid: hasHex,
        hint: hasHex ? 'Color code valid' : 'Include a code like #3B82F6 or #000000',
      };
    },
  },
  {
    id: 14,
    title: 'Rule 14',
    description: 'Your password must contain all 5 English vowels: a, e, i, o, u.',
    validator: (pw) => {
      const lower = pw.toLowerCase();
      const vowels = ['a', 'e', 'i', 'o', 'u'];
      const missing = vowels.filter((v) => !lower.includes(v));
      return {
        valid: missing.length === 0,
        hint: missing.length === 0 ? 'All vowels present' : `Missing: ${missing.join(', ')}`,
      };
    },
  },
];

export default function PasswordGame() {
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  // Determine which rules are currently revealed.
  // Rules unlock progressively: rule N+1 is visible only if rule N has been satisfied, or if rule N was previously seen.
  const [maxRevealedRule, setMaxRevealedRule] = useState(1);

  // Evaluate rule states
  const ruleResults = useMemo(() => {
    return RULES.map((rule) => {
      const result = rule.validator(password);
      return {
        ...rule,
        ...result,
      };
    });
  }, [password]);

  // Check progress
  useEffect(() => {
    // If all rules up to maxRevealedRule are valid, unlock next rule!
    let nextMax = maxRevealedRule;
    for (let i = 0; i < maxRevealedRule; i++) {
      if (!ruleResults[i].valid) break;
      if (i === maxRevealedRule - 1 && maxRevealedRule < RULES.length) {
        nextMax = maxRevealedRule + 1;
        soundManager.playSuccess();
      }
    }
    if (nextMax !== maxRevealedRule) {
      setMaxRevealedRule(nextMax);
    }
  }, [ruleResults, maxRevealedRule]);

  const visibleRules = ruleResults.slice(0, maxRevealedRule);
  const allCompleted = visibleRules.length === RULES.length && visibleRules.every((r) => r.valid);

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    soundManager.playPop(600);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    soundManager.playPop(300);
    setPassword('');
    setMaxRevealedRule(1);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col h-full w-full bg-neutral-900 text-neutral-100 overflow-hidden rounded-xl border border-neutral-800 shadow-2xl">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xl">🔑</span>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">The Password Game</h2>
            <div className="text-xs text-neutral-400">
              Please choose a password. Satisfy every absurd rule that appears.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800 tabular-nums">
            Time: <span className="text-amber-400 font-semibold">{formatTime(elapsed)}</span>
          </div>
          <div className="text-xs font-mono text-neutral-400 bg-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-800">
            Rules: <span className="font-semibold text-emerald-400">{visibleRules.filter(r => r.valid).length}</span> / {RULES.length}
          </div>
          <button
            onClick={handleReset}
            title="Start over"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-2xl mx-auto w-full space-y-6">
        {/* Victory Banner */}
        {allCompleted && (
          <div className="p-6 bg-emerald-950/50 border-2 border-emerald-500/80 rounded-2xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-500 shadow-xl shadow-emerald-950/50">
            <Award className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-emerald-300">UNBELIEVABLE! YOU CONQUERED ALL RULES!</h3>
            <p className="text-xs text-emerald-200/80 max-w-md mx-auto">
              Your password has defied mathematics, typography, astronomy, and modern corporate sponsorships in {formatTime(elapsed)}.
            </p>
          </div>
        )}

        {/* Input Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
            <span className="font-medium text-neutral-300">Choose your password:</span>
            <div className="flex items-center gap-3 font-mono">
              <span>{password.length} characters</span>
            </div>
          </div>

          <div className="relative">
            <textarea
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                soundManager.playPop(700);
              }}
              placeholder="Type your password here..."
              rows={3}
              className="w-full p-4 bg-neutral-950 border-2 border-neutral-700 focus:border-amber-400 rounded-xl font-mono text-sm sm:text-base text-neutral-100 placeholder-neutral-600 focus:outline-none transition-colors shadow-inner resize-none"
            />
            {password && (
              <button
                onClick={handleCopy}
                className="absolute right-3 bottom-3 p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition-colors border border-neutral-700 text-xs flex items-center gap-1.5"
                title="Copy password to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Rules Stack */}
        <div className="space-y-3">
          {/* Rules are displayed in reverse order (newest/most challenging on top), mimicking Neal's game */}
          {visibleRules
            .slice()
            .reverse()
            .map((rule) => {
              const isValid = rule.valid;
              return (
                <div
                  key={rule.id}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    isValid
                      ? 'bg-neutral-950/60 border-neutral-800 text-neutral-400'
                      : 'bg-rose-950/30 border-rose-600/70 text-rose-100 shadow-lg shadow-rose-950/20 animate-in slide-in-from-top-2 duration-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="pt-0.5 shrink-0">
                      {isValid ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-500 animate-pulse" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-xs font-bold uppercase tracking-wider ${isValid ? 'text-neutral-500' : 'text-rose-400'}`}>
                          {rule.title}
                        </span>
                        {rule.hint && (
                          <span className={`text-[11px] font-mono px-2 py-0.5 rounded ${isValid ? 'text-neutral-500 bg-neutral-900' : 'text-rose-300 bg-rose-900/40'}`}>
                            {rule.hint}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm mt-1 font-medium ${isValid ? 'text-neutral-400 line-through opacity-70' : 'text-neutral-100'}`}>
                        {rule.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
