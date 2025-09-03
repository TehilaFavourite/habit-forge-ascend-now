import React, { useMemo } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useProjectStore } from "@/stores/projectStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Target, TrendingUp } from "lucide-react";
import { format, subDays, startOfDay } from "date-fns";

export const PomodoroHistory = () => {
  const { user } = useAuthStore();
  const { getSessionsForUser, getDailyProgress, getProjectsForUser } = useProjectStore();

  const sessions = getSessionsForUser(user?.id || "");
  const dailyProgress = getDailyProgress(user?.id || "");
  const projects = getProjectsForUser(user?.id || "");

  // Get last 30 days of data
  const last30Days = useMemo(() => {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const date = format(subDays(new Date(), i), 'yyyy-MM-dd');
      const dayProgress = dailyProgress.find(d => d.date === date);
      data.push({
        date,
        sessions: dayProgress?.sessions || 0,
        totalMinutes: dayProgress?.totalMinutes || 0,
      });
    }
    return data;
  }, [dailyProgress]);

  // Calculate statistics
  const totalSessions = sessions.filter(s => s.mode === "work").length;
  const totalMinutes = sessions.reduce((total, s) => total + s.duration, 0);
  const averageDailySessions = totalSessions > 0 ? (totalSessions / 30).toFixed(1) : "0";
  const longestStreak = useMemo(() => {
    let currentStreak = 0;
    let maxStreak = 0;
    
    last30Days.forEach((day) => {
      if (day.sessions > 0) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }, [last30Days]);

  // Group sessions by date for recent activity
  const recentSessions = sessions
    .slice(0, 50)
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());

  const getProjectName = (projectId: string) => {
    return projects.find(p => p.id === projectId)?.name || "Unknown Project";
  };

  const getTaskName = (projectId: string, taskId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project?.tasks.find(t => t.id === taskId)?.name || "Unknown Task";
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{totalSessions}</p>
            <p className="text-sm text-muted-foreground">Total Pomodoros</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{Math.round(totalMinutes / 60)}h</p>
            <p className="text-sm text-muted-foreground">Total Focus Time</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{averageDailySessions}</p>
            <p className="text-sm text-muted-foreground">Avg Daily</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-primary mb-2" />
            <p className="text-2xl font-bold">{longestStreak}</p>
            <p className="text-sm text-muted-foreground">Longest Streak</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Last 30 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {last30Days.map((day) => (
              <div key={day.date} className="flex items-center gap-3">
                <div className="w-20 text-sm text-muted-foreground">
                  {format(new Date(day.date), 'MMM dd')}
                </div>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary rounded-full h-2 transition-all"
                    style={{ width: `${Math.min((day.sessions / 8) * 100, 100)}%` }}
                  />
                </div>
                <div className="w-12 text-sm text-right">
                  {day.sessions}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No sessions recorded yet. Start a pomodoro session to see your history here!
            </p>
          ) : (
            <div className="space-y-3">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{getTaskName(session.projectId, session.taskId)}</p>
                    <p className="text-sm text-muted-foreground">{getProjectName(session.projectId)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={session.mode === "work" ? "default" : "secondary"}>
                      {session.mode === "work" ? "Focus" : 
                       session.mode === "shortBreak" ? "Short Break" : "Long Break"}
                    </Badge>
                    <Badge variant="outline">
                      {session.duration}m
                    </Badge>
                    <div className="text-sm text-muted-foreground">
                      {format(new Date(session.completedAt), 'MMM dd, HH:mm')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};