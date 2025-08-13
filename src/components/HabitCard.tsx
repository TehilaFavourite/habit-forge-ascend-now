import { useState } from "react";
import { Habit, useHabitStore } from "@/stores/habitStore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Calendar,
  MoreVertical,
  Edit2,
  Trash2,
  Flame,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface HabitCardProps {
  habit: Habit;
  onViewCalendar: () => void;
  onEdit: (habit: Habit) => void;
}

export const HabitCard = ({
  habit,
  onViewCalendar,
  onEdit,
}: HabitCardProps) => {
  const { completeHabit, uncompleteHabit, deleteHabit } = useHabitStore();
  const today = new Date().toISOString().split("T")[0];
  const isCompletedToday = habit.completions[today] || false;

  const handleToggleComplete = () => {
    if (isCompletedToday) {
      uncompleteHabit(habit.id, today);
      toast.success(`${habit.name} unchecked for today`);
    } else {
      completeHabit(habit.id, today);
      toast.success(`🎉 ${habit.name} completed! Keep it up!`);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${habit.name}"? This action cannot be undone.`
      )
    ) {
      deleteHabit(habit.id);
      toast.success("Habit deleted");
    }
  };

  return (
    <Card className='group relative overflow-hidden bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
      <CardContent className='p-6'>
        {/* Header */}
        <div className='flex items-start justify-between mb-4'>
          <div className='flex items-center gap-3'>
            <div
              className='w-12 h-12 rounded-full flex items-center justify-center text-white text-xl shadow-lg'
              style={{ backgroundColor: habit.color }}
            >
              {habit.icon}
            </div>
            <div>
              <h3 className='font-semibold text-gray-800 text-lg'>
                {habit.name}
              </h3>
              <div className='flex items-center gap-2'>
                <Badge variant='secondary' className='text-xs'>
                  {habit.frequency}
                </Badge>
                {habit.isCore && (
                  <Badge className='bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs'>
                    <Star className='w-3 h-3 mr-1' />
                    Core
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant='ghost'
                size='sm'
                className='opacity-0 group-hover:opacity-100 transition-opacity'
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={onViewCalendar}>
                <Calendar className='mr-2 h-4 w-4' />
                View Calendar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Edit2 className='mr-2 h-4 w-4' />
                Edit Habit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className='text-red-600 focus:text-red-600'
              >
                <Trash2 className='mr-2 h-4 w-4' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Example inside your habit card/component */}
        <div className='habit-card'>
          <div className='habit-title'>{habit.name}</div>
          <div className='habit-icon'>{habit.icon}</div>
          {habit.description && (
            <div className='habit-description text-gray-600 text-sm mt-1'>
              {habit.description}
            </div>
          )}
        </div>

        {/* Streak Info */}
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-4'>
            <div className='text-center'>
              <div className='flex items-center gap-1 text-orange-600'>
                <Flame className='h-4 w-4' />
                <span className='font-bold text-lg'>{habit.currentStreak}</span>
              </div>
              <span className='text-xs text-gray-500'>Current</span>
            </div>
            <div className='text-center'>
              <div className='font-bold text-lg text-purple-600'>
                {habit.bestStreak}
              </div>
              <span className='text-xs text-gray-500'>Best</span>
            </div>
          </div>
        </div>
        {/* Complete Button */}
        <Button
          onClick={handleToggleComplete}
          className={`w-full transition-all transform ${
            isCompletedToday
              ? "bg-green-500 hover:bg-green-600 text-white"
              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white hover:scale-105"
          }`}
        >
          <Check className='mr-2 h-4 w-4' />
          {isCompletedToday ? "Completed Today!" : "Mark Complete"}
        </Button>
      </CardContent>
    </Card>
  );
};
