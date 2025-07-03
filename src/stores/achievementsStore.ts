
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'consistency' | 'learning' | 'coding' | 'security' | 'technical' | 'community' | 'character';
  icon: string;
  requirement: number;
  currentProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  linkedToHabit?: string;
  linkedToActivity?: string;
  trackingType: 'streak' | 'count' | 'custom';
}

export interface UserAchievement {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementsState {
  achievements: Achievement[];
  userAchievements: Record<string, UserAchievement>; // userId -> UserAchievement[]
  initializeDefaultAchievements: (userId: string) => void;
  updateAchievementProgress: (userId: string, achievementId: string, progress: number, requirement: number) => void;
  unlockAchievement: (id: string) => void;
  getAchievementsByCategory: (category: string) => Achievement[];
  getUnlockedAchievements: () => Achievement[];
  getUserAchievements: (userId: string) => UserAchievement[];
  getAchievementProgress: (id: string) => { current: number; required: number; percentage: number };
}

const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'currentProgress' | 'unlocked' | 'unlockedAt'>[] = [
  // Consistency Achievements
  { id: 'fire-starter', name: 'Fire Starter', description: '7-day coding streak', category: 'consistency', icon: '🔥', requirement: 7, trackingType: 'streak' },
  { id: 'rising-star', name: 'Rising Star', description: '30-day coding streak', category: 'consistency', icon: '⭐', requirement: 30, trackingType: 'streak' },
  { id: 'lightning', name: 'Lightning', description: '90-day coding streak', category: 'consistency', icon: '⚡', requirement: 90, trackingType: 'streak' },
  { id: 'unstoppable', name: 'Unstoppable', description: '180-day coding streak', category: 'consistency', icon: '💪', requirement: 180, trackingType: 'streak' },
  { id: 'legend', name: 'Legend', description: '365-day coding streak', category: 'consistency', icon: '👑', requirement: 365, trackingType: 'streak' },
  
  // Learning Achievements
  { id: 'bookworm', name: 'Bookworm', description: 'Read 50 technical articles', category: 'learning', icon: '📚', requirement: 50, trackingType: 'count' },
  { id: 'deep-thinker', name: 'Deep Thinker', description: 'Complete 10 research paper implementations', category: 'learning', icon: '🧠', requirement: 10, trackingType: 'count' },
  { id: 'scholar', name: 'Scholar', description: 'Finish 5 online courses', category: 'learning', icon: '🎓', requirement: 5, trackingType: 'count' },
  { id: 'researcher', name: 'Researcher', description: 'Publish original research', category: 'learning', icon: '🔬', requirement: 1, trackingType: 'count' },
  { id: 'author', name: 'Author', description: 'Write 25 blog posts', category: 'learning', icon: '✍️', requirement: 25, trackingType: 'count' },
  
  // Coding Achievements
  { id: 'code-warrior', name: 'Code Warrior', description: '1000 lines of Rust code', category: 'coding', icon: '⚔️', requirement: 1000, trackingType: 'count' },
  { id: 'architect', name: 'Architect', description: 'Build 10 complete projects', category: 'coding', icon: '🏗️', requirement: 10, trackingType: 'count' },
  { id: 'bug-hunter', name: 'Bug Hunter', description: 'Find 50 bugs in your own code', category: 'coding', icon: '🐛', requirement: 50, trackingType: 'count' },
  { id: 'test-master', name: 'Test Master', description: 'Write 1000 unit tests', category: 'coding', icon: '🧪', requirement: 1000, trackingType: 'count' },
  { id: 'deployer', name: 'Deployer', description: 'Deploy 10 projects to production', category: 'coding', icon: '🚀', requirement: 10, trackingType: 'count' },

  // Security Achievements
  { id: 'guardian', name: 'Guardian', description: 'Complete 50 security challenges', category: 'security', icon: '🛡️', requirement: 50, trackingType: 'count' },
  { id: 'detective', name: 'Detective', description: 'Find 10 security vulnerabilities', category: 'security', icon: '🕵️', requirement: 10, trackingType: 'count' },
  { id: 'champion', name: 'Champion', description: 'Win security CTF competition', category: 'security', icon: '🏆', requirement: 1, trackingType: 'count' },
  { id: 'auditor', name: 'Auditor', description: 'Complete 5 professional audits', category: 'security', icon: '🔍', requirement: 5, trackingType: 'count' },
  { id: 'whistleblower', name: 'Whistleblower', description: 'Responsibly disclose critical vulnerability', category: 'security', icon: '📢', requirement: 1, trackingType: 'count' },

  // Technical Mastery
  { id: 'rust-basics', name: 'Rust Basics', description: 'Rust basics and beginner level', category: 'technical', icon: '🦀', requirement: 1, trackingType: 'count' },
  { id: 'memory-master', name: 'Memory Master', description: 'Implemented custom memory allocator', category: 'technical', icon: '🧠', requirement: 1, trackingType: 'count' },
  { id: 'async-architect', name: 'Async Architect', description: 'Built concurrent application with proper error handling', category: 'technical', icon: '⚡', requirement: 1, trackingType: 'count' },

  // Community Contribution
  { id: 'helper', name: 'Helper', description: 'Answered 10 questions in community forums', category: 'community', icon: '🤝', requirement: 10, trackingType: 'count' },
  { id: 'mentor', name: 'Mentor', description: 'Successfully guided someone through their first project', category: 'community', icon: '👨‍🏫', requirement: 1, trackingType: 'count' },
  { id: 'speaker', name: 'Speaker', description: 'Give 5 presentations', category: 'community', icon: '🎤', requirement: 5, trackingType: 'count' },

  // Character Development
  { id: 'streak-keeper', name: 'Streak Keeper', description: 'Maintained 30-day daily practice streak', category: 'character', icon: '📅', requirement: 30, trackingType: 'streak' },
  { id: 'comeback-king', name: 'Comeback King', description: 'Rebuilt momentum after major setback', category: 'character', icon: '💪', requirement: 1, trackingType: 'count' },
  { id: 'discipline-demon', name: 'Discipline Demon', description: 'Completed 100 early morning sessions', category: 'character', icon: '⏰', requirement: 100, trackingType: 'count' },
];

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: [],
      userAchievements: {},
      
      initializeDefaultAchievements: (userId) => {
        const existingAchievements = get().achievements;
        if (existingAchievements.length === 0) {
          const defaultAchievements = DEFAULT_ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            currentProgress: 0,
            unlocked: false,
          }));
          
          set({ 
            achievements: defaultAchievements,
            userAchievements: {
              ...get().userAchievements,
              [userId]: []
            }
          });
        }
      },
      
      updateAchievementProgress: (userId, achievementId, progress, requirement) => {
        const userAchievements = get().userAchievements[userId] || [];
        const existingIndex = userAchievements.findIndex(ua => ua.achievementId === achievementId);
        
        const shouldUnlock = progress >= requirement;
        const newUserAchievement: UserAchievement = {
          achievementId,
          progress: Math.max(progress, existingIndex >= 0 ? userAchievements[existingIndex].progress : 0),
          unlocked: shouldUnlock,
          unlockedAt: shouldUnlock ? new Date().toISOString() : undefined,
        };

        const updatedUserAchievements = [...userAchievements];
        if (existingIndex >= 0) {
          updatedUserAchievements[existingIndex] = newUserAchievement;
        } else {
          updatedUserAchievements.push(newUserAchievement);
        }

        set(state => ({
          userAchievements: {
            ...state.userAchievements,
            [userId]: updatedUserAchievements
          }
        }));
      },
      
      unlockAchievement: (id) => {
        set(state => ({
          achievements: state.achievements.map(achievement => 
            achievement.id === id 
              ? { ...achievement, unlocked: true, unlockedAt: new Date().toISOString() }
              : achievement
          )
        }));
      },
      
      getAchievementsByCategory: (category) => {
        return get().achievements.filter(achievement => achievement.category === category);
      },
      
      getUnlockedAchievements: () => {
        return get().achievements.filter(achievement => achievement.unlocked);
      },

      getUserAchievements: (userId) => {
        return get().userAchievements[userId] || [];
      },
      
      getAchievementProgress: (id) => {
        const achievement = get().achievements.find(a => a.id === id);
        if (!achievement) return { current: 0, required: 0, percentage: 0 };
        
        return {
          current: achievement.currentProgress,
          required: achievement.requirement,
          percentage: Math.min((achievement.currentProgress / achievement.requirement) * 100, 100),
        };
      },
    }),
    {
      name: 'achievements-storage',
    }
  )
);
