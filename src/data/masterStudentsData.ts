import type { HouseId } from '../shared/types/festivalTypes';

export interface MasterStudent {
  admissionNo: string;
  name: string;
  classGrade: number;
  division: string;
  house: HouseId | null; // null for Classes 1-5 & 11-12
  category: 'CAT-I' | 'CAT-II' | 'CAT-III' | 'CAT-IV';
}

// Automatic Category Logic based on CBSE Structure
export const getCategoryForClass = (classGrade: number): 'CAT-I' | 'CAT-II' | 'CAT-III' | 'CAT-IV' => {
  if (classGrade >= 1 && classGrade <= 5) return 'CAT-I';
  if (classGrade >= 6 && classGrade <= 8) return 'CAT-II';
  if (classGrade >= 9 && classGrade <= 10) return 'CAT-III';
  return 'CAT-IV'; // Classes 11-12
};

// Automatic House Logic based on CBSE Structure
export const isHouseRequiredForClass = (classGrade: number): boolean => {
  // Only Classes 6-10 have House assignments
  return classGrade >= 6 && classGrade <= 10;
};

export const MASTER_STUDENTS_DB: MasterStudent[] = [
  {
    admissionNo: 'ADM-2417',
    name: 'Anjali R. Pillai',
    classGrade: 9,
    division: 'B',
    house: 'VEGA',
    category: 'CAT-III',
  },
  {
    admissionNo: 'ADM-1902',
    name: 'Arya S. Kumar',
    classGrade: 8,
    division: 'A',
    house: 'ORION',
    category: 'CAT-II',
  },
  {
    admissionNo: 'ADM-3104',
    name: 'Keerthana M. Nair',
    classGrade: 10,
    division: 'C',
    house: 'NOVA',
    category: 'CAT-III',
  },
  {
    admissionNo: 'ADM-1120',
    name: 'Gautham S. Nair',
    classGrade: 12,
    division: 'A',
    house: null, // Sr. Secondary -> No House
    category: 'CAT-IV',
  },
  {
    admissionNo: 'ADM-4012',
    name: 'Diya Rajesh',
    classGrade: 4,
    division: 'B',
    house: null, // Primary -> No House
    category: 'CAT-I',
  },
  {
    admissionNo: 'ADM-2890',
    name: 'Devika P. Pillai',
    classGrade: 7,
    division: 'A',
    house: 'ASTRA',
    category: 'CAT-II',
  },
  {
    admissionNo: 'ADM-1560',
    name: 'Rohan V. Varma',
    classGrade: 11,
    division: 'C',
    house: null,
    category: 'CAT-IV',
  },
  {
    admissionNo: 'ADM-3891',
    name: 'Abhinav Krishna',
    classGrade: 3,
    division: 'A',
    house: null,
    category: 'CAT-I',
  },
];

// Fuzzy matching to match OCR names against Master Student DB
export const matchMasterStudent = (ocrName: string): MasterStudent | null => {
  if (!ocrName) return null;
  const cleanName = ocrName.toLowerCase().trim();
  return (
    MASTER_STUDENTS_DB.find((s) => s.name.toLowerCase().includes(cleanName) || cleanName.includes(s.name.toLowerCase().split(' ')[0])) || null
  );
};
