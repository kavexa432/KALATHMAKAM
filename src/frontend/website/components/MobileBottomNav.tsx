import React, { useState } from 'react';
import { Home, Calendar, MapPin, Trophy, Grid } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenMenu: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenMenu }) => {
  const [activeTab, setActiveTab] = useState<string>('home');

  const scrollToSection = (id: string, tabName: string) => {
    setActiveTab(tabName);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-black/8 px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-around max-w-md mx-auto">
        
        {/* Home Tab */}
        <button
          onClick={() => scrollToSection('home', 'home')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all cursor-pointer ${
            activeTab === 'home'
              ? 'bg-rose-50 text-[#FF5E84] font-extrabold'
              : 'text-[#5F5F5F] hover:text-[#111111]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-sans-manrope mt-0.5 font-bold">Home</span>
        </button>

        {/* Schedule Tab */}
        <button
          onClick={() => scrollToSection('schedule', 'schedule')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all cursor-pointer ${
            activeTab === 'schedule'
              ? 'bg-rose-50 text-[#FF5E84] font-extrabold'
              : 'text-[#5F5F5F] hover:text-[#111111]'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-sans-manrope mt-0.5 font-bold">Schedule</span>
        </button>

        {/* Stages Tab */}
        <button
          onClick={() => scrollToSection('events', 'stages')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all cursor-pointer ${
            activeTab === 'stages'
              ? 'bg-rose-50 text-[#FF5E84] font-extrabold'
              : 'text-[#5F5F5F] hover:text-[#111111]'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span className="text-[10px] font-sans-manrope mt-0.5 font-bold">Stages</span>
        </button>

        {/* Results Tab */}
        <button
          onClick={() => scrollToSection('results', 'results')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-full transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-rose-50 text-[#FF5E84] font-extrabold'
              : 'text-[#5F5F5F] hover:text-[#111111]'
          }`}
        >
          <Trophy className="w-5 h-5" />
          <span className="text-[10px] font-sans-manrope mt-0.5 font-bold">Results</span>
        </button>

        {/* More Menu Tab */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-full text-[#5F5F5F] hover:text-[#111111] transition-all cursor-pointer"
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px] font-sans-manrope mt-0.5 font-bold">More</span>
        </button>

      </div>
    </div>
  );
};
