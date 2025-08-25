import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseExercises } from "@/hooks/useSupabaseExercises";
import { useWorkoutSession } from "@/hooks/useWorkoutSession";
import { useToast } from "@/hooks/use-toast";
import { ArrowRight, ArrowLeft, CheckCircle, Home, Edit3, Calendar, Timer, Play, Pause, RotateCcw, Volume2, VolumeX, SkipForward } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

const WorkoutSession = () => {
  const { workoutType } = useParams<{ workoutType: 'A' | 'B' | 'C' }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getExercisesByWorkout, updateExercise } = useSupabaseExercises();
  const { currentWorkoutId, isLoading: workoutLoading, startWorkout, completeWorkout, pauseWorkout, updateExerciseWeight } = useWorkoutSession();
  
  console.log('WorkoutSession loaded with workoutType:', workoutType);
  
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [tempWeight, setTempWeight] = useState('');
  
  // Timer states
  const [workoutTime, setWorkoutTime] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [restTime, setRestTime] = useState(0);
  const [restStartTime, setRestStartTime] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState(60);
  const [isWorkoutRunning, setIsWorkoutRunning] = useState(false);
  const [isRestRunning, setIsRestRunning] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null);
  const [exerciseQueue, setExerciseQueue] = useState<number[]>([]);

  const exercises = workoutType ? getExercisesByWorkout(workoutType) : [];
  const workoutExercises = exerciseQueue.length > 0 ? exerciseQueue.map(index => exercises[index]) : exercises;
  const currentExercise = workoutExercises[currentExerciseIndex];
  const progress = workoutExercises.length > 0 ? ((currentExerciseIndex + 1) / workoutExercises.length) * 100 : 0;

  console.log('Exercises found:', exercises.length);

  // Utility function to detect iOS Safari
  const isIOSSafari = useCallback(() => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS|EdgiOS/.test(userAgent);
    return isIOS && isSafari;
  }, []);

  // Audio and vibration functions
  const playBeep = useCallback((frequency = 800, duration = 200) => {
    if (!isSoundEnabled) return;
    
    // Skip audio on iOS Safari to prevent "Done" button
    if (isIOSSafari()) {
      console.log('Skipping audio on iOS Safari to prevent Done button');
      return;
    }
    
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
  }, [isSoundEnabled, isIOSSafari]);

  const vibrate = useCallback((pattern: number[] = [200]) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Wake Lock functions to prevent screen from turning off
  const requestWakeLock = useCallback(async () => {
    // Skip Wake Lock on iOS Safari to prevent "Done" button
    if (isIOSSafari()) {
      console.log('Skipping Wake Lock on iOS Safari to prevent Done button');
      return;
    }
    
    try {
      if ('wakeLock' in navigator) {
        const wakeLockSentinel = await navigator.wakeLock.request('screen');
        setWakeLock(wakeLockSentinel);
        console.log('Wake lock activated');
        
        wakeLockSentinel.addEventListener('release', () => {
          console.log('Wake lock released');
          setWakeLock(null);
        });
      }
    } catch (error) {
      console.error('Wake lock failed:', error);
    }
  }, [isIOSSafari]);

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      try {
        await wakeLock.release();
        setWakeLock(null);
        console.log('Wake lock manually released');
      } catch (error) {
        console.error('Failed to release wake lock:', error);
      }
    }
  }, [wakeLock]);

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer effects - use timestamp-based calculation to work when screen is off
  useEffect(() => {
    const interval = setInterval(() => {
      // Update workout time based on start timestamp
      if (isWorkoutRunning && workoutStartTime) {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - workoutStartTime) / 1000);
        setWorkoutTime(elapsedSeconds);
      }
      
      // Update rest time based on start timestamp  
      if (isRestRunning && restStartTime) {
        const currentTime = Date.now();
        const elapsedSeconds = Math.floor((currentTime - restStartTime) / 1000);
        const remainingTime = Math.max(0, restDuration - elapsedSeconds);
        setRestTime(remainingTime);
        
        if (remainingTime === 0) {
          setIsRestRunning(false);
          setRestStartTime(null);
          playBeep(1000, 500);
          vibrate([500, 200, 500]);
          toast({
            title: 'זמן המנוחה נגמר! 🔔',
            description: 'זמן להמשיך באימון',
          });
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isWorkoutRunning, workoutStartTime, isRestRunning, restStartTime, restDuration, playBeep, vibrate, toast]);

  // Start workout timer when workout begins
  useEffect(() => {
    if (currentWorkoutId && exercises.length > 0 && !isWorkoutRunning) {
      setIsWorkoutRunning(true);
      setWorkoutStartTime(Date.now());
      requestWakeLock(); // Prevent screen from turning off during workout
      playBeep(500, 300);
      toast({
        title: 'האימון התחיל! 🔥',
        description: 'הטיימר רץ - בהצלחה!',
      });
    }
  }, [currentWorkoutId, exercises.length, isWorkoutRunning, playBeep, toast, requestWakeLock]);

  useEffect(() => {
    console.log('useEffect - workoutType:', workoutType, 'exercises.length:', exercises.length);
    // Wait for exercises to load - don't redirect immediately if no exercises yet
    if (!workoutType) {
      console.log('Redirecting back to home - no workoutType');
      navigate('/');
      return;
    }
    // Only redirect if we have no exercises AND exercises have been loaded (length > 0 means loaded)
    if (exercises.length > 0 && getExercisesByWorkout(workoutType).length === 0) {
      console.log('Redirecting back to home - no exercises for this workout type');
      navigate('/');
      return;
    }
  }, [workoutType, exercises.length, navigate, getExercisesByWorkout]);

  // Initialize exercise queue when exercises load
  useEffect(() => {
    if (exercises.length > 0 && exerciseQueue.length === 0) {
      setExerciseQueue(Array.from({ length: exercises.length }, (_, i) => i));
    }
  }, [exercises.length, exerciseQueue.length]);

  // Start workout session when component mounts
  useEffect(() => {
    if (workoutType && exercises.length > 0 && !currentWorkoutId && !workoutLoading) {
      const workoutTitles = {
        A: "אימון A: חזה, כתפיים, יד אחורית ובטן",
        B: "אימון B: גב, יد קידמית ובטן", 
        C: "אימון C: רגליים, זרועות ובטן"
      };
      startWorkout(workoutType, workoutTitles[workoutType], exercises);
    }
  }, [workoutType, exercises.length, currentWorkoutId, workoutLoading]);

  // Cleanup wake lock when leaving the component
  useEffect(() => {
    return () => {
      if (wakeLock) {
        wakeLock.release().catch(console.error);
      }
    };
  }, [wakeLock]);

  const handleNextExercise = async () => {
    setCompletedExercises(prev => new Set([...prev, currentExerciseIndex]));
    setIsEditingWeight(false); // Reset weight editing state
    
    if (currentExerciseIndex < workoutExercises.length - 1) {
      setCurrentExerciseIndex(prev => prev + 1);
      toast({
        title: "תרגיל הושלם! 💪",
        description: `עוברים לתרגיל הבא`,
      });
    } else {
      // Workout completed - save to database
      setIsWorkoutRunning(false);
      releaseWakeLock(); // Allow screen to turn off after workout
      if (currentWorkoutId) {
        const finalCompletedExercises = new Set([...completedExercises, currentExerciseIndex]);
        await completeWorkout(currentWorkoutId, finalCompletedExercises);
      } else {
        toast({
          title: "כל הכבוד! 🎉",
          description: `סיימת את האימון תוך ${formatTime(workoutTime)}!`,
        });
      }
      navigate('/');
    }
  };

  const handlePreviousExercise = () => {
    if (currentExerciseIndex > 0) {
      setCurrentExerciseIndex(prev => prev - 1);
      setCompletedExercises(prev => {
        const newSet = new Set(prev);
        newSet.delete(currentExerciseIndex - 1);
        return newSet;
      });
      setIsEditingWeight(false); // Reset weight editing state
    }
  };

  const handleWeightEdit = () => {
    setTempWeight(currentExercise.weight || '');
    setIsEditingWeight(true);
  };

  const handleWeightSave = async () => {
    if (tempWeight && currentExercise) {
      // Update local exercises
      updateExercise(currentExercise.id, {
        ...currentExercise,
        weight: tempWeight
      });
      
      // Update in database if workout session exists
      if (currentWorkoutId) {
        await updateExerciseWeight(currentWorkoutId, currentExerciseIndex, tempWeight);
      }
      
      setIsEditingWeight(false);
      toast({
        title: "משקל עודכן! ✅",
        description: `המשקל החדש: ${tempWeight} ק״ג`,
      });
    }
  };

  const handleWeightCancel = () => {
    setIsEditingWeight(false);
    setTempWeight('');
  };

  const handleSkipExercise = () => {
    if (exerciseQueue.length <= 1) return; // Can't skip if only one exercise left
    
    // Remove current exercise from current position and insert it at the next position
    const newQueue = [...exerciseQueue];
    const currentExerciseInQueue = newQueue[currentExerciseIndex];
    
    // Remove from current position
    newQueue.splice(currentExerciseIndex, 1);
    
    // Insert after the next exercise (or at the end if this is the last one)
    const insertPosition = Math.min(currentExerciseIndex + 1, newQueue.length);
    newQueue.splice(insertPosition, 0, currentExerciseInQueue);
    
    setExerciseQueue(newQueue);
    setIsEditingWeight(false);
    
    toast({
      title: "תרגיל נדחה",
      description: "התרגיל יבוא אחרי התרגיל הבא",
    });
  };

  const handlePauseWorkout = async () => {
    setIsWorkoutRunning(false);
    setIsRestRunning(false);
    releaseWakeLock(); // Allow screen to turn off when pausing workout
    
    if (currentWorkoutId) {
      await pauseWorkout(currentWorkoutId);
    }
    
    navigate('/');
  };

  const handleEndWorkout = async () => {
    setIsWorkoutRunning(false);
    setIsRestRunning(false);
    releaseWakeLock(); // Allow screen to turn off when ending workout
    
    // Save partial workout if session exists
    if (currentWorkoutId && completedExercises.size > 0) {
      await completeWorkout(currentWorkoutId, completedExercises);
    }
    
    navigate('/');
    toast({
      title: "האימון הופסק",
      description: completedExercises.size > 0 
        ? `התקדמות נשמרה! זמן אימון: ${formatTime(workoutTime)}` 
        : "תמיד אפשר לחזור ולהמשיך!",
    });
  };

  // Timer functions
  const startRestTimer = () => {
    setRestTime(restDuration);
    setRestStartTime(Date.now());
    setIsRestRunning(true);
    playBeep(600, 200);
    toast({
      title: 'מנוחה התחילה',
      description: `${restDuration} שניות מנוחה`,
    });
  };

  const toggleRestTimer = () => {
    if (isRestRunning) {
      // Pausing - stop the timer but keep the current remaining time
      setIsRestRunning(false);
    } else {
      // Resuming - set new start time based on remaining time
      const elapsedTime = restDuration - restTime;
      setRestStartTime(Date.now() - (elapsedTime * 1000));
      setIsRestRunning(true);
    }
  };

  const resetRestTimer = () => {
    setIsRestRunning(false);
    setRestStartTime(null);
    setRestTime(restDuration);
  };

  if (!currentExercise && exercises.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">אין תרגילים באימון זה</h2>
          <Button onClick={() => navigate('/')}>חזרה לבית</Button>
        </div>
      </div>
    );
  }

  // Show loading while exercises are being loaded
  if (exercises.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitness-primary mx-auto mb-4"></div>
          <p>טוען תרגילים...</p>
        </div>
      </div>
    );
  }

  if (!currentExercise) {
    return null;
  }

  const workoutTitles = {
    A: "אימון A: חזה, כתפיים, יד אחורית ובטן",
    B: "אימון B: גב, יד קידמית ובטן", 
    C: "אימון C: רגליים, זרועות ובטן"
  };

  const today = new Date();
  const dayNames = {
    0: 'ראשון',
    1: 'שני', 
    2: 'שלישי',
    3: 'רביעי',
    4: 'חמישי',
    5: 'שישי',
    6: 'שבת'
  };
  const currentDay = dayNames[today.getDay() as keyof typeof dayNames];
  const currentDate = format(today, 'dd/MM/yyyy');

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={handleEndWorkout} size="sm">
                <Home className="w-4 h-4 ml-2" />
                חזרה לבית
              </Button>
              <Button variant="outline" onClick={handlePauseWorkout} size="sm">
                <Pause className="w-4 h-4 ml-2" />
                השהה
              </Button>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              תרגיל {currentExerciseIndex + 1} מתוך {workoutExercises.length}
            </Badge>
          </div>

          {/* Integrated Timer Bar */}
          <Card className="bg-gradient-to-r from-fitness-primary/10 to-fitness-secondary/10 border-fitness-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                {/* Workout Timer */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-fitness-primary" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-fitness-primary">
                        {formatTime(workoutTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">זמן אימון</div>
                    </div>
                  </div>
                  
                  {/* Rest Timer */}
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-px bg-border mx-2" />
                    <div className="text-center">
                      <div className={`text-lg font-bold ${
                        restTime <= 10 && isRestRunning 
                          ? 'text-red-500 animate-pulse' 
                          : 'text-orange-500'
                      }`}>
                        {formatTime(restTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">מנוחה</div>
                    </div>
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center gap-2">
                  <Select value={restDuration.toString()} onValueChange={(value) => setRestDuration(parseInt(value))}>
                    <SelectTrigger className="w-20 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30ש</SelectItem>
                      <SelectItem value="45">45ש</SelectItem>
                      <SelectItem value="60">60ש</SelectItem>
                      <SelectItem value="90">90ש</SelectItem>
                      <SelectItem value="120">2ד</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-1">
                    {!isRestRunning ? (
                      <Button size="sm" onClick={startRestTimer} className="h-8 px-2">
                        <Play className="w-3 h-3" />
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={toggleRestTimer} className="h-8 px-2">
                        <Pause className="w-3 h-3" />
                      </Button>
                    )}
                    <Button size="sm" variant="outline" onClick={resetRestTimer} className="h-8 px-2">
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsSoundEnabled(!isSoundEnabled)}
                      className="h-8 px-2"
                    >
                      {isSoundEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
                    </Button>
                  </div>
                </div>
              </div>
              
              {isRestRunning && restTime > 0 && (
                <div className="mt-3">
                  <Progress 
                    value={((restDuration - restTime) / restDuration) * 100} 
                    className="h-1"
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Date and Day */}
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{currentDay}, {currentDate}</span>
          </div>
          
          <h1 className="text-2xl font-bold text-foreground">
            {workoutTitles[workoutType!]}
          </h1>
          
          <Progress value={progress} className="w-full h-3" />
        </div>

        {/* Current Exercise Card */}
        <Card className="bg-card/80 backdrop-blur-sm border-2 border-fitness-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-fitness-primary mb-2">
              {currentExercise.name}
            </CardTitle>
            <div className="flex justify-center items-center gap-4 text-lg flex-wrap">
              <Badge variant="outline" className="px-4 py-2">
                {currentExercise.sets} סטים
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                {currentExercise.reps} חזרות
              </Badge>
              {currentExercise.machineNumber && (
                <Badge variant="secondary" className="px-4 py-2">
                  מכשיר {currentExercise.machineNumber}
                </Badge>
              )}
              {currentExercise.seatHeight && (
                <Badge variant="secondary" className="px-4 py-2">
                  כיסא {currentExercise.seatHeight}
                </Badge>
              )}
              {currentExercise.weight && (
                <div className="flex items-center gap-2">
                  {isEditingWeight ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={tempWeight}
                        onChange={(e) => setTempWeight(e.target.value)}
                        className="w-16 h-8 text-center"
                        placeholder="ק״ג"
                      />
                      <Button size="sm" onClick={handleWeightSave} className="h-8 px-2">
                        ✓
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleWeightCancel} className="h-8 px-2">
                        ✕
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="px-4 py-2">
                        {currentExercise.weight} ק״ג
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleWeightEdit}
                        className="h-8 w-8 p-0"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              {/* Top row - Skip and Previous */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handlePreviousExercise}
                  disabled={currentExerciseIndex === 0}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 ml-2" />
                  תרגיל קודם
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSkipExercise}
                  disabled={workoutExercises.length <= 1}
                  className="flex-1"
                >
                  <SkipForward className="w-4 h-4 ml-2" />
                  דלג
                </Button>
              </div>
              
              {/* Bottom row - Main Next Button */}
              <Button
                onClick={handleNextExercise}
                className="w-full bg-fitness-primary hover:bg-fitness-primary/90 h-12 text-lg font-semibold"
              >
                {currentExerciseIndex === workoutExercises.length - 1 ? (
                  <>
                    <CheckCircle className="w-5 h-5 ml-2" />
                    סיים אימון
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-5 h-5 ml-2" />
                    תרגיל הבא
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Exercise List Preview */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">כל התרגילים באימון</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {workoutExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                    index === currentExerciseIndex
                      ? 'bg-fitness-primary/20 border-2 border-fitness-primary/50'
                      : completedExercises.has(index)
                      ? 'bg-fitness-success/20 border border-fitness-success/30'
                      : 'bg-muted/30 border border-muted'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === currentExerciseIndex
                        ? 'bg-fitness-primary text-white'
                        : completedExercises.has(index)
                        ? 'bg-fitness-success text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {completedExercises.has(index) ? '✓' : index + 1}
                    </div>
                    <span className={`font-medium ${
                      index === currentExerciseIndex ? 'text-fitness-primary' : 'text-foreground'
                    }`}>
                      {exercise.name}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.sets}×{exercise.reps}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorkoutSession;