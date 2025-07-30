// Professional Campaign Card - GoFundMe-inspired Design
import { Link } from 'react-router-dom';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Clock, Heart } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  location: string;
  category: string;
  raised: number;
  contributors: number;
  createdAt: string;
}

interface CompactCampaignCardProps {
  campaign: Campaign;
}

export function CompactCampaignCard({ campaign }: CompactCampaignCardProps) {
  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const daysAgo = Math.floor((Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const getCategoryColor = (category: string) => {
    const colors = {
      education: 'bg-blue-100 text-blue-700 border-blue-200',
      health: 'bg-red-100 text-red-700 border-red-200',
      community: 'bg-green-100 text-green-700 border-green-200',
      environment: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      technology: 'bg-purple-100 text-purple-700 border-purple-200',
      arts: 'bg-pink-100 text-pink-700 border-pink-200',
      emergency: 'bg-orange-100 text-orange-700 border-orange-200',
      other: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Link to={`/campaign/${campaign.id}`}>
      <div className="card-interactive bg-white border border-card-border rounded-xl overflow-hidden">
        {/* Campaign Image Placeholder */}
        <div className="relative h-40 sm:h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/20 rounded-full flex items-center justify-center">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          </div>
          {/* Category Badge */}
          <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
            <Badge
              variant="secondary"
              className={`${getCategoryColor(campaign.category)} text-xs font-medium border`}
            >
              {campaign.category}
            </Badge>
          </div>
          {/* Time Badge */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-medium">
              {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Title */}
          <h3 className="font-semibold text-foreground text-base sm:text-lg mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {campaign.title}
          </h3>

          {/* Description */}
          <p className="text-muted-foreground text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2 leading-relaxed">
            {campaign.description}
          </p>

          {/* Location */}
          {campaign.location && (
            <div className="flex items-center space-x-1 mb-4">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{campaign.location}</span>
            </div>
          )}

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-lg font-bold text-foreground">
                {formatCurrency(campaign.raised)}
              </span>
              <span className="text-sm text-muted-foreground">
                of {formatCurrency(campaign.goal)}
              </span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm font-medium text-success">
                {progressPercentage.toFixed(0)}% funded
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.max(0, Math.ceil((campaign.goal - campaign.raised) / (campaign.raised / Math.max(1, daysAgo))))} days left
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {campaign.contributors} supporter{campaign.contributors !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Support</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
