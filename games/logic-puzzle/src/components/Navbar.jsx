import React, { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, Sparkles, Trophy, Zap, Activity, Utensils, Swords } from 'lucide-react';
import { sounds } from '../utils/audio';

export default function Navbar({ darkMode, setDarkMode }) {
  const [isMuted, setIsMuted] = useState(false);

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playPop(520);
  };

  const handleToggleTheme = () => {
    setDarkMode(!darkMode);
    sounds.playPop(600);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b-4 border-slate-900 px-4 py-3 shadow-cartoon">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo */}
        <a 
          href="#" 
          onClick={() => sounds.playPop(480)}
          className="flex items-center gap-3 group"
        >
          <div className="w-11 h-11 bg-bubblegum-400 dark:bg-bubblegum-500 rounded-2xl border-3 border-slate-900 flex items-center justify-center shadow-cartoon group-hover:rotate-12 transition-transform">
            <span className="text-2xl animate-bounce">🐾</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black tracking-wider text-slate-900 dark:text-white uppercase drop-shadow">
                YOU <span className="text-bubblegum-500 underline decoration-wavy decoration-sunny-400">vs</span> ANIMAL
              </span>
              <Sparkles className="w-5 h-5 text-sunny-400 animate-spin" />
            </div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
              Ultimate Wild Stat Showdown!
            </p>
          </div>
        </a>

        {/* Quick Challenge Nav Links */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="#stats"
            onClick={() => sounds.playPop(400)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-bubblegum-100 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-900 transition-all"
          >
            <Activity className="w-4 h-4 text-bubblegum-500" />
            Stat Matcher
          </a>
          <a
            href="#speed"
            onClick={() => sounds.playPop(440)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-sunny-100 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-900 transition-all"
          >
            <Zap className="w-4 h-4 text-sunny-500" />
            Speed Sprint
          </a>
          <a
            href="#jump"
            onClick={() => sounds.playPop(480)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-mint-100 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-900 transition-all"
          >
            <Trophy className="w-4 h-4 text-mint-500" />
            Jump Arena
          </a>
          <a
            href="#diet"
            onClick={() => sounds.playPop(520)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-sky-100 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-900 transition-all"
          >
            <Utensils className="w-4 h-4 text-sky-500" />
            Dietary Facts
          </a>
          <a
            href="#vs"
            onClick={() => sounds.playPop(560)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-popPurple-300/30 dark:hover:bg-slate-800 border-2 border-transparent hover:border-slate-900 transition-all"
          >
            <Swords className="w-4 h-4 text-popPurple-500" />
            1v1 VS Mode
          </a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Audio Toggle */}
          <button
            onClick={handleToggleSound}
            title={isMuted ? 'Unmute Sound Effects' : 'Mute Sound Effects'}
            className="p-2.5 rounded-xl bg-amber-100 dark:bg-slate-800 border-3 border-slate-900 shadow-cartoon hover:scale-105 active:scale-95 transition-all text-slate-800 dark:text-amber-300"
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-500" /> : <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={handleToggleTheme}
            title="Toggle Theme"
            className="p-2.5 rounded-xl bg-sky-100 dark:bg-slate-800 border-3 border-slate-900 shadow-cartoon hover:scale-105 active:scale-95 transition-all text-slate-800 dark:text-sky-300"
          >
            {darkMode ? <Sun className="w-5 h-5 text-sunny-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>
        </div>

      </div>
    </nav>
  );
}
