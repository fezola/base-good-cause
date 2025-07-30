import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Search, Filter, MapPin, Target, Calendar, TrendingUp, X } from 'lucide-react';
import { Campaign } from '@/lib/supabase';

interface SearchFilters {
  query: string;
  category: string;
  location: string;
  goalRange: [number, number];
  progressRange: [number, number];
  sortBy: string;
  status: string;
}

interface CampaignSearchProps {
  campaigns: Campaign[];
  onFilteredResults: (filtered: Campaign[]) => void;
  className?: string;
}

export function CampaignSearch({ campaigns, onFilteredResults, className = "" }: CampaignSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    category: 'all',
    location: '',
    goalRange: [100, 100000],
    progressRange: [0, 100],
    sortBy: 'recent',
    status: 'all'
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'education', label: 'Education' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'community', label: 'Community' },
    { value: 'environment', label: 'Environment' },
    { value: 'technology', label: 'Technology' },
    { value: 'arts', label: 'Arts & Culture' },
    { value: 'sports', label: 'Sports' },
    { value: 'emergency', label: 'Emergency' }
  ];

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'trending', label: 'Trending' },
    { value: 'goal_high', label: 'Highest Goal' },
    { value: 'goal_low', label: 'Lowest Goal' },
    { value: 'progress_high', label: 'Most Progress' },
    { value: 'progress_low', label: 'Least Progress' },
    { value: 'ending_soon', label: 'Ending Soon' }
  ];

  useEffect(() => {
    filterCampaigns();
  }, [filters, campaigns]);

  const filterCampaigns = () => {
    let filtered = [...campaigns];

    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(query) ||
        campaign.description.toLowerCase().includes(query) ||
        campaign.location.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(campaign => campaign.category === filters.category);
    }

    // Location filter
    if (filters.location.trim()) {
      const location = filters.location.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.location.toLowerCase().includes(location)
      );
    }

    // Goal range filter
    filtered = filtered.filter(campaign =>
      campaign.goal >= filters.goalRange[0] && campaign.goal <= filters.goalRange[1]
    );

    // Progress range filter
    filtered = filtered.filter(campaign => {
      const progress = (campaign.raised / campaign.goal) * 100;
      return progress >= filters.progressRange[0] && progress <= filters.progressRange[1];
    });

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(campaign => campaign.status === filters.status);
    }

    // Sort campaigns
    filtered = sortCampaigns(filtered, filters.sortBy);

    onFilteredResults(filtered);
    updateActiveFilters();
  };

  const sortCampaigns = (campaigns: Campaign[], sortBy: string): Campaign[] => {
    switch (sortBy) {
      case 'trending':
        return campaigns.sort((a, b) => {
          const aScore = calculateTrendingScore(a);
          const bScore = calculateTrendingScore(b);
          return bScore - aScore;
        });
      case 'goal_high':
        return campaigns.sort((a, b) => b.goal - a.goal);
      case 'goal_low':
        return campaigns.sort((a, b) => a.goal - b.goal);
      case 'progress_high':
        return campaigns.sort((a, b) => (b.raised / b.goal) - (a.raised / a.goal));
      case 'progress_low':
        return campaigns.sort((a, b) => (a.raised / a.goal) - (b.raised / b.goal));
      case 'ending_soon':
        return campaigns.sort((a, b) => {
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          return aTime - bTime; // Oldest first (ending soon)
        });
      case 'recent':
      default:
        return campaigns.sort((a, b) => {
          const aTime = new Date(a.created_at).getTime();
          const bTime = new Date(b.created_at).getTime();
          return bTime - aTime; // Newest first
        });
    }
  };

  const calculateTrendingScore = (campaign: Campaign): number => {
    const progress = (campaign.raised / campaign.goal) * 100;
    const daysOld = Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24));
    const contributors = campaign.contributors || 0;
    
    // Trending score based on progress, recency, and contributor count
    return (progress * 0.4) + ((30 - Math.min(daysOld, 30)) * 0.3) + (contributors * 0.3);
  };

  const updateActiveFilters = () => {
    const active: string[] = [];
    
    if (filters.query.trim()) active.push(`Search: "${filters.query}"`);
    if (filters.category !== 'all') {
      const categoryLabel = categories.find(c => c.value === filters.category)?.label;
      active.push(`Category: ${categoryLabel}`);
    }
    if (filters.location.trim()) active.push(`Location: ${filters.location}`);
    if (filters.goalRange[0] !== 100 || filters.goalRange[1] !== 100000) {
      active.push(`Goal: $${filters.goalRange[0].toLocaleString()} - $${filters.goalRange[1].toLocaleString()}`);
    }
    if (filters.progressRange[0] !== 0 || filters.progressRange[1] !== 100) {
      active.push(`Progress: ${filters.progressRange[0]}% - ${filters.progressRange[1]}%`);
    }
    if (filters.status !== 'all') active.push(`Status: ${filters.status}`);
    
    setActiveFilters(active);
  };

  const clearAllFilters = () => {
    setFilters({
      query: '',
      category: 'all',
      location: '',
      goalRange: [100, 100000],
      progressRange: [0, 100],
      sortBy: 'recent',
      status: 'all'
    });
  };

  const removeFilter = (filterText: string) => {
    if (filterText.startsWith('Search:')) {
      setFilters({ ...filters, query: '' });
    } else if (filterText.startsWith('Category:')) {
      setFilters({ ...filters, category: 'all' });
    } else if (filterText.startsWith('Location:')) {
      setFilters({ ...filters, location: '' });
    } else if (filterText.startsWith('Goal:')) {
      setFilters({ ...filters, goalRange: [100, 100000] });
    } else if (filterText.startsWith('Progress:')) {
      setFilters({ ...filters, progressRange: [0, 100] });
    } else if (filterText.startsWith('Status:')) {
      setFilters({ ...filters, status: 'all' });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Search & Filter Campaigns</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Filter className="w-4 h-4 mr-2" />
            {showAdvanced ? 'Hide' : 'Show'} Filters
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search campaigns..."
            value={filters.query}
            onChange={(e) => setFilters({ ...filters, query: e.target.value })}
            className="pl-10 h-9"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2">
          <Select value={filters.category} onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.sortBy} onValueChange={(value) => setFilters({ ...filters, sortBy: value })}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Location Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Filter by location..."
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Campaign status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Goal Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Goal Range: ${filters.goalRange[0].toLocaleString()} - ${filters.goalRange[1].toLocaleString()}
              </label>
              <Slider
                value={filters.goalRange}
                onValueChange={(value) => setFilters({ ...filters, goalRange: value as [number, number] })}
                min={100}
                max={100000}
                step={100}
                className="w-full"
              />
            </div>

            {/* Progress Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Progress Range: {filters.progressRange[0]}% - {filters.progressRange[1]}%
              </label>
              <Slider
                value={filters.progressRange}
                onValueChange={(value) => setFilters({ ...filters, progressRange: value as [number, number] })}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilters.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Filters:</span>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{filter}</span>
                  <button
                    onClick={() => removeFilter(filter)}
                    className="ml-1 hover:bg-gray-300 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
