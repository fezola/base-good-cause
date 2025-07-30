// ContributeButton - Proper Base Pay Integration
import { useState } from 'react';
import { createBaseAccountSDK, getPaymentStatus } from '@base-org/account';
import { BasePayButton } from '@base-org/account-ui/react';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { BASE_PAY_CONFIG } from "@/config/basePay";
import { BasicPayButton } from "@/components/BasicPayButton";

interface PaymentResult {
  success: boolean;
  id?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  userInfo?: any;
}

interface ContributeButtonProps {
  onContribute: (result: PaymentResult) => Promise<void>;
  disabled?: boolean;
  className?: string;
  recipientAddress: string; // Required - each campaign has its own address
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
  const [status, setStatus] = useState('');

  // Initialize Base Account SDK
  const sdk = createBaseAccountSDK({
    appName: 'FundMe',
    appLogo: '/basepay.JPG',
  });

  const getCurrentAmount = (): number => {
    const parsed = parseFloat(customAmount);
    return isNaN(parsed) ? 0 : parsed;
  };





  // Handle payment result from BasePayButton
  const onPaymentResult = async (result: any) => {
    console.log('🎯 Payment result:', result);

    if (result.success) {
      setStatus('🎉 Payment successful!');

      toast({
        title: "🎉 Payment Successful!",
        description: `Thank you for contributing $${getCurrentAmount()} USDC!`,
        duration: 5000,
      });

      // Get payment status for more details
      try {
        const receipt = await getPaymentStatus(result.id);
        console.log('📄 Payment receipt:', receipt);
      } catch (error) {
        console.log('Could not get payment receipt:', error);
      }

      // Create payment result for parent component
      const paymentResult: PaymentResult = {
        success: true,
        id: result.id,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        amount: getCurrentAmount(),
        userInfo: result.userInfo
      };

      await onContribute(paymentResult);

    } else {
      setStatus('Payment failed: ' + result.error);

      toast({
        title: "❌ Payment Failed",
        description: result.error || "Payment failed. Please try again.",
        variant: "destructive",
        duration: 5000,
      });

      const paymentResult: PaymentResult = {
        success: false,
        error: result.error || 'Payment failed'
      };

      await onContribute(paymentResult);
    }
  };

  const currentAmount = getCurrentAmount();
  const isValidAmount = currentAmount > 0;

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

        {/* Basic Pay Button - Direct pay() call */}
        <BasicPayButton
          amount={getCurrentAmount().toFixed(2)}
          recipientAddress={recipientAddress}
          onSuccess={async (result) => {
            console.log('✅ Payment Success:', result);

            toast({
              title: "🎉 Payment Successful!",
              description: `Thank you for contributing $${getCurrentAmount()} USDC!`,
              duration: 5000,
            });

            const paymentResult: PaymentResult = {
              success: true,
              id: result.id,
              transactionHash: result.transactionHash,
              blockNumber: result.blockNumber,
              amount: getCurrentAmount(),
              userInfo: result.userInfo
            };

            await onContribute(paymentResult);
          }}
          onError={async (error) => {
            console.error('❌ Payment Error:', error);

            toast({
              title: "❌ Payment Failed",
              description: error.message || "Payment failed. Please try again.",
              variant: "destructive",
              duration: 5000,
            });

            const paymentResult: PaymentResult = {
              success: false,
              error: error.message || 'Payment failed'
            };

            await onContribute(paymentResult);
          }}
        />

        {/* Security Note */}
        <p className="text-xs text-muted-foreground text-center">
          Secure payments powered by Base blockchain. Your contribution is protected and transparent.
        </p>
      </CardContent>
    </Card>
  );
}

