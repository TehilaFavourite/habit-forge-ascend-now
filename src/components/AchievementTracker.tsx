import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAchievementsStore, ActivityTracker } from "@/stores/achievementsStore";
import { useAuthStore } from "@/stores/authStore";
import { Plus, TrendingUp, Target, Zap } from "lucide-react";
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

export const AchievementTracker = () => {
  const { toast } = useToast();
  const { user } = useAuthStore();
  const {
    getActivityTrackers,
    updateActivityProgress,
    initializeUserData
  } = useAchievementsStore();

  const [activityTrackers, setActivityTrackers] = useState<ActivityTracker[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (user?.id) {
      initializeUserData(user.id);
      loadActivityTrackers();
    }
  }, [user?.id]);

  const loadActivityTrackers = () => {
    if (!user?.id) return;
    
    const trackers = getActivityTrackers(user.id);
    setActivityTrackers(trackers);
  };

  const filteredTrackers = activityTrackers.filter(tracker => 
    selectedCategory === "all" || tracker.category === selectedCategory
  );

  const categories = Array.from(new Set(activityTrackers.map(t => t.category)));

  const handleTrackActivity = (activityType: string, increment = 1) => {
    if (!user?.id) return;

    updateActivityProgress(user.id, activityType, increment);
    loadActivityTrackers();
    
    toast({
      title: "Progress Updated!",
      description: `Activity tracked successfully. Keep up the great work!`
    });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Activity Tracker
          </h1>
          <p className="text-gray-600 mt-1">Track your progress towards achievements</p>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>{activityTrackers.length} activities being tracked</span>
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
          >
            All Activities ({activityTrackers.length})
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {categoryIcons[category as keyof typeof categoryIcons]} {category.charAt(0).toUpperCase() + category.slice(1)} ({activityTrackers.filter(t => t.category === category).length})
            </Button>
          ))}
        </div>
      )}

      {/* Activity Trackers */}
      {filteredTrackers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No activity trackers yet</h3>
            <p className="text-gray-500 mb-4">
              {selectedCategory === "all" 
                ? "Create achievements to automatically generate activity trackers!"
                : `No activity trackers in the ${selectedCategory} category yet.`
              }
            </p>
            <p className="text-sm text-gray-400">
              Activity trackers are automatically created when you create achievements.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrackers.map((tracker) => {
            const progressPercentage = getProgressPercentage(tracker.currentCount, tracker.targetCount);
            const isCompleted = tracker.currentCount >= tracker.targetCount;
            
            return (
              <Card key={tracker.id} className={`transition-all hover:shadow-lg ${isCompleted ? 'ring-2 ring-green-400' : ''}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{tracker.icon}</div>
                      <div>
                        <CardTitle className="text-lg">{tracker.name}</CardTitle>
                        <Badge className={categoryColors[tracker.category as keyof typeof categoryColors] || categoryColors.custom}>
                          {tracker.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{tracker.description}</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Progress: {tracker.currentCount}/{tracker.targetCount} {tracker.unit}</span>
                      <span>{Math.round(progressPercentage)}%</span>
                    </div>
                    
                    <Progress value={progressPercentage} className="h-2" />
                    
                    {isCompleted && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 w-full justify-center">
                        <Target className="h-3 w-3 mr-1" />
                        Goal Achieved!
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleTrackActivity(tracker.activityType, 1)}
                      className="flex-1"
                      size="sm"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Track +1
                    </Button>
                    
                    {tracker.targetCount > 10 && (
                      <Button
                        onClick={() => handleTrackActivity(tracker.activityType, 5)}
                        variant="outline"
                        size="sm"
                      >
                        +5
                      </Button>
                    )}
                    
                    {tracker.targetCount > 50 && (
                      <Button
                        onClick={() => handleTrackActivity(tracker.activityType, 10)}
                        variant="outline"
                        size="sm"
                      >
                        +10
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-gray-500 pt-2 border-t">
                    Activity Type: {tracker.activityType}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Summary Stats */}
      {activityTrackers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {activityTrackers.filter(t => t.currentCount >= t.targetCount).length}
                  </p>
                  <p className="text-sm text-gray-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-yellow-600">
                    {activityTrackers.filter(t => t.currentCount > 0 && t.currentCount < t.targetCount).length}
                  </p>
                  <p className="text-sm text-gray-600">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Zap className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {activityTrackers.reduce((sum, t) => sum + t.currentCount, 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
