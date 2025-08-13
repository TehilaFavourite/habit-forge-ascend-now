import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "sonner";
import { Loader2, Target, Zap } from "lucide-react";

export const AuthForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuthStore();

  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Forgot password states
  const [showReset, setShowReset] = useState(false);
  const [resetUsername, setResetUsername] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(loginData.username, loginData.password);
      if (success) {
        toast.success("Welcome back! Ready to build some habits?");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (registerData.password !== registerData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const result = await register(
        registerData.username,
        registerData.email,
        registerData.password
      );
      if (result.success) {
        toast.success("Account created! Welcome to your habit journey!");
        navigate("/onboarding"); // <-- redirect to onboarding for new users
      } else if (result.error === "username") {
        toast.error("Username already exists. Please choose another.");
      } else if (result.error === "email") {
        toast.error("Email already exists. Please use another.");
      } else {
        toast.error("Registration failed. Please try again.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot password handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);

    try {
      const users = JSON.parse(localStorage.getItem("habit_app_users") || "[]");
      const userIndex = users.findIndex(
        (u: any) => u.username === resetUsername && u.email === resetEmail
      );
      if (userIndex === -1) {
        toast.error("No account found with that username and email.");
        setResetLoading(false);
        return;
      }
      users[userIndex].password = newPassword;
      localStorage.setItem("habit_app_users", JSON.stringify(users));
      toast.success("Password reset! You can now sign in.");
      setShowReset(false);
      setResetUsername("");
      setResetEmail("");
      setNewPassword("");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className='w-full max-w-md mx-auto'>
      <div className='text-center mb-8'>
        <div className='flex items-center justify-center gap-2 mb-4'>
          <div className='p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg'>
            <Target className='h-6 w-6 text-white' />
          </div>
          <h1 className='text-3xl font-bold text-white'>Habit Forge</h1>
        </div>
        <p className='text-blue-200'>
          Transform your daily routine into extraordinary results
        </p>
      </div>

      <Card className='backdrop-blur-sm bg-white/90 border-0 shadow-2xl'>
        <CardHeader className='text-center pb-4'>
          <CardTitle className='text-2xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
            Join Your Growth Journey
          </CardTitle>
          <CardDescription>
            Build lasting habits and track your progress with style
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='login' className='w-full'>
            <TabsList className='grid w-full grid-cols-2 mb-6'>
              <TabsTrigger
                value='login'
                className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500'
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value='register'
                className='data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500'
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value='login'>
              <form onSubmit={handleLogin} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='login-username'>Username</Label>
                  <Input
                    id='login-username'
                    type='text'
                    placeholder='Enter your username'
                    value={loginData.username}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                    className='transition-all focus:ring-purple-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='login-password'>Password</Label>
                  <Input
                    id='login-password'
                    type='password'
                    placeholder='Enter your password'
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    className='transition-all focus:ring-purple-500'
                  />
                  {/* Forgot Password link */}
                  <div className='text-right mt-1'>
                    <button
                      type='button'
                      className='text-sm text-blue-600 hover:underline'
                      onClick={() => setShowReset(true)}
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
                <Button
                  type='submit'
                  className='w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Signing In...
                    </>
                  ) : (
                    <>
                      <Zap className='mr-2 h-4 w-4' />
                      Sign In
                    </>
                  )}
                </Button>
              </form>
              {/* Reset Password Form */}
              {showReset && (
                <div className='my-4 p-4 bg-white rounded shadow'>
                  <h2 className='text-lg font-bold mb-2'>Reset Password</h2>
                  <form onSubmit={handleResetPassword} className='space-y-2'>
                    <Input
                      type='text'
                      placeholder='Username'
                      value={resetUsername}
                      onChange={(e) => setResetUsername(e.target.value)}
                      required
                    />
                    <Input
                      type='email'
                      placeholder='Email'
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                    />
                    <Input
                      type='password'
                      placeholder='New Password'
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <div className='flex gap-2'>
                      <Button type='submit' disabled={resetLoading}>
                        {resetLoading ? (
                          <>
                            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            Resetting...
                          </>
                        ) : (
                          <>Reset Password</>
                        )}
                      </Button>
                      <Button
                        type='button'
                        variant='outline'
                        onClick={() => setShowReset(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </TabsContent>

            <TabsContent value='register'>
              <form onSubmit={handleRegister} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='register-username'>Username</Label>
                  <Input
                    id='register-username'
                    type='text'
                    placeholder='Choose a username'
                    value={registerData.username}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    required
                    className='transition-all focus:ring-purple-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='register-email'>Email</Label>
                  <Input
                    id='register-email'
                    type='email'
                    placeholder='Enter your email'
                    value={registerData.email}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    required
                    className='transition-all focus:ring-purple-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='register-password'>Password</Label>
                  <Input
                    id='register-password'
                    type='password'
                    placeholder='Create a password'
                    value={registerData.password}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    required
                    className='transition-all focus:ring-purple-500'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='confirm-password'>Confirm Password</Label>
                  <Input
                    id='confirm-password'
                    type='password'
                    placeholder='Confirm your password'
                    value={registerData.confirmPassword}
                    onChange={(e) =>
                      setRegisterData((prev) => ({
                        ...prev,
                        confirmPassword: e.target.value,
                      }))
                    }
                    required
                    className='transition-all focus:ring-purple-500'
                  />
                </div>
                <Button
                  type='submit'
                  className='w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 transition-all transform hover:scale-105'
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Target className='mr-2 h-4 w-4' />
                      Start Your Journey
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
