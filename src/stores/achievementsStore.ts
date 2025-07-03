
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: number;
  xpReward: number;
}

export interface UserAchievement {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementsState {
  achievements: Achievement[];
  userAchievements: Record<string, UserAchievement[]>; // userId -> UserAchievement[]
  initializeDefaultAchievements: (userId: string) => void;
  updateAchievementProgress: (userId: string, achievementId: string, progress: number) => void;
  getUserAchievements: (userId: string) => UserAchievement[];
}

const defaultAchievements: Achievement[] = [
  // Consistency Achievements
  { id: 'fire-starter', name: 'Fire Starter', description: '7-day coding streak', icon: '🔥', category: 'consistency', requirement: 7, xpReward: 50 },
  { id: 'rising-star', name: 'Rising Star', description: '30-day coding streak', icon: '⭐', category: 'consistency', requirement: 30, xpReward: 200 },
  { id: 'lightning', name: 'Lightning', description: '90-day coding streak', icon: '⚡', category: 'consistency', requirement: 90, xpReward: 500 },
  { id: 'unstoppable', name: 'Unstoppable', description: '180-day coding streak', icon: '🚀', category: 'consistency', requirement: 180, xpReward: 1000 },
  { id: 'legend', name: 'Legend', description: '365-day coding streak', icon: '👑', category: 'consistency', requirement: 365, xpReward: 2000 },

  // Learning Achievements
  { id: 'bookworm', name: 'Bookworm', description: 'Read 50 technical articles', icon: '📚', category: 'learning', requirement: 50, xpReward: 300 },
  { id: 'deep-thinker', name: 'Deep Thinker', description: 'Complete 10 research paper implementations', icon: '🧠', category: 'learning', requirement: 10, xpReward: 800 },
  { id: 'scholar', name: 'Scholar', description: 'Finish 5 online courses', icon: '🎓', category: 'learning', requirement: 5, xpReward: 400 },
  { id: 'researcher', name: 'Researcher', description: 'Publish original research', icon: '🔬', category: 'learning', requirement: 1, xpReward: 1500 },
  { id: 'author', name: 'Author', description: 'Write 25 blog posts', icon: '✍️', category: 'learning', requirement: 25, xpReward: 600 },

  // Coding Achievements
  { id: 'code-warrior', name: 'Code Warrior', description: '1000 lines of Rust code', icon: '⚔️', category: 'coding', requirement: 1000, xpReward: 400 },
  { id: 'architect', name: 'Architect', description: 'Build 10 complete projects', icon: '🏗️', category: 'coding', requirement: 10, xpReward: 800 },
  { id: 'bug-hunter', name: 'Bug Hunter', description: 'Find 50 bugs in your own code', icon: '🐛', category: 'coding', requirement: 50, xpReward: 300 },
  { id: 'test-master', name: 'Test Master', description: 'Write 1000 unit tests', icon: '🧪', category: 'coding', requirement: 1000, xpReward: 500 },
  { id: 'deployer', name: 'Deployer', description: 'Deploy 10 projects to production', icon: '🚀', category: 'coding', requirement: 10, xpReward: 600 },

  // Security Achievements
  { id: 'guardian', name: 'Guardian', description: 'Complete 50 security challenges', icon: '🛡️', category: 'security', requirement: 50, xpReward: 400 },
  { id: 'detective', name: 'Detective', description: 'Find 10 security vulnerabilities', icon: '🕵️', category: 'security', requirement: 10, xpReward: 800 },
  { id: 'champion', name: 'Champion', description: 'Win security CTF competition', icon: '🏆', category: 'security', requirement: 1, xpReward: 1000 },
  { id: 'auditor', name: 'Auditor', description: 'Complete 5 professional audits', icon: '📋', category: 'security', requirement: 5, xpReward: 1200 },
  { id: 'whistleblower', name: 'Whistleblower', description: 'Responsibly disclose critical vulnerability', icon: '🚨', category: 'security', requirement: 1, xpReward: 2000 },

  // Technical Mastery
  { id: 'rust-basics', name: 'Rust Basics', description: 'Master Rust fundamentals', icon: '🦀', category: 'technical', requirement: 1, xpReward: 200 },
  { id: 'memory-master', name: 'Memory Master', description: 'Implement custom memory allocator', icon: '💾', category: 'technical', requirement: 1, xpReward: 800 },
  { id: 'async-architect', name: 'Async Architect', description: 'Build concurrent application', icon: '⚡', category: 'technical', requirement: 1, xpReward: 600 },
  { id: 'crypto-craftsman', name: 'Crypto Craftsman', description: 'Implement cryptographic algorithm', icon: '🔐', category: 'technical', requirement: 1, xpReward: 1000 },
  { id: 'contract-auditor', name: 'Contract Auditor', description: 'Find first smart contract vulnerability', icon: '🔍', category: 'technical', requirement: 1, xpReward: 1200 },

  // Community Contribution
  { id: 'helper', name: 'Helper', description: 'Answer 10 questions in forums', icon: '🤝', category: 'community', requirement: 10, xpReward: 200 },
  { id: 'mentor', name: 'Mentor', description: 'Guide 10 junior developers', icon: '👨‍🏫', category: 'community', requirement: 10, xpReward: 800 },
  { id: 'speaker', name: 'Speaker', description: 'Give 5 presentations', icon: '🎤', category: 'community', requirement: 5, xpReward: 600 },
  { id: 'connector', name: 'Connector', description: 'Make 50 professional connections', icon: '🌐', category: 'community', requirement: 50, xpReward: 400 },
  { id: 'influencer', name: 'Influencer', description: 'Gain 1000 followers', icon: '📢', category: 'community', requirement: 1000, xpReward: 1000 },

  // Character Development
  { id: 'streak-keeper', name: 'Streak Keeper', description: 'Maintain 30-day practice streak', icon: '📅', category: 'character', requirement: 30, xpReward: 300 },
  { id: 'comeback-king', name: 'Comeback King', description: 'Rebuild momentum after setback', icon: '💪', category: 'character', requirement: 1, xpReward: 500 },
  { id: 'discipline-demon', name: 'Discipline Demon', description: '100 early morning sessions', icon: '🌅', category: 'character', requirement: 100, xpReward: 600 },
  { id: 'focus-fortress', name: 'Focus Fortress', description: '50 distraction-free sessions', icon: '🎯', category: 'character', requirement: 50, xpReward: 400 },
  { id: 'growth-mindset', name: 'Growth Mindset', description: 'Document 25 failures and lessons', icon: '📈', category: 'character', requirement: 25, xpReward: 500 },
];

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: defaultAchievements,
      userAchievements: {},

      initializeDefaultAchievements: (userId: string) => {
        const { userAchievements } = get();
        
        if (!userAchievements[userId]) {
          const newUserAchievements = defaultAchievements.map(achievement => ({
            achievementId: achievement.id,
            progress: 0,
            unlocked: false,
          }));

          set((state) => ({
            userAchievements: {
              ...state.userAchievements,
              [userId]: newUserAchievements,
            },
          }));
        }
      },

      updateAchievementProgress: (userId: string, achievementId: string, progress: number) => {
        const { userAchievements, achievements } = get();
        const userAchievementsList = userAchievements[userId] || [];
        
        const achievementIndex = userAchievementsList.findIndex(ua => ua.achievementId === achievementId);
        const achievement = achievements.find(a => a.id === achievementId);
        
        if (achievementIndex !== -1 && achievement) {
          const updatedUserAchievements = [...userAchievementsList];
          const currentAchievement = updatedUserAchievements[achievementIndex];
          
          updatedUserAchievements[achievementIndex] = {
            ...currentAchievement,
            progress: Math.max(currentAchievement.progress, progress),
            unlocked: progress >= achievement.requirement || currentAchievement.unlocked,
            unlockedAt: (progress >= achievement.requirement && !currentAchievement.unlocked) 
              ? new Date().toISOString() 
              : currentAchievement.unlockedAt,
          };

          set((state) => ({
            userAchievements: {
              ...state.userAchievements,
              [userId]: updatedUserAchievements,
            },
          }));
        }
      },

      getUserAchievements: (userId: string) => {
        const { userAchievements } = get();
        return userAchievements[userId] || [];
      },
    }),
    {
      name: 'achievements-storage',
    }
  )
);
