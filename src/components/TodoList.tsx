
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTodoStore } from '@/stores/todoStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Plus, Sun, Moon, CheckSquare, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export const TodoList = () => {
  const { user } = useAuthStore();
  const { getTodosForUser, addTodo, toggleTodo, deleteTodo } = useTodoStore();
  const [newTask, setNewTask] = useState('');
  const [activeCategory, setActiveCategory] = useState<'morning' | 'evening' | 'general'>('general');

  const todos = getTodosForUser(user?.id || '');
  const morningTodos = todos.filter(todo => todo.category === 'morning');
  const eveningTodos = todos.filter(todo => todo.category === 'evening');
  const generalTodos = todos.filter(todo => todo.category === 'general');

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    addTodo({
      title: newTask,
      category: activeCategory,
      userId: user?.id || '',
    });

    setNewTask('');
    toast.success('Task added to your list!');
  };

  const handleToggleTodo = (id: string, completed: boolean) => {
    toggleTodo(id);
    if (!completed) {
      toast.success('Task completed! Great job! 🎉');
    }
  };

  const TodoSection = ({ 
    title, 
    icon: Icon, 
    todos: sectionTodos, 
    category 
  }: { 
    title: string; 
    icon: any; 
    todos: any[]; 
    category: 'morning' | 'evening' | 'general' 
  }) => {
    const completedCount = sectionTodos.filter(todo => todo.completed).length;
    const totalCount = sectionTodos.length;

    return (
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5" />
              {title}
            </div>
            <Badge variant="secondary">
              {completedCount}/{totalCount}
            </Badge>
          </CardTitle>
          {totalCount > 0 && (
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {sectionTodos.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No tasks yet. Add some to get started!
            </p>
          ) : (
            sectionTodos.map(todo => (
              <div 
                key={todo.id} 
                className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                  todo.completed ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => handleToggleTodo(todo.id, todo.completed)}
                />
                <span 
                  className={`flex-1 ${
                    todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
                  }`}
                >
                  {todo.title}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
          
          {/* Quick Add for this category */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newTask.trim()) return;
              addTodo({
                title: newTask,
                category,
                userId: user?.id || '',
              });
              setNewTask('');
              toast.success(`Task added to ${title.toLowerCase()}!`);
            }}
            className="flex gap-2 mt-4"
          >
            <Input
              placeholder={`Add ${title.toLowerCase()} task...`}
              value={activeCategory === category ? newTask : ''}
              onChange={(e) => {
                setNewTask(e.target.value);
                setActiveCategory(category);
              }}
              className="flex-1"
            />
            <Button type="submit" size="sm">
              <Plus className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Daily Tasks
        </h2>
        <p className="text-gray-600 mt-1">Organize your day with structured routines</p>
      </div>

      {/* Quick Add Task */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Add New Task</CardTitle>
          <CardDescription>Quickly add tasks to your daily routine</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddTodo} className="flex gap-3">
            <div className="flex gap-2">
              {[
                { value: 'morning', label: 'Morning', icon: Sun },
                { value: 'general', label: 'General', icon: CheckSquare },
                { value: 'evening', label: 'Evening', icon: Moon },
              ].map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  type="button"
                  variant={activeCategory === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCategory(value as any)}
                  className={`${
                    activeCategory === value 
                      ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                      : ''
                  }`}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {label}
                </Button>
              ))}
            </div>
            <Input
              placeholder="What do you want to accomplish?"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1"
            />
            <Button 
              type="submit"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Task Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TodoSection
          title="Morning Routine"
          icon={Sun}
          todos={morningTodos}
          category="morning"
        />
        
        <TodoSection
          title="Daily Tasks"
          icon={CheckSquare}
          todos={generalTodos}
          category="general"
        />
        
        <TodoSection
          title="Evening Routine"
          icon={Moon}
          todos={eveningTodos}
          category="evening"
        />
      </div>
    </div>
  );
};
