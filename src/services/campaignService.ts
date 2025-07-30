import { supabase, Campaign, Contribution } from '@/lib/supabase'

export class CampaignService {
  // Create a new campaign
  async createCampaign(campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at' | 'raised'>) {
    const { data, error } = await supabase
      .from('campaigns')
      .insert([{
        ...campaignData,
        raised: 0,
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Get all campaigns
  async getCampaigns() {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Get campaign by ID
  async getCampaign(id: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  // Get campaigns by user
  async getUserCampaigns(userId: string) {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Update campaign
  async updateCampaign(id: string, updates: Partial<Campaign>) {
    const { data, error } = await supabase
      .from('campaigns')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Add contribution
  async addContribution(contributionData: Omit<Contribution, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contributions')
      .insert([contributionData])
      .select()
      .single()

    if (error) throw error

    // Update campaign raised amount
    await this.updateCampaignRaisedAmount(contributionData.campaign_id)

    return data
  }

  // Get contributions for a campaign
  async getCampaignContributions(campaignId: string) {
    const { data, error } = await supabase
      .from('contributions')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Update campaign raised amount
  private async updateCampaignRaisedAmount(campaignId: string) {
    const { data: contributions, error: contributionsError } = await supabase
      .from('contributions')
      .select('amount')
      .eq('campaign_id', campaignId)
      .eq('status', 'confirmed')

    if (contributionsError) throw contributionsError

    const totalRaised = contributions?.reduce((sum, contribution) => sum + contribution.amount, 0) || 0

    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ raised: totalRaised })
      .eq('id', campaignId)

    if (updateError) throw updateError
  }

  // Update contribution status
  async updateContributionStatus(id: string, status: Contribution['status'], transactionHash?: string) {
    const updateData: any = { status }
    if (transactionHash) {
      updateData.transaction_hash = transactionHash
    }

    const { data, error } = await supabase
      .from('contributions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // If contribution is confirmed, update campaign raised amount
    if (status === 'confirmed') {
      await this.updateCampaignRaisedAmount(data.campaign_id)
    }

    return data
  }

  // Get campaign statistics
  async getCampaignStats(campaignId: string) {
    const { data: contributions, error } = await supabase
      .from('contributions')
      .select('amount, wallet_address')
      .eq('campaign_id', campaignId)
      .eq('status', 'confirmed')

    if (error) throw error

    const totalRaised = contributions?.reduce((sum, contribution) => sum + contribution.amount, 0) || 0
    const contributorCount = new Set(contributions?.map(c => c.wallet_address)).size || 0

    return {
      totalRaised,
      contributorCount,
      contributions: contributions || []
    }
  }
}

export const campaignService = new CampaignService()
