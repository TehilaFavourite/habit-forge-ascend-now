import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Todo {
  id: string;
  title: string;
  category: "morning" | "general" | "evening";
  userId: string;
  completed: boolean;
  recurrence?: "none" | "daily" | "weekly" | "monthly";
  lastCompletedDate?: string;
  createdAt: string;
  completedAt?: string;
}

interface TodoState {
  todos: Todo[];
  addTodo: (
    todo: Omit<Todo, "id" | "completed" | "createdAt" | "completedAt">
  ) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  getTodosForUser: (userId: string) => Todo[];
}

export const useTodoStore = create<TodoState>()(
  persist(
    (set, get) => ({
      todos: [],

      addTodo: (todoData) => {
        const newTodo: Todo = {
          ...todoData,
          id: Date.now().toString(),
          completed: false,
          createdAt: new Date().toISOString(),
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
        set((state) => ({
          todos: state.todos.map((todo) =>
            todo.id === id
              ? {
                  ...todo,
                  completed: !todo.completed,
                  completedAt: !todo.completed
                    ? new Date().toISOString()
                    : undefined,
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
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
      },
    }),
    {
      name: "todo-storage",
    }
  )
);
