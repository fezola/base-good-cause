// Create Campaign Page - GoFundMe Style
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, DollarSign, Target, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CampaignData {
  title: string;
  description: string;
  goal: number;
  location: string;
  beneficiaries: number;
  category: string;
  recipientAddress: string;
  imageUrl?: string;
}

export function CreateCampaign() {
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CampaignData>({
    title: '',
    description: '',
    goal: 100,
    location: '',
    beneficiaries: 1,
    category: 'education',
    recipientAddress: '',
    imageUrl: ''
  });

  const categories = [
    { value: 'education', label: '🎓 Education' },
    { value: 'health', label: '🏥 Health & Medical' },
    { value: 'community', label: '🏘️ Community' },
    { value: 'environment', label: '🌱 Environment' },
    { value: 'technology', label: '💻 Technology' },
    { value: 'arts', label: '🎨 Arts & Culture' },
    { value: 'emergency', label: '🚨 Emergency' },
    { value: 'other', label: '📋 Other' }
  ];

  const handleInputChange = (field: keyof CampaignData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateCampaignId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  const handleCreateCampaign = async () => {
    // Validation
    if (!formData.title.trim()) {
      toast({
        title: "❌ Missing Title",
        description: "Please enter a campaign title",
        variant: "destructive"
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "❌ Missing Description", 
        description: "Please enter a campaign description",
        variant: "destructive"
      });
      return;
    }

    if (!formData.recipientAddress.trim()) {
      toast({
        title: "❌ Missing Wallet Address",
        description: "Please enter the recipient wallet address",
        variant: "destructive"
      });
      return;
    }

    if (formData.goal < 1) {
      toast({
        title: "❌ Invalid Goal",
        description: "Goal must be at least $1",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);

    try {
      // Generate unique campaign ID
      const campaignId = generateCampaignId();
      
      // Save campaign to localStorage (in real app, this would be a database)
      const campaign = {
        id: campaignId,
        ...formData,
        createdAt: new Date().toISOString(),
        raised: 0,
        contributors: 0,
        status: 'active'
      };

      // Get existing campaigns
      const existingCampaigns = JSON.parse(localStorage.getItem('basefunded_campaigns') || '[]');
      existingCampaigns.push(campaign);
      localStorage.setItem('basefunded_campaigns', JSON.stringify(existingCampaigns));

      toast({
        title: "🎉 Campaign Created!",
        description: "Your campaign is now live and ready to receive contributions",
        duration: 5000
      });

      // Navigate to the new campaign
      navigate(`/campaign/${campaignId}`);

    } catch (error) {
      console.error('Failed to create campaign:', error);
      toast({
        title: "❌ Creation Failed",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Start Your Fundraising Campaign
              </CardTitle>
              <p className="text-center text-muted-foreground">
                Create a campaign to raise funds for your cause using Base Pay
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Campaign Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Campaign Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Fund Web3 Dev School in Lagos"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.title.length}/100 characters
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Tell people about your campaign. What are you raising money for? How will it make a difference?"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground">
                  {formData.description.length}/500 characters
                </p>
              </div>

              {/* Goal and Category Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goal">Funding Goal (USDC) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="goal"
                      type="number"
                      placeholder="100"
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', parseInt(e.target.value) || 0)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location and Beneficiaries Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="e.g., Lagos, Nigeria"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="beneficiaries">Number of Beneficiaries</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="beneficiaries"
                      type="number"
                      placeholder="50"
                      value={formData.beneficiaries}
                      onChange={(e) => handleInputChange('beneficiaries', parseInt(e.target.value) || 1)}
                      className="pl-10"
                      min="1"
                    />
                  </div>
                </div>
              </div>

              {/* Recipient Address */}
              <div className="space-y-2">
                <Label htmlFor="recipientAddress">Recipient Wallet Address *</Label>
                <Input
                  id="recipientAddress"
                  placeholder="0x..."
                  value={formData.recipientAddress}
                  onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  The wallet address where funds will be sent
                </p>
              </div>

              {/* Create Button */}
              <Button
                onClick={handleCreateCampaign}
                disabled={isCreating}
                className="w-full h-12 text-lg"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2" />
                    Creating Campaign...
                  </>
                ) : (
                  <>
                    <Target className="h-5 w-5 mr-2" />
                    Create Campaign
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
