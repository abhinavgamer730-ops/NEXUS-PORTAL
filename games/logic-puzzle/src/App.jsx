import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FloatingHero from './components/FloatingHero';
import StatChallenge from './components/StatChallenge';
import SpeedChallenge from './components/SpeedChallenge';
import JumpingChallenge from './components/JumpingChallenge';
import DietaryChallenge from './components/DietaryChallenge';
import VersusShowdown from './components/VersusShowdown';
import Footer from './components/Footer';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 dark:bg-slate-900 transition-colors duration-300">
      <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
      
      <main className="flex-grow">
        <FloatingHero />
        <StatChallenge />
        <SpeedChallenge />
        <JumpingChallenge />
        <DietaryChallenge />
        <VersusShowdown />
      </main>

      <Footer />
    </div>
  );
}
