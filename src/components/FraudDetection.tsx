import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  AlertTriangle, 
  Flag, 
  Shield, 
  Eye, 
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Campaign } from '@/lib/supabase';

interface FraudScore {
  overall_score: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  flags: FraudFlag[];
  last_updated: string;
}

interface FraudFlag {
  type: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  auto_detected: boolean;
}

interface CampaignReport {
  id: string;
  campaign_id: string;
  reporter_id: string;
  reason: string;
  category: string;
  description: string;
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  created_at: string;
}

interface FraudDetectionProps {
  campaign: Campaign;
  className?: string;
}

export function FraudDetection({ campaign, className = "" }: FraudDetectionProps) {
  const [fraudScore, setFraudScore] = useState<FraudScore | null>(null);
  const [reports, setReports] = useState<CampaignReport[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({
    reason: '',
    category: '',
    description: ''
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    analyzeFraudRisk();
    loadReports();
  }, [campaign.id]);

  const analyzeFraudRisk = async () => {
    try {
      // Simulate fraud detection algorithm
      const flags: FraudFlag[] = [];
      let riskScore = 0;

      // Check for suspicious patterns
      const progress = (campaign.raised / campaign.goal) * 100;
      const daysOld = Math.floor((Date.now() - new Date(campaign.created_at).getTime()) / (1000 * 60 * 60 * 24));

      // Flag 1: Unrealistic goals
      if (campaign.goal > 500000) {
        flags.push({
          type: 'high_goal',
          severity: 'medium',
          description: 'Campaign has an unusually high funding goal',
          auto_detected: true
        });
        riskScore += 20;
      }

      // Flag 2: Rapid funding (potential fake contributions)
      if (progress > 50 && daysOld <= 2) {
        flags.push({
          type: 'rapid_funding',
          severity: 'high',
          description: 'Campaign received significant funding very quickly',
          auto_detected: true
        });
        riskScore += 40;
      }

      // Flag 3: Incomplete campaign information
      if (!campaign.image_url || campaign.description.length < 100) {
        flags.push({
          type: 'incomplete_info',
          severity: 'low',
          description: 'Campaign lacks sufficient details or media',
          auto_detected: true
        });
        riskScore += 10;
      }

      // Flag 4: Suspicious location patterns
      const suspiciousLocations = ['Unknown', 'N/A', 'Test', 'Sample'];
      if (suspiciousLocations.some(loc => campaign.location.toLowerCase().includes(loc.toLowerCase()))) {
        flags.push({
          type: 'suspicious_location',
          severity: 'medium',
          description: 'Campaign location appears suspicious or incomplete',
          auto_detected: true
        });
        riskScore += 25;
      }

      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical';
      if (riskScore >= 70) riskLevel = 'critical';
      else if (riskScore >= 50) riskLevel = 'high';
      else if (riskScore >= 30) riskLevel = 'medium';
      else riskLevel = 'low';

      setFraudScore({
        overall_score: riskScore,
        risk_level: riskLevel,
        flags,
        last_updated: new Date().toISOString()
      });

    } catch (error) {
      console.error('Failed to analyze fraud risk:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_reports')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  };

  const submitReport = async () => {
    if (!user || !reportData.reason || !reportData.category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('campaign_reports')
        .insert({
          campaign_id: campaign.id,
          reporter_id: user.id,
          reason: reportData.reason,
          category: reportData.category,
          description: reportData.description,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      setReports([data, ...reports]);
      setReportData({ reason: '', category: '', description: '' });
      setShowReportForm(false);

      toast({
        title: "✅ Report Submitted",
        description: "Thank you for reporting. We'll investigate this campaign.",
        duration: 3000
      });

    } catch (error) {
      console.error('Failed to submit report:', error);
      toast({
        title: "❌ Report Failed",
        description: "Could not submit report. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getRiskBadge = () => {
    if (!fraudScore) return null;

    const badges = {
      low: { color: 'bg-green-500', text: 'Low Risk', icon: CheckCircle },
      medium: { color: 'bg-yellow-500', text: 'Medium Risk', icon: AlertTriangle },
      high: { color: 'bg-orange-500', text: 'High Risk', icon: Flag },
      critical: { color: 'bg-red-500', text: 'Critical Risk', icon: XCircle }
    };

    const badge = badges[fraudScore.risk_level];
    const IconComponent = badge.icon;

    return (
      <Badge className={`${badge.color} text-white flex items-center space-x-1`}>
        <IconComponent className="w-3 h-3" />
        <span>{badge.text}</span>
      </Badge>
    );
  };

  const reportCategories = [
    { value: 'fraud', label: 'Fraudulent Campaign' },
    { value: 'misleading', label: 'Misleading Information' },
    { value: 'inappropriate', label: 'Inappropriate Content' },
    { value: 'spam', label: 'Spam or Duplicate' },
    { value: 'copyright', label: 'Copyright Violation' },
    { value: 'other', label: 'Other' }
  ];

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
            <span>Trust & Safety</span>
          </div>
          {getRiskBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Fraud Risk Analysis */}
        {fraudScore && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Risk Assessment</span>
                <span className="text-sm text-gray-500">
                  Score: {fraudScore.overall_score}/100
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    fraudScore.risk_level === 'critical' ? 'bg-red-500' :
                    fraudScore.risk_level === 'high' ? 'bg-orange-500' :
                    fraudScore.risk_level === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${fraudScore.overall_score}%` }}
                />
              </div>
            </div>

            {/* Risk Flags */}
            {fraudScore.flags.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Detected Issues:</h4>
                {fraudScore.flags.map((flag, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800">{flag.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {flag.severity} severity
                        </Badge>
                        {flag.auto_detected && (
                          <Badge variant="outline" className="text-xs">
                            Auto-detected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Report Campaign */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium">Report This Campaign</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReportForm(!showReportForm)}
              className="flex items-center space-x-2"
            >
              <Flag className="w-4 h-4" />
              <span>Report</span>
            </Button>
          </div>

          {showReportForm && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={reportData.category} onValueChange={(value) => setReportData({ ...reportData, category: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Report category" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <input
                  type="text"
                  placeholder="Brief reason"
                  value={reportData.reason}
                  onChange={(e) => setReportData({ ...reportData, reason: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <Textarea
                placeholder="Detailed description (optional)"
                value={reportData.description}
                onChange={(e) => setReportData({ ...reportData, description: e.target.value })}
                rows={3}
              />

              <div className="flex space-x-2">
                <Button
                  onClick={submitReport}
                  disabled={submitting}
                  size="sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReportForm(false)}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Recent Reports */}
          {reports.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium mb-2">Recent Reports ({reports.length})</h5>
              <div className="space-y-2">
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="text-xs p-2 bg-gray-100 rounded">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{report.category}</span>
                      <Badge variant="outline" className="text-xs">
                        {report.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600 mt-1">{report.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Safety Tips */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">🛡️ Safety Tips</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Verify campaign details before contributing</li>
            <li>• Look for verified badges and social media links</li>
            <li>• Be cautious of campaigns with unrealistic goals</li>
            <li>• Report suspicious or fraudulent campaigns</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
