# Enhanced Bug Bounty Platform Features

## Overview
The bug bounty platform has been enhanced with fund approval functions for hackers and NFT token minting for perfect submissions.

## New Features

### 1. Hacker Fund Approval System

#### Smart Contract Features
- **Admin-controlled hacker approval**: Only platform admin can approve hackers for funding
- **Fund limits**: Each approved hacker has a spending limit
- **Usage tracking**: System tracks how much each hacker has spent
- **Revocation**: Admin can revoke hacker approval at any time

#### Key Functions
```solidity
function approveHacker(address hacker, uint256 fundLimit) external onlyAdmin
function fundBountyAsHacker(uint256 bountyId, uint256 amount) external onlyApprovedHacker
function getHackerAvailableFunds(address hacker) external view returns (uint256)
```

### 2. Perfect Submission NFT Rewards

#### Smart Contract Features
- **ERC721 Token Contract**: `BugBountyToken.sol` for minting NFTs
- **Perfect submission approval**: Special function to approve and mint NFT simultaneously
- **Metadata storage**: Token metadata stored on IPFS
- **Submission tracking**: Each token linked to specific bounty and submission

#### Key Functions
```solidity
function approvePerfectSubmission(uint256 submissionId, uint256 rewardAmount, string calldata tokenURI) external
function mintPerfectSubmissionToken(address to, uint256 bountyId, uint256 submissionId, string memory uri) public onlyOwner
```

## API Endpoints

### Hacker Management
- `POST /bounties/admin/approve-hacker` - Approve hacker for funding
- `GET /bounties/hacker/:address/status` - Check hacker approval status
- `POST /bounties/:id/fund-as-hacker` - Fund bounty using approved hacker funds

### Perfect Submissions
- `POST /bounties/submissions/:id/approve-perfect` - Approve submission as perfect and mint NFT

## Usage Examples

### 1. Approve a Hacker
```bash
curl -X POST http://localhost:3001/bounties/admin/approve-hacker \
  -H "Content-Type: application/json" \
  -d '{
    "hackerAddress": "0x1234567890123456789012345678901234567890",
    "fundLimit": "10",
    "adminAddress": "0xadmin..."
  }'
```

### 2. Check Hacker Status
```bash
curl http://localhost:3001/bounties/hacker/0x1234567890123456789012345678901234567890/status
```

### 3. Fund Bounty as Approved Hacker
```bash
curl -X POST http://localhost:3001/bounties/bounty-id/fund-as-hacker \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "2",
    "hackerAddress": "0x1234567890123456789012345678901234567890"
  }'
```

### 4. Approve Perfect Submission
```bash
curl -X POST http://localhost:3001/bounties/submissions/submission-id/approve-perfect \
  -H "Content-Type: application/json" \
  -d '{
    "rewardAmount": "5",
    "orgId": "org-id",
    "tokenMetadata": {
      "image": "https://example.com/image.png",
      "description": "Perfect vulnerability discovery"
    }
  }'
```

## Contract Deployment

### Prerequisites
```bash
cd apps/chain
npm install @openzeppelin/contracts
npm install dotenv
```

### Deploy Contracts
```bash
npx hardhat ignition deploy ./ignition/modules/BugBountyPlatform.js --network monad
```

### Deployed Contract Addresses (Monad Network)
- **BugBountyToken**: `0x83F06ECCc61D4D2EcB8C9E516caed9Baa56d606A`
- **BountyPlatform**: `0x8AB8c69917B509Ca4655eCE926cB52546648dB11`

## Contract Architecture

### BugBountyToken.sol
- ERC721 compliant NFT contract
- Stores bounty and submission IDs for each token
- Metadata stored on IPFS
- Only BountyPlatform contract can mint tokens

### Enhanced BountyPlatform.sol
- Integrated with BugBountyToken for NFT minting
- Hacker approval and fund management system
- Perfect submission workflow with automatic NFT minting
- Admin controls for hacker management

## Security Features

1. **Admin-only hacker approval**: Prevents unauthorized fund access
2. **Fund limits**: Limits potential damage from compromised hacker accounts
3. **Usage tracking**: Transparent fund usage monitoring
4. **Perfect submission verification**: Only organizations can mark submissions as perfect
5. **NFT ownership**: Immutable proof of perfect submission achievement

## Events

### New Events
- `HackerApproved(address indexed hacker, uint256 fundLimit)`
- `HackerFundLimitUpdated(address indexed hacker, uint256 newLimit)`
- `PerfectSubmissionRewarded(uint256 indexed submissionId, address indexed hunter, uint256 tokenId)`

## Database Schema Updates

Consider adding these fields to your database schema:
```sql
-- Add to submissions table
ALTER TABLE submissions ADD COLUMN nft_token_id INTEGER;
ALTER TABLE submissions ADD COLUMN token_uri TEXT;

-- Add hacker approval tracking table
CREATE TABLE hacker_approvals (
  id SERIAL PRIMARY KEY,
  hacker_address VARCHAR(42) NOT NULL,
  fund_limit DECIMAL(20,8) NOT NULL,
  used_funds DECIMAL(20,8) DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_by VARCHAR(42) NOT NULL
);
```

## Testing

### Test Scenarios
1. Admin approves hacker with fund limit
2. Hacker funds bounty within limit
3. Hacker attempts to exceed fund limit (should fail)
4. Organization approves perfect submission
5. NFT is minted and assigned to hunter
6. Verify NFT metadata and ownership

### Sample Test Data
```javascript
const testHacker = "0x1234567890123456789012345678901234567890";
const fundLimit = ethers.parseEther("10"); // 10 ETH
const bountyAmount = ethers.parseEther("2"); // 2 ETH
```

This enhanced platform provides a comprehensive solution for managing hacker funding and rewarding exceptional security research with NFT tokens.
