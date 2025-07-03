
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
  { name: 'Rain', value: 'rain', url: 'https://www.soundjay.com/misc/sounds/rain-01.wav' },
  { name: 'Forest', value: 'forest', url: 'https://www.soundjay.com/nature/sounds/forest-01.wav' },
  { name: 'Ocean', value: 'ocean', url: 'https://www.soundjay.com/nature/sounds/ocean-01.wav' },
  { name: 'Coffee Shop', value: 'coffee', url: 'https://www.soundjay.com/misc/sounds/coffeeshop-01.wav' },
  { name: 'White Noise', value: 'whitenoise', url: 'https://www.soundjay.com/misc/sounds/whitenoise-01.wav' },
  { name: 'Fireplace', value: 'fireplace', url: 'https://www.soundjay.com/misc/sounds/fire-01.wav' },
  { name: 'Birds', value: 'birds', url: 'https://www.soundjay.com/nature/sounds/birds-01.wav' },
];

const SOUND_PRESETS = [
  {
    name: 'Deep Focus',
    sounds: ['whitenoise', 'rain'],
    description: 'White noise with gentle rain for deep concentration'
  },
  {
    name: 'Nature',
    sounds: ['forest', 'birds'],
    description: 'Forest ambiance with bird sounds'
  },
  {
    name: 'Productivity',
    sounds: ['coffee', 'whitenoise'],
    description: 'Coffee shop atmosphere with white noise'
  },
  {
    name: 'Relax',
    sounds: ['ocean', 'rain'],
    description: 'Ocean waves with gentle rain'
  },
  {
    name: 'Coding Zone',
    sounds: ['whitenoise', 'fireplace'],
    description: 'White noise with crackling fireplace'
  },
  {
    name: 'Stormy Night',
    sounds: ['rain', 'fireplace'],
    description: 'Rain and fireplace for cozy focus'
  }
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
  const [selectedSounds, setSelectedSounds] = useState<string[]>([]);
  const [soundVolume, setSoundVolume] = useState([50]);
  const [tickingEnabled, setTickingEnabled] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState('none');
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer>>(new Map());
  const audioSourcesRef = useRef<Map<string, AudioBufferSourceNode>>(new Map());
  const gainNodeRef = useRef<GainNode | null>(null);
  const tickAudioRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    const initAudioContext = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        
        // Create tick audio context
        tickAudioRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported, falling back to HTML audio');
      }
    };

    initAudioContext();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (tickAudioRef.current) {
        tickAudioRef.current.close();
      }
    };
  }, []);

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

  // Create tick sound using Web Audio API
  const playTickSound = () => {
    if (!tickingEnabled || !tickAudioRef.current) return;
    
    try {
      const oscillator = tickAudioRef.current.createOscillator();
      const gainNode = tickAudioRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(tickAudioRef.current.destination);
      
      oscillator.frequency.setValueAtTime(800, tickAudioRef.current.currentTime);
      gainNode.gain.setValueAtTime(0.1, tickAudioRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, tickAudioRef.current.currentTime + 0.1);
      
      oscillator.start(tickAudioRef.current.currentTime);
      oscillator.stop(tickAudioRef.current.currentTime + 0.1);
    } catch (error) {
      console.warn('Could not play tick sound:', error);
    }
  };

  // Generate sound using Web Audio API (fallback for missing sound files)
  const generateSound = (type: string): AudioBuffer | null => {
    if (!audioContextRef.current) return null;

    const sampleRate = audioContextRef.current.sampleRate;
    const duration = 2; // 2 seconds loop
    const buffer = audioContextRef.current.createBuffer(2, sampleRate * duration, sampleRate);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      
      for (let i = 0; i < channelData.length; i++) {
        const t = i / sampleRate;
        
        switch (type) {
          case 'rain':
            channelData[i] = (Math.random() - 0.5) * 0.3 * Math.sin(t * 20);
            break;
          case 'ocean':
            channelData[i] = Math.sin(t * 0.5) * 0.3 + (Math.random() - 0.5) * 0.1;
            break;
          case 'whitenoise':
            channelData[i] = (Math.random() - 0.5) * 0.2;
            break;
          case 'forest':
            channelData[i] = (Math.random() - 0.5) * 0.1 + Math.sin(t * Math.random() * 10) * 0.1;
            break;
          case 'fireplace':
            channelData[i] = (Math.random() - 0.5) * 0.4 * (1 + Math.sin(t * 3));
            break;
          case 'birds':
            channelData[i] = Math.sin(t * (800 + Math.random() * 400)) * 0.1 * (Math.random() > 0.95 ? 1 : 0);
            break;
          case 'coffee':
            channelData[i] = (Math.random() - 0.5) * 0.15 + Math.sin(t * 60) * 0.05;
            break;
          default:
            channelData[i] = 0;
        }
      }
    }

    return buffer;
  };

  const playAmbientSounds = async () => {
    if (!audioContextRef.current || !gainNodeRef.current || selectedSounds.length === 0) return;

    try {
      // Resume audio context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Set volume
      gainNodeRef.current.gain.setValueAtTime(soundVolume[0] / 100, audioContextRef.current.currentTime);

      selectedSounds.forEach(soundType => {
        if (soundType === 'none') return;

        // Generate sound buffer if not exists
        if (!audioBuffersRef.current.has(soundType)) {
          const buffer = generateSound(soundType);
          if (buffer) {
            audioBuffersRef.current.set(soundType, buffer);
          }
        }

        const buffer = audioBuffersRef.current.get(soundType);
        if (buffer) {
          const source = audioContextRef.current!.createBufferSource();
          source.buffer = buffer;
          source.loop = true;
          source.connect(gainNodeRef.current!);
          source.start();
          audioSourcesRef.current.set(soundType, source);
        }
      });
    } catch (error) {
      console.warn('Could not play ambient sounds:', error);
    }
  };

  const stopAmbientSounds = () => {
    audioSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // Source might already be stopped
      }
    });
    audioSourcesRef.current.clear();
  };

  const startTimer = () => {
    setIsRunning(true);
    playAmbientSounds();
    
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimerComplete();
          return 0;
        }
        // Play tick sound every second
        playTickSound();
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopAmbientSounds();
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setTimeLeft(getDurationForMode(mode));
    stopAmbientSounds();
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    stopAmbientSounds();

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

  const handlePresetSelect = (presetName: string) => {
    if (presetName === 'none') {
      setSelectedSounds([]);
      setSelectedPreset('none');
      return;
    }

    const preset = SOUND_PRESETS.find(p => p.name === presetName);
    if (preset) {
      setSelectedSounds(preset.sounds);
      setSelectedPreset(presetName);
    }
  };

  const toggleSound = (soundValue: string) => {
    setSelectedSounds(prev => {
      if (prev.includes(soundValue)) {
        return prev.filter(s => s !== soundValue);
      } else {
        return [...prev, soundValue];
      }
    });
    setSelectedPreset('none'); // Clear preset when manually selecting sounds
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopAmbientSounds();
    };
  }, []);

  useEffect(() => {
    if (!isRunning) {
      setTimeLeft(getDurationForMode(mode));
    }
  }, [mode, workDuration, shortBreakDuration, longBreakDuration, isRunning]);

  // Update volume when slider changes
  useEffect(() => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.setValueAtTime(soundVolume[0] / 100, audioContextRef.current.currentTime);
    }
  }, [soundVolume]);

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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="ticking"
                  checked={tickingEnabled}
                  onChange={(e) => setTickingEnabled(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="ticking">Enable ticking sound</Label>
              </div>
            </CardContent>
          </Card>

          {/* Sound Presets Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Sound Presets
              </CardTitle>
              <CardDescription>Quick ambient sound combinations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preset</Label>
                <Select value={selectedPreset} onValueChange={handlePresetSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a preset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Custom</SelectItem>
                    {SOUND_PRESETS.map((preset) => (
                      <SelectItem key={preset.name} value={preset.name}>
                        {preset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedPreset !== 'none' && (
                <p className="text-sm text-gray-600">
                  {SOUND_PRESETS.find(p => p.name === selectedPreset)?.description}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Individual Sounds Card */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Individual Sounds</CardTitle>
              <CardDescription>Mix and match your own combination</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {AMBIENT_SOUNDS.filter(sound => sound.value !== 'none').map((sound) => (
                  <Button
                    key={sound.value}
                    variant={selectedSounds.includes(sound.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleSound(sound.value)}
                    className={selectedSounds.includes(sound.value) ? 'bg-gradient-to-r from-purple-500 to-blue-500' : ''}
                  >
                    {sound.name}
                  </Button>
                ))}
              </div>
              
              {selectedSounds.length > 0 && (
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
    </div>
  );
};
