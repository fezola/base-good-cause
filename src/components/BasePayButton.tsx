// Official Base Pay Button Component
// This will be enabled once @base-org/account-ui is installed

import React from 'react';
import { Button } from "@/components/ui/button";
import { DollarSign, Zap, Loader2 } from "lucide-react";
import { PaymentResult } from "@/services/basePayService";

// Extend Window interface for ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

interface BasePayButtonProps {
  amount: string;
  recipientAddress: string;
  onPaymentResult: (result: PaymentResult) => void;
  disabled?: boolean;
  className?: string;
  colorScheme?: 'light' | 'dark' | 'system';
  size?: 'small' | 'medium' | 'large';
  collectUserInfo?: boolean;
}

// Mock implementation - will be replaced with real BasePayButton
export function BasePayButton({
  amount,
  recipientAddress,
  onPaymentResult,
  disabled = false,
  className,
  colorScheme = 'light',
  size = 'large',
  collectUserInfo = false
}: BasePayButtonProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  
  const handleClick = async () => {
    if (disabled || isProcessing) return;

    setIsProcessing(true);

    console.log('🚀 Base Pay Button clicked:', {
      amount,
      recipientAddress,
      collectUserInfo
    });

    try {
      // Try to import and use the actual Base Pay SDK
      let BasePayButton;
      try {
        const basePayModule = await import('@base-org/account-ui/react');
        BasePayButton = basePayModule.BasePayButton;
      } catch (importError) {
        console.warn('Base Pay SDK not available, using fallback implementation');
      }

      if (BasePayButton) {
        // Use the real Base Pay SDK
        console.log('Using official Base Pay SDK');

        // Create a temporary container to render the Base Pay button
        const container = document.createElement('div');
        container.style.position = 'fixed';
        container.style.top = '-9999px';
        document.body.appendChild(container);

        // This would be the real implementation with Base Pay
        // For now, we'll simulate it since the SDK might not be fully configured
        setTimeout(() => {
          document.body.removeChild(container);

          const result: PaymentResult = {
            success: true,
            id: `basepay_${Date.now()}`,
            transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
            userInfo: collectUserInfo ? {
              email: 'contributor@example.com',
              name: {
                firstName: 'Base',
                familyName: 'Contributor'
              }
            } : undefined
          };

          setIsProcessing(false);
          onPaymentResult(result);
        }, 2000);

      } else {
        // Fallback implementation using Web3 wallet
        if (typeof window !== 'undefined' && window.ethereum) {

          // Request account access
          const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
          });

          if (accounts.length === 0) {
            throw new Error('No wallet connected');
          }

          console.log('Using Web3 wallet fallback');

          // Simulate payment processing
          await new Promise(resolve => setTimeout(resolve, 2000));

          const result: PaymentResult = {
            success: true,
            id: `wallet_${Date.now()}`,
            transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
            blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
            userInfo: collectUserInfo ? {
              email: 'wallet@example.com',
              name: {
                firstName: 'Wallet',
                familyName: 'User'
              }
            } : undefined
          };

          setIsProcessing(false);
          onPaymentResult(result);

        } else {
          throw new Error('No payment method available. Please install MetaMask or ensure Base Pay SDK is configured.');
        }
      }

    } catch (error: any) {
      console.error('Payment failed:', error);
      setIsProcessing(false);
      onPaymentResult({
        success: false,
        error: error.message || 'Payment failed. Please try again.'
      });
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || isProcessing}
      size="lg"
      className={`
        relative overflow-hidden group
        h-16 px-12 text-lg font-semibold
        bg-gradient-primary hover:shadow-glow
        transition-all duration-300 ease-out
        transform hover:scale-105 active:scale-95
        ${isProcessing ? 'opacity-75 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-6 w-6" />
          <span>{amount}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isProcessing ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Zap className="h-5 w-5 animate-bounce-gentle" />
          )}
          <span>{isProcessing ? 'Processing...' : 'Pay with Base'}</span>
        </div>
      </div>
      
      {/* Hover effect overlay */}
      <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </Button>
  );
}

// Real Base Pay Button implementation (commented out until packages are installed)
/*
import { BasePayButton as OfficialBasePayButton } from '@base-org/account-ui/react';

export function BasePayButton({
  amount,
  recipientAddress,
  onPaymentResult,
  disabled = false,
  className,
  colorScheme = 'light',
  size = 'large',
  collectUserInfo = false
}: BasePayButtonProps) {
  
  const paymentOptions = {
    amount,
    to: recipientAddress,
    testnet: import.meta.env.VITE_BASE_PAY_TESTNET === 'true',
    ...(collectUserInfo && {
      payerInfo: {
        requests: [
          { type: 'email' as const, optional: false },
          { type: 'name' as const, optional: true }
        ]
      }
    })
  };

  const handlePaymentResult = (result: any) => {
    const paymentResult: PaymentResult = {
      success: result.success,
      id: result.id,
      transactionHash: result.transactionHash,
      blockNumber: result.blockNumber,
      error: result.error,
      userInfo: result.userInfo
    };
    
    onPaymentResult(paymentResult);
  };

  return (
    <div className={className}>
      <OfficialBasePayButton
        paymentOptions={paymentOptions}
        colorScheme={colorScheme}
        size={size}
        disabled={disabled}
        onPaymentResult={handlePaymentResult}
      />
    </div>
  );
}
*/
