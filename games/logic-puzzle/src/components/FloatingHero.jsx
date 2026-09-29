import React from 'react';
import confetti from 'canvas-confetti';
import { Activity, Zap, Trophy, Utensils, Swords, Flame, Sparkles } from 'lucide-react';
import MascotSvg from './MascotSvg';
import { sounds } from '../utils/audio';

export default function FloatingHero() {

  const triggerConfetti = () => {
    sounds.playFanfare();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#fb6f99', '#facc15', '#4ade80', '#38bdf8', '#c084fc']
    });
  };

  const challengeCards = [
    {
      id: 'stats',
      href: '#stats',
      title: 'Human Stat Match',
      desc: 'Enter IQ, Weight, Deadlift & reveal your animal match!',
      icon: Activity,
      color: 'bg-bubblegum-400',
      badge: 'MAIN MATCH',
      mascot: 'gorilla',
      anim: 'animate-float'
    },
    {
      id: 'speed',
      href: '#speed',
      title: 'Speed Sprint',
      desc: 'Fast-tap reaction test against Cheetah, Cat & Sloth!',
      icon: Zap,
      color: 'bg-sunny-400',
      badge: 'MINI-GAME',
      mascot: 'cheetah',
      anim: 'animate-float-delayed'
    },
    {
      id: 'jump',
      href: '#jump',
      title: 'Boing! Jump Arena',
      desc: 'Launch up vertical heights vs Flea, Frog & Kangaroo!',
      icon: Trophy,
      color: 'bg-mint-400',
      badge: 'HIGH JUMP',
      mascot: 'flea',
      anim: 'animate-float'
    },
    {
      id: 'diet',
      href: '#diet',
      title: 'Dietary Fun Facts',
      desc: 'Compare food, water & sleep to Pandas & Blue Whales!',
      icon: Utensils,
      color: 'bg-sky-400',
      badge: 'FEAST MODE',
      mascot: 'panda',
      anim: 'animate-float-delayed'
    },
    {
      id: 'vs',
      href: '#vs',
      title: '1v1 VS Showdown',
      desc: 'Pick any wild beast & battle in head-to-head stats!',
      icon: Swords,
      color: 'bg-popPurple-400',
      badge: 'VERSUS BATTLE',
      mascot: 'dolphin',
      anim: 'animate-float'
    }
  ];

  return (
    <section className="relative overflow-hidden pt-8 pb-16 px-4 bg-gradient-to-b from-pink-100/60 via-amber-50 to-sky-100/60 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b-4 border-slate-900">
      
      {/* Floating Background Cloud/Paws */}
      <div className="absolute top-10 left-10 opacity-20 pointer-events-none animate-bounce-slow">
        <MascotSvg type="ant" className="w-20 h-20" />
      </div>
      <div className="absolute top-20 right-10 opacity-20 pointer-events-none animate-float">
        <MascotSvg type="hummingbird" className="w-24 h-24" />
      </div>

      <div className="max-w-7xl mx-auto text-center relative z-10">
        
        {/* Banner Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sunny-300 border-3 border-slate-900 shadow-cartoon mb-6 hover:scale-105 transition-transform cursor-pointer" onClick={triggerConfetti}>
          <Flame className="w-5 h-5 text-red-600 animate-bounce" />
          <span className="text-xs sm:text-sm font-black tracking-wide text-slate-900 uppercase">
            Are You Stronger Than a Gorilla & Smarter Than a Dolphin?
          </span>
          <Sparkles className="w-4 h-4 text-purple-600" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none drop-shadow-md mb-4">
          YOU <span className="text-bubblegum-500 inline-block -rotate-3 bg-sunny-300 px-3 py-1 rounded-2xl border-4 border-slate-900 shadow-cartoon">VERSUS</span> ANIMAL
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-xl font-bold text-slate-700 dark:text-slate-300 mb-10 leading-relaxed">
          Input your IQ, deadlift, height & age to reveal your matching <span className="text-bubblegum-500 underline decoration-wavy">cartoon mascot</span>! Race cheetahs, launch high-jumps, and compare wild animal habits.
        </p>

        {/* FLOATING CHALLENGE ICONS / CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 max-w-6xl mx-auto mt-4">
          {challengeCards.map((card) => {
            const Icon = card.icon;
            return (
              <a
                key={card.id}
                href={card.href}
                onClick={() => sounds.playPop(450)}
                className={`group relative p-5 rounded-3xl ${card.color} border-4 border-slate-900 shadow-cartoon-lg hover:shadow-cartoon-xl hover:-translate-y-3 active:translate-y-0 transition-all duration-300 flex flex-col justify-between text-left ${card.anim}`}
              >
                {/* Badge */}
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/90 text-slate-900 border-2 border-slate-900 text-[10px] font-black uppercase tracking-wider">
                    {card.badge}
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-white border-2 border-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-slate-900" />
                  </div>
                </div>

                {/* Mascot Preview */}
                <div className="my-2 flex justify-center">
                  <MascotSvg type={card.mascot} className="w-20 h-20 filter drop-shadow-md group-hover:scale-110 transition-transform" />
                </div>

                {/* Info */}
                <div>
                  <h3 className="text-lg font-black text-slate-900 uppercase leading-tight mb-1 group-hover:text-white transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-900/90 leading-snug">
                    {card.desc}
                  </p>
                </div>

                {/* Arrow hint */}
                <div className="mt-3 pt-2 border-t-2 border-slate-900/20 flex items-center justify-between text-xs font-black text-slate-900 uppercase">
                  <span>Explore Now</span>
                  <span className="group-hover:translate-x-1 transition-transform">➔</span>
                </div>
              </a>
            );
          })}
        </div>

      </div>
    </section>
  );
}
