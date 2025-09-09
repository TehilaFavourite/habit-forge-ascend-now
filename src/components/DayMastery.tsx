import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useHabitStore } from "@/stores/habitStore";
import { useTodoStore } from "@/stores/todoStore";
import { useXPStore } from "@/stores/xpStore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Target, Calendar, Crown } from "lucide-react";
import { toast } from "sonner";

export const DayMastery = () => {
  const { user } = useAuthStore();
  const { getUserHabits } = useHabitStore();
  const { getTodosForUser } = useTodoStore();
  const { getActivitiesForUser, getCompletionsForDate } = useXPStore();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const habits = getUserHabits(user?.id || "");
  const todos = getTodosForUser(user?.id || "");
  const xpActivities = getActivitiesForUser(user?.id || "");
  const dayCompletions = getCompletionsForDate(selectedDate, user?.id || "");

  // Day Mastery Requirements (removed morning routine)
  // Removed evening routine requirement
  const coreHabits = habits.filter((h) => h.isCore);
  const coreXPActivities = xpActivities.filter((a) => a.type === "core");

  // Check completions
  // Removed evening routine completion tracking
  const completedCoreHabits = coreHabits.filter(
    (h) => h.completions[selectedDate]
  ).length;
  const completedXPActivities = dayCompletions.filter((c) => {
    const activity = xpActivities.find((a) => a.id === c.activityId);
    return activity?.type === "core";
  }).length;

  // Requirements
  const requirements = [
    {
      id: "tasks",
      name: "Tasks",
      completed:
        todos.length > 0 &&
        todos.every((t) =>
          !t.completed
            ? false
            : t.lastCompletedDate === selectedDate ||
              !!t.completedAt?.startsWith(selectedDate)
        ),
      required: todos.length,
      current: todos.filter(
        (t) =>
          t.lastCompletedDate === selectedDate ||
          (!!t.completedAt && t.completedAt.startsWith(selectedDate))
      ).length,
    },
    {
      id: "habits",
      name: "Core Daily Habits",
      completed:
        completedCoreHabits === coreHabits.length && coreHabits.length > 0,
      required: coreHabits.length,
      current: completedCoreHabits,
    },
    {
      id: "xp",
      name: "XP Activities",
      completed: completedXPActivities >= 3,
      required: 3,
      current: completedXPActivities,
    },
  ];

  const totalRequirements = requirements.length;
  const completedRequirements = requirements.filter((r) => r.completed).length;
  const isDayMastered = completedRequirements === totalRequirements;
  const masteryPercentage = (completedRequirements / totalRequirements) * 100;

  const RequirementCard = ({ requirement }: { requirement: any }) => {
    return (
      <div className='flex items-center justify-between p-3 bg-white/50 rounded-lg border'>
        <div className='flex items-center gap-3'>
          {requirement.completed ? (
            <CheckCircle2 className='h-5 w-5 text-green-500' />
          ) : (
            <Circle className='h-5 w-5 text-gray-400' />
          )}
          <div>
            <div className='font-medium'>{requirement.name}</div>
            <div className='text-sm text-gray-500'>
              {requirement.current}/{requirement.required}
            </div>
          </div>
        </div>
        {requirement.completed && (
          <div className='text-green-600 font-semibold text-sm'>✓</div>
        )}
      </div>
    );
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-col sm:flex-row gap-4 justify-between items-start'>
        <div>
          <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            Day Mastery
          </h2>
          <p className='text-gray-600 mt-1'>
            Complete all requirements to master your day
          </p>
        </div>

        <div className='flex items-center gap-4'>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='px-3 py-2 border rounded-lg'
          />
          {isDayMastered && (
            <div className='flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg'>
              <Crown className='h-4 w-4' />
              <span className='font-semibold'>Day Mastered!</span>
            </div>
          )}
        </div>
      </div>

      {/* Overall Progress */}
      <Card
        className={`${
          isDayMastered
            ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300"
            : "bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200"
        }`}
      >
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Target className='h-5 w-5 text-purple-600' />
            Day Mastery Progress
          </CardTitle>
          <CardDescription>
            {isDayMastered
              ? "🎉 Congratulations! You have mastered this day!"
              : `Complete ${
                  totalRequirements - completedRequirements
                } more requirement${
                  totalRequirements - completedRequirements !== 1 ? "s" : ""
                } to master this day`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            <div className='flex justify-between text-sm mb-2'>
              <span>Overall Progress</span>
              <span>
                {completedRequirements}/{totalRequirements} completed
              </span>
            </div>
            <Progress value={masteryPercentage} className='h-3' />
            <div className='text-center text-sm text-gray-600'>
              {Math.round(masteryPercentage)}% Complete
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Requirements</CardTitle>
          <CardDescription>
            Complete all requirements to achieve day mastery
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          {requirements.map((requirement) => (
            <RequirementCard key={requirement.id} requirement={requirement} />
          ))}
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      {(coreHabits.length === 0 || coreXPActivities.length === 0) && (
        <Card className='border-amber-200 bg-amber-50'>
          <CardHeader>
            <CardTitle className='text-amber-800'>Setup Required</CardTitle>
            <CardDescription className='text-amber-700'>
              Complete your setup to enable day mastery tracking
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2 text-sm'>
            {coreHabits.length === 0 && (
              <div className='text-amber-700'>
                • Mark some habits as "core" habits
              </div>
            )}
            {coreXPActivities.length === 0 && (
              <div className='text-amber-700'>
                • Create some core XP activities
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
