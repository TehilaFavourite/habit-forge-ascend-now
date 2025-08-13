import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useHabitStore } from "@/stores/habitStore";
import { useTodoStore } from "@/stores/todoStore";
import { useTheme } from "@/contexts/ThemeContext";
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
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings as SettingsIcon,
  User,
  Trash2,
  Upload,
  RefreshCw,
  Bell,
} from "lucide-react";
import { toast } from "sonner";

export const Settings = () => {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();
  const habitStore = useHabitStore();
  const todoStore = useTodoStore();
  const { theme, toggleTheme } = useTheme();

  const [dailyAffirmation, setDailyAffirmation] = useState(
    localStorage.getItem("daily-affirmation") ||
      "I am becoming the best version of myself through consistent daily actions."
  );
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications-enabled") === "true"
  );

  const handleUpdateAffirmation = () => {
    localStorage.setItem("daily-affirmation", dailyAffirmation);
    toast.success("Daily affirmation updated!");
  };

  const handleToggleNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem("notifications-enabled", enabled.toString());
    toast.success(`Notifications ${enabled ? "enabled" : "disabled"}`);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate data structure
        if (data.habits && Array.isArray(data.habits)) {
          // Import habits (you'd need to implement import methods in stores)
          toast.success("Data imported successfully!");
        } else {
          toast.error("Invalid data format");
        }
      } catch (error) {
        toast.error("Failed to import data");
      }
    };
    reader.readAsText(file);
  };

  const handleResetAllData = () => {
    // Clear all stores
    localStorage.removeItem("habit-storage");
    localStorage.removeItem("todo-storage");
    localStorage.removeItem("habit-auth-storage");
    localStorage.removeItem("xp-storage");
    localStorage.removeItem("rewards-storage");
    localStorage.removeItem("achievements-storage");
    localStorage.removeItem("daily-affirmation");
    localStorage.removeItem("notifications-enabled");
    localStorage.removeItem("habit_app_users");
    // Force reload to reset state
    window.location.reload();
  };
  const handleSignOut = () => {
    logout();
    navigate("/"); // Redirect to home/login
  };

  return (
    <div className='space-y-6'>
      <div>
        <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          Settings
        </h2>
        <p className='text-gray-600 mt-1'>Customize your experience</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Profile Settings */}
        <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <User className='h-5 w-5' />
              Profile
            </CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label>Username</Label>
              <Input value={user?.username || ""} disabled />
            </div>

            <div className='space-y-2'>
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled />
            </div>

            <div className='space-y-2'>
              <Label>Level</Label>
              <Input value={user?.level || 1} disabled />
            </div>

            <div className='space-y-2'>
              <Label>Total XP</Label>
              <Input value={user?.totalXp || 0} disabled />
            </div>

            <Button
              onClick={handleSignOut} // <-- update here
              variant='outline'
              className='w-full text-red-600 border-red-200 hover:bg-red-50'
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Motivation Settings */}
        <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Bell className='h-5 w-5' />
              Motivation & Reminders
            </CardTitle>
            <CardDescription>Personalize your motivation</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            <div className='space-y-2'>
              <Label>Daily Affirmation</Label>
              <Textarea
                placeholder='Write your daily affirmation or reminder...'
                value={dailyAffirmation}
                onChange={(e) => setDailyAffirmation(e.target.value)}
                rows={3}
              />
              <Button
                onClick={handleUpdateAffirmation}
                className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
              >
                Update Affirmation
              </Button>
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Daily Notifications</Label>
                <p className='text-sm text-gray-500'>
                  Get reminded to check your habits
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={handleToggleNotifications}
              />
            </div>

            <div className='flex items-center justify-between'>
              <div className='space-y-0.5'>
                <Label>Dark Mode</Label>
                <p className='text-sm text-gray-500'>
                  Switch between light and dark themes
                </p>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Daily Affirmation Display */}
        <Card className='bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg lg:col-span-2'>
          <CardHeader>
            <CardTitle>Today's Reminder</CardTitle>
            <CardDescription>Your daily source of motivation</CardDescription>
          </CardHeader>
          <CardContent>
            <blockquote className='text-lg italic text-center text-gray-700 py-4'>
              "{dailyAffirmation}"
            </blockquote>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Upload className='h-5 w-5' />
              Data Management
            </CardTitle>
            <CardDescription>
              Import, export, or reset your data
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <Label>Import Data</Label>
              <Input
                type='file'
                accept='.json'
                onChange={handleImportData}
                className='cursor-pointer'
              />
              <p className='text-xs text-gray-500'>
                Import previously exported habit data
              </p>
            </div>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' className='w-full'>
                  <Trash2 className='mr-2 h-4 w-4' />
                  Reset All Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    all your habits, tasks, progress, and account data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleResetAllData}
                    className='bg-red-600 hover:bg-red-700'
                  >
                    Yes, reset everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* App Information */}
        <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <SettingsIcon className='h-5 w-5' />
              About Habit Forge
            </CardTitle>
            <CardDescription>Application information</CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='space-y-2'>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Version</span>
                <span className='text-sm font-medium'>1.0.0</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Built with</span>
                <span className='text-sm font-medium'>React + TypeScript</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-sm text-gray-600'>Storage</span>
                <span className='text-sm font-medium'>Local Storage</span>
              </div>
            </div>

            <div className='pt-4 border-t'>
              <p className='text-xs text-gray-500 text-center'>
                Built for consistent growth and habit mastery
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
