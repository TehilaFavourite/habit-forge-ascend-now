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

// Audio generator class for creating sounds programmatically
class AudioGenerator {
  private audioContext: AudioContext | null = null;
  private currentNodes: AudioNode[] = [];
  private masterGain: GainNode | null = null;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  setVolume(volume: number) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(volume / 100, this.audioContext!.currentTime);
    }
  }

  stop() {
    this.currentNodes.forEach(node => {
      try {
        if ('stop' in node) {
          (node as any).stop();
        }
      } catch (e) {
        // Already stopped
      }
    });
    this.currentNodes = [];
  }

  generateRain() {
    if (!this.audioContext || !this.masterGain) return;
    
    // Create filtered white noise for rain sound
    const bufferSize = 4096;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.audioContext.currentTime);
    filter.Q.setValueAtTime(0.5, this.audioContext.currentTime);
    
    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();
    
    this.currentNodes.push(noise);
  }

  generateOcean() {
    if (!this.audioContext || !this.masterGain) return;
    
    // Low frequency oscillation for waves
    const osc1 = this.audioContext.createOscillator();
    const osc2 = this.audioContext.createOscillator();
    const gain1 = this.audioContext.createGain();
    const gain2 = this.audioContext.createGain();
    
    osc1.frequency.setValueAtTime(0.1, this.audioContext.currentTime);
    osc2.frequency.setValueAtTime(0.07, this.audioContext.currentTime);
    osc1.type = 'sine';
    osc2.type = 'sine';
    
    gain1.gain.setValueAtTime(0.3, this.audioContext.currentTime);
    gain2.gain.setValueAtTime(0.2, this.audioContext.currentTime);
    
    // Add white noise filtered low
    const bufferSize = 4096;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, this.audioContext.currentTime);
    
    osc1.connect(gain1);
    osc2.connect(gain2);
    noise.connect(filter);
    
    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);
    filter.connect(this.masterGain);
    
    osc1.start();
    osc2.start();
    noise.start();
    
    this.currentNodes.push(osc1, osc2, noise);
  }

  generateFire() {
    if (!this.audioContext || !this.masterGain) return;
    
    // Random crackling sounds
    const bufferSize = 8192;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      // Create crackling pattern
      const randomValue = Math.random();
      if (randomValue > 0.99) {
        data[i] = (Math.random() * 2 - 1) * 0.8;
      } else if (randomValue > 0.95) {
        data[i] = (Math.random() * 2 - 1) * 0.3;
      } else {
        data[i] = (Math.random() * 2 - 1) * 0.05;
      }
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(100, this.audioContext.currentTime);
    
    noise.connect(filter);
    filter.connect(this.masterGain);
    noise.start();
    
    this.currentNodes.push(noise);
  }

  generateWhiteNoise() {
    if (!this.audioContext || !this.masterGain) return;
    
    const bufferSize = 4096;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    noise.connect(this.masterGain);
    noise.start();
    
    this.currentNodes.push(noise);
  }

  generatePinkNoise() {
    if (!this.audioContext || !this.masterGain) return;
    
    const bufferSize = 4096;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    noise.connect(this.masterGain);
    noise.start();
    
    this.currentNodes.push(noise);
  }

  generateBrownNoise() {
    if (!this.audioContext || !this.masterGain) return;
    
    const bufferSize = 4096;
    const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    }
    
    const noise = this.audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;
    
    noise.connect(this.masterGain);
    noise.start();
    
    this.currentNodes.push(noise);
  }

  generateBirds() {
    if (!this.audioContext || !this.masterGain) return;
    
    const chirpInterval = () => {
      if (!this.audioContext || !this.masterGain) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.frequency.setValueAtTime(800 + Math.random() * 1200, this.audioContext.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 0.3);
      
      setTimeout(chirpInterval, 1000 + Math.random() * 3000);
    };
    
    chirpInterval();
  }

  generateMeditationBells() {
    if (!this.audioContext || !this.masterGain) return;
    
    const bellInterval = () => {
      if (!this.audioContext || !this.masterGain) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      osc.frequency.setValueAtTime(440, this.audioContext.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 3);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 3);
      
      setTimeout(bellInterval, 5000 + Math.random() * 10000);
    };
    
    bellInterval();
  }

  generateClassical() {
    if (!this.audioContext || !this.masterGain) return;
    
    const frequencies = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88]; // C major scale
    
    const playNote = () => {
      if (!this.audioContext || !this.masterGain) return;
      
      const osc = this.audioContext.createOscillator();
      const gain = this.audioContext.createGain();
      
      const freq = frequencies[Math.floor(Math.random() * frequencies.length)];
      osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(0, this.audioContext.currentTime);
      gain.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 2);
      
      osc.connect(gain);
      gain.connect(this.masterGain);
      
      osc.start();
      osc.stop(this.audioContext.currentTime + 2);
      
      setTimeout(playNote, 1000 + Math.random() * 2000);
    };
    
    playNote();
  }
}

const FOCUS_SOUNDS = [
  { name: "None", value: "none", icon: "🔇" },
  {
    name: "Rain",
    value: "rain", 
    icon: "🌧️",
    category: "nature"
  },
  {
    name: "Forest",
    value: "forest", 
    icon: "🌲",
    category: "nature"
  },
  {
    name: "Ocean Waves",
    value: "ocean",
    icon: "🌊",
    category: "nature"
  },
  {
    name: "Thunder Storm",
    value: "thunder",
    icon: "⛈️",
    category: "nature"
  },
  {
    name: "Crackling Fire",
    value: "fire",
    icon: "🔥",
    category: "nature"
  },
  {
    name: "Coffee Shop",
    value: "coffee",
    icon: "☕",
    category: "ambient"
  },
  {
    name: "Library",
    value: "library",
    icon: "📚",
    category: "ambient"
  },
  {
    name: "City Traffic",
    value: "city",
    icon: "🏙️", 
    category: "ambient"
  },
  {
    name: "White Noise",
    value: "whitenoise",
    icon: "📻",
    category: "noise"
  },
  {
    name: "Pink Noise",
    value: "pinknoise",
    icon: "🎧",
    category: "noise"
  },
  {
    name: "Brown Noise", 
    value: "brownnoise",
    icon: "🔊",
    category: "noise"
  },
  {
    name: "Classical Piano",
    value: "classical",
    icon: "🎹",
    category: "music"
  },
  {
    name: "Jazz Lounge",
    value: "jazz",
    icon: "🎷",
    category: "music"
  },
  {
    name: "Lo-Fi Hip Hop",
    value: "lofi",
    icon: "🎵",
    category: "music"
  },
  {
    name: "Meditation Bells",
    value: "bells",
    icon: "🔔",
    category: "meditation"
  },
  {
    name: "Tibetan Bowls",
    value: "bowls",
    icon: "🥣",
    category: "meditation"
  },
  {
    name: "Birds Chirping",
    value: "birds",
    icon: "🐦",
    category: "nature"
  },
  {
    name: "Wind Chimes",
    value: "chimes",
    icon: "🎐",
    category: "meditation"
  }
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

  const audioGeneratorRef = useRef<AudioGenerator | null>(null);
  const tracker = useAchievementTracker();

  // Initialize audio generator
  useEffect(() => {
    audioGeneratorRef.current = new AudioGenerator();
    return () => {
      if (audioGeneratorRef.current) {
        audioGeneratorRef.current.stop();
      }
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSoundSelect = (soundValue: string) => {
    if (!audioGeneratorRef.current) return;

    if (selectedSound === soundValue) {
      // Toggle current sound
      if (soundPlaying) {
        audioGeneratorRef.current.stop();
        setSoundPlaying(false);
      } else {
        playSelectedSound(soundValue);
      }
    } else {
      // Switch to new sound
      audioGeneratorRef.current.stop();
      setSelectedSound(soundValue);
      if (soundValue !== "none") {
        playSelectedSound(soundValue);
      } else {
        setSoundPlaying(false);
      }
    }
  };

  const playSelectedSound = (soundValue: string) => {
    if (!audioGeneratorRef.current) return;

    try {
      // Map sound values to generator methods
      switch (soundValue) {
        case "rain":
        case "forest":
        case "thunder":
          audioGeneratorRef.current.generateRain();
          break;
        case "ocean":
          audioGeneratorRef.current.generateOcean();
          break;
        case "fire":
          audioGeneratorRef.current.generateFire();
          break;
        case "coffee":
        case "library":
        case "city":
          audioGeneratorRef.current.generateBrownNoise();
          break;
        case "whitenoise":
          audioGeneratorRef.current.generateWhiteNoise();
          break;
        case "pinknoise":
          audioGeneratorRef.current.generatePinkNoise();
          break;
        case "brownnoise":
          audioGeneratorRef.current.generateBrownNoise();
          break;
        case "classical":
        case "jazz":
        case "lofi":
          audioGeneratorRef.current.generateClassical();
          break;
        case "bells":
        case "bowls":
        case "chimes":
          audioGeneratorRef.current.generateMeditationBells();
          break;
        case "birds":
          audioGeneratorRef.current.generateBirds();
          break;
        default:
          return;
      }
      setSoundPlaying(true);
      toast.success(`${FOCUS_SOUNDS.find(s => s.value === soundValue)?.name} sound started`);
    } catch (error) {
      console.warn("Could not generate audio:", error);
      toast.error("Unable to generate sound. Web Audio API may not be supported.");
      setSoundPlaying(false);
    }
  };

  const handleSoundVolume = (value: number[]) => {
    setSoundVolume(value[0]);
    if (audioGeneratorRef.current) {
      audioGeneratorRef.current.setVolume(value[0]);
    }
  };

  // Update volume when it changes
  useEffect(() => {
    if (audioGeneratorRef.current) {
      audioGeneratorRef.current.setVolume(soundVolume);
    }
  }, [soundVolume]);

  // Handle sound selection changes
  useEffect(() => {
    if (!audioGeneratorRef.current) return;
    
    if (selectedSound !== "none" && soundPlaying) {
      audioGeneratorRef.current.stop();
      playSelectedSound(selectedSound);
    }
  }, [selectedSound]);

  const handleTimerComplete = () => {
    if (mode === "work") {
      toast.success("🎉 Work session completed! Time for a break.");
      tracker.trackFocusSession();
    } else {
      toast.success("Break time over! Ready for another focused session?");
    }
  };

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
                    <div className="space-y-4">
                      {/* Sound Categories */}
                      {["nature", "ambient", "noise", "music", "meditation"].map((category) => {
                        const categoryData = {
                          nature: { name: "Nature", icon: "🌿" },
                          ambient: { name: "Ambient", icon: "🏢" },
                          noise: { name: "Noise", icon: "📻" },
                          music: { name: "Music", icon: "🎵" },
                          meditation: { name: "Meditation", icon: "🧘" }
                        };
                        
                        const categorySounds = FOCUS_SOUNDS.filter(sound => 
                          sound.category === category || (sound.value === "none" && category === "nature")
                        );
                        
                        if (categorySounds.length === 0) return null;
                        
                        return (
                          <div key={category}>
                            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <span>{categoryData[category]?.icon}</span>
                              {categoryData[category]?.name}
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {categorySounds.map((sound) => (
                                <Button
                                  key={sound.value}
                                  variant={selectedSound === sound.value ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleSoundSelect(sound.value)}
                                  className="h-auto py-3 flex flex-col gap-1 relative"
                                >
                                  <span className="text-base">{sound.icon}</span>
                                  <span className="text-xs leading-tight">{sound.name}</span>
                                  {selectedSound === sound.value && soundPlaying && (
                                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
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
    </div>
  );
};