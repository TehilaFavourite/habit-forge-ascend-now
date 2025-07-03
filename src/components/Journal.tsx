
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Separator } from '@/components/ui/separator';
import { 
  BookOpen, 
  Lightbulb, 
  Target, 
  RotateCcw, 
  Heart, 
  TrendingUp, 
  CalendarDays,
  Plus,
  X,
  Edit3
} from 'lucide-react';

interface JournalEntry {
  id: string;
  date: Date;
  type: 'reflection' | 'gratitude' | 'learning' | 'goals' | 'insights';
  title: string;
  content: string;
}

interface LearningItem {
  id: string;
  title: string;
  status: 'learning' | 'completed' | 'revisit';
  notes: string;
  dateAdded: Date;
  priority: 'low' | 'medium' | 'high';
}

export const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [newEntry, setNewEntry] = useState({ title: '', content: '', type: 'reflection' as const });
  const [newLearning, setNewLearning] = useState({ 
    title: '', 
    notes: '', 
    status: 'learning' as const, 
    priority: 'medium' as const 
  });

  const addJournalEntry = () => {
    if (!newEntry.title || !newEntry.content) return;
    
    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      type: newEntry.type,
      title: newEntry.title,
      content: newEntry.content
    };
    
    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', type: 'reflection' });
  };

  const addLearningItem = () => {
    if (!newLearning.title) return;
    
    const item: LearningItem = {
      id: Date.now().toString(),
      title: newLearning.title,
      status: newLearning.status,
      notes: newLearning.notes,
      dateAdded: new Date(),
      priority: newLearning.priority
    };
    
    setLearningItems([item, ...learningItems]);
    setNewLearning({ title: '', notes: '', status: 'learning', priority: 'medium' });
  };

  const updateLearningStatus = (id: string, status: LearningItem['status']) => {
    setLearningItems(items => 
      items.map(item => item.id === id ? { ...item, status } : item)
    );
  };

  const deleteLearningItem = (id: string) => {
    setLearningItems(items => items.filter(item => item.id !== id));
  };

  const getEntriesForDate = (date: Date) => {
    return entries.filter(entry => 
      entry.date.toDateString() === date.toDateString()
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'learning': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'revisit': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const todaysEntries = getEntriesForDate(selectedDate);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Personal Journal
          </h1>
          <p className="text-gray-600">Reflect, learn, and grow every day</p>
        </div>
      </div>

      <Tabs defaultValue="daily" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Daily Journal
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Learning Tracker
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Entry Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit3 className="h-5 w-5" />
                  New Journal Entry
                </CardTitle>
                <CardDescription>
                  Capture your thoughts for {selectedDate.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Entry Type</label>
                  <select 
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({...newEntry, type: e.target.value as any})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="reflection">Daily Reflection</option>
                    <option value="gratitude">Gratitude</option>
                    <option value="learning">Learning Notes</option>
                    <option value="goals">Goals & Intentions</option>
                    <option value="insights">Insights & Ideas</option>
                  </select>
                </div>
                
                <Input
                  placeholder="Entry title..."
                  value={newEntry.title}
                  onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                />
                
                <Textarea
                  placeholder="What's on your mind today?"
                  value={newEntry.content}
                  onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                  rows={6}
                />
                
                <Button onClick={addJournalEntry} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Entry
                </Button>
              </CardContent>
            </Card>

            {/* Today's Entries */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Entries</CardTitle>
                <CardDescription>
                  {todaysEntries.length} entries for {selectedDate.toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {todaysEntries.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No entries for today yet</p>
                  ) : (
                    todaysEntries.map((entry) => (
                      <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{entry.title}</h4>
                          <Badge variant="outline" className="capitalize">
                            {entry.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-3">{entry.content}</p>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="learning" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Add Learning Item */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" />
                  Track Learning
                </CardTitle>
                <CardDescription>
                  Add something you're learning or want to revisit
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="What are you learning?"
                  value={newLearning.title}
                  onChange={(e) => setNewLearning({...newLearning, title: e.target.value})}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <select 
                      value={newLearning.status}
                      onChange={(e) => setNewLearning({...newLearning, status: e.target.value as any})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="learning">Currently Learning</option>
                      <option value="completed">Completed</option>
                      <option value="revisit">Need to Revisit</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <select 
                      value={newLearning.priority}
                      onChange={(e) => setNewLearning({...newLearning, priority: e.target.value as any})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                
                <Textarea
                  placeholder="Notes, resources, or thoughts..."
                  value={newLearning.notes}
                  onChange={(e) => setNewLearning({...newLearning, notes: e.target.value})}
                  rows={3}
                />
                
                <Button onClick={addLearningItem} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Learning Item
                </Button>
              </CardContent>
            </Card>

            {/* Learning Items */}
            <Card>
              <CardHeader>
                <CardTitle>Learning Items</CardTitle>
                <CardDescription>
                  {learningItems.length} items tracked
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {learningItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No learning items yet</p>
                  ) : (
                    learningItems.map((item) => (
                      <div key={item.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{item.title}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLearningItem(item.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                        </div>
                        
                        {item.notes && (
                          <p className="text-sm text-gray-600">{item.notes}</p>
                        )}
                        
                        <div className="flex gap-1 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateLearningStatus(item.id, 'learning')}
                          >
                            Learning
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateLearningStatus(item.id, 'completed')}
                          >
                            Completed
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateLearningStatus(item.id, 'revisit')}
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

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Gratitude
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries.filter(e => e.type === 'gratitude').slice(0, 3).map(entry => (
                    <div key={entry.id} className="p-2 bg-red-50 rounded">
                      <p className="text-sm">{entry.content.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Goals & Intentions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries.filter(e => e.type === 'goals').slice(0, 3).map(entry => (
                    <div key={entry.id} className="p-2 bg-blue-50 rounded">
                      <p className="text-sm">{entry.content.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {entries.filter(e => e.type === 'insights').slice(0, 3).map(entry => (
                    <div key={entry.id} className="p-2 bg-green-50 rounded">
                      <p className="text-sm">{entry.content.substring(0, 100)}...</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Journal Calendar</CardTitle>
                <CardDescription>Select a date to view entries</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  Entries for {selectedDate.toLocaleDateString()}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getEntriesForDate(selectedDate).map((entry) => (
                    <div key={entry.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{entry.title}</h4>
                        <Badge variant="outline" className="capitalize">
                          {entry.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{entry.content}</p>
                    </div>
                  ))}
                  {getEntriesForDate(selectedDate).length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      No entries for this date
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
