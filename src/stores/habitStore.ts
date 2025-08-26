import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAchievementsStore } from "./achievementsStore";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  userId: string;
  frequency: "daily" | "weekly" | "custom";
  goal: number;
  currentStreak: number;
  bestStreak: number;
  completions: Record<string, boolean>; // date string -> completed
  createdAt: string;
  isCore: boolean; // for day mastery tracking
  description?: string;
}

interface HabitState {
  habits: Habit[];
  lastResetDate: string;
  checkAndResetDaily: () => void;
  addHabit: (
    habit: Omit<
      Habit,
      "id" | "createdAt" | "currentStreak" | "bestStreak" | "completions"
    >
  ) => void;
  updateHabit: (id: string, updates: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  completeHabit: (id: string, date: string) => void;
  uncompleteHabit: (id: string, date: string) => void;
  getUserHabits: (userId: string) => Habit[];
  calculateStreaks: (habit: Habit) => { current: number; best: number };
  updateAchievementProgress: (
    userId: string,
    habitId: string,
    streak: number
  ) => void;
  generateHabits: (habits: Array<{
    title: string;
    description: string;
    streak: number;
    reminders: any[];
  }>) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      lastResetDate: new Date().toDateString(),

      // Check and reset daily progress at midnight
      checkAndResetDaily: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastResetDate !== today) {
          // Reset daily progress but keep streaks
          set({
            lastResetDate: today,
          });
        }
      },

      addHabit: (habitData) => {
        const newHabit: Habit = {
          ...habitData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          currentStreak: 0,
          bestStreak: 0,
          completions: {},
        };

        set((state) => ({
          habits: [...state.habits, newHabit],
        }));
      },

      updateHabit: (id, updates) => {
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id ? { ...habit, ...updates } : habit
          ),
        }));
      },

      deleteHabit: (id) => {
        set((state) => ({
          habits: state.habits.filter((habit) => habit.id !== id),
        }));
      },

      completeHabit: (id, date) => {
        set((state) => {
          const updatedHabits = state.habits.map((habit) => {
            if (habit.id === id) {
              const updatedCompletions = { ...habit.completions, [date]: true };
              const updatedHabit = {
                ...habit,
                completions: updatedCompletions,
              };
              const streaks = get().calculateStreaks(updatedHabit);

              // Update achievement progress
              get().updateAchievementProgress(
                habit.userId,
                habit.id,
                streaks.current
              );

              return {
                ...updatedHabit,
                currentStreak: streaks.current,
                bestStreak: Math.max(streaks.best, habit.bestStreak),
              };
            }
            return habit;
          });

          return { habits: updatedHabits };
        });
      },

      uncompleteHabit: (id, date) => {
        set((state) => {
          const updatedHabits = state.habits.map((habit) => {
            if (habit.id === id) {
              const updatedCompletions = { ...habit.completions };
              delete updatedCompletions[date];
              const updatedHabit = {
                ...habit,
                completions: updatedCompletions,
              };
              const streaks = get().calculateStreaks(updatedHabit);
              return {
                ...updatedHabit,
                currentStreak: streaks.current,
                bestStreak: streaks.best,
              };
            }
            return habit;
          });

          return { habits: updatedHabits };
        });
      },

      getUserHabits: (userId) => {
        return get().habits.filter((habit) => habit.userId === userId);
      },

      updateAchievementProgress: (userId, habitId, streak) => {
        // This will be called by the achievements store
        const updateAchievementProgress =
          useAchievementsStore.getState().updateAchievementProgress;

        // Update streak-based achievements
        const streakAchievements = [
          { id: "fire-starter", requirement: 7 },
          { id: "rising-star", requirement: 30 },
          { id: "lightning", requirement: 90 },
          { id: "unstoppable", requirement: 180 },
          { id: "legend", requirement: 365 },
        ];

        streakAchievements.forEach((achievement) => {
          if (streak >= achievement.requirement) {
            updateAchievementProgress(
              userId,
              achievement.id,
              achievement.requirement
            );
          } else {
            updateAchievementProgress(
              userId,
              achievement.id,
              streak
            );
          }
        });
      },

      generateHabits: (habits) => {
        // Get current user ID from auth store
        const currentUserId = "default-user"; // Fallback for now
        
        const newHabits = habits.map((habit, index) => ({
          id: (Date.now() + index).toString(),
          name: habit.title,
          icon: "🎯",
          color: "#8B5CF6",
          userId: currentUserId,
          frequency: "daily" as const,
          goal: 1,
          currentStreak: habit.streak || 0,
          bestStreak: habit.streak || 0,
          completions: {},
          createdAt: new Date().toISOString(),
          isCore: true,
          description: habit.description,
        }));

        set((state) => ({
          habits: [...state.habits, ...newHabits],
        }));
      },

      calculateStreaks: (habit) => {
        const dates = Object.keys(habit.completions)
          .filter((date) => habit.completions[date])
          .sort()
          .reverse();

        if (dates.length === 0) return { current: 0, best: 0 };

        let currentStreak = 0;
        let bestStreak = 0;
        let tempStreak = 0;

        const today = new Date().toISOString().split("T")[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

        // Calculate current streak
        let checkDate = new Date();
        for (let i = 0; i < 365; i++) {
          // Check up to a year back
          const dateStr = checkDate.toISOString().split("T")[0];
          if (habit.completions[dateStr]) {
            currentStreak++;
          } else if (dateStr !== today) {
            // If we hit a day that's not completed and it's not today, break
            break;
          }
          checkDate.setDate(checkDate.getDate() - 1);
        }

        // Calculate best streak
        dates.forEach((date, index) => {
          if (index === 0) {
            tempStreak = 1;
          } else {
            const currentDate = new Date(date);
            const previousDate = new Date(dates[index - 1]);
            const dayDiff =
              Math.abs(currentDate.getTime() - previousDate.getTime()) /
              (1000 * 60 * 60 * 24);

            if (dayDiff === 1) {
              tempStreak++;
            } else {
              bestStreak = Math.max(bestStreak, tempStreak);
              tempStreak = 1;
            }
          }
        });
        bestStreak = Math.max(bestStreak, tempStreak);

        return { current: currentStreak, best: bestStreak };
      },
    }),
    {
      name: "habit-storage",
    }
  )
);
