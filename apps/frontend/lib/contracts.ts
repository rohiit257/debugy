// Contract addresses and ABIs for the enhanced bug bounty platform

export const CONTRACT_ADDRESSES = {
  BOUNTY_PLATFORM: "0x8AB8c69917B509Ca4655eCE926cB52546648dB11", // Deployed BountyPlatform contract
  BUG_BOUNTY_TOKEN: "0x83F06ECCc61D4D2EcB8C9E516caed9Baa56d606A", // Deployed BugBountyToken contract
} as const;

export const BOUNTY_PLATFORM_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "title", "type": "string" },
      { "internalType": "string", "name": "descriptionCid", "type": "string" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" }
    ],
    "name": "createBounty",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "bountyId", "type": "uint256" }],
    "name": "fundBounty",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bountyId", "type": "uint256" },
      { "internalType": "string", "name": "detailsCid", "type": "string" }
    ],
    "name": "submitReport",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "submissionId", "type": "uint256" },
      { "internalType": "uint256", "name": "rewardAmount", "type": "uint256" }
    ],
    "name": "approveSubmission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "hacker", "type": "address" },
      { "internalType": "uint256", "name": "fundLimit", "type": "uint256" }
    ],
    "name": "approveHacker",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "bountyId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "fundBountyAsHacker",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "submissionId", "type": "uint256" },
      { "internalType": "uint256", "name": "rewardAmount", "type": "uint256" },
      { "internalType": "string", "name": "tokenURI", "type": "string" }
    ],
    "name": "approvePerfectSubmission",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "hacker", "type": "address" }],
    "name": "isHackerApproved",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "hacker", "type": "address" }],
    "name": "getHackerAvailableFunds",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "bountyId", "type": "uint256" }],
    "name": "getBountySubmissions",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "hacker", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "fundLimit", "type": "uint256" }
    ],
    "name": "HackerApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "submissionId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "hunter", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "PerfectSubmissionRewarded",
    "type": "event"
  }
] as const;

export const BUG_BOUNTY_TOKEN_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "to", "type": "address" },
      { "internalType": "uint256", "name": "bountyId", "type": "uint256" },
      { "internalType": "uint256", "name": "submissionId", "type": "uint256" },
      { "internalType": "string", "name": "uri", "type": "string" }
    ],
    "name": "mintPerfectSubmissionToken",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "getTokensByOwner",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "tokenURI",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getBountyId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getSubmissionId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
