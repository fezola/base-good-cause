// ContributeButton - Simple Working Base Pay Integration
import { useState } from 'react';
import { pay, getPaymentStatus } from '@base-org/account';
import { toast } from "@/hooks/use-toast";

interface PaymentResult {
  success: boolean;
  id?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  userInfo?: any;
}

interface ContributeButtonProps {
  amount: number;
  onContribute: (result: PaymentResult) => Promise<void>;
  disabled?: boolean;
  className?: string;
  recipientAddress: string; // Required - each campaign has its own address
  testnet?: boolean;
}

export function ContributeButton({
  amount,
  onContribute,
  disabled = false,
  className,
  recipientAddress,
  testnet = true
}: ContributeButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Payment options for Base Pay
  const paymentOptions = {
    amount: amount.toFixed(2),
    to: recipientAddress,
    testnet: testnet
  };

  // Debug log for network
  console.log('🌐 Network Configuration:', {
    testnet: testnet,
    network: testnet ? 'Base Sepolia (Testnet)' : 'Base Mainnet',
    envVar: import.meta.env.VITE_BASE_PAY_TESTNET,
    paymentOptions
  });

  // Simple Base Pay function - this was working!
  const handleBasePay = async () => {
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
    } finally {
      setIsLoading(false);
    }
  };



  // Debug logging
  console.log('🔧 ContributeButton render:', {
    paymentOptions,
    disabled,
    amount
  });

  return (
    <div className={className}>
      {/* Simple Base Pay Button - This was working! */}
      <button
        onClick={handleBasePay}
        disabled={disabled || isLoading}
        className="
          w-full h-16 px-8 text-lg font-semibold text-white
          bg-gradient-to-r from-blue-600 to-blue-700
          hover:from-blue-700 hover:to-blue-800
          rounded-lg shadow-lg hover:shadow-xl
          transition-all duration-300 ease-out
          transform hover:scale-105 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          flex items-center justify-center space-x-3
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        "
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💳</span>
              <span>Pay ${amount} with Base Pay</span>
            </div>
          </>
        )}
      </button>

      {/* Instructions */}
      <div className="text-center mt-4 space-y-2">
        <div className="text-xs text-muted-foreground space-y-1">
          <p>✓ Secure payment via Base Pay</p>
          <p>✓ Gasless USDC transactions</p>
          <p>✓ Transparent on-chain funding</p>
        </div>
      </div>
    </div>
  );
}

