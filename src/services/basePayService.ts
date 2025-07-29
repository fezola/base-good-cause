// Base Pay Service - Configuration helpers
// Note: Now using official BasePayButton component directly

export interface PaymentOptions {
  amount: string;
  to: string;
  testnet?: boolean;
  payerInfo?: {
    requests: Array<{
      type: 'email' | 'name' | 'phoneNumber' | 'physicalAddress' | 'onchainAddress';
      optional?: boolean;
    }>;
    callbackURL?: string;
  };
}

export interface PaymentResult {
  success: boolean;
  id?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  userInfo?: {
    email?: string;
    name?: {
      firstName: string;
      familyName: string;
    };
    phoneNumber?: {
      number: string;
      country: string;
    };
    physicalAddress?: any;
    onchainAddress?: string;
  };
}

export interface PaymentStatus {
  status: 'pending' | 'completed' | 'failed';
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
}

// Real Base Pay implementation
export class BasePayService {
  private static instance: BasePayService;

  public static getInstance(): BasePayService {
    if (!BasePayService.instance) {
      BasePayService.instance = new BasePayService();
    }
    return BasePayService.instance;
  }

  // Real Base Pay payment function
  async pay(options: PaymentOptions): Promise<PaymentResult> {
    try {
      console.log('🚀 Initiating Base Pay payment:', options);

      // Call the real Base Pay function - this will show the popup!
      const result = await pay({
        amount: options.amount,
        to: options.to,
        testnet: options.testnet || this.isTestnet(),
        payerInfo: options.payerInfo
      });

      console.log('✅ Base Pay result:', result);

      return {
        success: true,
        id: result.id,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        userInfo: result.userInfo
      };
    } catch (error) {
      console.error('❌ Base Pay payment failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed'
      };
    }
  }

  // Real Base Pay status check
  async getPaymentStatus(id: string): Promise<PaymentStatus> {
    try {
      console.log('🔍 Checking payment status for:', id);
      const result = await getPaymentStatus({ id });
      return {
        status: result.status,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        error: result.error
      };
    } catch (error) {
      console.error('❌ Failed to get payment status:', error);
      return {
        status: 'failed',
        error: error instanceof Error ? error.message : 'Status check failed'
      };
    }
  }

  // Configuration helpers
  getRecipientAddress(): string {
    return import.meta.env.VITE_RECIPIENT_ADDRESS || '0x742d35Cc6634C0532925a3b844Bc9e7595f6E456';
  }

  isTestnet(): boolean {
    return import.meta.env.VITE_BASE_PAY_TESTNET === 'true';
  }

  getContributionAmount(): string {
    return import.meta.env.VITE_CONTRIBUTION_AMOUNT || '5';
  }
}

// Export singleton instance
export const basePayService = BasePayService.getInstance();
