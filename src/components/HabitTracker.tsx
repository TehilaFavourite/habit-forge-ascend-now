import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useHabitStore, Habit } from "@/stores/habitStore";
import { HabitCard } from "@/components/HabitCard";
import { HabitForm } from "@/components/HabitForm";
import { EditHabitForm } from "@/components/EditHabitForm";
import { StreakCalendar } from "@/components/StreakCalendar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Target, Calendar, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const HabitTracker = () => {
  const { user } = useAuthStore();
  const { getUserHabits, completeHabit } = useHabitStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const habits = getUserHabits(user?.id || "");
  const coreHabits = habits.filter((habit) => habit.isCore);
  const today = new Date().toISOString().split("T")[0];

  const todayCompletions = coreHabits.filter(
    (habit) => habit.completions[today]
  );
  const dayMasteryComplete =
    coreHabits.length > 0 && todayCompletions.length === coreHabits.length;
  const dayMasteryReady =
    coreHabits.length > 0 && todayCompletions.length === coreHabits.length;
  const [dayMasterySubmitted, setDayMasterySubmitted] = useState(false);

  const handleCompleteAllCore = () => {
    coreHabits.forEach((habit) => {
      if (!habit.completions[today]) {
        completeHabit(habit.id, today);
      }
    });
    toast.success("🎉 Day mastery achieved! All core habits completed!");
  };

  const handleSubmitDayMastery = () => {
    setDayMasterySubmitted(true);
    toast.success("🎉 Congratulations! You have mastered your day!");
    // Optionally, trigger additional logic here (e.g., log achievement, reward, etc.)
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
  };

  return (
    <div className='space-y-6'>
      {/* Header Actions */}
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start'>
        <div>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            Your Habits
          </h2>
          <p className='text-gray-600 mt-1'>
            Build consistency, one day at a time
          </p>
        </div>

        <div className='flex gap-2'>
          {coreHabits.length > 0 && (
            <Button
              onClick={handleSubmitDayMastery}
              disabled={!dayMasteryReady || dayMasterySubmitted}
              className={`${
                dayMasteryReady && !dayMasterySubmitted
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  : "bg-gray-300 cursor-not-allowed"
              } transition-all transform hover:scale-105`}
            >
              {dayMasterySubmitted ? (
                <>
                  <CheckCircle2 className='mr-2 h-4 w-4' />
                  Day Mastered!
                </>
              ) : (
                <>
                  <Target className='mr-2 h-4 w-4' />
                  Complete Day Mastery
                </>
              )}
            </Button>
          )}

          <Button
            onClick={() => setShowForm(true)}
            className='bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all transform hover:scale-105'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Habit
          </Button>
        </div>
      </div>

      {/* Day Mastery Summary */}
      {coreHabits.length > 0 && (
        <Card className='bg-gradient-to-r from-purple-50 to-blue-50 border-0 shadow-lg'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Target className='h-5 w-5 text-purple-600' />
              Day Mastery Progress
            </CardTitle>
            <CardDescription>
              Complete all core habits to achieve day mastery
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-4'>
              <div className='flex-1'>
                <div className='flex justify-between text-sm mb-2'>
                  <span>Progress</span>
                  <span>
                    {todayCompletions.length}/{coreHabits.length}
                  </span>
                </div>
                <div className='w-full h-3 bg-gray-200 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500'
                    style={{
                      width: `${
                        (todayCompletions.length / coreHabits.length) * 100
                      }%`,
                    }}
                  />
                </div>
              </div>
              {dayMasteryComplete && (
                <div className='text-green-600 font-semibold text-sm'>
                  ✨ Mastered!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habits Grid */}
      {habits.length > 0 ? (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onViewCalendar={() => setSelectedHabit(habit.id)}
              onEdit={handleEditHabit}
            />
          ))}
        </div>
      ) : (
        <Card className='text-center py-12 bg-white/70 backdrop-blur-sm border-0 shadow-lg'>
          <CardContent>
            <Calendar className='h-16 w-16 text-gray-400 mx-auto mb-4' />
            <h3 className='text-xl font-semibold text-gray-600 mb-2'>
              No habits yet
            </h3>
            <p className='text-gray-500 mb-6'>
              Start building your daily routine by creating your first habit
            </p>
            <Button
              onClick={() => setShowForm(true)}
              className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
            >
              <Plus className='mr-2 h-4 w-4' />
              Create Your First Habit
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Habit Form Modal */}
      {showForm && <HabitForm onClose={() => setShowForm(false)} />}

      {/* Streak Calendar Modal */}
      {selectedHabit && (
        <StreakCalendar
          habitId={selectedHabit}
          onClose={() => setSelectedHabit(null)}
        />
      )}

      {/* Edit Habit Modal */}
      {editingHabit && (
        <EditHabitForm
          habit={editingHabit}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  );
};
