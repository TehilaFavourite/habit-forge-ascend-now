
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useHabitStore } from '@/stores/habitStore';
import { useTodoStore } from '@/stores/todoStore';
import { useXPStore } from '@/stores/xpStore';
import { useRewardsStore } from '@/stores/rewardsStore';
import { HistoricalView } from '@/components/HistoricalView';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, CheckCircle2, Trophy, Zap, TrendingUp, History, Star } from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks, addDays } from 'date-fns';

export const ProgressReport = () => {
  const { user } = useAuthStore();
  const { habits } = useHabitStore();
  const { todos } = useTodoStore();
  const { getTotalXPForUser, getTotalXPForDate } = useXPStore();
  const { getRewardsForUser, getNextReward, getCurrentLevel } = useRewardsStore();
  const [showHistorical, setShowHistorical] = useState(false);

  // Date Management
  const [currentDate, setCurrentDate] = useState(new Date());
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
  const weekString = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;

  // Habit Completion Calculation
  const userHabits = habits.filter(habit => habit.userId === user?.id);
  const totalHabits = userHabits.length;
  const completedHabits = userHabits.filter(habit => {
    const dateKey = format(currentDate, 'yyyy-MM-dd');
    return habit.completions && habit.completions[dateKey];
  }).length;
  const habitCompletionPercentage = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  // Task Completion Calculation
  const userTodos = todos.filter(todo => todo.userId === user?.id);
  const totalTasks = userTodos.length;
  const completedTasks = userTodos.filter(todo => todo.completed).length;
  const taskCompletionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // XP and Level Calculation
  const totalXP = getTotalXPForUser(user?.id || '');
  const todayXP = getTotalXPForDate(format(currentDate, 'yyyy-MM-dd'), user?.id || '');
  const currentLevel = getCurrentLevel(user?.id || '', totalXP);
  const nextReward = getNextReward(user?.id || '', totalXP);

  // Streak Calculation (Simplified - needs actual streak logic)
  const currentStreak = 7; // Placeholder
  const longestStreak = 30; // Placeholder

  // Event Handling
  const goToPreviousWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
  };

  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Your Progress
          </h2>
          <p className="text-gray-600 mt-1">Stay motivated and track your achievements</p>
        </div>
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setShowHistorical(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            View History
          </Button>
          <button onClick={goToPreviousWeek} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Calendar className="h-5 w-5 text-gray-500 transform rotate-180" />
          </button>
          <span className="font-semibold">{weekString}</span>
          <button onClick={goToNextWeek} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Calendar className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Level and XP Overview */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-600" />
            Level Progress
          </CardTitle>
          <CardDescription>Your current level and experience points</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{currentLevel}</div>
              <div className="text-sm text-gray-600">Current Level</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{totalXP}</div>
              <div className="text-sm text-gray-600">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{todayXP}</div>
              <div className="text-sm text-gray-600">Today's XP</div>
            </div>
          </div>
          
          {nextReward && (
            <div className="mt-4 p-3 bg-white rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Next Reward:</span>
                <span className="text-sm text-gray-500">{nextReward.xpRequired - totalXP} XP to go</span>
              </div>
              <div className="text-sm text-gray-700 mb-2">{nextReward.name}</div>
              <Progress value={(totalXP / nextReward.xpRequired) * 100} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overview Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Habits Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Habit Completion
            </CardTitle>
            <CardDescription>Your daily habit completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={habitCompletionPercentage} />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{completedHabits}/{totalHabits} Habits</span>
                <span>{habitCompletionPercentage.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tasks Card */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              Task Completion
            </CardTitle>
            <CardDescription>Your task completion rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={taskCompletionPercentage} />
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{completedTasks}/{totalTasks} Tasks</span>
                <span>{taskCompletionPercentage.toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements Section */}
      <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            Achievements
          </CardTitle>
          <CardDescription>Your key achievements and milestones</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between border-b pb-2 md:border-none">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span>Current Streak</span>
            </div>
            <Badge variant="secondary">{currentStreak} days</Badge>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>Longest Streak</span>
            </div>
            <Badge variant="secondary">{longestStreak} days</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Historical View Modal */}
      {showHistorical && (
        <HistoricalView onClose={() => setShowHistorical(false)} />
      )}
    </div>
  );
};
