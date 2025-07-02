
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  category: 'morning' | 'evening' | 'general';
  userId: string;
  createdAt: string;
  completedAt?: string;
}

interface TodoState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'completed' | 'createdAt'>) => void;
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
        
        set(state => ({
          todos: [...state.todos, newTodo]
        }));
      },
      
      toggleTodo: (id) => {
        set(state => ({
          todos: state.todos.map(todo => 
            todo.id === id 
              ? { 
                  ...todo, 
                  completed: !todo.completed,
                  completedAt: !todo.completed ? new Date().toISOString() : undefined
                }
              : todo
          )
        }));
      },
      
      deleteTodo: (id) => {
        set(state => ({
          todos: state.todos.filter(todo => todo.id !== id)
        }));
      },
      
      getTodosForUser: (userId) => {
        return get().todos
          .filter(todo => todo.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      },
    }),
    {
      name: 'todo-storage',
    }
  )
);
