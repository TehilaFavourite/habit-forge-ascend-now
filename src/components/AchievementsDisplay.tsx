import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAchievementsStore, Achievement, UserAchievement } from "@/stores/achievementsStore";
import { useAuthStore } from "@/stores/authStore";
import { Plus, Edit, Trash2, Trophy, Target, Star, Zap, Book, Code, Shield, Users, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const categoryIcons = {
  fitness: "💪",
  learning: "📚", 
  coding: "💻",
  health: "❤️",
  productivity: "⚡",
  creativity: "🎨",
  social: "👥",
  mindfulness: "🧘",
  career: "💼",
  hobbies: "🎯",
  custom: "⭐"
};

const categoryColors = {
  fitness: "bg-red-100 text-red-800",
  learning: "bg-blue-100 text-blue-800",
  coding: "bg-green-100 text-green-800", 
  health: "bg-pink-100 text-pink-800",
  productivity: "bg-yellow-100 text-yellow-800",
  creativity: "bg-purple-100 text-purple-800",
  social: "bg-indigo-100 text-indigo-800",
  mindfulness: "bg-teal-100 text-teal-800",
  career: "bg-orange-100 text-orange-800",
  hobbies: "bg-cyan-100 text-cyan-800",
  custom: "bg-gray-100 text-gray-800"
};

export const AchievementsDisplay = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    getUserAchievements,
    getAchievementProgress,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    initializeUserData
  } = useAchievementsStore();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userProgress, setUserProgress] = useState<UserAchievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "🎯",
    category: "custom",
    requirement: 1,
    xpReward: 50,
    activityType: "",
    unit: "times"
  });

  useEffect(() => {
    if (user?.id) {
      initializeUserData(user.id);
      loadUserData();
    }
  }, [user?.id]);

  const loadUserData = () => {
    if (!user?.id) return;
    
    const userAchievements = getUserAchievements(user.id);
    const progress = getAchievementProgress(user.id);
    
    setAchievements(userAchievements);
    setUserProgress(progress);
  };

  const getAchievementWithProgress = (achievement: Achievement) => {
    const progress = userProgress.find(p => p.achievementId === achievement.id);
    return {
      ...achievement,
      progress: progress?.progress || 0,
      unlocked: progress?.unlocked || false,
      unlockedAt: progress?.unlockedAt
    };
  };

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === "all" || achievement.category === selectedCategory
  );

  const stats = {
    total: achievements.length,
    unlocked: userProgress.filter(p => p.unlocked).length,
    progress: achievements.length > 0 ? Math.round((userProgress.filter(p => p.unlocked).length / achievements.length) * 100) : 0
  };

  const categories = Array.from(new Set(achievements.map(a => a.category)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!formData.name.trim() || !formData.activityType.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingAchievement) {
        updateAchievement(user.id, editingAchievement.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          category: formData.category,
          requirement: formData.requirement,
          xpReward: formData.xpReward,
          activityType: formData.activityType,
          unit: formData.unit
        });
        toast({
          title: "Success",
          description: "Achievement updated successfully!"
        });
      } else {
        addAchievement(user.id, {
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          category: formData.category,
          requirement: formData.requirement,
          xpReward: formData.xpReward,
          activityType: formData.activityType,
          unit: formData.unit
        });
        toast({
          title: "Success",
          description: "Achievement created successfully! Activity tracker has been automatically created."
        });
      }

      resetForm();
      setIsCreateDialogOpen(false);
      setEditingAchievement(null);
      loadUserData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save achievement",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      category: achievement.category,
      requirement: achievement.requirement,
      xpReward: achievement.xpReward,
      activityType: achievement.activityType,
      unit: achievement.unit
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = (achievementId: string) => {
    if (!user?.id) return;
    
    if (confirm("Are you sure you want to delete this achievement? This will also remove its activity tracker.")) {
      deleteAchievement(user.id, achievementId);
      loadUserData();
      toast({
        title: "Success",
        description: "Achievement and its activity tracker deleted successfully"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "🎯",
      category: "custom",
      requirement: 1,
      xpReward: 50,
      activityType: "",
      unit: "times"
    });
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setEditingAchievement(null);
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Achievements
          </h1>
          <p className="text-gray-600 mt-1">Create and track your personal achievements</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Achievement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingAchievement ? "Edit Achievement" : "Create New Achievement"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Achievement name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does this achievement represent?"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🎯"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fitness">Fitness</SelectItem>
                      <SelectItem value="learning">Learning</SelectItem>
                      <SelectItem value="coding">Coding</SelectItem>
                      <SelectItem value="health">Health</SelectItem>
                      <SelectItem value="productivity">Productivity</SelectItem>
                      <SelectItem value="creativity">Creativity</SelectItem>
                      <SelectItem value="social">Social</SelectItem>
                      <SelectItem value="mindfulness">Mindfulness</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="hobbies">Hobbies</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="activityType">Activity Type *</Label>
                <Input
                  id="activityType"
                  value={formData.activityType}
                  onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
                  placeholder="e.g., exercise_sessions, books_read, code_commits"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This creates the activity tracker identifier
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="requirement">Target</Label>
                  <Input
                    id="requirement"
                    type="number"
                    min="1"
                    value={formData.requirement}
                    onChange={(e) => setFormData({ ...formData, requirement: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Input
                    id="unit"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="times"
                  />
                </div>
                <div>
                  <Label htmlFor="xpReward">XP Reward</Label>
                  <Input
                    id="xpReward"
                    type="number"
                    min="1"
                    value={formData.xpReward}
                    onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 50 })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingAchievement ? "Update Achievement" : "Create Achievement"}
                </Button>
                <Button type="button" variant="outline" onClick={handleDialogClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Trophy className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{stats.unlocked}</p>
                <p className="text-sm text-gray-600">Unlocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.total - stats.unlocked}</p>
                <p className="text-sm text-gray-600">Remaining</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.progress}%</p>
                <p className="text-sm text-gray-600">Complete</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All Achievements ({achievements.length})
        </Button>
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {categoryIcons[category as keyof typeof categoryIcons]} {category.charAt(0).toUpperCase() + category.slice(1)} ({achievements.filter(a => a.category === category).length})
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      {filteredAchievements.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No achievements yet</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory === "all" 
                ? "Create your first achievement to start tracking your progress!"
                : `No achievements in the ${selectedCategory} category yet.`
              }
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Achievement
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAchievements.map((achievement) => {
            const achievementWithProgress = getAchievementWithProgress(achievement);
            const progressPercentage = Math.min((achievementWithProgress.progress / achievement.requirement) * 100, 100);
            
            return (
              <Card key={achievement.id} className={`relative transition-all hover:shadow-lg ${achievementWithProgress.unlocked ? 'ring-2 ring-yellow-400' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{achievement.name}</CardTitle>
                        <Badge className={categoryColors[achievement.category as keyof typeof categoryColors] || categoryColors.custom}>
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                    
                    {achievement.isCustom && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(achievement)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(achievement.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">{achievement.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {achievementWithProgress.progress}/{achievement.requirement} {achievement.unit}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    
                    <Progress value={progressPercentage} className="h-2" />
                    
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">
                        <Zap className="h-3 w-3 inline mr-1" />
                        {achievement.xpReward} XP
                      </span>
                      {achievementWithProgress.unlocked && (
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Trophy className="h-3 w-3 mr-1" />
                          Unlocked
                        </Badge>
                      )}
                    </div>
                    
                    {achievementWithProgress.unlockedAt && (
                      <p className="text-xs text-gray-500">
                        Unlocked on {new Date(achievementWithProgress.unlockedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
