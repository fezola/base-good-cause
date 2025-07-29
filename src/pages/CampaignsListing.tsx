// Campaigns Listing Page - Modern Mobile-First Design
import { useState, useEffect } from 'react';
import { LoadingScreen } from '@/components/LoadingScreen';
import { ModernHeader } from '@/components/ModernHeader';
import { CompactCampaignCard } from '@/components/CompactCampaignCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

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
  const [showLoading, setShowLoading] = useState(true);

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
    return <LoadingScreen onComplete={() => setShowLoading(false)} />;
  }

  if (loading) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 text-sm">Loading campaigns...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Modern Header */}
        <ModernHeader onSearch={handleSearch} />

        {/* Category Filter */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(cat => (
                  <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`
                  px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors
                  ${selectedCategory === cat.value
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                `}
                  >
                    {cat.label}
                  </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-6">
          {filteredCampaigns.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🚀</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {campaigns.length === 0 ? "Start Something Amazing" : "No Results Found"}
                </h2>
                <p className="text-gray-600 mb-6 text-sm">
                  {campaigns.length === 0
                      ? "Be the first to create a campaign and make a difference"
                      : "Try adjusting your search or browse different categories"
                  }
                </p>
                <Link to="/create">
                  <Button className="bg-gradient-to-r from-blue-600 to-blue-700">
                    Create Campaign
                  </Button>
                </Link>
              </div>
          ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCampaigns.map((campaign) => (
                    <CompactCampaignCard key={campaign.id} campaign={campaign} />
                ))}
              </div>
          )}
        </main>
      </div>
  );
}