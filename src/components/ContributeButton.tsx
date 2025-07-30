// ContributeButton - Flexible Amount Base Pay Integration
import { useState } from 'react';
import { pay, getPaymentStatus } from '@base-org/account';
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { BASE_PAY_CONFIG } from "@/config/basePay";
import { BasePayLogo } from "@/components/BasePayLogo";

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
  const [isLoading, setIsLoading] = useState(false);
  const [customAmount, setCustomAmount] = useState<string>('');



  const getCurrentAmount = (): number => {
    const parsed = parseFloat(customAmount);
    return isNaN(parsed) ? 0 : parsed;
  };





  // Payment options for Base Pay
  const paymentOptions = {
    amount: getCurrentAmount().toFixed(2),
    to: recipientAddress,
    testnet: testnet
  };

  // Debug log for network
  console.log('🌐 Network:', testnet ? 'Base Sepolia (Testnet)' : 'Base Mainnet');

  const handleBasePay = async () => {
    const amount = getCurrentAmount();

    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid contribution amount.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    if (isLoading || disabled) return;

    setIsLoading(true);
    console.log('🚀 Base Pay payment:', paymentOptions);

    try {
      const result = await pay(paymentOptions);
      console.log('✅ Base Pay result:', result);

      // Show success toast
      toast({
        title: "🎉 Payment Successful!",
        description: `Thank you for contributing $${amount} USDC to this campaign.`,
        duration: 5000,
      });

      // Create payment result
      const paymentResult: PaymentResult = {
        success: true,
        id: result.id,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber
      };

      await onContribute(paymentResult);

    } catch (error) {
      console.error('❌ Base Pay failed:', error);

      toast({
        title: "❌ Payment Failed",
        description: "Payment failed. Please try again.",
        variant: "destructive",
        duration: 5000,
      });

      const paymentResult: PaymentResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };

      await onContribute(paymentResult);
    } finally {
      setIsLoading(false);
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



        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium text-foreground">
            Enter Amount (USDC)
          </Label>
          <Input
            id="amount"
            type="number"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="text-lg h-12"
            min="1"
            step="1"
          />
        </div>

        {/* Base Pay Button */}
        <button
          onClick={handleBasePay}
          disabled={isLoading || disabled || !isValidAmount}
          className="base-pay-button w-full font-semibold py-4 px-6 text-lg h-14 rounded-md disabled:opacity-50"
          style={{
            backgroundColor: '#0000FF',
            color: 'white',
            border: 'none',
            backgroundImage: 'none'
          }}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  backgroundColor: 'white',
                  marginRight: '8px',
                  display: 'inline-block',
                  verticalAlign: 'middle',
                  border: '1px solid white'
                }}
              >
                <div
                  style={{
                    width: '8px',
                    height: '8px',
                    backgroundColor: '#0000FF',
                    margin: '6px'
                  }}
                />
              </div>
              <span style={{ color: 'black' }}>Base</span><span style={{ color: 'white' }}>Pay</span>
            </>
          )}
        </button>

        {/* Security Note */}
        <p className="text-xs text-muted-foreground text-center">
          Secure payments powered by Base blockchain. Your contribution is protected and transparent.
        </p>
      </CardContent>
    </Card>
  );
}

