
import { useHabitStore } from '@/stores/habitStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface StreakCalendarProps {
  habitId: string;
  onClose: () => void;
}

export const StreakCalendar = ({ habitId, onClose }: StreakCalendarProps) => {
  const { habits, completeHabit, uncompleteHabit } = useHabitStore();
  const habit = habits.find(h => h.id === habitId);
  const [currentDate, setCurrentDate] = useState(new Date());

  if (!habit) return null;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  
  const daysInMonth = lastDayOfMonth.getDate();
  const today = new Date().toISOString().split('T')[0];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(month + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const handleDayClick = (day: number) => {
    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
    const isCompleted = habit.completions[dateStr];
    
    if (isCompleted) {
      uncompleteHabit(habitId, dateStr);
    } else {
      completeHabit(habitId, dateStr);
    }
  };

  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="h-10" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = new Date(year, month, day).toISOString().split('T')[0];
      const isCompleted = habit.completions[dateStr];
      const isToday = dateStr === today;
      const isPast = new Date(dateStr) < new Date(today);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`h-10 w-10 rounded-lg text-sm font-medium transition-all hover:scale-110 ${
            isCompleted
              ? 'bg-gradient-to-r from-green-400 to-green-500 text-white shadow-lg'
              : isToday
              ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
              : isPast
              ? 'bg-gray-100 text-gray-400'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }
    
    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
              style={{ backgroundColor: habit.color }}
            >
              {habit.icon}
            </div>
            {habit.name} - Streak Calendar
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="text-lg font-semibold">
              {monthNames[month]} {year}
            </h3>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <div className="space-y-2">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1">
              {dayNames.map(day => (
                <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray-500">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendarDays()}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-green-500 rounded"></div>
              Completed
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
              Today
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              Not completed
            </div>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">{habit.currentStreak}</div>
                <div className="text-sm text-gray-600">Current Streak</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{habit.bestStreak}</div>
                <div className="text-sm text-gray-600">Best Streak</div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
