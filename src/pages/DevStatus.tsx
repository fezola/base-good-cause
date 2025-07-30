// Development Status Page - Only for development
import { IntegrationStatus } from "@/components/IntegrationStatus";
import { TestBasePay } from "@/components/TestBasePay";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { clearAllBrowserData } from "@/utils/clearMockData";
import { toast } from "@/hooks/use-toast";

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
