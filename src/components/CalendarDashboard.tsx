
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, BookOpen, TrendingUp } from "lucide-react";
import { useJournalStore } from "@/stores/journalStore";
import { useAuthStore } from "@/stores/authStore";

export const CalendarDashboard = () => {
  const { user } = useAuthStore();
  const { getEntriesForUser, getEntryByDate } = useJournalStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const userId = user?.id || "default-user";
  const userEntries = getEntriesForUser(userId);
  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const selectedEntry = getEntryByDate(userId, selectedDateStr);

  return (
    <div className="min-h-screen bg-gradient-journal p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Writing Calendar</h1>
          <p className="text-muted-foreground text-lg">
            Track your journal entries and writing progress
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card className="bg-card/90 backdrop-blur-xl border-primary/30 shadow-calm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Journal Calendar
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0 scale-125"
                  modifiers={{
                    hasEntry: userEntries.map(entry => new Date(entry.date))
                  }}
                  modifiersStyles={{
                    hasEntry: { 
                      backgroundColor: 'hsl(var(--journal-accent))', 
                      color: 'white',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Selected Date Entry */}
            <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedEntry ? (
                  <div className="space-y-3">
                    <Badge className="mb-2">{selectedEntry.type}</Badge>
                    <h4 className="font-semibold">{selectedEntry.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-4">
                      {selectedEntry.content}
                    </p>
                    {selectedEntry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedEntry.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No entry for this date</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Writing Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Total Entries</span>
                    <span className="font-semibold">{userEntries.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Month</span>
                    <span className="font-semibold">
                      {userEntries.filter(entry => {
                        const entryDate = new Date(entry.date);
                        const currentDate = new Date();
                        return entryDate.getMonth() === currentDate.getMonth() && 
                               entryDate.getFullYear() === currentDate.getFullYear();
                      }).length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">This Week</span>
                    <span className="font-semibold">
                      {userEntries.filter(entry => {
                        const entryDate = new Date(entry.date);
                        const currentDate = new Date();
                        const weekStart = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
                        return entryDate >= weekStart;
                      }).length}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
