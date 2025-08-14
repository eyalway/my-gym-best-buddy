import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, User, Target, Clock, Scale, Save, Loader2 } from 'lucide-react';

const Profile = () => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    fitness_goals: '',
    weight_goal: '',
    preferred_workout_time: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        fitness_goals: profile.fitness_goals || '',
        weight_goal: profile.weight_goal?.toString() || '',
        preferred_workout_time: profile.preferred_workout_time || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        fitness_goals: formData.fitness_goals,
        weight_goal: formData.weight_goal ? parseFloat(formData.weight_goal) : null,
        preferred_workout_time: formData.preferred_workout_time,
      });

      if (error) {
        toast({
          title: 'שגיאה בעדכון הפרופיל',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'הפרופיל עודכן בהצלחה! ✅',
          description: 'השינויים נשמרו במערכת',
        });
      }
    } catch (error) {
      toast({
        title: 'שגיאה בעדכון הפרופיל',
        description: 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-fitness-primary/20">
              <User className="h-6 w-6 text-fitness-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">הפרופיל שלי</h1>
              <p className="text-muted-foreground">ערוך את הפרטים האישיים שלך</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה לבית
          </Button>
        </div>

        {/* Profile Form */}
        <Card className="bg-card/80 backdrop-blur-sm border-fitness-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-fitness-primary" />
              פרטים אישיים
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">שם מלא</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="השם המלא שלך"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fitness_goals">יעדי כושר</Label>
                  <Textarea
                    id="fitness_goals"
                    value={formData.fitness_goals}
                    onChange={(e) => handleInputChange('fitness_goals', e.target.value)}
                    placeholder="תאר את יעדי הכושר שלך (לדוגמה: לרדת במשקל, לבנות שרירים, לשפר כושר אירובי...)"
                    rows={3}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight_goal">יעד משקל (ק״ג)</Label>
                    <div className="relative">
                      <Scale className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="weight_goal"
                        type="number"
                        value={formData.weight_goal}
                        onChange={(e) => handleInputChange('weight_goal', e.target.value)}
                        placeholder="75"
                        className="pr-10"
                        min="30"
                        max="200"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="preferred_workout_time">זמן אימון מועדף</Label>
                    <Select
                      value={formData.preferred_workout_time}
                      onValueChange={(value) => handleInputChange('preferred_workout_time', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר זמן מועדף" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="morning">בוקר (6:00-10:00)</SelectItem>
                        <SelectItem value="afternoon">צהריים (10:00-16:00)</SelectItem>
                        <SelectItem value="evening">ערב (16:00-20:00)</SelectItem>
                        <SelectItem value="night">לילה (20:00-24:00)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button 
                  type="submit" 
                  className="bg-fitness-primary hover:bg-fitness-primary/90 gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      שמור שינויים
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">פרטי חשבון</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">אימייל:</span>
              <span className="font-medium">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-muted-foreground">תאריך הצטרפות:</span>
              <span className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString('he-IL') : 'לא זמין'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;