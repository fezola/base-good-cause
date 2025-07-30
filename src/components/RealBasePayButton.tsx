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

    try {
      // Method 1: Try to use existing Base Account SDK
      try {
        const { createBaseAccountSDK } = await import('@base-org/account');

        const sdk = createBaseAccountSDK({
          appName: 'BaseFunded',
          appLogo: '/basepay.JPG',
          enableAnalytics: false,
        });

        const provider = sdk.getProvider();

        const accounts = await provider.request({
          method: 'eth_requestAccounts'
        });

        const { pay } = await import('@base-org/account');

        const result = await pay({
          amount: amount,
          to: recipientAddress,
          token: 'USDC',
          testnet: false
        });

        onSuccess?.({
          success: true,
          id: result.id || `base_${Date.now()}`,
          transactionHash: result.transactionHash,
          amount: parseFloat(amount)
        });

        return;

      } catch (baseSDKError) {
        // Continue to fallback method
      }

      // Method 2: Try direct wallet connection
      try {
        if (!window.ethereum) {
          throw new Error('No wallet detected. Please install MetaMask or Coinbase Wallet.');
        }

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        });

        if (accounts.length === 0) {
          throw new Error('No accounts found. Please connect your wallet.');
        }

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

        onSuccess?.({
          success: true,
          id: txHash,
          transactionHash: txHash,
          amount: parseFloat(amount)
        });

        return;

      } catch (walletError) {
        throw walletError;
      }

    } catch (error) {
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
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 shadow-lg"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Processing Payment...</span>
          </>
        ) : (
          <>
            <img
              src="/basepay.JPG"
              alt="BasePay"
              className="h-6 w-6 object-contain"
            />
            <span>BasePay</span>
          </>
        )}
      </button>


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
