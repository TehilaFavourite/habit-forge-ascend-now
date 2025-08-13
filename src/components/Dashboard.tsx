import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { HabitTracker } from "@/components/HabitTracker";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { TodoList } from "@/components/TodoList";
import { XPActivities } from "@/components/XPActivities";
import { RewardsManager } from "@/components/RewardsManager";
import { AchievementsDisplay } from "@/components/AchievementsDisplay";
import { DayMastery } from "@/components/DayMastery";
import { ProgressReport } from "@/components/ProgressReport";
import { Settings } from "@/components/Settings";
import { VisionBoard } from "@/components/VisionBoard";
import { Journal } from "@/components/Journal";
import { AchievementTracker } from "@/components/AchievementTracker";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, useLocation } from "react-router-dom";



import {
  Calendar,
  Clock,
  CheckSquare,
  Zap,
  Trophy,
  Target,
  Crown,
  BarChart3,
  Cog,
  Sparkles,
  BookOpen,
  TrendingUp,
  Play,
} from "lucide-react";

interface DashboardProps {
  activeTab?: string;
}

export const Dashboard = ({ activeTab: initialActiveTab }: DashboardProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(initialActiveTab || "habits");

  // Update active tab based on URL
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const tabFromUrl = pathSegments[pathSegments.length - 1];
    
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    } else if (tabFromUrl && tabFromUrl !== 'dashboard') {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname, initialActiveTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/dashboard/${tabId}`);
  };

  const tabs = [
    { id: "habits", label: "Habits", icon: Calendar, component: HabitTracker },
    { id: "focus", label: "Focus", icon: Clock, component: PomodoroTimer },
    { id: "tasks", label: "Tasks", icon: CheckSquare, component: TodoList },
    { id: "xp", label: "XP Activities", icon: Zap, component: XPActivities },
    {
      id: "rewards",
      label: "Rewards",
      icon: Trophy,
      component: RewardsManager,
    },
    {
      id: "achievements",
      label: "Achievements",
      icon: Target,
      component: AchievementsDisplay,
    },
    {
      id: "tracker",
      label: "Activity Tracker",
      icon: TrendingUp,
      component: AchievementTracker,
    },

    { id: "mastery", label: "Day Mastery", icon: Crown, component: DayMastery },
    {
      id: "vision",
      label: "Vision Board",
      icon: Sparkles,
      component: VisionBoard,
    },
    { id: "journal", label: "Journal", icon: BookOpen, component: Journal },
    {
      id: "progress",
      label: "Progress",
      icon: BarChart3,
      component: ProgressReport,
    },
    { id: "settings", label: "Settings", icon: Cog, component: Settings },
  ];

  const ActiveComponent =
    tabs.find((tab) => tab.id === activeTab)?.component || HabitTracker;

  return (
    <div className='min-h-screen'>
      <Header />

      <div className='container mx-auto px-4 py-6'>
        {/* Mobile Tab Navigation */}
        <div className='md:hidden mb-6'>
          <div className='flex overflow-x-auto space-x-2 pb-2'>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                      : "bg-white/70 text-gray-600 hover:bg-white hover:shadow-md"
                  }`}
                >
                  <Icon className='h-4 w-4' />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className='flex gap-6'>
          {/* Desktop Sidebar */}
          <div className='hidden md:block w-64 space-y-2'>
            <div className='bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg'>
              <h3 className='font-semibold text-gray-800 mb-3'>Navigation</h3>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className='h-5 w-5' />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            <ActiveComponent />
          </div>
        </div>
      </div>
    </div>
  );
};
