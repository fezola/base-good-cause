// Professional Campaign Page - GoFundMe-inspired Design
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CampaignHeader } from '@/components/CampaignHeader';
import { CampaignProgress } from '@/components/CampaignProgress';
import { ContributeButton } from '@/components/ContributeButton';
import { ContributorsList } from '@/components/ContributorsList';
import { StatsCards } from '@/components/StatsCards';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  Share2,
  Copy,
  Heart,
  MapPin,
  Calendar,
  Users,
  Shield,
  Flag,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { BASE_PAY_CONFIG } from '@/config/basePay';

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

interface PaymentResult {
  success: boolean;
  id?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  userInfo?: any;
}

export function CampaignPage() {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [contributors, setContributors] = useState<any[]>([]);

  useEffect(() => {
    loadCampaign();
  }, [campaignId]);

  const loadCampaign = () => {
    try {
      const campaigns = JSON.parse(localStorage.getItem('basefunded_campaigns') || '[]');
      const foundCampaign = campaigns.find((c: Campaign) => c.id === campaignId);

      if (foundCampaign) {
        setCampaign(foundCampaign);

        // Load contributors for this campaign
        const allContributors = JSON.parse(localStorage.getItem('basefunded_contributors') || '[]');
        const campaignContributors = allContributors.filter((c: any) => c.campaignId === campaignId);
        setContributors(campaignContributors);
      }
    } catch (error) {
      console.error('Failed to load campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContribute = async (result: PaymentResult) => {
    if (!campaign || !result.success) return;

    try {
      // Create contributor record
      const contributor = {
        id: Date.now().toString(),
        campaignId: campaign.id,
        amount: 5, // Default contribution amount
        address: campaign.recipientAddress, // Placeholder - in real app this would be the payer's address
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        timestamp: new Date().toISOString(),
        userInfo: result.userInfo
      };

      // Save contributor
      const existingContributors = JSON.parse(localStorage.getItem('basefunded_contributors') || '[]');
      existingContributors.push(contributor);
      localStorage.setItem('basefunded_contributors', JSON.stringify(existingContributors));

      // Update campaign totals
      const updatedCampaign = {
        ...campaign,
        raised: campaign.raised + 5,
        contributors: campaign.contributors + 1
      };

      // Update campaigns list
      const campaigns = JSON.parse(localStorage.getItem('basefunded_campaigns') || '[]');
      const updatedCampaigns = campaigns.map((c: Campaign) =>
          c.id === campaign.id ? updatedCampaign : c
      );
      localStorage.setItem('basefunded_campaigns', JSON.stringify(updatedCampaigns));

      // Update local state
      setCampaign(updatedCampaign);
      setContributors(prev => [...prev, contributor]);

      console.log('✅ Campaign updated:', {
        newTotal: updatedCampaign.raised,
        totalContributors: updatedCampaign.contributors,
        transactionHash: result.transactionHash
      });

    } catch (error) {
      console.error('❌ Failed to update campaign:', error);
      toast({
        title: "⚠️ Update Failed",
        description: "Payment succeeded but failed to update campaign. Please refresh the page.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: campaign?.title,
          text: `Help support: ${campaign?.title}`,
          url: url
        });
      } catch (error) {
        // Fallback to copy
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "📋 Link Copied!",
        description: "Campaign link copied to clipboard",
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: "❌ Copy Failed",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading campaign...</p>
          </div>
        </div>
    );
  }

  if (!campaign) {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-destructive-light rounded-full flex items-center justify-center mx-auto mb-6">
              <Flag className="w-12 h-12 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist or has been removed.</p>
            <Link to="/">
              <Button size="lg" className="bg-gray-900 hover:bg-gray-800 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
    );
  }

  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const daysAgo = Math.floor((Date.now() - new Date(campaign.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      education: 'bg-gray-100 text-gray-700 border-gray-200',
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

  return (
      <div className="min-h-screen bg-background">
        {/* Professional Header */}
        <header className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors duration-200">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Campaigns</span>
              </Link>

              <div className="flex items-center space-x-3">
                <Button
                    onClick={handleShare}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share Campaign</span>
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 text-muted-foreground"
                >
                  <Flag className="h-4 w-4" />
                  <span className="hidden sm:inline">Report</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Campaign Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Campaign Hero */}
              <div className="card-elevated bg-white p-8">
                {/* Category and Status */}
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="secondary"
                    className={`${getCategoryColor(campaign.category)} text-sm font-medium border`}
                  >
                    {campaign.category}
                  </Badge>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-success" />
                    <span className="text-sm text-success font-medium">Verified Campaign</span>
                  </div>
                </div>

                {/* Title and Description */}
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4 leading-tight">
                  {campaign.title}
                </h1>

                <div className="flex items-center space-x-6 text-muted-foreground mb-6">
                  {campaign.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{campaign.location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Created {daysAgo === 0 ? 'today' : `${daysAgo} days ago`}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{campaign.beneficiaries} beneficiaries</span>
                  </div>
                </div>

                <p className="text-muted-foreground text-lg leading-relaxed">
                  {campaign.description}
                </p>
              </div>

              {/* Campaign Story Section */}
              <div className="card-elevated bg-white p-8">
                <h2 className="text-2xl font-bold text-foreground mb-6">Campaign Story</h2>
                <div className="prose prose-lg max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    This campaign aims to make a meaningful difference in the community.
                    Every contribution, no matter the size, helps us get closer to our goal
                    and creates lasting positive impact.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Your support means everything to us and to those who will benefit from this campaign.
                    Together, we can achieve something truly remarkable.
                  </p>
                </div>
              </div>

              {/* Trust & Safety */}
              <div className="card-elevated bg-white p-8">
                <h3 className="text-xl font-bold text-foreground mb-4">Trust & Safety</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-success-light rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Verified Campaign</div>
                      <div className="text-sm text-muted-foreground">Identity confirmed</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Secure Payments</div>
                      <div className="text-sm text-muted-foreground">Blockchain protected</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contributors */}
              {contributors.length > 0 && (
                <div className="card-elevated bg-white p-8">
                  <h3 className="text-xl font-bold text-foreground mb-6">Recent Supporters</h3>
                  <ContributorsList contributors={contributors} />
                </div>
              )}
            </div>

            {/* Right Column - Donation Panel */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Progress Card */}
                <div className="card-elevated bg-white p-6">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-foreground mb-1">
                      {formatCurrency(campaign.raised)}
                    </div>
                    <div className="text-muted-foreground">
                      raised of {formatCurrency(campaign.goal)} goal
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="progress-bar mb-4">
                    <div
                      className="progress-fill"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-foreground">{campaign.contributors}</div>
                      <div className="text-sm text-muted-foreground">supporters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-success">{progressPercentage.toFixed(0)}%</div>
                      <div className="text-sm text-muted-foreground">funded</div>
                    </div>
                  </div>

                  {/* Contribution Button */}
                  <ContributeButton
                      onContribute={handleContribute}
                      className="w-full text-lg py-4"
                      recipientAddress={campaign.recipientAddress}
                      testnet={BASE_PAY_CONFIG.TESTNET}
                  />

                  <div className="text-center mt-4">
                    <p className="text-sm text-muted-foreground">
                      Secure donation powered by Base blockchain
                    </p>
                  </div>
                </div>

                {/* Share Card */}
                <div className="card-elevated bg-white p-6">
                  <h3 className="font-bold text-foreground mb-4">Share this campaign</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Help spread the word and reach more supporters
                  </p>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Campaign
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
  );
}