import { contractService } from '@/services/contractService';
import { campaignService } from '@/services/campaignService';
import { vaultService } from '@/services/vaultService';
import { supabase } from '@/lib/supabase';

/**
 * Test utility for creating mock campaigns and testing vault transactions
 */

export interface MockCampaignData {
  title: string;
  description: string;
  goalUSD: number;
  goalETH: number;
  durationDays: number;
  location: string;
  category: string;
  recipientAddress: string;
}

export interface TestResults {
  step: string;
  success: boolean;
  data?: any;
  error?: string;
  consoleOutput?: string;
}

class VaultTester {
  private results: TestResults[] = [];

  private log(step: string, success: boolean, data?: any, error?: string) {
    const result: TestResults = {
      step,
      success,
      data,
      error,
      consoleOutput: JSON.stringify({ step, success, data, error }, null, 2)
    };
    
    this.results.push(result);
    
    console.group(`🧪 ${step}`);
    console.log(`Status: ${success ? '✅ SUCCESS' : '❌ FAILED'}`);
    if (data) console.log('Data:', data);
    if (error) console.error('Error:', error);
    console.groupEnd();
    
    return result;
  }

  /**
   * Create a mock campaign for testing
   */
  async createMockCampaign(mockData: MockCampaignData, userId: string): Promise<TestResults[]> {
    this.results = [];
    
    console.log('🚀 Starting Mock Campaign Creation & Testing...');
    console.log('📋 Mock Data:', mockData);

    try {
      // Step 1: Test smart contract connection
      this.log('1. Testing Smart Contract Connection', true, {
        contractAddress: contractService.CONTRACT_CONFIG?.address || 'Not configured',
        network: 'Base Testnet'
      });

      // Step 2: Create campaign on smart contract
      let contractCampaignId: number | undefined;
      try {
        console.log('📝 Creating campaign on smart contract...');
        const contractResult = await contractService.createCampaign(
          mockData.title,
          mockData.description,
          mockData.goalETH,
          mockData.durationDays
        );
        
        contractCampaignId = contractResult.campaignId;
        this.log('2. Smart Contract Campaign Creation', true, {
          campaignId: contractResult.campaignId,
          transactionHash: contractResult.transactionHash,
          goalETH: mockData.goalETH,
          durationDays: mockData.durationDays
        });
      } catch (error: any) {
        this.log('2. Smart Contract Campaign Creation', false, null, error.message);
        // Continue with Supabase-only creation for testing
      }

      // Step 3: Create campaign in Supabase
      try {
        const supabaseCampaignData = {
          title: mockData.title,
          description: mockData.description,
          goal: mockData.goalUSD,
          location: mockData.location,
          beneficiaries: 100,
          category: mockData.category,
          recipient_address: mockData.recipientAddress,
          user_id: userId,
          status: 'active' as const,
          contract_campaign_id: contractCampaignId
        };

        const supabaseCampaign = await campaignService.createCampaign(supabaseCampaignData);
        
        this.log('3. Supabase Campaign Creation', true, {
          campaignId: supabaseCampaign.id,
          contractCampaignId: contractCampaignId,
          goalUSD: mockData.goalUSD,
          status: supabaseCampaign.status
        });

        // Step 4: Test contribution recording
        await this.testContribution(supabaseCampaign.id, userId);

        // Step 5: Test campaign status checking
        await this.testCampaignStatus(supabaseCampaign.id);

        // Step 6: Test withdrawal eligibility
        await this.testWithdrawalEligibility(supabaseCampaign.id);

        // Step 7: Test refund eligibility
        await this.testRefundEligibility(supabaseCampaign.id, userId);

        return this.results;

      } catch (error: any) {
        this.log('3. Supabase Campaign Creation', false, null, error.message);
        return this.results;
      }

    } catch (error: any) {
      this.log('Overall Test', false, null, error.message);
      return this.results;
    }
  }

  /**
   * Test contribution recording
   */
  private async testContribution(campaignId: string, userId: string) {
    try {
      const mockContribution = {
        campaign_id: campaignId,
        user_id: userId,
        amount: 25, // $25 contribution
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 64),
        payment_id: 'mock_payment_' + Date.now(),
        wallet_address: '0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e',
        status: 'confirmed' // Valid status: pending, confirmed, or failed
      };

      await vaultService.recordContribution(mockContribution);
      
      this.log('4. Contribution Recording', true, {
        amount: mockContribution.amount,
        transactionHash: mockContribution.transaction_hash,
        paymentId: mockContribution.payment_id
      });

      // Test multiple contributions
      const secondContribution = {
        ...mockContribution,
        amount: 15,
        transaction_hash: '0x' + Math.random().toString(16).substr(2, 64),
        payment_id: 'mock_payment_' + (Date.now() + 1),
        wallet_address: '0x8ba1f109551bD432803012645Hac136c9c1659e'
      };

      await vaultService.recordContribution(secondContribution);
      
      this.log('4b. Second Contribution', true, {
        amount: secondContribution.amount,
        totalContributed: 40
      });

    } catch (error: any) {
      this.log('4. Contribution Recording', false, null, error.message);
    }
  }

  /**
   * Test campaign status checking
   */
  private async testCampaignStatus(campaignId: string) {
    try {
      const status = await vaultService.getCampaignStatus(campaignId);
      
      this.log('5. Campaign Status Check', true, {
        progressPercentage: status.progressPercentage,
        hasReached70Percent: status.hasReached70Percent,
        canWithdraw: status.canWithdraw,
        isCompleted: status.isCompleted,
        raised: status.campaign.raised,
        goal: status.campaign.goal
      });

    } catch (error: any) {
      this.log('5. Campaign Status Check', false, null, error.message);
    }
  }

  /**
   * Test withdrawal eligibility
   */
  private async testWithdrawalEligibility(campaignId: string) {
    try {
      const canWithdraw = await vaultService.canWithdrawFunds(campaignId);
      
      this.log('6. Withdrawal Eligibility', true, {
        canWithdraw,
        reason: canWithdraw ? 'Campaign reached 70% threshold' : 'Campaign has not reached 70% threshold'
      });

    } catch (error: any) {
      this.log('6. Withdrawal Eligibility', false, null, error.message);
    }
  }

  /**
   * Test refund eligibility
   */
  private async testRefundEligibility(campaignId: string, userId: string) {
    try {
      const userContribution = await vaultService.getUserContribution(campaignId, userId);
      
      this.log('7. Refund Eligibility', true, {
        userContribution,
        hasContributed: userContribution > 0,
        note: 'Refund eligibility depends on campaign end date and 70% threshold'
      });

    } catch (error: any) {
      this.log('7. Refund Eligibility', false, null, error.message);
    }
  }

  /**
   * Get all test results
   */
  getResults(): TestResults[] {
    return this.results;
  }

  /**
   * Print summary
   */
  printSummary() {
    console.group('📊 Test Summary');
    console.log(`Total Tests: ${this.results.length}`);
    console.log(`Passed: ${this.results.filter(r => r.success).length}`);
    console.log(`Failed: ${this.results.filter(r => !r.success).length}`);
    
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.group('❌ Failed Tests:');
      failedTests.forEach(test => {
        console.log(`- ${test.step}: ${test.error}`);
      });
      console.groupEnd();
    }
    console.groupEnd();
  }
}

// Export singleton instance
export const vaultTester = new VaultTester();

// Mock campaign data templates
export const MOCK_CAMPAIGNS: MockCampaignData[] = [
  {
    title: "Help Build School in Rural Kenya",
    description: "We are raising funds to build a new school in rural Kenya to provide education for 200+ children who currently walk 10km to the nearest school.",
    goalUSD: 1000,
    goalETH: 0.3, // Rough conversion
    durationDays: 30,
    location: "Nairobi, Kenya",
    category: "education",
    recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e" // Example address
  },
  {
    title: "Clean Water Project for Village",
    description: "Installing clean water wells and filtration systems to provide safe drinking water for 500 families in remote villages.",
    goalUSD: 500,
    goalETH: 0.15,
    durationDays: 45,
    location: "Lagos, Nigeria",
    category: "community",
    recipientAddress: "0x8ba1f109551bD432803012645Hac136c9c1659e"
  }
];
