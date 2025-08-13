import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Target, LogOut, User, Star, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom"; // <-- import useNavigate

export const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate(); // <-- useNavigate hook

  const getXPForNextLevel = (level: number) => level * 1000;
  const currentLevelXP = (user?.level || 1 - 1) * 1000;
  const nextLevelXP = getXPForNextLevel(user?.level || 1);
  const progressPercentage =
    ((user?.xp || 0) / (nextLevelXP - currentLevelXP)) * 100;

  // Updated sign out handler
  const handleSignOut = () => {
    logout();
    navigate("/"); // Redirect to home/login
  };

  return (
    <header className='bg-white/80 backdrop-blur-md border-b border-white/20 shadow-lg'>
      <div className='container mx-auto px-4 py-4'>
        <div className='flex items-center justify-between'>
          {/* Logo */}
          <div className='flex items-center gap-3'>
            <div className='p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg'>
              <Target className='h-6 w-6 text-white' />
            </div>
            <div>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
                Habit Forge
              </h1>
              <p className='text-sm text-gray-500'>Level up your life</p>
            </div>
          </div>

          {/* User Progress & Profile */}
          <div className='flex items-center gap-4'>
            {/* XP Progress */}
            <div className='hidden sm:flex items-center gap-3 bg-gradient-to-r from-purple-50 to-blue-50 px-4 py-2 rounded-full'>
              <div className='flex items-center gap-2'>
                <Star className='h-4 w-4 text-purple-500' />
                <span className='font-semibold text-purple-700'>
                  Level {user?.level || 1}
                </span>
              </div>
              <div className='w-24 h-2 bg-gray-200 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500'
                  style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                />
              </div>
              <div className='flex items-center gap-1'>
                <Zap className='h-3 w-3 text-yellow-500' />
                <span className='text-sm font-medium text-gray-700'>
                  {user?.xp || 0} XP
                </span>
              </div>
            </div>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='relative h-10 w-10 rounded-full'
                >
                  <Avatar>
                    <AvatarFallback className='bg-gradient-to-r from-purple-500 to-blue-500 text-white'>
                      {user?.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <div className='px-3 py-2 border-b'>
                  <p className='font-medium'>{user?.username}</p>
                  <p className='text-sm text-gray-500'>{user?.email}</p>
                </div>
                <DropdownMenuItem className='cursor-pointer'>
                  <User className='mr-2 h-4 w-4' />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className='cursor-pointer text-red-600 focus:text-red-600'
                  onClick={handleSignOut} // <-- use handler here
                >
                  <LogOut className='mr-2 h-4 w-4' />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};
