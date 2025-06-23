// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title AIAgentMarketplace
 * @dev Smart contract for managing AI agent licensing and marketplace operations
 */
contract AIAgentMarketplace is Ownable, ReentrancyGuard, Pausable {
    
    struct Agent {
        uint256 id;
        string name;
        string ipfsHash;
        address creator;
        uint256 priceWei;
        uint256 totalRatings;
        uint256 ratingSum;
        uint256 usageCount;
        bool isActive;
        uint256 createdAt;
    }

    struct License {
        uint256 agentId;
        address licensee;
        uint256 purchaseTime;
        uint256 expiryTime; // 0 for lifetime licenses
        bool isActive;
    }

    struct Review {
        uint256 agentId;
        address reviewer;
        uint8 rating; // 1-5 stars
        string comment;
        uint256 timestamp;
    }

    // State variables
    uint256 private _nextAgentId = 1;
    uint256 private _nextLicenseId = 1;
    uint256 private _nextReviewId = 1;
    
    uint256 public platformFeePercent = 10; // 10% platform fee
    address public feeRecipient;

    // Mappings
    mapping(uint256 => Agent) public agents;
    mapping(uint256 => License) public licenses;
    mapping(uint256 => Review) public reviews;
    mapping(address => mapping(uint256 => bool)) public userLicenses; // user => agentId => hasLicense
    mapping(address => uint256[]) public userOwnedAgents;
    mapping(address => uint256[]) public userLicensedAgents;
    mapping(uint256 => uint256[]) public agentReviews; // agentId => reviewIds[]

    // Events
    event AgentUploaded(
        uint256 indexed agentId,
        string name,
        address indexed creator,
        uint256 priceWei,
        string ipfsHash
    );
    
    event LicensePurchased(
        uint256 indexed licenseId,
        uint256 indexed agentId,
        address indexed licensee,
        uint256 price
    );
    
    event AgentRated(
        uint256 indexed reviewId,
        uint256 indexed agentId,
        address indexed reviewer,
        uint8 rating,
        string comment
    );
    
    event AgentUsed(uint256 indexed agentId, address indexed user);
    
    event PlatformFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _feeRecipient) {
        feeRecipient = _feeRecipient;
    }

    /**
     * @dev Upload a new AI agent to the marketplace
     */
    function uploadAgent(
        string memory _name,
        string memory _ipfsHash,
        uint256 _priceWei
    ) external whenNotPaused returns (uint256) {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_ipfsHash).length > 0, "IPFS hash cannot be empty");

        uint256 agentId = _nextAgentId++;
        
        agents[agentId] = Agent({
            id: agentId,
            name: _name,
            ipfsHash: _ipfsHash,
            creator: msg.sender,
            priceWei: _priceWei,
            totalRatings: 0,
            ratingSum: 0,
            usageCount: 0,
            isActive: true,
            createdAt: block.timestamp
        });

        userOwnedAgents[msg.sender].push(agentId);

        emit AgentUploaded(agentId, _name, msg.sender, _priceWei, _ipfsHash);
        return agentId;
    }

    /**
     * @dev Purchase a license for an AI agent
     */
    function buyLicense(uint256 _agentId) external payable nonReentrant whenNotPaused {
        Agent storage agent = agents[_agentId];
        require(agent.isActive, "Agent is not active");
        require(agent.creator != msg.sender, "Cannot license own agent");
        require(!userLicenses[msg.sender][_agentId], "Already licensed");
        require(msg.value >= agent.priceWei, "Insufficient payment");

        // Calculate fees
        uint256 platformFee = (agent.priceWei * platformFeePercent) / 100;
        uint256 creatorPayment = agent.priceWei - platformFee;

        // Create license
        uint256 licenseId = _nextLicenseId++;
        licenses[licenseId] = License({
            agentId: _agentId,
            licensee: msg.sender,
            purchaseTime: block.timestamp,
            expiryTime: 0, // Lifetime license
            isActive: true
        });

        // Update mappings
        userLicenses[msg.sender][_agentId] = true;
        userLicensedAgents[msg.sender].push(_agentId);

        // Transfer payments
        if (platformFee > 0) {
            payable(feeRecipient).transfer(platformFee);
        }
        if (creatorPayment > 0) {
            payable(agent.creator).transfer(creatorPayment);
        }

        // Refund excess payment
        if (msg.value > agent.priceWei) {
            payable(msg.sender).transfer(msg.value - agent.priceWei);
        }

        emit LicensePurchased(licenseId, _agentId, msg.sender, agent.priceWei);
    }

    /**
     * @dev Check if a user has a license for an agent
     */
    function isLicensed(address _user, uint256 _agentId) external view returns (bool) {
        return userLicenses[_user][_agentId] || agents[_agentId].creator == _user;
    }

    /**
     * @dev Rate and review an AI agent
     */
    function rateAgent(
        uint256 _agentId,
        uint8 _rating,
        string memory _comment
    ) external whenNotPaused {
        require(agents[_agentId].isActive, "Agent is not active");
        require(_rating >= 1 && _rating <= 5, "Rating must be between 1 and 5");
        require(userLicenses[msg.sender][_agentId] || agents[_agentId].creator == msg.sender, "Must have license to rate");

        uint256 reviewId = _nextReviewId++;
        
        reviews[reviewId] = Review({
            agentId: _agentId,
            reviewer: msg.sender,
            rating: _rating,
            comment: _comment,
            timestamp: block.timestamp
        });

        // Update agent rating
        Agent storage agent = agents[_agentId];
        agent.totalRatings++;
        agent.ratingSum += _rating;

        agentReviews[_agentId].push(reviewId);

        emit AgentRated(reviewId, _agentId, msg.sender, _rating, _comment);
    }

    /**
     * @dev Record agent usage (called by backend)
     */
    function recordUsage(uint256 _agentId, address _user) external whenNotPaused {
        require(agents[_agentId].isActive, "Agent is not active");
        require(userLicenses[_user][_agentId] || agents[_agentId].creator == _user, "User not licensed");

        agents[_agentId].usageCount++;
        emit AgentUsed(_agentId, _user);
    }

    /**
     * @dev Get agent details
     */
    function getAgent(uint256 _agentId) external view returns (Agent memory) {
        return agents[_agentId];
    }

    /**
     * @dev Get agent average rating
     */
    function getAgentRating(uint256 _agentId) external view returns (uint256, uint256) {
        Agent memory agent = agents[_agentId];
        if (agent.totalRatings == 0) {
            return (0, 0);
        }
        return (agent.ratingSum / agent.totalRatings, agent.totalRatings);
    }

    /**
     * @dev Get user's owned agents
     */
    function getUserOwnedAgents(address _user) external view returns (uint256[] memory) {
        return userOwnedAgents[_user];
    }

    /**
     * @dev Get user's licensed agents
     */
    function getUserLicensedAgents(address _user) external view returns (uint256[] memory) {
        return userLicensedAgents[_user];
    }

    /**
     * @dev Get agent reviews
     */
    function getAgentReviews(uint256 _agentId) external view returns (uint256[] memory) {
        return agentReviews[_agentId];
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 20, "Fee cannot exceed 20%");
        uint256 oldFee = platformFeePercent;
        platformFeePercent = _newFeePercent;
        emit PlatformFeeUpdated(oldFee, _newFeePercent);
    }

    /**
     * @dev Update fee recipient (only owner)
     */
    function updateFeeRecipient(address _newRecipient) external onlyOwner {
        require(_newRecipient != address(0), "Invalid recipient");
        feeRecipient = _newRecipient;
    }

    /**
     * @dev Deactivate an agent (only creator or owner)
     */
    function deactivateAgent(uint256 _agentId) external {
        require(
            agents[_agentId].creator == msg.sender || owner() == msg.sender,
            "Not authorized"
        );
        agents[_agentId].isActive = false;
    }

    /**
     * @dev Emergency pause (only owner)
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause (only owner)
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Get total number of agents
     */
    function getTotalAgents() external view returns (uint256) {
        return _nextAgentId - 1;
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        payable(owner()).transfer(balance);
    }
}