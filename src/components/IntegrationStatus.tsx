// Integration Status Component
// Shows current Base Pay integration status

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { BASE_PAY_CONFIG, validateConfig } from "@/config/basePay";

export function IntegrationStatus() {
  const config = validateConfig();
  
  const integrationChecks = [
    {
      name: "Base Pay Packages",
      status: "pending", // Will be "success" when packages are installed
      description: "@base-org/account and @base-org/account-ui",
      action: "Run: npm install @base-org/account @base-org/account-ui"
    },
    {
      name: "Environment Configuration",
      status: config.isValid ? "success" : "error",
      description: "Recipient address and campaign settings",
      action: config.isValid ? "✓ Configuration valid" : config.errors.join(", ")
    },
    {
      name: "Network Configuration",
      status: "success",
      description: BASE_PAY_CONFIG.TESTNET ? "Base Sepolia (Testnet)" : "Base Mainnet",
      action: BASE_PAY_CONFIG.TESTNET ? "Switch to mainnet for production" : "Ready for production"
    },
    {
      name: "USDC Integration",
      status: "success",
      description: "USDC payments with gas sponsorship",
      action: "✓ Configured for Base Chain"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Ready</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card className="p-6 shadow-elevation">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-foreground">Base Pay Integration</h3>
            <p className="text-sm text-muted-foreground">Current integration status</p>
          </div>
          <Badge 
            className={`${
              integrationChecks.every(check => check.status === "success") 
                ? "bg-green-100 text-green-800 border-green-200" 
                : "bg-yellow-100 text-yellow-800 border-yellow-200"
            }`}
          >
            {integrationChecks.every(check => check.status === "success") ? "Ready" : "In Progress"}
          </Badge>
        </div>

        {/* Status Checks */}
        <div className="space-y-4">
          {integrationChecks.map((check, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 mt-0.5">
                {getStatusIcon(check.status)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">{check.name}</h4>
                  {getStatusBadge(check.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{check.description}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono">{check.action}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Configuration Details */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Current Configuration</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Network:</span>
                <span className="font-mono">{BASE_PAY_CONFIG.TESTNET ? "Testnet" : "Mainnet"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contribution:</span>
                <span className="font-mono">${BASE_PAY_CONFIG.CONTRIBUTION_AMOUNT} USDC</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Goal:</span>
                <span className="font-mono">${BASE_PAY_CONFIG.CAMPAIGN.GOAL}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Recipient:</span>
                <span className="font-mono text-xs">
                  {BASE_PAY_CONFIG.RECIPIENT_ADDRESS ?
                    `${BASE_PAY_CONFIG.RECIPIENT_ADDRESS.substring(0, 6)}...${BASE_PAY_CONFIG.RECIPIENT_ADDRESS.slice(-4)}` :
                    'Not configured'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Chain ID:</span>
                <span className="font-mono">
                  {BASE_PAY_CONFIG.TESTNET ? "84532" : "8453"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Beneficiaries:</span>
                <span className="font-mono">{BASE_PAY_CONFIG.CAMPAIGN.BENEFICIARIES}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
          <div className="flex flex-wrap gap-2">
            {BASE_PAY_CONFIG.TESTNET && (
              <a
                href="https://faucet.circle.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
              >
                <span>Get Test USDC</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            <a
              href={BASE_PAY_CONFIG.TESTNET ? "https://sepolia.basescan.org" : "https://basescan.org"}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              <span>Block Explorer</span>
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href="https://docs.base.org/base-account/guides/accept-payments"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200 transition-colors"
            >
              <span>Base Pay Docs</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
}
