// Professional Campaigns Listing - GoFundMe-inspired Design
import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ModernHeader } from '@/components/ModernHeader';
import { CompactCampaignCard } from '@/components/CompactCampaignCard';
import { TrendingCampaigns } from '@/components/TrendingCampaigns';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { TrendingUp, Users, Heart, Shield, ArrowRight, Star, Filter } from 'lucide-react';
import { campaignService } from '@/services/campaignService';
import { Campaign } from '@/lib/supabase';

// Using Campaign interface from Supabase

export function CampaignsListing() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  // Only show loading screen on first visit
  const [showLoading, setShowLoading] = useState(() => {
    const hasSeenLoading = localStorage.getItem('fundme_has_seen_loading');
    return !hasSeenLoading;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'education', label: 'Education' },
    { value: 'health', label: 'Health & Medical' },
    { value: 'community', label: 'Community' },
    { value: 'environment', label: 'Environment' },
    { value: 'technology', label: 'Technology' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, selectedCategory]);

  const loadCampaigns = async () => {
    try {
      const supabaseCampaigns = await campaignService.getCampaigns();
      setCampaigns(supabaseCampaigns);
    } catch (error) {
      console.error('Failed to load campaigns from Supabase:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchTerm(query);
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

  if (showLoading) {
    return <LoadingScreen onComplete={() => {
      localStorage.setItem('fundme_has_seen_loading', 'true');
      setShowLoading(false);
    }} />;
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground text-sm">Loading campaigns...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-background">
        {/* Professional Header */}
        <ModernHeader onSearch={handleSearch} />

        {/* Hero Section */}
        <section className="relative bg-gray-900 text-white py-12 sm:py-16 lg:py-32 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-6 sm:mb-8">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 sm:px-4 py-2 mb-4 sm:mb-6">
                <Heart className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" />
                <span className="text-xs sm:text-sm font-medium">Trusted by thousands of supporters</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight px-2">
              Fund What
              <span className="block text-white">
                Matters Most
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-200 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4">
              Join a community of changemakers. Discover meaningful campaigns, support causes you care about,
              and help make a lasting difference in communities around the world.
            </p>

            <div className="flex justify-center mb-8 sm:mb-12 px-4">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 font-semibold px-4 sm:px-8 py-3 sm:py-4 text-sm sm:text-lg backdrop-blur-sm w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                Learn How It Works
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">$2.5M+</div>
                <div className="text-gray-300 text-sm">Raised for causes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">10K+</div>
                <div className="text-gray-300 text-sm">Active supporters</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold mb-1">500+</div>
                <div className="text-gray-300 text-sm">Successful campaigns</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Indicators */}
        <section className="bg-white py-12 border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-success-light rounded-full flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-success" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Secure & Trusted</h3>
                <p className="text-muted-foreground">Your donations are protected with blockchain security</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Community Driven</h3>
                <p className="text-muted-foreground">Join thousands of supporters making a difference</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-warning-light rounded-full flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-warning" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Transparent Impact</h3>
                <p className="text-muted-foreground">Track exactly how your contributions are used</p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Campaigns Section */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Campaigns</h2>
              <Link to="/discover">
                <Button variant="outline" className="flex items-center space-x-2">
                  <span>Discover More</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredCampaigns.slice(0, 4).map((campaign) => (
                <CompactCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <div className="bg-white border-b border-border sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Filter by category:</span>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-48">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="text-sm text-muted-foreground text-center sm:text-right">
                {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
              </div>
            </div>
          </div>
        </div>



        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {filteredCampaigns.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="w-12 h-12 text-gray-600" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {campaigns.length === 0 ? "Start Something Amazing" : "No Results Found"}
                </h2>
                <p className="text-muted-foreground mb-8 text-lg max-w-md mx-auto">
                  {campaigns.length === 0
                      ? "Be the first to create a campaign and make a difference in your community"
                      : "Try adjusting your search or browse different categories to find campaigns"
                  }
                </p>
              </div>
          ) : (
              <>
                {/* Results Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-foreground">
                      {selectedCategory === 'all' ? 'All Campaigns' : categories.find(c => c.value === selectedCategory)?.label}
                    </h2>
                    <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                      {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} found
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-warning" />
                    <span className="text-sm text-muted-foreground">Featured campaigns</span>
                  </div>
                </div>

                {/* Campaigns Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCampaigns.map((campaign) => (
                      <CompactCampaignCard key={campaign.id} campaign={campaign} />
                  ))}
                </div>

                {/* Load More Button */}
                {filteredCampaigns.length >= 9 && (
                  <div className="text-center mt-12">
                    <Button variant="outline" size="lg" className="px-8">
                      Load More Campaigns
                    </Button>
                  </div>
                )}
              </>
          )}
        </main>


      </div>
  );
}