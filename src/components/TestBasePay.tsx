// Test component to verify Base Pay packages are working
import { useState } from 'react';

export function TestBasePay() {
  const [testResult, setTestResult] = useState<string>('');

  const testImports = async () => {
    try {
      console.log('🧪 Testing Base Pay imports...');
      
      // Test @base-org/account import
      const accountModule = await import('@base-org/account');
      console.log('✅ @base-org/account imported:', accountModule);
      
      // Test @base-org/account-ui import
      const uiModule = await import('@base-org/account-ui/react');
      console.log('✅ @base-org/account-ui imported:', uiModule);
      
      setTestResult('✅ All Base Pay packages imported successfully!');
      
    } catch (error) {
      console.error('❌ Base Pay import failed:', error);
      setTestResult(`❌ Import failed: ${error}`);
    }
  };

  const testBasicPay = async () => {
    try {
      console.log('🧪 Testing basic pay function...');
      
      const { pay } = await import('@base-org/account');
      console.log('✅ Pay function imported:', pay);
      
      // Don't actually call it, just test if it exists
      setTestResult('✅ Pay function is available!');
      
    } catch (error) {
      console.error('❌ Pay function test failed:', error);
      setTestResult(`❌ Pay function test failed: ${error}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <h3 className="font-semibold mb-4">Base Pay Integration Test</h3>
      
      <div className="space-y-2 mb-4">
        <button 
          onClick={testImports}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Package Imports
        </button>
        
        <button 
          onClick={testBasicPay}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
        >
          Test Pay Function
        </button>
      </div>
      
      {testResult && (
        <div className="p-3 bg-gray-100 rounded text-sm font-mono">
          {testResult}
        </div>
      )}
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Check the browser console for detailed logs</p>
      </div>
    </div>
  );
}
