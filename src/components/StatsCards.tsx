import { Card } from "@/components/ui/card";
import { TrendingUp, Heart, Zap } from "lucide-react";

interface StatsCardsProps {
  totalContributors: number;
  averageContribution: number;
  timeRemaining: string;
  className?: string;
}

export function StatsCards({ 
  totalContributors, 
  averageContribution, 
  timeRemaining, 
  className 
}: StatsCardsProps) {
  const stats = [
    {
      icon: Heart,
      label: "Contributors",
      value: totalContributors.toString(),
      description: "amazing supporters",
      color: "text-success"
    },
    {
      icon: TrendingUp,
      label: "Avg. Contribution",
      value: `$${averageContribution}`,
      description: "per supporter",
      color: "text-primary"
    },
    {
      icon: Zap,
      label: "Time Remaining",
      value: timeRemaining,
      description: "to reach goal",
      color: "text-muted-foreground"
    }
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`}>
      {stats.map((stat, index) => (
        <Card key={index} className="p-6 shadow-elevation hover:shadow-glow transition-all duration-300 group">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-muted/30 group-hover:bg-muted/50 transition-colors ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            
            <div className="flex-1">
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
              <div className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}