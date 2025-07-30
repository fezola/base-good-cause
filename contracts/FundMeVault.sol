// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title FundMeVault
 * @dev A crowdfunding vault contract with automatic refunds and withdrawal conditions
 * - Campaign creators can only withdraw when 70% of goal is reached
 * - If goal not met by deadline, contributors can claim refunds
 * - All funds are held securely in the contract until conditions are met
 */
contract FundMeVault is ReentrancyGuard, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _campaignIds;
    
    // Campaign status enum
    enum CampaignStatus {
        Active,
        Successful,
        Failed,
        Withdrawn
    }
    
    // Campaign struct
    struct Campaign {
        uint256 id;
        address payable creator;
        string title;
        string description;
        uint256 goal;
        uint256 raised;
        uint256 deadline;
        CampaignStatus status;
        bool fundsWithdrawn;
        mapping(address => uint256) contributions;
        address[] contributors;
    }
    
    // Mappings
    mapping(uint256 => Campaign) public campaigns;
    mapping(address => uint256[]) public creatorCampaigns;
    mapping(address => uint256[]) public contributorCampaigns;
    
    // Constants
    uint256 public constant WITHDRAWAL_THRESHOLD = 70; // 70% threshold
    uint256 public constant PLATFORM_FEE = 250; // 2.5% platform fee (250 basis points)
    uint256 public constant BASIS_POINTS = 10000;
    
    // Events
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed creator,
        string title,
        uint256 goal,
        uint256 deadline
    );
    
    event ContributionMade(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount,
        uint256 totalRaised
    );
    
    event FundsWithdrawn(
        uint256 indexed campaignId,
        address indexed creator,
        uint256 amount,
        uint256 platformFee
    );
    
    event RefundClaimed(
        uint256 indexed campaignId,
        address indexed contributor,
        uint256 amount
    );
    
    event CampaignStatusUpdated(
        uint256 indexed campaignId,
        CampaignStatus status
    );
    
    // Modifiers
    modifier campaignExists(uint256 _campaignId) {
        require(_campaignId > 0 && _campaignId <= _campaignIds.current(), "Campaign does not exist");
        _;
    }
    
    modifier onlyCampaignCreator(uint256 _campaignId) {
        require(campaigns[_campaignId].creator == msg.sender, "Only campaign creator can call this");
        _;
    }
    
    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].status == CampaignStatus.Active, "Campaign is not active");
        _;
    }
    
    /**
     * @dev Create a new crowdfunding campaign
     * @param _title Campaign title
     * @param _description Campaign description  
     * @param _goal Funding goal in wei
     * @param _durationDays Campaign duration in days
     */
    function createCampaign(
        string memory _title,
        string memory _description,
        uint256 _goal,
        uint256 _durationDays
    ) external returns (uint256) {
        require(_goal > 0, "Goal must be greater than 0");
        require(_durationDays > 0 && _durationDays <= 365, "Duration must be between 1-365 days");
        require(bytes(_title).length > 0, "Title cannot be empty");
        
        _campaignIds.increment();
        uint256 newCampaignId = _campaignIds.current();
        
        Campaign storage newCampaign = campaigns[newCampaignId];
        newCampaign.id = newCampaignId;
        newCampaign.creator = payable(msg.sender);
        newCampaign.title = _title;
        newCampaign.description = _description;
        newCampaign.goal = _goal;
        newCampaign.raised = 0;
        newCampaign.deadline = block.timestamp + (_durationDays * 1 days);
        newCampaign.status = CampaignStatus.Active;
        newCampaign.fundsWithdrawn = false;
        
        creatorCampaigns[msg.sender].push(newCampaignId);
        
        emit CampaignCreated(newCampaignId, msg.sender, _title, _goal, newCampaign.deadline);
        
        return newCampaignId;
    }
    
    /**
     * @dev Contribute to a campaign
     * @param _campaignId Campaign ID to contribute to
     */
    function contribute(uint256 _campaignId) 
        external 
        payable 
        nonReentrant 
        campaignExists(_campaignId) 
        campaignActive(_campaignId) 
    {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(block.timestamp < campaigns[_campaignId].deadline, "Campaign has ended");
        
        Campaign storage campaign = campaigns[_campaignId];
        
        // If this is a new contributor, add to contributors array
        if (campaign.contributions[msg.sender] == 0) {
            campaign.contributors.push(msg.sender);
            contributorCampaigns[msg.sender].push(_campaignId);
        }
        
        campaign.contributions[msg.sender] += msg.value;
        campaign.raised += msg.value;
        
        // Check if campaign reached its goal
        if (campaign.raised >= campaign.goal) {
            campaign.status = CampaignStatus.Successful;
            emit CampaignStatusUpdated(_campaignId, CampaignStatus.Successful);
        }
        
        emit ContributionMade(_campaignId, msg.sender, msg.value, campaign.raised);
    }
    
    /**
     * @dev Withdraw funds if 70% threshold is met
     * @param _campaignId Campaign ID to withdraw from
     */
    function withdrawFunds(uint256 _campaignId) 
        external 
        nonReentrant 
        campaignExists(_campaignId) 
        onlyCampaignCreator(_campaignId) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(!campaign.fundsWithdrawn, "Funds already withdrawn");
        require(campaign.raised > 0, "No funds to withdraw");
        
        // Check if 70% threshold is met
        uint256 thresholdAmount = (campaign.goal * WITHDRAWAL_THRESHOLD) / 100;
        require(campaign.raised >= thresholdAmount, "70% threshold not reached");
        
        campaign.fundsWithdrawn = true;
        
        // Calculate platform fee
        uint256 platformFee = (campaign.raised * PLATFORM_FEE) / BASIS_POINTS;
        uint256 creatorAmount = campaign.raised - platformFee;
        
        // Update campaign status
        if (campaign.status == CampaignStatus.Active) {
            campaign.status = CampaignStatus.Withdrawn;
            emit CampaignStatusUpdated(_campaignId, CampaignStatus.Withdrawn);
        }
        
        // Transfer funds
        campaign.creator.transfer(creatorAmount);
        payable(owner()).transfer(platformFee);
        
        emit FundsWithdrawn(_campaignId, campaign.creator, creatorAmount, platformFee);
    }
    
    /**
     * @dev Claim refund if campaign failed or didn't meet threshold
     * @param _campaignId Campaign ID to claim refund from
     */
    function claimRefund(uint256 _campaignId) 
        external 
        nonReentrant 
        campaignExists(_campaignId) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        
        require(campaign.contributions[msg.sender] > 0, "No contribution found");
        require(!campaign.fundsWithdrawn, "Funds already withdrawn by creator");
        
        // Check if refund conditions are met
        bool campaignEnded = block.timestamp >= campaign.deadline;
        bool thresholdNotMet = campaign.raised < (campaign.goal * WITHDRAWAL_THRESHOLD) / 100;
        
        require(campaignEnded && thresholdNotMet, "Refund conditions not met");
        
        // Update campaign status if needed
        if (campaign.status == CampaignStatus.Active) {
            campaign.status = CampaignStatus.Failed;
            emit CampaignStatusUpdated(_campaignId, CampaignStatus.Failed);
        }
        
        uint256 refundAmount = campaign.contributions[msg.sender];
        campaign.contributions[msg.sender] = 0;
        campaign.raised -= refundAmount;
        
        payable(msg.sender).transfer(refundAmount);
        
        emit RefundClaimed(_campaignId, msg.sender, refundAmount);
    }
    
    // View functions
    function getCampaign(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (
            uint256 id,
            address creator,
            string memory title,
            string memory description,
            uint256 goal,
            uint256 raised,
            uint256 deadline,
            CampaignStatus status,
            bool fundsWithdrawn,
            uint256 contributorsCount
        ) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        return (
            campaign.id,
            campaign.creator,
            campaign.title,
            campaign.description,
            campaign.goal,
            campaign.raised,
            campaign.deadline,
            campaign.status,
            campaign.fundsWithdrawn,
            campaign.contributors.length
        );
    }
    
    function getContribution(uint256 _campaignId, address _contributor) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (uint256) 
    {
        return campaigns[_campaignId].contributions[_contributor];
    }
    
    function getCampaignContributors(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (address[] memory) 
    {
        return campaigns[_campaignId].contributors;
    }
    
    function getCreatorCampaigns(address _creator) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return creatorCampaigns[_creator];
    }
    
    function getContributorCampaigns(address _contributor) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return contributorCampaigns[_contributor];
    }
    
    function getTotalCampaigns() external view returns (uint256) {
        return _campaignIds.current();
    }
    
    function canWithdraw(uint256 _campaignId) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (bool) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        uint256 thresholdAmount = (campaign.goal * WITHDRAWAL_THRESHOLD) / 100;
        return campaign.raised >= thresholdAmount && !campaign.fundsWithdrawn;
    }
    
    function canClaimRefund(uint256 _campaignId, address _contributor) 
        external 
        view 
        campaignExists(_campaignId) 
        returns (bool) 
    {
        Campaign storage campaign = campaigns[_campaignId];
        bool campaignEnded = block.timestamp >= campaign.deadline;
        bool thresholdNotMet = campaign.raised < (campaign.goal * WITHDRAWAL_THRESHOLD) / 100;
        bool hasContribution = campaign.contributions[_contributor] > 0;
        bool fundsNotWithdrawn = !campaign.fundsWithdrawn;
        
        return campaignEnded && thresholdNotMet && hasContribution && fundsNotWithdrawn;
    }
}
