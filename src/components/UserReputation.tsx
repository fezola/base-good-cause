import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Star, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle,
  Shield,
  Heart,
  Target
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface UserReputationData {
  user_id: string;
  reputation_score: number;
  reputation_level: 'new' | 'trusted' | 'verified' | 'champion';
  campaigns_created: number;
  campaigns_funded: number;
  total_raised: number;
  total_contributed: number;
  successful_campaigns: number;
  badges: ReputationBadge[];
  created_at: string;
  updated_at: string;
}

interface ReputationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned_at: string;
}

interface UserReputationProps {
  userId: string;
  showDetailed?: boolean;
  className?: string;
}

export function UserReputation({ userId, showDetailed = false, className = "" }: UserReputationProps) {
  const [reputation, setReputation] = useState<UserReputationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserReputation();
  }, [userId]);

  const loadUserReputation = async () => {
    try {
      // Get or create user reputation
      let { data: existingReputation, error } = await supabase
        .from('user_reputations')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Create new reputation record
        const newReputation = await calculateUserReputation(userId);
        const { data: createdReputation, error: createError } = await supabase
          .from('user_reputations')
          .insert(newReputation)
          .select()
          .single();

        if (createError) throw createError;
        setReputation(createdReputation);
      } else if (error) {
        throw error;
      } else {
        setReputation(existingReputation);
      }
    } catch (error) {
      console.error('Failed to load user reputation:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUserReputation = async (userId: string) => {
    // Get user's campaigns
    const { data: campaigns } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId);

    // Get user's contributions
    const { data: contributions } = await supabase
      .from('contributions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    const campaignsCreated = campaigns?.length || 0;
    const campaignsFunded = contributions?.length || 0;
    const totalRaised = campaigns?.reduce((sum, c) => sum + c.raised, 0) || 0;
    const totalContributed = contributions?.reduce((sum, c) => sum + c.amount, 0) || 0;
    const successfulCampaigns = campaigns?.filter(c => c.raised >= c.goal * 0.7).length || 0;

    // Calculate reputation score
    let score = 0;
    score += campaignsCreated * 10; // 10 points per campaign created
    score += successfulCampaigns * 25; // 25 bonus points for successful campaigns
    score += campaignsFunded * 5; // 5 points per contribution made
    score += Math.floor(totalRaised / 100) * 2; // 2 points per $100 raised
    score += Math.floor(totalContributed / 50) * 1; // 1 point per $50 contributed

    // Determine reputation level
    let level: 'new' | 'trusted' | 'verified' | 'champion';
    if (score >= 500) level = 'champion';
    else if (score >= 200) level = 'verified';
    else if (score >= 50) level = 'trusted';
    else level = 'new';

    // Calculate badges
    const badges = calculateBadges({
      campaignsCreated,
      campaignsFunded,
      totalRaised,
      totalContributed,
      successfulCampaigns
    });

    return {
      user_id: userId,
      reputation_score: score,
      reputation_level: level,
      campaigns_created: campaignsCreated,
      campaigns_funded: campaignsFunded,
      total_raised: totalRaised,
      total_contributed: totalContributed,
      successful_campaigns: successfulCampaigns,
      badges: badges
    };
  };

  const calculateBadges = (stats: any): ReputationBadge[] => {
    const badges: ReputationBadge[] = [];
    const now = new Date().toISOString();

    if (stats.campaignsCreated >= 1) {
      badges.push({
        id: 'first_campaign',
        name: 'Campaign Creator',
        description: 'Created your first campaign',
        icon: 'target',
        earned_at: now
      });
    }

    if (stats.campaignsFunded >= 5) {
      badges.push({
        id: 'supporter',
        name: 'Supporter',
        description: 'Contributed to 5+ campaigns',
        icon: 'heart',
        earned_at: now
      });
    }

    if (stats.successfulCampaigns >= 1) {
      badges.push({
        id: 'successful_creator',
        name: 'Successful Creator',
        description: 'Successfully funded a campaign',
        icon: 'award',
        earned_at: now
      });
    }

    if (stats.totalRaised >= 1000) {
      badges.push({
        id: 'fundraiser',
        name: 'Fundraiser',
        description: 'Raised over $1,000',
        icon: 'trending-up',
        earned_at: now
      });
    }

    if (stats.totalContributed >= 500) {
      badges.push({
        id: 'generous_donor',
        name: 'Generous Donor',
        description: 'Contributed over $500',
        icon: 'star',
        earned_at: now
      });
    }

    return badges;
  };

  const getReputationBadge = () => {
    if (!reputation) return null;

    const badges = {
      new: { color: 'bg-gray-500', text: 'New User', icon: Users },
      trusted: { color: 'bg-blue-500', text: 'Trusted User', icon: CheckCircle },
      verified: { color: 'bg-green-500', text: 'Verified User', icon: Shield },
      champion: { color: 'bg-purple-500', text: 'Champion', icon: Award }
    };

    const badge = badges[reputation.reputation_level];
    const IconComponent = badge.icon;

    return (
      <Badge className={`${badge.color} text-white flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{badge.text}</span>
      </Badge>
    );
  };

  const getBadgeIcon = (iconName: string) => {
    const icons = {
      target: Target,
      heart: Heart,
      award: Award,
      'trending-up': TrendingUp,
      star: Star
    };
    return icons[iconName as keyof typeof icons] || Star;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!reputation) {
    return null;
  }

  if (!showDetailed) {
    // Compact view for campaign cards
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <Star className="w-3 h-3 text-yellow-500" />
          <span className="text-xs font-medium">{reputation.reputation_score}</span>
        </div>
        {getReputationBadge()}
      </div>
    );
  }

  // Detailed view for profile/campaign pages
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>User Reputation</span>
          </div>
          {getReputationBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Reputation Score */}
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {reputation.reputation_score}
          </div>
          <div className="text-sm text-gray-600">Reputation Points</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{reputation.campaigns_created}</div>
            <div className="text-xs text-blue-700">Campaigns Created</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{reputation.successful_campaigns}</div>
            <div className="text-xs text-green-700">Successful Campaigns</div>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">${reputation.total_raised.toLocaleString()}</div>
            <div className="text-xs text-purple-700">Total Raised</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">{reputation.campaigns_funded}</div>
            <div className="text-xs text-orange-700">Campaigns Supported</div>
          </div>
        </div>

        {/* Badges */}
        {reputation.badges && reputation.badges.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Achievements</h4>
            <div className="grid grid-cols-1 gap-2">
              {reputation.badges.map((badge) => {
                const IconComponent = getBadgeIcon(badge.icon);
                return (
                  <div key={badge.id} className="flex items-center space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <IconComponent className="w-4 h-4 text-yellow-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{badge.name}</div>
                      <div className="text-xs text-gray-600">{badge.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trust Indicators */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-3 rounded-lg">
          <h4 className="font-medium text-sm mb-2">Trust Indicators</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span>Account Age</span>
              <span className="font-medium">
                {Math.floor((Date.now() - new Date(reputation.created_at).getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Success Rate</span>
              <span className="font-medium">
                {reputation.campaigns_created > 0 
                  ? Math.round((reputation.successful_campaigns / reputation.campaigns_created) * 100)
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Community Impact</span>
              <span className="font-medium">
                ${(reputation.total_raised + reputation.total_contributed).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
