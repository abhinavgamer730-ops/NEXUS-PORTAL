import React from 'react';

// Cute cartoon SVG Renderer for Animal Mascots
export default function MascotSvg({ type = 'gorilla', className = 'w-24 h-24', animated = true }) {
  const bounceClass = animated ? 'animate-float' : '';

  switch (type) {
    case 'gorilla':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <circle cx="20" cy="45" r="10" fill="#334155" stroke="#000" strokeWidth="3" />
          <circle cx="80" cy="45" r="10" fill="#334155" stroke="#000" strokeWidth="3" />
          <path d="M 25 25 Q 50 10 75 25 Q 90 50 75 85 Q 50 95 25 85 Q 10 50 25 25 Z" fill="#1e293b" stroke="#000" strokeWidth="4" />
          <path d="M 32 35 Q 50 25 68 35 Q 75 60 68 75 Q 50 82 32 75 Q 25 60 32 35 Z" fill="#64748b" stroke="#000" strokeWidth="3" />
          <circle cx="40" cy="42" r="7" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="60" cy="42" r="7" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="42" cy="42" r="3.5" fill="#000" />
          <circle cx="62" cy="42" r="3.5" fill="#000" />
          <circle cx="44" cy="40" r="1.5" fill="#fff" />
          <circle cx="64" cy="40" r="1.5" fill="#fff" />
          <circle cx="34" cy="52" r="4" fill="#fb7185" opacity="0.8" />
          <circle cx="66" cy="52" r="4" fill="#fb7185" opacity="0.8" />
          <ellipse cx="50" cy="58" rx="10" ry="7" fill="#cbd5e1" stroke="#000" strokeWidth="2" />
          <circle cx="46" cy="56" r="1.5" fill="#000" />
          <circle cx="54" cy="56" r="1.5" fill="#000" />
          <path d="M 44 60 Q 50 66 56 60" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <polygon points="50,12 53,20 62,20 55,25 58,34 50,29 42,34 45,25 38,20 47,20" fill="#facc15" stroke="#000" strokeWidth="1.5" />
        </svg>
      );

    case 'panda':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <circle cx="22" cy="25" r="12" fill="#000" stroke="#000" strokeWidth="3" />
          <circle cx="78" cy="25" r="12" fill="#000" stroke="#000" strokeWidth="3" />
          <circle cx="50" cy="52" r="38" fill="#ffffff" stroke="#000" strokeWidth="4" />
          <ellipse cx="34" cy="46" rx="10" ry="12" fill="#000" transform="rotate(-15 34 46)" />
          <ellipse cx="66" cy="46" rx="10" ry="12" fill="#000" transform="rotate(15 66 46)" />
          <circle cx="35" cy="45" r="4" fill="#fff" />
          <circle cx="65" cy="45" r="4" fill="#fff" />
          <circle cx="36" cy="44" r="1.8" fill="#000" />
          <circle cx="66" cy="44" r="1.8" fill="#000" />
          <circle cx="26" cy="62" r="5" fill="#fda4af" opacity="0.9" />
          <circle cx="74" cy="62" r="5" fill="#fda4af" opacity="0.9" />
          <ellipse cx="50" cy="58" rx="5" ry="3.5" fill="#000" />
          <path d="M 45 64 Q 50 70 55 64" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <path d="M 54 65 Q 68 60 76 68 Q 66 72 54 65 Z" fill="#22c55e" stroke="#000" strokeWidth="1.5" />
        </svg>
      );

    case 'ant':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <path d="M 42 28 Q 30 10 20 15" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <path d="M 58 28 Q 70 10 80 15" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <circle cx="20" cy="15" r="4" fill="#ef4444" stroke="#000" strokeWidth="1.5" />
          <circle cx="80" cy="15" r="4" fill="#ef4444" stroke="#000" strokeWidth="1.5" />
          <ellipse cx="50" cy="72" rx="22" ry="18" fill="#b91c1c" stroke="#000" strokeWidth="4" />
          <circle cx="50" cy="50" r="14" fill="#ef4444" stroke="#000" strokeWidth="3" />
          <circle cx="50" cy="32" r="12" fill="#f87171" stroke="#000" strokeWidth="3" />
          <circle cx="45" cy="30" r="3.5" fill="#fff" stroke="#000" strokeWidth="1" />
          <circle cx="55" cy="30" r="3.5" fill="#fff" stroke="#000" strokeWidth="1" />
          <circle cx="46" cy="30" r="1.5" fill="#000" />
          <circle cx="56" cy="30" r="1.5" fill="#000" />
          <path d="M 36 50 Q 20 40 18 55 Q 28 60 36 54" fill="#ef4444" stroke="#000" strokeWidth="2.5" />
          <path d="M 64 50 Q 80 40 82 55 Q 72 60 64 54" fill="#ef4444" stroke="#000" strokeWidth="2.5" />
          <path d="M 46 36 Q 50 40 54 36" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    case 'flea':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          {/* Spring Legs */}
          <path d="M 30 65 Q 15 80 25 95 M 70 65 Q 85 80 75 95" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" />
          {/* Oval Body */}
          <ellipse cx="50" cy="50" rx="28" ry="32" fill="#a16207" stroke="#000" strokeWidth="4" />
          {/* Huge Eyes */}
          <circle cx="40" cy="40" r="8" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="60" cy="40" r="8" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="42" cy="40" r="4" fill="#000" />
          <circle cx="62" cy="40" r="4" fill="#000" />
          <circle cx="44" cy="38" r="1.5" fill="#fff" />
          <circle cx="64" cy="38" r="1.5" fill="#fff" />
          {/* Spring Coils */}
          <path d="M 40 65 Q 50 78 60 65" fill="none" stroke="#fef08a" strokeWidth="3" />
        </svg>
      );

    case 'hummingbird':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          {/* Wings */}
          <path d="M 40 45 Q 15 15 5 35 Z" fill="#06b6d4" stroke="#000" strokeWidth="2" />
          <path d="M 60 45 Q 85 15 95 35 Z" fill="#06b6d4" stroke="#000" strokeWidth="2" />
          {/* Body */}
          <ellipse cx="50" cy="55" rx="18" ry="24" fill="#0891b2" stroke="#000" strokeWidth="3" />
          {/* Head */}
          <circle cx="50" cy="36" r="14" fill="#22d3ee" stroke="#000" strokeWidth="3" />
          {/* Long Beak */}
          <polygon points="50,40 50,42 20,44" fill="#000" />
          {/* Eye */}
          <circle cx="55" cy="34" r="3" fill="#fff" stroke="#000" strokeWidth="1" />
          <circle cx="56" cy="34" r="1.5" fill="#000" />
        </svg>
      );

    case 'crow':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          {/* Head & Body */}
          <ellipse cx="50" cy="55" rx="24" ry="28" fill="#334155" stroke="#000" strokeWidth="4" />
          <circle cx="50" cy="35" r="18" fill="#1e293b" stroke="#000" strokeWidth="3" />
          {/* Beak */}
          <polygon points="50,38 72,42 50,48" fill="#facc15" stroke="#000" strokeWidth="2" />
          {/* Smart Glasses */}
          <circle cx="42" cy="34" r="6" fill="none" stroke="#000" strokeWidth="2.5" />
          <circle cx="58" cy="34" r="6" fill="none" stroke="#000" strokeWidth="2.5" />
          <line x1="48" y1="34" x2="52" y2="34" stroke="#000" strokeWidth="2.5" />
          <circle cx="42" cy="34" r="2" fill="#000" />
          <circle cx="58" cy="34" r="2" fill="#000" />
        </svg>
      );

    case 'chimp':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          {/* Big Round Ears */}
          <circle cx="18" cy="45" r="12" fill="#78350f" stroke="#000" strokeWidth="3" />
          <circle cx="82" cy="45" r="12" fill="#78350f" stroke="#000" strokeWidth="3" />
          <circle cx="18" cy="45" r="6" fill="#fde68a" />
          <circle cx="82" cy="45" r="6" fill="#fde68a" />
          {/* Head */}
          <circle cx="50" cy="48" r="32" fill="#451a03" stroke="#000" strokeWidth="4" />
          {/* Face Mask */}
          <ellipse cx="50" cy="54" rx="22" ry="18" fill="#fde68a" stroke="#000" strokeWidth="2.5" />
          {/* Eyes */}
          <circle cx="40" cy="42" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="60" cy="42" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="41" cy="42" r="2.5" fill="#000" />
          <circle cx="61" cy="42" r="2.5" fill="#000" />
          {/* Mouth */}
          <path d="M 44 60 Q 50 67 56 60" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'cheetah':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <path d="M 22 25 L 34 10 L 40 28 Z" fill="#eab308" stroke="#000" strokeWidth="3" />
          <path d="M 78 25 L 66 10 L 60 28 Z" fill="#eab308" stroke="#000" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="34" ry="30" fill="#facc15" stroke="#000" strokeWidth="4" />
          <circle cx="26" cy="42" r="3" fill="#000" />
          <circle cx="74" cy="42" r="3" fill="#000" />
          <circle cx="30" cy="62" r="3" fill="#000" />
          <circle cx="70" cy="62" r="3" fill="#000" />
          <circle cx="50" cy="26" r="2.5" fill="#000" />
          <path d="M 40 48 C 38 54 36 62 38 68" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <path d="M 60 48 C 62 54 64 62 62 68" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
          <circle cx="40" cy="44" r="6" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="60" cy="44" r="6" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="41" cy="44" r="3" fill="#15803d" />
          <circle cx="61" cy="44" r="3" fill="#15803d" />
          <polygon points="50,56 46,51 54,51" fill="#000" />
          <path d="M 45 62 Q 50 67 55 62" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'kangaroo':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <ellipse cx="32" cy="18" rx="7" ry="18" fill="#ea580c" stroke="#000" strokeWidth="3" transform="rotate(-15 32 18)" />
          <ellipse cx="68" cy="18" rx="7" ry="18" fill="#ea580c" stroke="#000" strokeWidth="3" transform="rotate(15 68 18)" />
          <path d="M 30 40 Q 50 25 70 40 Q 82 65 75 90 Q 50 96 25 90 Q 18 65 30 40 Z" fill="#f97316" stroke="#000" strokeWidth="4" />
          <path d="M 35 60 Q 50 82 65 60 Z" fill="#fed7aa" stroke="#000" strokeWidth="3" />
          <circle cx="40" cy="44" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="60" cy="44" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="41" cy="44" r="2.5" fill="#000" />
          <circle cx="61" cy="44" r="2.5" fill="#000" />
          <ellipse cx="50" cy="52" rx="7" ry="5" fill="#fdba74" stroke="#000" strokeWidth="2" />
          <ellipse cx="50" cy="50" rx="3.5" ry="2.5" fill="#000" />
          <circle cx="22" cy="62" r="7" fill="#ef4444" stroke="#000" strokeWidth="2" />
          <circle cx="78" cy="62" r="7" fill="#ef4444" stroke="#000" strokeWidth="2" />
        </svg>
      );

    case 'dolphin':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <path d="M 46 22 Q 52 5 62 18 Z" fill="#0284c7" stroke="#000" strokeWidth="3" />
          <path d="M 12 55 Q 50 15 88 50 Q 75 80 40 75 Q 20 70 12 55 Z" fill="#38bdf8" stroke="#000" strokeWidth="4" />
          <path d="M 22 58 Q 45 72 70 58 Q 50 45 22 58 Z" fill="#e0f2fe" stroke="#000" strokeWidth="2" />
          <path d="M 14 55 L 2 45 L 6 58 L 2 70 Z" fill="#0284c7" stroke="#000" strokeWidth="3" />
          <circle cx="70" cy="44" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="71" cy="44" r="2.5" fill="#000" />
          <circle cx="72" cy="43" r="1" fill="#fff" />
          <path d="M 86 48 Q 96 52 88 56" stroke="#000" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="30" cy="18" r="3" fill="#7dd3fc" />
          <circle cx="75" cy="20" r="4" fill="#7dd3fc" />
        </svg>
      );

    case 'elephant':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <ellipse cx="18" cy="45" rx="16" ry="24" fill="#94a3b8" stroke="#000" strokeWidth="3.5" />
          <ellipse cx="82" cy="45" rx="16" ry="24" fill="#94a3b8" stroke="#000" strokeWidth="3.5" />
          <ellipse cx="18" cy="45" rx="9" ry="15" fill="#cbd5e1" />
          <ellipse cx="82" cy="45" rx="9" ry="15" fill="#cbd5e1" />
          <circle cx="50" cy="48" r="32" fill="#64748b" stroke="#000" strokeWidth="4" />
          <circle cx="38" cy="40" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="62" cy="40" r="5" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="39" cy="40" r="2.5" fill="#000" />
          <circle cx="63" cy="40" r="2.5" fill="#000" />
          <path d="M 45 52 Q 50 85 64 70 Q 72 58 60 55" fill="none" stroke="#64748b" strokeWidth="12" strokeLinecap="round" />
          <path d="M 45 52 Q 50 85 64 70 Q 72 58 60 55" fill="none" stroke="#000" strokeWidth="14" strokeLinecap="round" />
          <path d="M 45 52 Q 50 85 64 70 Q 72 58 60 55" fill="none" stroke="#64748b" strokeWidth="10" strokeLinecap="round" />
          <path d="M 40 56 Q 32 64 36 70" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
          <path d="M 60 56 Q 68 64 64 70" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );

    case 'sloth':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <rect x="5" y="10" width="90" height="10" rx="5" fill="#78350f" stroke="#000" strokeWidth="3" />
          <path d="M 25 15 L 32 45" stroke="#d97706" strokeWidth="10" strokeLinecap="round" />
          <path d="M 75 15 L 68 45" stroke="#d97706" strokeWidth="10" strokeLinecap="round" />
          <circle cx="50" cy="55" r="32" fill="#b45309" stroke="#000" strokeWidth="4" />
          <ellipse cx="50" cy="55" rx="22" ry="18" fill="#fef3c7" stroke="#000" strokeWidth="2.5" />
          <ellipse cx="40" cy="52" rx="8" ry="5" fill="#78350f" transform="rotate(-10 40 52)" />
          <ellipse cx="60" cy="52" rx="8" ry="5" fill="#78350f" transform="rotate(10 60 52)" />
          <path d="M 36 52 Q 40 56 44 52" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 56 52 Q 60 56 64 52" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="50" cy="58" rx="4" ry="2.5" fill="#000" />
          <path d="M 46 62 Q 50 66 54 62" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
          <text x="75" y="30" className="font-bold fill-amber-600 text-xs animate-bounce">Z</text>
        </svg>
      );

    case 'bluewhale':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <path d="M 45 15 Q 40 2 30 10 M 50 15 L 50 0 M 55 15 Q 60 2 70 10" fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="50" cy="55" rx="42" ry="28" fill="#1e3a8a" stroke="#000" strokeWidth="4" />
          <path d="M 20 62 Q 50 78 80 62" fill="none" stroke="#60a5fa" strokeWidth="4" />
          <path d="M 25 68 Q 50 82 75 68" fill="none" stroke="#60a5fa" strokeWidth="3" />
          <circle cx="72" cy="48" r="4.5" fill="#fff" stroke="#000" strokeWidth="1.5" />
          <circle cx="73" cy="48" r="2" fill="#000" />
          <path d="M 60 58 Q 75 68 88 56" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );

    case 'tortoise':
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <path d="M 15 65 Q 50 15 85 65 Z" fill="#15803d" stroke="#000" strokeWidth="4" />
          <polygon points="50,30 35,45 40,62 60,62 65,45" fill="#22c55e" stroke="#000" strokeWidth="2" />
          <circle cx="85" cy="62" r="12" fill="#4ade80" stroke="#000" strokeWidth="3" />
          <circle cx="88" cy="58" r="3" fill="#000" />
          <circle cx="89" cy="57" r="1" fill="#fff" />
          <rect x="22" y="65" width="12" height="16" rx="6" fill="#16a34a" stroke="#000" strokeWidth="3" />
          <rect x="66" y="65" width="12" height="16" rx="6" fill="#16a34a" stroke="#000" strokeWidth="3" />
          <path d="M 88 66 Q 92 68 94 64" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );

    default: // Cute Human Hero Avatar
      return (
        <svg viewBox="0 0 100 100" className={`${className} ${bounceClass}`}>
          <path d="M 25 40 Q 50 10 75 40 Q 80 20 50 15 Q 20 20 25 40 Z" fill="#ea580c" stroke="#000" strokeWidth="3" />
          <circle cx="50" cy="48" r="30" fill="#fed7aa" stroke="#000" strokeWidth="4" />
          <circle cx="38" cy="44" r="6" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="62" cy="44" r="6" fill="#fff" stroke="#000" strokeWidth="2" />
          <circle cx="40" cy="44" r="3" fill="#0284c7" />
          <circle cx="64" cy="44" r="3" fill="#0284c7" />
          <circle cx="41" cy="42" r="1" fill="#fff" />
          <circle cx="65" cy="42" r="1" fill="#fff" />
          <circle cx="30" cy="54" r="4" fill="#fb7185" opacity="0.8" />
          <circle cx="70" cy="54" r="4" fill="#fb7185" opacity="0.8" />
          <path d="M 40 56 Q 50 68 60 56 Z" fill="#ef4444" stroke="#000" strokeWidth="2" />
          <path d="M 20 75 L 10 95 L 50 88 L 90 95 L 80 75 Z" fill="#fb6f99" stroke="#000" strokeWidth="3" />
        </svg>
      );
  }
}
