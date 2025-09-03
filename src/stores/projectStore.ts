import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ProjectTask {
  id: string;
  name: string;
  description?: string;
  projectId: string;
  userId: string;
  totalPomodoros: number;
  currentStreak: number;
  longestStreak: number;
  estimatedPomodoros?: number;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  userId: string;
  totalPomodoros: number;
  tasks: ProjectTask[];
  createdAt: string;
  completedAt?: string;
}

export interface PomodoroSession {
  id: string;
  projectId: string;
  taskId: string;
  userId: string;
  duration: number; // in minutes
  completedAt: string;
  date: string; // YYYY-MM-DD format
  mode: "work" | "shortBreak" | "longBreak";
}

interface ProjectState {
  projects: Project[];
  sessions: PomodoroSession[];
  activeTask: ProjectTask | null;
  
  // Project methods
  addProject: (project: Omit<Project, "id" | "createdAt" | "totalPomodoros" | "tasks">) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  getProjectsForUser: (userId: string) => Project[];
  
  // Task methods  
  addTask: (task: Omit<ProjectTask, "id" | "createdAt" | "totalPomodoros" | "currentStreak" | "longestStreak" | "completed">) => void;
  updateTask: (id: string, updates: Partial<ProjectTask>) => void;
  deleteTask: (id: string) => void;
  getTasksForProject: (projectId: string) => ProjectTask[];
  setActiveTask: (task: ProjectTask | null) => void;
  
  // Session methods
  addPomodoroSession: (session: Omit<PomodoroSession, "id">) => void;
  getSessionsForUser: (userId: string) => PomodoroSession[];
  getSessionsForDate: (userId: string, date: string) => PomodoroSession[];
  getSessionsForTask: (taskId: string) => PomodoroSession[];
  getDailyProgress: (userId: string) => { date: string; sessions: number; totalMinutes: number }[];
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      sessions: [],
      activeTask: null,

      addProject: (projectData) => {
        const newProject: Project = {
          ...projectData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          totalPomodoros: 0,
          tasks: [],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, ...updates } : project
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((project) => project.id !== id),
          sessions: state.sessions.filter((session) => session.projectId !== id),
        }));
      },

      getProjectsForUser: (userId) => {
        return get().projects.filter((project) => project.userId === userId);
      },

      addTask: (taskData) => {
        const newTask: ProjectTask = {
          ...taskData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          totalPomodoros: 0,
          currentStreak: 0,
          longestStreak: 0,
          completed: false,
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === taskData.projectId
              ? { ...project, tasks: [...project.tasks, newTask] }
              : project
          ),
        }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            tasks: project.tasks.map((task) =>
              task.id === id ? { ...task, ...updates } : task
            ),
          })),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          projects: state.projects.map((project) => ({
            ...project,
            tasks: project.tasks.filter((task) => task.id !== id),
          })),
          sessions: state.sessions.filter((session) => session.taskId !== id),
          activeTask: state.activeTask?.id === id ? null : state.activeTask,
        }));
      },

      getTasksForProject: (projectId) => {
        const project = get().projects.find((p) => p.id === projectId);
        return project?.tasks || [];
      },

      setActiveTask: (task) => {
        set({ activeTask: task });
      },

      addPomodoroSession: (sessionData) => {
        const session: PomodoroSession = {
          ...sessionData,
          id: Date.now().toString(),
        };

        // Update task and project pomodoro counts
        const { taskId, projectId, mode } = session;
        
        if (mode === "work") {
          set((state) => {
            const updatedProjects = state.projects.map((project) => {
              if (project.id === projectId) {
                const updatedTasks = project.tasks.map((task) => {
                  if (task.id === taskId) {
                    const newTotalPomodoros = task.totalPomodoros + 1;
                    
                    // Calculate streak based on recent sessions
                    const taskSessions = state.sessions
                      .filter(s => s.taskId === taskId && s.mode === "work")
                      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
                    
                    let currentStreak = 1;
                    const today = new Date().toISOString().split('T')[0];
                    let checkDate = today;
                    
                    for (const session of taskSessions) {
                      const sessionDate = session.date;
                      if (sessionDate === checkDate) {
                        continue;
                      }
                      
                      const prevDay = new Date(new Date(checkDate).getTime() - 24 * 60 * 60 * 1000)
                        .toISOString().split('T')[0];
                        
                      if (sessionDate === prevDay) {
                        currentStreak++;
                        checkDate = prevDay;
                      } else {
                        break;
                      }
                    }
                    
                    return {
                      ...task,
                      totalPomodoros: newTotalPomodoros,
                      currentStreak,
                      longestStreak: Math.max(task.longestStreak, currentStreak),
                    };
                  }
                  return task;
                });
                
                return {
                  ...project,
                  tasks: updatedTasks,
                  totalPomodoros: project.totalPomodoros + 1,
                };
              }
              return project;
            });

            return {
              projects: updatedProjects,
              sessions: [...state.sessions, session],
            };
          });
        } else {
          set((state) => ({
            sessions: [...state.sessions, session],
          }));
        }
      },

      getSessionsForUser: (userId) => {
        return get().sessions.filter((session) => session.userId === userId);
      },

      getSessionsForDate: (userId, date) => {
        return get().sessions.filter(
          (session) => session.userId === userId && session.date === date
        );
      },

      getSessionsForTask: (taskId) => {
        return get().sessions.filter((session) => session.taskId === taskId);
      },

      getDailyProgress: (userId) => {
        const sessions = get().getSessionsForUser(userId);
        const dailyData: { [date: string]: { sessions: number; totalMinutes: number } } = {};

        sessions.forEach((session) => {
          if (!dailyData[session.date]) {
            dailyData[session.date] = { sessions: 0, totalMinutes: 0 };
          }
          dailyData[session.date].sessions++;
          dailyData[session.date].totalMinutes += session.duration;
        });

        return Object.entries(dailyData)
          .map(([date, data]) => ({ date, ...data }))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
    }),
    {
      name: "project-storage",
    }
  )
);