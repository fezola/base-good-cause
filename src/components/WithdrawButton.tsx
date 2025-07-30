import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Wallet, CheckCircle, AlertCircle, Loader2, DollarSign } from 'lucide-react';
import { vaultService } from '@/services/vaultService';
import { useAuth } from '@/contexts/AuthContext';

interface WithdrawButtonProps {
  campaignId: string;
  campaignTitle: string;
  goalAmount: number;
  raisedAmount: number;
  creatorAddress: string;
  className?: string;
}

export function WithdrawButton({
  campaignId,
  campaignTitle,
  goalAmount,
  raisedAmount,
  creatorAddress,
  className = ""
}: WithdrawButtonProps) {
  const { user } = useAuth();
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    checkWithdrawEligibility();
  }, [campaignId]);

  const checkWithdrawEligibility = async () => {
    try {
      setIsLoading(true);
      const canWithdrawFunds = await vaultService.canWithdrawFunds(campaignId);
      const progress = (raisedAmount / goalAmount) * 100;
      
      setCanWithdraw(canWithdrawFunds);
      setProgressPercentage(progress);
    } catch (error) {
      console.error('Failed to check withdrawal eligibility:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!user) {
      toast({
        title: "❌ Authentication Required",
        description: "Please sign in to withdraw funds",
        variant: "destructive",
      });
      return;
    }

    setIsWithdrawing(true);

    try {
      const result = await vaultService.withdrawFunds(campaignId);

      if (result.success) {
        toast({
          title: "🎉 Funds Withdrawn Successfully!",
          description: `Funds have been transferred to your wallet. Transaction: ${result.transactionHash?.slice(0, 10)}...`,
          duration: 8000,
        });
        
        // Refresh the page to show updated status
        window.location.reload();
      } else {
        throw new Error(result.error || 'Withdrawal failed');
      }
    } catch (error: any) {
      console.error('Withdrawal failed:', error);
      toast({
        title: "❌ Withdrawal Failed",
        description: error.message || "Failed to withdraw funds. Please try again.",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsWithdrawing(false);
    }
  };

  if (isLoading) {
    return (
      <Card className={`border-gray-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm text-gray-600">Checking withdrawal status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const thresholdReached = progressPercentage >= 70;
  const platformFee = raisedAmount * 0.025; // 2.5% platform fee
  const creatorAmount = raisedAmount - platformFee;

  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center space-x-2">
          <Wallet className="w-5 h-5" />
          <span>Withdraw Funds</span>
        </CardTitle>
        <CardDescription>
          Campaign creators can withdraw funds when 70% of the goal is reached
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Status */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress to 70% threshold</span>
            <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                thresholdReached ? 'bg-green-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div 
              className="h-1 bg-yellow-500 rounded-full"
              style={{ width: '70%' }}
            />
          </div>
          <p className="text-xs text-gray-500">Yellow line shows 70% threshold</p>
        </div>

        {/* Withdrawal Details */}
        {thresholdReached && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-2">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="font-medium">Withdrawal Available</span>
            </div>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Total Raised:</span>
                <span className="font-medium">${raisedAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Platform Fee (2.5%):</span>
                <span>-${platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium text-green-700 border-t border-green-200 pt-1">
                <span>You Receive:</span>
                <span>${creatorAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Status Messages */}
        {!thresholdReached && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-yellow-700">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Threshold Not Reached</span>
            </div>
            <p className="text-sm text-yellow-600 mt-1">
              Need ${((goalAmount * 0.7) - raisedAmount).toFixed(2)} more to reach 70% threshold
            </p>
          </div>
        )}

        {/* Withdraw Button */}
        <Button
          onClick={handleWithdraw}
          disabled={!canWithdraw || isWithdrawing || !thresholdReached}
          className="w-full"
          size="lg"
        >
          {isWithdrawing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Withdrawal...
            </>
          ) : thresholdReached ? (
            <>
              <DollarSign className="w-4 h-4 mr-2" />
              Withdraw ${creatorAmount.toFixed(2)}
            </>
          ) : (
            <>
              <AlertCircle className="w-4 h-4 mr-2" />
              Withdrawal Not Available
            </>
          )}
        </Button>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p className="font-medium mb-1">🔒 Secure Vault System:</p>
          <p>Funds are held in a smart contract vault. You can only withdraw when 70% of your goal is reached. If the goal isn't met, contributors can claim automatic refunds.</p>
        </div>
      </CardContent>
    </Card>
  );
}
