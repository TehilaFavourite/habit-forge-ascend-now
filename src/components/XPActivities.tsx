import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useXPStore, XPActivity } from "@/stores/xpStore";
import { useAchievementTracker } from "@/stores/achievementTracker";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, Star, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const XPActivities = () => {
  const { user } = useAuthStore();
  const {
    activities,
    completions,
    addActivity,
    deleteActivity,
    completeActivity,
    getActivitiesForUser,
    getTotalXPForDate,
    getTotalXPForUser,
  } = useXPStore();
  const tracker = useAchievementTracker();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    xp: 10,
    type: "core" as "core" | "bonus",
    category: "programming",
    dailyCap: 100,
  });

  const userActivities = getActivitiesForUser(user?.id || "");
  const coreActivities = userActivities.filter((a) => a.type === "core");
  const bonusActivities = userActivities.filter((a) => a.type === "bonus");
  const today = new Date().toISOString().split("T")[0];
  const totalXP = getTotalXPForUser(user?.id || "");
  const todayXP = getTotalXPForDate(today, user?.id || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter an activity name");
      return;
    }

    addActivity({
      ...formData,
      userId: user?.id || "",
      dailyCap: formData.type === "core" ? formData.dailyCap : undefined,
    });

    toast.success(`Activity "${formData.name}" added!`);
    setFormData({
      name: "",
      xp: 10,
      type: "core",
      category: "programming",
      dailyCap: 100,
    });
    setShowForm(false);
  };

  const handleCompleteActivity = (activity: XPActivity) => {
    const existingCompletions = completions.filter(
      (c) => c.activityId === activity.id && c.date === today
    );

    if (activity.type === "core" && activity.dailyCap) {
      const todayXP = existingCompletions.reduce(
        (sum, c) => sum + c.xpEarned,
        0
      );
      if (todayXP >= activity.dailyCap) {
        toast.error("Daily cap reached for this activity");
        return;
      }
    }

    completeActivity(activity.id, today, activity.xp);
    toast.success(`Earned ${activity.xp} XP from ${activity.name}!`);

    // Track achievement progress based on activity category
    const activityName = activity.name.toLowerCase();
    if (activityName.includes("read") || activityName.includes("article")) {
      tracker.trackArticleRead();
    } else if (
      activityName.includes("course") ||
      activityName.includes("learn")
    ) {
      tracker.trackCourseCompleted();
    } else if (
      activityName.includes("code") ||
      activityName.includes("program")
    ) {
      tracker.trackLinesOfCode(activity.xp); // Use XP as a proxy for lines of code
    } else if (activityName.includes("project")) {
      tracker.trackProjectCompleted();
    } else if (activityName.includes("test")) {
      tracker.trackUnitTest();
    } else if (activityName.includes("deploy")) {
      tracker.trackDeployment();
    } else if (
      activityName.includes("security") ||
      activityName.includes("ctf")
    ) {
      tracker.trackSecurityChallenge();
    } else if (activityName.includes("bug")) {
      tracker.trackBugFound();
    }
  };

  const ActivityCard = ({ activity }: { activity: XPActivity }) => {
    const todayCompletions = completions.filter(
      (c) => c.activityId === activity.id && c.date === today
    );
    const todayXP = todayCompletions.reduce((sum, c) => sum + c.xpEarned, 0);
    const canComplete =
      activity.type === "bonus" ||
      !activity.dailyCap ||
      todayXP < activity.dailyCap;

    return (
      <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <CardTitle className='text-sm font-medium'>
              {activity.name}
            </CardTitle>
            <div className='flex items-center gap-2'>
              <Badge
                variant={activity.type === "core" ? "default" : "secondary"}
              >
                {activity.xp} XP
              </Badge>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => deleteActivity(activity.id)}
                className='text-red-500 hover:text-red-700 hover:bg-red-50'
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
          {activity.type === "core" && activity.dailyCap && (
            <div className='space-y-2'>
              <div className='flex justify-between text-xs text-gray-500'>
                <span>
                  Today: {todayXP}/{activity.dailyCap} XP
                </span>
                <span>{Math.round((todayXP / activity.dailyCap) * 100)}%</span>
              </div>
              <Progress
                value={(todayXP / activity.dailyCap) * 100}
                className='h-1'
              />
            </div>
          )}
        </CardHeader>
        <CardContent className='pt-0'>
          <Button
            onClick={() => handleCompleteActivity(activity)}
            disabled={!canComplete}
            className={`w-full ${
              canComplete
                ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                : "bg-gray-300 cursor-not-allowed"
            }`}
          >
            {canComplete ? (
              <>
                <CheckCircle2 className='mr-2 h-4 w-4' />
                Complete (+{activity.xp} XP)
              </>
            ) : (
              "Daily Cap Reached"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start'>
        <div>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            XP Activities
          </h2>
          <p className='text-gray-600 mt-1'>
            Earn experience points through daily activities
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>{totalXP}</div>
            <div className='text-sm text-gray-500'>Total XP</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>{todayXP}</div>
            <div className='text-sm text-gray-500'>Today</div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Activity
          </Button>
        </div>
      </div>

      {/* Core Activities */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Target className='h-5 w-5 text-purple-600' />
          <h3 className='text-xl font-semibold'>Core Activities (Daily Cap)</h3>
        </div>

        {coreActivities.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {coreActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <Card className='text-center py-12'>
            <CardContent>
              <Target className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>
                No core activities yet. Add some to start earning XP!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bonus Activities */}
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Star className='h-5 w-5 text-yellow-600' />
          <h3 className='text-xl font-semibold'>
            Bonus Activities (Unlimited)
          </h3>
        </div>

        {bonusActivities.length > 0 ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {bonusActivities.map((activity) => (
              <ActivityCard key={activity.id} activity={activity} />
            ))}
          </div>
        ) : (
          <Card className='text-center py-12'>
            <CardContent>
              <Star className='h-16 w-16 text-gray-400 mx-auto mb-4' />
              <p className='text-gray-500'>
                No bonus activities yet. Add some for unlimited XP
                opportunities!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Activity Form Modal */}
      {showForm && (
        <Dialog open={true} onOpenChange={() => setShowForm(false)}>
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle>Add New XP Activity</DialogTitle>
              <DialogDescription>
                Create a new activity to earn experience points
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='activity-name'>Activity Name</Label>
                <Input
                  id='activity-name'
                  placeholder='e.g., Morning routine, Code review'
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className='space-y-2'>
                <Label>Activity Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) =>
                    setFormData((prev) => ({ ...prev, type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='core'>Core (Daily Cap)</SelectItem>
                    <SelectItem value='bonus'>Bonus (Unlimited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='xp-value'>XP Value</Label>
                <Input
                  id='xp-value'
                  type='number'
                  min='1'
                  value={formData.xp}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      xp: parseInt(e.target.value) || 1,
                    }))
                  }
                />
              </div>

              {formData.type === "core" && (
                <div className='space-y-2'>
                  <Label htmlFor='daily-cap'>Daily XP Cap</Label>
                  <Input
                    id='daily-cap'
                    type='number'
                    min='1'
                    value={formData.dailyCap}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyCap: parseInt(e.target.value) || 100,
                      }))
                    }
                  />
                </div>
              )}

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
                  Add Activity
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
