
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useHabitStore } from '@/stores/habitStore';
import { useTodoStore } from '@/stores/todoStore';
import { useXPStore } from '@/stores/xpStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { CalendarDays, Target, CheckCircle2, Star, Zap } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface HistoricalViewProps {
  onClose: () => void;
}

export const HistoricalView = ({ onClose }: HistoricalViewProps) => {
  const { user } = useAuthStore();
  const { getUserHabits } = useHabitStore();
  const { getTodosForUser } = useTodoStore();
  const { getActivitiesForUser, getCompletionsForDate, getTotalXPForDate } = useXPStore();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const dateStr = selectedDate.toISOString().split('T')[0];
  
  const habits = getUserHabits(user?.id || '');
  const todos = getTodosForUser(user?.id || '');
  const xpActivities = getActivitiesForUser(user?.id || '');
  const xpCompletions = getCompletionsForDate(dateStr, user?.id || '');
  const totalXP = getTotalXPForDate(dateStr, user?.id || '');

  // Habit completions for selected date
  const habitCompletions = habits.map(habit => ({
    ...habit,
    completed: habit.completions[dateStr] || false
  }));

  // Todo completions for selected date (filter by completion date)
  const todosForDate = todos.filter(todo => {
    if (!todo.completedAt) return false;
    const completionDate = new Date(todo.completedAt).toISOString().split('T')[0];
    return completionDate === dateStr;
  });

  // XP activities completed on selected date
  const xpActivitiesForDate = xpCompletions.map(completion => {
    const activity = xpActivities.find(a => a.id === completion.activityId);
    return {
      ...activity,
      xpEarned: completion.xpEarned,
      completedAt: completion.completedAt
    };
  }).filter(Boolean);

  const completedHabits = habitCompletions.filter(h => h.completed).length;
  const totalHabits = habitCompletions.length;
  const habitCompletionRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Historical Progress - {format(selectedDate, 'MMMM d, yyyy')}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  disabled={(date) => date > new Date()}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>
          </div>

          {/* Historical Data */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-600" />
                    <div>
                      <div className="text-lg font-bold">{completedHabits}/{totalHabits}</div>
                      <div className="text-sm text-gray-600">Habits Completed</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-green-600" />
                    <div>
                      <div className="text-lg font-bold">{totalXP}</div>
                      <div className="text-sm text-gray-600">XP Earned</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Habits Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Habits Progress
                </CardTitle>
                <CardDescription>
                  Habit completion rate: {habitCompletionRate.toFixed(0)}%
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={habitCompletionRate} className="mb-4" />
                
                {habitCompletions.length > 0 ? (
                  <div className="space-y-2">
                    {habitCompletions.map(habit => (
                      <div key={habit.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
                            style={{ backgroundColor: habit.color }}
                          >
                            {habit.icon}
                          </div>
                          <span className="text-sm">{habit.name}</span>
                        </div>
                        <Badge variant={habit.completed ? 'default' : 'secondary'}>
                          {habit.completed ? 'Completed' : 'Not Done'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No habits tracked on this date</p>
                )}
              </CardContent>
            </Card>

            {/* Completed Todos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Completed Tasks
                </CardTitle>
                <CardDescription>
                  Tasks completed on {format(selectedDate, 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todosForDate.length > 0 ? (
                  <div className="space-y-2">
                    {todosForDate.map(todo => (
                      <div key={todo.id} className="flex items-center justify-between p-2 rounded-lg bg-green-50">
                        <span className="text-sm">{todo.title}</span>
                        <Badge variant="outline">{todo.category}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No tasks completed on this date</p>
                )}
              </CardContent>
            </Card>

            {/* XP Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  XP Activities
                </CardTitle>
                <CardDescription>
                  Experience earned on {format(selectedDate, 'MMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {xpActivitiesForDate.length > 0 ? (
                  <div className="space-y-2">
                    {xpActivitiesForDate.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-yellow-50">
                        <span className="text-sm">{activity?.name}</span>
                        <Badge variant="outline">+{activity?.xpEarned} XP</Badge>
                      </div>
                    ))}
                    <div className="border-t pt-2 mt-2">
                      <div className="flex justify-between font-semibold">
                        <span>Total XP:</span>
                        <span>{totalXP} XP</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No XP activities completed on this date</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
