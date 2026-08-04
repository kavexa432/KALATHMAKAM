export interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  category: 'Leadership' | 'Faculty' | 'Student Coordinator';
  avatar: string;
  designation: string;
  phone?: string;
  email?: string;
}

export const COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    id: 'c-1',
    name: 'Dr. R. Sudhakaran Nair',
    role: 'Patron & Principal',
    category: 'Leadership',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=400&auto=format&fit=crop',
    designation: 'Principal, MGM Model School, Ayiroor',
    email: 'principal@mgmayiroor.ac.in',
  },
  {
    id: 'c-2',
    name: 'Smt. Radhika V. Kurup',
    role: 'Vice Principal & Festival Chair',
    category: 'Leadership',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
    designation: 'Vice Principal & HOD Humanities',
    email: 'vp@mgmayiroor.ac.in',
  },
  {
    id: 'c-3',
    name: 'Sri. Jayaprakash M.',
    role: 'General Staff Convener',
    category: 'Faculty',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    designation: 'Senior Faculty in Performing Arts',
    phone: '+91 94470 12345',
  },
  {
    id: 'c-4',
    name: 'Smt. Preetha S. Varkala',
    role: 'Arts Secretary & Faculty Lead',
    category: 'Faculty',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
    designation: 'HOD Languages & Fine Arts',
    phone: '+91 94470 67890',
  },
  {
    id: 'c-5',
    name: 'Adithya V. Nair',
    role: 'Student Chairman',
    category: 'Student Coordinator',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=400&auto=format&fit=crop',
    designation: 'Grade XII Science A',
    phone: '+91 98951 11223',
  },
  {
    id: 'c-6',
    name: 'Devika S. Kumar',
    role: 'Student Arts Secretary',
    category: 'Student Coordinator',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop',
    designation: 'Grade XII Humanities',
    phone: '+91 98951 44556',
  },
];
