import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./components/Dashboard";
import { HabitTracker } from "./components/HabitTracker";
import { PomodoroTimer } from "./components/PomodoroTimer";
import { TodoList } from "./components/TodoList";
import { XPActivities } from "./components/XPActivities";
import { RewardsManager } from "./components/RewardsManager";
import { AchievementsDisplay } from "./components/AchievementsDisplay";
import { DayMastery } from "./components/DayMastery";
import { ProgressReport } from "./components/ProgressReport";
import { Settings } from "./components/Settings";
import { VisionBoard } from "./components/VisionBoard";
import { JournalByDate } from "./components/JournalByDate";
import { AchievementTracker } from "./components/AchievementTracker";
import OnboardingWizard from "./components/OnboardingWizard";
import { ThemeProvider } from "./contexts/ThemeContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Index />} />
            <Route path='/onboarding' element={<OnboardingWizard />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/dashboard/habits' element={<Dashboard activeTab="habits" />} />
            <Route path='/dashboard/focus' element={<Dashboard activeTab="focus" />} />
            <Route path='/dashboard/tasks' element={<Dashboard activeTab="tasks" />} />
            <Route path='/dashboard/xp' element={<Dashboard activeTab="xp" />} />
            <Route path='/dashboard/rewards' element={<Dashboard activeTab="rewards" />} />
            <Route path='/dashboard/achievements' element={<Dashboard activeTab="achievements" />} />
            <Route path='/dashboard/tracker' element={<Dashboard activeTab="tracker" />} />
            <Route path='/dashboard/mastery' element={<Dashboard activeTab="mastery" />} />
            <Route path='/dashboard/vision' element={<Dashboard activeTab="vision" />} />
            <Route path='/dashboard/journal' element={<Dashboard activeTab="journal" />} />
            <Route path='/dashboard/progress' element={<Dashboard activeTab="progress" />} />
            <Route path='/dashboard/settings' element={<Dashboard activeTab="settings" />} />
            {/* Direct routes for dashboard tabs */}
            <Route path='/habits' element={<Dashboard activeTab="habits" />} />
            <Route path='/focus' element={<Dashboard activeTab="focus" />} />
            <Route path='/tasks' element={<Dashboard activeTab="tasks" />} />
            <Route path='/xp' element={<Dashboard activeTab="xp" />} />
            <Route path='/rewards' element={<Dashboard activeTab="rewards" />} />
            <Route path='/achievements' element={<Dashboard activeTab="achievements" />} />
            <Route path='/tracker' element={<Dashboard activeTab="tracker" />} />
            <Route path='/mastery' element={<Dashboard activeTab="mastery" />} />
            <Route path='/vision' element={<Dashboard activeTab="vision" />} />
            <Route path='/journal' element={<Dashboard activeTab="journal" />} />
            <Route path='/progress' element={<Dashboard activeTab="progress" />} />
            <Route path='/settings' element={<Dashboard activeTab="settings" />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
