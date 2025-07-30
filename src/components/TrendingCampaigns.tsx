import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Flame, Clock, Users, Target, ArrowRight } from 'lucide-react';
import { Campaign } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface TrendingCampaignsProps {
  campaigns: Campaign[];
  limit?: number;
  className?: string;
}

interface TrendingCampaign extends Campaign {
  trendingScore: number;
  trendingReason: string;
  trendingBadge: 'hot' | 'rising' | 'ending_soon' | 'popular';
}

export function TrendingCampaigns({ campaigns, limit = 6, className = "" }: TrendingCampaignsProps) {
  const [trendingCampaigns, setTrendingCampaigns] = useState<TrendingCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateTrendingCampaigns();
  }, [campaigns, limit]);

  const calculateTrendingCampaigns = () => {
    setLoading(true);
    
    const campaignsWithScores = campaigns.map(campaign => {
      const score = calculateTrendingScore(campaign);
      const { reason, badge } = getTrendingReason(campaign);
      
      return {
        ...campaign,
        trendingScore: score,
        trendingReason: reason,
        trendingBadge: badge
      } as TrendingCampaign;
    });

    // Sort by trending score and take top campaigns
    const sorted = campaignsWithScores
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, limit);

    setTrendingCampaigns(sorted);
    setLoading(false);
  };

  const calculateTrendingScore = (campaign: Campaign): number => {
    const now = Date.now();
    const createdTime = new Date(campaign.created_at).getTime();
    const daysOld = Math.floor((now - createdTime) / (1000 * 60 * 60 * 24));
    
    // Progress percentage
    const progress = Math.min((campaign.raised / campaign.goal) * 100, 100);
    
    // Contributors count (estimated from raised amount)
    const avgContribution = 50; // Assume average $50 contribution
    const estimatedContributors = Math.floor(campaign.raised / avgContribution);
    
    // Recency factor (newer campaigns get boost)
    const recencyFactor = Math.max(0, (30 - daysOld) / 30);
    
    // Momentum factor (campaigns with good progress get boost)
    const momentumFactor = progress / 100;
    
    // Activity factor (more contributors = more activity)
    const activityFactor = Math.min(estimatedContributors / 20, 1); // Cap at 20 contributors
    
    // Goal achievement factor (campaigns close to goal get boost)
    const achievementFactor = progress > 80 ? 1.5 : progress > 50 ? 1.2 : 1;
    
    // Calculate final score
    const score = (
      (progress * 0.3) +           // 30% weight on progress
      (recencyFactor * 0.25) +     // 25% weight on recency
      (activityFactor * 0.25) +    // 25% weight on activity
      (momentumFactor * 0.2)       // 20% weight on momentum
    ) * achievementFactor;

    return Math.round(score * 100) / 100;
  };

  const getTrendingReason = (campaign: Campaign): { reason: string; badge: 'hot' | 'rising' | 'ending_soon' | 'popular' } => {
    const progress = (campaign.raised / campaign.goal) * 100;
    const daysOld = Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const estimatedContributors = Math.floor(campaign.raised / 50);

    // Hot: High progress in short time
    if (progress > 50 && daysOld <= 7) {
      return { reason: `${progress.toFixed(0)}% funded in ${daysOld} days`, badge: 'hot' };
    }
    
    // Rising: Good momentum
    if (progress > 25 && daysOld <= 14) {
      return { reason: `Rising fast - ${progress.toFixed(0)}% funded`, badge: 'rising' };
    }
    
    // Ending Soon: Close to deadline (assuming 30 day campaigns)
    if (daysOld >= 25) {
      return { reason: `${30 - daysOld} days left`, badge: 'ending_soon' };
    }
    
    // Popular: Many contributors
    if (estimatedContributors >= 10) {
      return { reason: `${estimatedContributors}+ supporters`, badge: 'popular' };
    }
    
    // Default: Recent activity
    return { reason: `${progress.toFixed(0)}% funded`, badge: 'rising' };
  };

  const getBadgeConfig = (badge: string) => {
    switch (badge) {
      case 'hot':
        return { icon: Flame, color: 'bg-red-500 text-white', label: 'Hot' };
      case 'rising':
        return { icon: TrendingUp, color: 'bg-green-500 text-white', label: 'Rising' };
      case 'ending_soon':
        return { icon: Clock, color: 'bg-orange-500 text-white', label: 'Ending Soon' };
      case 'popular':
        return { icon: Users, color: 'bg-blue-500 text-white', label: 'Popular' };
      default:
        return { icon: TrendingUp, color: 'bg-gray-500 text-white', label: 'Trending' };
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <span>Trending Campaigns</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trendingCampaigns.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No trending campaigns yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingCampaigns.map((campaign, index) => {
                const badgeConfig = getBadgeConfig(campaign.trendingBadge);
                const IconComponent = badgeConfig.icon;
                const progress = (campaign.raised / campaign.goal) * 100;

                return (
                  <div key={campaign.id} className="group border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="space-y-4">
                      {/* Header with Ranking and Badge */}
                      <div className="flex items-center justify-between">
                        <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>

                        {/* Trending Badge */}
                        <Badge className={`${badgeConfig.color} flex items-center space-x-1`}>
                          <IconComponent className="w-3 h-3" />
                          <span>{badgeConfig.label}</span>
                        </Badge>
                      </div>

                      {/* Campaign Info */}
                      <div className="space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {campaign.title}
                          </h4>
                          <p className="text-sm text-gray-600 line-clamp-3 mt-2">
                            {campaign.description}
                          </p>
                        </div>

                        {/* Progress and Stats */}
                        <div className="space-y-3">
                          <div className="text-xs text-gray-600">
                            {campaign.trendingReason}
                          </div>

                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                              ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-500">
                              <Target className="w-3 h-3" />
                              <span>{progress.toFixed(0)}%</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{campaign.location}</span>
                            <Link to={`/campaign/${campaign.id}`}>
                              <Button size="sm" variant="outline" className="group-hover:bg-blue-50">
                                View <ArrowRight className="w-3 h-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* View All Button */}
        {trendingCampaigns.length > 0 && (
          <div className="text-center pt-4 border-t">
            <Link to="/discover">
              <Button variant="outline" className="w-full">
                View All Trending Campaigns
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}