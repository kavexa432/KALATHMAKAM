import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Radio, Clock, Volume2 } from 'lucide-react';
import { useFestival } from '../../../shared/context/FestivalContext';
import { houseColors } from '../../../shared/tokens/designTokens';
import type { HouseId } from '../../../shared/types/festivalTypes';
import { calculateHouseStandings, getLeaderSummary } from '../../../shared/utils/ranking';
import { formatTime12Hour } from '../../../utils/timeUtils';
import { cleanVenueName } from '../../../utils/venueUtils';

// Official House Emblem Images
import vegaEmblem from '../../../assets/houses/vega.png';
import novaEmblem from '../../../assets/houses/nova.png';
import orionEmblem from '../../../assets/houses/orion.png';
import astraEmblem from '../../../assets/houses/astra.png';

const houseEmblems: Record<HouseId, string> = {
  VEGA: vegaEmblem,
  NOVA: novaEmblem,
  ORION: orionEmblem,
  ASTRA: astraEmblem,
  NONE: '',
};

export const DisplayPage: React.FC = () => {
  const { houses, getHousePoints, getHouseMedals, results, events, liveFeed } = useFestival();
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Standard Competition Ranking for Houses
  const standings = calculateHouseStandings(houses, getHousePoints, getHouseMedals, results);
  const leaderSummary = getLeaderSummary(standings);
  const maxPoints = Math.max(...standings.map((s) => s.points), 1);

  // Active / Running Stage Events
  const runningEvents = events.filter((e) => e.status === 'Running');
  const upcomingEvents = events.filter((e) => e.status === 'Upcoming').slice(0, 3);
  const recentResults = results
    .filter((r) => r.status === 'Published' || r.status === 'Verified')
    .slice(0, 5);

  // Ticker Announcements: Include Live Leader Announcement
  const tickerItems = [
    leaderSummary.tickerAnnouncement,
    ...liveFeed.map((f) => f.content),
    'KALATHMAKAM 2K26 • MGM AYIROOR • GRAND INTER-HOUSE CULTURAL FESTIVAL',
  ];

  return (
    <div className="min-h-screen bg-[#0E0E10] text-white flex flex-col font-sans-manrope overflow-hidden selection:bg-[#F59E0B] selection:text-black">
      {/* Top Header / TV Bar */}
      <header className="px-8 py-4 bg-black/60 border-b border-white/10 backdrop-blur-xl flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5E84] to-[#F59E0B] flex items-center justify-center shadow-md">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif-cormorant font-bold text-2xl tracking-wide leading-none text-white">
              KALATHMAKAM 2K26 — TV DISPLAY
            </h1>
            <span className="text-[11px] font-extrabold text-[#10B981] tracking-widest uppercase flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
              LIVE BROADCAST • 18–20 AUG 2026
            </span>
          </div>
        </div>

        {/* Live Clock & Badge */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider block">CURRENT TIME</span>
            <span className="font-sans-manrope font-black text-2xl text-white tracking-widest tabular-nums">
              {currentTime || '--:--:--'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid: House Standings + Live Stage Feed */}
      <main className="flex-1 p-8 grid grid-cols-12 gap-8 overflow-hidden items-stretch">
        
        {/* Left 8 Cols: House Points Championship Cards */}
        <div className="col-span-8 flex flex-col justify-between space-y-6">
          
          {/* Header Card: Co-Leaders / Current Champion */}
          <div className="bg-gradient-to-r from-white/8 to-white/3 rounded-3xl p-6 border border-white/15 backdrop-blur-md flex items-center justify-between shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-5 relative z-10">
              <div className="flex items-center -space-x-4">
                {leaderSummary.leaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FFA033] p-0.5 shadow-xl ring-2 ring-black shrink-0"
                  >
                    <div className="w-full h-full bg-[#1A1A1A] rounded-[14px] flex items-center justify-center p-2">
                      <img
                        src={houseEmblems[leader.id as HouseId]}
                        alt={leader.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#F59E0B] bg-[#F59E0B]/15 px-3 py-1 rounded-full border border-[#F59E0B]/30">
                  <Crown className="w-4 h-4" />
                  <span>{leaderSummary.headerTitle}</span>
                </div>
                <h2 className="font-sans-manrope font-black text-3xl text-white mt-1">
                  {leaderSummary.isTied
                    ? `HOUSE ${leaderSummary.leaderNames} • ${leaderSummary.points} PTS`
                    : `HOUSE ${leaderSummary.leaders[0]?.name} • ${leaderSummary.points} PTS`}
                </h2>
                <p className="text-xs text-white/70 font-medium mt-0.5">
                  {leaderSummary.headerSubtitle}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs font-bold text-white/50 uppercase tracking-wider block">TOP SCORE</span>
              <span className="font-sans-manrope font-black text-5xl text-[#F59E0B]">
                {leaderSummary.points}
              </span>
              <span className="text-xs font-extrabold text-white/60 block">POINTS</span>
            </div>
          </div>

          {/* 4 House Point Cards (Standard Competition Ranking with Tied Badges) */}
          <div className="grid grid-cols-2 gap-5 flex-1">
            {standings.map((h) => {
              const houseId = h.id as HouseId;
              const colorInfo = houseColors[houseId];
              const isFirstRank = h.rank === 1;

              return (
                <div
                  key={h.id}
                  className={`rounded-3xl p-6 transition-all relative flex flex-col justify-between border ${
                    isFirstRank
                      ? 'bg-gradient-to-br from-[#F59E0B]/20 to-white/5 border-[#F59E0B] shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-2 ring-[#F59E0B]/40'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    borderTopWidth: '5px',
                    borderTopColor: colorInfo.primary,
                  }}
                >
                  {/* Crown on Top Edge for all 1st place houses */}
                  {isFirstRank && (
                    <div className="absolute -top-3 left-8 bg-[#F59E0B] text-black font-black text-[10px] px-3 py-0.5 rounded-full shadow-md flex items-center gap-1.5 uppercase">
                      <Crown className="w-3.5 h-3.5 fill-black" />
                      <span>{h.isTied ? 'SHARED LEADER' : 'CHAMPION'}</span>
                    </div>
                  )}

                  {/* Card Top: House Info Left + Rank Badge Right */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 p-2 flex items-center justify-center shrink-0">
                        <img
                          src={houseEmblems[houseId]}
                          alt={h.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div>
                        <h3
                          className="font-sans-manrope font-black text-2xl uppercase tracking-wider leading-none"
                          style={{ color: colorInfo.primary }}
                        >
                          {h.name}
                        </h3>
                        <span className="text-xs text-white/60 font-semibold mt-1 block">
                          {h.totalWins} Event Victories {h.isTied && `• ${h.rankDisplay}`}
                        </span>
                      </div>
                    </div>

                    {/* Rank Badge */}
                    <span
                      className={`text-base font-sans-manrope font-black px-4 py-1.5 rounded-full uppercase tracking-wider border-2 shadow-md ${
                        h.rank === 1
                          ? 'bg-[#F59E0B] text-black border-[#F59E0B]'
                          : h.rank === 2
                          ? 'bg-slate-200 text-slate-900 border-slate-300'
                          : h.rank === 3
                          ? 'bg-amber-200 text-amber-950 border-amber-300'
                          : 'bg-white/10 text-white/70 border-white/20'
                      }`}
                    >
                      {h.badge.text}
                    </span>
                  </div>

                  {/* Score & Medals */}
                  <div className="bg-black/40 rounded-2xl p-4 border border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider block">
                        TOTAL POINTS
                      </span>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-sans-manrope font-black text-4xl text-white">
                          {h.points}
                        </span>
                        <span className="text-xs font-black text-white/60">PTS</span>
                      </div>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-xs font-black text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-md border border-emerald-500/30 inline-block">
                        ▲ +{h.recentDelta} Today
                      </span>
                      <div className="text-xs font-bold text-white/70 flex items-center gap-2 justify-end">
                        <span>🥇 {h.medals.gold}</span>
                        <span>🥈 {h.medals.silver}</span>
                        <span>🥉 {h.medals.bronze}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000"
                        style={{
                          width: `${Math.round((h.points / maxPoints) * 100)}%`,
                          backgroundColor: colorInfo.primary,
                        }}
                      />
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Right 4 Cols: Live Stages & Recent Results */}
        <div className="col-span-4 flex flex-col justify-between space-y-6">
          
          {/* Active Stages Widget */}
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex flex-col space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-[#FF5E84] flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#FF5E84] animate-pulse" />
                <span>LIVE STAGES</span>
              </span>
              <span className="text-[10px] font-extrabold text-white/50 uppercase">NOW ON STAGE</span>
            </div>

            {runningEvents.length > 0 ? (
              <div className="space-y-3">
                {runningEvents.map((evt) => (
                  <div key={evt.id} className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                        RUNNING NOW
                      </span>
                      <span className="text-white/60 font-semibold">
                        📍 {cleanVenueName(evt.venue, evt.stage)}
                      </span>
                    </div>
                    <h4 className="font-serif-cormorant font-bold text-xl text-white">
                      {evt.eventName}
                    </h4>
                    <span className="text-xs text-white/60 font-semibold block">
                      Category: {evt.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-3">
                <span className="text-[11px] font-extrabold text-[#F59E0B] uppercase tracking-wider block">
                  Upcoming Competitions Today:
                </span>
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#3B82F6] uppercase">
                        {formatTime12Hour(evt.scheduledStartTime)}
                      </span>
                      <span className="text-white/60 font-semibold">
                        📍 {cleanVenueName(evt.venue, evt.stage)}
                      </span>
                    </div>
                    <h4 className="font-serif-cormorant font-bold text-lg text-white">
                      {evt.eventName}
                    </h4>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center bg-black/30 rounded-2xl border border-white/5">
                <Clock className="w-8 h-8 text-white/30 mx-auto mb-2" />
                <p className="text-xs text-white/60 font-semibold">
                  All stage competitions for today have concluded.
                </p>
              </div>
            )}
          </div>

          {/* Recent Verified Placements */}
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10 flex-1 flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-black uppercase tracking-widest text-[#F59E0B] flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#F59E0B]" />
                <span>RECENT RESULTS</span>
              </span>
              <span className="text-[10px] font-extrabold text-white/50 uppercase">PUBLISHED LIVE</span>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto">
              {recentResults.map((r) => {
                const posMedal = r.position === '1st' ? '🥇' : r.position === '2nd' ? '🥈' : '🥉';
                return (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{posMedal}</span>
                      <div>
                        <h5 className="font-sans-manrope font-extrabold text-white">
                          {r.eventTitle}
                        </h5>
                        <p className="text-[11px] text-white/60">
                          {r.participantName} • {r.houseId} House
                        </p>
                      </div>
                    </div>
                    <span className="font-sans-manrope font-black text-emerald-400 text-sm shrink-0">
                      +{r.points} PTS
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* Bottom Full-Width Animated Live Ticker */}
      <footer className="bg-black border-t border-white/10 py-3 px-6 flex items-center gap-4 z-20">
        <div className="flex items-center gap-2 bg-[#F59E0B] text-black px-3.5 py-1 rounded-full font-sans-manrope font-black text-xs uppercase tracking-widest shrink-0 shadow-md">
          <Volume2 className="w-3.5 h-3.5" />
          <span>LIVE TICKER</span>
        </div>

        <div className="relative flex-1 overflow-hidden">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-xs font-sans-manrope font-extrabold text-white/90">
            {tickerItems.map((text, idx) => (
              <span key={idx} className="flex items-center gap-3">
                <span className="text-[#F59E0B]">✦</span>
                <span>{text}</span>
              </span>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};
