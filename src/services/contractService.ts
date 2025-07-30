import { ethers } from 'ethers';

// Contract configuration
export const CONTRACT_CONFIG = {
  address: '0xd9145CCE52D386f254917e481eB44e9943F39138',
  network: 'base-sepolia', // Base testnet
  abi: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "initialOwner",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "goal",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "CampaignCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "enum FundMeVault.CampaignStatus",
          "name": "status",
          "type": "uint8"
        }
      ],
      "name": "CampaignStatusUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "contributor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "totalRaised",
          "type": "uint256"
        }
      ],
      "name": "ContributionMade",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "platformFee",
          "type": "uint256"
        }
      ],
      "name": "FundsWithdrawn",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "campaignId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "contributor",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "RefundClaimed",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "BASIS_POINTS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "PLATFORM_FEE",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "WITHDRAWAL_THRESHOLD",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "campaigns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address payable",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "goal",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "raised",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "enum FundMeVault.CampaignStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "fundsWithdrawn",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_contributor",
          "type": "address"
        }
      ],
      "name": "canClaimRefund",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        }
      ],
      "name": "canWithdraw",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        }
      ],
      "name": "claimRefund",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        }
      ],
      "name": "contribute",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "contributorCampaigns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "string",
          "name": "_title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "_description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "_goal",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_durationDays",
          "type": "uint256"
        }
      ],
      "name": "createCampaign",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "creatorCampaigns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        }
      ],
      "name": "getCampaign",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "id",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "creator",
          "type": "address"
        },
        {
          "internalType": "string",
          "name": "title",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "description",
          "type": "string"
        },
        {
          "internalType": "uint256",
          "name": "goal",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "raised",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "enum FundMeVault.CampaignStatus",
          "name": "status",
          "type": "uint8"
        },
        {
          "internalType": "bool",
          "name": "fundsWithdrawn",
          "type": "bool"
        },
        {
          "internalType": "uint256",
          "name": "contributorsCount",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        }
      ],
      "name": "getCampaignContributors",
      "outputs": [
        {
          "internalType": "address[]",
          "name": "",
          "type": "address[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "_contributor",
          "type": "address"
        }
      ],
      "name": "getContribution",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_contributor",
          "type": "address"
        }
      ],
      "name": "getContributorCampaigns",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_creator",
          "type": "address"
        }
      ],
      "name": "getCreatorCampaigns",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalCampaigns",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_campaignId",
          "type": "uint256"
        }
      ],
      "name": "withdrawFunds",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]
};

// Campaign status enum
export enum CampaignStatus {
  Active = 0,
  Successful = 1,
  Failed = 2,
  Withdrawn = 3
}

// Contract service class
export class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.providers.Web3Provider | null = null;
  private signer: ethers.Signer | null = null;

  // Make CONTRACT_CONFIG accessible
  public CONTRACT_CONFIG = CONTRACT_CONFIG;

  // Initialize the contract connection
  async initialize() {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask is not installed');
    }

    this.provider = new ethers.providers.Web3Provider(window.ethereum);
    await this.provider.send('eth_requestAccounts', []);
    this.signer = this.provider.getSigner();
    this.contract = new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.signer);
  }

  // Get contract instance (read-only)
  private getReadOnlyContract() {
    if (!this.provider) {
      // Use a public RPC for read-only operations
      const publicProvider = new ethers.providers.JsonRpcProvider('https://sepolia.base.org');
      return new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, publicProvider);
    }
    return new ethers.Contract(CONTRACT_CONFIG.address, CONTRACT_CONFIG.abi, this.provider);
  }

  // Create a campaign on the blockchain
  async createCampaign(title: string, description: string, goalInEth: number, durationDays: number) {
    if (!this.contract) await this.initialize();
    
    const goalInWei = ethers.utils.parseEther(goalInEth.toString());
    const tx = await this.contract!.createCampaign(title, description, goalInWei, durationDays);
    const receipt = await tx.wait();
    
    // Extract campaign ID from events
    const event = receipt.events?.find((e: any) => e.event === 'CampaignCreated');
    const campaignId = event?.args?.campaignId?.toNumber();
    
    return { campaignId, transactionHash: receipt.transactionHash };
  }

  // Contribute to a campaign
  async contribute(campaignId: number, amountInEth: number) {
    if (!this.contract) await this.initialize();
    
    const amountInWei = ethers.utils.parseEther(amountInEth.toString());
    const tx = await this.contract!.contribute(campaignId, { value: amountInWei });
    const receipt = await tx.wait();
    
    return { transactionHash: receipt.transactionHash };
  }

  // Withdraw funds from a campaign
  async withdrawFunds(campaignId: number) {
    if (!this.contract) await this.initialize();
    
    const tx = await this.contract!.withdrawFunds(campaignId);
    const receipt = await tx.wait();
    
    return { transactionHash: receipt.transactionHash };
  }

  // Claim refund from a failed campaign
  async claimRefund(campaignId: number) {
    if (!this.contract) await this.initialize();
    
    const tx = await this.contract!.claimRefund(campaignId);
    const receipt = await tx.wait();
    
    return { transactionHash: receipt.transactionHash };
  }

  // Get campaign details
  async getCampaign(campaignId: number) {
    const contract = this.getReadOnlyContract();
    const result = await contract.getCampaign(campaignId);
    
    return {
      id: result.id.toNumber(),
      creator: result.creator,
      title: result.title,
      description: result.description,
      goal: ethers.utils.formatEther(result.goal),
      raised: ethers.utils.formatEther(result.raised),
      deadline: new Date(result.deadline.toNumber() * 1000),
      status: result.status,
      fundsWithdrawn: result.fundsWithdrawn,
      contributorsCount: result.contributorsCount.toNumber()
    };
  }

  // Check if user can withdraw funds
  async canWithdraw(campaignId: number) {
    const contract = this.getReadOnlyContract();
    return await contract.canWithdraw(campaignId);
  }

  // Check if user can claim refund
  async canClaimRefund(campaignId: number, userAddress: string) {
    const contract = this.getReadOnlyContract();
    return await contract.canClaimRefund(campaignId, userAddress);
  }

  // Get user's contribution to a campaign
  async getContribution(campaignId: number, userAddress: string) {
    const contract = this.getReadOnlyContract();
    const contribution = await contract.getContribution(campaignId, userAddress);
    return ethers.utils.formatEther(contribution);
  }

  // Get total number of campaigns
  async getTotalCampaigns() {
    const contract = this.getReadOnlyContract();
    const total = await contract.getTotalCampaigns();
    return total.toNumber();
  }

  // Get user's wallet address
  async getUserAddress() {
    if (!this.signer) await this.initialize();
    return await this.signer!.getAddress();
  }

  // Get user's ETH balance
  async getUserBalance() {
    if (!this.provider) await this.initialize();
    const address = await this.getUserAddress();
    const balance = await this.provider!.getBalance(address);
    return ethers.utils.formatEther(balance);
  }
}

// Export singleton instance
export const contractService = new ContractService();
