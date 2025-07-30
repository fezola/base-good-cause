import React, { useState, useEffect } from 'react';
import { CampaignSearch } from '@/components/CampaignSearch';
import { TrendingCampaigns } from '@/components/TrendingCampaigns';
import { CompactCampaignCard } from '@/components/CompactCampaignCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Compass, TrendingUp, Search, Filter, Grid, List } from 'lucide-react';
import { Campaign } from '@/lib/supabase';
import { campaignService } from '@/services/campaignService';
import { toast } from '@/hooks/use-toast';

export function DiscoverPage() {
  const [allCampaigns, setAllCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const campaigns = await campaignService.getAllCampaigns();
      setAllCampaigns(campaigns);
      setFilteredCampaigns(campaigns);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast({
        title: "❌ Loading Failed",
        description: "Could not load campaigns. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFilteredResults = (filtered: Campaign[]) => {
    setFilteredCampaigns(filtered);
  };

  const stats = {
    total: allCampaigns.length,
    active: allCampaigns.filter(c => c.status === 'active').length,
    totalRaised: allCampaigns.reduce((sum, c) => sum + c.raised, 0),
    avgProgress: allCampaigns.length > 0 
      ? allCampaigns.reduce((sum, c) => sum + (c.raised / c.goal * 100), 0) / allCampaigns.length 
      : 0
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Compass className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Discover Campaigns</h1>
                <p className="text-gray-600">Find and support causes that matter to you</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={showSearch ? "default" : "outline"}
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Search</span>
              </Button>
              
              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Campaigns</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-sm text-gray-600">Active Campaigns</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-purple-600">${stats.totalRaised.toLocaleString()}</div>
              <div className="text-sm text-gray-600">Total Raised</div>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <div className="text-2xl font-bold text-orange-600">{stats.avgProgress.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">Avg Progress</div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Search Component */}
          {showSearch && (
            <CampaignSearch
              campaigns={allCampaigns}
              onFilteredResults={handleFilteredResults}
            />
          )}

          {/* Trending Campaigns Section */}
          <div className="space-y-6">
            <TrendingCampaigns
              campaigns={allCampaigns}
              limit={6}
            />
          </div>

          {/* Campaign Results */}
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold">
                  {filteredCampaigns.length === allCampaigns.length 
                    ? 'All Campaigns' 
                    : `Search Results (${filteredCampaigns.length})`
                  }
                </h2>
                {filteredCampaigns.length !== allCampaigns.length && (
                  <Badge variant="secondary">
                    {filteredCampaigns.length} of {allCampaigns.length}
                  </Badge>
                )}
              </div>
            </div>

            {/* Campaign Grid/List */}
            {filteredCampaigns.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No campaigns found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or browse all campaigns
                </p>
                <Button onClick={() => setFilteredCampaigns(allCampaigns)}>
                  Show All Campaigns
                </Button>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                  : "space-y-4"
              }>
                {filteredCampaigns.map((campaign) => (
                  <CompactCampaignCard
                    key={campaign.id}
                    campaign={campaign}
                  />
                ))}
              </div>
            )}

            {/* Load More Button */}
            {filteredCampaigns.length > 0 && filteredCampaigns.length >= 12 && (
              <div className="text-center mt-8">
                <Button variant="outline" size="lg">
                  Load More Campaigns
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
