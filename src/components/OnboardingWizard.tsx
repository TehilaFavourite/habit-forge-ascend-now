import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";
import { useAchievementsStore } from "@/stores/achievementsStore";
import { useHabitStore } from "@/stores/habitStore";
import { useTodoStore } from "@/stores/todoStore";
import { useRewardsStore } from "@/stores/rewardsStore";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Sparkles, Target, Calendar, Trophy, BookOpen, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingData {
  primaryGoal: string;
  focusAreas: string[];
  customFocusArea: string;
  experienceLevel: string;
  timeCommitment: string;
  learningStyle: string;
  schedule: string;
  motivation: string;
  challenges: string[];
}

const focusAreaOptions = [
  { id: "programming", label: "Programming & Software Development", icon: "💻", description: "Learn coding languages, frameworks, and development skills" },
  { id: "fitness", label: "Physical Fitness & Health", icon: "💪", description: "Build strength, endurance, and maintain healthy lifestyle" },
  { id: "learning", label: "Academic Learning & Education", icon: "📚", description: "Study subjects, earn certifications, expand knowledge" },
  { id: "career", label: "Career Development", icon: "💼", description: "Professional growth, networking, skill advancement" },
  { id: "creative", label: "Creative Arts & Design", icon: "🎨", description: "Art, design, writing, photography, creative expression" },
  { id: "music", label: "Music & Audio", icon: "🎵", description: "Learn instruments, music theory, audio production" },
  { id: "wellness", label: "Mental Health & Wellness", icon: "🧘", description: "Mindfulness, meditation, stress management, self-care" },
  { id: "business", label: "Business & Entrepreneurship", icon: "🚀", description: "Start business, develop products, marketing, sales" },
  { id: "languages", label: "Language Learning", icon: "🌍", description: "Learn new languages, improve communication skills" },
  { id: "cooking", label: "Cooking & Nutrition", icon: "👨‍🍳", description: "Culinary skills, healthy eating, meal planning" },
  { id: "finance", label: "Personal Finance", icon: "💰", description: "Budgeting, investing, financial planning, wealth building" },
  { id: "relationships", label: "Social & Relationships", icon: "👥", description: "Communication skills, networking, personal relationships" },
  { id: "hobbies", label: "Hobbies & Crafts", icon: "🎯", description: "Personal interests, crafting, collecting, recreational activities" },
  { id: "travel", label: "Travel & Adventure", icon: "✈️", description: "Explore new places, cultural experiences, adventure sports" },
  { id: "reading", label: "Reading & Literature", icon: "📖", description: "Read books, improve comprehension, literary analysis" },
  { id: "gaming", label: "Gaming & Esports", icon: "🎮", description: "Video games, competitive gaming, game development" },
  { id: "sports", label: "Sports & Athletics", icon: "⚽", description: "Team sports, individual athletics, competitive training" },
  { id: "technology", label: "Technology & Innovation", icon: "🔬", description: "Latest tech trends, gadgets, innovation, research" },
  { id: "environment", label: "Environmental & Sustainability", icon: "🌱", description: "Eco-friendly living, sustainability, environmental awareness" },
  { id: "spirituality", label: "Spirituality & Philosophy", icon: "🕯️", description: "Spiritual growth, philosophical study, personal beliefs" }
];

export const OnboardingWizard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, updateUser } = useAuthStore();
  const { addAchievement, initializeUserData } = useAchievementsStore();
  const { addHabit } = useHabitStore();
  const { addTodo } = useTodoStore();
  const { addReward } = useRewardsStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({
    primaryGoal: "",
    focusAreas: [],
    customFocusArea: "",
    experienceLevel: "",
    timeCommitment: "",
    learningStyle: "",
    schedule: "",
    motivation: "",
    challenges: []
  });

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFocusAreaChange = (areaId: string, checked: boolean) => {
    if (checked) {
      setData({ ...data, focusAreas: [...data.focusAreas, areaId] });
    } else {
      setData({ ...data, focusAreas: data.focusAreas.filter(id => id !== areaId) });
    }
  };

  const generatePersonalizedContent = async () => {
    if (!user?.id) return;

    try {
      // Initialize user data
      initializeUserData(user.id);

      // Generate achievements based on focus areas
      const allFocusAreas = [...data.focusAreas];
      if (data.customFocusArea) {
        allFocusAreas.push('custom');
      }

      for (const focusArea of allFocusAreas) {
        const focusConfig = focusAreaOptions.find(f => f.id === focusArea);
        const isCustom = focusArea === 'custom';
        
        // Create beginner achievement
        addAchievement(user.id, {
          name: isCustom ? `${data.customFocusArea} Starter` : `${focusConfig?.label} Beginner`,
          description: isCustom ? `Complete your first week of ${data.customFocusArea} practice` : `Start your journey in ${focusConfig?.label.toLowerCase()}`,
          icon: isCustom ? "⭐" : focusConfig?.icon || "🎯",
          category: isCustom ? "custom" : focusArea,
          requirement: data.experienceLevel === "beginner" ? 7 : 14,
          xpReward: 100,
          activityType: isCustom ? `${data.customFocusArea.toLowerCase().replace(/\s+/g, '_')}_sessions` : `${focusArea}_sessions`,
          unit: "sessions"
        });

        // Create intermediate achievement
        addAchievement(user.id, {
          name: isCustom ? `${data.customFocusArea} Enthusiast` : `${focusConfig?.label} Enthusiast`,
          description: isCustom ? `Complete 30 days of consistent ${data.customFocusArea} practice` : `Show dedication in ${focusConfig?.label.toLowerCase()}`,
          icon: isCustom ? "🌟" : focusConfig?.icon || "🎯",
          category: isCustom ? "custom" : focusArea,
          requirement: 30,
          xpReward: 250,
          activityType: isCustom ? `${data.customFocusArea.toLowerCase().replace(/\s+/g, '_')}_sessions` : `${focusArea}_sessions`,
          unit: "sessions"
        });

        // Create advanced achievement
        addAchievement(user.id, {
          name: isCustom ? `${data.customFocusArea} Master` : `${focusConfig?.label} Master`,
          description: isCustom ? `Achieve mastery with 100 ${data.customFocusArea} sessions` : `Reach mastery level in ${focusConfig?.label.toLowerCase()}`,
          icon: isCustom ? "👑" : focusConfig?.icon || "🎯",
          category: isCustom ? "custom" : focusArea,
          requirement: 100,
          xpReward: 500,
          activityType: isCustom ? `${data.customFocusArea.toLowerCase().replace(/\s+/g, '_')}_sessions` : `${focusArea}_sessions`,
          unit: "sessions"
        });
      }

      // Generate habits
      const timePerDay = parseInt(data.timeCommitment.split('-')[0]) || 30;
      for (const focusArea of allFocusAreas.slice(0, 3)) { // Limit to 3 main habits
        const focusConfig = focusAreaOptions.find(f => f.id === focusArea);
        const isCustom = focusArea === 'custom';
        
        addHabit({
          name: isCustom ? `Daily ${data.customFocusArea}` : `Daily ${focusConfig?.label.split('&')[0].trim()}`,
          icon: isCustom ? "⭐" : focusConfig?.icon || "🎯",
          color: "#8B5CF6",
          userId: user.id,
          frequency: "daily",
          goal: 1,
          isCore: true,
          description: isCustom ? `Spend ${timePerDay} minutes on ${data.customFocusArea}` : `Dedicate time to ${focusConfig?.description}`
        });
      }

      // Generate tasks
      const tasks = [
        `Set up your ${data.focusAreas[0]} learning environment`,
        `Research best practices for ${data.focusAreas[0]}`,
        `Create a weekly schedule for your goals`,
        `Join a community related to ${data.focusAreas[0]}`,
        `Set up progress tracking system`
      ];

      tasks.forEach((task, index) => {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + index + 1);
        
        addTodo({
          title: task,
          category: "general",
          userId: user.id
        });
      });

      // Generate rewards
      const rewards = [
        { name: "Coffee Break", description: "Enjoy a special coffee or tea", cost: 50, category: "small" },
        { name: "Movie Night", description: "Watch your favorite movie", cost: 150, category: "medium" },
        { name: "Weekend Adventure", description: "Plan a fun weekend activity", cost: 300, category: "large" },
        { name: "New Book/Course", description: "Invest in learning materials", cost: 200, category: "medium" },
        { name: "Celebration Meal", description: "Treat yourself to a nice meal", cost: 100, category: "small" }
      ];

      rewards.forEach((reward, index) => {
        addReward({
          name: reward.name,
          description: reward.description,
          level: index + 1,
          xpRequired: reward.cost,
          userId: user.id
        });
      });

      // Update user onboarding status
      if (user) {
        updateUser({ ...user, onboardingComplete: true });
      }

      toast({
        title: "Welcome to HabitForge!",
        description: "Your personalized dashboard has been created with achievements, habits, and tasks tailored to your goals."
      });

      navigate('/dashboard');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create personalized content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Sparkles className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Welcome to HabitForge!</h2>
              <p className="text-gray-600">Let's create a personalized experience just for you</p>
            </div>
            
            <div>
              <Label htmlFor="primaryGoal">What's your main goal right now?</Label>
              <Textarea
                id="primaryGoal"
                value={data.primaryGoal}
                onChange={(e) => setData({ ...data, primaryGoal: e.target.value })}
                placeholder="e.g., Learn React development, Get fit and healthy, Master guitar playing..."
                rows={3}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Target className="h-12 w-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Choose Your Focus Areas</h2>
              <p className="text-gray-600">Select all areas you want to work on (you can choose multiple)</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {focusAreaOptions.map((area) => (
                <div key={area.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <Checkbox
                    id={area.id}
                    checked={data.focusAreas.includes(area.id)}
                    onCheckedChange={(checked) => handleFocusAreaChange(area.id, checked as boolean)}
                  />
                  <div className="flex-1">
                    <label htmlFor={area.id} className="flex items-center gap-2 font-medium cursor-pointer">
                      <span className="text-lg">{area.icon}</span>
                      {area.label}
                    </label>
                    <p className="text-sm text-gray-500 mt-1">{area.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="customFocusArea">Custom Focus Area (Optional)</Label>
              <Input
                id="customFocusArea"
                value={data.customFocusArea}
                onChange={(e) => setData({ ...data, customFocusArea: e.target.value })}
                placeholder="e.g., Pottery, Beekeeping, Astronomy..."
                className="mt-2"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Experience & Time</h2>
              <p className="text-gray-600">Help us understand your current level and availability</p>
            </div>
            
            <div>
              <Label>What's your experience level in your main focus area?</Label>
              <RadioGroup value={data.experienceLevel} onValueChange={(value) => setData({ ...data, experienceLevel: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="beginner" id="beginner" />
                  <Label htmlFor="beginner">Beginner - Just starting out</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate - Some experience</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="advanced" id="advanced" />
                  <Label htmlFor="advanced">Advanced - Experienced, looking to master</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>How much time can you dedicate daily?</Label>
              <RadioGroup value={data.timeCommitment} onValueChange={(value) => setData({ ...data, timeCommitment: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="15-30" id="15-30" />
                  <Label htmlFor="15-30">15-30 minutes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="30-60" id="30-60" />
                  <Label htmlFor="30-60">30-60 minutes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="60-120" id="60-120" />
                  <Label htmlFor="60-120">1-2 hours</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="120+" id="120+" />
                  <Label htmlFor="120+">2+ hours</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Learning Preferences</h2>
              <p className="text-gray-600">How do you prefer to learn and when?</p>
            </div>
            
            <div>
              <Label>What's your preferred learning style?</Label>
              <RadioGroup value={data.learningStyle} onValueChange={(value) => setData({ ...data, learningStyle: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="visual" id="visual" />
                  <Label htmlFor="visual">Visual - Videos, diagrams, images</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="reading" id="reading" />
                  <Label htmlFor="reading">Reading - Books, articles, documentation</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hands-on" id="hands-on" />
                  <Label htmlFor="hands-on">Hands-on - Practice, experiments, projects</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mixed" id="mixed" />
                  <Label htmlFor="mixed">Mixed - Combination of all methods</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>When do you prefer to work on your goals?</Label>
              <RadioGroup value={data.schedule} onValueChange={(value) => setData({ ...data, schedule: value })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="early-morning" id="early-morning" />
                  <Label htmlFor="early-morning">Early morning (6-9 AM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="morning" id="morning" />
                  <Label htmlFor="morning">Morning (9-12 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="afternoon" id="afternoon" />
                  <Label htmlFor="afternoon">Afternoon (12-6 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="evening" id="evening" />
                  <Label htmlFor="evening">Evening (6-10 PM)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekends" id="weekends" />
                  <Label htmlFor="weekends">Mainly weekends</Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Motivation & Challenges</h2>
              <p className="text-gray-600">Help us understand what drives you and what might hold you back</p>
            </div>
            
            <div>
              <Label htmlFor="motivation">What motivates you most to achieve your goals?</Label>
              <Textarea
                id="motivation"
                value={data.motivation}
                onChange={(e) => setData({ ...data, motivation: e.target.value })}
                placeholder="e.g., Career advancement, personal satisfaction, helping others..."
                rows={3}
                className="mt-2"
              />
            </div>

            <div>
              <Label>What challenges do you typically face? (Select all that apply)</Label>
              <div className="space-y-2 mt-2">
                {[
                  "Lack of time",
                  "Procrastination",
                  "Lack of motivation",
                  "Too many distractions",
                  "Don't know where to start",
                  "Perfectionism",
                  "Inconsistency",
                  "Lack of accountability"
                ].map((challenge) => (
                  <div key={challenge} className="flex items-center space-x-2">
                    <Checkbox
                      id={challenge}
                      checked={data.challenges.includes(challenge)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setData({ ...data, challenges: [...data.challenges, challenge] });
                        } else {
                          setData({ ...data, challenges: data.challenges.filter(c => c !== challenge) });
                        }
                      }}
                    />
                    <Label htmlFor={challenge}>{challenge}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Palette className="h-12 w-12 text-purple-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Ready to Begin!</h2>
              <p className="text-gray-600">We'll create your personalized dashboard with:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Custom Achievements
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {(data.focusAreas.length + (data.customFocusArea ? 1 : 0)) * 3} achievements tailored to your focus areas
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Smart Habits
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {Math.min(data.focusAreas.length + (data.customFocusArea ? 1 : 0), 3)} daily habits based on your schedule
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    Action Tasks
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    5 starter tasks to get you moving toward your goals
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Reward System
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Motivational rewards to celebrate your progress
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Your Focus Areas:</h4>
              <div className="flex flex-wrap gap-2">
                {data.focusAreas.map(areaId => {
                  const area = focusAreaOptions.find(a => a.id === areaId);
                  return (
                    <span key={areaId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {area?.icon} {area?.label}
                    </span>
                  );
                })}
                {data.customFocusArea && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                    ⭐ {data.customFocusArea}
                  </span>
                )}
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
        return data.primaryGoal.trim().length > 0;
      case 2:
        return data.focusAreas.length > 0 || data.customFocusArea.trim().length > 0;
      case 3:
        return data.experienceLevel && data.timeCommitment;
      case 4:
        return data.learningStyle && data.schedule;
      case 5:
        return data.motivation.trim().length > 0;
      case 6:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Setup Your Journey</CardTitle>
            <span className="text-sm text-gray-500">Step {currentStep} of {totalSteps}</span>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        
        <CardContent className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            
            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canProceed()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={generatePersonalizedContent}
                disabled={!canProceed()}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                Create My Dashboard
                <Sparkles className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
