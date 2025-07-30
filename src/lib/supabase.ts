import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rjiphimjekisrfwbqiov.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqaXBoaW1qZWtpc3Jmd2JxaW92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzMwOTAsImV4cCI6MjA2OTQwOTA5MH0.XpDcHoSp1B69ctcnFW8fhLK9jNLyQAhVhfnxIa5xF3E'

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
)

// Database types
export interface Campaign {
  id: string
  title: string
  description: string
  goal: number
  raised: number
  location: string
  beneficiaries: number
  category: string
  recipient_address: string
  created_at: string
  updated_at: string
  user_id: string
  status: 'active' | 'completed' | 'paused'
  image_url?: string
}

export interface Contribution {
  id: string
  campaign_id: string
  user_id?: string
  amount: number
  transaction_hash: string
  wallet_address: string
  created_at: string
  status: 'pending' | 'confirmed' | 'failed'
}

export interface Profile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
