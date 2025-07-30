// My Campaigns Page - Track campaigns you've created
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernHeader } from '@/components/ModernHeader';
import {
  Plus,
  Eye,
  Edit,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Heart,
  Settings
} from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  contributors: number;
  category: string;
  location: string;
  createdAt: string;
  status: 'active' | 'paused' | 'completed';
  creatorId: string;
}

export function MyCampaigns() {
  const [myCampaigns, setMyCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Get or create a creator ID for this browser
  const getCreatorId = () => {
    let creatorId = localStorage.getItem('basefunded_creator_id');
    if (!creatorId) {
      creatorId = `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('basefunded_creator_id', creatorId);
    }
    return creatorId;
  };

  useEffect(() => {
    loadMyCampaigns();
  }, []);

  const loadMyCampaigns = () => {
    try {
      const creatorId = getCreatorId();
      const allCampaigns = JSON.parse(localStorage.getItem('basefunded_campaigns') || '[]');
      
      // Filter campaigns created by this user
      const userCampaigns = allCampaigns.filter((campaign: Campaign) => 
        campaign.creatorId === creatorId
      );
      
      setMyCampaigns(userCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'paused': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <ModernHeader showSearch={false} />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ModernHeader showSearch={false} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
            <p className="text-muted-foreground mt-2">
              Manage and track your fundraising campaigns
            </p>
          </div>
          <Link to="/create">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </Link>
        </div>

        {myCampaigns.length === 0 ? (
          // Empty State
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No Campaigns Yet
            </h2>
            <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
              Start your first campaign and begin making a difference in your community
            </p>
            <Link to="/create">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                <Plus className="w-5 h-5 mr-2" />
                Create Your First Campaign
              </Button>
            </Link>
          </div>
        ) : (
          // Campaigns Grid
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCampaigns.map((campaign) => {
              const progressPercentage = getProgressPercentage(campaign.raised, campaign.goal);
              
              return (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <Badge className={`${getStatusColor(campaign.status)} text-xs font-medium`}>
                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                      </Badge>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Settings className="w-4 h-4" />
                      </Button>
                    </div>
                    <CardTitle className="text-lg line-clamp-2">{campaign.title}</CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {campaign.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="font-medium">{formatCurrency(campaign.raised)}</span>
                        <span className="text-muted-foreground">of {formatCurrency(campaign.goal)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {progressPercentage.toFixed(0)}% funded
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{campaign.contributors} supporters</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{new Date(campaign.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/campaign/${campaign.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </Link>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Summary Stats */}
        {myCampaigns.length > 0 && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-foreground mb-2">
                  {myCampaigns.length}
                </div>
                <div className="text-sm text-muted-foreground">Total Campaigns</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatCurrency(myCampaigns.reduce((sum, c) => sum + c.raised, 0))}
                </div>
                <div className="text-sm text-muted-foreground">Total Raised</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {myCampaigns.reduce((sum, c) => sum + c.contributors, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Supporters</div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
