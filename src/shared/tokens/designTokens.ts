export const houseColors = {
  NOVA: {
    name: 'NOVA',
    primary: '#EF4444',
    secondary: '#B91C1C',
    lightBg: 'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.25)',
    text: '#DC2626',
    motto: 'Igniting Passion, Commanding Glory',
    symbol: 'Red Flame',
  },
  VEGA: {
    name: 'VEGA',
    primary: '#F59E0B',
    secondary: '#D97706',
    lightBg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.25)',
    text: '#D97706',
    motto: 'Shining Brightest, Soaring Highest',
    symbol: 'Gold Star',
  },
  ORION: {
    name: 'ORION',
    primary: '#3B82F6',
    secondary: '#1D4ED8',
    lightBg: 'rgba(59, 130, 246, 0.08)',
    border: 'rgba(59, 130, 246, 0.25)',
    text: '#2563EB',
    motto: 'Boundless Depth, Unstoppable Spirit',
    symbol: 'Blue Comet',
  },
  ASTRA: {
    name: 'ASTRA',
    primary: '#10B981',
    secondary: '#047857',
    lightBg: 'rgba(16, 185, 129, 0.08)',
    border: 'rgba(16, 185, 129, 0.25)',
    text: '#059669',
    motto: 'Flourishing Virtues, Timeless Excellence',
    symbol: 'Green Shield',
  },
} as const;

export type HouseKey = keyof typeof houseColors;

export const designTokens = {
  colors: {
    bgPaper: '#FAF8F5',
    primaryPink: '#FF5E84',
    secondaryOrange: '#FF8A00',
    accentGold: '#D8A74A',
    textMain: '#111111',
    textMuted: '#5F5F5F',
    house: houseColors,
  },
  typography: {
    fontSerif: "'Cormorant Garamond', serif",
    fontSans: "'Manrope', sans-serif",
    fontMalayalam: "'Noto Serif Malayalam', serif",
  },
  shadows: {
    softEmblem: '0 25px 65px rgba(255, 94, 132, 0.12)',
    glassCard: '0 10px 30px rgba(0, 0, 0, 0.03)',
  },
};
