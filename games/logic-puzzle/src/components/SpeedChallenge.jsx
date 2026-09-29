import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import MascotSvg from './MascotSvg';
import { sounds } from '../utils/audio';
import { Zap, Play, Trophy, Timer, Flame, HelpCircle } from 'lucide-react';

export default function SpeedChallenge() {
  const [gameState, setGameState] = useState('idle'); // 'idle', 'running', 'finished'
  const [tapCount, setTapCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(5.0);
  const [userSpeedKmh, setUserSpeedKmh] = useState(0);
  const timerRef = useRef(null);

  // Animal Speed Competitors (in km/h)
  const RUNNERS = [
    { name: 'Sloth', speed: 0.24, mascot: 'sloth', color: 'bg-amber-400' },
    { name: 'Tortoise', speed: 0.3, mascot: 'tortoise', color: 'bg-green-400' },
    { name: 'House Cat', speed: 48, mascot: 'crow', color: 'bg-sky-400' },
    { name: 'Usain Bolt', speed: 44.7, mascot: 'human', color: 'bg-pink-400' },
    { name: 'Ostrich', speed: 70, mascot: 'kangaroo', color: 'bg-orange-400' },
    { name: 'Cheetah', speed: 112, mascot: 'cheetah', color: 'bg-yellow-400' }
  ];

  const startGame = () => {
    sounds.playPop(600);
    setTapCount(0);
    setTimeLeft(5.0);
    setUserSpeedKmh(0);
    setGameState('running');

    const startTime = Date.now();
    const duration = 5000; // 5 sec

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, (duration - elapsed) / 1000);
      setTimeLeft(Number(remaining.toFixed(1)));

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        endGame();
      }
    }, 50);
  };

  const handleTap = () => {
    if (gameState !== 'running') return;
    sounds.playStep();
    setTapCount(prev => prev + 1);
  };

  const endGame = () => {
    setGameState('finished');
    sounds.playFanfare();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
  };

  useEffect(() => {
    if (gameState === 'finished') {
      const calculatedKmh = Number((tapCount * 0.95).toFixed(1));
      setUserSpeedKmh(calculatedKmh);
    }
  }, [gameState, tapCount]);

  const getSpeedRank = (speed) => {
    if (speed >= 40) return { title: 'Cheetah Speed Demon! 🐆⚡', color: 'text-amber-500' };
    if (speed >= 28) return { title: 'Usain Bolt Sprinter! 🏃‍♂️💨', color: 'text-pink-500' };
    if (speed >= 18) return { title: 'Agile House Cat! 🐱✨', color: 'text-sky-500' };
    if (speed >= 8) return { title: 'Brisk Meadow Bunny! 🐇', color: 'text-green-500' };
    return { title: 'Chill Sloth Cruiser! 𦥑', color: 'text-amber-700' };
  };

  const rankInfo = getSpeedRank(userSpeedKmh);

  return (
    <section id="speed" className="py-16 px-4 bg-sunny-100/50 dark:bg-slate-950 border-b-4 border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sunny-300 border-2 border-slate-900 shadow-cartoon text-xs font-black uppercase mb-3">
            <Zap className="w-4 h-4 text-slate-900" />
            PAWS & CLAWS SPEED SPRINT
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            5-Second <span className="text-sunny-500 underline decoration-wavy decoration-bubblegum-400">Speed Challenge</span>!
          </h2>
          <p className="mt-3 text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300">
            Tap as fast as you can for 5 seconds to race nature's fastest wild animals!
          </p>

          {/* How to Play Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-left max-w-4xl mx-auto">
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-900 text-xs font-bold flex items-center gap-2 shadow-sm">
              <span className="w-7 h-7 rounded-xl bg-sunny-300 border border-slate-900 flex items-center justify-center font-black">1</span>
              <span>Click <strong>Start Sprint</strong> below</span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-900 text-xs font-bold flex items-center gap-2 shadow-sm">
              <span className="w-7 h-7 rounded-xl bg-bubblegum-300 border border-slate-900 flex items-center justify-center font-black">2</span>
              <span>Tap giant button <strong>fast as possible!</strong></span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-900 text-xs font-bold flex items-center gap-2 shadow-sm">
              <span className="w-7 h-7 rounded-xl bg-mint-300 border border-slate-900 flex items-center justify-center font-black">3</span>
              <span>Watch your runner <strong>race animals!</strong></span>
            </div>
          </div>
        </div>

        {/* SPEED MINI-GAME ARENA */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
          
          {/* TAP CONTROLLER (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg text-center space-y-6">
            
            {/* Timer & Tap Count Header */}
            <div className="flex items-center justify-between p-4 bg-amber-50 dark:bg-slate-700 rounded-2xl border-3 border-slate-900">
              <div className="flex items-center gap-2">
                <Timer className="w-6 h-6 text-amber-500 animate-pulse" />
                <div>
                  <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block">TIME LEFT</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{timeLeft.toFixed(1)}s</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 block">TOTAL TAPS</span>
                <span className="text-3xl font-black text-bubblegum-500">{tapCount}</span>
              </div>
            </div>

            {/* Giant Bouncy Tap Button */}
            {gameState !== 'running' ? (
              <button
                onClick={startGame}
                className="w-full py-8 rounded-3xl bg-sunny-400 hover:bg-sunny-300 text-slate-900 border-4 border-slate-900 shadow-cartoon-lg hover:shadow-cartoon-xl hover:-translate-y-1 active:translate-y-1 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-white border-3 border-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 text-slate-900 fill-slate-900" />
                </div>
                <span className="text-2xl font-black uppercase tracking-wider">
                  {gameState === 'finished' ? 'RESTART SPRINT! ⚡' : 'START SPRINT RUN! ⚡'}
                </span>
                <span className="text-xs font-bold text-slate-800">
                  Tap fast continuously for 5 seconds
                </span>
              </button>
            ) : (
              <button
                onClick={handleTap}
                className="w-full py-12 rounded-3xl bg-bubblegum-400 hover:bg-bubblegum-500 text-white border-4 border-slate-900 shadow-cartoon-xl active:scale-95 transition-transform flex flex-col items-center justify-center gap-2 select-none cursor-pointer animate-pulse"
              >
                <Flame className="w-14 h-14 text-sunny-300 animate-bounce" />
                <span className="text-3xl sm:text-4xl font-black uppercase tracking-widest drop-shadow">
                  TAP TAP TAP! 🐾
                </span>
              </button>
            )}

            {/* Finish Speed Result Box */}
            {gameState === 'finished' && (
              <div className="p-4 bg-mint-100 dark:bg-slate-700 rounded-2xl border-3 border-slate-900 space-y-2 animate-pop-in">
                <span className="text-xs font-black uppercase text-slate-700 dark:text-slate-300">Your Calculated Speed</span>
                <p className="text-4xl font-black text-slate-900 dark:text-white">
                  {userSpeedKmh} <span className="text-lg text-slate-600 dark:text-slate-300">km/h</span>
                </p>
                <p className={`text-base font-black uppercase ${rankInfo.color}`}>
                  {rankInfo.title}
                </p>
              </div>
            )}

          </div>

          {/* CARTOON RACE TRACK (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg space-y-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Trophy className="w-5 h-5 text-sunny-500" /> Live Cartoon Race Track
            </h3>

            {/* Track Lanes */}
            <div className="space-y-3 bg-slate-100 dark:bg-slate-900 p-4 rounded-2xl border-3 border-slate-900 relative">
              
              {/* Finish Line */}
              <div className="absolute right-6 top-0 bottom-0 w-4 bg-slate-900 flex flex-col justify-between items-center py-2 z-10">
                <span className="text-[10px] text-amber-300 font-black rotate-90 uppercase">FINISH</span>
              </div>

              {/* User Runner Lane */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-black text-slate-900 dark:text-white uppercase">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-bubblegum-500 inline-block" />
                    YOU (Runner)
                  </span>
                  <span>{userSpeedKmh} km/h</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-10 rounded-xl border-2 border-slate-900 relative overflow-hidden">
                  <div
                    className="absolute top-1 bottom-1 left-1 bg-bubblegum-400 rounded-lg border-2 border-slate-900 transition-all duration-500 flex items-center justify-end px-2"
                    style={{ width: `${Math.min(95, Math.max(12, (userSpeedKmh / 120) * 100))}%` }}
                  >
                    <MascotSvg type="human" className="w-7 h-7" />
                  </div>
                </div>
              </div>

              {/* Animal Competitor Lanes */}
              {RUNNERS.map((runner) => {
                const percent = Math.min(95, Math.max(8, (runner.speed / 120) * 100));
                return (
                  <div key={runner.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                      <span>{runner.name}</span>
                      <span>{runner.speed} km/h</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-9 rounded-xl border-2 border-slate-900 relative overflow-hidden">
                      <div
                        className={`absolute top-1 bottom-1 left-1 ${runner.color} rounded-lg border-2 border-slate-900 transition-all duration-500 flex items-center justify-end px-2`}
                        style={{ width: `${percent}%` }}
                      >
                        <MascotSvg type={runner.mascot} className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
