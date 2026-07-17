// ============================================
// MEMBERSHIP LEVELS CONFIGURATION - DARK THEME OPTIMIZED
// ============================================

export interface MembershipLevel {
  id: number;
  name: string;
  color: string;           // Main color
  bgColor: string;         // Background color
  borderColor: string;     // Border color
  textColor: string;       // Text color
  gradient: string;        // Gradient for cards
  badgeBg: string;         // Badge background
  badgeText: string;       // Badge text
  shadow: string;          // Shadow effect
  lightBg: string;         // Light background for tables
  hoverBg: string;         // Hover background
}

export const MEMBERSHIP_LEVELS: Record<number, MembershipLevel> = {
  1: {
    id: 1,
    name: 'Beginner',
    color: '#34d399',           // Emerald-400 (softer)
    bgColor: 'bg-emerald-600',
    borderColor: 'border-emerald-600',
    textColor: 'text-emerald-300',
    gradient: 'from-emerald-600/30 to-emerald-700/20',
    badgeBg: 'bg-emerald-600/30',
    badgeText: 'text-emerald-300',
    shadow: 'shadow-emerald-600/20',
    lightBg: 'bg-emerald-950/40',
    hoverBg: 'hover:bg-emerald-950/60',
  },
  2: {
    id: 2,
    name: 'Bronze',
    color: '#60a5fa',           // Blue-400 (softer)
    bgColor: 'bg-blue-600',
    borderColor: 'border-blue-600',
    textColor: 'text-blue-300',
    gradient: 'from-blue-600/30 to-blue-700/20',
    badgeBg: 'bg-blue-600/30',
    badgeText: 'text-blue-300',
    shadow: 'shadow-blue-600/20',
    lightBg: 'bg-blue-950/40',
    hoverBg: 'hover:bg-blue-950/60',
  },
  3: {
    id: 3,
    name: 'Silver',
    color: '#a78bfa',           // Purple-400 (softer)
    bgColor: 'bg-purple-600',
    borderColor: 'border-purple-600',
    textColor: 'text-purple-300',
    gradient: 'from-purple-600/30 to-purple-700/20',
    badgeBg: 'bg-purple-600/30',
    badgeText: 'text-purple-300',
    shadow: 'shadow-purple-600/20',
    lightBg: 'bg-purple-950/40',
    hoverBg: 'hover:bg-purple-950/60',
  },
  4: {
    id: 4,
    name: 'Gold',
    color: '#fcd34d',           // Yellow-300 (softer)
    bgColor: 'bg-yellow-600',
    borderColor: 'border-yellow-600',
    textColor: 'text-yellow-300',
    gradient: 'from-yellow-600/30 to-yellow-700/20',
    badgeBg: 'bg-yellow-600/30',
    badgeText: 'text-yellow-300',
    shadow: 'shadow-yellow-600/20',
    lightBg: 'bg-yellow-950/40',
    hoverBg: 'hover:bg-yellow-950/60',
  },
  5: {
    id: 5,
    name: 'Platinum',
    color: '#fb923c',           // Orange-400 (softer)
    bgColor: 'bg-orange-600',
    borderColor: 'border-orange-600',
    textColor: 'text-orange-300',
    gradient: 'from-orange-600/30 to-orange-700/20',
    badgeBg: 'bg-orange-600/30',
    badgeText: 'text-orange-300',
    shadow: 'shadow-orange-600/20',
    lightBg: 'bg-orange-950/40',
    hoverBg: 'hover:bg-orange-950/60',
  },
  6: {
    id: 6,
    name: 'Diamond',
    color: '#22d3ee',           // Cyan-400 (softer)
    bgColor: 'bg-cyan-600',
    borderColor: 'border-cyan-600',
    textColor: 'text-cyan-300',
    gradient: 'from-cyan-600/30 to-cyan-700/20',
    badgeBg: 'bg-cyan-600/30',
    badgeText: 'text-cyan-300',
    shadow: 'shadow-cyan-600/20',
    lightBg: 'bg-cyan-950/40',
    hoverBg: 'hover:bg-cyan-950/60',
  },
};

// Helper function to get level by ID
export const getLevel = (id: number): MembershipLevel => {
  return MEMBERSHIP_LEVELS[id] || MEMBERSHIP_LEVELS[1];
};

// Helper function to get level name by ID
export const getLevelName = (id: number): string => {
  return MEMBERSHIP_LEVELS[id]?.name || 'Beginner';
};

// Helper function to get level color by ID
export const getLevelColor = (id: number): string => {
  return MEMBERSHIP_LEVELS[id]?.color || '#34d399';
};

// Helper function to get level badge classes
export const getLevelBadgeClasses = (id: number): string => {
  const level = getLevel(id);
  return `${level.badgeBg} ${level.badgeText} px-3 py-1 rounded-full text-xs font-semibold`;
};

// Helper function to get level card classes
export const getLevelCardClasses = (id: number): string => {
  const level = getLevel(id);
  return `bg-gradient-to-br ${level.gradient} border ${level.borderColor} ${level.shadow}`;
};

// Array of all levels for mapping
export const LEVELS = Object.values(MEMBERSHIP_LEVELS);