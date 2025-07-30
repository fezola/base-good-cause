import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { RefreshCw, AlertTriangle, Loader2, DollarSign, Clock } from 'lucide-react';
import { vaultService } from '@/services/vaultService';
import { useAuth } from '@/contexts/AuthContext';

interface RefundButtonProps {
  campaignId: string;
  campaignTitle: string;
  goalAmount: number;
  raisedAmount: number;
  deadline: string;
  className?: string;
}

export function RefundButton({
  campaignId,
  campaignTitle,
  goalAmount,
  raisedAmount,
  deadline,
  className = ""
}: RefundButtonProps) {
  const { user } = useAuth();
  const [canClaimRefund, setCanClaimRefund] = useState(false);
  const [isClaimingRefund, setIsClaimingRefund] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userContribution, setUserContribution] = useState(0);
  const [campaignEnded, setCampaignEnded] = useState(false);
  const [thresholdMet, setThresholdMet] = useState(false);

  useEffect(() => {
    if (user) {
      checkRefundEligibility();
    }
  }, [campaignId, user]);

  const checkRefundEligibility = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      
      // Check if campaign has ended
      const now = new Date();
      const deadlineDate = new Date(deadline);
      const hasEnded = now > deadlineDate;
      setCampaignEnded(hasEnded);

      // Check if 70% threshold was met
      const progressPercentage = (raisedAmount / goalAmount) * 100;
      const thresholdReached = progressPercentage >= 70;
      setThresholdMet(thresholdReached);

      // Get user's contribution
      const contribution = await vaultService.getUserContribution(campaignId, user.id);
      setUserContribution(contribution);

      // Check if user can claim refund from smart contract
      // Note: This requires wallet connection, so we'll check conditions manually for now
      const canRefund = hasEnded && !thresholdReached && contribution > 0;
      setCanClaimRefund(canRefund);

    } catch (error) {
      console.error('Failed to check refund eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRefund = async () => {
    if (!user) {
      toast({
        title: "❌ Authentication Required",
        description: "Please sign in to claim refund",
        variant: "destructive",
      });
      return;
    }

    setIsClaimingRefund(true);

    try {
      const result = await vaultService.claimRefund(campaignId);

      if (result.success) {
        toast({
          title: "🎉 Refund Claimed Successfully!",
          description: `Your refund has been processed. Transaction: ${result.transactionHash?.slice(0, 10)}...`,
          duration: 8000,
        });
        
        // Refresh to show updated status
        window.location.reload();
      } else {
        throw new Error(result.error || 'Refund claim failed');
      }
    } catch (error: any) {
      console.error('Refund claim failed:', error);
      toast({
        title: "❌ Refund Claim Failed",
        description: error.message || "Failed to claim refund. Please try again.",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsClaimingRefund(false);
    }
  };

  // Don't show if user hasn't contributed
  if (!user || userContribution === 0) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Checking refund status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const progressPercentage = (raisedAmount / goalAmount) * 100;
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <RefreshCw className="w-5 h-5" />
          <span>Refund Status</span>
        </CardTitle>
        <CardDescription>
          Your contribution: ${userContribution.toFixed(2)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Campaign Status */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Campaign Progress</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="h-2 bg-blue-500 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="h-1 bg-yellow-500 rounded-full"
              style={{ width: '70%' }}
            />
          </div>
        </div>

        {/* Time Status */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Campaign Status</span>
          </span>
          <Badge variant={campaignEnded ? "destructive" : "secondary"}>
            {campaignEnded ? "Ended" : `${daysLeft} days left`}
          </Badge>
        </div>

        {/* Refund Eligibility */}
        {campaignEnded && !thresholdMet ? (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2 text-orange-700">
              <AlertTriangle className="w-4 h-4" />
              <span className="font-medium">Refund Available</span>
            </div>
            <p className="text-sm text-orange-600">
              Campaign didn't reach 70% threshold. You can claim a full refund of your contribution.
            </p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Your Contribution:</span>
                <span className="font-medium">${userContribution.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-orange-700 border-t border-orange-200 pt-1">
                <span>Refund Amount:</span>
                <span>${userContribution.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ) : campaignEnded && thresholdMet ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-700">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">Campaign Successful</span>
            </div>
            <p className="text-sm text-green-600">
              Campaign reached its funding goal. Funds have been released to the creator.
            </p>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-blue-700">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Campaign Active</span>
            </div>
            <p className="text-sm text-blue-600">
              Campaign is still active. Refunds are only available if the campaign ends without reaching 70% of its goal.
            </p>
          </div>
        )}

        {/* Refund Button */}
        {canClaimRefund && (
          <Button
            onClick={handleClaimRefund}
            disabled={isClaimingRefund}
            className="w-full bg-orange-600 hover:bg-orange-700"
            size="lg"
          >
            {isClaimingRefund ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Refund...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Claim Refund (${userContribution.toFixed(2)})
              </>
            )}
          </Button>
        )}

        {/* Security Notice */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p className="font-medium mb-1">🔒 Automatic Refund System:</p>
          <p>If campaigns don't reach 70% of their goal by the deadline, all contributors can claim automatic refunds from the smart contract vault.</p>
        </div>
      </CardContent>
    </Card>
  );
}
