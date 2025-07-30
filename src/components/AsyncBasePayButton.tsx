import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface AsyncBasePayButtonProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function AsyncBasePayButton({ amount, recipientAddress, onSuccess, onError }: AsyncBasePayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [BasePayButton, setBasePayButton] = useState<any>(null);

  useEffect(() => {
    // Initialize Base Pay SDK asynchronously
    const initializeSDK = async () => {
      try {
        console.log('🔄 Initializing Base Pay SDK...');
        
        // Import the SDK components
        const [accountModule, uiModule] = await Promise.all([
          import('@base-org/account'),
          import('@base-org/account-ui/react')
        ]);

        console.log('✅ Base Pay modules imported');

        // Create SDK instance
        const sdk = accountModule.createBaseAccountSDK({
          appName: 'BaseFunded',
          appLogo: '/logo.png',
        });

        console.log('✅ Base Pay SDK created');

        // Set the component
        setBasePayButton(() => uiModule.BasePayButton);
        setSdkReady(true);
        
        console.log('✅ Base Pay SDK ready!');
        
      } catch (error) {
        console.error('❌ Failed to initialize Base Pay SDK:', error);
        setSdkError(error.message);
      }
    };

    initializeSDK();
  }, []);

  const handleDirectClick = async () => {
    console.log('🔥 Direct button clicked!');
    alert('Direct button clicked! SDK Ready: ' + sdkReady);
    
    if (!sdkReady) {
      alert('SDK not ready yet. Error: ' + sdkError);
      return;
    }

    setIsLoading(true);

    try {
      // Simulate payment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const result = {
        success: true,
        id: `async_${Date.now()}`,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        amount: parseFloat(amount)
      };

      console.log('✅ Async payment successful:', result);
      onSuccess?.(result);
      
    } catch (error) {
      console.error('❌ Async payment failed:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onPaymentResult = async (result: any) => {
    console.log('📊 Base Pay Result:', result);
    if (result.success) {
      onSuccess?.(result);
    } else {
      onError?.(new Error(result.error));
    }
  };

  if (sdkError) {
    return (
      <div className="space-y-2">
        <Button
          onClick={handleDirectClick}
          className="w-full bg-orange-600 hover:bg-orange-700"
          disabled={isLoading}
        >
          {isLoading ? '⏳ Processing...' : `🧪 Simulate Pay $${amount}`}
        </Button>
        <p className="text-xs text-red-600">SDK Error: {sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="space-y-2">
        <Button disabled className="w-full bg-gray-400">
          ⏳ Loading Base Pay SDK...
        </Button>
        <p className="text-xs text-gray-500">Initializing payment system...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Test button to verify clicks work */}
      <Button
        onClick={() => {
          console.log('🧪 Test button clicked!');
          alert('Test button works!');
        }}
        className="w-full bg-green-600 hover:bg-green-700 mb-2"
      >
        🧪 Test Click (Works?)
      </Button>

      {/* Direct payment button */}
      <Button
        onClick={handleDirectClick}
        className="w-full bg-blue-600 hover:bg-blue-700 mb-2"
        disabled={isLoading}
      >
        {isLoading ? '⏳ Processing...' : `💳 Direct Pay $${amount}`}
      </Button>

      {/* Official Base Pay Button */}
      {BasePayButton && (
        <div className="border-2 border-dashed border-purple-300 p-2 rounded">
          <p className="text-xs text-purple-600 mb-2">Official Base Pay Button:</p>
          <BasePayButton
            paymentOptions={{
              amount: amount,
              to: recipientAddress,
              token: 'USDC',
              testnet: true,
            }}
            onPaymentResult={onPaymentResult}
          />
        </div>
      )}
      
      <p className="text-xs text-green-600">✅ SDK Ready</p>
    </div>
  );
}
