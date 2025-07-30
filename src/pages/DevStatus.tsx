// Development Status Page - Only for development
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { TestBasePay } from "@/components/TestBasePay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { clearAllBrowserData } from "@/utils/clearMockData";
import { toast } from "@/hooks/use-toast";
import { BasicPayButton } from "@/components/BasicPayButton";
import { TestPayButton } from "@/components/TestPayButton";
import { OfficialBasePayTest } from "@/components/OfficialBasePayTest";
import { SimpleClickTest } from "@/components/SimpleClickTest";
import { AsyncBasePayButton } from "@/components/AsyncBasePayButton";
import { WorkingBasePayButton } from "@/components/WorkingBasePayButton";
import { RealBasePayButton } from "@/components/RealBasePayButton";
import { verifyBasePayInstallation, printVerificationResults } from "@/utils/verifyBasePay";

const DevStatus = () => {
  const handleClearMockData = () => {
    const success = clearAllBrowserData();
    if (success) {
      toast({
        title: "🗑️ Mock Data Cleared",
        description: "All mock campaigns and test data have been removed. You can now create real campaigns!",
        duration: 5000
      });
    } else {
      toast({
        title: "❌ Clear Failed",
        description: "Failed to clear some mock data. Check console for details.",
        variant: "destructive"
      });
    }
  };

  const handleVerifyBasePay = async () => {
    toast({
      title: "🔍 Verifying Base Pay...",
      description: "Check the console for detailed results",
      duration: 3000
    });

    const results = await verifyBasePayInstallation();
    const success = printVerificationResults(results);

    if (success) {
      toast({
        title: "✅ Base Pay Verified",
        description: "All Base Pay components are working correctly!",
        duration: 5000
      });
    } else {
      toast({
        title: "❌ Base Pay Issues Found",
        description: "Check console for troubleshooting steps",
        variant: "destructive",
        duration: 5000
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Campaign
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-foreground">Development Status</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Base Pay Integration
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Clear Mock Data */}
          <div className="bg-card rounded-lg p-6 shadow-elevation">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Clear Mock Data
            </h3>
            <p className="text-muted-foreground mb-4">
              Remove all mock campaigns, test data, and cached information to start fresh with real campaigns.
            </p>
            <Button
              onClick={handleClearMockData}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear All Mock Data</span>
            </Button>
          </div>

          {/* Simple Click Test */}
          <div className="bg-card rounded-lg p-6 shadow-elevation">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              🎯 Basic Click Test
            </h3>
            <p className="text-muted-foreground mb-4">
              Test if basic button clicks are working at all.
            </p>
            <SimpleClickTest />
          </div>

          {/* Base Pay Verification */}
          <div className="bg-card rounded-lg p-6 shadow-elevation">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              🔍 Base Pay SDK Verification
            </h3>
            <p className="text-muted-foreground mb-4">
              Verify that the Base Pay SDK packages are properly installed and configured.
            </p>
            <Button
              onClick={handleVerifyBasePay}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <span>🔍</span>
              <span>Verify Base Pay Installation</span>
            </Button>
          </div>

          {/* Base Pay Button Test */}
          <div className="bg-card rounded-lg p-6 shadow-elevation">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              💳 Test Base Pay Button
            </h3>
            <p className="text-muted-foreground mb-4">
              Test the actual Base Pay button that's used in campaigns. This will simulate a payment if the Base Pay SDK is not available.
            </p>
            <div className="space-y-4">
              {/* Simple Test Button */}
              <div>
                <h4 className="font-medium mb-2">Simple Test Button:</h4>
                <TestPayButton
                  amount="5.00"
                  recipientAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e"
                  onSuccess={(result) => {
                    toast({
                      title: "🎉 Test Payment Successful!",
                      description: `Payment ID: ${result.id}`,
                      duration: 5000
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: "❌ Test Payment Failed",
                      description: error.message || "Payment failed",
                      variant: "destructive",
                      duration: 5000
                    });
                  }}
                />
              </div>

              {/* Original BasicPayButton */}
              <div>
                <h4 className="font-medium mb-2">BasicPayButton (with Base Pay SDK):</h4>
                <BasicPayButton
                  amount="5.00"
                  recipientAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e"
                  onSuccess={(result) => {
                    toast({
                      title: "🎉 Basic Pay Successful!",
                      description: `Payment ID: ${result.id}`,
                      duration: 5000
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: "❌ Basic Pay Failed",
                      description: error.message || "Payment failed",
                      variant: "destructive",
                      duration: 5000
                    });
                  }}
                />
              </div>

              {/* Async Base Pay Test */}
              <div>
                <h4 className="font-medium mb-2">Async Base Pay Button:</h4>
                <AsyncBasePayButton
                  amount="5.00"
                  recipientAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e"
                  onSuccess={(result) => {
                    toast({
                      title: "🎉 Async Payment Successful!",
                      description: `Payment ID: ${result.id}`,
                      duration: 5000
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: "❌ Async Payment Failed",
                      description: error.message || "Payment failed",
                      variant: "destructive",
                      duration: 5000
                    });
                  }}
                />
              </div>

              {/* Working Base Pay Button */}
              <div>
                <h4 className="font-medium mb-2">🎯 Working Base Pay Button:</h4>
                <WorkingBasePayButton
                  amount="5.00"
                  recipientAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e"
                  onSuccess={(result) => {
                    toast({
                      title: "🎉 Working Base Pay Success!",
                      description: `Payment ID: ${result.id}`,
                      duration: 5000
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: "❌ Working Base Pay Failed",
                      description: error.message || "Payment failed",
                      variant: "destructive",
                      duration: 5000
                    });
                  }}
                />
              </div>

              {/* Real Base Pay Button */}
              <div>
                <h4 className="font-medium mb-2">🎯 REAL Base Pay Button (Wallet Popup):</h4>
                <RealBasePayButton
                  amount="5.00"
                  recipientAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e"
                  onSuccess={(result) => {
                    toast({
                      title: "🎉 Real Base Pay Success!",
                      description: `TX: ${result.transactionHash?.substring(0, 10)}...`,
                      duration: 5000
                    });
                  }}
                  onError={(error) => {
                    toast({
                      title: "❌ Real Base Pay Failed",
                      description: error.message || "Payment failed",
                      variant: "destructive",
                      duration: 5000
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* Official Base Pay Integration Test */}
          <div className="bg-card rounded-lg p-6 shadow-elevation">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              🏛️ Official Base Pay SDK Test
            </h3>
            <p className="text-muted-foreground mb-4">
              This uses the exact integration pattern from the Base Pay documentation.
            </p>
            <OfficialBasePayTest
              recipientAddress="0x742d35Cc6634C0532925a3b8D4C9db96C4b5Da5e"
              amount="5.00"
            />
          </div>

          {/* Base Pay Test */}
          <TestBasePay />

          {/* Integration Status */}
          <IntegrationStatus />
          
          {/* Additional Development Info */}
          <div className="mt-8 space-y-6">
            <div className="bg-card rounded-lg p-6 shadow-elevation">
              <h3 className="text-lg font-semibold text-foreground mb-4">Quick Setup Guide</h3>
              <div className="space-y-4 text-sm">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">1. Install Base Pay Packages</h4>
                  <code className="text-xs bg-black text-green-400 p-2 rounded block">
                    npm install @base-org/account @base-org/account-ui
                  </code>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">2. Configure Environment</h4>
                  <code className="text-xs bg-black text-green-400 p-2 rounded block">
                    cp .env.example .env.local
                  </code>
                </div>
                
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium mb-2">3. Enable Real Base Pay</h4>
                  <p className="text-muted-foreground">
                    Uncomment the real implementation in ContributeButton.tsx and basePayService.ts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DevStatus;
