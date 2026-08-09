export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  category: string;
  stage: string;
  day: string;
  status: 'Completed' | 'Live' | 'Upcoming';
  coordinator?: string;
  participants?: string | number | null;
}

export const DAYS_LIST = ['Monday 10/08 (Stages)', 'Pre-Fest (Completed)'] as const;

export const SCHEDULE_DATA: ScheduleEvent[] = [
  // ==========================================
  // STAGE 1: Main Auditorium (Dance)
  // ==========================================
  { id: 's1-1', time: '09:00 AM', title: 'Inauguration & Lamp Lighting', category: 'Ceremony', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's1-2', time: '09:15 AM', title: 'Bharathanatyam (Cat 4)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 1 },
  { id: 's1-3', time: '09:25 AM', title: 'Bharathanatyam (Cat 3)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 9 },
  { id: 's1-4', time: '11:00 AM', title: 'Bharathanatyam (Cat 2)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 9 },
  { id: 's1-5', time: '12:30 PM', title: 'Bharathanatyam (Cat 2 Boy)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 1 },
  { id: 's1-6', time: '12:40 PM', title: 'Kuchipudi (Cat 3)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 6 },
  { id: 's1-7', time: '12:40 PM - 02:00 PM', title: 'LUNCH BREAK', category: 'Break', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's1-8', time: '02:00 PM', title: 'Bharathanatyam (Cat 1)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 7 },
  { id: 's1-9', time: '03:10 PM', title: 'Mohiniyattam (Cat 2)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 1 },
  { id: 's1-10', time: '03:20 PM', title: 'Mohiniyattam (Cat 3)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's1-11', time: '04:00 PM', title: 'Folk Dance (Cat 1)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 11 },
  { id: 's1-12', time: '05:05 PM', title: 'Folk Dance (Cat 2)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 11 },
  { id: 's1-13', time: '06:10 PM', title: 'Folk Dance (Cat 3)', category: 'Dance', stage: 'Stage 1: Main Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 3 },

  // ==========================================
  // STAGE 2: Mini Auditorium (English)
  // ==========================================
  { id: 's2-1', time: '09:00 AM', title: 'Recitation (Cat 4)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 5 },
  { id: 's2-2', time: '09:30 AM', title: 'Recitation (Cat 3)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 16 },
  { id: 's2-3', time: '11:00 AM', title: 'Extempore (Cat 3)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 13 },
  { id: 's2-4', time: '12:10 PM', title: 'Extempore (Cat 4)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 8 },
  { id: 's2-5', time: '01:00 PM', title: 'Anchoring (Cat 3)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 8 },
  { id: 's2-6', time: '01:00 PM - 01:30 PM', title: 'LUNCH BREAK', category: 'Break', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's2-7', time: '01:30 PM', title: 'Anchoring (Cat 4)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's2-8', time: '02:00 PM', title: 'Anchoring (Cat 2)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 8 },
  { id: 's2-9', time: '02:45 PM', title: 'Turn Coat (Cat 3 - Session 1)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 8 },
  { id: 's2-10', time: '03:30 PM', title: 'Turn Coat (Cat 3 - Session 2)', category: 'English', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's2-11', time: '04:00 PM', title: 'Western Music (Common)', category: 'Music', stage: 'Stage 2: Mini Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },

  // ==========================================
  // STAGE 3: KG Auditorium (Music)
  // ==========================================
  { id: 's3-1', time: '09:00 AM', title: 'Light Music (Cat 1 Common)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 25 },
  { id: 's3-2', time: '10:15 AM', title: 'Light Music (Cat 2 Boys)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 10 },
  { id: 's3-3', time: '11:05 AM', title: 'Light Music (Cat 2 Girls)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 12 },
  { id: 's3-4', time: '12:05 PM', title: 'Light Music (Cat 3 Boys)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 5 },
  { id: 's3-5', time: '12:30 PM', title: 'Light Music (Cat 3 Girls)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 8 },
  { id: 's3-6', time: '01:10 PM', title: 'Light Music (Cat 4 Girls)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 2 },
  { id: 's3-7', time: '01:10 PM - 02:00 PM', title: 'LUNCH BREAK', category: 'Break', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's3-8', time: '02:00 PM', title: 'Classical Music (Cat 2 Boys)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 2 },
  { id: 's3-9', time: '02:20 PM', title: 'Classical Music (Cat 2 Girls)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 2 },
  { id: 's3-10', time: '02:40 PM', title: 'Classical Music (Cat 3 Boys)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 3 },
  { id: 's3-11', time: '03:10 PM', title: 'Classical Music (Cat 3 Girls)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 5 },
  { id: 's3-12', time: '03:50 PM', title: 'Violin (Cat 3)', category: 'Instrumental', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: '1 Boy + 1 Girl' },
  { id: 's3-13', time: '04:00 PM', title: 'Group Song (Common)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's3-14', time: '04:40 PM', title: 'Patriotic Song (Common)', category: 'Music', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's3-15', time: '05:20 PM', title: 'National Anthem (Common)', category: 'Ceremony', stage: 'Stage 3: KG Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },

  // ==========================================
  // STAGE 4: Class VI A (Hindi)
  // ==========================================
  { id: 's4-1', time: '09:00 AM', title: 'Hindi Recitation (Cat 1)', category: 'Hindi', stage: 'Stage 4: Class VI A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 13 },
  { id: 's4-2', time: '10:15 AM', title: 'Hindi Recitation (Cat 2)', category: 'Hindi', stage: 'Stage 4: Class VI A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 18 },
  { id: 's4-3', time: '11:30 AM', title: 'Hindi Recitation (Cat 3)', category: 'Hindi', stage: 'Stage 4: Class VI A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 5 },
  { id: 's4-4', time: '12:00 PM', title: 'Hindi Elocution (Cat 1)', category: 'Hindi', stage: 'Stage 4: Class VI A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 5 },
  { id: 's4-5', time: '12:20 PM', title: 'Hindi Elocution (Cat 2)', category: 'Hindi', stage: 'Stage 4: Class VI A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 14 },
  { id: 's4-6', time: '01:20 PM', title: 'Hindi Extempore (Cat 4)', category: 'Hindi', stage: 'Stage 4: Class VI A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 2 },

  // ==========================================
  // STAGE 5: Class IX A (Malayalam & Sanskrit)
  // ==========================================
  { id: 's5-1', time: '09:00 AM', title: 'Malayalam Recitation (Cat 1)', category: 'Malayalam', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 28 },
  { id: 's5-2', time: '10:30 AM', title: 'Malayalam Recitation (Cat 2)', category: 'Malayalam', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 25 },
  { id: 's5-3', time: '11:45 AM', title: 'Malayalam Elocution (Cat 1)', category: 'Malayalam', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 15 },
  { id: 's5-4', time: '12:30 PM', title: 'Malayalam Elocution (Cat 2)', category: 'Malayalam', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 17 },
  { id: 's5-5', time: '12:30 PM - 02:15 PM', title: 'LUNCH BREAK', category: 'Break', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's5-6', time: '02:15 PM', title: 'Malayalam Recitation (Cat 3)', category: 'Malayalam', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 12 },
  { id: 's5-7', time: '03:15 PM', title: 'Malayalam Recitation (Cat 4)', category: 'Malayalam', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 3 },
  { id: 's5-8', time: '03:30 PM', title: 'Malayalam Extempore (Cat 3)', category: 'Malayalam', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 10 },
  { id: 's5-9', time: '04:30 PM', title: 'Sanskrit Recitation (Cat 3)', category: 'Sanskrit', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 6 },
  { id: 's5-10', time: '05:00 PM', title: 'Sanskrit Recitation (Cat 4)', category: 'Sanskrit', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 1 },
  { id: 's5-11', time: '05:05 PM', title: 'Sanskrit Recitation (Cat 2)', category: 'Sanskrit', stage: 'Stage 5: Class IX A', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 10 },

  // ==========================================
  // STAGE 6: Kids Auditorium (Mono Act, Mappilappattu, Arabic)
  // ==========================================
  { id: 's6-1', time: '09:00 AM', title: 'Mono Act (Cat 3)', category: 'Drama', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 3 },
  { id: 's6-2', time: '09:15 AM', title: 'Mono Act (Cat 2)', category: 'Drama', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 7 },
  { id: 's6-3', time: '09:45 AM', title: 'Mono Act (Cat 1)', category: 'Drama', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 6 },
  { id: 's6-4', time: '10:15 AM', title: 'Mappilappattu (Cat 3 Girls)', category: 'Music', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 7 },
  { id: 's6-5', time: '11:00 AM', title: 'Mappilappattu (Cat 3 Boys)', category: 'Music', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's6-6', time: '11:30 AM', title: 'Mappilappattu (Cat 2 Boys)', category: 'Music', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 7 },
  { id: 's6-7', time: '12:10 PM', title: 'Mappilappattu (Cat 2 Girls)', category: 'Music', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 9 },
  { id: 's6-8', time: '12:10 PM - 01:30 PM', title: 'LUNCH BREAK', category: 'Break', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's6-9', time: '01:30 PM', title: 'Mappilappattu (Cat 4 Girls)', category: 'Music', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 8 },
  { id: 's6-10', time: '02:15 PM', title: 'Arabic Recitation (Cat 4)', category: 'Arabic', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's6-11', time: '02:30 PM', title: 'Arabic Recitation (Cat 3)', category: 'Arabic', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 4 },
  { id: 's6-12', time: '03:00 PM', title: 'Arabic Recitation (Cat 2)', category: 'Arabic', stage: 'Stage 6: Kids Auditorium', day: 'Monday 10/08 (Stages)', status: 'Upcoming', participants: 3 },

  // ==========================================
  // STAGE 7: Computer Lab (Digital Painting only - PPT is a House Item, not individual)
  // ==========================================
  { id: 's7-4', time: '12:00 PM', title: 'Digital Painting (Cat 2)', category: 'IT', stage: 'Stage 7: Computer Lab', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's7-5', time: 'Same Session', title: 'Digital Painting (Cat 3)', category: 'IT', stage: 'Stage 7: Computer Lab', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },
  { id: 's7-6', time: 'Same Session', title: 'Digital Painting (Cat 4)', category: 'IT', stage: 'Stage 7: Computer Lab', day: 'Monday 10/08 (Stages)', status: 'Upcoming' },

  // ==========================================
  // PRE-FEST COMPLETED COMPETITIONS (OFF-STAGE)
  // ==========================================
  { id: 's-comp-1', time: 'Completed Pre-Fest', title: 'Pencil Drawing (All Categories)', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-2', time: 'Completed Pre-Fest', title: 'Water Colour Painting', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-3', time: 'Completed Pre-Fest', title: 'Crayon Painting', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-4', time: 'Completed Pre-Fest', title: 'Oil Colour Painting', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-5', time: 'Completed Pre-Fest', title: 'Cartoon', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-6', time: 'Completed Pre-Fest', title: 'Poster Making', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-7', time: 'Completed Pre-Fest', title: 'Collage', category: 'Fine Arts', stage: 'Mini Auditorium', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-8', time: 'Completed Pre-Fest', title: 'English Essay Writing & Story Writing', category: 'English Literary', stage: 'Literary Hall / Off-Stage', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-9', time: 'Completed Pre-Fest', title: 'English Versification (Cat 1, 2, 3, 4)', category: 'English Literary', stage: 'Literary Hall / Off-Stage', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-10', time: 'Completed Pre-Fest', title: 'Malayalam Essay Writing & Story Writing', category: 'Malayalam Literary', stage: 'Literary Hall / Off-Stage', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-11', time: 'Completed Pre-Fest', title: 'Malayalam Versification (Cat 1, 2, 3, 4)', category: 'Malayalam Literary', stage: 'Literary Hall / Off-Stage', day: 'Pre-Fest (Completed)', status: 'Completed' },
  { id: 's-comp-12', time: 'Completed Pre-Fest', title: 'Hindi Essay, Story Writing & Versification (Cat 4)', category: 'Hindi Literary', stage: 'Literary Hall / Off-Stage', day: 'Pre-Fest (Completed)', status: 'Completed' },
];
