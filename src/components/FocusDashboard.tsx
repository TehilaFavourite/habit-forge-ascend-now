import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore, Project, ProjectTask } from "@/stores/projectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Play, 
  Clock, 
  Target, 
  Flame,
  Calendar,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  Timer
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ProjectForm } from "./ProjectForm";
import { TaskForm } from "./TaskForm";
import { PomodoroHistory } from "./PomodoroHistory";
import { FocusTimer } from "./FocusTimer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const FocusDashboard = () => {
  const { user } = useAuthStore();
  const {
    getProjectsForUser,
    deleteProject,
    deleteTask,
    setActiveTask,
    activeTask,
    getSessionsForDate,
  } = useProjectStore();

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const projects = getProjectsForUser(user?.id || "");
  const today = new Date().toISOString().split('T')[0];
  const todaySessions = getSessionsForDate(user?.id || "", today);
  const todayPomodoros = todaySessions.filter(s => s.mode === "work").length;

  const handleDeleteProject = (project: Project) => {
    deleteProject(project.id);
    toast.success("Project deleted successfully");
  };

  const handleDeleteTask = (task: ProjectTask) => {
    deleteTask(task.id);
    if (activeTask?.id === task.id) {
      setActiveTask(null);
    }
    toast.success("Task deleted successfully");
  };

  const handleStartTask = (task: ProjectTask) => {
    setActiveTask(task);
    toast.success(`Started working on: ${task.name}`);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectForm(true);
  };

  const handleEditTask = (task: ProjectTask) => {
    setEditingTask(task);
    setSelectedProject(projects.find(p => p.id === task.projectId) || null);
    setShowTaskForm(true);
  };

  const handleCompleteTask = (task: ProjectTask) => {
    // This would be handled in the TaskForm component
    setEditingTask(task);
    setSelectedProject(projects.find(p => p.id === task.projectId) || null);
    setShowTaskForm(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Focus Dashboard</h1>
            <p className="text-muted-foreground">Manage your projects and track your focus sessions</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowHistory(true)} variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button onClick={() => setShowProjectForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="timer" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="timer" className="flex items-center gap-2">
              <Timer className="w-4 h-4" />
              Focus Timer
            </TabsTrigger>
            <TabsTrigger value="projects" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Projects
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timer" className="mt-6">
            <FocusTimer />
          </TabsContent>

          <TabsContent value="projects" className="mt-6 space-y-6">

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Today's Pomodoros</p>
                  <p className="text-2xl font-bold">{todayPomodoros}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Active Tasks</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((total, p) => total + p.tasks.filter(t => !t.completed).length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed Tasks</p>
                  <p className="text-2xl font-bold">
                    {projects.reduce((total, p) => total + p.tasks.filter(t => t.completed).length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Task */}
        {activeTask && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-primary/10 border border-primary/20 rounded-lg p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Currently Working On</p>
                <p className="font-semibold text-lg">{activeTask.name}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">
                    <Clock className="w-3 h-3 mr-1" />
                    {activeTask.totalPomodoros} pomodoros
                  </Badge>
                  <Badge variant="secondary">
                    <Flame className="w-3 h-3 mr-1" />
                    {activeTask.currentStreak} day streak
                  </Badge>
                </div>
              </div>
              <Button onClick={() => setActiveTask(null)} variant="outline">
                Stop Working
              </Button>
            </div>
          </motion.div>
        )}

        {/* Projects Grid */}
        <div className="space-y-6">
          {projects.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="space-y-4">
                <Target className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Projects Yet</h3>
                  <p className="text-muted-foreground">Create your first project to start tracking your focus sessions</p>
                </div>
                <Button onClick={() => setShowProjectForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Project
                </Button>
              </div>
            </Card>
          ) : (
            projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: project.color }}
                        />
                        <div>
                          <CardTitle className="text-lg">{project.name}</CardTitle>
                          {project.description && (
                            <p className="text-sm text-muted-foreground">{project.description}</p>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleEditProject(project)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProject(project)}
                            className="text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        {project.totalPomodoros} total pomodoros
                      </Badge>
                      <Badge variant="outline">
                        {project.tasks.length} tasks
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Tasks</h4>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedProject(project);
                            setEditingTask(null);
                            setShowTaskForm(true);
                          }}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Task
                        </Button>
                      </div>
                      
                      {project.tasks.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No tasks yet. Add your first task to get started.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {project.tasks.map((task) => (
                            <motion.div
                              key={task.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-3 border rounded-lg ${
                                task.completed ? 'bg-muted/50' : 'bg-background'
                              } ${activeTask?.id === task.id ? 'ring-2 ring-primary' : ''}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h5 className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                                      {task.name}
                                    </h5>
                                    {task.completed && (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    )}
                                  </div>
                                  {task.description && (
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="secondary" className="text-xs">
                                      <Clock className="w-3 h-3 mr-1" />
                                      {task.totalPomodoros}
                                    </Badge>
                                    <Badge variant="secondary" className="text-xs">
                                      <Flame className="w-3 h-3 mr-1" />
                                      {task.currentStreak}
                                    </Badge>
                                    {task.estimatedPomodoros && (
                                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Progress 
                                          value={(task.totalPomodoros / task.estimatedPomodoros) * 100} 
                                          className="w-16 h-2"
                                        />
                                        <span>{task.totalPomodoros}/{task.estimatedPomodoros}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  {!task.completed && (
                                    <Button 
                                      size="sm" 
                                      variant={activeTask?.id === task.id ? "default" : "outline"}
                                      onClick={() => handleStartTask(task)}
                                    >
                                      <Play className="w-3 h-3 mr-1" />
                                      {activeTask?.id === task.id ? "Active" : "Start"}
                                    </Button>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreHorizontal className="w-3 h-3" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent>
                                      <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                        <Edit className="w-4 h-4 mr-2" />
                                        Edit
                                      </DropdownMenuItem>
                                      {!task.completed && (
                                        <DropdownMenuItem onClick={() => handleCompleteTask(task)}>
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Mark Complete
                                        </DropdownMenuItem>
                                      )}
                                      <DropdownMenuItem 
                                        onClick={() => handleDeleteTask(task)}
                                        className="text-destructive"
                                      >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
          </TabsContent>
        </Tabs>

        {/* Forms and Modals */}
        <Dialog open={showProjectForm} onOpenChange={setShowProjectForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingProject ? "Edit Project" : "Create New Project"}
              </DialogTitle>
            </DialogHeader>
            <ProjectForm
              project={editingProject}
              onClose={() => {
                setShowProjectForm(false);
                setEditingProject(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? "Edit Task" : "Create New Task"}
              </DialogTitle>
            </DialogHeader>
            <TaskForm
              task={editingTask}
              project={selectedProject}
              onClose={() => {
                setShowTaskForm(false);
                setEditingTask(null);
                setSelectedProject(null);
              }}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={showHistory} onOpenChange={setShowHistory}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Pomodoro History</DialogTitle>
            </DialogHeader>
            <PomodoroHistory />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};