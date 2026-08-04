export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  category: string;
  stage: string;
  day: 'Day 1' | 'Day 2' | 'Day 3' | 'Closing Ceremony';
  status: 'Completed' | 'Live' | 'Upcoming';
  coordinator: string;
}

export const DAYS_LIST = ['Day 1', 'Day 2', 'Day 3', 'Closing Ceremony'] as const;

export const SCHEDULE_DATA: ScheduleEvent[] = [
  // Day 1
  {
    id: 's-101',
    time: '08:30 AM - 09:30 AM',
    title: 'Inaugural Ceremony & Lamp Lighting',
    category: 'Ceremony',
    stage: 'Stage 1: Main Auditorium (Tagore)',
    day: 'Day 1',
    status: 'Completed',
    coordinator: 'Staff & Student Committee',
  },
  {
    id: 's-102',
    time: '10:00 AM - 01:00 PM',
    title: 'Bharatanatyam (Classical Dance Solo)',
    category: 'Dance',
    stage: 'Stage 1: Main Auditorium (Tagore)',
    day: 'Day 1',
    status: 'Completed',
    coordinator: 'Prof. Suresh Varkala',
  },
  {
    id: 's-103',
    time: '09:30 AM - 12:30 PM',
    title: 'Light Music Solo (Lalitha Sangeetham)',
    category: 'Music',
    stage: 'Stage 3: Seminar Hall (Kumaran Asan)',
    day: 'Day 1',
    status: 'Completed',
    coordinator: 'Smt. Lakshmi Nair',
  },
  {
    id: 's-104',
    time: '10:00 AM - 01:15 PM',
    title: 'Malayalam Essay & Poetry Writing',
    category: 'Literature',
    stage: 'Academic Library Hall',
    day: 'Day 1',
    status: 'Completed',
    coordinator: 'Sri. Ramesh Kumar',
  },
  {
    id: 's-105',
    time: '02:00 PM - 05:00 PM',
    title: 'Mohiniyattam Classical Dance',
    category: 'Dance',
    stage: 'Stage 1: Main Auditorium (Tagore)',
    day: 'Day 1',
    status: 'Completed',
    coordinator: 'Smt. Anitha Pillai',
  },

  // Day 2
  {
    id: 's-201',
    time: '09:30 AM - 12:00 PM',
    title: 'Patriotic Group Song (Gana Geetham)',
    category: 'Group Song',
    stage: 'Stage 1: Main Auditorium (Tagore)',
    day: 'Day 2',
    status: 'Live',
    coordinator: 'Sri. Manoj V.',
  },
  {
    id: 's-202',
    time: '10:00 AM - 12:30 PM',
    title: 'Water Color & Acrylic Canvas Painting',
    category: 'Painting',
    stage: 'Art Pavilion (Ezhuthachan Block)',
    day: 'Day 2',
    status: 'Live',
    coordinator: 'Artist K. Gopakumar',
  },
  {
    id: 's-203',
    time: '11:00 AM - 03:00 PM',
    title: 'Folk Dance (Nadan Nrittam Group)',
    category: 'Dance',
    stage: 'Stage 2: Open Air Theatre (Vallathol)',
    day: 'Day 2',
    status: 'Upcoming',
    coordinator: 'Smt. Bindu Rajesh',
  },
  {
    id: 's-204',
    time: '02:00 PM - 05:00 PM',
    title: 'Mono Act & Dramatic Character Performances',
    category: 'Drama',
    stage: 'Stage 2: Open Air Theatre (Vallathol)',
    day: 'Day 2',
    status: 'Upcoming',
    coordinator: 'Sri. Jayakumar A.',
  },

  // Day 3
  {
    id: 's-301',
    time: '10:00 AM - 01:00 PM',
    title: 'The Grand Heritage & Cultural Quiz',
    category: 'Quiz',
    stage: 'Stage 1: Main Auditorium (Tagore)',
    day: 'Day 3',
    status: 'Upcoming',
    coordinator: 'Quizmaster Dr. Anandhu S.',
  },
  {
    id: 's-302',
    time: '02:00 PM - 04:30 PM',
    title: 'Mime & Non-Verbal Skit Competition',
    category: 'Drama',
    stage: 'Stage 1: Main Auditorium (Tagore)',
    day: 'Day 3',
    status: 'Upcoming',
    coordinator: 'Sri. Rahul Menon',
  },

  // Closing Ceremony
  {
    id: 's-401',
    time: '05:00 PM - 07:30 PM',
    title: 'Grand Valedictory Function & Trophy Distribution',
    category: 'Ceremony',
    stage: 'Stage 1: Main Auditorium (Tagore)',
    day: 'Closing Ceremony',
    status: 'Upcoming',
    coordinator: 'Principal & Executive Managing Committee',
  },
];
