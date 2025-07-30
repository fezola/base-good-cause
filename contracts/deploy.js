// Deployment script for FundMeVault contract
// Run this in Remix IDE console after compiling

const deployFundMeVault = async () => {
    console.log("🚀 Deploying FundMeVault contract...");
    
    try {
        // Get the contract factory
        const FundMeVault = await ethers.getContractFactory("FundMeVault");
        
        // Deploy the contract
        const fundMeVault = await FundMeVault.deploy();
        
        // Wait for deployment
        await fundMeVault.deployed();
        
        console.log("✅ FundMeVault deployed successfully!");
        console.log("📍 Contract Address:", fundMeVault.address);
        console.log("🔗 Transaction Hash:", fundMeVault.deployTransaction.hash);
        
        // Verify deployment
        const totalCampaigns = await fundMeVault.getTotalCampaigns();
        console.log("📊 Total Campaigns:", totalCampaigns.toString());
        
        return {
            address: fundMeVault.address,
            contract: fundMeVault
        };
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
        throw error;
    }
};

// Example usage functions
const createTestCampaign = async (contractAddress) => {
    console.log("🧪 Creating test campaign...");
    
    const FundMeVault = await ethers.getContractAt("FundMeVault", contractAddress);
    
    const tx = await FundMeVault.createCampaign(
        "Help Build School in Kenya",
        "We are raising funds to build a new school in rural Kenya",
        ethers.utils.parseEther("10"), // 10 ETH goal
        30 // 30 days duration
    );
    
    const receipt = await tx.wait();
    console.log("✅ Test campaign created!");
    console.log("🔗 Transaction Hash:", receipt.transactionHash);
    
    return receipt;
};

const contributeToTestCampaign = async (contractAddress, campaignId, amount) => {
    console.log(`💰 Contributing ${amount} ETH to campaign ${campaignId}...`);
    
    const FundMeVault = await ethers.getContractAt("FundMeVault", contractAddress);
    
    const tx = await FundMeVault.contribute(campaignId, {
        value: ethers.utils.parseEther(amount.toString())
    });
    
    const receipt = await tx.wait();
    console.log("✅ Contribution successful!");
    console.log("🔗 Transaction Hash:", receipt.transactionHash);
    
    return receipt;
};

// Export for use in Remix
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        deployFundMeVault,
        createTestCampaign,
        contributeToTestCampaign
    };
}

// Auto-run deployment if in Remix environment
if (typeof remix !== 'undefined') {
    deployFundMeVault()
        .then((result) => {
            console.log("🎉 Deployment completed successfully!");
            console.log("📋 Save this contract address:", result.address);
        })
        .catch((error) => {
            console.error("💥 Deployment failed:", error);
        });
}
