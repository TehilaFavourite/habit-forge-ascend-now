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
  Sparkles,
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
    <Card className="group relative overflow-hidden bg-gradient-subtle border border-border/40 shadow-gentle hover:shadow-elegant transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm animate-fade-in">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-500" />
      
      {/* Completion Glow Effect */}
      {isCompletedToday && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary-glow/10 animate-pulse-slow" />
      )}

      <CardContent className="relative p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icon Container */}
            <div className="relative">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl shadow-elegant transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{ backgroundColor: habit.color }}
              >
                {habit.icon}
              </div>
              {isCompletedToday && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-glow">
                  <Check className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Habit Info */}
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground text-lg leading-tight">
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                  {habit.description}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs px-2 py-1 bg-secondary/60">
                  {habit.frequency}
                </Badge>
                {habit.isCore && (
                  <Badge className="bg-gradient-primary text-primary-foreground text-xs px-2 py-1 shadow-sm">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Core
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-secondary/60"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-elegant">
              <DropdownMenuItem 
                onClick={onViewCalendar}
                className="cursor-pointer hover:bg-secondary/60"
              >
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onEdit(habit)}
                className="cursor-pointer hover:bg-secondary/60"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Habit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Streak Statistics */}
        <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl border border-border/30">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Flame className="h-5 w-5 text-primary animate-pulse" />
                <span className="font-bold text-xl text-primary">
                  {habit.currentStreak}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Current Streak</span>
            </div>
            
            <div className="w-px h-8 bg-border" />
            
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles className="h-5 w-5 text-primary-glow" />
                <span className="font-bold text-xl text-primary-glow">
                  {habit.bestStreak}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Best Streak</span>
            </div>
          </div>
        </div>

        {/* Complete Button */}
        <Button
          onClick={handleToggleComplete}
          className={`w-full h-12 transition-all duration-300 font-medium ${
            isCompletedToday
              ? "bg-primary text-primary-foreground shadow-glow hover:shadow-elegant scale-[1.02]"
              : "bg-gradient-primary text-primary-foreground hover:shadow-glow hover:scale-[1.02] shadow-gentle"
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Check className={`h-4 w-4 transition-transform duration-300 ${
              isCompletedToday ? "scale-110" : ""
            }`} />
            <span className="text-sm">
              {isCompletedToday ? "Completed Today!" : "Mark Complete"}
            </span>
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};
