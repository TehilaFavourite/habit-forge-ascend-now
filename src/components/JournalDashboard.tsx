import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen,
  Lightbulb,
  Target,
  Heart,
  TrendingUp,
  CalendarDays,
  Plus,
  X,
  Edit3,
  Search,
  Filter,
  Sparkles,
  Brain,
  Smile,
  Meh,
  Frown,
  Award,
  Clock,
  Quote,
  Save,
  RotateCcw
} from "lucide-react";
import { useJournalStore, type JournalEntry } from "@/stores/journalStore";
import { useAuthStore } from "@/stores/authStore";
import { useAchievementTracker } from "@/stores/achievementTracker";
import { toast } from "sonner";

const JOURNAL_PROMPTS = [
  "What am I grateful for today?",
  "What did I learn today?",
  "What challenged me and how did I grow?",
  "What made me smile today?",
  "What would I tell my future self?",
  "What's one thing I want to improve tomorrow?",
  "What surprised me today?",
  "How did I show kindness today?",
  "What am I looking forward to?",
  "What's something I'm proud of?"
];

const MOOD_OPTIONS = [
  { value: 5, label: "Amazing", icon: "😍", color: "text-green-500" },
  { value: 4, label: "Good", icon: "😊", color: "text-blue-500" },
  { value: 3, label: "Okay", icon: "😐", color: "text-yellow-500" },
  { value: 2, label: "Poor", icon: "😞", color: "text-orange-500" },
  { value: 1, label: "Terrible", icon: "😢", color: "text-red-500" }
];

export const JournalDashboard = () => {
  const { user } = useAuthStore();
  const tracker = useAchievementTracker();
  const {
    entries,
    addEntry,
    updateEntry,
    deleteEntry,
    getEntriesForUser,
    getEntryByDate
  } = useJournalStore();

  const [activeTab, setActiveTab] = useState("write");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingEntry, setEditingEntry] = useState<string | null>(null);

  const [newEntry, setNewEntry] = useState({
    title: "",
    content: "",
    type: "reflection" as JournalEntry["type"],
    mood: undefined as number | undefined,
    tags: [] as string[],
    newTag: ""
  });

  const userId = user?.id || "default-user";
  const userEntries = getEntriesForUser(userId);
  
  const todayEntry = getEntryByDate(userId, new Date().toISOString().split('T')[0]);
  const streak = calculateJournalStreak();
  
  function calculateJournalStreak(): number {
    const sortedEntries = userEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasEntry = sortedEntries.some(entry => entry.date === dateStr);
      
      if (hasEntry) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  const handleAddEntry = () => {
    if (!newEntry.title.trim() || !newEntry.content.trim()) {
      toast.error("Please fill in both title and content");
      return;
    }

    addEntry({
      date: new Date().toISOString().split('T')[0],
      title: newEntry.title,
      content: newEntry.content,
      type: newEntry.type,
      mood: newEntry.mood,
      tags: newEntry.tags,
      userId
    });

    // Reset form
    setNewEntry({
      title: "",
      content: "",
      type: "reflection",
      mood: undefined,
      tags: [],
      newTag: ""
    });

    // Track achievement
    if (newEntry.type === "learning") {
      tracker.trackArticleRead();
    }

    toast.success("Journal entry added! ✨");
  };

  const handleAddTag = () => {
    if (newEntry.newTag.trim() && !newEntry.tags.includes(newEntry.newTag.trim())) {
      setNewEntry(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ""
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewEntry(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const getRandomPrompt = () => {
    const randomPrompt = JOURNAL_PROMPTS[Math.floor(Math.random() * JOURNAL_PROMPTS.length)];
    setNewEntry(prev => ({ ...prev, title: randomPrompt }));
  };

  const filteredEntries = userEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || entry.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const typeColors = {
    reflection: "bg-blue-100 text-blue-700 border-blue-200",
    gratitude: "bg-green-100 text-green-700 border-green-200",
    learning: "bg-purple-100 text-purple-700 border-purple-200",
    affirmation: "bg-pink-100 text-pink-700 border-pink-200"
  };

  return (
    <div className="min-h-screen bg-gradient-journal p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Your Journal</h1>
          <p className="text-muted-foreground text-lg">
            Capture thoughts, track growth, celebrate moments
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-glow">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{userEntries.length}</p>
                  <p className="text-sm text-muted-foreground">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-journal-primary to-journal-secondary">
                  <Award className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-journal-primary">{streak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-journal-accent to-journal-glow">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-journal-accent">
                    {todayEntry ? "✓" : "○"}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Entry</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-journal-warm to-journal-sunset">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-journal-warm">
                    {userEntries.filter(e => e.mood && e.mood >= 4).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Happy Days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Journal Content */}
          <div className="xl:col-span-2">
            <Card className="bg-card/90 backdrop-blur-xl border-primary/30 shadow-calm">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <CardHeader className="pb-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="write" className="flex items-center gap-2">
                      <Edit3 className="h-4 w-4" />
                      Write
                    </TabsTrigger>
                    <TabsTrigger value="browse" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Browse
                    </TabsTrigger>
                    <TabsTrigger value="insights" className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Insights
                    </TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent className="pt-0">
                  <TabsContent value="write" className="space-y-6 mt-0">
                    <div className="space-y-4">
                      {/* Entry Type & Mood */}
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="text-sm font-medium mb-2 block">Entry Type</label>
                          <Select 
                            value={newEntry.type} 
                            onValueChange={(value: any) => setNewEntry(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reflection">🤔 Reflection</SelectItem>
                              <SelectItem value="gratitude">🙏 Gratitude</SelectItem>
                              <SelectItem value="learning">📚 Learning</SelectItem>
                              <SelectItem value="affirmation">✨ Affirmation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex-1">
                          <label className="text-sm font-medium mb-2 block">Mood</label>
                          <div className="flex gap-1">
                            {MOOD_OPTIONS.map((mood) => (
                              <Button
                                key={mood.value}
                                variant={newEntry.mood === mood.value ? "default" : "outline"}
                                size="sm"
                                onClick={() => setNewEntry(prev => ({ 
                                  ...prev, 
                                  mood: prev.mood === mood.value ? undefined : mood.value 
                                }))}
                                className="flex-1 p-2"
                                title={mood.label}
                              >
                                <span className="text-lg">{mood.icon}</span>
                              </Button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Title with Prompt Button */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Title</label>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={getRandomPrompt}
                            className="flex items-center gap-1"
                          >
                            <Sparkles className="h-4 w-4" />
                            Inspire Me
                          </Button>
                        </div>
                        <Input
                          placeholder="What's on your mind?"
                          value={newEntry.title}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>

                      {/* Content */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                          placeholder="Express your thoughts freely..."
                          value={newEntry.content}
                          onChange={(e) => setNewEntry(prev => ({ ...prev, content: e.target.value }))}
                          rows={8}
                          className="resize-none"
                        />
                      </div>

                      {/* Tags */}
                      <div className="space-y-3">
                        <label className="text-sm font-medium">Tags</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Add a tag..."
                            value={newEntry.newTag}
                            onChange={(e) => setNewEntry(prev => ({ ...prev, newTag: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                            className="flex-1"
                          />
                          <Button onClick={handleAddTag} size="sm">
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        {newEntry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {newEntry.tags.map((tag, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                {tag}
                                <X 
                                  className="h-3 w-3 cursor-pointer" 
                                  onClick={() => handleRemoveTag(tag)}
                                />
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleAddEntry} className="flex-1">
                          <Save className="h-4 w-4 mr-2" />
                          Save Entry
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setNewEntry({
                            title: "",
                            content: "",
                            type: "reflection",
                            mood: undefined,
                            tags: [],
                            newTag: ""
                          })}
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Clear
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="browse" className="space-y-6 mt-0">
                    {/* Search and Filter */}
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Search entries..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full"
                        />
                      </div>
                      <Select value={filterType} onValueChange={setFilterType}>
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Types</SelectItem>
                          <SelectItem value="reflection">Reflection</SelectItem>
                          <SelectItem value="gratitude">Gratitude</SelectItem>
                          <SelectItem value="learning">Learning</SelectItem>
                          <SelectItem value="affirmation">Affirmation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Entries List */}
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {filteredEntries.length === 0 ? (
                        <div className="text-center py-12">
                          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {searchTerm || filterType !== "all" 
                              ? "No entries match your search criteria"
                              : "No journal entries yet. Start writing your first entry!"
                            }
                          </p>
                        </div>
                      ) : (
                        filteredEntries.map((entry) => (
                          <Card key={entry.id} className="border-muted/20 hover:border-primary/30 transition-colors">
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <Badge className={typeColors[entry.type]}>
                                    {entry.type}
                                  </Badge>
                                  {entry.mood && (
                                    <span className="text-lg">
                                      {MOOD_OPTIONS.find(m => m.value === entry.mood)?.icon}
                                    </span>
                                  )}
                                </div>
                                <span className="text-sm text-muted-foreground">
                                  {new Date(entry.date).toLocaleDateString()}
                                </span>
                              </div>
                              
                              <h4 className="font-semibold mb-2">{entry.title}</h4>
                              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                {entry.content}
                              </p>
                              
                              {entry.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {entry.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="insights" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Writing Frequency */}
                      <Card className="border-muted/20">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Writing Frequency
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm">
                              <span>Current Streak</span>
                              <span className="font-semibold">{streak} days</span>
                            </div>
                            <Progress value={(streak / 30) * 100} className="h-2" />
                            <p className="text-xs text-muted-foreground">
                              Keep writing daily to maintain your streak!
                            </p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Entry Types */}
                      <Card className="border-muted/20">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Brain className="h-5 w-5" />
                            Entry Types
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {["reflection", "gratitude", "learning", "affirmation"].map((type) => {
                              const count = userEntries.filter(e => e.type === type).length;
                              const percentage = userEntries.length > 0 ? (count / userEntries.length) * 100 : 0;
                              
                              return (
                                <div key={type} className="flex justify-between items-center text-sm">
                                  <span className="capitalize">{type}</span>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-primary rounded-full h-2 transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="w-8 text-xs">{count}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Mood Tracking */}
                      <Card className="border-muted/20">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Smile className="h-5 w-5" />
                            Mood Tracking
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {MOOD_OPTIONS.reverse().map((mood) => {
                              const count = userEntries.filter(e => e.mood === mood.value).length;
                              const percentage = userEntries.length > 0 ? (count / userEntries.length) * 100 : 0;
                              
                              return (
                                <div key={mood.value} className="flex justify-between items-center text-sm">
                                  <div className="flex items-center gap-2">
                                    <span>{mood.icon}</span>
                                    <span>{mood.label}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 bg-muted rounded-full h-2">
                                      <div 
                                        className="bg-journal-accent rounded-full h-2 transition-all"
                                        style={{ width: `${percentage}%` }}
                                      />
                                    </div>
                                    <span className="w-8 text-xs">{count}</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Popular Tags */}
                      <Card className="border-muted/20">
                        <CardHeader className="pb-4">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Popular Tags
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {Array.from(
                              userEntries
                                .flatMap(entry => entry.tags)
                                .reduce((acc, tag) => {
                                  acc.set(tag, (acc.get(tag) || 0) + 1);
                                  return acc;
                                }, new Map())
                            )
                              .sort(([,a], [,b]) => b - a)
                              .slice(0, 10)
                              .map(([tag, count]) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag} ({count})
                                </Badge>
                              ))
                            }
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Calendar */}
            <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5" />
                  Writing Calendar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border-0"
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

            {/* Quick Prompts */}
            <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Quote className="h-5 w-5" />
                  Daily Prompts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {JOURNAL_PROMPTS.slice(0, 4).map((prompt, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    className="w-full text-left h-auto p-3 justify-start"
                    onClick={() => {
                      setNewEntry(prev => ({ ...prev, title: prompt }));
                      setActiveTab("write");
                    }}
                  >
                    <div className="text-sm leading-relaxed">{prompt}</div>
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};