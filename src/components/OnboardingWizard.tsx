import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuthStore } from "@/stores/authStore";
import { useAchievementsStore } from "@/stores/achievementsStore";
import { useHabitStore } from "@/stores/habitStore";
import { useTodoStore } from "@/stores/todoStore";
import { useRewardsStore } from "@/stores/rewardsStore";
import { useXPStore } from "@/stores/xpStore";
import { useJournalStore } from "@/stores/journalStore";
import { useTemplateStore } from "@/stores/templateStore";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Heart,
  Computer,
  Dumbbell,
  GraduationCap,
  Briefcase,
  Palette,
  Music,
  Brain,
  Rocket,
  Globe,
  ChefHat,
  DollarSign,
  Users,
  Eye,
  Wrench,
  BookOpen,
  User,
  Sun,
  Moon,
  Shuffle,
  Clock,
  Zap,
  Scale,
  Flame
} from "lucide-react";

interface OnboardingData {
  focusAreas: string[];
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
    icon: Computer,
    description: "Learn coding languages, frameworks, and development skills",
    gradient: "from-blue-500 to-cyan-500",
    color: "bg-blue-100 text-blue-700"
  },
  {
    id: "fitness",
    label: "Physical Fitness & Health",
    icon: Dumbbell,
    description: "Build strength, endurance, and maintain healthy lifestyle",
    gradient: "from-green-500 to-emerald-500",
    color: "bg-green-100 text-green-700"
  },
  {
    id: "learning",
    label: "Academic Learning & Education",
    icon: GraduationCap,
    description: "Study subjects, earn certifications, expand knowledge",
    gradient: "from-purple-500 to-violet-500",
    color: "bg-purple-100 text-purple-700"
  },
  {
    id: "career",
    label: "Career Development",
    icon: Briefcase,
    description: "Professional growth, networking, skill advancement",
    gradient: "from-orange-500 to-red-500",
    color: "bg-orange-100 text-orange-700"
  },
  {
    id: "creative",
    label: "Creative Arts & Design",
    icon: Palette,
    description: "Art, design, writing, photography, creative expression",
    gradient: "from-pink-500 to-rose-500",
    color: "bg-pink-100 text-pink-700"
  },
  {
    id: "music",
    label: "Music & Audio",
    icon: Music,
    description: "Learn instruments, music theory, audio production",
    gradient: "from-indigo-500 to-purple-500",
    color: "bg-indigo-100 text-indigo-700"
  },
  {
    id: "wellness",
    label: "Mental Health & Wellness",
    icon: Brain,
    description: "Mindfulness, meditation, stress management, self-care",
    gradient: "from-teal-500 to-cyan-500",
    color: "bg-teal-100 text-teal-700"
  },
  {
    id: "business",
    label: "Business & Entrepreneurship",
    icon: Rocket,
    description: "Start business, develop products, marketing, sales",
    gradient: "from-yellow-500 to-orange-500",
    color: "bg-yellow-100 text-yellow-700"
  },
  {
    id: "languages",
    label: "Language Learning",
    icon: Globe,
    description: "Learn new languages, improve communication skills",
    gradient: "from-emerald-500 to-teal-500",
    color: "bg-emerald-100 text-emerald-700"
  },
  {
    id: "cooking",
    label: "Cooking & Nutrition",
    icon: ChefHat,
    description: "Culinary skills, healthy eating, meal planning",
    gradient: "from-amber-500 to-yellow-500",
    color: "bg-amber-100 text-amber-700"
  },
  {
    id: "finance",
    label: "Personal Finance",
    icon: DollarSign,
    description: "Budgeting, investing, financial planning, wealth building",
    gradient: "from-green-600 to-emerald-600",
    color: "bg-green-100 text-green-700"
  },
  {
    id: "relationships",
    label: "Social & Relationships",
    icon: Users,
    description: "Communication skills, networking, personal relationships",
    gradient: "from-rose-500 to-pink-500",
    color: "bg-rose-100 text-rose-700"
  },
];

const experienceLevels = [
  {
    id: "beginner",
    label: "Beginner",
    description: "Starting fresh with curiosity",
    icon: Sparkles,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "intermediate", 
    label: "Intermediate",
    description: "Some experience under my belt",
    icon: Rocket,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "advanced",
    label: "Advanced", 
    description: "Looking to master and excel",
    icon: Zap,
    gradient: "from-purple-500 to-pink-500"
  }
];

const timeCommitments = [
  {
    id: "5-15",
    label: "5-15 minutes",
    description: "Quick, focused sessions",
    icon: Clock,
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    id: "15-30",
    label: "15-30 minutes", 
    description: "Balanced, steady approach",
    icon: Scale,
    gradient: "from-blue-500 to-indigo-500"
  },
  {
    id: "30+",
    label: "30+ minutes",
    description: "Deep focus and immersion",
    icon: Flame,
    gradient: "from-pink-500 to-red-500"
  }
];

const learningStyles = [
  {
    id: "visual",
    label: "Visual Learner",
    description: "Videos, diagrams, reading",
    icon: Eye,
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    id: "hands-on",
    label: "Hands-On",
    description: "Practice, projects, experiments", 
    icon: Wrench,
    gradient: "from-green-500 to-emerald-500"
  },
  {
    id: "structured",
    label: "Structured",
    description: "Courses, step-by-step guides",
    icon: BookOpen,
    gradient: "from-purple-500 to-indigo-500"
  },
  {
    id: "social",
    label: "Social",
    description: "Groups, mentors, discussions",
    icon: Users,
    gradient: "from-pink-500 to-rose-500"
  }
];

const schedules = [
  {
    id: "morning",
    label: "Morning Person",
    description: "Early bird catches the worm",
    icon: Sun,
    gradient: "from-orange-500 to-yellow-500"
  },
  {
    id: "night",
    label: "Night Owl",
    description: "Evening routines and late sessions",
    icon: Moon,
    gradient: "from-indigo-500 to-purple-500"
  },
  {
    id: "flexible",
    label: "Flexible",
    description: "Anytime that fits my life",
    icon: Shuffle,
    gradient: "from-teal-500 to-cyan-500"
  }
];

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { updateUser } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 5;
  const progress = (currentStep / totalSteps) * 100;
  const [data, setData] = useState<OnboardingData>({
    focusAreas: [],
    experienceLevel: "",
    timeCommitment: "",
    learningStyle: "",
    schedule: "",
    motivation: "",
  });

  const { toast } = useToast();
  const { setOnboardingCompleted } = useAuthStore();
  const initializeAchievements = useAchievementsStore((state) => state.initialize);
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
  };

  const handleComplete = async () => {
    try {
      // Update user with onboarding data
      updateUser({
        focusAreas: data.focusAreas,
        experienceLevel: data.experienceLevel,
        timeCommitment: data.timeCommitment,
        preferences: {
          learningStyle: data.learningStyle,
          schedule: data.schedule,
          motivation: data.motivation,
        },
        onboardingComplete: true,
      });

      // Generate personalized content
      generatePersonalizedContent();

      toast({
        title: "Welcome to HabitForge! 🎉",
        description: "Your personalized dashboard is ready to help you build amazing habits!",
      });

      // Mark onboarding as completed
      setOnboardingCompleted(true);

      // Navigate to dashboard
      navigate("/");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      toast({
        title: "Something went wrong",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return true; // Welcome screen
      case 2:
        return data.focusAreas.length > 0;
      case 3:
        return data.experienceLevel && data.timeCommitment;
      case 4:
        return data.learningStyle && data.schedule;
      case 5:
        return data.motivation.trim().length > 10;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-8 py-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary-light bg-clip-text text-transparent">
                Welcome to<br />HabitForge
              </h1>
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl font-semibold text-foreground/80">Esteemed Trailblazer!</h2>
                <Sparkles className="h-6 w-6 text-primary-glow" />
              </div>
            </div>
            
            <div className="max-w-2xl mx-auto space-y-6">
              <p className="text-lg text-foreground/70">
                We're absolutely <span className="text-primary font-semibold">thrilled</span> to welcome you into our exclusive circle of{" "}
                <span className="text-primary-glow font-semibold">visionaries</span>!
              </p>
              
              <p className="text-base text-foreground/60 leading-relaxed">
                Your extraordinary journey of transformation begins today. With elegant tools, 
                personalized encouragement, and a community that celebrates your every victory, 
                you're not just a user—you're a <span className="text-primary font-semibold">cherished architect of change</span>.
              </p>
              
              <div className="flex items-center justify-center gap-2 pt-4">
                <Heart className="h-5 w-5 text-primary-glow" />
                <span className="text-foreground/60">Let's embark on this magnificent adventure together!</span>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="h-8 w-8 text-primary" />
                <h2 className="text-4xl font-bold text-primary">Choose Your Adventure</h2>
              </div>
              <p className="text-foreground/70 text-lg">
                Select all areas that spark your curiosity. Mix and match to create your unique journey!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {focusAreaOptions.map((option) => {
                const isSelected = data.focusAreas.includes(option.id);
                const Icon = option.icon;
                
                return (
                  <Card
                    key={option.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-primary shadow-lg' 
                        : 'hover:ring-1 hover:ring-muted-foreground/20'
                    }`}
                    onClick={() => {
                      const newFocusAreas = isSelected
                        ? data.focusAreas.filter(area => area !== option.id)
                        : [...data.focusAreas, option.id];
                      updateData({ focusAreas: newFocusAreas });
                    }}
                  >
                    <CardHeader className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${option.gradient}`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold leading-tight">
                            {option.label}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-2">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-4xl font-bold text-primary">Tell Us Your Story</h2>
              <p className="text-foreground/70 text-lg">
                Understanding your background helps us craft the perfect journey for you.
              </p>
            </div>

            <div className="space-y-8">
              {/* Experience Level */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  Experience Level in Your Goal Area
                </h3>
                
                <div className="space-y-3">
                  {experienceLevels.map((level) => {
                    const isSelected = data.experienceLevel === level.id;
                    const Icon = level.icon;
                    
                    return (
                      <Card
                        key={level.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => updateData({ experienceLevel: level.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${level.gradient}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{level.label}</h4>
                              <p className="text-muted-foreground">{level.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Time Commitment */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-glow rounded-full"></div>
                  Daily Time Commitment
                </h3>
                
                <div className="space-y-3">
                  {timeCommitments.map((time) => {
                    const isSelected = data.timeCommitment === time.id;
                    const Icon = time.icon;
                    
                    return (
                      <Card
                        key={time.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => updateData({ timeCommitment: time.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${time.gradient}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{time.label}</h4>
                              <p className="text-muted-foreground">{time.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Clock className="h-8 w-8 text-primary" />
                <h2 className="text-4xl font-bold text-primary">Your Learning DNA</h2>
              </div>
              <p className="text-foreground/70 text-lg">
                Everyone learns differently. Help us understand your unique style and rhythm.
              </p>
            </div>

            <div className="space-y-8">
              {/* Learning Style */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  Preferred Learning Style
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {learningStyles.map((style) => {
                    const isSelected = data.learningStyle === style.id;
                    const Icon = style.icon;
                    
                    return (
                      <Card
                        key={style.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => updateData({ learningStyle: style.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${style.gradient}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{style.label}</h4>
                              <p className="text-muted-foreground text-sm">{style.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Preference */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <div className="w-3 h-3 bg-primary-glow rounded-full"></div>
                  Preferred Schedule
                </h3>
                
                <div className="space-y-3">
                  {schedules.map((schedule) => {
                    const isSelected = data.schedule === schedule.id;
                    const Icon = schedule.icon;
                    
                    return (
                      <Card
                        key={schedule.id}
                        className={`cursor-pointer transition-all duration-200 ${
                          isSelected 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => updateData({ schedule: schedule.id })}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${schedule.gradient}`}>
                              <Icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">{schedule.label}</h4>
                              <p className="text-muted-foreground">{schedule.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-6">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-primary via-primary-glow to-primary-light bg-clip-text text-transparent">
                Setup Your Magnificent Journey
              </h2>
              <p className="text-foreground/60 text-base">Step 5 of 5</p>
              
              <div className="py-8">
                <Heart className="h-16 w-16 text-primary-glow mx-auto mb-6" />
                <h3 className="text-3xl font-bold text-primary mb-4">Your Why</h3>
                <p className="text-foreground/70 max-w-2xl mx-auto">
                  What ignites your passion? Your 'why' will be your North Star on challenging days.
                </p>
              </div>
            </div>

            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <Textarea
                  placeholder="Share your story... What drives you? What would achieving this goal mean to you? How will it transform your life? Paint us a picture of your success!"
                  value={data.motivation}
                  onChange={(e) => updateData({ motivation: e.target.value })}
                  className="min-h-[200px] text-base leading-relaxed border-0 bg-transparent resize-none"
                />
              </CardContent>
            </Card>

            <div className="text-center py-4">
              <p className="text-foreground/60 flex items-center justify-center gap-2">
                <Sparkles className="h-4 w-4" />
                Your story inspires us and fuels your journey
                <Heart className="h-4 w-4 text-primary-glow" />
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-welcome p-4">
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground/70">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="text-sm font-medium text-foreground/70">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="h-3 bg-white/40" />
        </div>

        {/* Main Content */}
        <Card className="shadow-welcome border-0 bg-card/95 backdrop-blur-lg">
          <CardContent className="p-8">
            {renderStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/10 transition-calm"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentStep === totalSteps ? (
            <Button
              onClick={handleComplete}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground shadow-calm transition-calm"
            >
              Create My Dashboard!
              <Sparkles className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceedToNext()}
              className="flex items-center gap-2 bg-primary hover:bg-primary-glow text-primary-foreground shadow-calm transition-calm"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}