import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useXPStore, XPActivity } from "@/stores/xpStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface EditXPActivityFormProps {
  activity: XPActivity;
  onClose: () => void;
}

export const EditXPActivityForm = ({ activity, onClose }: EditXPActivityFormProps) => {
  const { user } = useAuthStore();
  const { updateActivity } = useXPStore();

  const [formData, setFormData] = useState({
    name: activity.name,
    type: activity.type as "core" | "bonus",
    category: activity.category || "general",
    xp: activity.xp, // This will be read-only
    dailyCap: activity.dailyCap,
    linkedToHabit: activity.linkedToHabit || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Activity name is required");
      return;
    }

    // XP value is intentionally excluded from updates
    const { xp, ...updateData } = formData;
    
    updateActivity(activity.id, updateData);
    toast.success("Activity updated successfully (XP value is locked)");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Activity Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter activity name"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as "core" | "bonus" })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="core">Core Activity</SelectItem>
            <SelectItem value="bonus">Bonus Activity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="health">Health</SelectItem>
            <SelectItem value="learning">Learning</SelectItem>
            <SelectItem value="work">Work</SelectItem>
            <SelectItem value="social">Social</SelectItem>
            <SelectItem value="creativity">Creativity</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>XP Value (Locked)</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-2 bg-muted rounded-md flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formData.xp} XP</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Cannot be changed
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          XP values cannot be modified after creation to maintain fairness and progress integrity.
        </p>
      </div>

      {formData.type === "core" && (
        <div className="space-y-2">
          <Label htmlFor="dailyCap">Daily Cap</Label>
          <Input
            id="dailyCap"
            type="number"
            min="1"
            value={formData.dailyCap || ""}
            onChange={(e) => setFormData({ 
              ...formData, 
              dailyCap: e.target.value ? parseInt(e.target.value) : undefined 
            })}
            placeholder="Maximum completions per day"
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="linkedToHabit">Linked Habit (Optional)</Label>
        <Input
          id="linkedToHabit"
          value={formData.linkedToHabit}
          onChange={(e) => setFormData({ ...formData, linkedToHabit: e.target.value })}
          placeholder="Link to related habit ID"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Update Activity
        </Button>
      </div>
    </form>
  );
};