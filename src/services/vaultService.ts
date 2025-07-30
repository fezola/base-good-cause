import { contractService } from './contractService';
import { campaignService } from './campaignService';
import { supabase } from '@/lib/supabase';

/**
 * VaultService - Integrates BasePay payments with smart contract vault
 * 
 * Flow:
 * 1. User contributes via BasePay (handled by ContributeButton)
 * 2. On successful payment, we record contribution in Supabase
 * 3. Campaign creator can withdraw when 70% reached (via smart contract)
 * 4. Contributors can claim refunds if campaign fails (via smart contract)
 */

export interface ContributionData {
  campaign_id: string;
  user_id: string;
  amount: number;
  transaction_hash?: string | null; // Optional - BasePay doesn't provide blockchain tx hash
  payment_id?: string;
  wallet_address?: string;
  status?: 'pending' | 'confirmed' | 'failed';
  created_at?: string;
}

export interface WithdrawResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

export interface RefundResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
}

class VaultService {
  
  /**
   * Record a contribution after successful BasePay payment
   */
  async recordContribution(contributionData: ContributionData) {
    try {
      // Record in Supabase
      const { data, error } = await supabase
        .from('contributions')
        .insert([contributionData])
        .select()
        .single();

      if (error) throw error;

      // Update campaign raised amount
      await this.updateCampaignRaised(contributionData.campaign_id);

      return data;
    } catch (error) {
      console.error('Failed to record contribution:', error);
      throw error;
    }
  }

  /**
   * Update campaign raised amount by summing all contributions
   */
  private async updateCampaignRaised(campaignId: string) {
    try {
      // Get total contributions for this campaign
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select('amount')
        .eq('campaign_id', campaignId);

      if (error) throw error;

      const totalRaised = contributions.reduce((sum, contrib) => sum + contrib.amount, 0);

      // Update campaign
      await supabase
        .from('campaigns')
        .update({ raised: totalRaised })
        .eq('id', campaignId);

    } catch (error) {
      console.error('Failed to update campaign raised amount:', error);
      throw error;
    }
  }

  /**
   * Check if campaign creator can withdraw funds (70% threshold reached)
   */
  async canWithdrawFunds(campaignId: string): Promise<boolean> {
    try {
      const campaign = await campaignService.getCampaign(campaignId);
      
      if (!campaign.contract_campaign_id) {
        return false; // No smart contract campaign
      }

      // Check smart contract
      return await contractService.canWithdraw(campaign.contract_campaign_id);
    } catch (error) {
      console.error('Failed to check withdrawal eligibility:', error);
      return false;
    }
  }

  /**
   * Withdraw funds from smart contract (campaign creator only)
   */
  async withdrawFunds(campaignId: string): Promise<WithdrawResult> {
    try {
      const campaign = await campaignService.getCampaign(campaignId);
      
      if (!campaign.contract_campaign_id) {
        throw new Error('Campaign not linked to smart contract');
      }

      // Initialize contract service (connects wallet)
      await contractService.initialize();

      // Withdraw from smart contract
      const result = await contractService.withdrawFunds(campaign.contract_campaign_id);

      // Update campaign status in Supabase
      await supabase
        .from('campaigns')
        .update({ status: 'completed' })
        .eq('id', campaignId);

      return {
        success: true,
        transactionHash: result.transactionHash
      };

    } catch (error: any) {
      console.error('Failed to withdraw funds:', error);
      return {
        success: false,
        error: error.message || 'Failed to withdraw funds'
      };
    }
  }

  /**
   * Check if user can claim refund (campaign failed, didn't reach 70%)
   */
  async canClaimRefund(campaignId: string, userAddress: string): Promise<boolean> {
    try {
      const campaign = await campaignService.getCampaign(campaignId);
      
      if (!campaign.contract_campaign_id) {
        return false; // No smart contract campaign
      }

      // Check smart contract
      return await contractService.canClaimRefund(campaign.contract_campaign_id, userAddress);
    } catch (error) {
      console.error('Failed to check refund eligibility:', error);
      return false;
    }
  }

  /**
   * Claim refund from smart contract (contributors only)
   */
  async claimRefund(campaignId: string): Promise<RefundResult> {
    try {
      const campaign = await campaignService.getCampaign(campaignId);
      
      if (!campaign.contract_campaign_id) {
        throw new Error('Campaign not linked to smart contract');
      }

      // Initialize contract service (connects wallet)
      await contractService.initialize();

      // Claim refund from smart contract
      const result = await contractService.claimRefund(campaign.contract_campaign_id);

      return {
        success: true,
        transactionHash: result.transactionHash
      };

    } catch (error: any) {
      console.error('Failed to claim refund:', error);
      return {
        success: false,
        error: error.message || 'Failed to claim refund'
      };
    }
  }

  /**
   * Get user's contribution to a campaign
   */
  async getUserContribution(campaignId: string, userId: string): Promise<number> {
    try {
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select('amount')
        .eq('campaign_id', campaignId)
        .eq('user_id', userId);

      if (error) throw error;

      return contributions.reduce((sum, contrib) => sum + contrib.amount, 0);
    } catch (error) {
      console.error('Failed to get user contribution:', error);
      return 0;
    }
  }

  /**
   * Get campaign progress and withdrawal status
   */
  async getCampaignStatus(campaignId: string) {
    try {
      const campaign = await campaignService.getCampaign(campaignId);
      const progressPercentage = (campaign.raised / campaign.goal) * 100;
      const canWithdraw = await this.canWithdrawFunds(campaignId);
      
      return {
        campaign,
        progressPercentage,
        canWithdraw,
        hasReached70Percent: progressPercentage >= 70,
        isCompleted: campaign.status === 'completed'
      };
    } catch (error) {
      console.error('Failed to get campaign status:', error);
      throw error;
    }
  }

  /**
   * Get all contributions for a campaign
   */
  async getCampaignContributions(campaignId: string) {
    try {
      const { data: contributions, error } = await supabase
        .from('contributions')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('status', 'confirmed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return contributions || [];
    } catch (error) {
      console.error('Failed to get campaign contributions:', error);
      return [];
    }
  }
}

export const vaultService = new VaultService();
