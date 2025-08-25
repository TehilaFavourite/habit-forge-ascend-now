import { useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, RotateCcw, Clock, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { useAchievementTracker } from "@/stores/achievementTracker";
import { usePomodoroStore, type TimerMode } from "@/stores/pomodoroStore";

const FOCUS_SOUNDS = [
  { name: "None", value: "none", icon: "🔇" },
  {
    name: "Rain",
    value: "rain",
    url: "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa6c82.mp3",
    icon: "🌧️",
  },
  {
    name: "Forest",
    value: "forest",
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3",
    icon: "🌲",
  },
  {
    name: "Ocean",
    value: "ocean",
    url: "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa6c82.mp3",
    icon: "🌊",
  },
  {
    name: "Coffee Shop",
    value: "coffee",
    url: "https://cdn.pixabay.com/audio/2022/10/16/audio_131bfa6c82.mp3",
    icon: "☕",
  },
  {
    name: "White Noise",
    value: "whitenoise",
    url: "https://cdn.pixabay.com/audio/2022/07/26/audio_124bfa6c82.mp3",
    icon: "🎧",
  },
  {
    name: "Fireplace",
    value: "fireplace",
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_116b9bfae2.mp3",
    icon: "🔥",
  },
  {
    name: "Birds",
    value: "birds",
    url: "https://cdn.pixabay.com/audio/2022/03/15/audio_115b9bfae2.mp3",
    icon: "🐦",
  },
  {
    name: "Classical",
    value: "classical",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Chad_Crouch/Arps/Chad_Crouch_-_Algorithms.mp3",
    icon: "🎻",
  },
  {
    name: "Jazz",
    value: "jazz",
    url: "https://files.freemusicarchive.org/storage-freemusicarchive-org/music/no_curator/Komiku/Jazz_and_Blues/Komiku_-_05_-_Friends.mp3",
    icon: "🎷",
  },
];

export const PomodoroTimer = () => {
  const {
    isRunning,
    timeLeft,
    mode,
    session,
    completedSessions,
    workDuration,
    shortBreakDuration,
    longBreakDuration,
    sessionsUntilLongBreak,
    tickingEnabled,
    selectedSound,
    soundPlaying,
    soundVolume,
    setIsRunning,
    setTimeLeft,
    setMode,
    setWorkDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setSessionsUntilLongBreak,
    setTickingEnabled,
    setSelectedSound,
    setSoundPlaying,
    setSoundVolume,
    getDurationForMode,
    resetTimer,
    pauseTimer,
    startTimer,
    completeSession,
  } = usePomodoroStore();

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const tracker = useAchievementTracker();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const playTickSound = () => {
    if (!tickingEnabled) return;

    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.1
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    } catch (error) {
      console.log("Tick sound not available");
    }
  };

  const handleSoundSelect = (soundValue: string) => {
    if (selectedSound === soundValue) {
      // Toggle play/pause
      if (soundPlaying) {
        audioRef.current?.pause();
        setSoundPlaying(false);
      } else {
        audioRef.current?.play();
        setSoundPlaying(true);
      }
    } else {
      setSelectedSound(soundValue);
      if (soundValue !== "none") {
        setSoundPlaying(true);
        setTimeout(() => {
          audioRef.current?.play();
        }, 50);
      } else {
        setSoundPlaying(false);
      }
    }
  };

  const handleSoundVolume = (value: number[]) => {
    setSoundVolume(value[0]);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  const handleStartTimer = () => {
    startTimer();
    if (!intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return prev;
          }
          if (tickingEnabled) {
            playTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const handlePauseTimer = () => {
    pauseTimer();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleResetTimer = () => {
    resetTimer();
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const handleTimerComplete = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (mode === "work") {
      completeSession();
      toast.success("🎉 Work session completed! Time for a break.");
      tracker.trackFocusSession();
    } else {
      completeSession();
      toast.success("Break time over! Ready for another focused session?");
    }
  };

  // Start timer when running state changes
  useEffect(() => {
    if (isRunning && !intervalRef.current) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return getDurationForMode(mode);
          }
          if (tickingEnabled) {
            playTickSound();
          }
          return prev - 1;
        });
      }, 1000);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, tickingEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume / 100;
    }
  }, [soundVolume]);

  const progress =
    ((getDurationForMode(mode) - timeLeft) / getDurationForMode(mode)) * 100;

  const currentSound = FOCUS_SOUNDS.find((s) => s.value === selectedSound);

  return (
    <div className='space-y-6'>
      <div className='text-center'>
        <h2 className='text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent'>
          Focus Timer
        </h2>
        <p className='text-gray-600 mt-1'>
          Stay focused with the Pomodoro Technique
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Timer Card */}
        <Card className='bg-gradient-to-br from-purple-50 to-blue-50 border-0 shadow-lg'>
          <CardHeader className='text-center'>
            <CardTitle className='flex items-center justify-center gap-2'>
              <Clock className='h-5 w-5' />
              {mode === "work"
                ? "Focus Session"
                : mode === "shortBreak"
                ? "Short Break"
                : "Long Break"}
            </CardTitle>
            <CardDescription>Session {session}</CardDescription>
          </CardHeader>
          <CardContent className='space-y-6'>
            {/* Timer Display */}
            <div className='text-center'>
              <div
                className='w-48 h-48 mx-auto rounded-full border-8 flex items-center justify-center relative'
                style={{
                  borderColor: mode === "work" ? "#8b5cf6" : "#10b981",
                  background: `conic-gradient(${
                    mode === "work" ? "#8b5cf6" : "#10b981"
                  } ${progress * 3.6}deg, #e5e7eb 0deg)`,
                }}
              >
                <div className='w-40 h-40 bg-white rounded-full flex items-center justify-center shadow-inner'>
                  <span className='text-4xl font-mono font-bold text-gray-800'>
                    {formatTime(timeLeft)}
                  </span>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className='flex justify-center gap-4'>
              <Button
                onClick={isRunning ? handlePauseTimer : handleStartTimer}
                className='bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                size='lg'
              >
                {isRunning ? (
                  <Pause className='mr-2 h-5 w-5' />
                ) : (
                  <Play className='mr-2 h-5 w-5' />
                )}
                {isRunning ? "Pause" : "Start"}
              </Button>

              <Button onClick={handleResetTimer} variant='outline' size='lg'>
                <RotateCcw className='mr-2 h-5 w-5' />
                Reset
              </Button>
            </div>

            {/* Mode Selector */}
            <div className='flex justify-center gap-2'>
              {(["work", "shortBreak", "longBreak"] as TimerMode[]).map(
                (timerMode) => (
                  <Button
                    key={timerMode}
                    variant={mode === timerMode ? "default" : "outline"}
                    size='sm'
                    onClick={() => {
                      if (!isRunning) {
                        setMode(timerMode);
                      }
                    }}
                    disabled={isRunning}
                    className={
                      mode === timerMode
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : ""
                    }
                  >
                    {timerMode === "work"
                      ? "Work"
                      : timerMode === "shortBreak"
                      ? "Short Break"
                      : "Long Break"}
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Settings & Focus Sound */}
        <div className='space-y-6'>
          {/* Settings Card */}
          <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
            <CardHeader>
              <CardTitle>Timer Settings</CardTitle>
              <CardDescription>Customize your focus sessions</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label>Work (minutes)</Label>
                  <Input
                    type='number'
                    min={1}
                    max={60}
                    value={workDuration}
                    onChange={(e) =>
                      setWorkDuration(parseInt(e.target.value) || 25)
                    }
                    disabled={isRunning}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Short Break</Label>
                  <Input
                    type='number'
                    min={1}
                    max={30}
                    value={shortBreakDuration}
                    onChange={(e) =>
                      setShortBreakDuration(parseInt(e.target.value) || 5)
                    }
                    disabled={isRunning}
                  />
                </div>

                <div className='space-y-2'>
                  <Label>Long Break</Label>
                  <Input
                    type='number'
                    min={1}
                    max={60}
                    value={longBreakDuration}
                    onChange={(e) =>
                      setLongBreakDuration(parseInt(e.target.value) || 15)
                    }
                    disabled={isRunning}
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label>Sessions until long break</Label>
                <Input
                  type='number'
                  min={2}
                  max={10}
                  value={sessionsUntilLongBreak}
                  onChange={(e) =>
                    setSessionsUntilLongBreak(parseInt(e.target.value) || 4)
                  }
                  disabled={isRunning}
                />
              </div>

              <div className='flex items-center space-x-2'>
                <input
                  type='checkbox'
                  id='ticking'
                  checked={tickingEnabled}
                  onChange={(e) => setTickingEnabled(e.target.checked)}
                  className='rounded'
                />
                <Label htmlFor='ticking'>Enable ticking sound</Label>
              </div>
            </CardContent>
          </Card>

          {/* Focus Sound Card */}
          <Card className='bg-white/80 backdrop-blur-sm border-0 shadow-lg'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Volume2 className='h-5 w-5' />
                Focus Sound
              </CardTitle>
              <CardDescription>
                Choose ambient sound to enhance your focus
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-2'>
                {FOCUS_SOUNDS.map((sound) => (
                  <Button
                    key={sound.value}
                    variant={
                      selectedSound === sound.value ? "default" : "outline"
                    }
                    size='sm'
                    onClick={() => handleSoundSelect(sound.value)}
                    className={
                      selectedSound === sound.value
                        ? "bg-gradient-to-r from-purple-500 to-blue-500"
                        : ""
                    }
                  >
                    <span className='mr-2'>{sound.icon}</span>
                    {sound.name}
                    {selectedSound === sound.value && soundPlaying && (
                      <Play className='h-3 w-3 ml-2 animate-pulse' />
                    )}
                  </Button>
                ))}
              </div>

              {selectedSound !== "none" && (
                <div className='space-y-2'>
                  <div className='flex items-center justify-between'>
                    <Label>Volume</Label>
                    <span className='text-sm text-gray-500'>
                      {soundVolume}%
                    </span>
                  </div>
                  <Slider
                    value={[soundVolume]}
                    onValueChange={handleSoundVolume}
                    max={100}
                    step={1}
                    className='w-full'
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className='bg-gradient-to-r from-green-50 to-emerald-50 border-0 shadow-lg'>
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='text-center'>
                <div className='text-3xl font-bold text-green-600'>
                  {completedSessions}
                </div>
                <div className='text-sm text-gray-600'>Completed Sessions</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden Audio Element */}
      {selectedSound !== "none" && (
        <audio
          ref={audioRef}
          src={currentSound?.url}
          loop
          onPlay={() => setSoundPlaying(true)}
          onPause={() => setSoundPlaying(false)}
          style={{ display: "none" }}
        />
      )}
    </div>
  );
};