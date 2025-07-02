
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useHabitStore } from '@/stores/habitStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface HabitFormProps {
  onClose: () => void;
}

const HABIT_ICONS = ['💪', '📚', '🏃', '🧘', '💧', '🥗', '💤', '🎯', '✍️', '🎵'];
const HABIT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444', '#84cc16'];

export const HabitForm = ({ onClose }: HabitFormProps) => {
  const { user } = useAuthStore();
  const { addHabit } = useHabitStore();
  
  const [formData, setFormData] = useState({
    name: '',
    icon: HABIT_ICONS[0],
    color: HABIT_COLORS[0],
    frequency: 'daily' as 'daily' | 'weekly' | 'custom',
    goal: 1,
    isCore: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a habit name');
      return;
    }

    addHabit({
      ...formData,
      userId: user?.id || '',
    });

    toast.success(`🎉 "${formData.name}" habit created! Start building your streak!`);
    onClose();
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Create New Habit
          </DialogTitle>
          <DialogDescription>
            Build a new habit to transform your daily routine
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="habit-name">Habit Name</Label>
            <Input
              id="habit-name"
              placeholder="e.g., Morning Workout, Read 20 pages"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="transition-all focus:ring-purple-500"
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-2">
            <Label>Choose Icon</Label>
            <div className="grid grid-cols-5 gap-2">
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`p-3 rounded-lg border-2 transition-all text-xl ${
                    formData.icon === icon
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <Label>Choose Color</Label>
            <div className="grid grid-cols-4 gap-2">
              {HABIT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`w-12 h-12 rounded-lg border-4 transition-all ${
                    formData.color === color
                      ? 'border-gray-400 scale-110'
                      : 'border-gray-200 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select value={formData.frequency} onValueChange={(value: any) => setFormData(prev => ({ ...prev, frequency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <Label htmlFor="goal">Daily Goal</Label>
            <Input
              id="goal"
              type="number"
              min="1"
              value={formData.goal}
              onChange={(e) => setFormData(prev => ({ ...prev, goal: parseInt(e.target.value) || 1 }))}
            />
          </div>

          {/* Core Habit Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Core Habit</Label>
              <p className="text-sm text-gray-500">Include in day mastery tracking</p>
            </div>
            <Switch
              checked={formData.isCore}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isCore: checked }))}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              Create Habit
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
