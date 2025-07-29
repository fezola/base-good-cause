import { useState } from "react";
import { CampaignHeader } from "@/components/CampaignHeader";
import { CampaignProgress } from "@/components/CampaignProgress";
import { ContributeButton } from "@/components/ContributeButton";
import { ContributorsList } from "@/components/ContributorsList";
import { StatsCards } from "@/components/StatsCards";
import { toast } from "@/hooks/use-toast";

// Mock data for the campaign
const CAMPAIGN_DATA = {
  title: "Fund Web3 Dev School in Lagos",
  description: "Help us send 10 talented young developers from Lagos to an intensive 6-month Web3 bootcamp. This program will equip them with blockchain development skills, smart contract expertise, and connect them to global opportunities in the decentralized future.",
  goal: 500,
  raised: 137,
  location: "Lagos, Nigeria",
  duration: "30 days remaining",
  beneficiaries: 10,
  contributionAmount: 5
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

  const handleContribute = async () => {
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock successful contribution
    const newContributor = {
      id: Date.now().toString(),
      address: "0x" + Math.random().toString(16).substring(2, 42),
      amount: CAMPAIGN_DATA.contributionAmount,
      timestamp: new Date(),
      ensName: Math.random() > 0.7 ? "you.base.eth" : undefined
    };

    setContributors(prev => [newContributor, ...prev]);
    setRaised(prev => prev + CAMPAIGN_DATA.contributionAmount);
    
    toast({
      title: "🎉 Contribution Successful!",
      description: `Thank you for contributing $${CAMPAIGN_DATA.contributionAmount} USDC to this campaign.`,
      duration: 5000,
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
              />
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>✓ Secure payment via Base Pay</p>
                <p>✓ Gasless USDC transactions</p>
                <p>✓ Transparent on-chain funding</p>
              </div>
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
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BaseFunded;