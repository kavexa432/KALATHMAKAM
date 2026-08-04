import React, { useState } from 'react';
import { Trophy, ChevronRight, BarChart3 } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId, LeaderboardDay } from '../../../shared/types/festivalTypes';
import { HouseDetailModal } from './HouseDetailModal';

export const LeaderboardSection: React.FC = () => {
  const { houses, getHousePoints, getHouseMedals } = useFestival();
  const [activeTab, setActiveTab] = useState<LeaderboardDay>('Live');
  const [selectedHouse, setSelectedHouse] = useState<HouseId | null>(null);

  // Computed House Standings
  const standings = houses
    .map((h) => ({
      ...h,
      points: getHousePoints(h.id, activeTab),
      medals: getHouseMedals(h.id),
    }))
    .sort((a, b) => b.points - a.points);

  const maxPoints = Math.max(...standings.map((s) => s.points), 1);

  const dayTabs: { id: LeaderboardDay; label: string }[] = [
    { id: 'Live', label: '● Live Overall' },
    { id: 'Day 1', label: 'Day 1' },
    { id: 'Day 2', label: 'Day 2' },
    { id: 'Day 3', label: 'Day 3' },
    { id: 'Final', label: 'Final Standings' },
  ];

  return (
    <section id="leaderboard" className="relative py-12 sm:py-14 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-sans-manrope font-extrabold tracking-[0.2em] text-[#FF5E84] uppercase bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/8 shadow-2xs">
            <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>FESTIVAL HOUSE CHAMPIONSHIP</span>
          </div>

          <h2 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight">
            Live House Standings & Leaderboard
          </h2>

          <p className="font-sans-manrope text-sm sm:text-base text-[#5F5F5F] max-w-xl leading-relaxed font-medium">
            Real-time points updated automatically as verified competition results are published by the judges.
          </p>

          {/* Versioned Leaderboard Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {dayTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-2 rounded-full font-sans-manrope font-bold text-xs transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#111111] text-white shadow-md'
                    : 'bg-white text-[#5F5F5F] hover:text-[#111111] border border-black/8'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 4 House Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {standings.map((h, index) => {
            const colorInfo = houseColors[h.id as HouseId];
            const rankLabel = index === 0 ? '🥇 1st Place' : index === 1 ? '🥈 2nd Place' : index === 2 ? '🥉 3rd Place' : '⭐ 4th Place';

            return (
              <div
                key={h.id}
                onClick={() => setSelectedHouse(h.id as HouseId)}
                className="glass-card bg-white/90 backdrop-blur-xl rounded-[28px] p-6 border border-white/95 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden group cursor-pointer hover:border-black/15 transition-all"
              >
                {/* House Accent Color Bar */}
                <div
                  className="absolute top-0 inset-x-0 h-2 transition-all group-hover:h-3"
                  style={{ backgroundColor: colorInfo.primary }}
                />

                {/* Top Badge & Flag */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-2xl">{h.flagSymbol}</span>
                  <span
                    className="text-[11px] font-sans-manrope font-extrabold px-3 py-1 rounded-full uppercase tracking-wider"
                    style={{
                      backgroundColor: colorInfo.lightBg,
                      color: colorInfo.text,
                    }}
                  >
                    {rankLabel}
                  </span>
                </div>

                {/* House Title & Motto */}
                <div className="space-y-1 text-left">
                  <h3
                    className="font-serif-cormorant font-bold text-3xl"
                    style={{ color: colorInfo.primary }}
                  >
                    {h.name}
                  </h3>
                  <p className="font-sans-manrope text-xs text-[#5F5F5F] line-clamp-1 italic font-medium">
                    "{h.motto}"
                  </p>
                </div>

                {/* Points Counter Big Display */}
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-black/5 text-center">
                  <span className="text-[10px] font-sans-manrope font-extrabold tracking-widest text-[#5F5F5F] uppercase block">
                    TOTAL SCORE
                  </span>
                  <span className="font-serif-cormorant font-bold text-4xl sm:text-5xl text-[#111111] leading-tight">
                    {h.points}
                  </span>
                  <span className="text-xs font-bold text-[#5F5F5F] ml-1">PTS</span>
                </div>

                {/* Medal Breakdown Pill */}
                <div className="flex items-center justify-between text-xs font-sans-manrope text-[#5F5F5F] pt-1">
                  <span>🥇 {h.medals.gold}</span>
                  <span>🥈 {h.medals.silver}</span>
                  <span>🥉 {h.medals.bronze}</span>
                  <div className="flex items-center text-[#FF5E84] font-bold group-hover:translate-x-1 transition-transform">
                    <span>View</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Live Score Bar Graph Component */}
        <div className="glass-card bg-white/90 backdrop-blur-2xl rounded-[32px] p-6 sm:p-8 border border-white/95 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#3B82F6]/12 text-[#3B82F6] flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <div className="text-left">
                <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                  Live Score Graph
                </h3>
                <p className="font-sans-manrope text-xs text-[#5F5F5F]">
                  Relative point comparison among competing houses
                </p>
              </div>
            </div>

            <span className="text-xs font-bold text-[#5F5F5F] bg-[#FAF8F5] px-3 py-1.5 rounded-full border border-black/5">
              Target: 500+ PTS
            </span>
          </div>

          <div className="space-y-4">
            {standings.map((h) => {
              const colorInfo = houseColors[h.id as HouseId];
              const pct = Math.round((h.points / maxPoints) * 100);

              return (
                <div key={h.id} className="space-y-1.5 text-left">
                  <div className="flex items-center justify-between text-xs font-sans-manrope font-bold">
                    <span className="flex items-center gap-2" style={{ color: colorInfo.primary }}>
                      <span>{h.flagSymbol}</span>
                      <span>{h.name} HOUSE</span>
                    </span>
                    <span className="text-[#111111]">{h.points} PTS ({pct}%)</span>
                  </div>

                  <div className="w-full h-4 bg-[#FAF8F5] rounded-full overflow-hidden border border-black/5 p-0.5 relative">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colorInfo.primary,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* House Detail Profile Modal */}
      <HouseDetailModal
        houseId={selectedHouse}
        onClose={() => setSelectedHouse(null)}
      />
    </section>
  );
};
