// ============================================
// MEMBERSHIP LEVELS CONFIGURATION
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
    color: '#22c55e',           // Green
    bgColor: 'bg-emerald-500',
    borderColor: 'border-emerald-500',
    textColor: 'text-emerald-400',
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    badgeBg: 'bg-emerald-500/20',
    badgeText: 'text-emerald-400',
    shadow: 'shadow-emerald-500/20',
    lightBg: 'bg-emerald-50 dark:bg-emerald-950/30',
    hoverBg: 'hover:bg-emerald-50 dark:hover:bg-emerald-950/50',
  },
  2: {
    id: 2,
    name: 'Bronze',
    color: '#3b82f6',           // Blue
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    textColor: 'text-blue-400',
    gradient: 'from-blue-500/20 to-blue-600/10',
    badgeBg: 'bg-blue-500/20',
    badgeText: 'text-blue-400',
    shadow: 'shadow-blue-500/20',
    lightBg: 'bg-blue-50 dark:bg-blue-950/30',
    hoverBg: 'hover:bg-blue-50 dark:hover:bg-blue-950/50',
  },
  3: {
    id: 3,
    name: 'Silver',
    color: '#8b5cf6',           // Purple
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    textColor: 'text-purple-400',
    gradient: 'from-purple-500/20 to-purple-600/10',
    badgeBg: 'bg-purple-500/20',
    badgeText: 'text-purple-400',
    shadow: 'shadow-purple-500/20',
    lightBg: 'bg-purple-50 dark:bg-purple-950/30',
    hoverBg: 'hover:bg-purple-50 dark:hover:bg-purple-950/50',
  },
  4: {
    id: 4,
    name: 'Gold',
    color: '#eab308',           // Gold
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    textColor: 'text-yellow-400',
    gradient: 'from-yellow-500/20 to-yellow-600/10',
    badgeBg: 'bg-yellow-500/20',
    badgeText: 'text-yellow-400',
    shadow: 'shadow-yellow-500/20',
    lightBg: 'bg-yellow-50 dark:bg-yellow-950/30',
    hoverBg: 'hover:bg-yellow-50 dark:hover:bg-yellow-950/50',
  },
  5: {
    id: 5,
    name: 'Platinum',
    color: '#f97316',           // Orange
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    textColor: 'text-orange-400',
    gradient: 'from-orange-500/20 to-orange-600/10',
    badgeBg: 'bg-orange-500/20',
    badgeText: 'text-orange-400',
    shadow: 'shadow-orange-500/20',
    lightBg: 'bg-orange-50 dark:bg-orange-950/30',
    hoverBg: 'hover:bg-orange-50 dark:hover:bg-orange-950/50',
  },
  6: {
    id: 6,
    name: 'Diamond',
    color: '#06b6d4',           // Crystal Blue
    bgColor: 'bg-cyan-500',
    borderColor: 'border-cyan-500',
    textColor: 'text-cyan-400',
    gradient: 'from-cyan-500/20 to-cyan-600/10',
    badgeBg: 'bg-cyan-500/20',
    badgeText: 'text-cyan-400',
    shadow: 'shadow-cyan-500/20',
    lightBg: 'bg-cyan-50 dark:bg-cyan-950/30',
    hoverBg: 'hover:bg-cyan-50 dark:hover:bg-cyan-950/50',
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
  return MEMBERSHIP_LEVELS[id]?.color || '#22c55e';
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