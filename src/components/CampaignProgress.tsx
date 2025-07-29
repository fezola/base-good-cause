import { Progress } from "@/components/ui/progress";

interface CampaignProgressProps {
  raised: number;
  goal: number;
  className?: string;
}

export function CampaignProgress({ raised, goal, className }: CampaignProgressProps) {
  const percentage = Math.min((raised / goal) * 100, 100);
  const remaining = Math.max(goal - raised, 0);

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-3">
        <div className="text-sm font-medium text-muted-foreground">
          Progress
        </div>
        <div className="text-sm font-medium text-muted-foreground">
          {percentage.toFixed(1)}% funded
        </div>
      </div>
      
      <div className="relative">
        <Progress 
          value={percentage} 
          className="h-3 bg-secondary shadow-inner"
        />
        <div 
          className="absolute inset-0 bg-gradient-success rounded-full transition-all duration-1000 ease-out animate-progress-fill shadow-success"
          style={{ 
            width: `${percentage}%`,
            '--progress-width': `${percentage}%`
          } as React.CSSProperties}
        />
      </div>
      
      <div className="flex justify-between items-center mt-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            ${raised.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">raised</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            ${goal.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">goal</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            ${remaining.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">to go</div>
        </div>
      </div>
    </div>
  );
}