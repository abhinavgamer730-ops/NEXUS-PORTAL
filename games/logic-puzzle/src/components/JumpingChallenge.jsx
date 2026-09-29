import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import MascotSvg from './MascotSvg';
import { sounds } from '../utils/audio';
import { Trophy, ArrowUpCircle, Sparkles, Flame } from 'lucide-react';

export default function JumpingChallenge() {
  const [userJumpCm, setUserJumpCm] = useState(55); // average human vertical jump ~50-65 cm
  const [isLaunching, setIsLaunching] = useState(false);
  const [chargePower, setChargePower] = useState(60);

  // Jump benchmarks in cm
  const JUMPERS = [
    { id: 'flea', name: 'Flea', cm: 18, desc: '100x body length launch!', mascot: 'flea', color: 'bg-amber-300' },
    { id: 'human', name: 'Average Human', cm: 55, desc: 'Standing vertical jump', mascot: 'human', color: 'bg-bubblegum-300' },
    { id: 'chimp', name: 'Chimpanzee', cm: 140, desc: 'Tree-to-tree spring', mascot: 'chimp', color: 'bg-yellow-300' },
    { id: 'kangaroo', name: 'Kangaroo', cm: 300, desc: '3.0m (10 ft) vertical bounce!', mascot: 'kangaroo', color: 'bg-orange-300' },
    { id: 'dolphin', name: 'Dolphin Breaching', cm: 450, desc: '4.5m (15 ft) water leap!', mascot: 'dolphin', color: 'bg-sky-300' }
  ];

  const JUMP_PRESETS = [
    { label: 'Low Jump 🐰', cm: 35 },
    { label: 'Average 🏃', cm: 55 },
    { label: 'High Dunk 🏀', cm: 80 },
    { label: 'Super Leap 🚀', cm: 105 }
  ];

  const handleLaunch = () => {
    sounds.playBoing();
    setIsLaunching(true);

    const finalJump = Math.round(30 + (chargePower / 100) * 80);
    setUserJumpCm(finalJump);

    setTimeout(() => {
      setIsLaunching(false);
      sounds.playFanfare();
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
    }, 800);
  };

  const getJumpingFeedback = (cm) => {
    if (cm >= 90) return { label: 'NBA Slam Dunker! 🏀💥', sub: 'Extremely high vertical jump!' };
    if (cm >= 65) return { label: 'Athletic Grasshopper! 🦗✨', sub: 'Great spring leg power!' };
    return { label: 'Friendly Bouncy Bunny! 🐰', sub: 'Keep training those calves!' };
  };

  const feedback = getJumpingFeedback(userJumpCm);

  return (
    <section id="jump" className="py-16 px-4 bg-mint-100/50 dark:bg-slate-900 border-b-4 border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-mint-300 border-2 border-slate-900 shadow-cartoon text-xs font-black uppercase mb-3">
            <Trophy className="w-4 h-4 text-slate-900" />
            BOING! HIGH-JUMP ARENA
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Vertical <span className="text-mint-500 underline decoration-wavy decoration-sunny-400">Jumping Challenge</span>!
          </h2>
          <p className="mt-3 text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300">
            Pick a quick jump preset or charge the spring launcher to test your vertical leap against animals!
          </p>
        </div>

        {/* JUMP ARENA GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* JUMP CONTROLLER (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg space-y-6">
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <ArrowUpCircle className="w-6 h-6 text-mint-500" /> Set Your Jump Height
            </h3>

            {/* Quick Presets */}
            <div className="space-y-2">
              <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">1-Click Quick Presets</span>
              <div className="grid grid-cols-2 gap-2">
                {JUMP_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      setUserJumpCm(p.cm);
                      sounds.playPop(450);
                    }}
                    className={`py-2 px-3 rounded-xl border-2 border-slate-900 text-xs font-black transition-all ${
                      userJumpCm === p.cm
                        ? 'bg-mint-400 text-slate-900 shadow-cartoon scale-105'
                        : 'bg-slate-100 dark:bg-slate-700 hover:bg-sunny-100 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {p.label} ({p.cm}cm)
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <span>Vertical Jump Slider</span>
                <span className="px-3 py-1 bg-mint-200 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold">
                  {userJumpCm} cm
                </span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                value={userJumpCm}
                onChange={(e) => {
                  setUserJumpCm(Number(e.target.value));
                  sounds.playPop(400 + Number(e.target.value) * 3);
                }}
                className="w-full accent-mint-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Spring Launcher */}
            <div className="p-4 bg-mint-50 dark:bg-slate-700 rounded-2xl border-3 border-slate-900 space-y-4 text-center">
              <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 text-orange-500" /> Tap-to-Charge Boing Launcher
              </span>

              <div className="w-full bg-slate-200 dark:bg-slate-800 h-6 rounded-full border-2 border-slate-900 overflow-hidden relative">
                <div
                  className="h-full bg-gradient-to-r from-sunny-400 via-mint-400 to-bubblegum-400 transition-all duration-150"
                  style={{ width: `${chargePower}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                <button
                  onClick={() => setChargePower(prev => Math.min(100, prev + 15))}
                  className="px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border-2 border-slate-900 font-extrabold hover:bg-sunny-100 shadow-sm"
                >
                  ⚡ Charge Spring!
                </button>
                <span>{chargePower}% Power</span>
              </div>

              <button
                onClick={handleLaunch}
                disabled={isLaunching}
                className={`w-full py-4 rounded-2xl bg-mint-400 hover:bg-mint-300 text-slate-900 border-3 border-slate-900 shadow-cartoon font-black text-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  isLaunching ? 'animate-bounce' : 'hover:-translate-y-1'
                }`}
              >
                <Sparkles className="w-6 h-6 text-slate-900" />
                {isLaunching ? 'BOING! LAUNCHING... 🚀' : 'LAUNCH HIGH-JUMP! 🚀'}
              </button>
            </div>

            {/* Feedback */}
            <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl border-3 border-slate-900 text-center space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Jumping Persona</span>
              <p className="text-lg font-black text-slate-900 dark:text-white uppercase">
                {feedback.label}
              </p>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-300">
                {feedback.sub}
              </p>
            </div>

          </div>

          {/* HIGH-JUMP TOWER VISUALIZER (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Trophy className="w-5 h-5 text-mint-500" /> Vertical Jump Tower Comparison
            </h3>

            <div className="relative bg-gradient-to-t from-emerald-100 via-sky-100 to-indigo-100 dark:from-slate-900 dark:to-slate-800 p-6 rounded-2xl border-3 border-slate-900 min-h-[380px] flex flex-col justify-end">
              
              <div className="absolute top-4 right-6 opacity-40 font-black text-xs text-sky-600 animate-float">
                ☁️ 450 cm Sky Level
              </div>

              <div className="space-y-6 relative z-10">
                {JUMPERS.map((item) => {
                  const isUser = item.id === 'human';
                  const currentCm = isUser ? userJumpCm : item.cm;

                  return (
                    <div
                      key={item.id}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-3 border-slate-900 transition-all ${
                        isUser
                          ? 'bg-bubblegum-300 shadow-cartoon scale-105 z-20'
                          : `${item.color} bg-opacity-90`
                      }`}
                    >
                      <div className="w-12 h-12 bg-white rounded-xl border-2 border-slate-900 flex items-center justify-center shrink-0">
                        <MascotSvg type={isUser ? 'human' : item.mascot} className="w-9 h-9" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-slate-900 uppercase">
                            {isUser ? `YOU (${userJumpCm} cm)` : item.name}
                          </span>
                          <span className="text-xs font-black bg-white px-2 py-0.5 rounded-md border border-slate-900">
                            {currentCm} cm
                          </span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-800">
                          {isUser ? 'Your Standing Vertical Jump' : item.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
