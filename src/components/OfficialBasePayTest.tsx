import React, { useState } from 'react';
import { createBaseAccountSDK, pay, getPaymentStatus } from '@base-org/account';
import { SignInWithBaseButton, BasePayButton } from '@base-org/account-ui/react';

interface OfficialBasePayTestProps {
  recipientAddress: string;
  amount?: string;
}

export function OfficialBasePayTest({ recipientAddress, amount = "5.00" }: OfficialBasePayTestProps) {
  const [isSignedIn, setSignedIn] = useState(false);
  const [status, setStatus] = useState('');
  const [sdkError, setSdkError] = useState<string | null>(null);

  // Initialize SDK
  let sdk;
  try {
    sdk = createBaseAccountSDK({
      appName: 'BaseFunded',
      appLogo: 'https://your-logo-url.com',
      enableAnalytics: false, // Disable analytics to prevent network issues
    });
  } catch (error) {
    console.error('SDK initialization failed:', error);
    setSdkError('Base Pay SDK not available');
  }

  const handleSignIn = async () => {
    if (!sdk) {
      setStatus('❌ SDK not available');
      return;
    }

    try {
      await sdk.getProvider().request({ method: 'wallet_connect' });
      setSignedIn(true);
      setStatus('✅ Signed in successfully!');
    } catch (err) {
      console.error('Sign in failed:', err);
      setStatus('❌ Sign in failed: ' + err.message);
    }
  };

  const onPaymentResult = async (res) => {
    if (res.success) {
      setStatus('🎉 Payment successful!');
      try {
        const receipt = await getPaymentStatus(res.id);
        console.log('Receipt', receipt);
        setStatus(`🎉 Payment successful! TX: ${res.transactionHash?.substring(0, 10)}...`);
      } catch (receiptError) {
        console.warn('Could not fetch receipt:', receiptError);
        setStatus('🎉 Payment successful! (Receipt fetch failed)');
      }
    } else {
      setStatus('❌ Payment failed: ' + res.error);
    }
  };

  if (sdkError) {
    return (
      <div className="p-6 border border-red-200 rounded-lg bg-red-50">
        <h3 className="font-semibold text-red-800 mb-2">Base Pay SDK Not Available</h3>
        <p className="text-red-700 text-sm mb-4">
          The Base Pay SDK could not be initialized. This might be because:
        </p>
        <ul className="text-red-700 text-sm list-disc list-inside mb-4">
          <li>@base-org/account package is not installed</li>
          <li>@base-org/account-ui package is not installed</li>
          <li>Network connectivity issues</li>
        </ul>
        <p className="text-red-700 text-sm">
          Install the packages with: <code className="bg-red-100 px-1 rounded">npm install @base-org/account @base-org/account-ui</code>
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white">
      <h3 className="font-semibold mb-4">Official Base Pay Integration Test</h3>
      
      {!isSignedIn ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            First, sign in with Base to enable payments:
          </p>
          <SignInWithBaseButton onConnect={handleSignIn} />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-green-600">
            ✅ Signed in! You can now make payments.
          </p>
          <BasePayButton
            paymentOptions={{
              amount: amount,
              to: recipientAddress,
              token: 'USDC',
              testnet: false,
            }}
            onPaymentResult={onPaymentResult}
          />
        </div>
      )}
      
      {status && (
        <div className="mt-4 p-3 bg-gray-50 rounded border">
          <p className="text-sm font-medium">{status}</p>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>Recipient: {recipientAddress}</p>
        <p>Amount: ${amount} USDC</p>
        <p>Network: Base Mainnet</p>
      </div>
    </div>
  );
}
