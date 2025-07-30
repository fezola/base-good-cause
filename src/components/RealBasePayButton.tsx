import React, { useState } from 'react';

interface RealBasePayButtonProps {
  amount: string;
  recipientAddress: string;
  onSuccess?: (result: any) => void;
  onError?: (error: any) => void;
}

export function RealBasePayButton({ amount, recipientAddress, onSuccess, onError }: RealBasePayButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePayment = async () => {
    setIsLoading(true);
    console.log('🚀 Starting Base Pay transaction...');

    try {
      // Method 1: Try to use existing Base Account SDK
      try {
        console.log('📱 Attempting Base Account SDK...');

        const { createBaseAccountSDK } = await import('@base-org/account');

        const sdk = createBaseAccountSDK({
          appName: 'BaseFunded',
          appLogo: '/logo.png',
          enableAnalytics: false,
        });

        console.log('✅ Base Account SDK created');

        // Try to get provider and request payment
        const provider = sdk.getProvider();

        // Request account connection
        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        });

        console.log('✅ Accounts connected:', accounts);

        // This should trigger the Base Pay flow
        const { pay } = await import('@base-org/account');

        const result = await pay({
          amount: amount,
          to: recipientAddress,
          token: 'USDC',
          testnet: false
        });

        console.log('✅ Base Pay successful:', result);

        onSuccess?.({
          success: true,
          id: result.id || `base_${Date.now()}`,
          transactionHash: result.transactionHash,
          amount: parseFloat(amount)
        });

        return;

      } catch (baseSDKError) {
        console.warn('❌ Base Account SDK failed:', baseSDKError);
      }

      // Method 2: Try direct wallet connection
      try {
        console.log('🔗 Attempting direct wallet connection...');
        
        if (!window.ethereum) {
          throw new Error('No wallet detected. Please install MetaMask or Coinbase Wallet.');
        }

        // Request account access
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
          throw new Error('No accounts found. Please connect your wallet.');
        }

        console.log('✅ Wallet connected:', accounts[0]);

        // Switch to Base network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x2105' }], // Base mainnet
          });
        } catch (switchError) {
          // If Base network is not added, add it
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: {
                name: 'Ethereum',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        }

        // Create transaction for USDC transfer
        const usdcContract = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base
        const amountInWei = (parseFloat(amount) * 1000000).toString(); // USDC has 6 decimals

        // ERC20 transfer function signature
        const transferData = `0xa9059cbb${recipientAddress.slice(2).padStart(64, '0')}${parseInt(amountInWei).toString(16).padStart(64, '0')}`;

        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: accounts[0],
            to: usdcContract,
            data: transferData,
            value: '0x0',
          }],
        });

        console.log('✅ Transaction sent:', txHash);

        onSuccess?.({
          success: true,
          id: txHash,
          transactionHash: txHash,
          amount: parseFloat(amount)
        });

        return;

      } catch (walletError) {
        console.warn('❌ Direct wallet failed:', walletError);
        throw walletError;
      }

    } catch (error) {
      console.error('❌ All payment methods failed:', error);
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Main Base Pay Button */}
      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <span>💳</span>
            <span>Pay ${amount} USDC with Base</span>
          </>
        )}
      </button>

      {/* Info */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>• This will open your Coinbase Wallet or MetaMask</p>
        <p>• You'll be prompted to connect and approve the transaction</p>
        <p>• Make sure you're on the Base network</p>
      </div>

      {/* Debug info */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <p>To: {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}</p>
        <p>Amount: {amount} USDC</p>
        <p>Network: Base Mainnet</p>
      </div>
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
