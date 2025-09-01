import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Dashboard } from "./components/Dashboard";
import { HabitTracker } from "./components/HabitTracker";
import { FocusTimer } from "./components/FocusTimer";
import { TodoList } from "./components/TodoList";
import { XPActivities } from "./components/XPActivities";
import { RewardsManager } from "./components/RewardsManager";
import { AchievementsDisplay } from "./components/AchievementsDisplay";
import { DayMastery } from "./components/DayMastery";
import { ProgressReport } from "./components/ProgressReport";
import { Settings } from "./components/Settings";
import { VisionBoard } from "./components/VisionBoard";
import { JournalByDate } from "./components/JournalByDate";
import { JournalDashboard } from "./components/JournalDashboard";
import { CalendarDashboard } from "./components/CalendarDashboard";
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
            <Route path='/habits' element={<HabitTracker />} />
            <Route path='/focus' element={<FocusTimer />} />
            <Route path='/todos' element={<TodoList />} />
            <Route path='/journal' element={<JournalDashboard />} />
            <Route path='/calendar' element={<CalendarDashboard />} />
            <Route path='/settings' element={<Settings />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path='*' element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
