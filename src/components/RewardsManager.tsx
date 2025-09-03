import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useRewardsStore, Reward } from "@/stores/rewardsStore";
import { EditRewardForm } from "./EditRewardForm";
import { useXPStore } from "@/stores/xpStore";
import { useAchievementsStore } from "@/stores/achievementsStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Trophy, Gift, Star, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// Add Unsplash API key here
const UNSPLASH_ACCESS_KEY = "YOUR_UNSPLASH_ACCESS_KEY";

function UnsplashSearch({ onSelect }: { onSelect: (url: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(
          query
        )}&per_page=12&client_id=${UNSPLASH_ACCESS_KEY}`
      );
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError("Failed to fetch images");
    }
    setLoading(false);
  };

  return (
    <div className='space-y-2'>
      <form onSubmit={search} className='flex gap-2'>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search Unsplash (e.g. monitor, headphones)'
        />
        <Button type='submit' disabled={loading}>
          Search
        </Button>
      </form>
      {error && <div className='text-red-500 text-sm'>{error}</div>}
      <div className='grid grid-cols-3 gap-2 mt-2'>
        {results.map((img) => (
          <button
            key={img.id}
            type='button'
            className='border rounded overflow-hidden focus:ring-2 focus:ring-blue-500'
            onClick={() => onSelect(img.urls.small)}
          >
            <img
              src={img.urls.small}
              alt={img.alt_description}
              className='w-full h-20 object-cover'
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export const RewardsManager = () => {
  const { user } = useAuthStore();
  const {
    rewards,
    addReward,
    deleteReward,
    claimReward,
    getRewardsForUser,
    getNextReward,
    getCurrentLevel,
  } = useRewardsStore();
  const { getTotalXPForUser } = useXPStore();
  const { getUserAchievements, getAchievementProgress } = useAchievementsStore();

  // Helper function to calculate total XP from all sources
  const getTotalCombinedXP = (userId: string) => {
    // Get XP from XP activities
    const xpActivitiesTotal = getTotalXPForUser(userId);
    
    // Get XP from unlocked achievements
    const userAchievements = getUserAchievements(userId);
    const achievementProgress = getAchievementProgress(userId);
    
    const achievementsXP = userAchievements.reduce((total, achievement) => {
      const progress = achievementProgress.find(p => p.achievementId === achievement.id);
      return total + (progress?.unlocked ? achievement.xpReward : 0);
    }, 0);
    
    return xpActivitiesTotal + achievementsXP;
  };
  const [showForm, setShowForm] = useState(false);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    level: 1,
    xpRequired: 100,
    imageUrl: "", // Add imageUrl to form state
  });
  // Add upload state
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const userRewards = getRewardsForUser(user?.id || "");
  const totalXP = getTotalCombinedXP(user?.id || "");
  const currentLevel = getCurrentLevel(user?.id || "", totalXP);
  const nextReward = getNextReward(user?.id || "", totalXP);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Check if level already exists
    const existingLevel = userRewards.find((r) => r.level === formData.level);
    if (existingLevel) {
      toast.error(`Level ${formData.level} reward already exists`);
      return;
    }

    addReward({
      ...formData,
      userId: user?.id || "",
    });

    toast.success(`Level ${formData.level} reward added!`);
    setFormData({
      name: "",
      description: "",
      level: 1,
      xpRequired: 100,
      imageUrl: "",
    });
    setUploadPreview(null);
    setShowForm(false);
  };

  const handleClaimReward = (reward: Reward) => {
    if (totalXP >= reward.xpRequired) {
      claimReward(reward.id);
      toast.success(`🎉 Congratulations! You've claimed: ${reward.name}`);
    }
  };

  const RewardCard = ({ reward }: { reward: Reward }) => {
    const canClaim = totalXP >= reward.xpRequired && !reward.unlocked;
    const progress = Math.min((totalXP / reward.xpRequired) * 100, 100);

    return (
      <Card
        className={`bg-white/80 backdrop-blur-sm border-0 shadow-lg ${
          reward.unlocked
            ? "border-green-500 bg-green-50/50"
            : canClaim
            ? "border-yellow-500 bg-yellow-50/50"
            : ""
        }`}
      >
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex items-center gap-1'>
                <Star className='h-4 w-4 text-yellow-500' />
                <span className='font-semibold'>Level {reward.level}</span>
              </div>
              {reward.unlocked && (
                <Badge variant='default' className='bg-green-500'>
                  <CheckCircle2 className='h-3 w-3 mr-1' />
                  Claimed
                </Badge>
              )}
            </div>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => deleteReward(reward.id)}
              className='text-red-500 hover:text-red-700 hover:bg-red-50'
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
          <CardTitle className='text-lg'>{reward.name}</CardTitle>
          <CardDescription>{reward.description}</CardDescription>
          {reward.imageUrl && (
            <img
              src={reward.imageUrl}
              alt='Reward'
              className='w-full h-32 object-cover rounded mt-2'
            />
          )}
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <div className='flex justify-between text-sm'>
              <span>
                Progress: {totalXP}/{reward.xpRequired} XP
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>

          {!reward.unlocked && (
            <Button
              onClick={() => handleClaimReward(reward)}
              disabled={!canClaim}
              className={`w-full ${
                canClaim
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              {canClaim ? (
                <>
                  <Gift className='mr-2 h-4 w-4' />
                  Claim Reward
                </>
              ) : (
                `${reward.xpRequired - totalXP} XP to unlock`
              )}
            </Button>
          )}

          {reward.unlocked && reward.claimedAt && (
            <div className='text-sm text-green-600 text-center'>
              Claimed on {new Date(reward.claimedAt).toLocaleDateString()}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start'>
        <div>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            Rewards & Levels
          </h2>
          <p className='text-gray-600 mt-1'>
            Set rewards for yourself and claim them as you level up
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {currentLevel}
            </div>
            <div className='text-sm text-gray-500'>Current Level</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>{totalXP}</div>
            <div className='text-sm text-gray-500'>Total XP</div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Reward
          </Button>
        </div>
      </div>

      {nextReward && (
        <Card className='bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Trophy className='h-5 w-5 text-yellow-600' />
              Next Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='space-y-2'>
              <h4 className='font-semibold'>{nextReward.name}</h4>
              <p className='text-sm text-gray-600'>{nextReward.description}</p>
              <div className='flex justify-between text-sm'>
                <span>
                  {totalXP}/{nextReward.xpRequired} XP
                </span>
                <span>{nextReward.xpRequired - totalXP} XP to go</span>
              </div>
              <Progress value={(totalXP / nextReward.xpRequired) * 100} />
            </div>
          </CardContent>
        </Card>
      )}

      {userRewards.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {userRewards.map((reward) => (
            <RewardCard key={reward.id} reward={reward} />
          ))}
        </div>
      ) : (
        <Card className='text-center py-12'>
          <CardContent>
            <Trophy className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>
              No rewards yet
            </h3>
            <p className='text-gray-500 mb-6'>
              Create rewards to motivate yourself on your journey
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
            >
              <Plus className='mr-2 h-4 w-4' />
              Create Your First Reward
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Reward Form Modal */}
      {showForm && (
        <Dialog open={true} onOpenChange={() => setShowForm(false)}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Add New Reward</DialogTitle>
              <DialogDescription>
                Create a reward for reaching a specific level
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='reward-name'>Reward Name</Label>
                <Input
                  id='reward-name'
                  placeholder='e.g., High-quality headphones'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='reward-description'>Description</Label>
                <Textarea
                  id='reward-description'
                  placeholder='Describe your reward in detail...'
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='level'>Level</Label>
                  <Input
                    id='level'
                    type='number'
                    min='1'
                    value={formData.level}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        level: parseInt(e.target.value) || 1,
                      }))
                    }
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='xp-required'>XP Required</Label>
                  <Input
                    id='xp-required'
                    type='number'
                    min='1'
                    value={formData.xpRequired}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        xpRequired: parseInt(e.target.value) || 100,
                      }))
                    }
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Reward Image</Label>
                {/* Preview */}
                {(formData.imageUrl || uploadPreview) && (
                  <img
                    src={uploadPreview || formData.imageUrl}
                    alt='Selected Reward'
                    className='w-full h-32 object-cover rounded mb-2'
                  />
                )}
                {/* Unsplash Search */}
                <UnsplashSearch
                  onSelect={(url) => {
                    setFormData((prev) => ({ ...prev, imageUrl: url }));
                    setUploadPreview(null);
                  }}
                />
                {/* Upload */}
                <div className='mt-2'>
                  <input
                    type='file'
                    accept='image/*'
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          setUploadPreview(ev.target?.result as string);
                          setFormData((prev) => ({
                            ...prev,
                            imageUrl: ev.target?.result as string,
                          }));
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <span className='text-xs text-gray-500 ml-2'>
                    or upload your own
                  </span>
                </div>
              </div>

              <div className='flex gap-3 pt-4'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setShowForm(false)}
                  className='flex-1'
                >
                  Cancel
                </Button>
                <Button
                  type='submit'
                  className='flex-1 bg-gradient-to-r from-purple-500 to-blue-500'
                >
                  Add Reward
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
