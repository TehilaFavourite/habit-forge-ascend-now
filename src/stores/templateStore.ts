import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  focusArea: string;
  isDefault: boolean;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HabitTemplate extends Template {
  type: 'habit';
  title: string;
  habitDescription: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  reminders: string[];
  tags: string[];
}

export interface TaskTemplate extends Template {
  type: 'task';
  title: string;
  taskDescription: string;
  priority: 'low' | 'medium' | 'high';
  estimatedTime: number; // in minutes
  category: string;
  tags: string[];
}

export interface XPActivityTemplate extends Template {
  type: 'xp_activity';
  activityName: string;
  xpValue: number;
  activityType: 'core' | 'bonus';
  activityCategory: string;
  requirements: string[];
}

export interface RewardTemplate extends Template {
  type: 'reward';
  rewardName: string;
  cost: number;
  rewardType: 'instant' | 'delayed' | 'experience';
  rewardCategory: string;
  requirements: string[];
}

export interface AchievementTemplate extends Template {
  type: 'achievement';
  achievementName: string;
  achievementDescription: string;
  icon: string;
  achievementCategory: string;
  requirement: number;
  xpReward: number;
  activityType: string;
  unit: string;
  milestones: number[];
}

export interface JournalTemplate extends Template {
  type: 'journal';
  promptText: string;
  promptCategory: string;
  suggestedTags: string[];
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime';
}

export type AnyTemplate = HabitTemplate | TaskTemplate | XPActivityTemplate | RewardTemplate | AchievementTemplate | JournalTemplate;

interface TemplateState {
  templates: Record<string, AnyTemplate[]>; // userId -> templates
  
  // Template management
  getTemplatesForUser: (userId: string, type?: string) => AnyTemplate[];
  getTemplatesByFocusArea: (userId: string, focusArea: string) => AnyTemplate[];
  addTemplate: (userId: string, template: Omit<AnyTemplate, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTemplate: (userId: string, templateId: string, updates: Partial<AnyTemplate>) => void;
  deleteTemplate: (userId: string, templateId: string) => void;
  duplicateTemplate: (userId: string, templateId: string) => void;
  
  // Template generation based on onboarding
  generateTemplatesFromOnboarding: (userId: string, onboardingData: any) => void;
  
  // Default templates
  initializeDefaultTemplates: (userId: string) => void;
}

export const useTemplateStore = create<TemplateState>()(
  persist(
    (set, get) => ({
      templates: {},
      
      getTemplatesForUser: (userId: string, type?: string) => {
        const userTemplates = get().templates[userId] || [];
        if (type) {
          return userTemplates.filter(template => template.type === type);
        }
        return userTemplates;
      },
      
      getTemplatesByFocusArea: (userId: string, focusArea: string) => {
        const userTemplates = get().templates[userId] || [];
        return userTemplates.filter(template => template.focusArea === focusArea);
      },
      
      addTemplate: (userId: string, templateData) => {
        const newTemplate: AnyTemplate = {
          ...templateData,
          id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as AnyTemplate;
        
        set(state => ({
          templates: {
            ...state.templates,
            [userId]: [...(state.templates[userId] || []), newTemplate]
          }
        }));
      },
      
      updateTemplate: (userId: string, templateId: string, updates) => {
        set(state => ({
          templates: {
            ...state.templates,
            [userId]: (state.templates[userId] || []).map(template =>
              template.id === templateId
                ? { ...template, ...updates, updatedAt: new Date().toISOString() }
                : template
            )
          }
        }));
      },
      
      deleteTemplate: (userId: string, templateId: string) => {
        set(state => ({
          templates: {
            ...state.templates,
            [userId]: (state.templates[userId] || []).filter(template => template.id !== templateId)
          }
        }));
      },
      
      duplicateTemplate: (userId: string, templateId: string) => {
        const userTemplates = get().templates[userId] || [];
        const templateToDuplicate = userTemplates.find(t => t.id === templateId);
        
        if (templateToDuplicate) {
          const duplicatedTemplate = {
            ...templateToDuplicate,
            id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: `${templateToDuplicate.name} (Copy)`,
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          
          set(state => ({
            templates: {
              ...state.templates,
              [userId]: [...(state.templates[userId] || []), duplicatedTemplate]
            }
          }));
        }
      },
      
      generateTemplatesFromOnboarding: (userId: string, onboardingData: any) => {
        const templates: AnyTemplate[] = [];
        const { focusAreas, experienceLevel, timeCommitment, learningStyle, schedule } = onboardingData;
        
        // Generate templates for each focus area
        focusAreas.forEach((focusArea: string) => {
          switch (focusArea) {
            case 'fitness':
              // Fitness Habit Templates
              templates.push({
                type: 'habit',
                name: 'Morning Workout',
                description: 'Start your day with energy',
                category: 'Health & Fitness',
                focusArea: 'fitness',
                isDefault: true,
                isEditable: true,
                title: 'Morning Workout',
                habitDescription: '30 minutes of exercise to boost energy',
                frequency: 'daily',
                difficulty: experienceLevel === 'beginner' ? 'easy' : experienceLevel === 'intermediate' ? 'medium' : 'hard',
                estimatedTime: timeCommitment === 'minimal' ? 15 : timeCommitment === 'moderate' ? 30 : 45,
                reminders: schedule === 'morning' ? ['07:00'] : schedule === 'evening' ? ['18:00'] : ['09:00'],
                tags: ['fitness', 'morning', 'energy']
              } as HabitTemplate);
              
              // Fitness Task Templates
              templates.push({
                type: 'task',
                name: 'Plan Weekly Workouts',
                description: 'Organize your fitness routine',
                category: 'Planning',
                focusArea: 'fitness',
                isDefault: true,
                isEditable: true,
                title: 'Plan Weekly Workouts',
                taskDescription: 'Create a structured workout plan for the week',
                priority: 'high',
                estimatedTime: 30,
                tags: ['planning', 'fitness', 'weekly']
              } as TaskTemplate);
              
              // Fitness XP Activity Templates
              templates.push({
                type: 'xp_activity',
                name: 'Complete Workout Session',
                description: 'Earn XP for completing workouts',
                category: 'Fitness',
                focusArea: 'fitness',
                isDefault: true,
                isEditable: true,
                activityName: 'Complete Workout Session',
                xpValue: 50,
                activityType: 'core',
                activityCategory: 'Fitness',
                requirements: ['Complete a full workout session']
              } as XPActivityTemplate);
              
              // Fitness Reward Templates
              templates.push({
                type: 'reward',
                name: 'Protein Shake',
                description: 'Healthy post-workout treat',
                category: 'Health',
                focusArea: 'fitness',
                isDefault: true,
                isEditable: true,
                rewardName: 'Protein Shake',
                cost: 75,
                rewardType: 'instant',
                rewardCategory: 'Health',
                requirements: ['Complete workout']
              } as RewardTemplate);
              
              // Fitness Achievement Templates
              templates.push({
                type: 'achievement',
                name: 'Fitness Warrior',
                description: 'Complete 30 workout sessions',
                category: 'Fitness',
                focusArea: 'fitness',
                isDefault: true,
                isEditable: true,
                achievementName: 'Fitness Warrior',
                achievementDescription: 'Complete 30 workout sessions',
                icon: '💪',
                achievementCategory: 'Fitness',
                requirement: 30,
                xpReward: 500,
                activityType: 'workout_sessions',
                unit: 'sessions',
                milestones: [5, 10, 20, 30]
              } as AchievementTemplate);
              
              // Fitness Journal Templates
              templates.push({
                type: 'journal',
                name: 'Workout Reflection',
                description: 'Reflect on your fitness journey',
                category: 'Fitness',
                focusArea: 'fitness',
                isDefault: true,
                isEditable: true,
                promptText: 'How did my body feel during today\'s workout? What did I accomplish?',
                promptCategory: 'Fitness',
                suggestedTags: ['workout', 'fitness', 'progress'],
                timeOfDay: 'evening'
              } as JournalTemplate);
              break;
              
            case 'learning':
            case 'programming':
              // Learning Habit Templates
              templates.push({
                type: 'habit',
                name: 'Daily Study Session',
                description: 'Consistent learning builds expertise',
                category: 'Education',
                focusArea: 'learning',
                isDefault: true,
                isEditable: true,
                title: 'Daily Study Session',
                habitDescription: 'Focused learning time to build knowledge',
                frequency: 'daily',
                difficulty: experienceLevel === 'beginner' ? 'easy' : 'medium',
                estimatedTime: timeCommitment === 'minimal' ? 15 : timeCommitment === 'moderate' ? 30 : 60,
                reminders: schedule === 'morning' ? ['08:00'] : schedule === 'evening' ? ['19:00'] : ['14:00'],
                tags: ['learning', 'study', 'growth']
              } as HabitTemplate);
              
              // Learning Task Templates
              templates.push({
                type: 'task',
                name: 'Set Up Learning Environment',
                description: 'Create optimal study space',
                category: 'Setup',
                focusArea: 'learning',
                isDefault: true,
                isEditable: true,
                title: 'Set Up Learning Environment',
                taskDescription: 'Organize study materials and create distraction-free space',
                priority: 'high',
                estimatedTime: 45,
                tags: ['setup', 'learning', 'environment']
              } as TaskTemplate);
              
              // Learning XP Activity Templates
              templates.push({
                type: 'xp_activity',
                name: 'Complete Study Session',
                description: 'Earn XP for dedicated learning',
                category: 'Learning',
                focusArea: 'learning',
                isDefault: true,
                isEditable: true,
                activityName: 'Complete Study Session',
                xpValue: 45,
                activityType: 'core',
                activityCategory: 'Learning',
                requirements: ['Complete focused study session']
              } as XPActivityTemplate);
              
              // Learning Reward Templates
              templates.push({
                type: 'reward',
                name: 'New Course Access',
                description: 'Unlock premium learning content',
                category: 'Education',
                focusArea: 'learning',
                isDefault: true,
                isEditable: true,
                rewardName: 'New Course Access',
                cost: 200,
                rewardType: 'experience',
                rewardCategory: 'Education',
                requirements: ['Complete learning milestones']
              } as RewardTemplate);
              
              // Learning Achievement Templates
              templates.push({
                type: 'achievement',
                name: 'Knowledge Seeker',
                description: 'Complete 50 study sessions',
                category: 'Learning',
                focusArea: 'learning',
                isDefault: true,
                isEditable: true,
                achievementName: 'Knowledge Seeker',
                achievementDescription: 'Complete 50 study sessions',
                icon: '📚',
                achievementCategory: 'Learning',
                requirement: 50,
                xpReward: 750,
                activityType: 'study_sessions',
                unit: 'sessions',
                milestones: [10, 25, 40, 50]
              } as AchievementTemplate);
              
              // Learning Journal Templates
              templates.push({
                type: 'journal',
                name: 'Learning Insights',
                description: 'Capture key learnings and insights',
                category: 'Learning',
                focusArea: 'learning',
                isDefault: true,
                isEditable: true,
                promptText: 'What new concept did I learn today? How can I apply it?',
                promptCategory: 'Learning',
                suggestedTags: ['learning', 'insights', 'growth'],
                timeOfDay: 'evening'
              } as JournalTemplate);
              break;
              
            case 'creative':
            case 'music':
              // Creative Habit Templates
              templates.push({
                type: 'habit',
                name: 'Creative Practice',
                description: 'Daily creative expression',
                category: 'Creativity',
                focusArea: 'creative',
                isDefault: true,
                isEditable: true,
                title: 'Creative Practice',
                habitDescription: 'Dedicated time for creative work and expression',
                frequency: 'daily',
                difficulty: 'medium',
                estimatedTime: timeCommitment === 'minimal' ? 20 : timeCommitment === 'moderate' ? 30 : 60,
                reminders: schedule === 'morning' ? ['10:00'] : schedule === 'evening' ? ['20:00'] : ['15:00'],
                tags: ['creative', 'art', 'expression']
              } as HabitTemplate);
              
              // Creative Task Templates
              templates.push({
                type: 'task',
                name: 'Set Up Creative Workspace',
                description: 'Organize creative tools and space',
                category: 'Setup',
                focusArea: 'creative',
                isDefault: true,
                isEditable: true,
                title: 'Set Up Creative Workspace',
                taskDescription: 'Organize art supplies and create inspiring workspace',
                priority: 'medium',
                estimatedTime: 60,
                tags: ['setup', 'creative', 'workspace']
              } as TaskTemplate);
              
              // Creative XP Activity Templates
              templates.push({
                type: 'xp_activity',
                name: 'Creative Session',
                description: 'Earn XP for creative work',
                category: 'Creative',
                focusArea: 'creative',
                isDefault: true,
                isEditable: true,
                activityName: 'Creative Session',
                xpValue: 40,
                activityType: 'core',
                activityCategory: 'Creative',
                requirements: ['Complete creative work session']
              } as XPActivityTemplate);
              
              // Creative Reward Templates
              templates.push({
                type: 'reward',
                name: 'Art Supplies',
                description: 'New creative materials',
                category: 'Creative',
                focusArea: 'creative',
                isDefault: true,
                isEditable: true,
                rewardName: 'Art Supplies',
                cost: 150,
                rewardType: 'delayed',
                rewardCategory: 'Creative',
                requirements: ['Complete creative projects']
              } as RewardTemplate);
              
              // Creative Achievement Templates
              templates.push({
                type: 'achievement',
                name: 'Creative Genius',
                description: 'Complete 25 creative projects',
                category: 'Creative',
                focusArea: 'creative',
                isDefault: true,
                isEditable: true,
                achievementName: 'Creative Genius',
                achievementDescription: 'Complete 25 creative projects',
                icon: '🎨',
                achievementCategory: 'Creative',
                requirement: 25,
                xpReward: 600,
                activityType: 'creative_projects',
                unit: 'projects',
                milestones: [5, 10, 18, 25]
              } as AchievementTemplate);
              
              // Creative Journal Templates
              templates.push({
                type: 'journal',
                name: 'Creative Inspiration',
                description: 'Capture creative ideas and inspiration',
                category: 'Creative',
                focusArea: 'creative',
                isDefault: true,
                isEditable: true,
                promptText: 'What inspired my creativity today? What did I create?',
                promptCategory: 'Creative',
                suggestedTags: ['creative', 'inspiration', 'art'],
                timeOfDay: 'anytime'
              } as JournalTemplate);
              break;
              
            case 'wellness':
              // Wellness Habit Templates
              templates.push({
                type: 'habit',
                name: 'Meditation Practice',
                description: 'Daily mindfulness and peace',
                category: 'Wellness',
                focusArea: 'wellness',
                isDefault: true,
                isEditable: true,
                title: 'Meditation Practice',
                habitDescription: 'Mindfulness meditation for mental clarity',
                frequency: 'daily',
                difficulty: 'easy',
                estimatedTime: timeCommitment === 'minimal' ? 10 : timeCommitment === 'moderate' ? 15 : 20,
                reminders: schedule === 'morning' ? ['07:30'] : schedule === 'evening' ? ['21:00'] : ['12:00'],
                tags: ['wellness', 'meditation', 'mindfulness']
              } as HabitTemplate);
              
              // Wellness Task Templates
              templates.push({
                type: 'task',
                name: 'Set Up Meditation Space',
                description: 'Create peaceful meditation area',
                category: 'Setup',
                focusArea: 'wellness',
                isDefault: true,
                isEditable: true,
                title: 'Set Up Meditation Space',
                taskDescription: 'Create a calm, dedicated space for meditation practice',
                priority: 'medium',
                estimatedTime: 30,
                tags: ['setup', 'wellness', 'meditation']
              } as TaskTemplate);
              
              // Wellness XP Activity Templates
              templates.push({
                type: 'xp_activity',
                name: 'Complete Meditation',
                description: 'Earn XP for mindfulness practice',
                category: 'Wellness',
                focusArea: 'wellness',
                isDefault: true,
                isEditable: true,
                activityName: 'Complete Meditation',
                xpValue: 30,
                activityType: 'core',
                activityCategory: 'Wellness',
                requirements: ['Complete meditation session']
              } as XPActivityTemplate);
              
              // Wellness Reward Templates
              templates.push({
                type: 'reward',
                name: 'Spa Day',
                description: 'Relaxing self-care experience',
                category: 'Wellness',
                focusArea: 'wellness',
                isDefault: true,
                isEditable: true,
                rewardName: 'Spa Day',
                cost: 500,
                rewardType: 'experience',
                rewardCategory: 'Wellness',
                requirements: ['Maintain wellness streak']
              } as RewardTemplate);
              
              // Wellness Achievement Templates
              templates.push({
                type: 'achievement',
                name: 'Zen Master',
                description: 'Meditate for 100 sessions',
                category: 'Wellness',
                focusArea: 'wellness',
                isDefault: true,
                isEditable: true,
                achievementName: 'Zen Master',
                achievementDescription: 'Meditate for 100 sessions',
                icon: '🧘',
                achievementCategory: 'Wellness',
                requirement: 100,
                xpReward: 1000,
                activityType: 'meditation_sessions',
                unit: 'sessions',
                milestones: [20, 50, 75, 100]
              } as AchievementTemplate);
              
              // Wellness Journal Templates
              templates.push({
                type: 'journal',
                name: 'Mindfulness Reflection',
                description: 'Reflect on inner peace and growth',
                category: 'Wellness',
                focusArea: 'wellness',
                isDefault: true,
                isEditable: true,
                promptText: 'How do I feel mentally and emotionally today? What brought me peace?',
                promptCategory: 'Wellness',
                suggestedTags: ['wellness', 'mindfulness', 'peace'],
                timeOfDay: 'evening'
              } as JournalTemplate);
              break;
              
            case 'career':
            case 'business':
              // Career Habit Templates
              templates.push({
                type: 'habit',
                name: 'Skill Development',
                description: 'Daily professional growth',
                category: 'Career',
                focusArea: 'career',
                isDefault: true,
                isEditable: true,
                title: 'Skill Development',
                habitDescription: 'Dedicated time for building professional skills',
                frequency: 'daily',
                difficulty: 'medium',
                estimatedTime: timeCommitment === 'minimal' ? 20 : timeCommitment === 'moderate' ? 30 : 45,
                reminders: schedule === 'morning' ? ['09:00'] : schedule === 'evening' ? ['18:30'] : ['13:00'],
                tags: ['career', 'skills', 'professional']
              } as HabitTemplate);
              
              // Career Task Templates
              templates.push({
                type: 'task',
                name: 'Update Resume/Portfolio',
                description: 'Keep professional materials current',
                category: 'Professional',
                focusArea: 'career',
                isDefault: true,
                isEditable: true,
                title: 'Update Resume/Portfolio',
                taskDescription: 'Review and update professional documents and portfolio',
                priority: 'high',
                estimatedTime: 90,
                tags: ['career', 'resume', 'portfolio']
              } as TaskTemplate);
              
              // Career XP Activity Templates
              templates.push({
                type: 'xp_activity',
                name: 'Skill Practice',
                description: 'Earn XP for skill development',
                category: 'Career',
                focusArea: 'career',
                isDefault: true,
                isEditable: true,
                activityName: 'Skill Practice',
                xpValue: 35,
                activityType: 'core',
                activityCategory: 'Career',
                requirements: ['Complete skill development session']
              } as XPActivityTemplate);
              
              // Career Reward Templates
              templates.push({
                type: 'reward',
                name: 'Professional Course',
                description: 'Invest in career advancement',
                category: 'Career',
                focusArea: 'career',
                isDefault: true,
                isEditable: true,
                rewardName: 'Professional Course',
                cost: 400,
                rewardType: 'experience',
                rewardCategory: 'Career',
                requirements: ['Reach career milestones']
              } as RewardTemplate);
              
              // Career Achievement Templates
              templates.push({
                type: 'achievement',
                name: 'Career Climber',
                description: 'Complete 40 skill development sessions',
                category: 'Career',
                focusArea: 'career',
                isDefault: true,
                isEditable: true,
                achievementName: 'Career Climber',
                achievementDescription: 'Complete 40 skill development sessions',
                icon: '💼',
                achievementCategory: 'Career',
                requirement: 40,
                xpReward: 800,
                activityType: 'skill_sessions',
                unit: 'sessions',
                milestones: [10, 20, 30, 40]
              } as AchievementTemplate);
              
              // Career Journal Templates
              templates.push({
                type: 'journal',
                name: 'Career Progress',
                description: 'Track professional development',
                category: 'Career',
                focusArea: 'career',
                isDefault: true,
                isEditable: true,
                promptText: 'What professional skills did I develop today? How am I progressing toward my career goals?',
                promptCategory: 'Career',
                suggestedTags: ['career', 'professional', 'growth'],
                timeOfDay: 'evening'
              } as JournalTemplate);
              break;
          }
        });
        
        // Add universal templates
        templates.push(
          {
            type: 'habit',
            name: 'Daily Reflection',
            description: 'Universal self-reflection habit',
            category: 'Personal Growth',
            focusArea: 'general',
            isDefault: true,
            isEditable: true,
            title: 'Daily Reflection',
            habitDescription: '5 minutes of self-reflection and gratitude',
            frequency: 'daily',
            difficulty: 'easy',
            estimatedTime: 5,
            reminders: ['21:30'],
            tags: ['reflection', 'gratitude', 'growth']
          } as HabitTemplate,
          
          {
            type: 'journal',
            name: 'Daily Gratitude',
            description: 'Universal gratitude practice',
            category: 'Personal Growth',
            focusArea: 'general',
            isDefault: true,
            isEditable: true,
            promptText: 'What am I grateful for today? What went well?',
            promptCategory: 'Gratitude',
            suggestedTags: ['gratitude', 'positive', 'reflection'],
            timeOfDay: 'evening'
          } as JournalTemplate
        );
        
        // Save all templates
        set(state => ({
          templates: {
            ...state.templates,
            [userId]: [...(state.templates[userId] || []), ...templates]
          }
        }));
      },
      
      initializeDefaultTemplates: (userId: string) => {
        // Initialize with basic templates if user has none
        const userTemplates = get().templates[userId] || [];
        if (userTemplates.length === 0) {
          get().generateTemplatesFromOnboarding(userId, {
            focusAreas: ['general'],
            experienceLevel: 'beginner',
            timeCommitment: 'moderate',
            learningStyle: 'visual',
            schedule: 'flexible'
          });
        }
      },
    }),
    {
      name: 'template-storage',
    }
  )
);
