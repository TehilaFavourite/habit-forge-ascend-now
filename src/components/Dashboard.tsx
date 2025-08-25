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
import { JournalByDate } from "@/components/JournalByDate";
import { AchievementTracker } from "@/components/AchievementTracker";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  Settings as SettingsIcon,
  Eye,
  EyeOff,
} from "lucide-react";

interface DashboardProps {
  activeTab?: string;
}

export const Dashboard = ({ activeTab: initialActiveTab }: DashboardProps = {}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(initialActiveTab || "habits");
  const [customizationMode, setCustomizationMode] = useState(false);
  const [visibleTabs, setVisibleTabs] = useState<string[]>(() => {
    const saved = localStorage.getItem('dashboard-visible-tabs');
    return saved ? JSON.parse(saved) : [
      "habits", "focus", "tasks", "xp", "rewards", "achievements", 
      "tracker", "mastery", "vision", "journal", "progress", "settings"
    ];
  });

  // Update active tab based on URL
  useEffect(() => {
    const pathSegments = location.pathname.split('/');
    const tabFromUrl = pathSegments[pathSegments.length - 1];
    
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    } else if (tabFromUrl && tabFromUrl !== '') {
      setActiveTab(tabFromUrl);
    }
  }, [location.pathname, initialActiveTab]);

  // Save visible tabs to localStorage
  useEffect(() => {
    localStorage.setItem('dashboard-visible-tabs', JSON.stringify(visibleTabs));
  }, [visibleTabs]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    navigate(`/${tabId}`);
  };

  const toggleTabVisibility = (tabId: string) => {
    setVisibleTabs(prev => 
      prev.includes(tabId) 
        ? prev.filter(id => id !== tabId)
        : [...prev, tabId]
    );
  };

  const resetToDefaults = () => {
    setVisibleTabs([
      "habits", "focus", "tasks", "xp", "rewards", "achievements", 
      "tracker", "mastery", "vision", "journal", "progress", "settings"
    ]);
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
      label: "Achievement Tracker",
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
    { id: "journal", label: "Journal", icon: BookOpen, component: JournalByDate },
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

  const visibleTabsData = tabs.filter(tab => visibleTabs.includes(tab.id));

  return (
    <div className='min-h-screen'>
      <Header />

      <div className='container mx-auto px-4 py-6'>
        {/* Customization Header */}
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Your Dashboard</h1>
            <p className='text-gray-600'>Personalized for your journey</p>
          </div>
          <Button
            onClick={() => setCustomizationMode(!customizationMode)}
            variant={customizationMode ? "default" : "outline"}
            className='flex items-center gap-2'
          >
            <SettingsIcon className='h-4 w-4' />
            {customizationMode ? "Done Customizing" : "Customize Dashboard"}
          </Button>
        </div>

        {/* Customization Panel */}
        {customizationMode && (
          <Card className='mb-6'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Sparkles className='h-5 w-5 text-purple-500' />
                Customize Your Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <p className='text-gray-600'>
                    Show or hide dashboard sections to create your perfect workspace.
                  </p>
                  <Button
                    onClick={resetToDefaults}
                    variant="outline"
                    size="sm"
                  >
                    Reset to Defaults
                  </Button>
                </div>
                
                <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isVisible = visibleTabs.includes(tab.id);
                    
                    return (
                      <div
                        key={tab.id}
                        className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                          isVisible 
                            ? 'border-purple-200 bg-purple-50' 
                            : 'border-gray-200 bg-gray-50'
                        }`}
                        onClick={() => toggleTabVisibility(tab.id)}
                      >
                        <div className='flex items-center gap-2'>
                          {isVisible ? (
                            <Eye className='h-4 w-4 text-purple-600' />
                          ) : (
                            <EyeOff className='h-4 w-4 text-gray-400' />
                          )}
                          <Icon className={`h-4 w-4 ${isVisible ? 'text-purple-600' : 'text-gray-400'}`} />
                          <span className={`text-sm font-medium ${isVisible ? 'text-purple-900' : 'text-gray-500'}`}>
                            {tab.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content */}
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Sidebar Navigation */}
          <div className='lg:col-span-3'>
            <Card className='sticky top-6'>
              <CardContent className='p-0'>
                <div className='p-4 border-b'>
                  <div className='flex items-center justify-between mb-3'>
                    <h3 className='font-semibold text-gray-800'>Navigation</h3>
                    <span className='text-xs text-gray-500'>
                      {visibleTabsData.length} sections
                    </span>
                  </div>
                  {visibleTabsData.map((tab) => {
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
              </CardContent>
            </Card>
          </div>

          {/* Mobile Tab Bar */}
          <div className='lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-50'>
            <div className='flex overflow-x-auto gap-1 pb-2'>
              {visibleTabsData.slice(0, 6).map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex flex-col items-center min-w-[60px] p-2 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-purple-100 text-purple-600"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className='h-5 w-5' />
                    <span className='text-xs mt-1 truncate'>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Content */}
          <div className='lg:col-span-9'>
            {visibleTabs.includes(activeTab) ? (
              <ActiveComponent />
            ) : (
              <Card className='p-8 text-center'>
                <CardContent>
                  <div className='space-y-4'>
                    <EyeOff className='h-12 w-12 text-gray-400 mx-auto' />
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Section Hidden
                    </h3>
                    <p className='text-gray-600'>
                      This dashboard section is currently hidden. 
                      You can enable it in the customization panel.
                    </p>
                    <Button 
                      onClick={() => setCustomizationMode(true)}
                      variant="outline"
                    >
                      Customize Dashboard
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};