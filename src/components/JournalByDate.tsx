import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { FlashcardLearning } from "./FlashcardLearning";
import {
  BookOpen,
  Plus,
  Calendar as CalendarIcon,
  ArrowLeft,
  Target,
  Heart,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import { useJournalStore } from "@/stores/journalStore";
import { useAuthStore } from "@/stores/authStore";
import { useAchievementTracker } from "@/stores/achievementTracker";
import { toast } from "sonner";
import { format } from "date-fns";

interface LearningItem {
  id: string;
  title: string;
  status: "learning" | "completed" | "revisit";
  notes: string;
  dateAdded: Date;
  priority: "low" | "medium" | "high";
}

export const JournalByDate = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const { user } = useAuthStore();
  const tracker = useAchievementTracker();
  
  const {
    addEntry,
    getEntriesForUser,
    getEntryByDate,
  } = useJournalStore();

  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    type: "reflection" as "reflection" | "gratitude" | "learning" | "goals" | "insights",
    mood: 3,
  });

  const [newLearning, setNewLearning] = useState({
    title: "",
    notes: "",
    status: "learning" as LearningItem["status"],
    priority: "medium" as LearningItem["priority"],
  });

  // Load learning items from localStorage
  useEffect(() => {
    const savedLearning = localStorage.getItem("journal-learning-items");
    if (savedLearning) {
      const parsedLearning = JSON.parse(savedLearning).map((item: any) => ({
        ...item,
        dateAdded: new Date(item.dateAdded),
      }));
      setLearningItems(parsedLearning);
    }
  }, []);

  // Save learning items to localStorage
  useEffect(() => {
    localStorage.setItem("journal-learning-items", JSON.stringify(learningItems));
  }, [learningItems]);

  const dateString = format(selectedDate, "yyyy-MM-dd");
  const todaysEntries = user ? getEntriesForUser(user.id).filter(
    entry => entry.date === dateString
  ) : [];

  const todaysLearning = learningItems.filter(
    item => format(item.dateAdded, "yyyy-MM-dd") === dateString
  );

  const existingEntry = user ? getEntryByDate(user.id, dateString) : undefined;

  const addJournalEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim() || !user) return;

    addEntry({
      date: dateString,
      title: newEntry.title,
      content: newEntry.content,
      mood: newEntry.mood,
      tags: [],
      userId: user.id,
    });

    setNewEntry({
      title: "",
      content: "",
      type: "reflection",
      mood: 3,
    });

    toast.success("Journal entry added!");
  };

  const addLearningItem = () => {
    if (!newLearning.title.trim() || !newLearning.notes.trim()) return;

    const newItem: LearningItem = {
      id: `learning-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newLearning.title,
      status: newLearning.status,
      notes: newLearning.notes,
      dateAdded: selectedDate,
      priority: newLearning.priority,
    };

    setLearningItems(prev => [...prev, newItem]);
    setNewLearning({
      title: "",
      notes: "",
      status: "learning",
      priority: "medium",
    });

    toast.success("Learning item added!");
  };

  const updateLearningStatus = (id: string, status: LearningItem["status"]) => {
    setLearningItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, status } : item
      )
    );
    
    if (status === "completed") {
      toast.success("Great job! Learning item completed!");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "gratitude":
        return <Heart className="w-4 h-4 text-pink-500" />;
      case "learning":
        return <BookOpen className="w-4 h-4 text-blue-500" />;
      case "goals":
        return <Target className="w-4 h-4 text-green-500" />;
      case "insights":
        return <Lightbulb className="w-4 h-4 text-yellow-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
    }
  };

  const getMoodEmoji = (mood: number) => {
    switch (mood) {
      case 1: return "😢";
      case 2: return "😔";
      case 3: return "😐";
      case 4: return "😊";
      case 5: return "😄";
      default: return "😐";
    }
  };

  if (showCalendar) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowCalendar(false)}
            className="border-learning-border"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Journal
          </Button>
          <h2 className="text-2xl font-bold text-onboarding-text">
            Select Date
          </h2>
        </div>

        <Card className="max-w-md mx-auto bg-gradient-to-br from-onboarding-bg to-onboarding-secondary border-onboarding-border">
          <CardContent className="p-6">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                if (date) {
                  setSelectedDate(date);
                  setShowCalendar(false);
                }
              }}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-learning-primary to-blue-600 bg-clip-text text-transparent">
            Journal
          </h2>
          <p className="text-learning-text mt-1">
            Reflect and track your learning journey
          </p>
        </div>
        <Button
          onClick={() => setShowCalendar(true)}
          variant="outline"
          className="border-learning-border"
        >
          <CalendarIcon className="w-4 h-4 mr-2" />
          {format(selectedDate, "MMM dd, yyyy")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Journal Entry */}
        <div className="space-y-6">
          {/* New Entry Card */}
          <Card className="bg-gradient-to-br from-learning-bg to-learning-secondary border-learning-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-learning-primary" />
                Daily Reflection
              </CardTitle>
              <CardDescription className="text-learning-text">
                {format(selectedDate, "EEEE, MMMM dd, yyyy")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-onboarding-text">
                  What's on your mind?
                </label>
                <Input
                  placeholder="Title your thoughts..."
                  value={newEntry.title}
                  onChange={(e) =>
                    setNewEntry(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-learning-secondary/50 border-learning-border text-onboarding-text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-onboarding-text">
                  Your thoughts
                </label>
                <Textarea
                  placeholder="Share your reflections, experiences, or insights..."
                  value={newEntry.content}
                  onChange={(e) =>
                    setNewEntry(prev => ({ ...prev, content: e.target.value }))
                  }
                  rows={4}
                  className="bg-learning-secondary/50 border-learning-border text-onboarding-text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-onboarding-text">
                  How are you feeling? {getMoodEmoji(newEntry.mood)}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={newEntry.mood}
                  onChange={(e) =>
                    setNewEntry(prev => ({ ...prev, mood: parseInt(e.target.value) }))
                  }
                  className="w-full"
                />
              </div>

              <Button
                onClick={addJournalEntry}
                disabled={!newEntry.title.trim() || !newEntry.content.trim()}
                className="w-full bg-learning-primary hover:bg-learning-primary/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </CardContent>
          </Card>

          {/* Today's Entries */}
          {todaysEntries.length > 0 && (
            <Card className="bg-gradient-to-br from-learning-bg to-learning-secondary border-learning-border">
              <CardHeader>
                <CardTitle className="text-onboarding-text">Today's Entries</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {todaysEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 bg-learning-secondary/50 rounded-lg border border-learning-border"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-onboarding-text">
                        {entry.title}
                      </h4>
                      <div className="flex items-center gap-2">
                        {entry.mood && (
                          <span className="text-lg">
                            {getMoodEmoji(entry.mood)}
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-learning-text whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Learning */}
        <div className="space-y-6">
          {/* New Learning Item */}
          <Card className="bg-gradient-to-br from-learning-bg to-learning-secondary border-learning-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-learning-primary" />
                Learning Tracker
              </CardTitle>
              <CardDescription className="text-learning-text">
                What did you learn today?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-onboarding-text">
                  What did you learn?
                </label>
                <Input
                  placeholder="New skill, concept, or insight..."
                  value={newLearning.title}
                  onChange={(e) =>
                    setNewLearning(prev => ({ ...prev, title: e.target.value }))
                  }
                  className="bg-learning-secondary/50 border-learning-border text-onboarding-text"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-onboarding-text">
                  Notes & Details
                </label>
                <Textarea
                  placeholder="Explain what you learned and why it's important..."
                  value={newLearning.notes}
                  onChange={(e) =>
                    setNewLearning(prev => ({ ...prev, notes: e.target.value }))
                  }
                  rows={3}
                  className="bg-learning-secondary/50 border-learning-border text-onboarding-text"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium text-onboarding-text">
                    Priority
                  </label>
                  <select
                    value={newLearning.priority}
                    onChange={(e) =>
                      setNewLearning(prev => ({ 
                        ...prev, 
                        priority: e.target.value as LearningItem["priority"] 
                      }))
                    }
                    className="w-full p-2 rounded-md bg-learning-secondary/50 border border-learning-border text-onboarding-text"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={addLearningItem}
                disabled={!newLearning.title.trim() || !newLearning.notes.trim()}
                className="w-full bg-learning-primary hover:bg-learning-primary/80 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Learning
              </Button>
            </CardContent>
          </Card>

          {/* Learning Flashcards */}
          {todaysLearning.length > 0 && (
            <Card className="bg-gradient-to-br from-learning-bg to-learning-secondary border-learning-border">
              <CardHeader>
                <CardTitle className="text-onboarding-text">Today's Learning</CardTitle>
                <CardDescription className="text-learning-text">
                  Review your learning with flashcards
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FlashcardLearning
                  items={todaysLearning}
                  onUpdateStatus={updateLearningStatus}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};