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
    <Card className="group relative overflow-hidden h-full flex flex-col bg-gradient-subtle border border-border/40 shadow-gentle hover:shadow-glow transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm animate-fade-in">
      {/* Dynamic Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary-glow/10 opacity-0 group-hover:opacity-100 transition-all duration-700" />
      
      {/* Completion Celebration Effect */}
      {isCompletedToday && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary-glow/10 to-primary/15 animate-pulse-slow" />
          <div className="absolute top-2 right-2 w-3 h-3 bg-primary-glow rounded-full animate-ping" />
        </>
      )}

      {/* Floating Sparkles for Core Habits */}
      {habit.isCore && (
        <div className="absolute top-4 left-4 opacity-20 group-hover:opacity-40 transition-opacity duration-500">
          <Sparkles className="w-6 h-6 text-primary animate-pulse" />
        </div>
      )}

      <CardContent className="relative p-6 flex flex-col h-full">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Enhanced Icon Container */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center text-white text-2xl shadow-glow transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-elegant"
                style={{ 
                  backgroundColor: habit.color,
                  boxShadow: isCompletedToday 
                    ? `0 0 30px ${habit.color}40, 0 0 60px ${habit.color}20` 
                    : `0 8px 25px ${habit.color}30`
                }}
              >
                {habit.icon}
              </div>
              
              {/* Completion Badge */}
              {isCompletedToday && (
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-r from-primary to-primary-glow rounded-full flex items-center justify-center shadow-glow animate-scale-in">
                  <Check className="w-4 h-4 text-primary-foreground font-bold" />
                </div>
              )}
              
              {/* Streak Fire Animation */}
              {habit.currentStreak > 0 && (
                <div className="absolute -bottom-1 -right-1 animate-bounce">
                  <Flame className="w-5 h-5 text-primary" />
                </div>
              )}
            </div>

            {/* Habit Info */}
            <div className="space-y-3 flex-1">
              <h3 className="font-bold text-foreground text-xl leading-tight tracking-tight group-hover:text-primary transition-colors duration-300">
                {habit.name}
              </h3>
              {habit.description && (
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2">
                  {habit.description}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-xs px-3 py-1 bg-secondary/80 hover:bg-secondary transition-colors">
                  {habit.frequency}
                </Badge>
                {habit.isCore && (
                  <Badge className="bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-xs px-3 py-1 shadow-glow animate-fade-in">
                    <Star className="w-3 h-3 mr-1 fill-current" />
                    Core Habit
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
                className="opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-secondary/80 hover:scale-110"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 shadow-glow border-border/50">
              <DropdownMenuItem 
                onClick={onViewCalendar}
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => onEdit(habit)}
                className="cursor-pointer hover:bg-secondary/80 transition-colors"
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Edit Habit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="cursor-pointer text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Enhanced Streak Statistics */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-secondary/40 via-secondary/30 to-secondary/40 rounded-2xl border border-border/40 shadow-gentle mb-6 hover:shadow-elegant transition-all duration-300">
          <div className="flex items-center justify-center gap-8 w-full">
            <div className="text-center group/stat hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="relative">
                  <Flame className={`h-6 w-6 transition-all duration-300 ${
                    habit.currentStreak > 0 
                      ? "text-primary animate-pulse scale-110" 
                      : "text-muted-foreground/60"
                  }`} />
                  {habit.currentStreak > 0 && (
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md animate-pulse" />
                  )}
                </div>
                <span className={`font-bold text-2xl transition-all duration-300 ${
                  habit.currentStreak > 0 
                    ? "text-primary scale-110" 
                    : "text-muted-foreground"
                }`}>
                  {habit.currentStreak}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Current Streak</span>
            </div>
            
            <div className="w-px h-10 bg-gradient-to-b from-transparent via-border to-transparent" />
            
            <div className="text-center group/stat hover:scale-105 transition-transform duration-300">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className={`h-6 w-6 transition-all duration-300 ${
                  habit.bestStreak > 0 
                    ? "text-primary-glow animate-pulse" 
                    : "text-muted-foreground/60"
                }`} />
                <span className={`font-bold text-2xl transition-all duration-300 ${
                  habit.bestStreak > 0 
                    ? "text-primary-glow" 
                    : "text-muted-foreground"
                }`}>
                  {habit.bestStreak}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">Best Streak</span>
            </div>
          </div>
        </div>

        {/* Motivational Progress Indicator */}
        {habit.currentStreak > 0 && (
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Progress to next milestone</span>
              <span className="text-sm font-bold text-primary">{habit.currentStreak % 7}/7</span>
            </div>
            <div className="w-full bg-secondary/60 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary-glow rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((habit.currentStreak % 7) / 7) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1" />

        {/* Enhanced Complete Button */}
        <Button
          onClick={handleToggleComplete}
          className={`w-full h-14 transition-all duration-500 font-semibold text-base shadow-elegant hover:shadow-glow group/button ${
            isCompletedToday
              ? "bg-gradient-to-r from-success to-success-glow text-success-foreground scale-[1.02] shadow-glow animate-pulse-slow"
              : "bg-gradient-to-r from-success/90 to-success text-success-foreground hover:from-success hover:to-success-glow hover:scale-[1.02]"
          }`}
        >
          <div className="flex items-center justify-center gap-3">
            <div className={`transition-all duration-300 ${
              isCompletedToday ? "animate-bounce" : "group-hover/button:scale-110"
            }`}>
              <Check className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-wide">
              {isCompletedToday ? "Completed Today! 🎉" : "Mark Complete"}
            </span>
            {!isCompletedToday && (
              <div className="opacity-0 group-hover/button:opacity-100 transition-opacity duration-300">
                <Sparkles className="h-4 w-4" />
              </div>
            )}
          </div>
        </Button>
      </CardContent>
    </Card>
  );
};
