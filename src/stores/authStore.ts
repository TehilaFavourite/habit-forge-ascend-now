import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  email: string;
  password?: string; // Optional since we don't store it in app state
  level: number;
  xp: number;
  totalXp: number;
  joinedAt: string;
  onboardingComplete: boolean;
  focusAreas: string[];
  primaryGoal: string;
  experienceLevel: string;
  timeCommitment: string;
  preferences: Record<string, any>;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>; // <-- update here
  logout: () => void;
  checkAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
  setOnboardingCompleted: (completed: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (username: string, password: string) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Check if user exists in localStorage
        const users = JSON.parse(
          localStorage.getItem("habit_app_users") || "[]"
        );
        const existingUser = users.find((u: any) => u.username === username);

        if (existingUser && existingUser.password === password) {
          const { password: _, ...userWithoutPassword } = existingUser;
          set({ user: userWithoutPassword, isAuthenticated: true });
          return true;
        }

        return false;
      },

      register: async (username: string, email: string, password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const users = JSON.parse(
          localStorage.getItem("habit_app_users") || "[]"
        );

        // Check if username or email already exists
        if (users.some((u: any) => u.username === username)) {
          return { success: false, error: "username" };
        }
        if (users.some((u: any) => u.email === email)) {
          return { success: false, error: "email" };
        }

        const newUser = {
          id: Date.now().toString(),
          username,
          email,
          password,
          level: 1,
          xp: 0,
          totalXp: 0,
          joinedAt: new Date().toISOString(),
          onboardingComplete: false,
          focusAreas: [],
          primaryGoal: "",
          experienceLevel: "",
          timeCommitment: "",
          preferences: {},
        };

        users.push(newUser);
        localStorage.setItem("habit_app_users", JSON.stringify(users));
        const { password: _, ...userWithoutPassword } = newUser;
        set({
          user: userWithoutPassword,
          isAuthenticated: true,
        });
        return { success: true };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      checkAuth: () => {
        const state = get();
        if (state.user) {
          set({ isAuthenticated: true });
        }
      },

      updateUser: (updates: Partial<User>) => {
        const state = get();
        if (state.user) {
          const updatedUser = { ...state.user, ...updates };
          set({ user: updatedUser });

          // Update in localStorage
          const users = JSON.parse(
            localStorage.getItem("habit_app_users") || "[]"
          );
          const userIndex = users.findIndex(
            (u: any) => u.id === state.user?.id
          );
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], ...updates };
            localStorage.setItem("habit_app_users", JSON.stringify(users));
          }
        }
      },

      setOnboardingCompleted: (completed: boolean) => {
        const state = get();
        if (state.user) {
          const updatedUser = { ...state.user, onboardingComplete: completed };
          set({ user: updatedUser });

          // Update in localStorage
          const users = JSON.parse(
            localStorage.getItem("habit_app_users") || "[]"
          );
          const userIndex = users.findIndex(
            (u: any) => u.id === state.user?.id
          );
          if (userIndex !== -1) {
            users[userIndex] = { ...users[userIndex], onboardingComplete: completed };
            localStorage.setItem("habit_app_users", JSON.stringify(users));
          }
        }
      },
    }),
    {
      name: "habit-auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
