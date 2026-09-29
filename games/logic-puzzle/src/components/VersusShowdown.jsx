import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ANIMALS } from '../data/animals';
import MascotSvg from './MascotSvg';
import { sounds } from '../utils/audio';
import { Swords, Trophy, Flame } from 'lucide-react';

export default function VersusShowdown() {
  const [selectedAnimalId, setSelectedAnimalId] = useState('gorilla');

  const selectedAnimal = ANIMALS.find(a => a.id === selectedAnimalId) || ANIMALS[0];

  // Human default stats for comparison
  const HUMAN = {
    name: 'Human Hero (You)',
    emoji: '🧔',
    iq: 120,
    weightKg: 75,
    topSpeedKmh: 28,
    deadliftKg: 120,
    jumpCm: 55,
    svgType: 'human'
  };

  // Compare stats
  const iqWinner = HUMAN.iq >= selectedAnimal.iq ? 'Human' : selectedAnimal.name;
  const speedWinner = HUMAN.topSpeedKmh >= selectedAnimal.topSpeedKmh ? 'Human' : selectedAnimal.name;
  const strengthWinner = HUMAN.deadliftKg >= selectedAnimal.deadliftKg ? 'Human' : selectedAnimal.name;
  const jumpWinner = HUMAN.jumpCm >= selectedAnimal.jumpCm ? 'Human' : selectedAnimal.name;

  let humanWins = 0;
  if (iqWinner === 'Human') humanWins++;
  if (speedWinner === 'Human') humanWins++;
  if (strengthWinner === 'Human') humanWins++;
  if (jumpWinner === 'Human') humanWins++;

  const animalWins = 4 - humanWins;

  const handleSelectAnimal = (id) => {
    setSelectedAnimalId(id);
    sounds.playPop(550);
  };

  const triggerBattle = () => {
    sounds.playFanfare();
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
  };

  return (
    <section id="vs" className="py-16 px-4 bg-popPurple-300/10 dark:bg-slate-900 border-b-4 border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-popPurple-300 border-2 border-slate-900 shadow-cartoon text-xs font-black uppercase mb-3">
            <Swords className="w-4 h-4 text-slate-900" />
            HEAD-TO-HEAD VERSUS BATTLE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            1v1 Wild <span className="text-popPurple-500 underline decoration-wavy decoration-sunny-400">Showdown</span>!
          </h2>
          <p className="mt-3 text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300">
            Pick any animal mascot from the wild kingdom and battle head-to-head across 4 physical and mental categories!
          </p>
        </div>

        {/* ANIMAL PICKER RIBBON */}
        <div className="flex flex-wrap justify-center gap-3 mb-10 max-w-5xl mx-auto">
          {ANIMALS.map((animal) => {
            const isSelected = animal.id === selectedAnimalId;
            return (
              <button
                key={animal.id}
                onClick={() => handleSelectAnimal(animal.id)}
                className={`p-3 rounded-2xl border-3 border-slate-900 transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  isSelected
                    ? 'bg-sunny-300 shadow-cartoon scale-110 -translate-y-1'
                    : 'bg-white dark:bg-slate-800 hover:bg-pink-100'
                }`}
              >
                <MascotSvg type={animal.svgType} className="w-10 h-10" />
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase">
                  {animal.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* VERSUS SHOWDOWN BOARD */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 sm:p-8 shadow-cartoon-xl max-w-5xl mx-auto space-y-8">
          
          {/* FIGHTER CORNERS */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center text-center">
            
            {/* HUMAN CORNER (5 Cols) */}
            <div className="sm:col-span-5 p-5 bg-bubblegum-100 dark:bg-slate-700 rounded-3xl border-3 border-slate-900 shadow-cartoon flex flex-col items-center space-y-2">
              <span className="px-3 py-0.5 rounded-full bg-bubblegum-400 text-white text-xs font-black uppercase">
                CORNER 1
              </span>
              <MascotSvg type="human" className="w-24 h-24" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">
                {HUMAN.name} 🧔
              </h3>
              <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Score Wins: <span className="text-bubblegum-600 font-black text-lg">{humanWins}</span> / 4
              </p>
            </div>

            {/* VS BADGE (2 Cols) */}
            <div className="sm:col-span-2 flex flex-col items-center justify-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-sunny-400 border-4 border-slate-900 shadow-cartoon flex items-center justify-center animate-bounce">
                <span className="text-2xl font-black text-slate-900 uppercase">VS</span>
              </div>
              <button
                onClick={triggerBattle}
                className="px-3 py-1 bg-slate-900 text-sunny-400 rounded-xl text-xs font-black uppercase hover:scale-105 transition-transform flex items-center gap-1"
              >
                <Flame className="w-3.5 h-3.5 text-red-500" /> Battle!
              </button>
            </div>

            {/* ANIMAL CORNER (5 Cols) */}
            <div className="sm:col-span-5 p-5 bg-sunny-100 dark:bg-slate-700 rounded-3xl border-3 border-slate-900 shadow-cartoon flex flex-col items-center space-y-2">
              <span className="px-3 py-0.5 rounded-full bg-sunny-400 text-slate-900 text-xs font-black uppercase">
                CORNER 2
              </span>
              <MascotSvg type={selectedAnimal.svgType} className="w-24 h-24" />
              <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase">
                {selectedAnimal.name} {selectedAnimal.emoji}
              </h3>
              <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                Score Wins: <span className="text-sunny-600 font-black text-lg">{animalWins}</span> / 4
              </p>
            </div>

          </div>

          {/* HEAD TO HEAD COMPARISON BARS */}
          <div className="space-y-4">
            
            {/* 1. IQ Battle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border-2 border-slate-900 space-y-1">
              <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white uppercase">
                <span>🧠 Brain IQ</span>
                <span className="text-bubblegum-500">Human: {HUMAN.iq} IQ vs Animal: {selectedAnimal.iq} IQ</span>
                <span>Winner: {iqWinner}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full border border-slate-900 overflow-hidden flex">
                <div className="bg-bubblegum-400 h-full" style={{ width: `${(HUMAN.iq / (HUMAN.iq + selectedAnimal.iq)) * 100}%` }} />
                <div className="bg-sunny-400 h-full" style={{ width: `${(selectedAnimal.iq / (HUMAN.iq + selectedAnimal.iq)) * 100}%` }} />
              </div>
            </div>

            {/* 2. Speed Battle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border-2 border-slate-900 space-y-1">
              <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white uppercase">
                <span>⚡ Top Speed</span>
                <span className="text-amber-500">Human: {HUMAN.topSpeedKmh} km/h vs Animal: {selectedAnimal.topSpeedKmh} km/h</span>
                <span>Winner: {speedWinner}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full border border-slate-900 overflow-hidden flex">
                <div className="bg-bubblegum-400 h-full" style={{ width: `${(HUMAN.topSpeedKmh / (HUMAN.topSpeedKmh + selectedAnimal.topSpeedKmh)) * 100}%` }} />
                <div className="bg-sunny-400 h-full" style={{ width: `${(selectedAnimal.topSpeedKmh / (HUMAN.topSpeedKmh + selectedAnimal.topSpeedKmh)) * 100}%` }} />
              </div>
            </div>

            {/* 3. Deadlift Strength Battle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border-2 border-slate-900 space-y-1">
              <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white uppercase">
                <span>🏋️ Deadlift Capacity</span>
                <span className="text-red-500">Human: {HUMAN.deadliftKg} kg vs Animal: {selectedAnimal.deadliftKg} kg</span>
                <span>Winner: {strengthWinner}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full border border-slate-900 overflow-hidden flex">
                <div className="bg-bubblegum-400 h-full" style={{ width: `${(HUMAN.deadliftKg / (HUMAN.deadliftKg + selectedAnimal.deadliftKg)) * 100}%` }} />
                <div className="bg-sunny-400 h-full" style={{ width: `${(selectedAnimal.deadliftKg / (HUMAN.deadliftKg + selectedAnimal.deadliftKg)) * 100}%` }} />
              </div>
            </div>

            {/* 4. Vertical Jump Battle */}
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border-2 border-slate-900 space-y-1">
              <div className="flex justify-between items-center text-xs font-black text-slate-900 dark:text-white uppercase">
                <span>🚀 Vertical Jump</span>
                <span className="text-mint-500">Human: {HUMAN.jumpCm} cm vs Animal: {selectedAnimal.jumpCm} cm</span>
                <span>Winner: {jumpWinner}</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-4 rounded-full border border-slate-900 overflow-hidden flex">
                <div className="bg-bubblegum-400 h-full" style={{ width: `${(HUMAN.jumpCm / (HUMAN.jumpCm + (selectedAnimal.jumpCm || 1))) * 100}%` }} />
                <div className="bg-sunny-400 h-full" style={{ width: `${((selectedAnimal.jumpCm || 1) / (HUMAN.jumpCm + (selectedAnimal.jumpCm || 1))) * 100}%` }} />
              </div>
            </div>

          </div>

          {/* OVERALL TROPHY WINNER STATEMENT */}
          <div className="p-5 bg-gradient-to-r from-sunny-300 via-mint-300 to-sky-300 rounded-3xl border-3 border-slate-900 text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-slate-900">
              <Trophy className="w-6 h-6 text-slate-900 animate-bounce" />
              <span className="text-xs font-black uppercase tracking-wider">SHOWDOWN RESULT</span>
            </div>
            <p className="text-2xl font-black text-slate-900 uppercase">
              {humanWins >= 3
                ? '🏆 HUMAN HERO WINS THE SHOWDOWN!'
                : humanWins === 2
                ? '🤝 IT IS A TIED SHOWDOWN!'
                : `🏆 ${selectedAnimal.name.toUpperCase()} TAKES THE TROPHY!`}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
}
