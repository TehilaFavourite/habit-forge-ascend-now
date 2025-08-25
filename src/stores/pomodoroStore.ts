import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type TimerMode = "work" | "shortBreak" | "longBreak";

interface PomodoroState {
  // Timer state
  isRunning: boolean;
  timeLeft: number;
  mode: TimerMode;
  session: number;
  completedSessions: number;
  
  // Settings
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsUntilLongBreak: number;
  tickingEnabled: boolean;
  
  // Sound state
  selectedSound: string;
  soundPlaying: boolean;
  soundVolume: number;
  
  // Actions
  setIsRunning: (running: boolean) => void;
  setTimeLeft: (time: number | ((prev: number) => number)) => void;
  setMode: (mode: TimerMode) => void;
  setSession: (session: number) => void;
  setCompletedSessions: (sessions: number) => void;
  setWorkDuration: (duration: number) => void;
  setShortBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setSessionsUntilLongBreak: (sessions: number) => void;
  setTickingEnabled: (enabled: boolean) => void;
  setSelectedSound: (sound: string) => void;
  setSoundPlaying: (playing: boolean) => void;
  setSoundVolume: (volume: number) => void;
  
  // Utility actions
  getDurationForMode: (mode: TimerMode) => number;
  resetTimer: () => void;
  pauseTimer: () => void;
  startTimer: () => void;
  completeSession: () => void;
}

export const usePomodoroStore = create<PomodoroState>()(
  persist(
    (set, get) => ({
      // Initial state
      isRunning: false,
      timeLeft: 25 * 60,
      mode: "work",
      session: 1,
      completedSessions: 0,
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      sessionsUntilLongBreak: 4,
      tickingEnabled: false,
      selectedSound: "none",
      soundPlaying: false,
      soundVolume: 50,
      
      // Setters
      setIsRunning: (running) => set({ isRunning: running }),
      setTimeLeft: (time) => {
        if (typeof time === 'function') {
          set(state => ({ timeLeft: time(state.timeLeft) }));
        } else {
          set({ timeLeft: time });
        }
      },
      setMode: (mode) => set({ mode }),
      setSession: (session) => set({ session }),
      setCompletedSessions: (sessions) => set({ completedSessions: sessions }),
      setWorkDuration: (duration) => set({ workDuration: duration }),
      setShortBreakDuration: (duration) => set({ shortBreakDuration: duration }),
      setLongBreakDuration: (duration) => set({ longBreakDuration: duration }),
      setSessionsUntilLongBreak: (sessions) => set({ sessionsUntilLongBreak: sessions }),
      setTickingEnabled: (enabled) => set({ tickingEnabled: enabled }),
      setSelectedSound: (sound) => set({ selectedSound: sound }),
      setSoundPlaying: (playing) => set({ soundPlaying: playing }),
      setSoundVolume: (volume) => set({ soundVolume: volume }),
      
      // Utility functions
      getDurationForMode: (mode) => {
        const state = get();
        switch (mode) {
          case "work":
            return state.workDuration * 60;
          case "shortBreak":
            return state.shortBreakDuration * 60;
          case "longBreak":
            return state.longBreakDuration * 60;
        }
      },
      
      resetTimer: () => {
        const state = get();
        const duration = state.getDurationForMode(state.mode);
        set({ 
          timeLeft: duration,
          isRunning: false 
        });
      },
      
      pauseTimer: () => {
        set({ isRunning: false });
      },
      
      startTimer: () => {
        set({ isRunning: true });
      },
      
      completeSession: () => {
        const state = get();
        const newCompletedSessions = state.completedSessions + 1;
        let nextMode: TimerMode;
        
        if (state.mode === "work") {
          nextMode = newCompletedSessions % state.sessionsUntilLongBreak === 0 
            ? "longBreak" 
            : "shortBreak";
        } else {
          nextMode = "work";
        }
        
        const newSession = state.mode === "work" ? state.session + 1 : state.session;
        const duration = state.getDurationForMode(nextMode);
        
        set({
          completedSessions: newCompletedSessions,
          mode: nextMode,
          session: newSession,
          timeLeft: duration,
          isRunning: false
        });
      }
    }),
    {
      name: 'pomodoro-storage',
      partialize: (state) => ({
        timeLeft: state.timeLeft,
        mode: state.mode,
        session: state.session,
        completedSessions: state.completedSessions,
        workDuration: state.workDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        sessionsUntilLongBreak: state.sessionsUntilLongBreak,
        tickingEnabled: state.tickingEnabled,
        selectedSound: state.selectedSound,
        soundVolume: state.soundVolume,
      }),
    }
  )
);