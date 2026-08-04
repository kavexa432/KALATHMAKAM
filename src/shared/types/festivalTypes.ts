export type HouseId = 'NOVA' | 'VEGA' | 'ORION' | 'ASTRA';

export type EventStatus =
  | 'Draft'
  | 'Published'
  | 'Upcoming'
  | 'Ongoing'
  | 'LIVE NOW'
  | 'Judging'
  | 'Completed'
  | 'Archived';

export type ResultStatus = 'Pending Review' | 'Verified' | 'Published';

export type AnnouncementType =
  | 'Announcement'
  | 'Result'
  | 'Stage Update'
  | 'Emergency'
  | 'General Notice'
  | 'Schedule Change';

export type PriorityLevel = 'Low' | 'Normal' | 'Important' | 'Critical';

export type LeaderboardDay = 'Live' | 'Day 1' | 'Day 2' | 'Day 3' | 'Final';

export interface FestivalEdition {
  id: string;
  year: string;
  theme: string;
  startDate: string;
  endDate: string;
  status: 'Live' | 'Archived';
  logoUrl?: string;
}

export interface HouseModel {
  id: HouseId;
  name: string;
  color: string;
  secondaryColor: string;
  motto: string;
  flagSymbol: string;
  captain: string;
  viceCaptain: string;
  teacherInCharge: string;
  establishedYear: number;
}

export interface StudentModel {
  id: string;
  name: string;
  classGrade: string;
  houseId: HouseId;
  avatarUrl?: string;
}

export interface StageModel {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity?: number;
}

export interface EventModel {
  id: string;
  festivalId: string;
  title: string;
  category: 'Dance' | 'Music' | 'Drama' | 'Literature' | 'Fine Arts' | 'Quiz' | 'Cultural';
  stageId: string;
  stageName: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  rules: string[];
  judges: string[];
  participantsCount: number;
  featured?: boolean;
}

export interface EventResultModel {
  id: string;
  festivalId?: string;
  eventId: string;
  eventTitle: string;
  category: string;
  position: '1st' | '2nd' | '3rd' | 'Participation';
  points: number;
  score?: number;
  houseId: HouseId;
  houseName?: string;
  participantName: string;
  studentId?: string;
  studentClass: string;
  status: ResultStatus;
  createdAt: string;
  certificateUrl?: string;
  judgeNotes?: string;
}

export interface LeaderboardSnapshotModel {
  id: string;
  festivalId: string;
  houseId: HouseId;
  day: LeaderboardDay;
  competitionPoints: number;
  bonusPoints: number;
  penaltyPoints: number;
  totalPoints: number;
  rank: number;
}

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
  userRole: 'Developer' | 'Admin' | 'User';
  action: string;
  entity: string;
  details: string;
}

export interface UserModel {
  id: string;
  name: string;
  email: string;
  role: 'Developer' | 'Admin' | 'User';
  permissions: string[];
  status: 'Active' | 'Inactive';
  avatarUrl?: string;
}

export interface GalleryItemModel {
  id: string;
  festivalId: string;
  title: string;
  mediaUrl: string;
  type: 'image' | 'video';
  category: 'Opening Ceremony' | 'Dance' | 'Music' | 'Drama' | 'Prize Distribution' | 'Behind The Scenes' | 'Audience';
  houseId?: HouseId;
  eventId?: string;
  day: string;
  photographer?: string;
  tags: string[];
  caption?: string;
}

export interface SponsorModel {
  id: string;
  name: string;
  logo: string;
  tier: 'Title Sponsor' | 'Gold Sponsor' | 'Silver Sponsor' | 'Partner';
  websiteUrl?: string;
}
