# Supabase Setup Guide for BaseFunded

This guide will help you set up Supabase authentication and database for the BaseFunded application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - Name: `basefunded` or similar
   - Database Password: Generate a strong password
   - Region: Choose closest to your users
5. Click "Create new project"

## 2. Get Your Project Credentials

1. Go to Project Settings → API
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9`)

## 3. Set Environment Variables

Create a `.env.local` file in your project root:

```env
# Copy from .env.example and add these Supabase values:
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Base Pay Configuration
VITE_BASE_PAY_TESTNET=true
VITE_RECIPIENT_ADDRESS=your_wallet_address_here

# Campaign Configuration
VITE_CAMPAIGN_TITLE="Fund Web3 Dev School in Lagos"
VITE_CAMPAIGN_GOAL=500
```

## 4. Create Database Tables

Go to your Supabase project → SQL Editor and run these commands:

### Create Campaigns Table
```sql
CREATE TABLE campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal DECIMAL NOT NULL,
  raised DECIMAL DEFAULT 0,
  location TEXT NOT NULL,
  beneficiaries INTEGER NOT NULL,
  category TEXT NOT NULL,
  recipient_address TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create Contributions Table
```sql
CREATE TABLE contributions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount DECIMAL NOT NULL,
  transaction_hash TEXT NOT NULL,
  wallet_address TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Create Profiles Table
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 5. Set Up Row Level Security (RLS)

### Enable RLS on all tables:
```sql
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

### Create RLS Policies:

#### Campaigns Policies
```sql
-- Anyone can view active campaigns
CREATE POLICY "Anyone can view active campaigns" ON campaigns
  FOR SELECT USING (status = 'active');

-- Users can create campaigns
CREATE POLICY "Users can create campaigns" ON campaigns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own campaigns
CREATE POLICY "Users can update own campaigns" ON campaigns
  FOR UPDATE USING (auth.uid() = user_id);
```

#### Contributions Policies
```sql
-- Anyone can view confirmed contributions
CREATE POLICY "Anyone can view confirmed contributions" ON contributions
  FOR SELECT USING (status = 'confirmed');

-- Anyone can create contributions (for anonymous donations)
CREATE POLICY "Anyone can create contributions" ON contributions
  FOR INSERT WITH CHECK (true);

-- Only system can update contribution status (you might want to restrict this further)
CREATE POLICY "System can update contributions" ON contributions
  FOR UPDATE USING (true);
```

#### Profiles Policies
```sql
-- Users can view all profiles
CREATE POLICY "Users can view profiles" ON profiles
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 6. Set Up Authentication Providers (Optional)

### Enable Google OAuth:
1. Go to Authentication → Providers
2. Enable Google provider
3. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project-id.supabase.co/auth/v1/callback`

## 7. Create Profile Trigger

Create a trigger to automatically create a profile when a user signs up:

```sql
-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 8. Test Your Setup

1. Start your development server: `npm run dev`
2. Go to `/auth` and try signing up
3. Check your Supabase dashboard to see if the user was created
4. Try creating a campaign (requires authentication)

## 9. Production Considerations

### Security:
- Review and tighten RLS policies
- Set up proper CORS settings
- Use environment-specific Supabase projects

### Performance:
- Add database indexes for frequently queried fields
- Set up database backups
- Monitor query performance

### Monitoring:
- Set up Supabase alerts
- Monitor authentication metrics
- Track database usage

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**
   - Make sure `.env.local` exists and has correct values
   - Restart your development server after adding env vars

2. **Authentication not working**
   - Check if RLS policies are correctly set up
   - Verify Supabase URL and anon key are correct

3. **Database errors**
   - Check if tables exist and have correct structure
   - Verify RLS policies allow the operations you're trying to perform

### Getting Help:
- Check Supabase documentation: https://supabase.com/docs
- Join Supabase Discord: https://discord.supabase.com
- Check the browser console for detailed error messages
