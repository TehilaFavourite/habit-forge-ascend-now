import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Sun, Moon, CheckSquare, Sparkles, Repeat, Trash2, Clock, Target, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Todo } from "@/stores/todoStore";

interface TaskCardProps {
  title: string;
  timeOfDay: "morning" | "afternoon" | "evening";
  tasks: Todo[];
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskCard({ title, timeOfDay, tasks, onAddTask, onToggleTask, onDeleteTask }: TaskCardProps) {
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getThemeColors = () => {
    switch (timeOfDay) {
      case "morning":
        return {
          icon: Sun,
          gradient: "bg-gradient-to-br from-primary/5 via-primary-light/10 to-primary-glow/5",
          iconBg: "bg-primary/10",
          iconColor: "text-primary",
          progressGradient: "bg-gradient-primary"
        };
      case "afternoon":
        return {
          icon: Target,
          gradient: "bg-gradient-to-br from-accent/5 via-accent-glow/10 to-secondary/5",
          iconBg: "bg-accent/10", 
          iconColor: "text-accent-foreground",
          progressGradient: "bg-gradient-work"
        };
      case "evening":
        return {
          icon: Moon,
          gradient: "bg-gradient-to-br from-muted/10 via-secondary/5 to-muted/5",
          iconBg: "bg-muted/20",
          iconColor: "text-muted-foreground",
          progressGradient: "bg-gradient-break"
        };
    }
  };

  const theme = getThemeColors();
  const Icon = theme.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Card className={cn(
        "relative overflow-hidden border border-border/40 shadow-gentle hover:shadow-elegant",
        "transition-all duration-500 hover:scale-[1.02] backdrop-blur-sm animate-fade-in",
        theme.gradient
      )}>
        {/* Completion Glow Effect */}
        {progressPercentage === 100 && totalTasks > 0 && (
          <div className="absolute inset-0 bg-gradient-primary opacity-5 animate-pulse-slow" />
        )}

        <CardHeader className="relative pb-4 space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-gentle",
                "transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                theme.iconBg, theme.iconColor
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              <div className="space-y-1">
                <CardTitle className="text-xl font-semibold text-foreground">
                  {title}
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  {completedTasks}/{totalTasks} completed
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn(
                  "text-xs px-3 py-1 font-medium bg-secondary/60",
                  progressPercentage === 100 && "bg-primary/10 text-primary border-primary/20"
                )}
              >
                {Math.round(progressPercentage)}%
              </Badge>
              {progressPercentage === 100 && totalTasks > 0 && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>
          </div>
          
          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="w-full bg-secondary/40 rounded-xl h-3 shadow-inner">
              <motion.div 
                className={cn(
                  "h-3 rounded-xl shadow-sm transition-all duration-700",
                  theme.progressGradient
                )}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            </div>
            
            {/* Progress Stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {timeOfDay === "morning" ? "Start Strong" : timeOfDay === "afternoon" ? "Stay Focused" : "Wind Down"}
              </span>
              <span>{totalTasks} tasks total</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-4">
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12 space-y-3"
              >
                <div className={cn(
                  "w-16 h-16 rounded-full mx-auto flex items-center justify-center",
                  theme.iconBg
                )}>
                  <Sparkles className={cn("w-8 h-8", theme.iconColor, "opacity-60")} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">No tasks yet</p>
                  <p className="text-xs text-muted-foreground">Ready to add your first task?</p>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "group/task relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                      task.completed 
                        ? "bg-primary/5 border-primary/20 shadow-sm" 
                        : "bg-card border-border/40 hover:border-primary/30 hover:shadow-gentle"
                    )}
                  >
                    {/* Task Checkbox */}
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => onToggleTask(task.id)}
                      className="h-5 w-5 transition-all duration-200"
                    />
                    
                    {/* Task Content */}
                    <div className="flex-1 space-y-1">
                      <span
                        className={cn(
                          "text-sm font-medium block leading-tight transition-all duration-200",
                          task.completed ? "line-through text-muted-foreground" : "text-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                      
                      {task.recurrence && task.recurrence !== "none" && (
                        <div className="flex items-center gap-1">
                          <Repeat className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground capitalize font-medium">
                            {task.recurrence}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Task Actions */}
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                        className="text-xs px-2 py-1 font-medium"
                      >
                        {task.priority}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteTask(task.id)}
                        className="h-7 w-7 p-0 opacity-0 group-hover/task:opacity-100 text-muted-foreground hover:text-destructive transition-all duration-200"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>

          {/* Add Task Button */}
          <Button
            onClick={onAddTask}
            variant="outline"
            className={cn(
              "w-full h-12 border-dashed border-2 mt-6 font-medium",
              "hover:bg-primary/5 hover:border-primary/50 hover:shadow-gentle",
              "transition-all duration-300 hover:scale-[1.02]"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}