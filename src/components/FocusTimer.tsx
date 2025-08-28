import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Volume2, 
  Target,
  TrendingUp,
  Settings
} from "lucide-react";
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
];

export const FocusTimer = () => {
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

  const audioRef = useRef<HTMLAudioElement>(null);
  const tracker = useAchievementTracker();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSoundSelect = (soundValue: string) => {
    if (selectedSound === soundValue) {
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

  const handleTimerComplete = () => {
    if (mode === "work") {
      toast.success("🎉 Work session completed! Time for a break.");
      tracker.trackFocusSession();
    } else {
      toast.success("Break time over! Ready for another focused session?");
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = soundVolume / 100;
    }
  }, [soundVolume]);

  // Listen for timer completion
  useEffect(() => {
    const checkCompletion = () => {
      if (timeLeft <= 0 && isRunning) {
        handleTimerComplete();
      }
    };
    checkCompletion();
  }, [timeLeft, isRunning, mode]);

  const progress = ((getDurationForMode(mode) - timeLeft) / getDurationForMode(mode)) * 100;
  const currentSound = FOCUS_SOUNDS.find((s) => s.value === selectedSound);

  const modeColors = {
    work: "from-primary via-primary-glow to-primary-light",
    shortBreak: "from-secondary via-muted to-accent",
    longBreak: "from-accent via-primary-glow to-primary"
  };

  const modeIcons = {
    work: <Target className="h-6 w-6" />,
    shortBreak: <Clock className="h-6 w-6" />,
    longBreak: <TrendingUp className="h-6 w-6" />
  };

  return (
    <div className="min-h-screen bg-gradient-calm p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Focus Timer</h1>
          <p className="text-muted-foreground text-lg">
            Stay focused with the Pomodoro Technique
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Timer */}
          <div className="xl:col-span-2">
            <Card className="bg-card/90 backdrop-blur-xl border-primary/30 shadow-calm">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-4">
                  {modeIcons[mode]}
                  <CardTitle className="text-2xl">
                    {mode === "work"
                      ? "Focus Session"
                      : mode === "shortBreak"
                      ? "Short Break"
                      : "Long Break"}
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="mx-auto">
                  Session {session}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Circular Timer */}
                <div className="flex justify-center">
                  <div className="relative">
                     <div 
                       className={`w-72 h-72 rounded-full bg-gradient-to-br ${modeColors[mode]} p-2 shadow-calm animate-pulse-slow`}
                     >
                      <div className="w-full h-full rounded-full bg-card flex items-center justify-center shadow-inner">
                        <div className="text-center">
                          <div className="text-6xl font-mono font-bold text-primary mb-2">
                            {formatTime(timeLeft)}
                          </div>
                          <div className="text-sm text-muted-foreground uppercase tracking-wider">
                            {mode.replace(/([A-Z])/g, ' $1').trim()}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Ring */}
                    <div className="absolute inset-0 -m-2">
                      <svg className="w-76 h-76 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-muted/20"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeDasharray={`${progress * 2.827} ${282.7 - progress * 2.827}`}
                          className="text-primary transition-all duration-1000 ease-out"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={isRunning ? pauseTimer : startTimer}
                    size="lg"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 shadow-calm"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="mr-2 h-5 w-5" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Start
                      </>
                    )}
                  </Button>

                  <Button onClick={resetTimer} variant="outline" size="lg" className="px-8">
                    <RotateCcw className="mr-2 h-5 w-5" />
                    Reset
                  </Button>
                </div>

                {/* Mode Selector */}
                <div className="flex justify-center">
                  <div className="grid grid-cols-3 gap-2 p-1 bg-muted rounded-lg">
                    {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((timerMode) => (
                      <Button
                        key={timerMode}
                        variant={mode === timerMode ? "default" : "ghost"}
                        size="sm"
                        onClick={() => !isRunning && setMode(timerMode)}
                        disabled={isRunning}
                        className={mode === timerMode ? "bg-primary text-primary-foreground" : ""}
                      >
                        {timerMode === "work"
                          ? "Work"
                          : timerMode === "shortBreak"
                          ? "Short Break"
                          : "Long Break"}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {completedSessions}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed Sessions</div>
                  <div className="mt-4 text-xs text-muted-foreground">
                    Next long break in {sessionsUntilLongBreak - (completedSessions % sessionsUntilLongBreak)} sessions
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card className="bg-card/90 backdrop-blur-xl border-primary/20 shadow-gentle">
              <Tabs defaultValue="durations" className="w-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    <CardTitle>Settings</CardTitle>
                  </div>
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="durations">Durations</TabsTrigger>
                    <TabsTrigger value="sounds">Sounds</TabsTrigger>
                  </TabsList>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <TabsContent value="durations" className="space-y-4 mt-0">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label>Work Duration (minutes)</Label>
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
                        <Label>Short Break (minutes)</Label>
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
                        <Label>Long Break (minutes)</Label>
                        <Input
                          type="number"
                          min={1}
                          max={60}
                          value={longBreakDuration}
                          onChange={(e) => setLongBreakDuration(parseInt(e.target.value) || 15)}
                          disabled={isRunning}
                        />
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

                      <div className="flex items-center justify-between">
                        <Label htmlFor="ticking" className="text-sm font-medium">
                          Ticking Sound
                        </Label>
                        <Switch
                          id="ticking"
                          checked={tickingEnabled}
                          onCheckedChange={setTickingEnabled}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="sounds" className="space-y-4 mt-0">
                    <div className="grid grid-cols-2 gap-2">
                      {FOCUS_SOUNDS.map((sound) => (
                        <Button
                          key={sound.value}
                          variant={selectedSound === sound.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSoundSelect(sound.value)}
                          className="h-auto py-3 flex flex-col gap-1"
                        >
                          <span className="text-lg">{sound.icon}</span>
                          <span className="text-xs">{sound.name}</span>
                           {selectedSound === sound.value && soundPlaying && (
                             <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                           )}
                        </Button>
                      ))}
                    </div>

                    {selectedSound !== "none" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Volume2 className="h-4 w-4" />
                          <Label className="text-sm">Volume</Label>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {soundVolume}%
                          </span>
                        </div>
                        <Slider
                          value={[soundVolume]}
                          onValueChange={handleSoundVolume}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </div>
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