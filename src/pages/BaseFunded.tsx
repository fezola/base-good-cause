import { useState } from "react";
import { CampaignHeader } from "@/components/CampaignHeader";
import { CampaignProgress } from "@/components/CampaignProgress";
import { ContributeButton } from "@/components/ContributeButton";
import { ContributorsList } from "@/components/ContributorsList";
import { StatsCards } from "@/components/StatsCards";

import { toast } from "@/hooks/use-toast";
import { BASE_PAY_CONFIG, getBlockExplorerUrl, isDevelopment } from "@/config/basePay";
import { Link } from "react-router-dom";

interface PaymentResult {
  success: boolean;
  id?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
  userInfo?: any;
}

// Campaign data from configuration
const CAMPAIGN_DATA = {
  title: BASE_PAY_CONFIG.CAMPAIGN.TITLE,
  description: BASE_PAY_CONFIG.CAMPAIGN.DESCRIPTION,
  goal: BASE_PAY_CONFIG.CAMPAIGN.GOAL,
  raised: 137, // This will be fetched from blockchain/database in production
  location: BASE_PAY_CONFIG.CAMPAIGN.LOCATION,
  duration: "30 days remaining",
  beneficiaries: BASE_PAY_CONFIG.CAMPAIGN.BENEFICIARIES,
  contributionAmount: parseInt(BASE_PAY_CONFIG.CONTRIBUTION_AMOUNT)
};

// Mock contributors data
const MOCK_CONTRIBUTORS = [
  {
    id: "1",
    address: "0x742d35Cc6Bf4532a4dc2b5a6e1a8C2B2D3D4E5F6",
    amount: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    ensName: "alice.base.eth"
  },
  {
    id: "2",
    address: "0x8a3B5C9D7E2f4G6H8I9J0K1L2M3N4O5P6Q7R8S9T",
    amount: 10,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
  },
  {
    id: "3",
    address: "0x9B4C6D8E1F3G5H7I9J0K2L4M6N8O0P2Q4R6S8T0U",
    amount: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
  },
  {
    id: "4",
    address: "0xAC5D7E9F2G4H6I8J0K3L5M7N9O1P3Q5R7S9T1U3V",
    amount: 25,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    ensName: "builder.base.eth"
  },
  {
    id: "5",
    address: "0xBD6E8F0G3H5I7J9K1L4M6N8O2P4Q6R8S0T2U4V6W",
    amount: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
  }
];

const BaseFunded = () => {
  const [contributors, setContributors] = useState(MOCK_CONTRIBUTORS);
  const [raised, setRaised] = useState(CAMPAIGN_DATA.raised);

  const totalContributors = contributors.length;
  const averageContribution = totalContributors > 0 ? Math.round(raised / totalContributors) : 0;

  const handleContribute = async (paymentResult: PaymentResult) => {
    if (!paymentResult.success) {
      console.error("Payment failed:", paymentResult.error);
      return;
    }

    console.log("✅ Payment successful:", paymentResult);

    // Create new contributor from payment result
    const newContributor = {
      id: paymentResult.id || Date.now().toString(),
      address: paymentResult.userInfo?.onchainAddress || "0x" + Math.random().toString(16).substring(2, 42),
      amount: CAMPAIGN_DATA.contributionAmount,
      timestamp: new Date(),
      ensName: paymentResult.userInfo?.email ?
        paymentResult.userInfo.email.split('@')[0] + ".base.eth" :
        (Math.random() > 0.7 ? "you.base.eth" : undefined),
      transactionHash: paymentResult.transactionHash,
      blockNumber: paymentResult.blockNumber,
      userInfo: paymentResult.userInfo
    };

    // Update state
    setContributors(prev => [newContributor, ...prev]);
    setRaised(prev => prev + CAMPAIGN_DATA.contributionAmount);

    // Show additional success information with block explorer link
    if (paymentResult.transactionHash) {
      const explorerUrl = getBlockExplorerUrl(paymentResult.transactionHash);
      toast({
        title: "🎉 Contribution Recorded!",
        description: (
          <div className="space-y-2">
            <p>Transaction confirmed on {BASE_PAY_CONFIG.TESTNET ? 'Base Sepolia' : 'Base Chain'}!</p>
            <p className="text-xs">Hash: {paymentResult.transactionHash.substring(0, 10)}...</p>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 underline text-xs"
            >
              View on Block Explorer →
            </a>
          </div>
        ),
        duration: 10000,
      });
    }

    // Log for analytics/debugging
    console.log("📊 Campaign updated:", {
      newTotal: raised + CAMPAIGN_DATA.contributionAmount,
      totalContributors: contributors.length + 1,
      transactionHash: paymentResult.transactionHash
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">B</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">BaseFunded</h1>
            </div>
            <div className="text-sm text-muted-foreground">
              Powered by Base Pay
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">


        {/* Campaign Header */}
        <CampaignHeader
          title={CAMPAIGN_DATA.title}
          description={CAMPAIGN_DATA.description}
          location={CAMPAIGN_DATA.location}
          duration={CAMPAIGN_DATA.duration}
          beneficiaries={CAMPAIGN_DATA.beneficiaries}
        />

        {/* Stats Cards */}
        <StatsCards
          totalContributors={totalContributors}
          averageContribution={averageContribution}
          timeRemaining={CAMPAIGN_DATA.duration}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Progress & Contribute */}
          <div className="lg:col-span-2 space-y-8">
            {/* Progress Section */}
            <div className="bg-card rounded-lg p-8 shadow-elevation">
              <CampaignProgress
                raised={raised}
                goal={CAMPAIGN_DATA.goal}
              />
            </div>

            {/* Contribution Section */}
            <div className="bg-card rounded-lg p-8 shadow-elevation text-center space-y-6">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Ready to Make a Difference?
                </h3>
                <p className="text-muted-foreground">
                  Join {totalContributors} other supporters in funding Web3 education in Lagos
                </p>
              </div>



              <ContributeButton
                amount={CAMPAIGN_DATA.contributionAmount}
                onContribute={handleContribute}
                className="w-full max-w-md mx-auto"
                recipientAddress={BASE_PAY_CONFIG.RECIPIENT_ADDRESS}
                testnet={BASE_PAY_CONFIG.TESTNET}
              />
            </div>
          </div>

          {/* Right Column - Contributors */}
          <div className="lg:col-span-1">
            <ContributorsList contributors={contributors} />
          </div>
        </div>

        {/* Campaign Story */}
        <div className="bg-card rounded-lg p-8 shadow-elevation">
          <h3 className="text-2xl font-bold text-foreground mb-6">The Story</h3>
          <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
            <p>
              Lagos is home to one of Africa's largest and most vibrant tech communities. 
              Despite the incredible talent and passion for technology, many young developers 
              lack access to specialized Web3 education and training programs.
            </p>
            <p>
              This campaign aims to bridge that gap by sponsoring 10 promising developers 
              for a comprehensive 6-month Web3 bootcamp. The program covers:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Smart contract development with Solidity</li>
              <li>DeFi protocols and mechanics</li>
              <li>Frontend development for dApps</li>
              <li>Blockchain security best practices</li>
              <li>Career guidance and mentorship</li>
            </ul>
            <p>
              Your contribution directly funds tuition, materials, and living stipends 
              for these developers, ensuring they can focus entirely on their education 
              and emerge as the next generation of Web3 builders.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground space-y-2">
            <p>Built on Base Chain • Powered by Base Pay • BaseFunded © 2024</p>
            <p>Submission for Base Builder Quest 8</p>

            {/* Development Status Link */}
            {isDevelopment() && (
              <div className="mt-2">
                <Link
                  to="/dev-status"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  🔧 Development Status
                </Link>
              </div>
            )}

            {BASE_PAY_CONFIG.TESTNET && (
              <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                <p className="text-yellow-800 font-medium">🧪 TESTNET MODE</p>
                <p className="text-yellow-700 text-xs">
                  Using Base Sepolia • Get test USDC from{' '}
                  <a
                    href="https://faucet.circle.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-yellow-900"
                  >
                    Circle Faucet
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BaseFunded;