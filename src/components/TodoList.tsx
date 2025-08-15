import { useState, useEffect } from "react";
import { TaskCard } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 md:p-6 lg:p-8'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-8'
        >
          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4'>
            <Sparkles className='w-4 h-4' />
            <span className='text-sm font-medium'>Your Daily Journey</span>
          </div>

          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4'>
            Daily Planner
          </h1>

          <p className='text-lg md:text-xl text-muted-foreground mb-6 max-w-2xl mx-auto'>
            Organize your day with style and efficiency. Plan, track, and
            achieve your goals beautifully.
          </p>

          {/* Stats */}
          <div className='flex items-center justify-center gap-6 mb-8'>
            <div className='flex items-center gap-2'>
              <div className='w-3 h-3 rounded-full bg-primary'></div>
              <span className='text-sm text-muted-foreground'>
                {completedTasks}/{totalTasks} tasks completed
              </span>
            </div>
            <div className='flex items-center gap-2'>
              <TrendingUp className='w-4 h-4 text-success' />
              <span className='text-sm text-muted-foreground'>
                {Math.round(overallProgress)}% daily progress
              </span>
            </div>
          </div>
        </motion.div>

        {/* Quick Add Section */}
        <div className='max-w-2xl mx-auto mb-8'>
          <div className='bg-white/90 backdrop-blur-md rounded-2xl p-6 border border-border/50 shadow-md'>
            <div className='flex items-center gap-3 mb-4'>
              <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
                <Target className='w-5 h-5 text-primary' />
              </div>
              <div>
                <h3 className='font-semibold text-foreground'>
                  Quick Add Task
                </h3>
                <p className='text-sm text-muted-foreground'>
                  Plan your day with prioritized tasks
                </p>
              </div>
            </div>

            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button className='flex-1 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded p-2'>
                  <Calendar className='w-4 h-4 mr-2' />
                  Add New Task
                </Button>
              </DialogTrigger>

              <DialogContent className='bg-white/90 backdrop-blur-md rounded-lg p-6'>
                <DialogHeader>
                  <DialogTitle className='gradient-text'>
                    Create New Task
                  </DialogTitle>
                </DialogHeader>

                <div className='space-y-4 pt-4'>
                  <div>
                    <Label htmlFor='task-title'>Task Title</Label>
                    <Input
                      id='task-title'
                      placeholder='What do you want to accomplish?'
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className='mt-1'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <Label htmlFor='time-of-day'>Time of Day</Label>
                      <Select
                        value={newTaskTimeOfDay}
                        onValueChange={(
                          value: "morning" | "afternoon" | "evening"
                        ) => setNewTaskTimeOfDay(value)}
                      >
                        <SelectTrigger className='mt-1'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='morning'>☀️ Morning</SelectItem>
                          <SelectItem value='afternoon'>
                            ☀️ Afternoon
                          </SelectItem>
                          <SelectItem value='evening'>🌙 Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor='priority'>Priority</Label>
                      <Select
                        value={newTaskPriority}
                        onValueChange={(value: "low" | "medium" | "high") =>
                          setNewTaskPriority(value)
                        }
                      >
                        <SelectTrigger className='mt-1'>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='low'>Low</SelectItem>
                          <SelectItem value='medium'>Medium</SelectItem>
                          <SelectItem value='high'>High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='recurrence'>Recurrence</Label>
                    <Select
                      value={newTaskRecurrence}
                      onValueChange={(
                        value: "none" | "daily" | "weekly" | "monthly"
                      ) => setNewTaskRecurrence(value)}
                    >
                      <SelectTrigger className='mt-1'>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='none'>
                          <div className='flex items-center gap-2'>
                            <span>📅</span>
                            <span>One-time</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='daily'>
                          <div className='flex items-center gap-2'>
                            <Repeat className='w-4 h-4' />
                            <span>Daily</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='weekly'>
                          <div className='flex items-center gap-2'>
                            <Repeat className='w-4 h-4' />
                            <span>Weekly</span>
                          </div>
                        </SelectItem>
                        <SelectItem value='monthly'>
                          <div className='flex items-center gap-2'>
                            <Repeat className='w-4 h-4' />
                            <span>Monthly</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleAddTask}
                    className='w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded p-2'
                  >
                    Create Task
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Task Cards Grid */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          <TaskCard
            title='Morning Routine'
            timeOfDay='morning'
            tasks={morningTasks}
            onAddTask={() => openAddTaskDialog("morning")}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />

          <TaskCard
            title='Daily Tasks'
            timeOfDay='afternoon'
            tasks={afternoonTasks}
            onAddTask={() => openAddTaskDialog("afternoon")}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />

          <TaskCard
            title='Evening Routine'
            timeOfDay='evening'
            tasks={eveningTasks}
            onAddTask={() => openAddTaskDialog("evening")}
            onToggleTask={handleToggleTask}
            onDeleteTask={handleDeleteTask}
          />
        </div>

        {/* Achievement Banner */}
        {overallProgress === 100 && totalTasks > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='mt-8 text-center'
          >
            <div className='glass rounded-2xl p-6 border border-success/20 bg-success/5'>
              <div className='flex items-center justify-center gap-3 mb-2'>
                <div className='w-12 h-12 rounded-full bg-success/20 flex items-center justify-center'>
                  <Sparkles className='w-6 h-6 text-success' />
                </div>
                <div>
                  <h3 className='text-xl font-bold text-success'>
                    Amazing! All tasks completed! 🎉
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    You've had a productive day. Take some time to celebrate!
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
