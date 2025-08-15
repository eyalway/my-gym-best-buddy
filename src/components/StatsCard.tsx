import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  gradient?: boolean;
}

export const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  gradient = false 
}: StatsCardProps) => {
  return (
    <Card className={`${
      gradient 
        ? "bg-gradient-to-br from-fitness-primary/20 to-fitness-secondary/20 border-fitness-primary/30" 
        : "bg-card/50 backdrop-blur-sm border-border/50"
    } hover:scale-105 transition-all duration-300 hover:shadow-lg`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between rtl-flex">
          <div className="hebrew-text">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-full ${
            gradient 
              ? "bg-fitness-primary/20 text-fitness-primary" 
              : "bg-secondary text-secondary-foreground"
          }`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};