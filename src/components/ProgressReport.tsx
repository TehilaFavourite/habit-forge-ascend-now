
import { useAuthStore } from '@/stores/authStore';
import { useHabitStore } from '@/stores/habitStore';
import { useTodoStore } from '@/stores/todoStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BarChart3, Download, Trophy, Target, Calendar, CheckSquare, Flame, Star } from 'lucide-react';
import { toast } from 'sonner';

export const ProgressReport = () => {
  const { user } = useAuthStore();
  const { getUserHabits } = useHabitStore();
  const { getTodosForUser } = useTodoStore();

  const habits = getUserHabits(user?.id || '');
  const todos = getTodosForUser(user?.id || '');

  // Calculate statistics
  const totalHabits = habits.length;
  const coreHabits = habits.filter(h => h.isCore).length;
  const today = new Date().toISOString().split('T')[0];
  const completedHabitsToday = habits.filter(h => h.completions[today]).length;
  
  const totalStreakDays = habits.reduce((sum, habit) => sum + habit.currentStreak, 0);
  const longestStreak = Math.max(...habits.map(h => h.bestStreak), 0);
  
  const completedTodos = todos.filter(t => t.completed).length;
  const totalTodos = todos.length;
  
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const thisWeekCompletions = habits.reduce((total, habit) => {
    const weekCompletions = Object.keys(habit.completions)
      .filter(date => date >= weekAgo && habit.completions[date])
      .length;
    return total + weekCompletions;
  }, 0);

  const exportData = () => {
    const exportData = {
      user: {
        username: user?.username,
        level: user?.level,
        xp: user?.xp,
        totalXp: user?.totalXp,
      },
      habits: habits.map(habit => ({
        name: habit.name,
        currentStreak: habit.currentStreak,
        bestStreak: habit.bestStreak,
        completions: habit.completions,
        isCore: habit.isCore,
      })),
      todos: todos,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-forge-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully!');
  };

  const achievements = [
    {
      title: 'First Steps',
      description: 'Create your first habit',
      completed: totalHabits > 0,
      progress: Math.min(totalHabits, 1),
      target: 1,
    },
    {
      title: 'Habit Builder',
      description: 'Create 5 habits',
      completed: totalHabits >= 5,
      progress: Math.min(totalHabits, 5),
      target: 5,
    },
    {
      title: 'Streak Starter',
      description: 'Maintain a 7-day streak',
      completed: longestStreak >= 7,
      progress: Math.min(longestStreak, 7),
      target: 7,
    },
    {
      title: 'Consistency King',
      description: 'Maintain a 30-day streak',
      completed: longestStreak >= 30,
      progress: Math.min(longestStreak, 30),
      target: 30,
    },
    {
      title: 'Task Master',
      description: 'Complete 50 tasks',
      completed: completedTodos >= 50,
      progress: Math.min(completedTodos, 50),
      target: 50,
    },
  ];

  const completedAchievements = achievements.filter(a => a.completed).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Progress Report
          </h2>
          <p className="text-gray-600 mt-1">Your journey to better habits</p>
        </div>
        
        <Button onClick={exportData} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600">
          <Download className="mr-2 h-4 w-4" />
          Export Data
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-700">{totalHabits}</div>
            <div className="text-sm text-purple-600">Total Habits</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Flame className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-700">{longestStreak}</div>
            <div className="text-sm text-orange-600">Best Streak</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <CheckSquare className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-700">{completedTodos}</div>
            <div className="text-sm text-green-600">Tasks Completed</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-0 shadow-lg">
          <CardContent className="p-6 text-center">
            <Star className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-700">{user?.level || 1}</div>
            <div className="text-sm text-blue-600">Current Level</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Progress */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Today's Progress
            </CardTitle>
            <CardDescription>Your daily habit completion status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Habits Completed Today</span>
                <span>{completedHabitsToday}/{totalHabits}</span>
              </div>
              <Progress value={totalHabits > 0 ? (completedHabitsToday / totalHabits) * 100 : 0} />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Tasks Completion Rate</span>
                <span>{totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0}%</span>
              </div>
              <Progress value={totalTodos > 0 ? (completedTodos / totalTodos) * 100 : 0} />
            </div>

            <div className="pt-4 border-t">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{thisWeekCompletions}</div>
                <div className="text-sm text-gray-600">Habit completions this week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Achievements
            </CardTitle>
            <CardDescription>
              {completedAchievements}/{achievements.length} unlocked
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${achievement.completed ? 'text-green-700' : 'text-gray-700'}`}>
                    {achievement.completed ? '🏆' : '🔒'} {achievement.title}
                  </span>
                  <span className="text-sm text-gray-500">
                    {achievement.progress}/{achievement.target}
                  </span>
                </div>
                <Progress 
                  value={(achievement.progress / achievement.target) * 100}
                  className={achievement.completed ? 'bg-green-100' : ''}
                />
                <p className="text-xs text-gray-500">{achievement.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Habit Stats */}
      {habits.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Habit Details
            </CardTitle>
            <CardDescription>Individual habit performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {habits.map(habit => (
                <div key={habit.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                        style={{ backgroundColor: habit.color }}
                      >
                        {habit.icon}
                      </div>
                      <span className="font-medium">{habit.name}</span>
                      {habit.isCore && (
                        <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs">
                          Core
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-orange-600">{habit.currentStreak}</div>
                      <div className="text-xs text-gray-500">Current Streak</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{habit.bestStreak}</div>
                      <div className="text-xs text-gray-500">Best Streak</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">
                        {Object.values(habit.completions).filter(Boolean).length}
                      </div>
                      <div className="text-xs text-gray-500">Total Completions</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
