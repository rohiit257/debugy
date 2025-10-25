// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./BugBountyToken.sol";

contract BountyPlatform {
    
    BugBountyToken public immutable bugBountyToken;
    
    // Fund approval system
    mapping(address => bool) public approvedHackers;
    mapping(address => uint256) public hackerFundLimits;
    mapping(address => uint256) public hackerUsedFunds;
    
    address public admin;

    uint256 public bountyCounter;
    uint256 public submissionCounter;

    enum BountyStatus { OPEN, CLOSED, IN_REVIEW, COMPLETED }
    enum SubmissionStatus { PENDING, APPROVED, REJECTED, PERFECT }

    struct Bounty {
        uint256 id;
        address org;
        string title;
        string descriptionCid; // IPFS CID
        uint256 reward;        // in wei
        uint256 totalFunded;   // total funds in contract
        BountyStatus status;
        uint256 deadline;      // timestamp
        uint256 submissionCount;
    }

    struct Submission {
        uint256 id;
        uint256 bountyId;
        address hunter;
        string detailsCid;     // IPFS CID for vulnerability report
        SubmissionStatus status;
        uint256 timestamp;
    }

    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => Submission) public submissions;
    mapping(uint256 => uint256[]) public bountySubmissions; // bountyId => submission IDs

    // Events
    event BountyCreated(uint256 indexed bountyId, address indexed org, string metadataCid, uint256 reward, uint256 deadline);
    event BountyFunded(uint256 indexed bountyId, address indexed funder, uint256 amount, uint256 totalFunded);
    event BountyUpdated(uint256 indexed bountyId, BountyStatus status);
    event SubmissionCreated(uint256 indexed submissionId, uint256 indexed bountyId, address indexed hunter, string detailsCid);
    event SubmissionUpdated(uint256 indexed submissionId, SubmissionStatus status);
    event RewardPaid(uint256 indexed submissionId, uint256 indexed bountyId, address indexed hunter, uint256 amount);
    event HackerApproved(address indexed hacker, uint256 fundLimit);
    event HackerFundLimitUpdated(address indexed hacker, uint256 newLimit);
    event PerfectSubmissionRewarded(uint256 indexed submissionId, address indexed hunter, uint256 tokenId);

    constructor(address _bugBountyTokenAddress) {
        bugBountyToken = BugBountyToken(_bugBountyTokenAddress);
        admin = msg.sender;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyApprovedHacker() {
        require(approvedHackers[msg.sender], "Hacker not approved for funding");
        _;
    }
    
    // Admin functions for hacker approval
    function approveHacker(address hacker, uint256 fundLimit) external onlyAdmin {
        require(hacker != address(0), "Invalid hacker address");
        require(fundLimit > 0, "Fund limit must be > 0");
        
        approvedHackers[hacker] = true;
        hackerFundLimits[hacker] = fundLimit;
        hackerUsedFunds[hacker] = 0;
        
        emit HackerApproved(hacker, fundLimit);
    }
    
    function updateHackerFundLimit(address hacker, uint256 newLimit) external onlyAdmin {
        require(approvedHackers[hacker], "Hacker not approved");
        require(newLimit >= hackerUsedFunds[hacker], "New limit cannot be less than used funds");
        
        hackerFundLimits[hacker] = newLimit;
        
        emit HackerFundLimitUpdated(hacker, newLimit);
    }
    
    function revokeHackerApproval(address hacker) external onlyAdmin {
        approvedHackers[hacker] = false;
        hackerFundLimits[hacker] = 0;
        hackerUsedFunds[hacker] = 0;
    }
    
    // Create a bounty (org funds reward in ETH)
    function createBounty(string calldata title, string calldata descriptionCid, uint256 deadline) external payable returns (uint256) {
        require(msg.value > 0, "Reward must be > 0");
        require(deadline > block.timestamp, "Deadline must be in the future");

        bountyCounter++;

        bounties[bountyCounter] = Bounty({
            id: bountyCounter,
            org: msg.sender,
            title: title,
            descriptionCid: descriptionCid,
            reward: msg.value,
            totalFunded: msg.value,
            status: BountyStatus.OPEN,
            deadline: deadline,
            submissionCount: 0
        });

        emit BountyCreated(bountyCounter, msg.sender, descriptionCid, msg.value, deadline);
        return bountyCounter;
    }

    // Add additional funds to a bounty (regular funding)
    function fundBounty(uint256 bountyId) external payable {
        require(msg.value > 0, "Amount must be > 0");
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.OPEN, "Bounty not open");

        bounty.totalFunded += msg.value;
        bounty.reward += msg.value;

        emit BountyFunded(bountyId, msg.sender, msg.value, bounty.totalFunded);
    }
    
    // Approved hackers can fund bounties using their allocated funds
    function fundBountyAsHacker(uint256 bountyId, uint256 amount) external onlyApprovedHacker {
        require(amount > 0, "Amount must be > 0");
        require(hackerUsedFunds[msg.sender] + amount <= hackerFundLimits[msg.sender], "Exceeds fund limit");
        
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.OPEN, "Bounty not open");
        
        hackerUsedFunds[msg.sender] += amount;
        bounty.totalFunded += amount;
        bounty.reward += amount;
        
        emit BountyFunded(bountyId, msg.sender, amount, bounty.totalFunded);
    }

    // Submit a vulnerability report
    function submitReport(uint256 bountyId, string calldata detailsCid) external returns (uint256) {
        Bounty storage bounty = bounties[bountyId];
        require(bounty.id != 0, "Bounty does not exist");
        require(bounty.status == BountyStatus.OPEN, "Bounty not open");
        require(block.timestamp <= bounty.deadline, "Bounty deadline passed");
        require(msg.sender != bounty.org, "Org cannot submit to own bounty");

        submissionCounter++;
        bounty.submissionCount++;

        submissions[submissionCounter] = Submission({
            id: submissionCounter,
            bountyId: bountyId,
            hunter: msg.sender,
            detailsCid: detailsCid,
            status: SubmissionStatus.PENDING,
            timestamp: block.timestamp
        });

        bountySubmissions[bountyId].push(submissionCounter);

        emit SubmissionCreated(submissionCounter, bountyId, msg.sender, detailsCid);
        return submissionCounter;
    }

    // Approve submission and pay reward
    function approveSubmission(uint256 submissionId, uint256 rewardAmount) external {
        _processSubmissionApproval(submissionId, rewardAmount, false);
    }
    
    // Approve submission as perfect and mint NFT token
    function approvePerfectSubmission(uint256 submissionId, uint256 rewardAmount, string calldata tokenURI) external {
        uint256 tokenId = _processSubmissionApproval(submissionId, rewardAmount, true);
        
        Submission storage submission = submissions[submissionId];
        
        // Mint NFT token for perfect submission
        uint256 mintedTokenId = bugBountyToken.mintPerfectSubmissionToken(
            submission.hunter,
            submission.bountyId,
            submissionId,
            tokenURI
        );
        
        emit PerfectSubmissionRewarded(submissionId, submission.hunter, mintedTokenId);
    }
    
    // Internal function to process submission approval
    function _processSubmissionApproval(uint256 submissionId, uint256 rewardAmount, bool isPerfect) internal returns (uint256) {
        Submission storage submission = submissions[submissionId];
        require(submission.id != 0, "Submission does not exist");
        require(submission.status == SubmissionStatus.PENDING, "Submission already processed");

        Bounty storage bounty = bounties[submission.bountyId];
        require(msg.sender == bounty.org, "Only org can approve");
        require(bounty.status == BountyStatus.OPEN || bounty.status == BountyStatus.IN_REVIEW, "Bounty not accepting approvals");
        require(rewardAmount <= bounty.totalFunded, "Insufficient funds in bounty");

        submission.status = isPerfect ? SubmissionStatus.PERFECT : SubmissionStatus.APPROVED;
        bounty.totalFunded -= rewardAmount;

        // Transfer reward to hunter
        payable(submission.hunter).transfer(rewardAmount);

        emit SubmissionUpdated(submissionId, submission.status);
        emit RewardPaid(submissionId, submission.bountyId, submission.hunter, rewardAmount);
        
        return submissionId;
    }

    // Reject submission
    function rejectSubmission(uint256 submissionId) external {
        Submission storage submission = submissions[submissionId];
        require(submission.id != 0, "Submission does not exist");
        require(submission.status == SubmissionStatus.PENDING, "Submission already processed");

        Bounty storage bounty = bounties[submission.bountyId];
        require(msg.sender == bounty.org, "Only org can reject");

        submission.status = SubmissionStatus.REJECTED;

        emit SubmissionUpdated(submissionId, SubmissionStatus.REJECTED);
    }

    // Org can close bounty and reclaim remaining funds
    function closeBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        require(msg.sender == bounty.org, "Only org can close");
        require(bounty.status == BountyStatus.OPEN || bounty.status == BountyStatus.IN_REVIEW, "Bounty already closed");

        bounty.status = BountyStatus.CLOSED;
        
        // Return remaining funds to org
        if (bounty.totalFunded > 0) {
            uint256 refundAmount = bounty.totalFunded;
            bounty.totalFunded = 0;
            payable(bounty.org).transfer(refundAmount);
        }

        emit BountyUpdated(bountyId, bounty.status);
    }

    // Org can mark bounty as in review
    function setInReview(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        require(msg.sender == bounty.org, "Only org can set status");
        require(bounty.status == BountyStatus.OPEN, "Bounty not open");

        bounty.status = BountyStatus.IN_REVIEW;
        emit BountyUpdated(bountyId, bounty.status);
    }

    // Org can mark bounty as completed
    function completeBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        require(msg.sender == bounty.org, "Only org can complete");
        require(bounty.status == BountyStatus.OPEN || bounty.status == BountyStatus.IN_REVIEW, "Invalid status");

        bounty.status = BountyStatus.COMPLETED;
        
        // Return any remaining funds to org
        if (bounty.totalFunded > 0) {
            uint256 refundAmount = bounty.totalFunded;
            bounty.totalFunded = 0;
            payable(bounty.org).transfer(refundAmount);
        }

        emit BountyUpdated(bountyId, bounty.status);
    }

    // View functions
    function getBountySubmissions(uint256 bountyId) external view returns (uint256[] memory) {
        return bountySubmissions[bountyId];
    }

    function getSubmission(uint256 submissionId) external view returns (Submission memory) {
        return submissions[submissionId];
    }

    function getBounty(uint256 bountyId) external view returns (Bounty memory) {
        return bounties[bountyId];
    }
    
    // View functions for hacker approval system
    function isHackerApproved(address hacker) external view returns (bool) {
        return approvedHackers[hacker];
    }
    
    function getHackerFundLimit(address hacker) external view returns (uint256) {
        return hackerFundLimits[hacker];
    }
    
    function getHackerUsedFunds(address hacker) external view returns (uint256) {
        return hackerUsedFunds[hacker];
    }
    
    function getHackerAvailableFunds(address hacker) external view returns (uint256) {
        if (!approvedHackers[hacker]) return 0;
        return hackerFundLimits[hacker] - hackerUsedFunds[hacker];
    }

}
