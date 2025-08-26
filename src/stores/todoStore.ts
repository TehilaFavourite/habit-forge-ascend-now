import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Todo {
  id: string;
  title: string;
  category: "morning" | "afternoon" | "evening";
  userId: string;
  completed: boolean;
  recurrence: "none" | "daily" | "weekly" | "monthly";
  priority: "low" | "medium" | "high";
  lastCompletedDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface TodoState {
  todos: Todo[];
  lastResetDate: string;
  checkAndResetDaily: () => void;
  addTodo: (
    todo: Omit<Todo, "id" | "completed" | "createdAt" | "completedAt">
  ) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  getTodosForUser: (userId: string) => Todo[];
  clearCompletedTodos: (userId: string) => void;
  resetRecurringTasks: (userId: string) => void;
  generateTodos: (todos: Array<{
    title: string;
    completed: boolean;
  }>) => void;
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],
      lastResetDate: new Date().toDateString(),

      checkAndResetDaily: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastResetDate !== today) {
          // Reset all todos for daily recurrence
          set(state => ({
            todos: state.todos.map(todo => ({
              ...todo,
              completed: false,
              completedAt: undefined,
            })),
            lastResetDate: today,
          }));
        }
      },

      addTodo: (todoData) => {
        const newTodo: Todo = {
          ...todoData,
          id: Date.now().toString(),
          completed: false,
          createdAt: new Date().toISOString(),
          priority: todoData.priority || "medium",
          recurrence: todoData.recurrence || "none",
        };
        set((state) => ({
          todos: [...state.todos, newTodo],
        }));
      },

      updateTodo: (id, updates) => {
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id ? { ...todo, ...updates } : todo
          ),
        }));
      },

      toggleTodo: (id) => {
        const today = new Date().toISOString().split("T")[0];
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: !todo.completed
                    ? new Date().toISOString()
                    : undefined,
                  lastCompletedDate: !todo.completed
                    ? today
                    : todo.lastCompletedDate,
                }
              : todo
          ),
        }));
      },

      deleteTodo: (id) => {
        set((state) => ({
          todos: state.todos.filter((todo) => todo.id !== id),
        }));
      },

      getTodosForUser: (userId) => {
        return get()
          .todos.filter((todo) => todo.userId === userId)
          .sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return (
              priorityOrder[b.priority] - priorityOrder[a.priority] ||
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          });
      },

      clearCompletedTodos: (userId) => {
        set((state) => ({
          todos: state.todos.filter(
            (todo) => todo.userId !== userId || !todo.completed
          ),
        }));
      },

      resetRecurringTasks: (userId) => {
        const today = new Date().toISOString().split("T")[0];
        const state = get();

        state.todos.forEach((todo) => {
          if (
            todo.userId === userId &&
            todo.recurrence !== "none" &&
            todo.completed
          ) {
            const shouldReset = () => {
              if (!todo.lastCompletedDate) return false;

              const lastCompleted = new Date(todo.lastCompletedDate);
              const now = new Date();

              switch (todo.recurrence) {
                case "daily":
                  return lastCompleted.toDateString() !== now.toDateString();
                case "weekly":
                  const weekStart = new Date(now);
                  weekStart.setDate(now.getDate() - now.getDay());
                  return lastCompleted < weekStart;
                case "monthly":
                  return (
                    lastCompleted.getMonth() !== now.getMonth() ||
                    lastCompleted.getFullYear() !== now.getFullYear()
                  );
                default:
                  return false;
              }
            };

            if (shouldReset()) {
              get().updateTodo(todo.id, {
                completed: false,
                completedAt: undefined,
              });
            }
          }
        });
      },

      generateTodos: (todos) => {
        const currentUserId = "default-user"; // Fallback for now
        
        const newTodos = todos.map((todo, index) => ({
          id: (Date.now() + index).toString(),
          title: todo.title,
          category: "morning" as const,
          userId: currentUserId,
          completed: todo.completed || false,
          recurrence: "none" as const,
          priority: "medium" as const,
          createdAt: new Date().toISOString(),
          completedAt: todo.completed ? new Date().toISOString() : undefined,
        }));

        set((state) => ({
          todos: [...state.todos, ...newTodos],
        }));
      },
    }),
    {
      name: "todo-storage",
    }
  )
);
