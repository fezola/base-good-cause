// Campaigns Listing Page - Browse all campaigns
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Plus, Search, MapPin, Users, Target, Calendar } from 'lucide-react';

interface Campaign {
  id: string;
  title: string;
  description: string;
  goal: number;
  location: string;
  beneficiaries: number;
  category: string;
  recipientAddress: string;
  createdAt: string;
  raised: number;
  contributors: number;
  status: string;
}

export function CampaignsListing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'education', label: '🎓 Education' },
    { value: 'health', label: '🏥 Health & Medical' },
    { value: 'community', label: '🏘️ Community' },
    { value: 'environment', label: '🌱 Environment' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'arts', label: '🎨 Arts & Culture' },
    { value: 'emergency', label: '🚨 Emergency' },
    { value: 'other', label: '📋 Other' }
  ];

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, selectedCategory]);

  const loadCampaigns = () => {
    try {
      const savedCampaigns = JSON.parse(localStorage.getItem('basefunded_campaigns') || '[]');
      setCampaigns(savedCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(campaign => campaign.category === selectedCategory);
    }

    setFilteredCampaigns(filtered);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryEmoji = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      education: '🎓',
      health: '🏥',
      community: '🏘️',
      environment: '🌱',
      technology: '💻',
      arts: '🎨',
      emergency: '🚨',
      other: '📋'
    };
    return categoryMap[category] || '📋';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Browse Campaigns</h1>
              <p className="text-gray-600 mt-1">Discover and support amazing causes</p>
            </div>
            
            <Link to="/create">
              <Button size="lg" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Create Campaign</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[200px]"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Campaigns Found</h2>
            <p className="text-gray-600 mb-6">
              {campaigns.length === 0 
                ? "No campaigns have been created yet. Be the first to start a campaign!"
                : "Try adjusting your search or filter criteria."
              }
            </p>
            <Link to="/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Campaign
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCampaigns.map((campaign) => {
              const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
              
              return (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        {getCategoryEmoji(campaign.category)} {campaign.category}
                      </Badge>
                      <div className="text-xs text-muted-foreground flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatDate(campaign.createdAt)}
                      </div>
                    </div>
                    
                    <CardTitle className="text-lg line-clamp-2">
                      {campaign.title}
                    </CardTitle>
                    
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {campaign.description}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">${campaign.raised} raised</span>
                        <span className="text-muted-foreground">of ${campaign.goal}</span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {progressPercentage.toFixed(1)}% funded
                      </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-1" />
                        {campaign.contributors} supporters
                      </div>
                      {campaign.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {campaign.location}
                        </div>
                      )}
                    </div>
                    
                    {/* Action Button */}
                    <Link to={`/campaign/${campaign.id}`} className="block">
                      <Button className="w-full" variant="outline">
                        <Target className="h-4 w-4 mr-2" />
                        View Campaign
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
