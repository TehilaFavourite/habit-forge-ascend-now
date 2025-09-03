import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore, Project, ProjectTask } from "@/stores/projectStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface TaskFormProps {
  task?: ProjectTask | null;
  project?: Project | null;
  onClose: () => void;
}

export const TaskForm = ({ task, project, onClose }: TaskFormProps) => {
  const { user } = useAuthStore();
  const { addTask, updateTask, getProjectsForUser } = useProjectStore();

  const projects = getProjectsForUser(user?.id || "");
  
  const [formData, setFormData] = useState({
    name: task?.name || "",
    description: task?.description || "",
    projectId: task?.projectId || project?.id || "",
    estimatedPomodoros: task?.estimatedPomodoros || undefined,
    completed: task?.completed || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Task name is required");
      return;
    }

    if (!formData.projectId) {
      toast.error("Project is required");
      return;
    }

    if (task) {
      updateTask(task.id, formData);
      toast.success("Task updated successfully");
    } else {
      addTask({
        ...formData,
        userId: user?.id || "",
      });
      toast.success("Task created successfully");
    }
    
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Task Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter task name"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter task description"
          rows={3}
        />
      </div>

      {!project && (
        <div className="space-y-2">
          <Label htmlFor="project">Project</Label>
          <Select value={formData.projectId} onValueChange={(value) => setFormData({ ...formData, projectId: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="estimated">Estimated Pomodoros (Optional)</Label>
        <Input
          id="estimated"
          type="number"
          min="1"
          value={formData.estimatedPomodoros || ""}
          onChange={(e) => setFormData({ 
            ...formData, 
            estimatedPomodoros: e.target.value ? parseInt(e.target.value) : undefined 
          })}
          placeholder="How many pomodoros do you estimate?"
        />
      </div>

      {task && (
        <div className="flex items-center space-x-2">
          <Switch
            id="completed"
            checked={formData.completed}
            onCheckedChange={(checked) => setFormData({ ...formData, completed: checked })}
          />
          <Label htmlFor="completed">Mark as completed</Label>
        </div>
      )}

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          {task ? "Update Task" : "Create Task"}
        </Button>
      </div>
    </form>
  );
};