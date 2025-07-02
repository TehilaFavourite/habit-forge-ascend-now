
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, RotateCcw, Clock, Volume2, VolumeX } from 'lucide-react';
import { toast } from 'sonner';

type TimerMode = 'work' | 'shortBreak' | 'longBreak';

const AMBIENT_SOUNDS = [
  { name: 'None', value: 'none' },
  { name: 'Rain', value: 'rain' },
  { name: 'Forest', value: 'forest' },
  { name: 'Ocean', value: 'ocean' },
  { name: 'Coffee Shop', value: 'coffee' },
  { name: 'White Noise', value: 'whitenoise' },
];

export const PomodoroTimer = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [mode, setMode] = useState<TimerMode>('work');
  const [session, setSession] = useState(1);
  const [completedSessions, setCompletedSessions] = useState(0);
  
  // Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [shortBreakDuration, setShortBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsUntilLongBreak, setSessionsUntilLongBreak] = useState(4);
  const [selectedSound, setSelectedSound] = useState('none');
  const [soundVolume, setSoundVolume] = useState([50]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDurationForMode = (currentMode: TimerMode) => {
    switch (currentMode) {
      case 'work':
        return workDuration * 60;
      case 'shortBreak':
        return shortBreakDuration * 60;
      case 'longBreak':
        return longBreakDuration * 60;
    }
  };

  const startTimer = () => {
    setIsRunning(true);
    playAmbientSound();
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopAmbientSound();
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeLeft(getDurationForMode(mode));
    stopAmbientSound();
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopAmbientSound();

    if (mode === 'work') {
      setCompletedSessions(prev => prev + 1);
      const nextMode = session % sessionsUntilLongBreak === 0 ? 'longBreak' : 'shortBreak';
      setMode(nextMode);
      setTimeLeft(getDurationForMode(nextMode));
      toast.success('🎉 Work session completed! Time for a break.');
    } else {
      setMode('work');
      setSession(prev => prev + 1);
      setTimeLeft(getDurationForMode('work'));
      toast.success('Break time over! Ready for another focused session?');
    }
  };

  const playAmbientSound = () => {
    if (selectedSound !== 'none' && audioRef.current) {
      audioRef.current.volume = soundVolume[0] / 100;
      audioRef.current.play().catch(console.error);
    }
  };

  const stopAmbientSound = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopAmbientSound();
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode));
    }
  }, [mode, workDuration, shortBreakDuration, longBreakDuration, isRunning]);

  const progress = ((getDurationForMode(mode) - timeLeft) / getDurationForMode(mode)) * 100;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          Focus Timer
        </h2>
        <p className="text-gray-600 mt-1">Stay focused with the Pomodoro Technique</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Card */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Clock className="h-5 w-5" />
              {mode === 'work' ? 'Focus Session' : mode === 'shortBreak' ? 'Short Break' : 'Long Break'}
            </CardTitle>
            <CardDescription>Session {session}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Timer Display */}
            <div className="text-center">
              <div 
                className="w-48 h-48 mx-auto rounded-full border-8 flex items-center justify-center relative"
                style={{
                  borderColor: mode === 'work' ? '#8b5cf6' : '#10b981',
                  background: `conic-gradient(${mode === 'work' ? '#8b5cf6' : '#10b981'} ${progress * 3.6}deg, #e5e7eb 0deg)`
                }}
              >
                <div className="w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <span className="text-4xl font-mono font-bold text-gray-800">
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              <Button
                onClick={isRunning ? pauseTimer : startTimer}
                className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                size="lg"
              >
                {isRunning ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              
              <Button onClick={resetTimer} variant="outline" size="lg">
                <RotateCcw className="mr-2 h-5 w-5" />
                Reset
              </Button>
            </div>

            {/* Mode Selector */}
            <div className="flex justify-center gap-2">
              {(['work', 'shortBreak', 'longBreak'] as TimerMode[]).map((timerMode) => (
                <Button
                  key={timerMode}
                  variant={mode === timerMode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    if (!isRunning) {
                      setMode(timerMode);
                    }
                  }}
                  disabled={isRunning}
                  className={mode === timerMode ? 'bg-gradient-to-r from-purple-500 to-blue-500' : ''}
                >
                  {timerMode === 'work' ? 'Work' : timerMode === 'shortBreak' ? 'Short Break' : 'Long Break'}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Settings & Ambient Sounds */}
        <div className="space-y-6">
          {/* Settings Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
              <CardDescription>Customize your focus sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Work (minutes)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={workDuration}
                    onChange={(e) => setWorkDuration(parseInt(e.target.value) || 25)}
                    disabled={isRunning}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Short Break</Label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={shortBreakDuration}
                    onChange={(e) => setShortBreakDuration(parseInt(e.target.value) || 5)}
                    disabled={isRunning}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Long Break</Label>
                  <Input
                    type="number"
                    min={1}
                    max={60}
                    value={longBreakDuration}
                    onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 15)}
                    disabled={isRunning}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Sessions until long break</Label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={sessionsUntilLongBreak}
                  onChange={(e) => setSessionsUntilLongBreak(parseInt(e.target.value) || 4)}
                  disabled={isRunning}
                />
              </div>
            </CardContent>
          </Card>

          {/* Ambient Sounds Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Focus Ambience
              </CardTitle>
              <CardDescription>Choose background sounds for focus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Sound</Label>
                <Select value={selectedSound} onValueChange={setSelectedSound}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AMBIENT_SOUNDS.map((sound) => (
                      <SelectItem key={sound.value} value={sound.value}>
                        {sound.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedSound !== 'none' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Volume</Label>
                    <span className="text-sm text-gray-500">{soundVolume[0]}%</span>
                  </div>
                  <Slider
                    value={soundVolume}
                    onValueChange={setSoundVolume}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{completedSessions}</div>
                <div className="text-sm text-gray-600">Completed Sessions</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Audio Element for Ambient Sounds */}
      {selectedSound !== 'none' && (
        <audio
          ref={audioRef}
          loop
          preload="none"
        >
          <source src={`/sounds/${selectedSound}.mp3`} type="audio/mpeg" />
        </audio>
      )}
    </div>
  );
};
