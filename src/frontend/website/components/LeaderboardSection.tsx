import React, { useState } from 'react';
import { Trophy, TrendingUp, Info, ArrowRight, RotateCw, Clock, Flame, Music, BookOpen, Users, Palette, HelpCircle } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';
import { HouseDetailModal } from './HouseDetailModal';

export const LeaderboardSection: React.FC = () => {
  const { houses, getHousePoints, getHouseMedals, results } = useFestival();
  const [selectedHouse, setSelectedHouse] = useState<HouseId | null>(null);
  const [showPointSystemModal, setShowPointSystemModal] = useState(false);

  // Compute House Standings sorted by Points
  const standings = houses
    .map((h) => {
      const pts = getHousePoints(h.id);
      return {
        ...h,
        points: pts,
        medals: getHouseMedals(h.id),
      };
    })
    .sort((a, b) => b.points - a.points);

  const maxPoints = Math.max(...standings.map((s) => s.points), 1);

  // Recent Wins sample data fallback if results not populated
  const recentWinsData = results.length > 0
    ? results.slice(0, 5).map((r, i) => ({
        id: r.id,
        time: `${11 - i}:${45 - i * 5} AM`,
        date: '05 Aug, 2026',
        competition: r.eventTitle,
        categoryType: r.category.includes('Solo') ? 'Solo' : r.category.includes('Group') ? 'Group' : 'Team',
        event: `${r.eventTitle} (${r.category})`,
        winnerHouse: r.houseId as HouseId,
        points: `+${r.points}`,
        icon: <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />,
        iconBg: 'bg-[#F59E0B]/12',
      }))
    : [
        {
          id: 'w-1',
          time: '11:45 AM',
          date: '05 Aug, 2026',
          competition: 'Classical Vocal',
          categoryType: 'Solo',
          event: 'Classical Vocal (Senior Category)',
          winnerHouse: 'NOVA' as HouseId,
          points: '+25',
          icon: <Music className="w-3.5 h-3.5 text-[#FF5E84]" />,
          iconBg: 'bg-[#FF5E84]/12',
        },
        {
          id: 'w-2',
          time: '11:10 AM',
          date: '05 Aug, 2026',
          competition: 'Debate',
          categoryType: 'Team',
          event: 'Debate Competition (Senior Category)',
          winnerHouse: 'VEGA' as HouseId,
          points: '+20',
          icon: <BookOpen className="w-3.5 h-3.5 text-[#3B82F6]" />,
          iconBg: 'bg-[#3B82F6]/12',
        },
        {
          id: 'w-3',
          time: '10:20 AM',
          date: '05 Aug, 2026',
          competition: 'Group Dance',
          categoryType: 'Group',
          event: 'Folk Dance (Junior Category)',
          winnerHouse: 'ORION' as HouseId,
          points: '+20',
          icon: <Users className="w-3.5 h-3.5 text-[#F59E0B]" />,
          iconBg: 'bg-[#F59E0B]/12',
        },
        {
          id: 'w-4',
          time: '09:40 AM',
          date: '05 Aug, 2026',
          competition: 'Art & Craft',
          categoryType: 'Individual',
          event: 'Poster Making (Junior Category)',
          winnerHouse: 'ASTRA' as HouseId,
          points: '+15',
          icon: <Palette className="w-3.5 h-3.5 text-[#10B981]" />,
          iconBg: 'bg-[#10B981]/12',
        },
        {
          id: 'w-5',
          time: '09:05 AM',
          date: '05 Aug, 2026',
          competition: 'Quiz',
          categoryType: 'Team',
          event: 'General Quiz (Senior Category)',
          winnerHouse: 'VEGA' as HouseId,
          points: '+15',
          icon: <HelpCircle className="w-3.5 h-3.5 text-[#8B5CF6]" />,
          iconBg: 'bg-[#8B5CF6]/12',
        },
      ];

  // Map House Flame / Emblem Color Styles
  const houseFlameStyles: Record<string, { bg: string; iconColor: string }> = {
    VEGA: { bg: 'bg-[#F59E0B]/15', iconColor: 'text-[#F59E0B]' },
    NOVA: { bg: 'bg-[#EF4444]/15', iconColor: 'text-[#EF4444]' },
    ORION: { bg: 'bg-[#3B82F6]/15', iconColor: 'text-[#3B82F6]' },
    ASTRA: { bg: 'bg-[#10B981]/15', iconColor: 'text-[#10B981]' },
  };

  const trendingDeltas: Record<string, number> = {
    VEGA: 24,
    NOVA: 18,
    ORION: 12,
    ASTRA: 6,
  };

  return (
    <section id="leaderboard" className="relative py-14 sm:py-16 bg-[#FAF8F5]">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Top Right Trophy */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
          <div className="text-left space-y-2">
            <h2 className="font-serif-cormorant text-4xl sm:text-5xl lg:text-6xl font-bold text-[#111111] leading-tight flex items-center gap-2">
              <span>House Leaderboard</span>
              <span className="text-[#F59E0B] text-3xl font-normal">✦</span>
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <p className="font-sans-manrope text-xs sm:text-sm text-[#5F5F5F] font-medium">
                Live points update from all events and competitions
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold font-sans-manrope">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Auto-updated</span>
              </span>
            </div>
          </div>

          {/* Golden Trophy Art Decorative Emblem (Right) */}
          <div className="hidden md:flex items-center justify-center shrink-0">
            <div className="relative w-28 h-28 flex items-center justify-center bg-gradient-to-tr from-[#F59E0B]/10 to-[#FF5E84]/10 rounded-full p-2 border border-black/5">
              <span className="text-6xl filter drop-shadow-md">🏆</span>
            </div>
          </div>
        </div>

        {/* Top 4 House Standings Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {standings.map((h, index) => {
            const houseId = h.id as HouseId;
            const colorInfo = houseColors[houseId];
            const isFirstRank = index === 0;
            const delta = trendingDeltas[houseId] || 10;
            const flameStyle = houseFlameStyles[houseId] || { bg: 'bg-slate-100', iconColor: 'text-slate-600' };

            return (
              <div
                key={h.id}
                onClick={() => setSelectedHouse(houseId)}
                className={`relative rounded-[28px] p-6 bg-white transition-all duration-300 cursor-pointer text-center flex flex-col justify-between space-y-5 border ${
                  isFirstRank
                    ? 'border-[#F59E0B] shadow-xl ring-2 ring-[#F59E0B]/30'
                    : 'border-black/8 hover:border-black/15 shadow-sm hover:shadow-md'
                }`}
              >
                {/* Crown Icon for Rank 1 */}
                {isFirstRank && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-lg filter drop-shadow-sm">
                    👑
                  </div>
                )}

                {/* Rank Ribbon Badge Top Left */}
                <div className="absolute top-4 left-4">
                  <div
                    className={`w-7 h-8 flex items-center justify-center font-sans-manrope font-extrabold text-xs text-white rounded-b-md shadow-xs ${
                      index === 0
                        ? 'bg-[#F59E0B]'
                        : index === 1
                        ? 'bg-[#64748B]'
                        : index === 2
                        ? 'bg-[#B45309]'
                        : 'bg-[#94A3B8]'
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>

                {/* Circular Flame / House Emblem Center */}
                <div className="pt-2 flex justify-center">
                  <div
                    className={`w-16 h-16 rounded-full ${flameStyle.bg} flex items-center justify-center border border-black/5 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <Flame className={`w-8 h-8 ${flameStyle.iconColor} fill-current`} />
                  </div>
                </div>

                {/* House Name & Points */}
                <div className="space-y-1">
                  <h3
                    className="font-sans-manrope font-black text-xl tracking-wider uppercase"
                    style={{ color: colorInfo.primary }}
                  >
                    {h.name}
                  </h3>

                  <div className="flex items-baseline justify-center gap-1.5 pt-1">
                    <span className="font-serif-cormorant font-bold text-4xl sm:text-5xl text-[#111111] leading-none">
                      {h.points}
                    </span>
                    <span className="font-sans-manrope font-extrabold text-xs text-[#5F5F5F] tracking-wider uppercase">
                      PTS
                    </span>
                  </div>
                </div>

                {/* Trending Sub-Pill */}
                <div className="pt-1 flex justify-center">
                  <div className="inline-flex items-center gap-1.5 text-[11px] font-sans-manrope font-bold text-emerald-600 bg-emerald-50/80 px-3 py-1 rounded-full border border-emerald-200/60">
                    <TrendingUp className="w-3 h-3" />
                    <span>↑ {delta} from last update</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Two Columns Grid: Recent Wins (Left 2/3) + Points Overview & Info (Right 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (8 cols): Recent Wins Table */}
          <div className="lg:col-span-8 bg-white rounded-[28px] p-6 sm:p-7 border border-black/8 shadow-sm flex flex-col justify-between space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="font-sans-manrope font-extrabold text-base sm:text-lg text-[#111111] flex items-center gap-2.5">
                <Trophy className="w-5 h-5 text-[#F59E0B]" />
                <span>Recent Wins</span>
              </h3>
            </div>

            {/* Wins Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/8 text-[11px] font-sans-manrope font-extrabold text-[#5F5F5F] uppercase tracking-wider">
                    <th className="py-3 px-3">Time</th>
                    <th className="py-3 px-3">Competition</th>
                    <th className="py-3 px-3">Event</th>
                    <th className="py-3 px-3">Winner</th>
                    <th className="py-3 px-3 text-right">Points Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-sans-manrope text-xs">
                  {recentWinsData.map((row) => {
                    const houseColor = houseColors[row.winnerHouse as HouseId] || houseColors.VEGA;
                    const flameStyle = houseFlameStyles[row.winnerHouse] || { bg: 'bg-slate-100', iconColor: 'text-slate-600' };

                    return (
                      <tr key={row.id} className="hover:bg-[#FAF8F5] transition-colors">
                        {/* Time */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <strong className="block text-[#111111] font-bold text-xs">{row.time}</strong>
                          <span className="text-[10px] text-[#5F5F5F]">{row.date}</span>
                        </td>

                        {/* Competition */}
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-xl ${row.iconBg || 'bg-pink-50'} flex items-center justify-center shrink-0`}>
                              {row.icon || <Music className="w-3.5 h-3.5 text-[#FF5E84]" />}
                            </div>
                            <div>
                              <strong className="block text-[#111111] font-bold text-xs">{row.competition}</strong>
                              <span className="text-[10px] text-[#5F5F5F]">{row.categoryType}</span>
                            </div>
                          </div>
                        </td>

                        {/* Event */}
                        <td className="py-3.5 px-3 text-[#111111] font-medium max-w-[200px] truncate">
                          {row.event}
                        </td>

                        {/* Winner */}
                        <td className="py-3.5 px-3 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 font-bold text-xs">
                            <span className={`w-5 h-5 rounded-full ${flameStyle.bg} flex items-center justify-center`}>
                              <Flame className={`w-3 h-3 ${flameStyle.iconColor} fill-current`} />
                            </span>
                            <span style={{ color: houseColor.primary }}>{row.winnerHouse}</span>
                          </span>
                        </td>

                        {/* Points Earned */}
                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                          <span className="font-extrabold text-emerald-600 text-sm">{row.points}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Button */}
            <div className="pt-2 flex justify-center">
              <a
                href="#results"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FAF8F5] hover:bg-black/5 text-[#111111] font-sans-manrope font-bold text-xs border border-black/10 transition-colors"
              >
                <span>View All Results</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

          {/* Right Column (4 cols): Points Overview + How Points Work */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Card 1: Points Overview Bars */}
            <div className="bg-white rounded-[28px] p-6 border border-black/8 shadow-sm space-y-5 text-left">
              <div className="flex items-center justify-between">
                <h3 className="font-sans-manrope font-extrabold text-base text-[#111111] flex items-center gap-2">
                  <TrendingUp className="w-4.5 h-4.5 text-[#3B82F6]" />
                  <span>Points Overview</span>
                </h3>
              </div>

              <div className="space-y-4">
                {standings.map((h) => {
                  const houseId = h.id as HouseId;
                  const colorInfo = houseColors[houseId];
                  const pct = Math.round((h.points / maxPoints) * 100);

                  return (
                    <div key={h.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-sans-manrope font-bold">
                        <span style={{ color: colorInfo.primary }}>{h.name}</span>
                        <span className="text-[#111111] font-extrabold">{h.points}</span>
                      </div>

                      <div className="w-full h-2.5 bg-[#FAF8F5] rounded-full overflow-hidden border border-black/5">
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

            {/* Card 2: How Points Work? */}
            <div className="bg-white rounded-[28px] p-6 border border-black/8 shadow-sm space-y-4 text-left">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Info className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="font-sans-manrope font-extrabold text-sm text-[#111111]">
                    How Points Work?
                  </h4>
                  <p className="font-sans-manrope text-xs text-[#5F5F5F] leading-relaxed mt-1">
                    Points are awarded based on event type and position. Higher events earn more points.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowPointSystemModal(true)}
                className="w-full py-2.5 px-4 rounded-full bg-[#FAF8F5] hover:bg-black/5 border border-black/10 text-[#111111] font-sans-manrope font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <span>View Point System</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Footer Status Bar */}
        <div className="mt-8 pt-4 border-t border-black/8 flex flex-wrap items-center justify-between gap-4 text-xs font-sans-manrope text-[#5F5F5F]">
          <div className="flex items-center gap-2">
            <RotateCw className="w-3.5 h-3.5 text-[#5F5F5F]" />
            <span>Last updated: 11:45 AM, 05 Aug 2026</span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#5F5F5F]" />
            <span>Updates every 30 seconds</span>
          </div>
        </div>

      </div>

      {/* House Detail Profile Modal */}
      <HouseDetailModal
        houseId={selectedHouse}
        onClose={() => setSelectedHouse(null)}
      />

      {/* Point System Info Modal */}
      {showPointSystemModal && (
        <div
          onClick={() => setShowPointSystemModal(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FAF8F5] rounded-[32px] max-w-lg w-full p-7 border border-black/10 shadow-2xl space-y-5 text-left cursor-default"
          >
            <div className="flex items-center justify-between border-b border-black/8 pb-3">
              <h3 className="font-serif-cormorant font-bold text-2xl text-[#111111]">
                Official CBSE Point Allocation Rules
              </h3>
              <button
                onClick={() => setShowPointSystemModal(false)}
                className="w-8 h-8 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-[#111111]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans-manrope">
              <div className="p-3.5 rounded-2xl bg-white border border-black/8 space-y-1.5">
                <h5 className="font-extrabold text-[#111111]">🥇 1st Position (Gold)</h5>
                <p className="text-[#5F5F5F]">Solo Events: +10 Pts • Group/Team Events: +20-25 Pts</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-black/8 space-y-1.5">
                <h5 className="font-extrabold text-[#111111]">🥈 2nd Position (Silver)</h5>
                <p className="text-[#5F5F5F]">Solo Events: +7 Pts • Group/Team Events: +15 Pts</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-black/8 space-y-1.5">
                <h5 className="font-extrabold text-[#111111]">🥉 3rd Position (Bronze)</h5>
                <p className="text-[#5F5F5F]">Solo Events: +5 Pts • Group/Team Events: +10 Pts</p>
              </div>
            </div>

            <button
              onClick={() => setShowPointSystemModal(false)}
              className="w-full py-3 rounded-full bg-[#111111] text-white font-bold text-xs cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

    </section>
  );
};
