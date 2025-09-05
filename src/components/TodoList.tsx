import { useState, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Sparkles,
  Target,
  TrendingUp,
  Repeat,
  Sun,
  Moon,
  CheckSquare,
  Trash2,
  LayoutDashboard,
  Coffee,
  Briefcase,
  Sunset,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useTodoStore, type Todo } from "@/stores/todoStore";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function TodoList() {
  const { user } = useAuthStore();
  const {
    getTodosForUser,
    addTodo,
    toggleTodo,
    deleteTodo,
    resetRecurringTasks,
  } = useTodoStore();

  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<
    "low" | "medium" | "high"
  >("medium");
  const [newTaskTimeOfDay, setNewTaskTimeOfDay] = useState<
    "morning" | "afternoon" | "evening"
  >("morning");
  const [newTaskRecurrence, setNewTaskRecurrence] = useState<
    "none" | "daily" | "weekly" | "monthly"
  >("none");

  useEffect(() => {
    if (user?.id) {
      resetRecurringTasks(user.id);
    }
  }, [user?.id, resetRecurringTasks]);

  const tasks = getTodosForUser(user?.id || "");
  const morningTasks = tasks.filter((task) => task.category === "morning");
  const afternoonTasks = tasks.filter((task) => task.category === "afternoon");
  const eveningTasks = tasks.filter((task) => task.category === "evening");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const overallProgress =
    totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const handleAddTask = () => {
    if (newTaskTitle.trim() && user?.id) {
      addTodo({
        title: newTaskTitle,
        category: newTaskTimeOfDay,
        userId: user.id,
        recurrence: newTaskRecurrence,
        priority: newTaskPriority,
        lastCompletedDate: "",
      });

      setNewTaskTitle("");
      setNewTaskRecurrence("none");
      setIsAddTaskOpen(false);

      toast.success("Task added successfully!", {
        style: { background: "hsl(var(--success))", color: "white" },
      });
    }
  };

  const handleToggleTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task && !task.completed) {
      toast.success("Task completed! Great job! 🎉", {
        style: { background: "hsl(var(--success))", color: "white" },
      });
    }
    toggleTodo(taskId);
  };

  const handleDeleteTask = (taskId: string) => {
    deleteTodo(taskId);
    toast.success("Task deleted", {
      style: {
        background: "hsl(var(--muted))",
        color: "hsl(var(--foreground))",
      },
    });
  };

  const openAddTaskDialog = (
    timeOfDay?: "morning" | "afternoon" | "evening"
  ) => {
    if (timeOfDay) {
      setNewTaskTimeOfDay(timeOfDay);
    }
    setIsAddTaskOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4 shadow-gentle">
            <LayoutDashboard className="w-4 h-4" />
            <span className="text-sm font-medium">Task Management Hub</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-4">
            Daily Planner
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto leading-relaxed">
            Organize your day with style and efficiency. Plan, track, and
            achieve your goals beautifully.
          </p>

          {/* Enhanced Stats */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border/40 shadow-gentle">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">
                {completedTasks}/{totalTasks} completed
              </span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-card border border-border/40 shadow-gentle">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {Math.round(overallProgress)}% progress
              </span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto h-12 bg-card border border-border/40 shadow-gentle">
            <TabsTrigger 
              value="overview" 
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="morning"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Coffee className="w-4 h-4" />
              <span className="hidden sm:inline">Morning</span>
            </TabsTrigger>
            <TabsTrigger 
              value="afternoon"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Briefcase className="w-4 h-4" />
              <span className="hidden sm:inline">Daily</span>
            </TabsTrigger>
            <TabsTrigger 
              value="evening"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              <Sunset className="w-4 h-4" />
              <span className="hidden sm:inline">Evening</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Quick Add Section */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-gradient-subtle backdrop-blur-sm rounded-2xl p-6 border border-border/40 shadow-elegant">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shadow-gentle">
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      Quick Add Task
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Plan your day with prioritized tasks
                    </p>
                  </div>
                </div>

                <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full h-12 bg-gradient-primary text-primary-foreground shadow-gentle hover:shadow-elegant transition-all duration-300 hover:scale-[1.02]">
                      <Calendar className="w-4 h-4 mr-2" />
                      Add New Task
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="bg-card/95 backdrop-blur-md border border-border/40 shadow-elegant">
                    <DialogHeader>
                      <DialogTitle className="bg-gradient-primary bg-clip-text text-transparent text-xl">
                        Create New Task
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title" className="text-sm font-medium">Task Title</Label>
                        <Input
                          id="task-title"
                          placeholder="What do you want to accomplish?"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          className="h-11 bg-background/50 border-border/60"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="time-of-day" className="text-sm font-medium">Time of Day</Label>
                          <Select
                            value={newTaskTimeOfDay}
                            onValueChange={(value: "morning" | "afternoon" | "evening") => setNewTaskTimeOfDay(value)}
                          >
                            <SelectTrigger className="h-11 bg-background/50 border-border/60">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="morning">
                                <div className="flex items-center gap-2">
                                  <Sun className="w-4 h-4" />
                                  Morning
                                </div>
                              </SelectItem>
                              <SelectItem value="afternoon">
                                <div className="flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Afternoon
                                </div>
                              </SelectItem>
                              <SelectItem value="evening">
                                <div className="flex items-center gap-2">
                                  <Moon className="w-4 h-4" />
                                  Evening
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="priority" className="text-sm font-medium">Priority</Label>
                          <Select
                            value={newTaskPriority}
                            onValueChange={(value: "low" | "medium" | "high") => setNewTaskPriority(value)}
                          >
                            <SelectTrigger className="h-11 bg-background/50 border-border/60">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="recurrence" className="text-sm font-medium">Recurrence</Label>
                        <Select
                          value={newTaskRecurrence}
                          onValueChange={(value: "none" | "daily" | "weekly" | "monthly") => setNewTaskRecurrence(value)}
                        >
                          <SelectTrigger className="h-11 bg-background/50 border-border/60">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                One-time
                              </div>
                            </SelectItem>
                            <SelectItem value="daily">
                              <div className="flex items-center gap-2">
                                <Repeat className="w-4 h-4" />
                                Daily
                              </div>
                            </SelectItem>
                            <SelectItem value="weekly">
                              <div className="flex items-center gap-2">
                                <Repeat className="w-4 h-4" />
                                Weekly
                              </div>
                            </SelectItem>
                            <SelectItem value="monthly">
                              <div className="flex items-center gap-2">
                                <Repeat className="w-4 h-4" />
                                Monthly
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handleAddTask}
                        className="w-full h-12 bg-gradient-primary text-primary-foreground shadow-gentle hover:shadow-elegant transition-all duration-300"
                      >
                        Create Task
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Task Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <TaskCard
                title="Morning Routine"
                timeOfDay="morning"
                tasks={morningTasks}
                onAddTask={() => openAddTaskDialog("morning")}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />

              <TaskCard
                title="Daily Tasks"
                timeOfDay="afternoon"
                tasks={afternoonTasks}
                onAddTask={() => openAddTaskDialog("afternoon")}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />

              <TaskCard
                title="Evening Routine"
                timeOfDay="evening"
                tasks={eveningTasks}
                onAddTask={() => openAddTaskDialog("evening")}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </TabsContent>

          {/* Morning Dashboard */}
          <TabsContent value="morning" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <TaskCard
                title="Morning Routine"
                timeOfDay="morning"
                tasks={morningTasks}
                onAddTask={() => openAddTaskDialog("morning")}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </TabsContent>

          {/* Afternoon Dashboard */}
          <TabsContent value="afternoon" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <TaskCard
                title="Daily Tasks"
                timeOfDay="afternoon"
                tasks={afternoonTasks}
                onAddTask={() => openAddTaskDialog("afternoon")}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </TabsContent>

          {/* Evening Dashboard */}
          <TabsContent value="evening" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <TaskCard
                title="Evening Routine"
                timeOfDay="evening"
                tasks={eveningTasks}
                onAddTask={() => openAddTaskDialog("evening")}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Achievement Banner */}
        {overallProgress === 100 && totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-8"
          >
            <div className="bg-gradient-primary/10 backdrop-blur-sm rounded-2xl p-8 border border-primary/20 shadow-glow">
              <div className="flex items-center justify-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse-slow">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    Amazing! All tasks completed! 🎉
                  </h3>
                  <p className="text-muted-foreground">
                    You've had a productive day. Take some time to celebrate your achievements!
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
