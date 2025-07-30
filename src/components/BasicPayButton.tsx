import React, { useState } from 'react';

interface BasicPayButtonProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function BasicPayButton({ amount, recipientAddress, onSuccess, onError }: BasicPayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleClick = async () => {
    console.log('🔥 Button clicked!');
    alert('Button clicked! Check console for details.');
    setIsLoading(true);

    try {
      console.log('🚀 Calling pay() with:', { amount, to: recipientAddress });

      // Try to use the real Base Pay SDK
      let payFunction;
      try {
        const baseModule = await import('@base-org/account');
        payFunction = baseModule.pay;
      } catch (importError) {
        console.warn('Base Pay SDK not available, using simulation');
        // Simulate payment for development/testing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const simulatedResult = {
          success: true,
          id: `sim_${Date.now()}`,
          transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 5000000
        };

        console.log('✅ Simulated Pay result:', simulatedResult);
        onSuccess?.(simulatedResult);
        setIsLoading(false);
        return;
      }

      const result = await payFunction({
        amount: amount,
        to: recipientAddress,
        testnet: true // Use testnet for development
      });

      console.log('✅ Pay result:', result);

      if (result.success) {
        setShowModal(true);
        onSuccess?.(result);
      } else {
        alert(`❌ Payment Failed: ${result.error}`);
        onError?.(result);
      }

    } catch (error) {
      console.error('❌ Pay error:', error);
      alert(`❌ Payment Error: ${error.message || 'Unknown error'}`);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading || !amount || parseFloat(amount) <= 0}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg"
        style={{ minHeight: '56px' }}
      >
        {isLoading ? (
          'Processing...'
        ) : amount && parseFloat(amount) > 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <img
              src="/basepay.JPG"
              alt="BasePay Logo"
              style={{
                width: '20px',
                height: '20px',
                marginRight: '8px'
              }}
            />
            <span style={{ color: 'white' }}>Pay $</span>
            <span style={{ color: 'white' }}>{amount}</span>
            <span style={{ color: 'white' }}> with </span>
            <span style={{ color: 'black' }}>Base</span>
            <span style={{ color: 'white' }}>Pay</span>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <img
              src="/basepay.JPG"
              alt="BasePay Logo"
              style={{
                width: '20px',
                height: '20px',
                marginRight: '8px'
              }}
            />
            <span style={{ color: 'black' }}>Base</span>
            <span style={{ color: 'white' }}>Pay</span>
          </div>
        )}
      </button>

      {/* Success Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">
                Thank you for contributing ${amount} USDC to this campaign!
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
