import React, { useState } from 'react';
import MascotSvg from './MascotSvg';
import { ANIMALS } from '../data/animals';
import { sounds } from '../utils/audio';
import { Sparkles, Heart, RefreshCw } from 'lucide-react';

export default function Footer() {
  const [factIndex, setFactIndex] = useState(0);

  const nextFact = () => {
    sounds.playPop(420);
    setFactIndex((prev) => (prev + 1) % ANIMALS.length);
  };

  const currentAnimal = ANIMALS[factIndex];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t-4 border-slate-900 py-12 px-4 shadow-cartoon">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* RANDOM WILD FACT TICKER BOX */}
        <div className="bg-gradient-to-r from-bubblegum-100 via-sunny-100 to-mint-100 dark:from-slate-800 dark:to-slate-800 p-6 rounded-3xl border-4 border-slate-900 shadow-cartoon flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 bg-white rounded-2xl border-2 border-slate-900 p-1 flex items-center justify-center shrink-0">
              <MascotSvg type={currentAnimal.svgType} className="w-12 h-12" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-bubblegum-600 dark:text-bubblegum-400 tracking-wider">
                💡 RANDOM WILD FACT TICKER
              </span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                "{currentAnimal.funFact}"
              </p>
            </div>
          </div>
          <button
            onClick={nextFact}
            className="px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl border-2 border-slate-900 text-xs font-black uppercase hover:bg-sunny-200 transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" /> Next Fact
          </button>
        </div>

        {/* CUTE MASCOT GALLERY RIBBON */}
        <div className="flex justify-center items-center gap-4 flex-wrap opacity-80 hover:opacity-100 transition-opacity">
          {['ant', 'cheetah', 'gorilla', 'panda', 'dolphin', 'sloth', 'hummingbird'].map((type) => (
            <div key={type} className="w-12 h-12 p-1 bg-amber-50 dark:bg-slate-800 rounded-xl border-2 border-slate-900">
              <MascotSvg type={type} className="w-full h-full" />
            </div>
          ))}
        </div>

        {/* COPYRIGHT & CREDITS */}
        <div className="text-center space-y-2 border-t-2 border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-center gap-1.5 text-base font-black text-slate-900 dark:text-white uppercase">
            <span>YOU VERSUS ANIMAL</span>
            <Sparkles className="w-4 h-4 text-sunny-500" />
          </div>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" /> for animal lovers and stat enthusiasts everywhere!
          </p>
        </div>

      </div>
    </footer>
  );
}
