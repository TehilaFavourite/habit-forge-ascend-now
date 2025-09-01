import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shell } from "@/components/Shell";
import { useSettingsStore } from "@/stores/settingsStore";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { 
  BookOpen, 
  ListChecks, 
  Bell, 
  Target, 
  NotebookPen, 
  UserCog,
  CalendarDays
} from "lucide-react";
import { CalendarDashboard } from "./CalendarDashboard";

export const Dashboard = () => {
  const { showFocus, showJournal, showHabits, showTodos } = useSettingsStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const dashboardConfig = [
    {
      id: "focus",
      title: "Focus Timer",
      description: "Boost productivity with the Pomodoro Technique.",
      icon: Target,
      path: "/focus"
    },
    {
      id: "journal",
      title: "Journal",
      description: "Reflect on your day and track personal growth.",
      icon: NotebookPen,
      path: "/journal"
    },
    {
      id: "calendar",
      title: "Calendar",
      description: "View your journal entries on a calendar.",
      icon: CalendarDays,
      path: "/calendar"
    },
    {
      id: "habits",
      title: "Habit Tracker",
      description: "Build and maintain positive habits.",
      icon: ListChecks,
      path: "/habits"
    },
    {
      id: "todos",
      title: "To-Do List",
      description: "Manage tasks and stay organized.",
      icon: Bell,
      path: "/todos"
    },
    {
      id: "settings",
      title: "Settings",
      description: "Customize your dashboard and preferences.",
      icon: UserCog,
      path: "/settings"
    }
  ];

  return (
    <Shell>
      <div className="grid gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold tracking-tight">
            Welcome, {user?.firstName}!
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardConfig.map((item) => {
            if (item.id === "focus" && !showFocus) return null;
            if (item.id === "journal" && !showJournal) return null;
            if (item.id === "habits" && !showHabits) return null;
            if (item.id === "todos" && !showTodos) return null;

            return (
              <Card
                key={item.id}
                className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl border-primary/20 bg-card/90 backdrop-blur-xl shadow-gentle hover:border-primary/40"
                onClick={() => navigate(item.path)}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-muted-foreground group-hover:text-primary line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Shell>
  );
};
