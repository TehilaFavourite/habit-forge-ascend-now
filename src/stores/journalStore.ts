import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood?: number; // 1-5 scale
  tags: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalPrompt {
  id: string;
  text: string;
  category: string;
  userId: string;
}

interface JournalState {
  entries: JournalEntry[];
  prompts: JournalPrompt[];
  
  // Entry methods
  addEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  getEntriesForUser: (userId: string) => JournalEntry[];
  getEntryByDate: (userId: string, date: string) => JournalEntry | undefined;
  
  // Prompt methods
  addPrompt: (prompt: Omit<JournalPrompt, 'id'>) => void;
  getPromptsForUser: (userId: string) => JournalPrompt[];
  
  // Generation methods
  generateEntries: (entries: Array<{date: string, title: string, content: string, mood?: number, tags: string[]}>) => void;
  generatePrompts: (prompts: Array<{text: string, category: string}>) => void;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],
      prompts: [],
      
      addEntry: (entryData) => {
        const newEntry: JournalEntry = {
          ...entryData,
          id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          entries: [...state.entries, newEntry]
        }));
      },
      
      updateEntry: (id, updates) => {
        set(state => ({
          entries: state.entries.map(entry => 
            entry.id === id 
              ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
              : entry
          )
        }));
      },
      
      deleteEntry: (id) => {
        set(state => ({
          entries: state.entries.filter(entry => entry.id !== id)
        }));
      },
      
      getEntriesForUser: (userId) => {
        return get().entries
          .filter(entry => entry.userId === userId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      getEntryByDate: (userId, date) => {
        return get().entries.find(entry => 
          entry.userId === userId && entry.date === date
        );
      },
      
      addPrompt: (promptData) => {
        const newPrompt: JournalPrompt = {
          ...promptData,
          id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        };
        
        set(state => ({
          prompts: [...state.prompts, newPrompt]
        }));
      },
      
      getPromptsForUser: (userId) => {
        return get().prompts.filter(prompt => prompt.userId === userId);
      },
      
      generateEntries: (entries) => {
        const userId = "default-user";
        const newEntries = entries.map(entry => ({
          ...entry,
          id: `journal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }));
        
        set(state => ({
          entries: [...state.entries, ...newEntries]
        }));
      },
      
      generatePrompts: (prompts) => {
        const userId = "default-user";
        const newPrompts = prompts.map(prompt => ({
          ...prompt,
          id: `prompt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
        }));
        
        set(state => ({
          prompts: [...state.prompts, ...newPrompts]
        }));
      },
    }),
    {
      name: 'journal-storage',
    }
  )
);
