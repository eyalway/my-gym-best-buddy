import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import WorkoutTimer from '@/components/WorkoutTimer';
import { ArrowRight, Timer } from 'lucide-react';

const TimerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-fitness-primary/5 via-background to-fitness-secondary/5 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-fitness-primary/20">
              <Timer className="h-6 w-6 text-fitness-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">טיימר אימון</h1>
              <p className="text-muted-foreground">נהל את זמני האימון והמנוחה שלך</p>
            </div>
          </div>
          <Button variant="ghost" onClick={() => navigate('/')}>
            <ArrowRight className="w-4 h-4 ml-2" />
            חזרה לבית
          </Button>
        </div>

        {/* Timer Component */}
        <WorkoutTimer />
      </div>
    </div>
  );
};

export default TimerPage;