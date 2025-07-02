
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

interface AchievementsState {
  achievements: Achievement[];
  initializeDefaultAchievements: (userId: string) => void;
  updateProgress: (id: string, progress: number) => void;
  unlockAchievement: (id: string) => void;
  getAchievementsByCategory: (category: string) => Achievement[];
  getUnlockedAchievements: () => Achievement[];
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
  { id: 'code-warrior', name: 'Code Warrior', description: '1000 lines of code', category: 'coding', icon: '⚔️', requirement: 1000, trackingType: 'count' },
  { id: 'architect', name: 'Architect', description: 'Build 10 complete projects', category: 'coding', icon: '🏗️', requirement: 10, trackingType: 'count' },
  { id: 'bug-hunter', name: 'Bug Hunter', description: 'Find 50 bugs in your own code', category: 'coding', icon: '🐛', requirement: 50, trackingType: 'count' },
  { id: 'test-master', name: 'Test Master', description: 'Write 1000 unit tests', category: 'coding', icon: '🧪', requirement: 1000, trackingType: 'count' },
  { id: 'deployer', name: 'Deployer', description: 'Deploy 10 projects to production', category: 'coding', icon: '🚀', requirement: 10, trackingType: 'count' },
];

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: [],
      
      initializeDefaultAchievements: (userId) => {
        const existingAchievements = get().achievements;
        if (existingAchievements.length === 0) {
          const defaultAchievements = DEFAULT_ACHIEVEMENTS.map(achievement => ({
            ...achievement,
            currentProgress: 0,
            unlocked: false,
          }));
          
          set({ achievements: defaultAchievements });
        }
      },
      
      updateProgress: (id, progress) => {
        set(state => ({
          achievements: state.achievements.map(achievement => {
            if (achievement.id === id) {
              const newProgress = Math.max(achievement.currentProgress, progress);
              const shouldUnlock = newProgress >= achievement.requirement && !achievement.unlocked;
              
              return {
                ...achievement,
                currentProgress: newProgress,
                unlocked: shouldUnlock ? true : achievement.unlocked,
                unlockedAt: shouldUnlock ? new Date().toISOString() : achievement.unlockedAt,
              };
            }
            return achievement;
          })
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
