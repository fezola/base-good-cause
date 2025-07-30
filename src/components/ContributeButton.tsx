import { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentResult {
  success: boolean;
  id?: string;
  transactionHash?: string;
  blockNumber?: number;
  amount?: number;
  error?: string;
  userInfo?: any;
}

interface ContributeButtonProps {
  onContribute: (result: PaymentResult) => Promise<void>;
  disabled?: boolean;
  className?: string;
  recipientAddress: string;
  testnet?: boolean;
}

export function ContributeButton({
  onContribute,
  disabled = false,
  className,
  recipientAddress,
  testnet = true
}: ContributeButtonProps) {
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const getCurrentAmount = (): number => {
    const parsed = parseFloat(customAmount);
    return isNaN(parsed) ? 0 : parsed;
  };

  const handleContribute = async () => {
    const amount = getCurrentAmount();
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment for demo
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult: PaymentResult = {
        success: true,
        id: `demo_${Date.now()}`,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        blockNumber: Math.floor(Math.random() * 1000000),
        amount: amount,
        userInfo: { address: recipientAddress }
      };

      toast({
        title: "🎉 Payment Successful!",
        description: `Thank you for contributing $${amount} USDC!`,
        duration: 5000,
      });

      await onContribute(mockResult);
      setCustomAmount('');

    } catch (error) {
      const failedResult: PaymentResult = {
        success: false,
        error: 'Payment failed'
      };

      toast({
        title: "❌ Payment Failed",
        description: "Payment failed. Please try again.",
        variant: "destructive",
        duration: 5000,
      });

      await onContribute(failedResult);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className={`w-full ${className}`}>
      <CardContent className="p-6 space-y-6">
        {/* Amount Selection Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Choose Your Contribution
          </h3>
          <p className="text-muted-foreground">
            Every contribution makes a difference
          </p>
        </div>

        {/* Custom Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium text-foreground">
            How much would you like to contribute? (USDC)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter your contribution amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="text-lg h-12"
            min="1"
            step="0.01"
          />
          {getCurrentAmount() > 0 && (
            <p className="text-xs text-green-600 font-medium">
              Contributing: ${getCurrentAmount()} USDC
            </p>
          )}
        </div>

        {/* Contribute Button */}
        <Button
          onClick={handleContribute}
          disabled={disabled || isProcessing || getCurrentAmount() <= 0}
          className="w-full"
          variant="hero"
          size="lg"
        >
          {isProcessing ? (
            <>Processing...</>
          ) : (
            `💰 Contribute $${getCurrentAmount() || 0} USDC`
          )}
        </Button>

        {/* Security Note */}
        <p className="text-xs text-muted-foreground text-center">
          Demo mode - Base Pay integration will be added after Supabase setup
        </p>
      </CardContent>
    </Card>
  );
}