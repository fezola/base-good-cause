import React, { useState } from 'react';
import { pay, getPaymentStatus } from '@base-org/account';
import { BasePayButton } from '@base-org/account-ui/react';

export function BasePayTest() {
  const [status, setStatus] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const testDirectPay = async () => {
    setIsProcessing(true);
    setStatus('🚀 Testing direct pay() function...');

    try {
      const result = await pay({
        amount: '1.00',
        to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        testnet: true // Use testnet for testing
      });

      console.log('✅ Pay result:', result);
      setStatus(`✅ Payment initiated! ID: ${result.id}`);

      // Check status
      const statusResult = await getPaymentStatus({
        id: result.id,
        testnet: true
      });

      console.log('📊 Status result:', statusResult);
      setStatus(`📊 Status: ${statusResult.status}`);

    } catch (error) {
      console.error('❌ Error:', error);
      setStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const testBasePayButton = async () => {
    setIsProcessing(true);
    setStatus('🚀 Testing BasePayButton...');

    try {
      const result = await pay({
        amount: '1.00',
        to: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
        testnet: true
      });

      setStatus(`✅ BasePayButton worked! ID: ${result.id}`);
    } catch (error) {
      console.error('❌ BasePayButton error:', error);
      setStatus(`❌ BasePayButton error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Base Pay Integration Test</h1>
      
      <div className="space-y-6">
        {/* Test 1: Direct pay() function */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test 1: Direct pay() Function</h2>
          <button
            onClick={testDirectPay}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold"
          >
            {isProcessing ? '⏳ Processing...' : '🧪 Test Direct Pay'}
          </button>
        </div>

        {/* Test 2: BasePayButton component */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test 2: BasePayButton Component</h2>
          <BasePayButton
            colorScheme="light"
            onClick={testBasePayButton}
            disabled={isProcessing}
          >
            {isProcessing ? '⏳ Processing...' : '🧪 Test BasePayButton'}
          </BasePayButton>
        </div>

        {/* Status Display */}
        {status && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Status:</h3>
            <p className="text-sm">{status}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="font-semibold mb-2">📋 Test Instructions:</h3>
          <ol className="text-sm space-y-1 list-decimal list-inside">
            <li>Make sure you have test USDC from <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Circle Faucet</a></li>
            <li>Select "Base Sepolia" network in the faucet</li>
            <li>Connect your wallet to Base Sepolia testnet</li>
            <li>Click either test button above</li>
            <li>Complete the payment in the popup</li>
          </ol>
        </div>

        {/* Environment Info */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h3 className="font-semibold mb-2">🔧 Environment Info:</h3>
          <ul className="text-sm space-y-1">
            <li><strong>Testnet:</strong> {import.meta.env.VITE_BASE_PAY_TESTNET === 'true' ? 'Enabled' : 'Disabled'}</li>
            <li><strong>Recipient:</strong> 0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045</li>
            <li><strong>Amount:</strong> $1.00 USDC</li>
            <li><strong>Network:</strong> Base Sepolia</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
