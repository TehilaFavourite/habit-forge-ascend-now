
import { useState, useEffect } from 'react';
import { AuthForm } from '@/components/AuthForm';
import { Dashboard } from '@/components/Dashboard';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const { user, isAuthenticated, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Dashboard />
    </div>
  );
};

export default Index;
