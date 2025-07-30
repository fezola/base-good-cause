import React, { useState } from 'react';
import { createBaseAccountSDK, pay, getPaymentStatus } from '@base-org/account';
import { BasePayButton } from '@base-org/account-ui/react';

interface SimpleBasePayProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function SimpleBasePay({ amount, recipientAddress, onSuccess, onError }: SimpleBasePayProps) {
  const [status, setStatus] = useState('');

  // Initialize SDK
  const sdk = createBaseAccountSDK({
    appName: 'FundMe',
    appLogo: '/basepay.JPG',
  });

  const handlePaymentResult = async (result: any) => {
    console.log('🎯 Payment result:', result);
    
    if (result.success) {
      setStatus('🎉 Payment successful!');
      onSuccess?.(result);
      
      // Get payment status for more details
      try {
        const receipt = await getPaymentStatus(result.id);
        console.log('📄 Payment receipt:', receipt);
      } catch (error) {
        console.log('Could not get payment receipt:', error);
      }
    } else {
      setStatus('❌ Payment failed: ' + result.error);
      onError?.(result);
    }
  };

  return (
    <div className="space-y-4">
      <BasePayButton
        paymentOptions={{
          amount: amount,
          to: recipientAddress,
          token: 'USDC',
          testnet: false // Set to true for testnet
        }}
        onPaymentResult={handlePaymentResult}
      />
      
      {status && (
        <div className="p-3 text-sm bg-gray-100 rounded">
          {status}
        </div>
      )}
    </div>
  );
}
