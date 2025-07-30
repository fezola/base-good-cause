import React, { useState, useEffect } from 'react';

interface RealBasePayButtonProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function RealBasePayButton({ amount, recipientAddress, onSuccess, onError }: RealBasePayButtonProps) {
  const [BasePayButton, setBasePayButton] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBasePay = async () => {
      try {
        // Import ONLY the BasePayButton component - no SDK
        const { BasePayButton: BasePayComponent } = await import('@base-org/account-ui/react');
        setBasePayButton(() => BasePayComponent);
        setError(null);
      } catch (err) {
        console.error('Failed to load BasePay:', err);
        setError('BasePay not available');
      } finally {
        setIsLoading(false);
      }
    };

    loadBasePay();
  }, []);

  const handlePaymentResult = (result: any) => {
    if (result.success) {
      onSuccess?.(result);
    } else {
      onError?.(new Error(result.error || 'Payment failed'));
    }
  };

  if (isLoading) {
    return (
      <button
        disabled
        className="w-full bg-gray-400 text-white py-4 px-6 rounded-lg"
      >
        ⏳ Loading BasePay...
      </button>
    );
  }

  if (error || !BasePayButton) {
    return (
      <button
        disabled
        className="w-full bg-red-400 text-white py-4 px-6 rounded-lg"
      >
        ❌ BasePay Not Available
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {/* REAL BasePay Button - handles everything internally */}
      <BasePayButton
        paymentOptions={{
          amount: amount,
          to: recipientAddress,
          token: 'USDC',
          testnet: false, // Use mainnet
        }}
        onPaymentResult={handlePaymentResult}
      />
    </div>
  );
}

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
    };
  }
}
