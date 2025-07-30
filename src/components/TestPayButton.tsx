import React, { useState } from 'react';

interface TestPayButtonProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function TestPayButton({ amount, recipientAddress, onSuccess, onError }: TestPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    console.log('🔥 TEST Button clicked!');
    console.log('Amount:', amount);
    console.log('Recipient:', recipientAddress);
    
    // Show immediate feedback
    alert(`Test button clicked! Amount: $${amount}`);
    
    setIsLoading(true);

    try {
      // Simulate payment processing
      console.log('🚀 Simulating payment...');
      
      // Wait 2 seconds to simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create mock successful result
      const result = {
        success: true,
        id: `test_${Date.now()}`,
        transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
        blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
        amount: parseFloat(amount)
      };
      
      console.log('✅ Test payment successful:', result);
      
      // Show success alert
      alert(`Payment successful! TX: ${result.transactionHash.substring(0, 10)}...`);
      
      // Call success callback
      onSuccess?.(result);
      
    } catch (error) {
      console.error('❌ Test payment error:', error);
      alert(`Payment failed: ${error}`);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button
        onClick={handleClick}
        disabled={isLoading || !amount || parseFloat(amount) <= 0}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors"
        style={{ minHeight: '56px' }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing Test Payment...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            🧪 Test Pay ${amount} (SIMULATION)
          </div>
        )}
      </button>
      
      <p className="text-xs text-gray-500 mt-2 text-center">
        This is a test button that simulates payment processing
      </p>
    </div>
  );
}
