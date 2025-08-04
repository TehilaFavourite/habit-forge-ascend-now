import { useEffect, useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useAchievementsStore } from "@/stores/achievementsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Trophy,
  Target,
  BookOpen,
  Code,
  Shield,
  Users,
  Zap,
  Star,
} from "lucide-react";

export const AchievementsDisplay = () => {
  const { user } = useAuthStore();
  const { achievements, getUserAchievements, initializeDefaultAchievements } =
    useAchievementsStore();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (user?.id) {
      initializeDefaultAchievements(user.id);
    }
  }, [user?.id, initializeDefaultAchievements]);

  const userAchievements = getUserAchievements(user?.id || "");

  const categories = [
    {
      id: "all",
      name: "All Achievements",
      icon: Trophy,
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "consistency",
      name: "Consistency",
      icon: Zap,
      color: "from-orange-500 to-red-500",
    },
    {
      id: "learning",
      name: "Learning",
      icon: BookOpen,
      color: "from-blue-500 to-indigo-500",
    },
    {
      id: "coding",
      name: "Coding",
      icon: Code,
      color: "from-green-500 to-emerald-500",
    },
    {
      id: "security",
      name: "Security",
      icon: Shield,
      color: "from-purple-500 to-violet-500",
    },
    {
      id: "technical",
      name: "Technical Mastery",
      icon: Target,
      color: "from-cyan-500 to-blue-500",
    },
    {
      id: "community",
      name: "Community",
      icon: Users,
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "character",
      name: "Character",
      icon: Star,
      color: "from-yellow-500 to-orange-500",
    },
  ];

  const AchievementCard = ({ achievement }: { achievement: any }) => {
    const userAchievement = userAchievements.find(
      (ua) => ua.achievementId === achievement.id
    );
    const isUnlocked = userAchievement?.unlocked || false;
    const progress = userAchievement?.progress || 0;
    const progressPercentage =
      achievement.requirement > 0
        ? (progress / achievement.requirement) * 100
        : 0;

    return (
      <Card
        className={`transition-all duration-300 ${
          isUnlocked
            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300 shadow-lg"
            : "bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-md"
        }`}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <span className='text-2xl'>{achievement.icon}</span>
              <div>
                <CardTitle className='text-sm font-medium'>
                  {achievement.name}
                </CardTitle>
                {isUnlocked && (
                  <Badge
                    variant='default'
                    className='bg-yellow-500 text-white mt-1'
                  >
                    <Trophy className='h-3 w-3 mr-1' />
                    Unlocked
                  </Badge>
                )}
              </div>
            </div>
            {isUnlocked && userAchievement?.unlockedAt && (
              <div className='text-xs text-gray-500'>
                {new Date(userAchievement.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
          <CardDescription className='text-xs'>
            {achievement.description}
          </CardDescription>
        </CardHeader>
        <CardContent className='pt-0'>
          {!isUnlocked && achievement.requirement > 0 && (
            <div className='space-y-2'>
              <div className='flex justify-between text-xs text-gray-500'>
                <span>
                  Progress: {progress}/{achievement.requirement}
                </span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className='h-2' />
            </div>
          )}
          {isUnlocked && (
            <div className='text-center text-yellow-600 font-semibold text-sm'>
              ✨ Achievement Unlocked! ✨
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const filterByCategory = (categoryId: string) => {
    if (categoryId === "all") {
      return achievements;
    }
    return achievements.filter((a) => a.category === categoryId);
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryAchievements = filterByCategory(categoryId);
    const unlockedCount = userAchievements.filter(
      (ua) =>
        ua.unlocked &&
        categoryAchievements.find((ca) => ca.id === ua.achievementId)
    ).length;
    return { total: categoryAchievements.length, unlocked: unlockedCount };
  };

  if (!achievements.length) {
    return (
      <div className='flex items-center justify-center h-64'>
        <div className='text-center'>
          <Trophy className='h-12 w-12 text-gray-400 mx-auto mb-4' />
          <p className='text-gray-500'>Loading achievements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='text-center'>
        <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          Achievements
        </h2>
        <p className='text-gray-600 mt-1'>
          Track your progress and unlock badges
        </p>

        <div className='flex justify-center gap-6 mt-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-yellow-600'>
              {userAchievements.filter((ua) => ua.unlocked).length}
            </div>
            <div className='text-sm text-gray-500'>Unlocked</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {achievements.length -
                userAchievements.filter((ua) => ua.unlocked).length}
            </div>
            <div className='text-sm text-gray-500'>Remaining</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {achievements.length > 0
                ? Math.round(
                    (userAchievements.filter((ua) => ua.unlocked).length /
                      achievements.length) *
                      100
                  )
                : 0}
              %
            </div>
            <div className='text-sm text-gray-500'>Complete</div>
          </div>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-4 lg:grid-cols-8'>
          {categories.map((category) => {
            const stats = getCategoryStats(category.id);
            const Icon = category.icon;
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className='flex items-center gap-1 text-xs'
              >
                <Icon className='h-3 w-3' />
                <span className='hidden sm:inline'>{category.name}</span>
                <span className='sm:hidden'>{category.name.split(" ")[0]}</span>
                <Badge variant='outline' className='ml-1 text-xs'>
                  {stats.unlocked}/{stats.total}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => {
          const categoryAchievements = filterByCategory(category.id);
          const Icon = category.icon;

          return (
            <TabsContent key={category.id} value={category.id} className='mt-6'>
              {categoryAchievements.length === 0 ? (
                <div className='text-center py-12'>
                  <Icon className='h-16 w-16 text-gray-400 mx-auto mb-4' />
                  <h3 className='text-xl font-semibold text-gray-600 mb-2'>
                    No {category.name}
                  </h3>
                  <p className='text-gray-500'>
                    No achievements in this category yet.
                  </p>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                  {categoryAchievements.map((achievement) => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
