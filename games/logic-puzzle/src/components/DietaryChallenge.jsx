import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { ANIMALS } from '../data/animals';
import MascotSvg from './MascotSvg';
import { sounds } from '../utils/audio';
import { Utensils, Coffee, Sparkles, Heart } from 'lucide-react';

export default function DietaryChallenge() {
  const [calories, setCalories] = useState(2200);
  const [water, setWater] = useState(2.5); // Liters
  const [sleep, setSleep] = useState(7.5); // Hours
  const [fedAnimal, setFedAnimal] = useState('panda');

  const handleFeed = (animalId) => {
    setFedAnimal(animalId);
    sounds.playNom();
    confetti({ particleCount: 40, spread: 40, origin: { y: 0.7 } });
  };

  const selectedAnimal = ANIMALS.find(a => a.id === fedAnimal) || ANIMALS.find(a => a.id === 'panda');

  // Multiplier comparisons
  const pandaBambooWeight = (calories / 200).toFixed(1); // relative
  const whaleCalorieRatio = (1500000 / (calories || 1)).toFixed(0);
  const elephantWaterRatio = (200 / (water || 1)).toFixed(0);

  return (
    <section id="diet" className="py-16 px-4 bg-sky-100/40 dark:bg-slate-950 border-b-4 border-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-sky-300 border-2 border-slate-900 shadow-cartoon text-xs font-black uppercase mb-3">
            <Utensils className="w-4 h-4 text-slate-900" />
            WHATCHA EATIN'? DIETARY FUN FACTS
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            Compare Your <span className="text-sky-500 underline decoration-wavy decoration-bubblegum-400">Dietary Habits</span>!
          </h2>
          <p className="mt-3 text-base sm:text-lg font-bold text-slate-700 dark:text-slate-300">
            Compare your daily food calories, water drinking, and sleep hours against pandas, blue whales, sloths, and hummingbirds!
          </p>
        </div>

        {/* MAIN DIETARY GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          
          {/* USER HABITS INPUTS (5 Cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg space-y-6">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
              <Coffee className="w-6 h-6 text-sky-500" /> Enter Daily Habits
            </h3>

            {/* Calories Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  🍕 Daily Calories
                </label>
                <span className="px-3 py-1 bg-amber-100 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold">
                  {calories} kcal
                </span>
              </div>
              <input
                type="range"
                min="1200"
                max="5000"
                step="50"
                value={calories}
                onChange={(e) => {
                  setCalories(Number(e.target.value));
                  sounds.playPop(350);
                }}
                className="w-full accent-amber-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Water Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  💧 Daily Water (Liters)
                </label>
                <span className="px-3 py-1 bg-sky-100 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold">
                  {water} Liters
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="6.0"
                step="0.1"
                value={water}
                onChange={(e) => {
                  setWater(Number(e.target.value));
                  sounds.playPop(420);
                }}
                className="w-full accent-sky-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
            </div>

            {/* Sleep Hours Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm font-black text-slate-800 dark:text-slate-200">
                <label className="flex items-center gap-1.5">
                  😴 Sleep Hours / Day
                </label>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-slate-700 rounded-xl border-2 border-slate-900 text-slate-900 dark:text-white font-extrabold">
                  {sleep} Hours
                </span>
              </div>
              <input
                type="range"
                min="2"
                max="16"
                step="0.5"
                value={sleep}
                onChange={(e) => {
                  setSleep(Number(e.target.value));
                  sounds.playPop(490);
                }}
                className="w-full accent-indigo-500 cursor-pointer h-3 bg-slate-200 rounded-lg"
              />
            </div>

            {/* COMPARISON CARDS INSIDE INPUTS */}
            <div className="p-4 bg-amber-50 dark:bg-slate-700 rounded-2xl border-3 border-slate-900 space-y-2 text-xs font-bold text-slate-800 dark:text-slate-200">
              <p>
                🐋 <span className="font-extrabold">Blue Whale Feast:</span> A Blue Whale eats <span className="text-bubblegum-600 dark:text-bubblegum-400 font-black">{whaleCalorieRatio}x</span> your daily calories in ONE SINGLE MOUTHFUL!
              </p>
              <p>
                🐘 <span className="font-extrabold">Elephant Thirst:</span> An Elephant drinks <span className="text-sky-600 dark:text-sky-400 font-black">{elephantWaterRatio}x</span> your daily water every day (200 Liters)!
              </p>
            </div>

          </div>

          {/* INTERACTIVE "FEED THE MASCOT" CAROUSEL (7 Cols) */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-800 rounded-3xl border-4 border-slate-900 p-6 shadow-cartoon-lg space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-500" /> Interactive Animal Feast Cards
              </h3>
              <span className="text-xs font-extrabold text-slate-500 dark:text-slate-400">
                Click to feed & reveal facts!
              </span>
            </div>

            {/* Animal Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {['panda', 'sloth', 'hummingbird', 'bluewhale', 'elephant', 'tortoise'].map((id) => {
                const animal = ANIMALS.find(a => a.id === id);
                const isSelected = fedAnimal === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleFeed(id)}
                    className={`px-3.5 py-1.5 rounded-xl border-2 border-slate-900 text-xs font-black uppercase transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-bubblegum-400 text-white shadow-cartoon scale-105'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-sunny-100'
                    }`}
                  >
                    <span>{animal?.emoji}</span>
                    <span>{animal?.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* MASCOT DIET FEATURE DISPLAY CARD */}
            <div className="bg-gradient-to-br from-amber-50 via-sky-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 p-6 rounded-3xl border-3 border-slate-900 shadow-cartoon space-y-4 animate-pop-in">
              
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 bg-white rounded-2xl border-3 border-slate-900 p-2 shadow-cartoon flex items-center justify-center shrink-0">
                  <MascotSvg type={selectedAnimal.svgType} className="w-18 h-18" />
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-sunny-400 text-[10px] font-black uppercase tracking-wider">
                    {selectedAnimal.dietType}
                  </span>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase mt-1">
                    {selectedAnimal.name} {selectedAnimal.emoji}
                  </h4>
                  <p className="text-xs font-extrabold text-slate-600 dark:text-slate-300">
                    Daily Sleep: {selectedAnimal.sleepHours} Hours | Calories: {selectedAnimal.dailyCalories} kcal
                  </p>
                </div>
              </div>

              {/* Mindblowing Fact Box */}
              <div className="p-4 bg-white dark:bg-slate-700 rounded-2xl border-2 border-slate-900 space-y-1">
                <span className="text-xs font-black uppercase text-bubblegum-600 dark:text-bubblegum-400 flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> MIND-BLOWING DIET FACT
                </span>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                  "{selectedAnimal.dietFact}"
                </p>
              </div>

              {/* Feed Treat Action Button */}
              <button
                onClick={() => handleFeed(fedAnimal)}
                className="w-full py-3 rounded-xl bg-sunny-400 hover:bg-sunny-300 text-slate-900 border-2 border-slate-900 shadow-cartoon font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>🍕 FEED A SNACK TO {selectedAnimal.name.toUpperCase()}! 🌿</span>
              </button>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
