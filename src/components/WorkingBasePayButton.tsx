import React, { useState, useEffect } from 'react';

interface WorkingBasePayButtonProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function WorkingBasePayButton({ amount, recipientAddress, onSuccess, onError }: WorkingBasePayButtonProps) {
  const [BasePayButton, setBasePayButton] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBasePayButton = async () => {
      try {
        console.log('🔄 Loading Base Pay Button...');
        
        // Import ONLY the UI component, not the SDK
        const uiModule = await import('@base-org/account-ui/react');
        console.log('✅ UI Module loaded:', uiModule);
        
        if (uiModule.BasePayButton) {
          setBasePayButton(() => uiModule.BasePayButton);
          console.log('✅ BasePayButton component ready!');
        } else {
          throw new Error('BasePayButton not found in module');
        }
        
      } catch (err) {
        console.error('❌ Failed to load BasePayButton:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadBasePayButton();
  }, []);

  const handlePaymentResult = (result: any) => {
    console.log('🎯 PAYMENT RESULT:', result);
    alert(`Payment result: ${result.success ? 'SUCCESS' : 'FAILED'}`);
    
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
        ⏳ Loading Base Pay...
      </button>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <button
          onClick={() => {
            console.log('🧪 Fallback payment simulation');
            alert(`Simulating payment of $${amount} USDC`);
            
            setTimeout(() => {
              const result = {
                success: true,
                id: `fallback_${Date.now()}`,
                transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
                amount: parseFloat(amount)
              };
              handlePaymentResult(result);
            }, 1000);
          }}
          className="w-full bg-orange-600 hover:bg-orange-700 text-white py-4 px-6 rounded-lg"
        >
          🧪 Simulate Payment ${amount} USDC
        </button>
        <p className="text-xs text-red-600">Base Pay unavailable: {error}</p>
      </div>
    );
  }

  if (!BasePayButton) {
    return (
      <button 
        disabled 
        className="w-full bg-red-400 text-white py-4 px-6 rounded-lg"
      >
        ❌ Base Pay Button Not Available
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div 
        className="border-2 border-green-500 p-2 rounded bg-green-50"
        onClick={() => console.log('🎯 Base Pay container clicked')}
      >
        <p className="text-xs text-green-700 mb-2">✅ Base Pay Button Loaded:</p>
        <BasePayButton
          paymentOptions={{
            amount: amount,
            to: recipientAddress,
            token: 'USDC',
            testnet: true, // Use testnet to avoid mainnet issues
          }}
          onPaymentResult={handlePaymentResult}
        />
      </div>
      
      {/* Backup button for testing */}
      <button
        onClick={() => {
          console.log('🧪 Manual trigger test');
          alert('Manual trigger works!');
          
          // Simulate successful payment
          const result = {
            success: true,
            id: `manual_${Date.now()}`,
            transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            amount: parseFloat(amount)
          };
          handlePaymentResult(result);
        }}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-sm"
      >
        🧪 Manual Test Payment
      </button>
    </div>
  );
}
