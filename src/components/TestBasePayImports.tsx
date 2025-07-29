// Test what's actually available in the Base Pay packages
import { useState } from 'react';

export function TestBasePayImports() {
  const [results, setResults] = useState<string[]>([]);

  const testAccountPackage = async () => {
    try {
      const accountModule = await import('@base-org/account');
      console.log('📦 @base-org/account exports:', Object.keys(accountModule));
      setResults(prev => [...prev, `✅ @base-org/account: ${Object.keys(accountModule).join(', ')}`]);
    } catch (error) {
      setResults(prev => [...prev, `❌ @base-org/account failed: ${error}`]);
    }
  };

  const testUIPackage = async () => {
    try {
      // Try different React import paths
      const paths = [
        '@base-org/account-ui/dist/frameworks/react/index.js',
        '@base-org/account-ui/dist/frameworks/react/BasePayButton.js'
      ];

      for (const path of paths) {
        try {
          const uiModule = await import(path);
          console.log(`📦 ${path} exports:`, Object.keys(uiModule));
          setResults(prev => [...prev, `✅ ${path}: ${Object.keys(uiModule).join(', ')}`]);
          return;
        } catch (e) {
          console.log(`❌ ${path} failed:`, e);
        }
      }

      setResults(prev => [...prev, `❌ All React UI import paths failed`]);
    } catch (error) {
      setResults(prev => [...prev, `❌ @base-org/account-ui React failed: ${error}`]);
    }
  };

  const testUIRoot = async () => {
    try {
      // Try different import paths
      const paths = [
        '@base-org/account-ui',
        '@base-org/account-ui/dist',
        '@base-org/account-ui/lib'
      ];

      for (const path of paths) {
        try {
          const uiModule = await import(path);
          console.log(`📦 ${path} exports:`, Object.keys(uiModule));
          setResults(prev => [...prev, `✅ ${path}: ${Object.keys(uiModule).join(', ')}`]);
          return;
        } catch (e) {
          console.log(`❌ ${path} failed:`, e);
        }
      }

      setResults(prev => [...prev, `❌ All @base-org/account-ui paths failed`]);
    } catch (error) {
      setResults(prev => [...prev, `❌ @base-org/account-ui failed: ${error}`]);
    }
  };

  const clearResults = () => setResults([]);

  return (
    <div className="p-4 border rounded-lg bg-muted/30">
      <h3 className="font-semibold mb-4">Base Pay Package Explorer</h3>
      
      <div className="space-x-2 mb-4">
        <button 
          onClick={testAccountPackage}
          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Test @base-org/account
        </button>
        
        <button 
          onClick={testUIPackage}
          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
        >
          Test @base-org/account-ui/react
        </button>
        
        <button 
          onClick={testUIRoot}
          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
        >
          Test @base-org/account-ui
        </button>
        
        <button 
          onClick={clearResults}
          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
      
      <div className="space-y-2">
        {results.map((result, index) => (
          <div key={index} className="p-2 bg-gray-100 rounded text-xs font-mono">
            {result}
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-xs text-muted-foreground">
        <p>Check the browser console for detailed export information</p>
      </div>
    </div>
  );
}
