import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { getMascotMatch, ANIMALS } from '../data/animals';
import MascotSvg from './MascotSvg';
import { sounds } from '../utils/audio';
import { Sparkles, Trophy, Zap, Dumbbell, Brain, Scale, Ruler, Cake, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

export default function StatChallenge() {
  const [unit, setUnit] = useState('metric'); // 'metric' (kg, cm) or 'imperial' (lbs, in)
  const [mode, setMode] = useState('presets'); // 'presets' or 'sliders'
  
  // User Inputs state
  const [stats, setStats] = useState({
    iq: 120,
    weight: 75, // kg
    height: 175, // cm
    age: 26, // years
    deadlift: 130, // kg
    pullingForce: 650 // N
  });

  const [currentMatch, setCurrentMatch] = useState(() => getMascotMatch(stats));

  // Quick Preset Profiles for 1-Click Fun!
  const PRESETS = [
    {
      id: 'athlete',
      title: 'Gym Lifter 🏋️‍♂️',
      desc: 'Strong lift & athletic weight',
      stats: { iq: 115, weight: 85, height: 180, age: 24, deadlift: 190, pullingForce: 1200 },
      color: 'bg-red-400 hover:bg-red-300'
    },
    {
      id: 'brainiac',
      title: 'Brainiac Genius 🧠',
      desc: 'High IQ & puzzle solver',
      stats: { iq: 145, weight: 68, height: 172, age: 28, deadlift: 70, pullingForce: 450 },
      color: 'bg-sky-400 hover:bg-sky-300'
    },
    {
      id: 'chiller',
      title: 'Couch Potato 🦥',
      desc: 'Super relaxed & low effort',
      stats: { iq: 95, weight: 80, height: 170, age: 30, deadlift: 25, pullingForce: 200 },
      color: 'bg-amber-400 hover:bg-amber-300'
    },
    {
      id: 'runner',
      title: 'Track Runner 🏃‍♀️',
      desc: 'Lightweight & speedy legs',
      stats: { iq: 120, weight: 62, height: 178, age: 22, deadlift: 100, pullingForce: 700 },
      color: 'bg-mint-400 hover:bg-mint-300'
    },
    {
      id: 'average',
      title: 'Average Joe/Jane 🧔',
      desc: 'Balanced everyday human',
      stats: { iq: 110, weight: 70, height: 170, age: 25, deadlift: 85, pullingForce: 500 },
      color: 'bg-bubblegum-400 hover:bg-bubblegum-300'
    }
  ];

  useEffect(() => {
    const result = getMascotMatch(stats);
    setCurrentMatch(result);
  }, [stats]);

  const handleApplyPreset = (preset) => {
    sounds.playFanfare();
    setStats(preset.stats);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleInputChange = (field, val) => {
    const num = Math.max(0, Number(val));
    setStats(prev => ({ ...prev, [field]: num }));
    sounds.playPop(300 + num % 400);
  };

  const handleUnitToggle = (newUnit) => {
    if (newUnit === unit) return;
    sounds.playPop(500);
    setUnit(newUnit);
    if (newUnit === 'imperial') {
      setStats(prev => ({
        ...prev,
        weight: Math.round(prev.weight * 2.20462),
        height: Math.round(prev.height * 0.393701),
        deadlift: Math.round(prev.deadlift * 2.20462)
      }));
    } else {
      setStats(prev => ({
        ...prev,
        weight: Math.round(prev.weight / 2.20462),
        height: Math.round(prev.height / 0.393701),
        deadlift: Math.round(prev.deadlift / 2.20462)
      }));
    }
  };

  const displayWeight = stats.weight;
  const weightLabel = unit === 'imperial' ? 'lbs' : 'kg';
  const displayHeight = stats.height;
  const heightLabel = unit === 'imperial' ? 'in' : 'cm';
  const displayDeadlift = stats.deadlift;
  const deadliftLabel = unit === 'imperial' ? 'lbs' : 'kg';

  const triggerCelebrate = () => {
    sounds.playFanfare();
    confetti({ particleCount: 100, spread: 90, origin: { y: 0.6 } });
  };

  return (
    <section id="stats" className="py-16 px-4 bg-amber-50/50 dark:bg-slate-900 border-b-4 border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-bubblegum-300 border-2 border-slate-900 shadow-cartoon text-xs font-black uppercase mb-3">
            <Trophy className="w-4 h-4 text-slate-900" />
            EASY 1-CLICK ANIMAL MATCHING
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Which <span className="text-bubblegum-500 underline decoration-wavy decoration-sunny-400">Animal</span> Are You?
          </h2>
          <p className="mt-3 text-base sm:text-lg font-bold text-slate-600 dark:text-slate-300">
            Pick a 1-click preset below or fine-tune your stats to instantly reveal your matching cartoon mascot!
          </p>

          {/* Mode Switcher Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-6">
            <button
              onClick={() => { setMode('presets'); sounds.playPop(500); }}
              className={`px-5 py-2 rounded-2xl font-black text-sm uppercase transition-all flex items-center gap-2 border-3 border-slate-900 shadow-cartoon ${
                mode === 'presets'
                  ? 'bg-sunny-400 text-slate-900 scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-amber-100'
              }`}
            >
              ⚡ 1-Click Quick Presets
            </button>
            <button
              onClick={() => { setMode('sliders'); sounds.playPop(520); }}
              className={`px-5 py-2 rounded-2xl font-black text-sm uppercase transition-all flex items-center gap-2 border-3 border-slate-900 shadow-cartoon ${
                mode === 'sliders'
                  ? 'bg-bubblegum-400 text-white scale-105'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-pink-100'
              }`}
            >
              🎛️ Custom Stat Sliders
            </button>
          </div>
        </div>

        {/* 1-CLICK PRESETS CONTAINER */}
        {mode === 'presets' && (
          <div className="mb-10 max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg animate-pop-in">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-sunny-500" /> Tap Any Persona to Instant-Match:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className={`p-4 rounded-2xl ${preset.color} text-slate-900 border-3 border-slate-900 shadow-cartoon hover:-translate-y-1 active:translate-y-0 transition-all text-left flex flex-col justify-between cursor-pointer group`}
                >
                  <div>
                    <h4 className="text-base font-black uppercase mb-1 flex items-center justify-between">
                      <span>{preset.title}</span>
                      <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </h4>
                    <p className="text-xs font-extrabold text-slate-800 leading-tight">
                      {preset.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t-2 border-slate-900/20 text-[10px] font-black uppercase">
                    Lift: {preset.stats.deadlift}kg | IQ: {preset.stats.iq}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* MAIN LAYOUT: INPUTS (5 Cols) vs MATCH RESULTS (7 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* STAT INPUTS FORM */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b-2 border-slate-200 dark:border-slate-700">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <span>🎛️</span> Adjust Your Stats
              </h3>

              {/* Unit Toggle */}
              <div className="inline-flex bg-slate-100 dark:bg-slate-700 p-1 rounded-xl border-2 border-slate-900 text-xs font-black">
                <button
                  onClick={() => handleUnitToggle('metric')}
                  className={`px-2.5 py-1 rounded-lg ${unit === 'metric' ? 'bg-bubblegum-400 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Metric
                </button>
                <button
                  onClick={() => handleUnitToggle('imperial')}
                  className={`px-2.5 py-1 rounded-lg ${unit === 'imperial' ? 'bg-sunny-400 text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}
                >
                  Imperial
                </button>
              </div>
            </div>

            {/* 1. IQ Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-sky-500" /> Brain IQ Score
                </label>
                <span className="px-3 py-0.5 bg-sky-200 dark:bg-sky-900 rounded-lg border-2 border-slate-900 text-slate-900 dark:text-sky-200 font-extrabold">
                  {stats.iq} IQ
                </span>
              </div>
              <input
                type="range"
                min="70"
                max="160"
                value={stats.iq}
                onChange={(e) => handleInputChange('iq', e.target.value)}
                className="w-full accent-sky-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Level: {stats.iq >= 135 ? '🐬 Genius Dolphin Level!' : stats.iq >= 120 ? '🦍 Smart Gorilla Level!' : stats.iq >= 100 ? '🦅 Puzzle Crow Level!' : '🦥 Chill Sloth Level'}
              </p>
            </div>

            {/* 2. Weight Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-amber-500" /> Body Weight ({weightLabel})
                </label>
                <input
                  type="number"
                  value={displayWeight}
                  onChange={(e) => handleInputChange('weight', e.target.value)}
                  className="w-24 text-right px-3 py-1 bg-amber-50 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold"
                />
              </div>
              <input
                type="range"
                min={unit === 'imperial' ? '60' : '30'}
                max={unit === 'imperial' ? '400' : '180'}
                value={displayWeight}
                onChange={(e) => handleInputChange('weight', e.target.value)}
                className="w-full accent-amber-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
            </div>

            {/* 3. Height Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  <Ruler className="w-4 h-4 text-mint-500" /> Height ({heightLabel})
                </label>
                <input
                  type="number"
                  value={displayHeight}
                  onChange={(e) => handleInputChange('height', e.target.value)}
                  className="w-24 text-right px-3 py-1 bg-mint-50 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold"
                />
              </div>
              <input
                type="range"
                min={unit === 'imperial' ? '40' : '100'}
                max={unit === 'imperial' ? '90' : '230'}
                value={displayHeight}
                onChange={(e) => handleInputChange('height', e.target.value)}
                className="w-full accent-mint-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
            </div>

            {/* 4. Age Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  <Cake className="w-4 h-4 text-pink-500" /> Age (Years)
                </label>
                <input
                  type="number"
                  value={stats.age}
                  onChange={(e) => handleInputChange('age', e.target.value)}
                  className="w-24 text-right px-3 py-1 bg-pink-50 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold"
                />
              </div>
              <input
                type="range"
                min="5"
                max="100"
                value={stats.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full accent-pink-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
            </div>

            {/* 5. Deadlift Capacity Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-red-500" /> Max Deadlift ({deadliftLabel})
                </label>
                <input
                  type="number"
                  value={displayDeadlift}
                  onChange={(e) => handleInputChange('deadlift', e.target.value)}
                  className="w-24 text-right px-3 py-1 bg-red-50 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold"
                />
              </div>
              <input
                type="range"
                min={unit === 'imperial' ? '20' : '10'}
                max={unit === 'imperial' ? '1100' : '500'}
                value={displayDeadlift}
                onChange={(e) => handleInputChange('deadlift', e.target.value)}
                className="w-full accent-red-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
              <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Relative Strength: {(stats.deadlift / (stats.weight || 1)).toFixed(2)}x Body Weight
              </p>
            </div>

          </div>

          {/* REVEALED MASCOT RESULTS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* OVERALL CHAMPION MATCH CARD */}
            <div className="bg-gradient-to-r from-bubblegum-300 via-sunny-300 to-mint-300 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-xl relative overflow-hidden animate-pop-in">
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 bg-slate-900 text-sunny-400 rounded-full text-xs font-black uppercase tracking-wider shadow flex items-center gap-1">
                  🏆 OVERALL MATCHING ANIMAL
                </span>
                <button
                  onClick={triggerCelebrate}
                  className="px-3 py-1 bg-white text-slate-900 rounded-xl border-2 border-slate-900 text-xs font-black hover:scale-105 transition-transform flex items-center gap-1 shadow-cartoon"
                >
                  <Sparkles className="w-4 h-4 text-bubblegum-500" /> Celebrate Card!
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-32 h-32 bg-white rounded-3xl border-4 border-slate-900 p-2 shadow-cartoon flex items-center justify-center shrink-0">
                  <MascotSvg type={currentMatch.championMascot.svgType} className="w-24 h-24" />
                </div>
                <div>
                  <h4 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase leading-none mb-2">
                    You're a {currentMatch.championMascot.name}! {currentMatch.championMascot.emoji}
                  </h4>
                  <p className="text-sm font-extrabold text-slate-800 mb-3">
                    "{currentMatch.championMascot.tagline}"
                  </p>
                  <p className="text-xs font-bold text-slate-900 bg-white/90 p-3 rounded-2xl border-2 border-slate-900">
                    💡 <span className="font-extrabold">Wild Stat Fact:</span> {currentMatch.championMascot.funFact}
                  </p>
                </div>
              </div>
            </div>

            {/* LIVE MASCOT CATEGORY MATCH CARDS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Strength Mascot Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-3 border-slate-900 p-4 shadow-cartoon flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-slate-700 border-2 border-slate-900 flex items-center justify-center shrink-0">
                  <MascotSvg type={currentMatch.strengthMascot.svgType} className="w-12 h-12" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                    🏋️ STRENGTH MATCH
                  </span>
                  <h5 className="text-base font-black text-slate-900 dark:text-white uppercase">
                    {currentMatch.strengthMascot.name}
                  </h5>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Lift: {currentMatch.strengthMascot.deadliftKg}kg | {currentMatch.strengthMascot.relativeStrength}x BW
                  </p>
                </div>
              </div>

              {/* IQ Mascot Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-3 border-slate-900 p-4 shadow-cartoon flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-slate-700 border-2 border-slate-900 flex items-center justify-center shrink-0">
                  <MascotSvg type={currentMatch.iqMascot.svgType} className="w-12 h-12" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-sky-600 dark:text-sky-400">
                    🧠 BRAIN IQ MATCH
                  </span>
                  <h5 className="text-base font-black text-slate-900 dark:text-white uppercase">
                    {currentMatch.iqMascot.name}
                  </h5>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    IQ Rating: {currentMatch.iqMascot.iq} IQ
                  </p>
                </div>
              </div>

              {/* Weight Match Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-3 border-slate-900 p-4 shadow-cartoon flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-sunny-100 dark:bg-slate-700 border-2 border-slate-900 flex items-center justify-center shrink-0">
                  <MascotSvg type={currentMatch.weightMascot.svgType} className="w-12 h-12" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    ⚖️ BODY MASS MATCH
                  </span>
                  <h5 className="text-base font-black text-slate-900 dark:text-white uppercase">
                    {currentMatch.weightMascot.name}
                  </h5>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Mass: {currentMatch.weightMascot.weightDisplay}
                  </p>
                </div>
              </div>

              {/* Age Match Card */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl border-3 border-slate-900 p-4 shadow-cartoon flex items-center gap-4 hover:-translate-y-1 transition-transform">
                <div className="w-16 h-16 rounded-2xl bg-mint-100 dark:bg-slate-700 border-2 border-slate-900 flex items-center justify-center shrink-0">
                  <MascotSvg type={currentMatch.ageMascot.svgType} className="w-12 h-12" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-green-600 dark:text-green-400">
                    🎂 LIFESPAN MATCH
                  </span>
                  <h5 className="text-base font-black text-slate-900 dark:text-white uppercase">
                    {currentMatch.ageMascot.name}
                  </h5>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    Lifespan: ~{currentMatch.ageMascot.lifespanYears} years
                  </p>
                </div>
              </div>

            </div>

            {/* RELATIVE STRENGTH BOX */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-5 shadow-cartoon space-y-3">
              <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Relative Strength Battle
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-red-50 dark:bg-slate-700 rounded-2xl border-2 border-slate-900">
                  <span className="text-xs font-black uppercase text-red-600 dark:text-red-300 block">VS Leafcutter Ant</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {currentMatch.antMultiplier}x
                  </p>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Ant lifts 50x its weight!</span>
                </div>

                <div className="p-3 bg-amber-50 dark:bg-slate-700 rounded-2xl border-2 border-slate-900">
                  <span className="text-xs font-black uppercase text-amber-600 dark:text-amber-300 block">VS Gorilla Lift</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {(currentMatch.gorillaMultiplier * 100).toFixed(0)}%
                  </p>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Gorilla lifts 900 kg!</span>
                </div>

                <div className="p-3 bg-sky-50 dark:bg-slate-700 rounded-2xl border-2 border-slate-900">
                  <span className="text-xs font-black uppercase text-sky-600 dark:text-sky-300 block">VS Elephant Trunk</span>
                  <p className="text-xl font-black text-slate-900 dark:text-white">
                    {(currentMatch.elephantMultiplier * 100).toFixed(0)}%
                  </p>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">Elephant trunk: 350 kg!</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
