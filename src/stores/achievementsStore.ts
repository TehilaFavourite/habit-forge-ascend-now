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
  activityType: string; // What activity this tracks (e.g., "exercise_sessions", "books_read", "code_commits")
  unit: string; // Unit of measurement (e.g., "sessions", "books", "commits", "hours")
  createdAt: string;
  isCustom: boolean;
}

export interface UserAchievement {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface ActivityTracker {
  id: string;
  achievementId: string;
  activityType: string;
  name: string;
  description: string;
  unit: string;
  currentCount: number;
  targetCount: number;
  category: string;
  icon: string;
}

interface AchievementsState {
  achievements: Record<string, Achievement[]>; // userId -> Achievement[]
  userAchievements: Record<string, UserAchievement[]>; // userId -> UserAchievement[]
  activityTrackers: Record<string, ActivityTracker[]>; // userId -> ActivityTracker[]
  
  // Achievement methods
  getUserAchievements: (userId: string) => Achievement[];
  addAchievement: (userId: string, achievement: Omit<Achievement, 'id' | 'createdAt' | 'isCustom'>) => void;
  updateAchievement: (userId: string, achievementId: string, updates: Partial<Achievement>) => void;
  deleteAchievement: (userId: string, achievementId: string) => void;
  
  // Progress tracking methods
  getAchievementProgress: (userId: string) => UserAchievement[];
  updateAchievementProgress: (userId: string, achievementId: string, progress: number) => void;
  
  // Activity tracker methods
  getActivityTrackers: (userId: string) => ActivityTracker[];
  updateActivityProgress: (userId: string, activityType: string, increment?: number) => void;
  
  // Initialization
  initializeUserData: (userId: string) => void;
  initialize: () => void;
}

export const useAchievementsStore = create<AchievementsState>()(
  persist(
    (set, get) => ({
      achievements: {},
      userAchievements: {},
      activityTrackers: {},

      getUserAchievements: (userId: string) => {
        const { achievements } = get();
        return achievements[userId] || [];
      },

      addAchievement: (userId: string, achievement: Omit<Achievement, 'id' | 'createdAt' | 'isCustom'>) => {
        const newAchievement: Achievement = {
          ...achievement,
          id: `achievement-${userId}-${Date.now()}`,
          createdAt: new Date().toISOString(),
          isCustom: true,
        };

        // Create corresponding activity tracker
        const newActivityTracker: ActivityTracker = {
          id: `tracker-${userId}-${Date.now()}`,
          achievementId: newAchievement.id,
          activityType: achievement.activityType,
          name: achievement.name,
          description: `Track progress for: ${achievement.description}`,
          unit: achievement.unit,
          currentCount: 0,
          targetCount: achievement.requirement,
          category: achievement.category,
          icon: achievement.icon,
        };

        set((state) => ({
          achievements: {
            ...state.achievements,
            [userId]: [...(state.achievements[userId] || []), newAchievement],
          },
          userAchievements: {
            ...state.userAchievements,
            [userId]: [
              ...(state.userAchievements[userId] || []),
              {
                achievementId: newAchievement.id,
                progress: 0,
                unlocked: false,
              },
            ],
          },
          activityTrackers: {
            ...state.activityTrackers,
            [userId]: [...(state.activityTrackers[userId] || []), newActivityTracker],
          },
        }));
      },

      updateAchievement: (userId: string, achievementId: string, updates: Partial<Achievement>) => {
        set((state) => ({
          achievements: {
            ...state.achievements,
            [userId]: (state.achievements[userId] || []).map(a => 
              a.id === achievementId ? { ...a, ...updates } : a
            ),
          },
          // Update corresponding activity tracker
          activityTrackers: {
            ...state.activityTrackers,
            [userId]: (state.activityTrackers[userId] || []).map(tracker => 
              tracker.achievementId === achievementId 
                ? { 
                    ...tracker, 
                    name: updates.name || tracker.name,
                    description: updates.description ? `Track progress for: ${updates.description}` : tracker.description,
                    unit: updates.unit || tracker.unit,
                    targetCount: updates.requirement || tracker.targetCount,
                    category: updates.category || tracker.category,
                    icon: updates.icon || tracker.icon,
                    activityType: updates.activityType || tracker.activityType,
                  }
                : tracker
            ),
          },
        }));
      },

      deleteAchievement: (userId: string, achievementId: string) => {
        set((state) => ({
          achievements: {
            ...state.achievements,
            [userId]: (state.achievements[userId] || []).filter(a => a.id !== achievementId),
          },
          userAchievements: {
            ...state.userAchievements,
            [userId]: (state.userAchievements[userId] || []).filter(ua => ua.achievementId !== achievementId),
          },
          activityTrackers: {
            ...state.activityTrackers,
            [userId]: (state.activityTrackers[userId] || []).filter(tracker => tracker.achievementId !== achievementId),
          },
        }));
      },

      getAchievementProgress: (userId: string) => {
        const { userAchievements } = get();
        return userAchievements[userId] || [];
      },

      updateAchievementProgress: (userId: string, achievementId: string, progress: number) => {
        const { achievements, userAchievements } = get();
        const userAchievementsList = userAchievements[userId] || [];
        const userAchievementList = achievements[userId] || [];
        
        const achievementIndex = userAchievementsList.findIndex(ua => ua.achievementId === achievementId);
        const achievement = userAchievementList.find(a => a.id === achievementId);
        
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

      getActivityTrackers: (userId: string) => {
        const { activityTrackers } = get();
        return activityTrackers[userId] || [];
      },

      updateActivityProgress: (userId: string, activityType: string, increment = 1) => {
        const { activityTrackers } = get();
        const userTrackers = activityTrackers[userId] || [];
        
        // Find the tracker for this activity type
        const trackerIndex = userTrackers.findIndex(tracker => tracker.activityType === activityType);
        
        if (trackerIndex !== -1) {
          const updatedTrackers = [...userTrackers];
          const tracker = updatedTrackers[trackerIndex];
          
          updatedTrackers[trackerIndex] = {
            ...tracker,
            currentCount: tracker.currentCount + increment,
          };

          set((state) => ({
            activityTrackers: {
              ...state.activityTrackers,
              [userId]: updatedTrackers,
            },
          }));

          // Update corresponding achievement progress
          get().updateAchievementProgress(userId, tracker.achievementId, tracker.currentCount + increment);
        }
      },

      initializeUserData: (userId: string) => {
        const { achievements, userAchievements, activityTrackers } = get();
        
        // Only initialize if user doesn't have data yet
        if (!achievements[userId]) {
          set((state) => ({
            achievements: {
              ...state.achievements,
              [userId]: [],
            },
            userAchievements: {
              ...state.userAchievements,
              [userId]: [],
            },
            activityTrackers: {
              ...state.activityTrackers,
              [userId]: [],
            },
          }));
        }
      },

      initialize: () => {
        // Initialize with default user for now
        const defaultUserId = "default-user";
        get().initializeUserData(defaultUserId);
      },
    }),
    {
      name: 'achievements-storage',
    }
  )
);
