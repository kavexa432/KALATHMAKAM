export type HouseId = 'NOVA' | 'VEGA' | 'ORION' | 'ASTRA' | 'NONE';

export type UserRole = 'developer' | 'admin' | 'user' | 'Developer' | 'Admin' | 'User';

export interface UserModel {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  approved?: boolean;
  permissions: string[];
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
  createdAt?: string;
}

export interface SponsorModel {
  id: string;
  name: string;
  tier: string;
  logo?: string;
  logoUrl?: string;
  websiteUrl?: string;
}

export interface FestivalEdition {
  id: string;
  name?: string;
  edition?: string;
  year?: number | string;
  theme?: string;
  schoolName?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  dates?: {
    start: string;
    end: string;
    formatted: string;
  };
  stats?: {
    eventsCount: number;
    participantsCount: number;
    stagesCount: number;
    housesCount: number;
  };
}

export interface HouseModel {
  id: HouseId;
  name: string;
  tagline?: string;
  color: string;
  secondaryColor?: string;
  gradient?: string;
  bgGlow?: string;
  captain: string;
  viceCaptain: string;
  teacherInCharge: string;
  motto?: string;
  flagSymbol?: string;
  establishedYear?: number;
}

export interface StageModel {
  id: string;
  code?: string;
  name: string;
  venue?: string;
  location?: string;
  capacity: number;
  currentEvent?: string;
  status?: 'Active' | 'Idle' | 'Delayed' | string;
}

export type EventStatus = 'Pending' | 'Upcoming' | 'Running' | 'Delayed' | 'Results Pending' | 'Completed' | 'Cancelled';

export interface EventModel {
  id: string;
  eventName: string;
  category: string;
  type: string;
  language: string;
  department?: string; // Optional for now
  stage: string | null;
  venue: string | null;
  date: string;
  
  // Timing
  scheduledStartTime: string; // e.g. "09:00"
  scheduledEndTime?: string; // e.g. "10:00" or undefined
  durationMinutes: number;
  delayMinutes: number;
  actualStartTime: string | null;
  actualEndTime: string | null;

  // Status computation overrides/flags
  cancelled: boolean;
  postponed: boolean;
  
  // Authoritative Flags
  status: string;
  publishToWebsite: boolean;
  resultsPublished: boolean;
  winnerUploaded: boolean;
  housePointsUpdated: boolean;
  participantsExpected?: number;
  participantsActual?: number;
  resultId?: string;
  winnerHouse?: HouseId | null;

  createdAt: string;
  updatedAt: string;
}

export interface EventResultModel {
  id: string;
  eventId: string;
  festivalId?: string;
  eventTitle: string;
  category: string;
  participantName: string;
  studentClass: string;
  houseId: HouseId;
  houseName?: string;
  position: '1st' | '2nd' | '3rd' | 'Participation' | string;
  score?: number;
  points: number;
  createdAt: string;
  status: 'Pending Review' | 'Verified' | 'Published' | string;
  judgeNotes?: string;
}

export interface ResultDraftPlacement {
  position: 1 | 2 | 3 | number;
  studentName: string;
  studentClass: string;
  house: HouseId | 'NONE' | string;
  points?: number;
  studentNameConfidence?: number;
  houseConfidence?: number;
  positionConfidence?: number;
  classConfidence?: number;
  confidence?: 'high' | 'medium' | 'low';
}

export interface ResultDraftModel {
  id: string;
  eventId: string;
  eventName: string;
  category: string;
  date?: string;
  sourceImagePath?: string;
  sourceImageUrl?: string;
  ocrStatus: 'pending' | 'review' | 'published';
  version?: number;
  results: ResultDraftPlacement[];
  status: 'Pending Review' | 'Verified' | 'Published';
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
  editedFields?: string[];
}

export type AnnouncementType = 'General Notice' | 'Announcement' | 'Result' | 'Stage Update' | 'Schedule Change' | 'Emergency';
export type PriorityLevel = 'Normal' | 'Low' | 'Important' | 'Critical';

export interface LiveActivityFeedItem {
  id: string;
  festivalId: string;
  timestamp: string;
  type: AnnouncementType;
  priority: PriorityLevel;
  content: string;
  houseId?: HouseId;
  points?: number;
  read?: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  user: string;
  userRole: UserRole;
  action: string;
  entity: string;
  details: string;
}

export interface GalleryItemModel {
  id: string;
  festivalId?: string;
  title: string;
  category: string;
  imageUrl?: string;
  mediaUrl?: string;
  type?: string;
  photographer: string;
  houseTag?: HouseId;
  houseId?: HouseId;
  day?: string;
  tags?: string[];
  likes?: number;
}

export type LeaderboardDay = 'Overall' | 'Day 1' | 'Day 2' | 'Day 3' | 'Live' | 'Final';
