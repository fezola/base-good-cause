// Official Base Pay Button Component
// This will be enabled once @base-org/account-ui is installed

import { Button } from "@/components/ui/button";
import { DollarSign, Zap } from "lucide-react";
import { PaymentResult } from "@/services/basePayService";

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
  
  const handleClick = async () => {
    if (disabled) return;
    
    console.log('🚀 Base Pay Button clicked:', {
      amount,
      recipientAddress,
      collectUserInfo
    });

    // Mock payment result
    const mockResult: PaymentResult = {
      success: true,
      id: `payment_${Date.now()}`,
      transactionHash: `0x${Math.random().toString(16).substring(2, 66)}`,
      blockNumber: Math.floor(Math.random() * 1000000) + 5000000,
      userInfo: collectUserInfo ? {
        email: 'user@example.com',
        name: {
          firstName: 'John',
          familyName: 'Doe'
        }
      } : undefined
    };

    // Simulate processing delay
    setTimeout(() => {
      onPaymentResult(mockResult);
    }, 2000);
  };

  return (
    <Button
      onClick={handleClick}
      disabled={disabled}
      size="lg"
      className={`
        relative overflow-hidden group
        h-16 px-12 text-lg font-semibold
        bg-gradient-primary hover:shadow-glow
        transition-all duration-300 ease-out
        transform hover:scale-105 active:scale-95
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1">
          <DollarSign className="h-6 w-6" />
          <span>{amount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-5 w-5 animate-bounce-gentle" />
          <span>Pay with Base</span>
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
