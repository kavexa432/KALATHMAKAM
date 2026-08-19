import type { HouseId, HouseModel, EventResultModel } from '../types/festivalTypes';

export interface HouseMedals {
  gold: number;
  silver: number;
  bronze: number;
  total: number;
}

export interface RankBadgeStyle {
  text: string;
  bg: string;
  textColor: string;
  border: string;
  isLeader: boolean;
  medal: string;
}

export interface HouseStanding extends HouseModel {
  points: number;
  rank: number;
  isTied: boolean;
  tiedCount: number;
  tiedWith: HouseId[];
  sharedRankLabel: string;
  rankDisplay: string;
  badge: RankBadgeStyle;
  medals: HouseMedals;
  totalWins: number;
  latestWin: string;
  recentDelta: number;
  isLeader: boolean;
}

export interface LeaderSummary {
  isTied: boolean;
  leaders: HouseStanding[];
  leaderNames: string;
  points: number;
  leadPointsDiff: number;
  tickerAnnouncement: string;
  headerTitle: string;
  headerSubtitle: string;
}

/**
 * Dense Competition Ranking (Score Tier Ranking)
 * When houses tie for a position, they share the rank (e.g. SHARED 2ND),
 * and the next house receives the consecutive rank (e.g. 3RD).
 * Example:
 *  - VEGA (169): 1ST
 *  - ORION (162) & ASTRA (162): SHARED 2ND
 *  - NOVA (132): 3RD
 */
export function computeStandardCompetitionRanks<T extends { id: HouseId | string; points: number }>(
  items: T[]
): Array<T & { rank: number; isTied: boolean; tiedCount: number; tiedWith: HouseId[] }> {
  // Sort descending by points
  const sorted = [...items].sort((a, b) => b.points - a.points);
  
  // Count frequency of points
  const pointCounts = new Map<number, number>();
  const pointHouses = new Map<number, HouseId[]>();

  sorted.forEach((item) => {
    const pts = item.points;
    pointCounts.set(pts, (pointCounts.get(pts) || 0) + 1);
    const list = pointHouses.get(pts) || [];
    list.push(item.id as HouseId);
    pointHouses.set(pts, list);
  });

  let currentRank = 0;
  let prevPoints: number | null = null;

  return sorted.map((item) => {
    if (prevPoints === null || item.points !== prevPoints) {
      currentRank += 1;
      prevPoints = item.points;
    }

    const count = pointCounts.get(item.points) || 1;
    const isTied = count > 1;
    const tiedWith = (pointHouses.get(item.points) || []).filter((id) => id !== item.id);

    return {
      ...item,
      rank: currentRank,
      isTied,
      tiedCount: count,
      tiedWith,
    };
  });
}

/**
 * Returns the medal icon for a given rank
 */
export function getRankMedal(rank: number): string {
  switch (rank) {
    case 1:
      return '🥇';
    case 2:
      return '🥈';
    case 3:
      return '🥉';
    default:
      return '⭐';
  }
}

/**
 * Returns badge text and Tailwind styling based on rank and tie state
 */
export function getRankBadgeStyle(rank: number, isTied: boolean): RankBadgeStyle {
  if (rank === 1) {
    return {
      text: isTied ? 'SHARED 1ST' : '1ST',
      bg: 'bg-[#F59E0B]',
      textColor: 'text-white',
      border: 'border-[#F59E0B]',
      isLeader: true,
      medal: '🥇',
    };
  }
  if (rank === 2) {
    return {
      text: isTied ? 'SHARED 2ND' : '2ND',
      bg: 'bg-slate-200',
      textColor: 'text-slate-800',
      border: 'border-slate-300',
      isLeader: false,
      medal: '🥈',
    };
  }
  if (rank === 3) {
    return {
      text: isTied ? 'SHARED 3RD' : '3RD',
      bg: 'bg-amber-200',
      textColor: 'text-amber-900',
      border: 'border-amber-300',
      isLeader: false,
      medal: '🥉',
    };
  }
  return {
    text: isTied ? 'SHARED 4TH' : '4TH',
    bg: 'bg-slate-100',
    textColor: 'text-slate-600',
    border: 'border-slate-200',
    isLeader: false,
    medal: '⭐',
  };
}

/**
 * Formats rank label for card titles and subheaders (e.g. "Rank #1 (Tied)" vs "Rank #1")
 */
export function getRankDisplay(rank: number, isTied: boolean): string {
  if (isTied) {
    return `Rank #${rank} (Tied)`;
  }
  return `Rank #${rank}`;
}

/**
 * Formats rank badge text for modals (e.g. "🥇 SHARED 1ST (TIED)")
 */
export function getModalRankBadge(rank: number, isTied: boolean): string {
  if (rank === 1) {
    return isTied ? '🥇 SHARED 1ST (TIED)' : '🥇 1st Rank';
  }
  if (rank === 2) {
    return isTied ? '🥈 SHARED 2ND (TIED)' : '🥈 2nd Rank';
  }
  if (rank === 3) {
    return isTied ? '🥉 SHARED 3RD (TIED)' : '🥉 3rd Rank';
  }
  return '⭐ 4th Rank';
}

/**
 * Calculates complete enriched house standings dynamically with standard competition ranking
 */
export function calculateHouseStandings(
  houses: HouseModel[],
  getHousePoints: (houseId: HouseId) => number,
  getHouseMedals: (houseId: HouseId) => HouseMedals,
  results: EventResultModel[]
): HouseStanding[] {
  // Step 1: Base statistics per house
  const rawHouseStats = houses.map((h) => {
    const houseId = h.id as HouseId;
    const points = getHousePoints(houseId);
    const medals = getHouseMedals(houseId);

    const houseResults = results.filter((r) => r.houseId === houseId && (r.status === 'Published' || r.status === 'Verified'));
    const sortedResults = [...houseResults].sort((a, b) => {
      const timeA = new Date(a.createdAt || '').getTime();
      const timeB = new Date(b.createdAt || '').getTime();
      return timeB - timeA;
    });

    const recentDelta = sortedResults.slice(0, 3).reduce((sum, r) => sum + r.points, 0);
    const totalWins = houseResults.length;
    const latestWin = sortedResults.length > 0 ? sortedResults[0].eventTitle : 'None yet';

    return {
      ...h,
      points,
      medals,
      totalWins,
      latestWin,
      recentDelta,
    };
  });

  // Step 2: Calculate standard competition ranks
  const ranked = computeStandardCompetitionRanks(rawHouseStats);

  // Step 3: Enrich with formatted strings & badge styling
  return ranked.map((item) => {
    const badge = getRankBadgeStyle(item.rank, item.isTied);
    const rankDisplay = getRankDisplay(item.rank, item.isTied);
    const sharedRankLabel = item.isTied
      ? item.rank === 1
        ? 'SHARED 1ST'
        : item.rank === 2
        ? 'SHARED 2ND'
        : 'SHARED 3RD'
      : item.rank === 1
      ? '1ST PLACE'
      : item.rank === 2
      ? '2ND PLACE'
      : item.rank === 3
      ? '3RD PLACE'
      : '4TH PLACE';

    return {
      ...item,
      sharedRankLabel,
      rankDisplay,
      badge,
      isLeader: item.rank === 1,
    };
  });
}

/**
 * Computes leader / co-leaders summary from standings
 */
export function getLeaderSummary(standings: HouseStanding[]): LeaderSummary {
  if (!standings || standings.length === 0) {
    return {
      isTied: false,
      leaders: [],
      leaderNames: 'None',
      points: 0,
      leadPointsDiff: 0,
      tickerAnnouncement: 'FESTIVAL UNDERWAY',
      headerTitle: 'CURRENT CHAMPION',
      headerSubtitle: 'Competition in progress',
    };
  }

  const leaders = standings.filter((s) => s.rank === 1);
  const isTied = leaders.length > 1;
  const topPoints = leaders[0]?.points || 0;

  // Find the highest point item that is NOT rank 1
  const nonLeader = standings.find((s) => s.rank > 1);
  const secondPoints = nonLeader ? nonLeader.points : 0;
  const leadPointsDiff = topPoints - secondPoints;

  const leaderNames = leaders.map((l) => l.name).join(' & ');

  if (isTied) {
    return {
      isTied: true,
      leaders,
      leaderNames,
      points: topPoints,
      leadPointsDiff: 0,
      tickerAnnouncement: `CO-LEADERS (TIED): ${leaderNames} (${topPoints} PTS)`,
      headerTitle: 'CO-CHAMPIONS (TIED)',
      headerSubtitle: topPoints > 0 ? `Tied for 1st place with ${topPoints} PTS each` : 'All houses tied at 0 PTS',
    };
  }

  const singleLeader = leaders[0] || standings[0];
  return {
    isTied: false,
    leaders: [singleLeader],
    leaderNames: singleLeader.name,
    points: singleLeader.points,
    leadPointsDiff,
    tickerAnnouncement: `FESTIVAL LEADER: ${singleLeader.name} (${singleLeader.points} PTS)`,
    headerTitle: 'CURRENT CHAMPION',
    headerSubtitle: leadPointsDiff > 0 ? `Leading by +${leadPointsDiff} PTS ahead of 2nd place` : 'Currently in 1st place',
  };
}
