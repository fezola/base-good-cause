// Dynamic Campaign Page - Shows individual campaigns
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CampaignHeader } from '@/components/CampaignHeader';
import { CampaignProgress } from '@/components/CampaignProgress';
import { ContributeButton } from '@/components/ContributeButton';
import { ContributorsList } from '@/components/ContributorsList';
import { StatsCards } from '@/components/StatsCards';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Share2, Copy } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Campaign Not Found</h1>
          <p className="text-gray-600 mb-6">The campaign you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.min((campaign.raised / campaign.goal) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-4xl mx-auto">
          {/* Campaign Header */}
          <CampaignHeader
            title={campaign.title}
            description={campaign.description}
            location={campaign.location}
            duration="Ongoing"
            beneficiaries={campaign.beneficiaries}
          />

          {/* Stats Cards */}
          <StatsCards
            totalRaised={campaign.raised}
            totalContributors={campaign.contributors}
            averageContribution={campaign.contributors > 0 ? campaign.raised / campaign.contributors : 0}
            goal={campaign.goal}
          />

          {/* Progress */}
          <CampaignProgress
            raised={campaign.raised}
            goal={campaign.goal}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Contribution Section */}
            <div className="bg-card rounded-lg p-8 shadow-elevation text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Ready to Make a Difference?
                </h3>
                <p className="text-muted-foreground">
                  Join {campaign.contributors} other supporters in funding this campaign
                </p>
              </div>
              
              <ContributeButton
                amount={1}
                onContribute={handleContribute}
                className="w-full max-w-md mx-auto"
                recipientAddress={campaign.recipientAddress}
                testnet={BASE_PAY_CONFIG.TESTNET}
              />
            </div>

            {/* Contributors List */}
            <ContributorsList contributors={contributors} />
          </div>
        </div>
      </main>
    </div>
  );
}
