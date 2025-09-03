import React, { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRewardsStore, Reward } from "@/stores/rewardsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Lock } from "lucide-react";

interface EditRewardFormProps {
  reward: Reward;
  onClose: () => void;
}

export const EditRewardForm = ({ reward, onClose }: EditRewardFormProps) => {
  const { user } = useAuthStore();
  const { updateReward } = useRewardsStore();

  const [formData, setFormData] = useState({
    name: reward.name,
    description: reward.description,
    level: reward.level,
    xpRequired: reward.xpRequired, // This will be read-only
    imageUrl: reward.imageUrl || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Reward name is required");
      return;
    }

    // XP required is intentionally excluded from updates
    const { xpRequired, ...updateData } = formData;
    
    updateReward(reward.id, updateData);
    toast.success("Reward updated successfully (XP requirement is locked)");
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Reward Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter reward name"
          autoFocus
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Enter reward description"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="level">Level</Label>
        <Input
          id="level"
          type="number"
          min="1"
          value={formData.level}
          onChange={(e) => setFormData({ ...formData, level: parseInt(e.target.value) })}
        />
      </div>

      <div className="space-y-2">
        <Label>XP Required (Locked)</Label>
        <div className="flex items-center gap-2">
          <div className="flex-1 p-2 bg-muted rounded-md flex items-center gap-2">
            <Lock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">{formData.xpRequired} XP</span>
          </div>
          <Badge variant="outline" className="text-xs">
            Cannot be changed
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          XP requirements cannot be modified after creation to maintain reward progression integrity.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Image URL (Optional)</Label>
        <Input
          id="imageUrl"
          value={formData.imageUrl}
          onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
          placeholder="Enter image URL"
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" className="flex-1">
          Update Reward
        </Button>
      </div>
    </form>
  );
};