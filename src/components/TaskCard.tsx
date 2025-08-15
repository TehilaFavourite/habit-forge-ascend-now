import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Sun, Moon, CheckSquare, Sparkles, Repeat, Trash2 } from "lucide-react";
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

  const Icon = timeOfDay === "morning" ? Sun : timeOfDay === "afternoon" ? CheckSquare : Moon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className={cn(
        "glass border-border/50 h-fit",
        "hover:shadow-lg transition-all duration-300"
      )}>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                timeOfDay === "morning" && "bg-orange-100 text-orange-600",
                timeOfDay === "afternoon" && "bg-blue-100 text-blue-600",
                timeOfDay === "evening" && "bg-purple-100 text-purple-600"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                <CardDescription className="text-sm">
                  {completedTasks}/{totalTasks} completed
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {Math.round(progressPercentage)}%
            </Badge>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2 mt-4">
            <motion.div 
              className={cn(
                "h-2 rounded-full transition-all duration-500",
                timeOfDay === "morning" && "bg-gradient-to-r from-orange-400 to-orange-500",
                timeOfDay === "afternoon" && "bg-gradient-to-r from-blue-400 to-blue-500",
                timeOfDay === "evening" && "bg-gradient-to-r from-purple-400 to-purple-500"
              )}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <AnimatePresence>
            {tasks.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No tasks yet</p>
                <p className="text-xs">Add your first task below</p>
              </motion.div>
            ) : (
              tasks.map((task) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border transition-all duration-200",
                    task.completed 
                      ? "bg-success/5 border-success/20 opacity-75" 
                      : "bg-background border-border hover:shadow-md"
                  )}
                >
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => onToggleTask(task.id)}
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <span
                      className={cn(
                        "text-sm block",
                        task.completed && "line-through text-muted-foreground"
                      )}
                    >
                      {task.title}
                    </span>
                    {task.recurrence && task.recurrence !== "none" && (
                      <div className="flex items-center gap-1 mt-1">
                        <Repeat className="w-3 h-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground capitalize">
                          {task.recurrence}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                      className="text-xs px-2 py-1"
                    >
                      {task.priority}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteTask(task.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>

          <Button
            onClick={onAddTask}
            variant="outline"
            className={cn(
              "w-full mt-4 border-dashed",
              "hover:bg-primary/5 hover:border-primary/50 transition-colors"
            )}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}