import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Upload,
  Eye,
  Flag,
  Star
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Campaign } from '@/lib/supabase';

interface VerificationStatus {
  id: string;
  campaign_id: string;
  status: 'pending' | 'verified' | 'rejected' | 'under_review';
  verification_level: 'basic' | 'enhanced' | 'premium';
  documents_submitted: boolean;
  identity_verified: boolean;
  social_media_verified: boolean;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  trust_score: number;
  created_at: string;
}

interface CampaignVerificationProps {
  campaign: Campaign;
  isCreator: boolean;
  className?: string;
}

export function CampaignVerification({ campaign, isCreator, className = "" }: CampaignVerificationProps) {
  const [verification, setVerification] = useState<VerificationStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState<File[]>([]);
  const [socialLinks, setSocialLinks] = useState({
    website: '',
    facebook: '',
    twitter: '',
    instagram: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    loadVerificationStatus();
  }, [campaign.id]);

  const loadVerificationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_verifications')
        .select('*')
        .eq('campaign_id', campaign.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setVerification(data);
    } catch (error) {
      console.error('Failed to load verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitVerificationRequest = async () => {
    if (!user || !isCreator) return;

    setSubmitting(true);
    try {
      const verificationData = {
        campaign_id: campaign.id,
        status: 'pending' as const,
        verification_level: 'basic' as const,
        documents_submitted: documents.length > 0,
        identity_verified: false,
        social_media_verified: Object.values(socialLinks).some(link => link.trim()),
        trust_score: calculateInitialTrustScore(),
        social_links: socialLinks
      };

      const { data, error } = await supabase
        .from('campaign_verifications')
        .upsert(verificationData)
        .select()
        .single();

      if (error) throw error;

      setVerification(data);
      toast({
        title: "✅ Verification Submitted!",
        description: "Your verification request has been submitted for review.",
        duration: 3000
      });

    } catch (error) {
      console.error('Failed to submit verification:', error);
      toast({
        title: "❌ Submission Failed",
        description: "Could not submit verification request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const calculateInitialTrustScore = (): number => {
    let score = 50; // Base score

    // Campaign completeness
    if (campaign.description.length > 200) score += 10;
    if (campaign.image_url) score += 10;
    if (campaign.video_url) score += 15;

    // Social media presence
    const socialCount = Object.values(socialLinks).filter(link => link.trim()).length;
    score += socialCount * 5;

    // Documents
    if (documents.length > 0) score += 20;

    return Math.min(score, 100);
  };

  const getVerificationBadge = () => {
    if (!verification) return null;

    const badges = {
      pending: { icon: Clock, color: 'bg-yellow-500', text: 'Verification Pending' },
      under_review: { icon: Eye, color: 'bg-blue-500', text: 'Under Review' },
      verified: { icon: CheckCircle, color: 'bg-green-500', text: 'Verified Campaign' },
      rejected: { icon: AlertTriangle, color: 'bg-red-500', text: 'Verification Rejected' }
    };

    const badge = badges[verification.status];
    const IconComponent = badge.icon;

    return (
      <Badge className={`${badge.color} text-white flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{badge.text}</span>
      </Badge>
    );
  };

  const getTrustScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Campaign Verification</span>
          </div>
          {getVerificationBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Trust Score */}
        {verification && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Trust Score</span>
              <span className={`text-2xl font-bold ${getTrustScoreColor(verification.trust_score)}`}>
                {verification.trust_score}/100
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${
                  verification.trust_score >= 80 ? 'bg-green-500' :
                  verification.trust_score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${verification.trust_score}%` }}
              />
            </div>
          </div>
        )}

        {/* Verification Status */}
        {verification ? (
          <div className="space-y-4">
            {verification.status === 'verified' && (
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Campaign Verified</span>
                </div>
                <p className="text-sm text-green-700">
                  This campaign has been verified by our team. The creator's identity and 
                  campaign details have been confirmed.
                </p>
              </div>
            )}

            {verification.status === 'rejected' && verification.rejection_reason && (
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="font-medium text-red-800">Verification Rejected</span>
                </div>
                <p className="text-sm text-red-700">{verification.rejection_reason}</p>
              </div>
            )}

            {verification.status === 'pending' && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Verification Pending</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Your verification request is in queue. We'll review it within 2-3 business days.
                </p>
              </div>
            )}

            {/* Verification Checklist */}
            <div className="space-y-3">
              <h4 className="font-medium">Verification Checklist</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {verification.documents_submitted ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm">Documents Submitted</span>
                </div>
                <div className="flex items-center space-x-2">
                  {verification.identity_verified ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm">Identity Verified</span>
                </div>
                <div className="flex items-center space-x-2">
                  {verification.social_media_verified ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm">Social Media Verified</span>
                </div>
              </div>
            </div>
          </div>
        ) : isCreator ? (
          /* Verification Request Form */
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Get Your Campaign Verified</h4>
              <p className="text-sm text-blue-700">
                Verified campaigns receive a trust badge and are more likely to receive donations.
                Complete the verification process to build trust with potential supporters.
              </p>
            </div>

            {/* Social Media Links */}
            <div className="space-y-3">
              <Label>Social Media Links (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Website URL"
                  value={socialLinks.website}
                  onChange={(e) => setSocialLinks({ ...socialLinks, website: e.target.value })}
                />
                <Input
                  placeholder="Facebook URL"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                />
                <Input
                  placeholder="Twitter URL"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                />
                <Input
                  placeholder="Instagram URL"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                />
              </div>
            </div>

            <Button
              onClick={submitVerificationRequest}
              disabled={submitting}
              className="w-full"
            >
              {submitting ? 'Submitting...' : 'Submit Verification Request'}
            </Button>
          </div>
        ) : (
          /* Public View */
          <div className="text-center py-6">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">This campaign has not been verified yet.</p>
          </div>
        )}

        {/* Verification Benefits */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">✨ Verification Benefits</h4>
          <ul className="text-sm space-y-1 text-gray-700">
            <li>• Verified badge increases donor trust</li>
            <li>• Higher visibility in search results</li>
            <li>• Featured in verified campaigns section</li>
            <li>• Access to premium campaign tools</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
