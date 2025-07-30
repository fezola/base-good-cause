// Professional Campaign Creation - Step-by-Step Wizard
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  DollarSign,
  Target,
  MapPin,
  Users,
  Heart,
  CheckCircle,
  Info,
  Camera,
  FileText,
  Settings
} from 'lucide-react';
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
  videoUrl?: string;
  mediaFiles?: File[];
}

export function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<CampaignData>({
    title: '',
    description: '',
    goal: 1000,
    location: '',
    beneficiaries: 1,
    category: 'education',
    recipientAddress: '',
    imageUrl: '',
    videoUrl: '',
    mediaFiles: []
  });

  const totalSteps = 4;

  const steps = [
    {
      number: 1,
      title: 'Campaign Basics',
      description: 'Tell us about your campaign',
      icon: FileText
    },
    {
      number: 2,
      title: 'Campaign Details',
      description: 'Add more information',
      icon: Info
    },
    {
      number: 3,
      title: 'Goals & Location',
      description: 'Set your funding goal',
      icon: Target
    },
    {
      number: 4,
      title: 'Review & Launch',
      description: 'Review and publish',
      icon: CheckCircle
    }
  ];

  const categories = [
    { value: 'education', label: 'Education', description: 'Schools, scholarships, learning' },
    { value: 'health', label: 'Health & Medical', description: 'Medical bills, treatments, wellness' },
    { value: 'community', label: 'Community', description: 'Local projects, neighborhood improvements' },
    { value: 'environment', label: 'Environment', description: 'Conservation, sustainability, green projects' },
    { value: 'technology', label: 'Technology', description: 'Innovation, digital access, tech education' },
    { value: 'arts', label: 'Arts & Culture', description: 'Creative projects, cultural preservation' },
    { value: 'emergency', label: 'Emergency', description: 'Disaster relief, urgent needs' },
    { value: 'other', label: 'Other', description: 'Other meaningful causes' }
  ];

  const handleInputChange = (field: keyof CampaignData, value: string | number | File[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      // Filter for images and videos only
      const validFiles = fileArray.filter(file =>
        file.type.startsWith('image/') || file.type.startsWith('video/')
      );

      if (validFiles.length !== fileArray.length) {
        toast({
          title: "Invalid Files",
          description: "Only image and video files are allowed.",
          variant: "destructive",
          duration: 3000,
        });
      }

      setFormData(prev => ({
        ...prev,
        mediaFiles: [...(prev.mediaFiles || []), ...validFiles]
      }));
    }
  };

  const removeMediaFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      mediaFiles: prev.mediaFiles?.filter((_, i) => i !== index) || []
    }));
  };

  const generateCampaignId = () => {
    return Math.random().toString(36).substring(2, 15);
  };

  // Get or create a creator ID for this browser
  const getCreatorId = () => {
    let creatorId = localStorage.getItem('basefunded_creator_id');
    if (!creatorId) {
      creatorId = `creator_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('basefunded_creator_id', creatorId);
    }
    return creatorId;
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
        status: 'active',
        creatorId: getCreatorId()
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

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.title.trim() && formData.category;
      case 2:
        return formData.description.trim();
      case 3:
        return formData.goal > 0 && formData.location.trim() && formData.recipientAddress.trim();
      case 4:
        return true;
      default:
        return false;
    }
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
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">Create Campaign</h1>
              <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
            </div>
            <div className="w-24"></div> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.number;
              const isCompleted = currentStep > step.number;

              return (
                <div key={step.number} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200
                      ${isActive
                        ? 'bg-gray-900 border-gray-900 text-white'
                        : isCompleted
                          ? 'bg-success border-success text-success-foreground'
                          : 'bg-secondary border-border text-muted-foreground'
                      }
                    `}>
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <div className="mt-2 text-center">
                      <div className={`text-sm font-medium ${isActive ? 'text-gray-900' : isCompleted ? 'text-success' : 'text-muted-foreground'}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-muted-foreground hidden sm:block">
                        {step.description}
                      </div>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`
                      flex-1 h-0.5 mx-4 transition-all duration-200
                      ${isCompleted ? 'bg-success' : 'bg-border'}
                    `} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-elevated bg-white p-8">
          {currentStep === 1 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Let's start with the basics
                </h2>
                <p className="text-muted-foreground text-lg">
                  Tell us about your campaign and what category it fits into
                </p>
              </div>

              <div className="space-y-8">
                {/* Campaign Title */}
                <div className="space-y-3">
                  <Label htmlFor="title" className="form-label">Campaign Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Help Build a Community Center"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    maxLength={100}
                    className="form-input text-lg"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                {/* Category Selection */}
                <div className="space-y-3">
                  <Label className="form-label">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger className="w-full h-12">
                      <SelectValue placeholder="Select a category for your campaign" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{category.label}</span>
                            <span className="text-xs text-muted-foreground">{category.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Choose the category that best describes your campaign
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Tell your story
                </h2>
                <p className="text-muted-foreground text-lg">
                  Help people understand why your campaign matters
                </p>
              </div>

              <div className="space-y-8">
                {/* Description */}
                <div className="space-y-3">
                  <Label htmlFor="description" className="form-label">Campaign Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell people about your campaign. What are you raising money for? How will it make a difference? Be specific about how the funds will be used."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    maxLength={1000}
                    className="form-input text-base"
                  />
                  <p className="text-sm text-muted-foreground">
                    {formData.description.length}/1000 characters
                  </p>
                </div>

                {/* Media Upload */}
                <div className="space-y-3">
                  <Label className="form-label">Add Photos & Videos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="media-upload"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer">
                      <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <div className="text-lg font-medium text-foreground mb-2">
                        Upload Photos & Videos
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Click to browse or drag and drop files here
                      </div>
                      <div className="text-xs text-muted-foreground mt-2">
                        Supports: JPG, PNG, GIF, MP4, MOV (Max 10MB each)
                      </div>
                    </label>
                  </div>

                  {/* Media Preview */}
                  {formData.mediaFiles && formData.mediaFiles.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                      {formData.mediaFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <div className="aspect-square bg-secondary rounded-lg overflow-hidden">
                            {file.type.startsWith('image/') ? (
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Upload ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <video
                                src={URL.createObjectURL(file)}
                                className="w-full h-full object-cover"
                                controls={false}
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeMediaFile(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            ×
                          </button>
                          <div className="text-xs text-muted-foreground mt-1 truncate">
                            {file.name}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Set your goal and details
                </h2>
                <p className="text-muted-foreground text-lg">
                  How much do you need to raise and where are you located?
                </p>
              </div>

              <div className="space-y-8">

                {/* Funding Goal */}
                <div className="space-y-3">
                  <Label htmlFor="goal" className="form-label">Funding Goal (USD) *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="goal"
                      type="number"
                      placeholder="1000"
                      value={formData.goal}
                      onChange={(e) => handleInputChange('goal', parseInt(e.target.value) || 0)}
                      className="pl-12 form-input text-lg"
                      min="1"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Set a realistic goal that covers your needs
                  </p>
                </div>

                {/* Location */}
                <div className="space-y-3">
                  <Label htmlFor="location" className="form-label">Location *</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="e.g., San Francisco, CA"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="pl-12 form-input"
                    />
                  </div>
                </div>

                {/* Beneficiaries */}
                <div className="space-y-3">
                  <Label htmlFor="beneficiaries" className="form-label">Number of Beneficiaries</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="beneficiaries"
                      type="number"
                      placeholder="10"
                      value={formData.beneficiaries}
                      onChange={(e) => handleInputChange('beneficiaries', parseInt(e.target.value) || 1)}
                      className="pl-12 form-input"
                      min="1"
                    />
                  </div>
                </div>

                {/* Recipient Address */}
                <div className="space-y-3">
                  <Label htmlFor="recipientAddress" className="form-label">Recipient Wallet Address *</Label>
                  <Input
                    id="recipientAddress"
                    placeholder="0x..."
                    value={formData.recipientAddress}
                    onChange={(e) => handleInputChange('recipientAddress', e.target.value)}
                    className="form-input font-mono"
                  />
                  <p className="text-sm text-muted-foreground">
                    The wallet address where funds will be sent
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Review your campaign
                </h2>
                <p className="text-muted-foreground text-lg">
                  Make sure everything looks good before publishing
                </p>
              </div>

              <div className="card-elevated bg-secondary p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Campaign Title</h3>
                  <p className="text-muted-foreground">{formData.title}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-muted-foreground">{formData.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Goal</h3>
                    <p className="text-muted-foreground">${formData.goal.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">Category</h3>
                    <p className="text-muted-foreground">{categories.find(c => c.value === formData.category)?.label}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Location</h3>
                  <p className="text-muted-foreground">{formData.location}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8 border-t border-border">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}
              </span>
            </div>

            {currentStep < totalSteps ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="bg-gray-900 hover:bg-gray-800 text-white flex items-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleCreateCampaign}
                disabled={isCreating || !isStepValid()}
                className="btn-success flex items-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Heart className="w-4 h-4" />
                    <span>Launch Campaign</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
