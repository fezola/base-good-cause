import React, { useState, useEffect } from 'react';
import { pay, getPaymentStatus } from '@base-org/account';

interface SimpleBasePayProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
  testnet?: boolean;
}

export function SimpleBasePay({
  amount,
  recipientAddress,
  onSuccess,
  onError,
  testnet = true // Default to testnet for development
}: SimpleBasePayProps) {
  const [BasePayButton, setBasePayButton] = useState<any>(null);
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const loadBasePayButton = async () => {
      try {
        // Import the BasePayButton component from the docs
        const { BasePayButton: Component } = await import('@base-org/account-ui/react');
        setBasePayButton(() => Component);
        console.log('✅ BasePayButton loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load BasePayButton:', error);
        setStatus('❌ BasePayButton not available');
      } finally {
        setIsLoading(false);
      }
    };

    loadBasePayButton();
  }, []);

  const handlePayClick = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setStatus('❌ Please enter a valid amount');
      return;
    }

    setIsProcessing(true);
    setStatus('🚀 Initiating payment...');

    try {
      console.log('🎯 Starting Base Pay with:', {
        amount,
        to: recipientAddress,
        testnet,
        network: testnet ? 'Base Sepolia (Testnet)' : 'Base Mainnet'
      });

      // Call the pay function directly as per Base documentation
      const result = await pay({
        amount: amount,
        to: recipientAddress,
        testnet: testnet
      });

      console.log('✅ Payment initiated:', result);
      setStatus('🔍 Checking payment status...');

      // Poll for payment status
      const statusResult = await getPaymentStatus({
        id: result.id,
        testnet: testnet
      });

      console.log('📊 Payment status:', statusResult);

      if (statusResult.status === 'completed') {
        setStatus('🎉 Payment completed successfully!');
        onSuccess?.({
          success: true,
          id: result.id,
          transactionHash: statusResult.transactionHash,
          blockNumber: statusResult.blockNumber,
          amount: parseFloat(amount)
        });
      } else {
        setStatus(`⏳ Payment status: ${statusResult.status}`);
        // Continue polling or handle other statuses
      }

    } catch (error) {
      console.error('❌ Payment failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Payment failed';
      setStatus(`❌ Payment failed: ${errorMessage}`);
      onError?.(error instanceof Error ? error : new Error(errorMessage));
    } finally {
      setIsProcessing(false);
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

  if (!BasePayButton) {
    return (
      <div className="space-y-4">
        {/* Fallback: Use direct pay() function */}
        <button
          onClick={handlePayClick}
          disabled={isProcessing || !amount || parseFloat(amount) <= 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-semibold transition-colors"
        >
          {isProcessing ? '⏳ Processing...' : `💰 Pay $${amount} USDC`}
        </button>
        {status && (
          <div className="p-3 text-sm bg-gray-100 rounded">
            {status}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Official BasePayButton from @base-org/account-ui/react */}
      <BasePayButton
        colorScheme="light"
        onClick={handlePayClick}
        disabled={isProcessing || !amount || parseFloat(amount) <= 0}
      >
        {isProcessing ? '⏳ Processing...' : `💰 Pay $${amount} USDC`}
      </BasePayButton>

      {status && (
        <div className="p-3 text-sm bg-gray-100 rounded">
          {status}
        </div>
      )}
    </div>
  );
}
