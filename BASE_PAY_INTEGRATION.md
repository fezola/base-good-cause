# BaseFunded - Base Pay Integration Guide

## 🎯 Overview

BaseFunded is now integrated with **Base Pay** for seamless, gasless USDC payments on Base Chain. This integration provides:

- ✅ **One-click payments** with Base Pay popup UI
- ✅ **Gasless USDC transactions**
- ✅ **Clean, minimal interface** - no development clutter
- ✅ **Official Base Pay UI** - triggers the real Base Pay popup
- ✅ **Real-time payment status** tracking
- ✅ **User info collection** (email, name, etc.)
- ✅ **Testnet support** for development
- ✅ **Block explorer integration**

## 🎨 **Clean User Experience**

The main campaign page is now clean and focused:
- **No development status clutter** on the main page
- **Official Base Pay button** that triggers the real Base Pay popup
- **Simple, professional crowdfunding interface**
- **Development tools** moved to `/dev-status` page (only in dev mode)

## 🚀 Quick Start

### 1. Install Base Pay Packages

```bash
# Run the installation script
./install-base-pay.bat

# Or install manually
npm install @base-org/account @base-org/account-ui
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```

Update `.env.local`:
```env
# Base Pay Configuration
VITE_BASE_PAY_TESTNET=true
VITE_RECIPIENT_ADDRESS=your_wallet_address_here
VITE_CONTRIBUTION_AMOUNT=5

# Campaign Configuration  
VITE_CAMPAIGN_TITLE="Your Campaign Title"
VITE_CAMPAIGN_GOAL=500
```

### 3. Enable Real Base Pay

Once packages are installed, update these files:

**src/services/basePayService.ts:**
- Uncomment the real Base Pay implementation
- Comment out the mock implementation

**src/components/BasePayButton.tsx:**
- Uncomment the real BasePayButton import
- Comment out the mock implementation

## 🏗️ Architecture

### Core Components

1. **BasePayService** (`src/services/basePayService.ts`)
   - Handles payment processing
   - Manages payment status polling
   - Provides configuration helpers

2. **ContributeButton** (`src/components/ContributeButton.tsx`)
   - Enhanced with Base Pay integration
   - Shows payment status (processing, success, error)
   - Collects user information

3. **BasePayButton** (`src/components/BasePayButton.tsx`)
   - Official Base Pay UI component wrapper
   - Handles payment flow and results

4. **Configuration** (`src/config/basePay.ts`)
   - Centralized Base Pay settings
   - Network configuration (mainnet/testnet)
   - Validation helpers

### Payment Flow

```mermaid
graph TD
    A[User clicks Contribute] --> B[ContributeButton]
    B --> C[BasePayService.pay()]
    C --> D[Base Pay Popup]
    D --> E{Payment Success?}
    E -->|Yes| F[Update UI + Toast]
    E -->|No| G[Show Error]
    F --> H[Poll Payment Status]
    H --> I[Update Contributors List]
```

## 🔧 Configuration Options

### Network Settings

```typescript
// Testnet (Base Sepolia)
VITE_BASE_PAY_TESTNET=true

// Mainnet (Base)
VITE_BASE_PAY_TESTNET=false
```

### Payment Options

```typescript
const paymentOptions = {
  amount: '5.00',           // USD amount
  to: 'recipient_address',  // Your wallet
  testnet: true,           // Network selection
  payerInfo: {             // Optional user info
    requests: [
      { type: 'email', optional: false },
      { type: 'name', optional: true }
    ]
  }
};
```

## 🧪 Testing

### Testnet Testing

1. **Get Test USDC:**
   - Visit [Circle Faucet](https://faucet.circle.com)
   - Select "Base Sepolia"
   - Get test USDC for your wallet

2. **Test Payment Flow:**
   - Set `VITE_BASE_PAY_TESTNET=true`
   - Click contribute button
   - Complete payment in Base Pay popup
   - Verify transaction on [Sepolia BaseScan](https://sepolia.basescan.org)

### Production Testing

1. **Switch to Mainnet:**
   ```env
   VITE_BASE_PAY_TESTNET=false
   VITE_RECIPIENT_ADDRESS=your_mainnet_address
   ```

2. **Test with Real USDC:**
   - Use small amounts for testing
   - Verify on [BaseScan](https://basescan.org)

## 🎨 UI Features

### Payment States

- **Idle:** Default "Contribute with Base Pay" button
- **Processing:** Spinner with "Processing Payment..."
- **Success:** Green checkmark with "Payment Successful!"
- **Error:** Red X with "Payment Failed"

### User Experience

- **Toast Notifications:** Success/error messages
- **Block Explorer Links:** Direct links to transactions
- **Real-time Updates:** Contributors list updates immediately
- **Responsive Design:** Works on mobile and desktop

## 🔒 Security

### Best Practices

1. **Environment Variables:**
   - Never commit `.env.local` to git
   - Use different addresses for testnet/mainnet
   - Validate all configuration on startup

2. **Address Validation:**
   ```typescript
   import { isValidAddress } from '@/config/basePay';
   
   if (!isValidAddress(recipientAddress)) {
     throw new Error('Invalid recipient address');
   }
   ```

3. **Amount Validation:**
   ```typescript
   import { isValidAmount } from '@/config/basePay';
   
   if (!isValidAmount(amount)) {
     throw new Error('Invalid payment amount');
   }
   ```

## 📊 Analytics & Monitoring

### Payment Tracking

```typescript
// Log successful payments
console.log('✅ Payment successful:', {
  transactionHash: result.transactionHash,
  amount: paymentOptions.amount,
  recipient: paymentOptions.to,
  userInfo: result.userInfo
});
```

### Error Monitoring

```typescript
// Track payment failures
console.error('❌ Payment failed:', {
  error: result.error,
  amount: paymentOptions.amount,
  timestamp: new Date().toISOString()
});
```

## 🚀 Deployment

### Environment Variables

**Production (.env.local):**
```env
VITE_BASE_PAY_TESTNET=false
VITE_RECIPIENT_ADDRESS=0xYourMainnetAddress
VITE_CONTRIBUTION_AMOUNT=5
VITE_CAMPAIGN_GOAL=500
```

**Staging (.env.staging):**
```env
VITE_BASE_PAY_TESTNET=true
VITE_RECIPIENT_ADDRESS=0xYourTestnetAddress
VITE_CONTRIBUTION_AMOUNT=1
VITE_CAMPAIGN_GOAL=100
```

### Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

## 🎯 Base Builder Quest 8 Requirements

✅ **Stellar UX:** One-click payments with Base Pay  
✅ **Base Pay Integration:** Official SDK implementation  
✅ **Unique Use-case:** Onchain micro-crowdfunding  
✅ **Real-time Updates:** Live progress tracking  
✅ **Mobile Responsive:** Works on all devices  
✅ **Error Handling:** Graceful failure states  

## 🔗 Resources

- [Base Pay Documentation](https://docs.base.org/base-account/guides/accept-payments)
- [Base Pay Button Reference](https://docs.base.org/base-account/reference/ui-elements/base-pay-button)
- [Circle USDC Faucet](https://faucet.circle.com)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [Base Mainnet Explorer](https://basescan.org)

## 🆘 Troubleshooting

### Common Issues

1. **"Payment failed" error:**
   - Check recipient address is valid
   - Ensure user has sufficient USDC
   - Verify network configuration

2. **"Packages not found" error:**
   - Run `npm install @base-org/account @base-org/account-ui`
   - Check package.json for correct versions

3. **Testnet not working:**
   - Get test USDC from Circle faucet
   - Verify `VITE_BASE_PAY_TESTNET=true`
   - Check Base Sepolia network status

### Support

- [Base Discord](https://discord.com/invite/buildonbase)
- [Base GitHub](https://github.com/base)
- [Base Documentation](https://docs.base.org)

---

**Ready to accept payments on Base! 🚀**
