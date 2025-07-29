// Production Safety Checks
import { BASE_PAY_CONFIG, validateConfig, isValidAddress } from '@/config/basePay';

export interface ProductionCheckResult {
  isReady: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

export function runProductionChecks(): ProductionCheckResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const recommendations: string[] = [];

  // 1. Environment Configuration
  if (BASE_PAY_CONFIG.TESTNET) {
    warnings.push('⚠️ Still using testnet - switch to mainnet for production');
  }

  // 2. Platform Configuration
  if (!BASE_PAY_CONFIG.PLATFORM_NAME) {
    warnings.push('⚠️ Platform name not configured');
  }

  // 3. Base Pay Configuration
  if (BASE_PAY_CONFIG.TESTNET) {
    warnings.push('⚠️ Still using testnet - switch to mainnet for production');
  }

  // 4. Security Checks
  if (import.meta.env.DEV) {
    warnings.push('⚠️ Running in development mode');
  }

  // 5. HTTPS Check (in browser)
  if (typeof window !== 'undefined' && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    errors.push('❌ Must use HTTPS in production');
  }

  // 6. Recommendations
  recommendations.push('💡 Set up analytics (Google Analytics, Mixpanel)');
  recommendations.push('💡 Add error tracking (Sentry)');
  recommendations.push('💡 Implement proper database (replace localStorage)');
  recommendations.push('💡 Add email notifications for campaigns');
  recommendations.push('💡 Set up monitoring and alerts');
  recommendations.push('💡 Add campaign verification system');
  recommendations.push('💡 Implement user authentication');
  recommendations.push('💡 Add campaign categories and search');

  const isReady = errors.length === 0;

  return {
    isReady,
    warnings,
    errors,
    recommendations
  };
}

export function logProductionStatus() {
  const checks = runProductionChecks();
  
  console.log('🚀 BaseFunded Production Readiness Check');
  console.log('==========================================');
  
  if (checks.isReady) {
    console.log('✅ Ready for production!');
  } else {
    console.log('❌ Not ready for production');
  }
  
  if (checks.errors.length > 0) {
    console.log('\n🚨 Critical Issues:');
    checks.errors.forEach(error => console.log(error));
  }
  
  if (checks.warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    checks.warnings.forEach(warning => console.log(warning));
  }
  
  if (checks.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    checks.recommendations.forEach(rec => console.log(rec));
  }
  
  return checks;
}
