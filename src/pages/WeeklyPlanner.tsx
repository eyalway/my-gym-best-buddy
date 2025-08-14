import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Calendar, 
  ArrowRight, 
  Clock, 
  Dumbbell, 
  Save,
  RefreshCw,
  CheckCircle,
  Plus
} from 'lucide-react';

interface DayPlan {
  day: string;
  dayHebrew: string;
  workoutType: 'A' | 'B' | 'C' | 'rest' | 'none';
  preferredTime: string;
  status: 'planned' | 'completed' | 'missed';
}

const WeeklyPlanner = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [weeklyPlan, setWeeklyPlan] = useState<DayPlan[]>([
    { day: 'sunday', dayHebrew: 'ראשון', workoutType: 'none', preferredTime: 'none', status: 'planned' },
    { day: 'monday', dayHebrew: 'שני', workoutType: 'none', preferredTime: 'none', status: 'planned' },
    { day: 'tuesday', dayHebrew: 'שלישי', workoutType: 'none', preferredTime: 'none', status: 'planned' },
    { day: 'wednesday', dayHebrew: 'רביעי', workoutType: 'none', preferredTime: 'none', status: 'planned' },
    { day: 'thursday', dayHebrew: 'חמישי', workoutType: 'none', preferredTime: 'none', status: 'planned' },
    { day: 'friday', dayHebrew: 'שישי', workoutType: 'none', preferredTime: 'none', status: 'planned' },
    { day: 'saturday', dayHebrew: 'שבת', workoutType: 'none', preferredTime: 'none', status: 'planned' },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load saved weekly plan from localStorage
    const savedPlan = localStorage.getItem(`weeklyPlan_${user?.id}`);
    if (savedPlan) {
      try {
        setWeeklyPlan(JSON.parse(savedPlan));
      } catch (error) {
        console.error('Error loading weekly plan:', error);
      }
    }
  }, [user?.id]);

  const workoutTypes = [
    { value: 'none', label: 'לא נבחר' },
    { value: 'A', label: 'אימון A - חזה, כתפיים, יד אחורית ובטן' },
    { value: 'B', label: 'אימון B - גב, יד קידמית ובטן' },
    { value: 'C', label: 'אימון C - רגליים, זרועות ובטן' },
    { value: 'rest', label: 'יום מנוחה' },
  ];

  const timeSlots = [
    { value: 'none', label: 'לא נבחר' },
    { value: 'morning', label: 'בוקר (6:00-10:00)' },
    { value: 'afternoon', label: 'צהריים (10:00-16:00)' },
    { value: 'evening', label: 'ערב (16:00-20:00)' },
    { value: 'night', label: 'לילה (20:00-24:00)' },
  ];

  const updateDayPlan = (dayIndex: number, field: keyof DayPlan, value: string) => {
    const updatedPlan = [...weeklyPlan];
    updatedPlan[dayIndex] = { ...updatedPlan[dayIndex], [field]: value };
    setWeeklyPlan(updatedPlan);
  };

  const savePlan = () => {
    setIsLoading(true);
    try {
      localStorage.setItem(`weeklyPlan_${user?.id}`, JSON.stringify(weeklyPlan));
      toast({
        title: 'התוכנית נשמרה בהצלחה! ✅',
        description: 'התוכנית השבועית שלך נשמרה במערכת',
      });
    } catch (error) {
      toast({
        title: 'שגיאה בשמירת התוכנית',
        description: 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPlan = () => {
                    const emptyPlan = weeklyPlan.map(day => ({
                      ...day,
                      workoutType: 'none' as const,
                      preferredTime: 'none',
                      status: 'planned' as const
                    }));
    setWeeklyPlan(emptyPlan);
    toast({
      title: 'התוכנית אופסה',
      description: 'כל הימים נוקו מהתוכנית השבועית',
    });
  };

  const getWorkoutTypeColor = (type: string) => {
    switch (type) {
      case 'A': return 'bg-red-500/20 text-red-700 dark:text-red-300';
      case 'B': return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'C': return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'rest': return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getWorkoutTypeLabel = (type: string) => {
    switch (type) {
      case 'A': return 'אימון A';
      case 'B': return 'אימון B';
      case 'C': return 'אימון C';
      case 'rest': return 'מנוחה';
      default: return 'לא נבחר';
    }
  };

  const getTimeLabel = (time: string) => {
    const timeSlot = timeSlots.find(slot => slot.value === time);
    return timeSlot ? timeSlot.label : 'לא נבחר';
  };

  const workoutDays = weeklyPlan.filter(day => day.workoutType && day.workoutType !== 'rest' && day.workoutType !== 'none');
  const restDays = weeklyPlan.filter(day => day.workoutType === 'rest');

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-fitness-primary/20">
              <Calendar className="h-6 w-6 text-fitness-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">תכנון שבועי</h1>
              <p className="text-muted-foreground">תכנן את האימונים שלך לשבוע הקרוב</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={resetPlan}>
              <RefreshCw className="w-4 h-4 ml-2" />
              איפוס
            </Button>
            <Button onClick={savePlan} disabled={isLoading} className="gap-2">
              <Save className="w-4 h-4" />
              {isLoading ? 'שומר...' : 'שמור תוכנית'}
            </Button>
            <Button variant="ghost" onClick={() => navigate('/')}>
              <ArrowRight className="w-4 h-4 ml-2" />
              חזרה לבית
            </Button>
          </div>
        </div>

        <Tabs defaultValue="planner" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="planner">תכנון</TabsTrigger>
            <TabsTrigger value="overview">סקירה</TabsTrigger>
          </TabsList>
          
          <TabsContent value="planner" className="space-y-6">
            {/* Weekly Planner */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {weeklyPlan.map((day, index) => (
                <Card key={day.day} className="bg-card/80 backdrop-blur-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center justify-between">
                      {day.dayHebrew}
                      {day.workoutType && day.workoutType !== 'none' && (
                        <Badge className={getWorkoutTypeColor(day.workoutType)}>
                          {getWorkoutTypeLabel(day.workoutType)}
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">סוג אימון:</label>
                      <Select
                        value={day.workoutType}
                        onValueChange={(value) => updateDayPlan(index, 'workoutType', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="בחר סוג אימון" />
                        </SelectTrigger>
                        <SelectContent>
                          {workoutTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {(day.workoutType === 'A' || day.workoutType === 'B' || day.workoutType === 'C') && (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">שעה מועדפת:</label>
                        <Select
                          value={day.preferredTime}
                          onValueChange={(value) => updateDayPlan(index, 'preferredTime', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר שעה" />
                          </SelectTrigger>
                          <SelectContent>
                            {timeSlots.map((slot) => (
                              <SelectItem key={slot.value} value={slot.value}>
                                {slot.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {day.workoutType === 'rest' && (
                      <div className="text-center py-4 text-muted-foreground">
                        <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-2">
                          <CheckCircle className="h-6 w-6" />
                        </div>
                        <p className="text-sm">יום מנוחה מתוכנן</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Weekly Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Workout Summary */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Dumbbell className="h-5 w-5 text-fitness-primary" />
                    סיכום אימונים
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>ימי אימון:</span>
                    <span className="font-medium">{workoutDays.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ימי מנוחה:</span>
                    <span className="font-medium">{restDays.length}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>אימון A:</span>
                      <span>{weeklyPlan.filter(d => d.workoutType === 'A').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>אימון B:</span>
                      <span>{weeklyPlan.filter(d => d.workoutType === 'B').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>אימון C:</span>
                      <span>{weeklyPlan.filter(d => d.workoutType === 'C').length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Time Distribution */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-fitness-primary" />
                    התפלגות שעות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {timeSlots.slice(1).map(slot => {
                    const count = workoutDays.filter(d => d.preferredTime === slot.value).length;
                    return count > 0 ? (
                      <div key={slot.value} className="flex justify-between text-sm">
                        <span>{slot.label}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ) : null;
                  })}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-fitness-primary" />
                    פעולות מהירות
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Set a balanced weekly plan
                      const balancedPlan = [...weeklyPlan];
                      balancedPlan[0].workoutType = 'A'; // Sunday
                      balancedPlan[1].workoutType = 'rest'; // Monday
                      balancedPlan[2].workoutType = 'B'; // Tuesday
                      balancedPlan[3].workoutType = 'rest'; // Wednesday  
                      balancedPlan[4].workoutType = 'C'; // Thursday
                      balancedPlan[5].workoutType = 'rest'; // Friday
                      balancedPlan[6].workoutType = 'rest'; // Saturday
                      setWeeklyPlan(balancedPlan);
                      toast({
                        title: 'תוכנית מאוזנת הוגדרה',
                        description: '3 אימונים ו-4 ימי מנוחה',
                      });
                    }}
                  >
                    הגדר תוכנית מאוזנת
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => {
                      // Set preferred times to evening for all workout days
                      const updatedPlan = weeklyPlan.map(day => ({
                        ...day,
                        preferredTime: day.workoutType && day.workoutType !== 'rest' && day.workoutType !== 'none' ? 'evening' : day.preferredTime
                      }));
                      setWeeklyPlan(updatedPlan);
                      toast({
                        title: 'הגדרת שעות ערב',
                        description: 'כל האימונים הוגדרו לשעות הערב',
                      });
                    }}
                  >
                    הגדר ערב לכל האימונים
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Schedule View */}
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>לוח השבוע</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyPlan.map((day) => (
                    <div key={day.day} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <span className="font-medium w-16">{day.dayHebrew}</span>
                        <Badge className={getWorkoutTypeColor(day.workoutType)}>
                          {getWorkoutTypeLabel(day.workoutType)}
                        </Badge>
                      </div>
                      {day.preferredTime && day.preferredTime !== 'none' && (day.workoutType === 'A' || day.workoutType === 'B' || day.workoutType === 'C') && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {getTimeLabel(day.preferredTime)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WeeklyPlanner;