
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface XPActivity {
  id: string;
  name: string;
  xp: number;
  type: 'core' | 'bonus';
  category: string;
  userId: string;
  linkedToHabit?: string; // Habit ID if linked
  linkedToTodo?: string; // Todo category if linked
  dailyCap?: number; // For core activities
  createdAt: string;
}

export interface DailyXPCompletion {
  activityId: string;
  date: string;
  xpEarned: number;
  completedAt: string;
}

interface XPState {
  activities: XPActivity[];
  completions: DailyXPCompletion[];
  lastResetDate: string;
  checkAndResetDaily: () => void;
  addActivity: (activity: Omit<XPActivity, 'id' | 'createdAt'>) => void;
  updateActivity: (id: string, updates: Partial<XPActivity>) => void;
  deleteActivity: (id: string) => void;
  completeActivity: (activityId: string, date: string, xpEarned: number) => void;
  getActivitiesForUser: (userId: string) => XPActivity[];
  getCompletionsForDate: (date: string, userId: string) => DailyXPCompletion[];
  getTotalXPForDate: (date: string, userId: string) => number;
  getTotalXPForUser: (userId: string) => number;
  getStreakForActivity: (activityId: string) => number;
  generateActivities: (activities: Array<{name: string, xp: number, type: 'core' | 'bonus', category: string}>) => void;
}

export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      activities: [],
      completions: [],
      lastResetDate: new Date().toDateString(),

      checkAndResetDaily: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastResetDate !== today) {
          // Reset daily completions but keep activities
          const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
          set({
            lastResetDate: today,
          });
        }
      },
      
      addActivity: (activityData) => {
        const newActivity: XPActivity = {
          ...activityData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        
        set(state => ({
          activities: [...state.activities, newActivity]
        }));
      },
      
      updateActivity: (id, updates) => {
        set(state => ({
          activities: state.activities.map(activity => 
            activity.id === id ? { ...activity, ...updates } : activity
          )
        }));
      },
      
      deleteActivity: (id) => {
        set(state => ({
          activities: state.activities.filter(activity => activity.id !== id),
          completions: state.completions.filter(completion => completion.activityId !== id)
        }));
      },
      
      completeActivity: (activityId, date, xpEarned) => {
        const completion: DailyXPCompletion = {
          activityId,
          date,
          xpEarned,
          completedAt: new Date().toISOString(),
        };
        
        set(state => ({
          completions: [...state.completions, completion]
        }));
      },
      
      getActivitiesForUser: (userId) => {
        return get().activities.filter(activity => activity.userId === userId);
      },
      
      getCompletionsForDate: (date, userId) => {
        const userActivities = get().getActivitiesForUser(userId);
        const activityIds = userActivities.map(a => a.id);
        return get().completions.filter(completion => 
          completion.date === date && activityIds.includes(completion.activityId)
        );
      },
      
      getTotalXPForDate: (date, userId) => {
        const completions = get().getCompletionsForDate(date, userId);
        return completions.reduce((total, completion) => total + completion.xpEarned, 0);
      },
      
      getTotalXPForUser: (userId) => {
        const userActivities = get().getActivitiesForUser(userId);
        const activityIds = userActivities.map(a => a.id);
        return get().completions
          .filter(completion => activityIds.includes(completion.activityId))
          .reduce((total, completion) => total + completion.xpEarned, 0);
      },
      
      getStreakForActivity: (activityId) => {
        const completions = get().completions
          .filter(c => c.activityId === activityId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (completions.length === 0) return 0;
        
        let streak = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = new Date();
        
        for (let i = 0; i < 365; i++) {
          const dateStr = checkDate.toISOString().split('T')[0];
          const hasCompletion = completions.some(c => c.date === dateStr);
          
          if (hasCompletion) {
            streak++;
          } else if (dateStr !== today) {
            break;
          }
          
          checkDate.setDate(checkDate.getDate() - 1);
        }
        
        return streak;
      },
      
      generateActivities: (activities) => {
        const userId = "default-user"; // Use default user for now
        const newActivities = activities.map(activity => ({
          ...activity,
          id: `xp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          createdAt: new Date().toISOString(),
        }));
        
        set(state => ({
          activities: [...state.activities, ...newActivities]
        }));
      },
    }),
    {
      name: 'xp-storage',
    }
  )
);
