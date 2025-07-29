import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, Users } from "lucide-react";

interface CampaignHeaderProps {
  title: string;
  description: string;
  location?: string;
  duration?: string;
  beneficiaries?: number;
  className?: string;
}

export function CampaignHeader({ 
  title, 
  description, 
  location, 
  duration,
  beneficiaries,
  className 
}: CampaignHeaderProps) {
  return (
    <Card className={`p-8 shadow-elevation bg-gradient-to-br from-card to-muted/20 ${className}`}>
      <div className="space-y-6">
        {/* Status Badge */}
        <div className="flex justify-between items-start">
          <Badge className="bg-success/10 text-success border-success/20 hover:bg-success/20">
            🟢 Active Campaign
          </Badge>
          <Badge variant="outline" className="text-xs">
            Base Chain
          </Badge>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-4">
            {title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* Campaign Details */}
        <div className="flex flex-wrap gap-6 pt-4">
          {location && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{location}</span>
            </div>
          )}
          
          {duration && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{duration}</span>
            </div>
          )}
          
          {beneficiaries && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">{beneficiaries} beneficiaries</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}