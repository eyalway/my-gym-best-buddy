import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Volume2, 
  VolumeX,
  Timer,
  Dumbbell,
  Target,
  Clock
} from 'lucide-react';

interface TimerState {
  type: 'rest' | 'set' | 'workout';
  time: number;
  totalTime: number;
  isRunning: boolean;
}

interface PresetTimer {
  name: string;
  duration: number;
  description: string;
}

const WorkoutTimer = () => {
  const { toast } = useToast();
  
  // Timer states
  const [restTimer, setRestTimer] = useState<TimerState>({
    type: 'rest',
    time: 60,
    totalTime: 60,
    isRunning: false
  });
  
  const [setTimer, setSetTimer] = useState<TimerState>({
    type: 'set',
    time: 0,
    totalTime: 0,
    isRunning: false
  });
  
  const [workoutTimer, setWorkoutTimer] = useState<TimerState>({
    type: 'workout',
    time: 0,
    totalTime: 0,
    isRunning: false
  });
  
  // Settings
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [selectedRestTime, setSelectedRestTime] = useState('60');
  const [currentSet, setCurrentSet] = useState(1);
  
  // Preset timers
  const restPresets: PresetTimer[] = [
    { name: '30 שניות', duration: 30, description: 'מנוחה קצרה' },
    { name: '45 שניות', duration: 45, description: 'מנוחה סטנדרטית' },
    { name: '60 שניות', duration: 60, description: 'מנוחה בינונית' },
    { name: '90 שניות', duration: 90, description: 'מנוחה ארוכה' },
    { name: '2 דקות', duration: 120, description: 'מנוחה מורחבת' },
    { name: '3 דקות', duration: 180, description: 'מנוחה כבדה' },
  ];

  // Audio context for beeps
  const playBeep = useCallback((frequency = 800, duration = 200) => {
    if (!isSoundEnabled) return;
    
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration / 1000);
    } catch (error) {
      console.log('Audio not supported:', error);
    }
  }, [isSoundEnabled]);

  // Vibration
  const vibrate = useCallback((pattern: number[] = [200]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Timer tick effect
  useEffect(() => {
    const interval = setInterval(() => {
      // Rest timer countdown
      if (restTimer.isRunning && restTimer.time > 0) {
        setRestTimer(prev => ({ ...prev, time: prev.time - 1 }));
      } else if (restTimer.isRunning && restTimer.time === 0) {
        // Rest timer finished
        setRestTimer(prev => ({ ...prev, isRunning: false }));
        playBeep(1000, 500);
        vibrate([500, 200, 500]);
        toast({
          title: 'זמן המנוחה נגמר! 🔔',
          description: 'זמן להתחיל את הסט הבא',
        });
      }
      
      // Set timer count up
      if (setTimer.isRunning) {
        setSetTimer(prev => ({ ...prev, time: prev.time + 1 }));
      }
      
      // Workout timer count up
      if (workoutTimer.isRunning) {
        setWorkoutTimer(prev => ({ ...prev, time: prev.time + 1 }));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [restTimer.isRunning, setTimer.isRunning, workoutTimer.isRunning, playBeep, vibrate, toast]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start rest timer
  const startRestTimer = () => {
    const duration = parseInt(selectedRestTime);
    setRestTimer({
      type: 'rest',
      time: duration,
      totalTime: duration,
      isRunning: true
    });
    playBeep(600, 200);
    toast({
      title: 'טיימר מנוחה התחיל',
      description: `${duration} שניות מנוחה`,
    });
  };

  // Start set timer
  const startSetTimer = () => {
    setSetTimer({
      type: 'set',
      time: 0,
      totalTime: 0,
      isRunning: true
    });
    playBeep(400, 200);
  };

  // Finish set
  const finishSet = () => {
    setSetTimer(prev => ({ ...prev, isRunning: false }));
    setCurrentSet(prev => prev + 1);
    playBeep(800, 300);
    toast({
      title: `סט ${currentSet} הושלם! 💪`,
      description: `זמן הסט: ${formatTime(setTimer.time)}`,
    });
  };

  // Start workout timer
  const startWorkout = () => {
    setWorkoutTimer({
      type: 'workout',
      time: 0,
      totalTime: 0,
      isRunning: true
    });
    setCurrentSet(1);
    playBeep(500, 300);
    toast({
      title: 'האימון התחיל! 🔥',
      description: 'בהצלחה באימון!',
    });
  };

  // Stop workout
  const stopWorkout = () => {
    setWorkoutTimer(prev => ({ ...prev, isRunning: false }));
    setSetTimer(prev => ({ ...prev, isRunning: false }));
    setRestTimer(prev => ({ ...prev, isRunning: false }));
    playBeep(300, 500);
    toast({
      title: 'האימון הסתיים',
      description: `זמן כולל: ${formatTime(workoutTimer.time)}`,
    });
  };

  // Reset all timers
  const resetAll = () => {
    setRestTimer(prev => ({ ...prev, time: parseInt(selectedRestTime), isRunning: false }));
    setSetTimer(prev => ({ ...prev, time: 0, isRunning: false }));
    setWorkoutTimer(prev => ({ ...prev, time: 0, isRunning: false }));
    setCurrentSet(1);
    toast({
      title: 'כל הטיימרים אופסו',
      description: 'מוכן לאימון חדש',
    });
  };

  // Toggle pause/resume for any timer
  const toggleTimer = (timerType: 'rest' | 'set' | 'workout') => {
    switch (timerType) {
      case 'rest':
        setRestTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
        break;
      case 'set':
        setSetTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
        break;
      case 'workout':
        setWorkoutTimer(prev => ({ ...prev, isRunning: !prev.isRunning }));
        break;
    }
  };

  const restProgress = restTimer.totalTime > 0 
    ? ((restTimer.totalTime - restTimer.time) / restTimer.totalTime) * 100 
    : 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Main Workout Timer */}
      <Card className="bg-gradient-to-br from-fitness-primary/10 to-fitness-secondary/10 border-fitness-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-fitness-primary" />
              זמן אימון כולל
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">סט {currentSet}</Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              >
                {isSoundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-5xl font-bold text-fitness-primary mb-2">
              {formatTime(workoutTimer.time)}
            </div>
            <div className="flex justify-center gap-3">
              {!workoutTimer.isRunning ? (
                <Button onClick={startWorkout} className="gap-2">
                  <Play className="h-4 w-4" />
                  התחל אימון
                </Button>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => toggleTimer('workout')}
                    className="gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    השהה
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={stopWorkout}
                    className="gap-2"
                  >
                    <Square className="h-4 w-4" />
                    סיים אימון
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={resetAll} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                איפוס
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Set Timer */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-fitness-secondary" />
              טיימר סט נוכחי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-fitness-secondary mb-2">
                {formatTime(setTimer.time)}
              </div>
              <div className="flex justify-center gap-2">
                {!setTimer.isRunning ? (
                  <Button 
                    onClick={startSetTimer} 
                    variant="outline"
                    className="gap-2"
                    disabled={!workoutTimer.isRunning}
                  >
                    <Play className="h-4 w-4" />
                    התחל סט
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      onClick={() => toggleTimer('set')}
                      className="gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      השהה
                    </Button>
                    <Button 
                      onClick={finishSet}
                      className="gap-2"
                    >
                      <Square className="h-4 w-4" />
                      סיים סט
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rest Timer */}
        <Card className="bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              טיימר מנוחה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Select value={selectedRestTime} onValueChange={setSelectedRestTime}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {restPresets.map((preset) => (
                    <SelectItem key={preset.duration} value={preset.duration.toString()}>
                      {preset.name} - {preset.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${
                restTimer.time <= 10 && restTimer.isRunning 
                  ? 'text-red-500 animate-pulse' 
                  : 'text-orange-500'
              }`}>
                {formatTime(restTimer.time)}
              </div>
              
              {restTimer.totalTime > 0 && (
                <div className="mb-3">
                  <Progress 
                    value={restProgress} 
                    className="h-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {Math.round(restProgress)}% הושלם
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-2">
                {!restTimer.isRunning ? (
                  <Button 
                    onClick={startRestTimer} 
                    variant="outline"
                    className="gap-2"
                  >
                    <Timer className="h-4 w-4" />
                    התחל מנוחה
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    onClick={() => toggleTimer('rest')}
                    className="gap-2"
                  >
                    <Pause className="h-4 w-4" />
                    השהה
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">פעולות מהירות</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {restPresets.slice(0, 4).map((preset) => (
              <Button
                key={preset.duration}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedRestTime(preset.duration.toString());
                  setRestTimer({
                    type: 'rest',
                    time: preset.duration,
                    totalTime: preset.duration,
                    isRunning: true
                  });
                  playBeep(600, 200);
                }}
                className="text-xs"
              >
                {preset.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p><strong>💡 איך להשתמש:</strong></p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>• התחל את האימון הכללי</p>
                <p>• התחל סט כשאתה מתחיל תרגיל</p>
                <p>• סיים סט כשאתה מסיים תרגיל</p>
              </div>
              <div>
                <p>• התחל מנוחה בין סטים</p>
                <p>• השתמש בפעולות המהירות</p>
                <p>• כל הטיימרים עם צלילים וויברציה</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkoutTimer;