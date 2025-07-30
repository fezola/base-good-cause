/**
 * Utility to verify Base Pay SDK installation and functionality
 */

export const verifyBasePayInstallation = async () => {
  const results = {
    accountPackage: false,
    accountUIPackage: false,
    createSDK: false,
    payFunction: false,
    components: false,
    errors: [] as string[]
  };

  try {
    // Test @base-org/account package
    const accountModule = await import('@base-org/account');
    if (accountModule.createBaseAccountSDK && accountModule.pay && accountModule.getPaymentStatus) {
      results.accountPackage = true;
      console.log('✅ @base-org/account package loaded successfully');
    } else {
      results.errors.push('@base-org/account missing required exports');
    }
  } catch (error) {
    results.errors.push(`@base-org/account import failed: ${error.message}`);
  }

  try {
    // Test @base-org/account-ui package
    const uiModule = await import('@base-org/account-ui/react');
    if (uiModule.BasePayButton && uiModule.SignInWithBaseButton) {
      results.accountUIPackage = true;
      console.log('✅ @base-org/account-ui package loaded successfully');
    } else {
      results.errors.push('@base-org/account-ui missing required components');
    }
  } catch (error) {
    results.errors.push(`@base-org/account-ui import failed: ${error.message}`);
  }

  try {
    // Test SDK creation
    if (results.accountPackage) {
      const { createBaseAccountSDK } = await import('@base-org/account');
      const sdk = createBaseAccountSDK({
        appName: 'BaseFunded Test',
        appLogo: 'https://example.com/logo.png',
      });
      
      if (sdk) {
        results.createSDK = true;
        console.log('✅ Base Account SDK created successfully');
      }
    }
  } catch (error) {
    results.errors.push(`SDK creation failed: ${error.message}`);
  }

  try {
    // Test pay function availability
    if (results.accountPackage) {
      const { pay } = await import('@base-org/account');
      if (typeof pay === 'function') {
        results.payFunction = true;
        console.log('✅ Pay function available');
      }
    }
  } catch (error) {
    results.errors.push(`Pay function test failed: ${error.message}`);
  }

  try {
    // Test component availability
    if (results.accountUIPackage) {
      const { BasePayButton, SignInWithBaseButton } = await import('@base-org/account-ui/react');
      if (BasePayButton && SignInWithBaseButton) {
        results.components = true;
        console.log('✅ Base Pay components available');
      }
    }
  } catch (error) {
    results.errors.push(`Component test failed: ${error.message}`);
  }

  return results;
};

export const printVerificationResults = (results: any) => {
  console.log('\n🔍 Base Pay Installation Verification Results:');
  console.log('='.repeat(50));
  
  console.log(`📦 @base-org/account: ${results.accountPackage ? '✅' : '❌'}`);
  console.log(`🎨 @base-org/account-ui: ${results.accountUIPackage ? '✅' : '❌'}`);
  console.log(`⚙️ SDK Creation: ${results.createSDK ? '✅' : '❌'}`);
  console.log(`💳 Pay Function: ${results.payFunction ? '✅' : '❌'}`);
  console.log(`🧩 UI Components: ${results.components ? '✅' : '❌'}`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((error, index) => {
      console.log(`${index + 1}. ${error}`);
    });
  }
  
  const allPassed = results.accountPackage && results.accountUIPackage && 
                   results.createSDK && results.payFunction && results.components;
  
  console.log('\n' + '='.repeat(50));
  console.log(`Overall Status: ${allPassed ? '✅ READY' : '❌ ISSUES FOUND'}`);
  
  if (!allPassed) {
    console.log('\n💡 Troubleshooting:');
    console.log('1. Ensure packages are installed: npm install @base-org/account @base-org/account-ui');
    console.log('2. Check for version compatibility');
    console.log('3. Restart the development server');
    console.log('4. Clear node_modules and reinstall if needed');
  }
  
  return allPassed;
};

// Auto-run verification in development
if (import.meta.env.DEV) {
  verifyBasePayInstallation().then(printVerificationResults);
}
