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
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800" />
      <div className="fixed inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        {/* Dark Header */}
        <header className="bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link to="/" className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Back to Home</span>
              </Link>
              <h1 className="text-2xl font-bold text-white">Create Campaign</h1>
              <div className="w-24"></div> {/* Spacer for centering */}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-gray-900 rounded-xl border border-gray-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5" />
              <div className="relative z-10 p-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Start Your Fundraising Campaign
                  </h2>
                  <p className="text-gray-300">
                    Create a campaign to raise funds for your cause using Base Pay
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Campaign Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Campaign Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Fund Web3 Dev School in Lagos"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      maxLength={100}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400">
                      {formData.title.length}/100 characters
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Tell people about your campaign. What are you raising money for? How will it make a difference?"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      maxLength={500}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400">
                      {formData.description.length}/500 characters
                    </p>
                  </div>

                  {/* Goal and Category Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="goal" className="text-white">Funding Goal (USDC) *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="goal"
                          type="number"
                          placeholder="100"
                          value={formData.goal}
                          onChange={(e) => handleInputChange('goal', parseInt(e.target.value) || 0)}
                          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                          min="1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">Category</Label>
                      <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md text-sm focus:border-blue-500 focus:outline-none"
                      >
                        {categories.map(cat => (
                          <option key={cat.value} value={cat.value} className="bg-gray-800">
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location and Beneficiaries Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-white">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="location"
                          placeholder="e.g., Lagos, Nigeria"
                          value={formData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="beneficiaries" className="text-white">Number of Beneficiaries</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="beneficiaries"
                          type="number"
                          placeholder="50"
                          value={formData.beneficiaries}
                          onChange={(e) => handleInputChange('beneficiaries', parseInt(e.target.value) || 1)}
                          className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recipient Address */}
                  <div className="space-y-2">
                    <Label htmlFor="recipientAddress" className="text-white">Recipient Wallet Address *</Label>
                    <Input
                      id="recipientAddress"
                      placeholder="0x..."
                      value={formData.recipientAddress}
                      onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                      className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-400">
                  The wallet address where funds will be sent
                </p>
              </div>

                  {/* Create Button */}
                  <Button
                    onClick={handleCreateCampaign}
                    disabled={isCreating}
                    className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
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
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
