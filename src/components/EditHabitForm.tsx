import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useHabitStore, Habit } from "@/stores/habitStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface EditHabitFormProps {
  habit: Habit;
  onClose: () => void;
}

const HABIT_ICONS = [
  "💪",
  "📚",
  "🏃",
  "🧘",
  "💧",
  "🥗",
  "💤",
  "🎯",
  "✍️",
  "🎵",
  "💻",
  "🌅",
  "🌙",
  "🛡️",
  "🎯",
  "🛠️",
];
const HABIT_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#06b6d4",
  "#ef4444",
  "#84cc16",
  "#f97316",
];

export const EditHabitForm = ({ habit, onClose }: EditHabitFormProps) => {
  const { user } = useAuthStore();
  const { updateHabit } = useHabitStore();

  const [formData, setFormData] = useState({
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency as "daily" | "weekly" | "custom",
    goal: habit.goal,
    isCore: habit.isCore,
    description: habit.description || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter a habit name");
      return;
    }

    console.log("Updating habit with data:", formData);

    updateHabit(habit.id, {
      ...formData,
      userId: user?.id || "",
    });

    toast.success(`🎉 "${formData.name}" habit updated successfully!`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-md max-h-[90vh] overflow-y-auto'>
        <DialogHeader className='pb-4'>
          <DialogTitle className='bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            Edit Habit
          </DialogTitle>
          <DialogDescription>
            Update your habit settings and preferences
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Habit Name */}
          <div className='space-y-2'>
            <Label htmlFor='habit-name'>Habit Name</Label>
            <Input
              id='habit-name'
              placeholder='e.g., Morning Workout, Read 20 pages'
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className='transition-all focus:ring-purple-500'
            />
          </div>

          {/* Icon Selection */}
          <div className='space-y-2'>
            <Label>Choose Icon</Label>
            <div className='grid grid-cols-5 gap-2'>
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type='button'
                  onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  className={`p-2 rounded-lg border-2 transition-all text-lg ${
                    formData.icon === icon
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className='space-y-2'>
            <Label>Choose Color</Label>
            <div className='grid grid-cols-4 gap-2'>
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type='button'
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`w-10 h-10 rounded-lg border-4 transition-all ${
                    formData.color === color
                      ? "border-gray-400 scale-110"
                      : "border-gray-200 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className='space-y-2'>
            <Label>Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: any) =>
                setFormData((prev) => ({ ...prev, frequency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='daily'>Daily</SelectItem>
                <SelectItem value='weekly'>Weekly</SelectItem>
                <SelectItem value='custom'>Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Goal */}
          <div className='space-y-2'>
            <Label htmlFor='goal'>Daily Goal</Label>
            <Input
              id='goal'
              type='number'
              min='1'
              value={formData.goal}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  goal: parseInt(e.target.value) || 1,
                }))
              }
            />
          </div>

          {/* Core Habit Toggle */}
          <div className='flex items-center justify-between py-2'>
            <div className='space-y-0.5'>
              <Label>Core Habit</Label>
              <p className='text-sm text-gray-500'>
                Include in day mastery tracking
              </p>
            </div>
            <Switch
              checked={formData.isCore}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isCore: checked }))
              }
            />
          </div>

          {/* Habit Description */}
          <div className='space-y-2'>
            <Label htmlFor='habit-description'>Description</Label>
            <Input
              id='habit-description'
              placeholder='Describe your habit (optional)'
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className='transition-all focus:ring-purple-500'
            />
          </div>

          {/* Actions - Fixed at bottom */}
          <div className='flex gap-3 pt-6 border-t sticky bottom-0 bg-white'>
            <Button
              type='button'
              variant='outline'
              onClick={onClose}
              className='flex-1'
            >
              Cancel
            </Button>
            <Button
              type='submit'
              className='flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
            >
              Update Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
