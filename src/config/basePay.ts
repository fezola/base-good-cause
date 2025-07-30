// Base Pay Configuration
// Centralized configuration for Base Pay integration

export const BASE_PAY_CONFIG = {
  // Network Configuration
  TESTNET: import.meta.env.VITE_BASE_PAY_TESTNET === 'true',
  ENVIRONMENT: import.meta.env.VITE_ENVIRONMENT || 'development',
  
  // Platform Configuration
  PLATFORM_NAME: import.meta.env.VITE_PLATFORM_NAME || 'FundMe',
  PLATFORM_DESCRIPTION: import.meta.env.VITE_PLATFORM_DESCRIPTION || 'Decentralized Crowdfunding Platform',

  // Contribution Configuration
  PRESET_AMOUNTS: [5, 10, 25, 50, 100], // Default preset amounts for flexible contributions
  DEFAULT_SELECTED_AMOUNT: 10, // Default selected amount
  
  // Campaign Details
  CAMPAIGN: {
    TITLE: import.meta.env.VITE_CAMPAIGN_TITLE || 'Fund Web3 Dev School in Lagos',
    GOAL: parseInt(import.meta.env.VITE_CAMPAIGN_GOAL || '500'),
    DESCRIPTION: 'Help us send 10 talented young developers from Lagos to an intensive 6-month Web3 bootcamp.',
    LOCATION: 'Lagos, Nigeria',
    BENEFICIARIES: 10
  },
  
  // Base Chain Configuration
  CHAIN: {
    MAINNET: {
      chainId: 8453,
      name: 'Base',
      rpcUrl: 'https://mainnet.base.org',
      blockExplorer: 'https://basescan.org'
    },
    TESTNET: {
      chainId: 84532,
      name: 'Base Sepolia',
      rpcUrl: 'https://sepolia.base.org',
      blockExplorer: 'https://sepolia.basescan.org'
    }
  },
  
  // USDC Contract Addresses
  USDC: {
    MAINNET: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    TESTNET: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
  },
  
  // UI Configuration
  UI: {
    BRAND_COLORS: {
      PRIMARY: '#0052FF', // Base blue
      SUCCESS: '#00D395', // Base green
      BACKGROUND: '#FFFFFF',
      TEXT: '#1A1A1A'
    },
    BUTTON_SIZES: {
      SMALL: 'small',
      MEDIUM: 'medium', 
      LARGE: 'large'
    },
    COLOR_SCHEMES: {
      LIGHT: 'light',
      DARK: 'dark',
      SYSTEM: 'system'
    }
  },
  
  // Payment Configuration
  PAYMENT: {
    TIMEOUT_MS: 30000, // 30 seconds
    POLLING_INTERVAL_MS: 2000, // 2 seconds
    MAX_RETRIES: 3
  }
} as const;

// Helper functions
export const getChainConfig = () => {
  return BASE_PAY_CONFIG.TESTNET ? BASE_PAY_CONFIG.CHAIN.TESTNET : BASE_PAY_CONFIG.CHAIN.MAINNET;
};

export const getUSDCAddress = () => {
  return BASE_PAY_CONFIG.TESTNET ? BASE_PAY_CONFIG.USDC.TESTNET : BASE_PAY_CONFIG.USDC.MAINNET;
};

export const getBlockExplorerUrl = (txHash: string) => {
  const chain = getChainConfig();
  return `${chain.blockExplorer}/tx/${txHash}`;
};

export const formatAmount = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num);
};

// Validation helpers
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const isValidAmount = (amount: string): boolean => {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0 && num <= 1000000; // Max $1M
};

// Environment validation
export const validateConfig = () => {
  const errors: string[] = [];

  if (!BASE_PAY_CONFIG.PLATFORM_NAME) {
    errors.push('Platform name is required');
  }

  if (!isValidAmount(BASE_PAY_CONFIG.DEFAULT_CONTRIBUTION_AMOUNT)) {
    errors.push('Invalid default contribution amount');
  }

  if (BASE_PAY_CONFIG.CAMPAIGN.GOAL <= 0) {
    errors.push('Invalid campaign goal');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Development helpers
export const isDevelopment = () => {
  return import.meta.env.DEV;
};

export const isProduction = () => {
  return import.meta.env.PROD;
};

// Export default config
export default BASE_PAY_CONFIG;
