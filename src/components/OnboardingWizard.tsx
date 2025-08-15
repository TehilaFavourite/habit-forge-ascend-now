import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";
import { useAchievementsStore } from "@/stores/achievementsStore";
import { useHabitStore } from "@/stores/habitStore";
import { useTodoStore } from "@/stores/todoStore";
import { useRewardsStore } from "@/stores/rewardsStore";
import { useXPStore } from "@/stores/xpStore";
import { useJournalStore } from "@/stores/journalStore";
import { useTemplateStore } from "@/stores/templateStore";
import { useNavigate } from "react-router-dom";
// import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Clock,
  Brain,
  Heart,
  Lightbulb,
} from "lucide-react";

interface OnboardingData {
  focusAreas: string[];
  customFocusArea: string;
  experienceLevel: string;
  timeCommitment: string;
  learningStyle: string;
  schedule: string;
  motivation: string;
}

const focusAreaOptions = [
  {
    id: "programming",
    label: "Programming & Software Development",
    icon: "💻",
    description: "Learn coding languages, frameworks, and development skills",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "fitness",
    label: "Physical Fitness & Health",
    icon: "💪",
    description: "Build strength, endurance, and maintain healthy lifestyle",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    id: "learning",
    label: "Academic Learning & Education",
    icon: "📚",
    description: "Study subjects, earn certifications, expand knowledge",
    gradient: "from-purple-500 to-violet-500",
  },
  {
    id: "career",
    label: "Career Development",
    icon: "💼",
    description: "Professional growth, networking, skill advancement",
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "creative",
    label: "Creative Arts & Design",
    icon: "🎨",
    description: "Art, design, writing, photography, creative expression",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "music",
    label: "Music & Audio",
    icon: "🎵",
    description: "Learn instruments, music theory, audio production",
    gradient: "from-indigo-500 to-purple-500",
  },
  {
    id: "wellness",
    label: "Mental Health & Wellness",
    icon: "🧘",
    description: "Mindfulness, meditation, stress management, self-care",
    gradient: "from-teal-500 to-cyan-500",
  },
  {
    id: "business",
    label: "Business & Entrepreneurship",
    icon: "🚀",
    description: "Start business, develop products, marketing, sales",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    id: "languages",
    label: "Language Learning",
    icon: "🌍",
    description: "Learn new languages, improve communication skills",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    id: "cooking",
    label: "Cooking & Nutrition",
    icon: "👨‍🍳",
    description: "Culinary skills, healthy eating, meal planning",
    gradient: "from-amber-500 to-yellow-500",
  },
  {
    id: "finance",
    label: "Personal Finance",
    icon: "💰",
    description: "Budgeting, investing, financial planning, wealth building",
    gradient: "from-green-600 to-emerald-600",
  },
  {
    id: "relationships",
    label: "Social & Relationships",
    icon: "👥",
    description: "Communication skills, networking, personal relationships",
    gradient: "from-rose-500 to-pink-500",
  },
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5; // Reduced from 6 to 5
  const progress = (currentStep / totalSteps) * 100;
  const [data, setData] = useState<OnboardingData>({
    focusAreas: [],
    customFocusArea: "",
    experienceLevel: "",
    timeCommitment: "",
    learningStyle: "",
    schedule: "",
    motivation: "",
  });

  const { toast } = useToast();
  // const navigate = useNavigate();
  const { setOnboardingCompleted } = useAuthStore();
  const initializeAchievements = useAchievementsStore(
    (state) => state.initialize
  );
  const generateHabits = useHabitStore((state) => state.generateHabits);
  const generateTodos = useTodoStore((state) => state.generateTodos);
  const generateRewards = useRewardsStore((state) => state.generateRewards);
  const generateXPActivities = useXPStore((state) => state.generateActivities);
  const generateJournalEntries = useJournalStore((state) => state.generateEntries);
  const generateJournalPrompts = useJournalStore((state) => state.generatePrompts);
  const addAchievement = useAchievementsStore((state) => state.addAchievement);
  const generateTemplatesFromOnboarding = useTemplateStore((state) => state.generateTemplatesFromOnboarding);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const generatePersonalizedContent = () => {
    const userId = "default-user";
    
    // Initialize arrays for all content types
    const focusBasedHabits = [];
    const focusBasedTodos = [];
    const focusBasedRewards = [];
    const focusBasedXPActivities = [];
    const focusBasedAchievements = [];
    const focusBasedJournalEntries = [];
    const focusBasedJournalPrompts = [];

    // Default content for everyone
    const baseHabits = [
      {
        title: "Daily Reflection",
        description: "5 minutes of self-reflection",
        streak: 0,
        reminders: [],
      },
      {
        title: "Hydration Check",
        description: "Drink 8 glasses of water daily",
        streak: 0,
        reminders: [],
      },
    ];

    const baseTodos = [
      { title: "Complete profile setup", completed: false },
      { title: "Explore dashboard features", completed: false },
      { title: "Set your first goal", completed: false },
      { title: "Customize your dashboard", completed: false },
    ];

    const baseRewards = [
      { name: "Coffee Break", cost: 50 },
      { name: "Favorite Song Time", cost: 100 },
      { name: "Day Off Reward", cost: 500 },
      { name: "Movie Night", cost: 300 },
    ];

    const baseXPActivities = [
      { name: "Complete Daily Reflection", xp: 25, type: "core" as const, category: "Wellness" },
      { name: "Finish a Task", xp: 15, type: "core" as const, category: "Productivity" },
      { name: "Maintain Habit Streak", xp: 20, type: "bonus" as const, category: "Consistency" },
    ];

    const baseJournalPrompts = [
      { text: "What am I grateful for today?", category: "Gratitude" },
      { text: "What did I learn today?", category: "Learning" },
      { text: "How did I grow today?", category: "Personal Growth" },
      { text: "What challenged me today and how did I handle it?", category: "Reflection" },
    ];

    // Generate content based on focus areas
    data.focusAreas.forEach(area => {
      switch (area) {
        case "fitness":
          focusBasedHabits.push(
            { title: "Morning Workout", description: "30 minutes of exercise", streak: 0, reminders: [] },
            { title: "Evening Walk", description: "15 minutes outdoor walk", streak: 0, reminders: [] }
          );
          focusBasedTodos.push(
            { title: "Plan weekly workout schedule", completed: false },
            { title: "Set fitness goals", completed: false },
            { title: "Track body measurements", completed: false }
          );
          focusBasedRewards.push(
            { name: "Protein Shake", cost: 75 },
            { name: "New Workout Gear", cost: 250 },
            { name: "Massage Session", cost: 400 }
          );
          focusBasedXPActivities.push(
            { name: "Complete Workout Session", xp: 50, type: "core" as const, category: "Fitness" },
            { name: "Hit Daily Step Goal", xp: 30, type: "core" as const, category: "Fitness" },
            { name: "Try New Exercise", xp: 40, type: "bonus" as const, category: "Fitness" }
          );
          addAchievement(userId, {
            name: "Fitness Warrior",
            description: "Complete 30 workout sessions",
            icon: "💪",
            category: "Fitness",
            requirement: 30,
            xpReward: 500,
            activityType: "workout_sessions",
            unit: "sessions"
          });
          focusBasedJournalPrompts.push(
            { text: "How did my body feel during today's workout?", category: "Fitness" },
            { text: "What fitness milestone am I working towards?", category: "Goals" }
          );
          break;

        case "learning":
        case "programming":
          focusBasedHabits.push(
            { title: "Daily Study Session", description: "45 minutes focused learning", streak: 0, reminders: [] },
            { title: "Practice Coding", description: "30 minutes coding practice", streak: 0, reminders: [] }
          );
          focusBasedTodos.push(
            { title: "Set up learning environment", completed: false },
            { title: "Choose learning resources", completed: false },
            { title: "Create study schedule", completed: false }
          );
          focusBasedRewards.push(
            { name: "New Course Access", cost: 200 },
            { name: "Programming Book", cost: 150 },
            { name: "Tech Conference Ticket", cost: 800 }
          );
          focusBasedXPActivities.push(
            { name: "Complete Study Session", xp: 45, type: "core" as const, category: "Learning" },
            { name: "Solve Coding Problem", xp: 35, type: "core" as const, category: "Programming" },
            { name: "Learn New Concept", xp: 50, type: "bonus" as const, category: "Learning" }
          );
          addAchievement(userId, {
            name: "Knowledge Seeker",
            description: "Complete 50 study sessions",
            icon: "📚",
            category: "Learning",
            requirement: 50,
            xpReward: 750,
            activityType: "study_sessions",
            unit: "sessions"
          });
          focusBasedJournalPrompts.push(
            { text: "What new concept did I learn today?", category: "Learning" },
            { text: "How can I apply what I learned?", category: "Application" }
          );
          break;

        case "wellness":
          focusBasedHabits.push(
            { title: "Meditation Practice", description: "15 minutes mindfulness", streak: 0, reminders: [] },
            { title: "Gratitude Journal", description: "Write 3 things I'm grateful for", streak: 0, reminders: [] }
          );
          focusBasedTodos.push(
            { title: "Set up meditation space", completed: false },
            { title: "Download meditation app", completed: false },
            { title: "Plan self-care activities", completed: false }
          );
          focusBasedRewards.push(
            { name: "Aromatherapy Session", cost: 100 },
            { name: "Spa Day", cost: 500 },
            { name: "Meditation Cushion", cost: 180 }
          );
          focusBasedXPActivities.push(
            { name: "Complete Meditation", xp: 30, type: "core" as const, category: "Wellness" },
            { name: "Practice Gratitude", xp: 20, type: "core" as const, category: "Wellness" },
            { name: "Self-Care Activity", xp: 25, type: "bonus" as const, category: "Wellness" }
          );
          addAchievement(userId, {
            name: "Zen Master",
            description: "Meditate for 100 sessions",
            icon: "🧘",
            category: "Wellness",
            requirement: 100,
            xpReward: 1000,
            activityType: "meditation_sessions",
            unit: "sessions"
          });
          break;

        case "creative":
        case "music":
          focusBasedHabits.push(
            { title: "Creative Practice", description: "30 minutes creative work", streak: 0, reminders: [] },
            { title: "Inspiration Gathering", description: "Collect creative inspiration", streak: 0, reminders: [] }
          );
          focusBasedTodos.push(
            { title: "Set up creative workspace", completed: false },
            { title: "Organize creative tools", completed: false },
            { title: "Start creative project", completed: false }
          );
          focusBasedRewards.push(
            { name: "Art Supplies", cost: 150 },
            { name: "Creative Workshop", cost: 300 },
            { name: "Gallery Visit", cost: 120 }
          );
          focusBasedXPActivities.push(
            { name: "Creative Session", xp: 40, type: "core" as const, category: "Creative" },
            { name: "Complete Art Piece", xp: 60, type: "bonus" as const, category: "Creative" },
            { name: "Share Creative Work", xp: 35, type: "bonus" as const, category: "Creative" }
          );
          addAchievement(userId, {
            name: "Creative Genius",
            description: "Complete 25 creative projects",
            icon: "🎨",
            category: "Creative",
            requirement: 25,
            xpReward: 600,
            activityType: "creative_projects",
            unit: "projects"
          });
          break;

        case "career":
        case "business":
          focusBasedHabits.push(
            { title: "Skill Development", description: "30 minutes skill building", streak: 0, reminders: [] },
            { title: "Network Building", description: "Connect with 1 professional", streak: 0, reminders: [] }
          );
          focusBasedTodos.push(
            { title: "Update resume/portfolio", completed: false },
            { title: "Set career goals", completed: false },
            { title: "Research industry trends", completed: false }
          );
          focusBasedRewards.push(
            { name: "Professional Course", cost: 400 },
            { name: "Networking Event", cost: 200 },
            { name: "Business Book", cost: 80 }
          );
          focusBasedXPActivities.push(
            { name: "Skill Practice", xp: 35, type: "core" as const, category: "Career" },
            { name: "Professional Connection", xp: 25, type: "core" as const, category: "Networking" },
            { name: "Complete Project", xp: 75, type: "bonus" as const, category: "Career" }
          );
          addAchievement(userId, {
            name: "Career Climber",
            description: "Complete 40 skill development sessions",
            icon: "💼",
            category: "Career",
            requirement: 40,
            xpReward: 800,
            activityType: "skill_sessions",
            unit: "sessions"
          });
          break;
      }
    });

    // Generate sample journal entries
    const today = new Date();
    const journalEntries = [
      {
        date: today.toISOString().split('T')[0],
        title: "My Journey Begins",
        content: `Today I started my journey with HabitForge! I'm excited about focusing on ${data.focusAreas.join(', ')}. ${data.motivation.slice(0, 100)}...`,
        mood: 4,
        tags: ["motivation", "goals", "beginning"]
      },
      {
        date: new Date(today.getTime() - 86400000).toISOString().split('T')[0],
        title: "Reflection on Goals",
        content: "Taking time to think about what I want to achieve and why it matters to me.",
        mood: 3,
        tags: ["reflection", "goals"]
      }
    ];

    // Combine all content
    const allHabits = [...baseHabits, ...focusBasedHabits];
    const allTodos = [...baseTodos, ...focusBasedTodos];
    const allRewards = [...baseRewards, ...focusBasedRewards];
    const allXPActivities = [...baseXPActivities, ...focusBasedXPActivities];
    const allJournalPrompts = [...baseJournalPrompts, ...focusBasedJournalPrompts];

    // Generate all content
    generateHabits(allHabits);
    generateTodos(allTodos);
    generateRewards(allRewards);
    generateXPActivities(allXPActivities);
    generateJournalEntries(journalEntries);
    generateJournalPrompts(allJournalPrompts);
    initializeAchievements();
    
    // Generate templates based on onboarding data
    generateTemplatesFromOnboarding(userId, data);

    // Personalize dashboard based on user preferences
    const recommendedTabs = ["habits", "tasks", "progress", "settings"];
    
    // Add tabs based on focus areas
    if (data.focusAreas.includes("fitness") || data.focusAreas.includes("wellness")) {
      recommendedTabs.push("tracker", "mastery");
    }
    if (data.focusAreas.includes("learning") || data.focusAreas.includes("programming")) {
      recommendedTabs.push("focus", "journal");
    }
    if (data.focusAreas.includes("creative") || data.focusAreas.includes("music")) {
      recommendedTabs.push("vision", "journal");
    }
    if (data.focusAreas.includes("career") || data.focusAreas.includes("business")) {
      recommendedTabs.push("xp", "achievements");
    }
    
    // Always include rewards and activity tracker
    recommendedTabs.push("rewards", "tracker");

    // Remove duplicates and save to localStorage
    const uniqueTabs = [...new Set(recommendedTabs)];
    localStorage.setItem('dashboard-visible-tabs', JSON.stringify(uniqueTabs));

    // Save user preferences for future personalization
    localStorage.setItem('user-onboarding-data', JSON.stringify(data));

    setOnboardingCompleted(true);
    toast({
      title: "Journey Setup Complete!",
      description:
        "Your personalized dashboard is ready with habits, tasks, rewards, achievements, and more!",
    });
    navigate("/dashboard");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='text-center space-y-8 py-12 px-4'>
            <div className='relative'>
              <div className='absolute inset-0 bg-gradient-to-r from-violet-400 via-pink-400 to-cyan-400 rounded-full blur-3xl opacity-20 animate-pulse'></div>
              <Sparkles className='h-20 w-20 text-transparent bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 bg-clip-text mx-auto relative z-10 animate-bounce' />
            </div>
            <div className='space-y-4'>
              <h1 className='text-5xl md:text-7xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent leading-tight'>
                Welcome to
              </h1>
              <div className='relative'>
                <h2 className='text-4xl md:text-6xl font-black bg-gradient-to-r from-pink-500 via-violet-500 to-cyan-500 bg-clip-text text-transparent'>
                  HabitForge
                </h2>
                <div className='absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-ping opacity-75'></div>
              </div>
              <h3 className='text-2xl md:text-3xl font-bold text-gray-700'>
                Esteemed Trailblazer! ✨
              </h3>
            </div>
            <div className='max-w-2xl mx-auto space-y-6'>
              <p className='text-lg md:text-xl text-gray-600 leading-relaxed font-medium'>
                We're absolutely{" "}
                <span className='font-bold text-pink-600'>thrilled</span> to
                welcome you into our exclusive circle of{" "}
                <span className='font-bold text-violet-600'>visionaries</span>!
              </p>
              <p className='text-base md:text-lg text-gray-500'>
                Your extraordinary journey of transformation begins today. With
                elegant tools, personalized encouragement, and a community that
                celebrates your every victory, you're not just a user—you're a{" "}
                <span className='font-semibold text-cyan-600'>
                  cherished architect of change
                </span>
                .
              </p>
              <div className='flex items-center justify-center gap-2 text-sm text-gray-400'>
                <Heart className='w-4 h-4 text-pink-400' />
                <span>
                  Let's embark on this magnificent adventure together!
                </span>
                <Sparkles className='w-4 h-4 text-violet-400' />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className='space-y-8 py-8'>
            <div className='text-center space-y-3'>
              <div className='relative'>
                <Users className='w-12 h-12 text-cyan-500 mx-auto' />
                <div className='absolute -top-1 -right-1 w-4 h-4 bg-pink-400 rounded-full animate-pulse'></div>
              </div>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-cyan-600 to-violet-600 bg-clip-text text-transparent'>
                Choose Your Adventure
              </h2>
              <p className='text-gray-500 max-w-md mx-auto'>
                Select all areas that spark your curiosity. Mix and match to
                create your unique journey!
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {focusAreaOptions.map((area) => (
                <div
                  key={area.id}
                  className={`group relative overflow-hidden rounded-2xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                    data.focusAreas.includes(area.id)
                      ? "border-transparent shadow-2xl scale-105"
                      : "border-gray-200 hover:border-gray-300 hover:shadow-lg"
                  }`}
                  onClick={() => {
                    updateData({
                      focusAreas: data.focusAreas.includes(area.id)
                        ? data.focusAreas.filter((a) => a !== area.id)
                        : [...data.focusAreas, area.id],
                    });
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${
                      area.gradient
                    } opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${
                      data.focusAreas.includes(area.id) ? "opacity-20" : ""
                    }`}
                  ></div>

                  {data.focusAreas.includes(area.id) && (
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-10`}
                    ></div>
                  )}

                  <div className='relative p-5 space-y-3'>
                    <div className='flex items-center gap-3'>
                      <div
                        className={`text-2xl p-2 rounded-xl bg-gradient-to-br ${area.gradient} bg-opacity-10`}
                      >
                        {area.icon}
                      </div>
                      <span className='font-semibold text-gray-800 text-sm leading-tight'>
                        {area.label}
                      </span>
                    </div>
                    <p className='text-xs text-gray-500 leading-relaxed'>
                      {area.description}
                    </p>
                  </div>

                  {data.focusAreas.includes(area.id) && (
                    <div className='absolute top-3 right-3'>
                      <div
                        className={`w-6 h-6 rounded-full bg-gradient-to-r ${area.gradient} flex items-center justify-center`}
                      >
                        <span className='text-white text-xs font-bold'>✓</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className='space-y-3 bg-gray-50 rounded-2xl p-6 border border-gray-100'>
              <label className='block text-sm font-semibold text-gray-700'>
                🎯 Custom Focus Area
              </label>
              <input
                placeholder='e.g., Public Speaking Mastery, Quantum Physics, Beekeeping...'
                value={data.customFocusArea}
                onChange={(e) =>
                  updateData({ customFocusArea: e.target.value })
                }
                className='w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all duration-200'
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className='space-y-8 py-8'>
            <div className='text-center space-y-3'>
              <Brain className='w-12 h-12 text-pink-500 mx-auto' />
              <h2 className='text-3xl font-bold bg-gradient-to-r from-pink-600 to-orange-600 bg-clip-text text-transparent'>
                Tell Us Your Story
              </h2>
              <p className='text-gray-500 max-w-md mx-auto'>
                Understanding your background helps us craft the perfect journey
                for you.
              </p>
            </div>

            <div className='space-y-8'>
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-pink-400 rounded-full'></span>
                  Experience Level in Your Goal Area
                </h3>
                <div className='grid grid-cols-1 gap-3'>
                  {[
                    {
                      value: "beginner",
                      label: "Beginner",
                      desc: "Starting fresh with curiosity",
                      icon: "🌱",
                      color: "from-green-400 to-emerald-400",
                    },
                    {
                      value: "intermediate",
                      label: "Intermediate",
                      desc: "Some experience under my belt",
                      icon: "🚀",
                      color: "from-blue-400 to-cyan-400",
                    },
                    {
                      value: "advanced",
                      label: "Advanced",
                      desc: "Looking to master and excel",
                      icon: "⭐",
                      color: "from-purple-400 to-pink-400",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        data.experienceLevel === option.value
                          ? "border-transparent shadow-xl bg-gradient-to-r " +
                            option.color +
                            " bg-opacity-10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() =>
                        updateData({ experienceLevel: option.value })
                      }
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${option.color} bg-opacity-20`}
                        >
                          {option.icon}
                        </div>
                        <div className='flex-1'>
                          <div className='font-semibold text-gray-800'>
                            {option.label}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {option.desc}
                          </div>
                        </div>
                        {data.experienceLevel === option.value && (
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}
                          >
                            <span className='text-white text-xs font-bold'>
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-orange-400 rounded-full'></span>
                  Daily Time Commitment
                </h3>
                <div className='grid grid-cols-1 gap-3'>
                  {[
                    {
                      value: "minimal",
                      label: "5-15 minutes",
                      desc: "Quick, focused sessions",
                      icon: "⚡",
                      color: "from-yellow-400 to-orange-400",
                    },
                    {
                      value: "moderate",
                      label: "15-30 minutes",
                      desc: "Balanced, steady approach",
                      icon: "⚖️",
                      color: "from-blue-400 to-indigo-400",
                    },
                    {
                      value: "dedicated",
                      label: "30+ minutes",
                      desc: "Deep focus and immersion",
                      icon: "🔥",
                      color: "from-red-400 to-pink-400",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        data.timeCommitment === option.value
                          ? "border-transparent shadow-xl bg-gradient-to-r " +
                            option.color +
                            " bg-opacity-10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() =>
                        updateData({ timeCommitment: option.value })
                      }
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${option.color} bg-opacity-20`}
                        >
                          {option.icon}
                        </div>
                        <div className='flex-1'>
                          <div className='font-semibold text-gray-800'>
                            {option.label}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {option.desc}
                          </div>
                        </div>
                        {data.timeCommitment === option.value && (
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}
                          >
                            <span className='text-white text-xs font-bold'>
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className='space-y-8 py-8'>
            <div className='text-center space-y-3'>
              <Clock className='w-12 h-12 text-indigo-500 mx-auto' />
              <h2 className='text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent'>
                Your Learning DNA
              </h2>
              <p className='text-gray-500 max-w-md mx-auto'>
                Everyone learns differently. Help us understand your unique
                style and rhythm.
              </p>
            </div>

            <div className='space-y-8'>
              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-indigo-400 rounded-full'></span>
                  Preferred Learning Style
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                  {[
                    {
                      value: "visual",
                      label: "Visual Learner",
                      desc: "Videos, diagrams, reading",
                      icon: "👀",
                      color: "from-blue-400 to-cyan-400",
                    },
                    {
                      value: "hands-on",
                      label: "Hands-On",
                      desc: "Practice, projects, experiments",
                      icon: "🔧",
                      color: "from-green-400 to-emerald-400",
                    },
                    {
                      value: "structured",
                      label: "Structured",
                      desc: "Courses, step-by-step guides",
                      icon: "📋",
                      color: "from-purple-400 to-violet-400",
                    },
                    {
                      value: "social",
                      label: "Social",
                      desc: "Groups, mentors, discussions",
                      icon: "👥",
                      color: "from-pink-400 to-rose-400",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        data.learningStyle === option.value
                          ? "border-transparent shadow-xl bg-gradient-to-r " +
                            option.color +
                            " bg-opacity-10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() =>
                        updateData({ learningStyle: option.value })
                      }
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${option.color} bg-opacity-20`}
                        >
                          {option.icon}
                        </div>
                        <div className='flex-1'>
                          <div className='font-semibold text-gray-800'>
                            {option.label}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {option.desc}
                          </div>
                        </div>
                        {data.learningStyle === option.value && (
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}
                          >
                            <span className='text-white text-xs font-bold'>
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='text-lg font-semibold text-gray-800 flex items-center gap-2'>
                  <span className='w-2 h-2 bg-purple-400 rounded-full'></span>
                  Preferred Schedule
                </h3>
                <div className='grid grid-cols-1 gap-3'>
                  {[
                    {
                      value: "morning",
                      label: "Morning Person",
                      desc: "Early bird catches the worm",
                      icon: "🌅",
                      color: "from-amber-400 to-orange-400",
                    },
                    {
                      value: "evening",
                      label: "Night Owl",
                      desc: "Evening routines and late sessions",
                      icon: "🌙",
                      color: "from-indigo-400 to-purple-400",
                    },
                    {
                      value: "flexible",
                      label: "Flexible",
                      desc: "Anytime that fits my life",
                      icon: "🔄",
                      color: "from-teal-400 to-cyan-400",
                    },
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`relative overflow-hidden rounded-xl border-2 p-4 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        data.schedule === option.value
                          ? "border-transparent shadow-xl bg-gradient-to-r " +
                            option.color +
                            " bg-opacity-10"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                      onClick={() => updateData({ schedule: option.value })}
                    >
                      <div className='flex items-center gap-4'>
                        <div
                          className={`text-2xl p-2 rounded-lg bg-gradient-to-r ${option.color} bg-opacity-20`}
                        >
                          {option.icon}
                        </div>
                        <div className='flex-1'>
                          <div className='font-semibold text-gray-800'>
                            {option.label}
                          </div>
                          <div className='text-sm text-gray-500'>
                            {option.desc}
                          </div>
                        </div>
                        {data.schedule === option.value && (
                          <div
                            className={`w-6 h-6 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}
                          >
                            <span className='text-white text-xs font-bold'>
                              ✓
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className='space-y-8 py-8'>
            <div className='text-center space-y-3'>
              <div className='relative'>
                <Heart className='w-12 h-12 text-rose-500 mx-auto' />
                <div className='absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse'></div>
              </div>
              <h2 className='text-3xl font-bold bg-gradient-to-r from-rose-600 to-orange-600 bg-clip-text text-transparent'>
                Your Why
              </h2>
              <p className='text-gray-500 max-w-md mx-auto'>
                What ignites your passion? Your 'why' will be your North Star on
                challenging days.
              </p>
            </div>
            <div className='space-y-4'>
              <div className='bg-gradient-to-br from-rose-50 via-orange-50 to-yellow-50 rounded-2xl p-8 border border-rose-100'>
                <textarea
                  placeholder='Share your story... What drives you? What would achieving this goal mean to you? How will it transform your life? Paint us a picture of your success!'
                  value={data.motivation}
                  onChange={(e) => updateData({ motivation: e.target.value })}
                  className='w-full min-h-[150px] bg-transparent border-none outline-none resize-none text-lg placeholder-gray-400 font-medium leading-relaxed'
                />
              </div>
              <div className='flex items-center gap-2 text-sm text-gray-400 justify-center'>
                <Sparkles className='w-4 h-4' />
                <span>Your story inspires us and fuels your journey</span>
                <Heart className='w-4 h-4 text-rose-400' />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return true; // Always true for welcome screen
      case 2:
        return (
          data.focusAreas.length > 0 || data.customFocusArea.trim().length > 0
        );
      case 3:
        return data.experienceLevel && data.timeCommitment;
      case 4:
        return data.learningStyle && data.schedule;
      case 5:
        return data.motivation.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-violet-100 via-pink-50 to-cyan-100 flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Animated background elements */}
      <div className='absolute inset-0'>
        <div className='absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-violet-300 to-pink-300 rounded-full blur-3xl opacity-20 animate-pulse'></div>
        <div className='absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-cyan-300 to-blue-300 rounded-full blur-3xl opacity-20 animate-pulse delay-1000'></div>
        <div className='absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full blur-2xl opacity-15 animate-pulse delay-500'></div>
      </div>

      <Card className='w-full max-w-4xl bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/50 relative z-10 overflow-hidden'>
        {/* Progress bar background */}
        <div className='absolute top-0 left-0 right-0 h-1 bg-gray-100'>
          <div
            className='h-full bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 transition-all duration-500 ease-out'
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <CardHeader className='text-center pb-4 pt-8'>
          <div className='flex flex-col items-center justify-center space-y-4'>
            <CardTitle className='text-2xl md:text-3xl font-black bg-gradient-to-r from-violet-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent'>
              Setup Your Magnificent Journey
            </CardTitle>
            <div className='flex items-center gap-4'>
              <span className='text-sm font-medium text-gray-600'>
                Step {currentStep} of {totalSteps}
              </span>
              <div className='flex gap-1'>
                {Array.from({ length: totalSteps }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i < currentStep
                        ? "bg-gradient-to-r from-violet-500 to-pink-500"
                        : "bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-8 p-6 md:p-10 min-h-[600px]'>
          <div className='transition-all duration-500 ease-in-out'>
            {renderStep()}
          </div>

          <div className='flex justify-between items-center pt-8 border-t border-gray-100'>
            <Button
              variant='outline'
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className='group border-2 border-gray-200 text-gray-600 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-6 py-3 rounded-2xl font-medium'
            >
              <ArrowLeft className='h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200' />
              Previous
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
                className='group bg-gradient-to-r from-violet-500 via-pink-500 to-cyan-500 hover:from-violet-600 hover:via-pink-600 hover:to-cyan-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:hover:scale-100'
              >
                Next
                <ArrowRight className='h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-200' />
              </Button>
            ) : (
              <Button
                onClick={generatePersonalizedContent}
                disabled={!canProceed()}
                className='group bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 hover:from-emerald-600 hover:via-cyan-600 hover:to-blue-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 px-8 py-3 rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:hover:scale-100 relative overflow-hidden'
              >
                <div className='absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                <span className='relative flex items-center'>
                  Create My Dashboard
                  <Sparkles className='h-4 w-4 ml-2 group-hover:rotate-12 transition-transform duration-200' />
                </span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
