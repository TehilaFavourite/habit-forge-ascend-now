
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Target, Quote, Star, Plus, Edit3, Trash2, Crown, Sparkles } from 'lucide-react';

interface VisionItem {
  id: string;
  title: string;
  description: string;
  category: 'identity' | 'quote' | 'goal' | 'habit';
  color: string;
}

const defaultVisionItems: VisionItem[] = [
  {
    id: '1',
    title: 'World-Class Rust Security Researcher',
    description: 'I am a world-class Rust security researcher who approaches every challenge with systematic thinking and relentless curiosity. My daily habits include deep technical study, rigorous code analysis, and continuous learning.',
    category: 'identity',
    color: 'from-purple-500 to-indigo-600'
  },
  {
    id: '2',
    title: 'Character Over Goals',
    description: 'The person you become in pursuit of your goals is more valuable than the goals themselves. Your character is forged in the daily choice between comfort and growth.',
    category: 'quote',
    color: 'from-emerald-500 to-teal-600'
  },
  {
    id: '3',
    title: 'Daily Transformation',
    description: 'I am becoming the person I admire. Every day, through consistent action and disciplined practice, I am building the character, skills, and mindset that define excellence.',
    category: 'identity',
    color: 'from-rose-500 to-pink-600'
  },
  {
    id: '4',
    title: 'Security Expert Mastery',
    description: 'Master advanced cryptographic implementations, discover and responsibly disclose 10 critical vulnerabilities, and become a recognized authority in Rust security.',
    category: 'goal',
    color: 'from-orange-500 to-red-600'
  }
];

export const VisionBoard = () => {
  const [visionItems, setVisionItems] = useState<VisionItem[]>(defaultVisionItems);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    title: '',
    description: '',
    category: 'identity' as VisionItem['category'],
    color: 'from-blue-500 to-cyan-600'
  });

  const colorOptions = [
    'from-purple-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-rose-500 to-pink-600',
    'from-orange-500 to-red-600',
    'from-blue-500 to-cyan-600',
    'from-yellow-500 to-orange-500',
    'from-green-500 to-emerald-600',
    'from-indigo-500 to-purple-600'
  ];

  const categoryIcons = {
    identity: Crown,
    quote: Quote,
    goal: Target,
    habit: Star
  };

  const categoryColors = {
    identity: 'bg-purple-100 text-purple-800',
    quote: 'bg-emerald-100 text-emerald-800',
    goal: 'bg-orange-100 text-orange-800',
    habit: 'bg-blue-100 text-blue-800'
  };

  const handleAddItem = () => {
    if (newItem.title && newItem.description) {
      const item: VisionItem = {
        id: Date.now().toString(),
        ...newItem
      };
      setVisionItems([...visionItems, item]);
      setNewItem({ title: '', description: '', category: 'identity', color: 'from-blue-500 to-cyan-600' });
      setIsAdding(false);
    }
  };

  const handleEditItem = (id: string) => {
    const item = visionItems.find(item => item.id === id);
    if (item) {
      setNewItem({
        title: item.title,
        description: item.description,
        category: item.category,
        color: item.color
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleUpdateItem = () => {
    if (editingId && newItem.title && newItem.description) {
      setVisionItems(items =>
        items.map(item =>
          item.id === editingId
            ? { ...item, ...newItem }
            : item
        )
      );
      setNewItem({ title: '', description: '', category: 'identity', color: 'from-blue-500 to-cyan-600' });
      setIsAdding(false);
      setEditingId(null);
    }
  };

  const handleDeleteItem = (id: string) => {
    setVisionItems(items => items.filter(item => item.id !== id));
  };

  const VisionCard = ({ item }: { item: VisionItem }) => {
    const Icon = categoryIcons[item.category];
    
    return (
      <Card className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 bg-gradient-to-br ${item.color} text-white`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12" />
        
        <CardHeader className="relative">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-6 w-6" />
              <Badge className={`${categoryColors[item.category]} border-0`}>
                {item.category}
              </Badge>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditItem(item.id)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(item.id)}
                className="text-white hover:bg-white/20 h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
        </CardHeader>
        <CardContent className="relative">
          <p className="text-white/90 leading-relaxed">{item.description}</p>
        </CardContent>
      </Card>
    );
  };

  const filterByCategory = (category: VisionItem['category']) => 
    visionItems.filter(item => item.category === category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="h-8 w-8 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
            Vision Board
          </h1>
          <Sparkles className="h-8 w-8 text-pink-600" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Visualize your identity, goals, and inspirations. Create a powerful reminder of who you're becoming and what drives you forward.
        </p>
      </div>

      {/* Add New Item */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-dashed border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editingId ? 'Edit Vision Item' : 'Add New Vision Item'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isAdding ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Title</label>
                  <Input
                    value={newItem.title}
                    onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                    placeholder="Enter a powerful title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as VisionItem['category'] })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="identity">Identity</option>
                    <option value="quote">Quote</option>
                    <option value="goal">Goal</option>
                    <option value="habit">Habit</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  placeholder="Describe your vision in detail..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color Theme</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewItem({ ...newItem, color })}
                      className={`w-8 h-8 rounded-full bg-gradient-to-br ${color} border-2 ${
                        newItem.color === color ? 'border-gray-800' : 'border-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={editingId ? handleUpdateItem : handleAddItem}>
                  {editingId ? 'Update Item' : 'Add Item'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setEditingId(null);
                    setNewItem({ title: '', description: '', category: 'identity', color: 'from-blue-500 to-cyan-600' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={() => setIsAdding(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Vision Item
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Vision Items */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
          <TabsTrigger value="all">All ({visionItems.length})</TabsTrigger>
          <TabsTrigger value="identity">Identity ({filterByCategory('identity').length})</TabsTrigger>
          <TabsTrigger value="quote">Quotes ({filterByCategory('quote').length})</TabsTrigger>
          <TabsTrigger value="goal">Goals ({filterByCategory('goal').length})</TabsTrigger>
          <TabsTrigger value="habit">Habits ({filterByCategory('habit').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visionItems.map((item) => (
              <VisionCard key={item.id} item={item} />
            ))}
          </div>
        </TabsContent>

        {(['identity', 'quote', 'goal', 'habit'] as const).map((category) => (
          <TabsContent key={category} value={category} className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterByCategory(category).map((item) => (
                <VisionCard key={item.id} item={item} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {visionItems.length === 0 && (
        <div className="text-center py-12">
          <Sparkles className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">Your Vision Awaits</h3>
          <p className="text-gray-500">Add your first vision item to start building your inspiration board.</p>
        </div>
      )}
    </div>
  );
};
