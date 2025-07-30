import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, DollarSign, Calendar, Target, Clock } from 'lucide-react';
import { vaultService } from '@/services/vaultService';
import { Campaign } from '@/lib/supabase';

interface CampaignAnalyticsProps {
  campaign: Campaign;
  className?: string;
}

interface AnalyticsData {
  progressPercentage: number;
  daysLeft: number;
  averageContribution: number;
  contributionsToday: number;
  canWithdraw: boolean;
  withdrawalThreshold: number;
}

export function CampaignAnalytics({ campaign, className = "" }: CampaignAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [contributions, setContributions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [campaign.id]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Get campaign status
      const status = await vaultService.getCampaignStatus(campaign.id);
      
      // Get contributions
      const campaignContributions = await vaultService.getCampaignContributions(campaign.id);
      setContributions(campaignContributions);

      // Calculate analytics
      const progressPercentage = status.progressPercentage;
      const withdrawalThreshold = 70;
      
      // Calculate days left using actual campaign duration
      const createdDate = new Date(campaign.created_at);
      const campaignDuration = campaign.duration || 30; // Default to 30 days if not set
      const endDate = new Date(createdDate.getTime() + (campaignDuration * 24 * 60 * 60 * 1000));
      const now = new Date();
      const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

      // Calculate average contribution
      const totalContributions = campaignContributions.length;
      const averageContribution = totalContributions > 0 ? campaign.raised / totalContributions : 0;

      // Calculate contributions today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const contributionsToday = campaignContributions.filter(contrib => {
        const contribDate = new Date(contrib.created_at);
        return contribDate >= today;
      }).length;

      setAnalytics({
        progressPercentage,
        daysLeft,
        averageContribution,
        contributionsToday,
        canWithdraw: status.canWithdraw,
        withdrawalThreshold
      });

    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  const progressColor = analytics.progressPercentage >= 70 ? 'bg-green-500' : 
                       analytics.progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-blue-500';

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Main Progress Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="w-5 h-5" />
            <span>Campaign Progress</span>
          </CardTitle>
          <CardDescription>
            Track your campaign's performance and milestones
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Goal</span>
              <span className="font-medium">{analytics.progressPercentage.toFixed(1)}%</span>
            </div>
            <Progress value={analytics.progressPercentage} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${campaign.raised.toLocaleString()} raised</span>
              <span>${campaign.goal.toLocaleString()} goal</span>
            </div>
          </div>

          {/* Withdrawal Threshold */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Withdrawal Threshold (70%)</span>
              <Badge variant={analytics.canWithdraw ? "default" : "secondary"}>
                {analytics.canWithdraw ? "Available" : "Not Reached"}
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 bg-yellow-500 rounded-full"
                style={{ width: '70%' }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Need ${((campaign.goal * 0.7) - campaign.raised).toFixed(2)} more to withdraw
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Raised */}
        <Card className="min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-3 h-3 text-green-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-600 truncate">Raised</span>
            </div>
            <p className="text-lg font-bold text-green-600 truncate">
              ${campaign.raised.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        {/* Contributors */}
        <Card className="min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Users className="w-3 h-3 text-blue-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-600 truncate">Contributors</span>
            </div>
            <p className="text-lg font-bold text-blue-600">
              {contributions.length}
            </p>
          </CardContent>
        </Card>

        {/* Average Contribution */}
        <Card className="min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-3 h-3 text-purple-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-600 truncate">Average</span>
            </div>
            <p className="text-lg font-bold text-purple-600 truncate">
              ${analytics.averageContribution.toFixed(0)}
            </p>
          </CardContent>
        </Card>

        {/* Days Left */}
        <Card className="min-w-0">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2 mb-1">
              <Clock className="w-3 h-3 text-orange-600 flex-shrink-0" />
              <span className="text-xs font-medium text-gray-600 truncate">Days Left</span>
            </div>
            <p className="text-lg font-bold text-orange-600">
              {analytics.daysLeft}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {contributions.length > 0 ? (
            <div className="space-y-3">
              {contributions.slice(0, 5).map((contribution, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">${contribution.amount}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(contribution.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{contribution.status}</Badge>
                </div>
              ))}
              {contributions.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  And {contributions.length - 5} more contributions...
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">No contributions yet</p>
              <p className="text-sm text-muted-foreground">Share your campaign to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
