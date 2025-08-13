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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  BookOpen,
  Lightbulb,
  Target,
  Heart,
  TrendingUp,
  CalendarDays,
  Plus,
  X,
} from "lucide-react";
import { useAchievementTracker } from "@/stores/achievementTracker";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  date: Date;
  type: "reflection" | "gratitude" | "learning" | "goals" | "insights";
  title: string;
  content: string;
}

interface LearningItem {
  id: string;
  title: string;
  status: "learning" | "completed" | "revisit";
  notes: string;
  dateAdded: Date;
  priority: "low" | "medium" | "high";
}

export const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState("daily");
  const tracker = useAchievementTracker();

  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    type: "reflection" as JournalEntry["type"],
  });

  const [newLearning, setNewLearning] = useState({
    title: "",
    notes: "",
    status: "learning" as LearningItem["status"],
    priority: "medium" as LearningItem["priority"],
  });

  // Load data from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem("journal-entries");
    const savedLearning = localStorage.getItem("journal-learning-items");

    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        date: new Date(entry.date),
      }));
      setEntries(parsedEntries);
    }

    if (savedLearning) {
      const parsedLearning = JSON.parse(savedLearning).map((item: any) => ({
        ...item,
        dateAdded: new Date(item.dateAdded),
      }));
      setLearningItems(parsedLearning);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("journal-entries", JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem(
      "journal-learning-items",
      JSON.stringify(learningItems)
    );
  }, [learningItems]);

  const addJournalEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date(),
      type: newEntry.type,
      title: newEntry.title,
      content: newEntry.content,
    };

    setEntries([...entries, entry]);
    setNewEntry({ title: "", content: "", type: "reflection" });

    // Track learning activities for achievements
    if (newEntry.type === "learning") {
      tracker.trackArticleRead();
      toast.success("Learning entry added! 📚 Achievement progress updated.");
    }
  };

  const addLearningItem = () => {
    if (!newLearning.title.trim()) return;

    const item: LearningItem = {
      id: Date.now().toString(),
      title: newLearning.title,
      notes: newLearning.notes,
      status: newLearning.status,
      priority: newLearning.priority,
      dateAdded: new Date(),
    };

    setLearningItems([...learningItems, item]);
    setNewLearning({
      title: "",
      notes: "",
      status: "learning",
      priority: "medium",
    });

    // Track learning activities for achievements
    tracker.trackArticleRead();
    toast.success("Learning item added! 📚 Achievement progress updated.");
  };

  const updateLearningStatus = (id: string, status: LearningItem["status"]) => {
    setLearningItems(
      learningItems.map((item) => (item.id === id ? { ...item, status } : item))
    );

    // Track course completion for achievements
    if (status === "completed") {
      tracker.trackCourseCompleted();
      toast.success("Course completed! 🎓 Achievement progress updated.");
    }
  };

  const deleteLearningItem = (id: string) => {
    setLearningItems(learningItems.filter((item) => item.id !== id));
  };

  const getEntriesForDate = (date: Date) => {
    return entries.filter(
      (entry) => entry.date.toDateString() === date.toDateString()
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "learning":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "revisit":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDatesWithEntries = () => {
    const dates = new Set<string>();
    entries.forEach((entry) => {
      dates.add(entry.date.toDateString());
    });
    return dates;
  };

  const calculateStreak = () => {
    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    while (true) {
      const dateString = currentDate.toDateString();
      const hasEntry = entries.some(
        (entry) => entry.date.toDateString() === dateString
      );

      if (hasEntry) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const getDailyPrompt = () => {
    const prompts = [
      "What are you grateful for today?",
      "What's your biggest challenge right now?",
      "What did you learn today?",
      "What made you smile today?",
      "What's one thing you want to improve?",
      "What are you looking forward to?",
      "What's something you're proud of?",
      "What's on your mind lately?",
      "What's a goal you're working towards?",
      "What's something that inspired you today?",
    ];

    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return prompts[dayOfYear % prompts.length];
  };

  const datesWithEntries = getDatesWithEntries();
  const todaysEntries = getEntriesForDate(selectedDate);

  return (
    <div className='space-y-6'>
      <div className='flex items-center gap-3'>
        <BookOpen className='h-8 w-8 text-purple-600' />
        <div>
          <h1 className='text-2xl font-bold text-gray-900'>Journal</h1>
          <p className='text-gray-600'>Reflect, learn, and grow every day</p>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-6'
      >
        <TabsList className='grid w-full grid-cols-4'>
          <TabsTrigger value='daily' className='flex items-center gap-2'>
            <BookOpen className='h-4 w-4' />
            Daily
          </TabsTrigger>
          <TabsTrigger value='learning' className='flex items-center gap-2'>
            <Lightbulb className='h-4 w-4' />
            Learning
          </TabsTrigger>
          <TabsTrigger value='insights' className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            Insights
          </TabsTrigger>
          <TabsTrigger value='calendar' className='flex items-center gap-2'>
            <CalendarDays className='h-4 w-4' />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value='daily' className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5' />
                  New Entry
                </CardTitle>
                <CardDescription>
                  Write about your day, thoughts, or experiences
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='text-sm font-medium'>Type</label>
                    <select
                      value={newEntry.type}
                      onChange={(e) =>
                        setNewEntry({
                          ...newEntry,
                          type: e.target.value as any,
                        })
                      }
                      className='w-full p-2 border rounded-md'
                    >
                      <option value='reflection'>Reflection</option>
                      <option value='gratitude'>Gratitude</option>
                      <option value='learning'>Learning</option>
                      <option value='goals'>Goals</option>
                      <option value='insights'>Insights</option>
                    </select>
                  </div>
                </div>

                <Input
                  placeholder='Entry title...'
                  value={newEntry.title}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, title: e.target.value })
                  }
                />

                <Textarea
                  placeholder="What's on your mind today?"
                  value={newEntry.content}
                  onChange={(e) =>
                    setNewEntry({ ...newEntry, content: e.target.value })
                  }
                  rows={6}
                />

                <Button onClick={addJournalEntry} className='w-full'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Entry
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's Entries</CardTitle>
                <CardDescription>
                  {todaysEntries.length} entries for{" "}
                  {selectedDate.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-4 max-h-96 overflow-y-auto'>
                  {todaysEntries.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>
                      No entries for today yet
                    </p>
                  ) : (
                    todaysEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className='border rounded-lg p-4 space-y-2'
                      >
                        <div className='flex items-center justify-between'>
                          <h4 className='font-medium'>{entry.title}</h4>
                          <Badge variant='outline' className='capitalize'>
                            {entry.type}
                          </Badge>
                        </div>
                        <p className='text-sm text-gray-600 line-clamp-3'>
                          {entry.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='learning' className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-2'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Lightbulb className='h-5 w-5' />
                  Track Learning
                </CardTitle>
                <CardDescription>
                  Add something you're learning or want to revisit
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Input
                  placeholder='What are you learning?'
                  value={newLearning.title}
                  onChange={(e) =>
                    setNewLearning({ ...newLearning, title: e.target.value })
                  }
                />

                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <label className='text-sm font-medium'>Status</label>
                    <select
                      value={newLearning.status}
                      onChange={(e) =>
                        setNewLearning({
                          ...newLearning,
                          status: e.target.value as any,
                        })
                      }
                      className='w-full p-2 border rounded-md'
                    >
                      <option value='learning'>Currently Learning</option>
                      <option value='completed'>Completed</option>
                      <option value='revisit'>Need to Revisit</option>
                    </select>
                  </div>

                  <div>
                    <label className='text-sm font-medium'>Priority</label>
                    <select
                      value={newLearning.priority}
                      onChange={(e) =>
                        setNewLearning({
                          ...newLearning,
                          priority: e.target.value as any,
                        })
                      }
                      className='w-full p-2 border rounded-md'
                    >
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                    </select>
                  </div>
                </div>

                <Textarea
                  placeholder='Notes, resources, or thoughts...'
                  value={newLearning.notes}
                  onChange={(e) =>
                    setNewLearning({ ...newLearning, notes: e.target.value })
                  }
                  rows={3}
                />

                <Button onClick={addLearningItem} className='w-full'>
                  <Plus className='h-4 w-4 mr-2' />
                  Add Learning Item
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Learning Items</CardTitle>
                <CardDescription>
                  {learningItems.length} items tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3 max-h-96 overflow-y-auto'>
                  {learningItems.length === 0 ? (
                    <p className='text-gray-500 text-center py-8'>
                      No learning items yet
                    </p>
                  ) : (
                    learningItems.map((item) => (
                      <div
                        key={item.id}
                        className='border rounded-lg p-3 space-y-2'
                      >
                        <div className='flex items-center justify-between'>
                          <h4 className='font-medium'>{item.title}</h4>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => deleteLearningItem(item.id)}
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>

                        <div className='flex gap-2'>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>

                        {item.notes && (
                          <p className='text-sm text-gray-600'>{item.notes}</p>
                        )}

                        <div className='flex gap-1 pt-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              updateLearningStatus(item.id, "learning")
                            }
                          >
                            Learning
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              updateLearningStatus(item.id, "completed")
                            }
                          >
                            Completed
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() =>
                              updateLearningStatus(item.id, "revisit")
                            }
                          >
                            Revisit
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='insights' className='space-y-6'>
          <div className='grid gap-6 md:grid-cols-3'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Heart className='h-5 w-5 text-red-500' />
                  Gratitude
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {entries
                    .filter((e) => e.type === "gratitude")
                    .slice(0, 3)
                    .map((entry) => (
                      <div key={entry.id} className='p-2 bg-red-50 rounded'>
                        <p className='text-sm'>
                          {entry.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Target className='h-5 w-5 text-blue-500' />
                  Goals & Intentions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {entries
                    .filter((e) => e.type === "goals")
                    .slice(0, 3)
                    .map((entry) => (
                      <div key={entry.id} className='p-2 bg-blue-50 rounded'>
                        <p className='text-sm'>
                          {entry.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <TrendingUp className='h-5 w-5 text-green-500' />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  {entries
                    .filter((e) => e.type === "insights")
                    .slice(0, 3)
                    .map((entry) => (
                      <div key={entry.id} className='p-2 bg-green-50 rounded'>
                        <p className='text-sm'>
                          {entry.content.substring(0, 100)}...
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='calendar'>
          <div className='space-y-4'>
            <Card>
              <CardHeader className='pb-3'>
                <CardTitle className='flex items-center gap-2'>
                  <CalendarDays className='h-5 w-5' />
                  Journal Calendar
                </CardTitle>
                <CardDescription>
                  Select a date to view entries. Dates with entries are
                  highlighted.
                </CardDescription>
              </CardHeader>
              <CardContent className='pt-0'>
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-4'>
                  <div className='lg:col-span-3'>
                    <div className='bg-white border rounded-lg p-6 shadow-sm'>
                      <Calendar
                        mode='single'
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        className='w-full'
                        modifiers={{
                          hasEntries: (date) =>
                            datesWithEntries.has(date.toDateString()),
                        }}
                        modifiersStyles={{
                          hasEntries: {
                            backgroundColor: "rgb(147 51 234)",
                            color: "white",
                            fontWeight: "bold",
                          },
                        }}
                      />

                      <div className='flex items-center justify-center gap-4 text-xs text-gray-600 mt-4 pt-3 border-t'>
                        <div className='flex items-center gap-1'>
                          <div className='w-2 h-2 rounded-full bg-purple-600'></div>
                          <span>Has entries</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <div className='w-2 h-2 rounded-full bg-blue-600'></div>
                          <span>Selected date</span>
                        </div>
                        <div className='flex items-center gap-1'>
                          <div className='w-2 h-2 rounded-full bg-gray-300'></div>
                          <span>Today</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='space-y-3'>
                    <div className='bg-gradient-to-br from-purple-50 to-blue-50 p-3 rounded-lg border'>
                      <h3 className='font-semibold text-gray-800 mb-2 text-sm'>
                        Quick Stats
                      </h3>
                      <div className='space-y-2 text-xs'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Total Entries:</span>
                          <span className='font-medium'>{entries.length}</span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>
                            Days with Entries:
                          </span>
                          <span className='font-medium'>
                            {datesWithEntries.size}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Selected Date:</span>
                          <span className='font-medium'>
                            {selectedDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border'>
                      <h3 className='font-semibold text-gray-800 mb-2 text-sm'>
                        Entry Types
                      </h3>
                      <div className='space-y-1 text-xs'>
                        {[
                          "reflection",
                          "gratitude",
                          "learning",
                          "goals",
                          "insights",
                        ].map((type) => {
                          const count = entries.filter(
                            (e) => e.type === type
                          ).length;
                          return (
                            <div key={type} className='flex justify-between'>
                              <span className='text-gray-600 capitalize'>
                                {type}:
                              </span>
                              <span className='font-medium'>{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className='bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-lg border'>
                      <h3 className='font-semibold text-gray-800 mb-2 text-sm'>
                        Quick Actions
                      </h3>
                      <div className='space-y-2'>
                        <Button
                          size='sm'
                          className='w-full text-xs h-8'
                          onClick={() => setActiveTab("daily")}
                        >
                          <Plus className='h-3 w-3 mr-1' />
                          New Entry
                        </Button>
                        <Button
                          size='sm'
                          variant='outline'
                          className='w-full text-xs h-8'
                          onClick={() => setActiveTab("learning")}
                        >
                          <Lightbulb className='h-3 w-3 mr-1' />
                          Add Learning
                        </Button>
                      </div>
                    </div>

                    <div className='bg-gradient-to-br from-blue-50 to-indigo-50 p-3 rounded-lg border'>
                      <h3 className='font-semibold text-gray-800 mb-2 text-sm'>
                        Today's Summary
                      </h3>
                      <div className='space-y-1 text-xs'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>
                            Today's Entries:
                          </span>
                          <span className='font-medium'>
                            {todaysEntries.length}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Learning Items:</span>
                          <span className='font-medium'>
                            {learningItems.length}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600'>Completed:</span>
                          <span className='font-medium'>
                            {
                              learningItems.filter(
                                (item) => item.status === "completed"
                              ).length
                            }
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='bg-gradient-to-br from-orange-50 to-red-50 p-3 rounded-lg border'>
                      <h3 className='font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1'>
                        🔥 Journaling Streak
                      </h3>
                      <div className='text-center'>
                        <div className='text-2xl font-bold text-orange-600 mb-1'>
                          {calculateStreak()}
                        </div>
                        <div className='text-xs text-gray-600'>
                          {calculateStreak() === 1 ? "day" : "days"} in a row
                        </div>
                      </div>
                      <div className='mt-2 text-xs text-gray-600 text-center'>
                        Keep the momentum going! 💪
                      </div>
                    </div>

                    <div className='bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border'>
                      <h3 className='font-semibold text-gray-800 mb-2 text-sm flex items-center gap-1'>
                        💭 Daily Prompt
                      </h3>
                      <div className='text-xs text-gray-700 mb-2'>
                        {getDailyPrompt()}
                      </div>
                      <Button
                        size='sm'
                        variant='outline'
                        className='w-full text-xs h-7'
                        onClick={() => setActiveTab("daily")}
                      >
                        Write Now
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <BookOpen className='h-5 w-5' />
                  Entries for {selectedDate.toLocaleDateString()}
                </CardTitle>
                <CardDescription>
                  {todaysEntries.length}{" "}
                  {todaysEntries.length === 1 ? "entry" : "entries"} found for
                  this date
                </CardDescription>
              </CardHeader>
              <CardContent>
                {todaysEntries.length === 0 ? (
                  <div className='text-center py-12'>
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto'>
                      <BookOpen className='h-16 w-16 text-blue-300 mx-auto mb-4' />
                      <h3 className='text-lg font-medium text-gray-900 mb-2'>
                        No entries for {selectedDate.toLocaleDateString()}
                      </h3>
                      <p className='text-gray-600 mb-4'>
                        Start your journaling journey by creating your first
                        entry for this date.
                      </p>
                      <Button
                        onClick={() => setActiveTab("daily")}
                        className='bg-blue-600 hover:bg-blue-700 text-white'
                      >
                        <Plus className='h-4 w-4 mr-2' />
                        Create Entry for This Date
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {todaysEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className='border rounded-lg p-6 space-y-4 hover:shadow-lg transition-all duration-200 bg-white'
                      >
                        <div className='flex items-center justify-between'>
                          <h4 className='text-lg font-semibold text-gray-900'>
                            {entry.title}
                          </h4>
                          <Badge
                            variant='outline'
                            className={`capitalize px-3 py-1 ${
                              entry.type === "gratitude"
                                ? "border-red-200 text-red-700 bg-red-50"
                                : entry.type === "goals"
                                ? "border-blue-200 text-blue-700 bg-blue-50"
                                : entry.type === "insights"
                                ? "border-green-200 text-green-700 bg-green-50"
                                : entry.type === "learning"
                                ? "border-purple-200 text-purple-700 bg-purple-50"
                                : "border-gray-200 text-gray-700 bg-gray-50"
                            }`}
                          >
                            {entry.type}
                          </Badge>
                        </div>
                        <p className='text-gray-700 leading-relaxed'>
                          {entry.content}
                        </p>
                        <div className='flex items-center justify-between text-sm text-gray-500 pt-2 border-t'>
                          <span>
                            {entry.date.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                          <span className='text-xs'>
                            {entry.date.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
