import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Play, RefreshCw, CheckCircle, XCircle, Loader2, Eye, Code } from 'lucide-react';
import { vaultTester, MOCK_CAMPAIGNS, TestResults } from '@/utils/testVault';
import { useAuth } from '@/contexts/AuthContext';
import { contractService } from '@/services/contractService';

export function TestVault() {
  const { user } = useAuth();
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResults[]>([]);
  const [selectedMockCampaign, setSelectedMockCampaign] = useState(0);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletBalance, setWalletBalance] = useState<string>('0');

  const connectWallet = async () => {
    try {
      await contractService.initialize();
      const address = await contractService.getUserAddress();
      const balance = await contractService.getUserBalance();

      setWalletConnected(true);
      setWalletAddress(address);
      setWalletBalance(balance);

      toast({
        title: "✅ Wallet Connected",
        description: `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`,
        duration: 3000,
      });
    } catch (error: any) {
      toast({
        title: "❌ Wallet Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const runVaultTests = async () => {
    if (!user) {
      toast({
        title: "❌ Authentication Required",
        description: "Please sign in to run vault tests",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    try {
      console.clear();
      console.log('🧪 VAULT TESTING STARTED');
      console.log('='.repeat(50));

      const mockCampaign = MOCK_CAMPAIGNS[selectedMockCampaign];
      const results = await vaultTester.createMockCampaign(mockCampaign, user.id);
      
      setTestResults(results);
      vaultTester.printSummary();

      const passedTests = results.filter(r => r.success).length;
      const totalTests = results.length;

      toast({
        title: `🧪 Tests Completed: ${passedTests}/${totalTests}`,
        description: `Check console for detailed output. ${passedTests === totalTests ? 'All tests passed!' : 'Some tests failed.'}`,
        duration: 8000,
      });

    } catch (error: any) {
      console.error('❌ Test execution failed:', error);
      toast({
        title: "❌ Test Execution Failed",
        description: error.message || "Failed to run vault tests",
        variant: "destructive",
        duration: 8000,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    console.clear();
  };

  const viewConsoleOutput = (result: TestResults) => {
    console.group(`🔍 Console Output for: ${result.step}`);
    console.log(result.consoleOutput);
    console.groupEnd();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🧪 Vault System Testing
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Test the complete vault system flow: campaign creation, contributions, withdrawals, and refunds.
            All console output will be logged for debugging.
          </p>
        </div>

        {/* Test Controls */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Play className="w-5 h-5" />
              <span>Test Controls</span>
            </CardTitle>
            <CardDescription>
              Select a mock campaign and run comprehensive vault tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            {/* Mock Campaign Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Mock Campaign:
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_CAMPAIGNS.map((campaign, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedMockCampaign === index
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedMockCampaign(index)}
                  >
                    <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{campaign.description.slice(0, 100)}...</p>
                    <div className="flex justify-between items-center mt-2">
                      <Badge variant="secondary">{campaign.category}</Badge>
                      <span className="text-sm font-medium">${campaign.goalUSD} goal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wallet Connection */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-blue-900 mb-2">🔗 Wallet Connection (Required for Smart Contract Tests)</h3>
              {walletConnected ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">
                      <strong>Address:</strong> {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                    </p>
                    <p className="text-sm text-blue-700">
                      <strong>Balance:</strong> {parseFloat(walletBalance).toFixed(4)} ETH
                    </p>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">
                    Connect your MetaMask wallet to test smart contract interactions
                  </p>
                  <Button onClick={connectWallet} variant="outline" size="sm">
                    Connect Wallet
                  </Button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={runVaultTests}
                disabled={isRunning || !user}
                className="flex items-center space-x-2"
                size="lg"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running Tests...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Run Vault Tests</span>
                  </>
                )}
              </Button>

              <Button
                onClick={clearResults}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Clear Results</span>
              </Button>
            </div>

            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800">
                  ⚠️ Please sign in to run vault tests. Tests require user authentication.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Code className="w-5 h-5" />
                  <span>Test Results</span>
                </div>
                <Badge variant={testResults.every(r => r.success) ? "default" : "destructive"}>
                  {testResults.filter(r => r.success).length}/{testResults.length} Passed
                </Badge>
              </CardTitle>
              <CardDescription>
                Detailed results from vault system testing. Click "View Console" to see raw output.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 border rounded-lg ${
                      result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                        <div>
                          <h3 className="font-medium text-gray-900">{result.step}</h3>
                          {result.error && (
                            <p className="text-sm text-red-600 mt-1">{result.error}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        onClick={() => viewConsoleOutput(result)}
                        variant="outline"
                        size="sm"
                        className="flex items-center space-x-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View Console</span>
                      </Button>
                    </div>

                    {result.data && (
                      <div className="mt-3 p-3 bg-gray-100 rounded text-sm">
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(result.data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Get Testnet Funds */}
        <Card className="mt-8 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900">💰 Need Base Sepolia Testnet ETH?</CardTitle>
            <CardDescription className="text-orange-700">
              You need testnet ETH to interact with the smart contract. Here's how to get it:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h3 className="font-medium text-gray-900 mb-2">🥇 Alchemy Faucet</h3>
                <p className="text-sm text-gray-600 mb-3">0.5 ETH per day (Recommended)</p>
                <a
                  href="https://www.alchemy.com/faucets/base-sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Get Testnet ETH →
                </a>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h3 className="font-medium text-gray-900 mb-2">🏦 Coinbase Faucet</h3>
                <p className="text-sm text-gray-600 mb-3">0.1 ETH per day</p>
                <a
                  href="https://coinbase.com/faucets/base-sepolia-faucet"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Get Testnet ETH →
                </a>
              </div>
              <div className="bg-white p-4 rounded-lg border border-orange-200">
                <h3 className="font-medium text-gray-900 mb-2">⚡ QuickNode Faucet</h3>
                <p className="text-sm text-gray-600 mb-3">0.05 ETH per request</p>
                <a
                  href="https://faucet.quicknode.com/base/sepolia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  Get Testnet ETH →
                </a>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-orange-200">
              <h3 className="font-medium text-gray-900 mb-2">🔧 Setup Base Sepolia Network in MetaMask:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Network Name:</strong> Base Sepolia</p>
                <p><strong>RPC URL:</strong> https://sepolia.base.org</p>
                <p><strong>Chain ID:</strong> 84532</p>
                <p><strong>Currency Symbol:</strong> ETH</p>
                <p><strong>Block Explorer:</strong> https://sepolia-explorer.base.org</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>📋 Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">What Gets Tested:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Smart contract connection</li>
                  <li>• Campaign creation (Supabase + Contract)</li>
                  <li>• Contribution recording</li>
                  <li>• Campaign status checking</li>
                  <li>• Withdrawal eligibility</li>
                  <li>• Refund eligibility</li>
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Console Output:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Open browser DevTools (F12)</li>
                  <li>• Go to Console tab</li>
                  <li>• Run tests to see detailed logs</li>
                  <li>• Each step shows success/failure</li>
                  <li>• Transaction hashes and data included</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
