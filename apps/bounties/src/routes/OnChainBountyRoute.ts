import express, { Request, Response, Router } from "express";
import { ethers } from "ethers";
import PinataSDK from "@pinata/sdk";

const router: Router = express.Router();

// Initialize Pinata for IPFS
const pinata = new PinataSDK(
  process.env.PINATA_API_KEY || "", 
  process.env.PINATA_API_SECRET || ""
);

// Initialize Ethereum provider and wallet
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "http://localhost:8545");

let wallet: ethers.Wallet | null = null;
let contract: ethers.Contract | null = null;

// Setup wallet and contract if private key is provided
if (process.env.RELAYER_PRIVATE_KEY) {
  try {
    const privateKey = process.env.RELAYER_PRIVATE_KEY.startsWith('0x') 
      ? process.env.RELAYER_PRIVATE_KEY 
      : `0x${process.env.RELAYER_PRIVATE_KEY}`;
    
    wallet = new ethers.Wallet(privateKey, provider);
    console.log("✅ Wallet initialized:", wallet.address);

    // Contract configuration - Updated from deployment
    const CONTRACT_ADDRESS = "0x8AB8c69917B509Ca4655eCE926cB52546648dB11";
    const CONTRACT_ABI = [
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
        "inputs": [{ "internalType": "uint256", "name": "submissionId", "type": "uint256" }],
        "name": "rejectSubmission",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "uint256", "name": "bountyId", "type": "uint256" }],
        "name": "closeBounty",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "uint256", "name": "bountyId", "type": "uint256" }],
        "name": "getBounty",
        "outputs": [
          {
            "components": [
              { "internalType": "uint256", "name": "id", "type": "uint256" },
              { "internalType": "address", "name": "org", "type": "address" },
              { "internalType": "string", "name": "title", "type": "string" },
              { "internalType": "string", "name": "descriptionCid", "type": "string" },
              { "internalType": "uint256", "name": "reward", "type": "uint256" },
              { "internalType": "uint256", "name": "totalFunded", "type": "uint256" },
              { "internalType": "enum BountyPlatform.BountyStatus", "name": "status", "type": "uint8" },
              { "internalType": "uint256", "name": "deadline", "type": "uint256" },
              { "internalType": "uint256", "name": "submissionCount", "type": "uint256" }
            ],
            "internalType": "struct BountyPlatform.Bounty",
            "name": "",
            "type": "tuple"
          }
        ],
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
        "inputs": [{ "internalType": "uint256", "name": "submissionId", "type": "uint256" }],
        "name": "getSubmission",
        "outputs": [
          {
            "components": [
              { "internalType": "uint256", "name": "id", "type": "uint256" },
              { "internalType": "uint256", "name": "bountyId", "type": "uint256" },
              { "internalType": "address", "name": "hunter", "type": "address" },
              { "internalType": "string", "name": "detailsCid", "type": "string" },
              { "internalType": "enum BountyPlatform.SubmissionStatus", "name": "status", "type": "uint8" },
              { "internalType": "uint256", "name": "timestamp", "type": "uint256" }
            ],
            "internalType": "struct BountyPlatform.Submission",
            "name": "",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
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
      }
    ];

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    console.log("✅ Contract initialized at:", CONTRACT_ADDRESS);
  } catch (error: any) {
    console.error("❌ Failed to initialize wallet/contract:", error.message);
  }
} else {
  console.warn("⚠️  RELAYER_PRIVATE_KEY not set. Blockchain features will be disabled.");
}

// Helper function to get IPFS metadata
async function getIPFSMetadata(cid: string) {
  try {
    if (!cid) return null;
    
    // Try to fetch from IPFS gateway
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("Error fetching IPFS metadata:", error);
    return null;
  }
}

// Helper function to get bounty events from blockchain
async function getBountyEvents(fromBlock = 0) {
  if (!contract) return [];
  
  try {
    const filter = contract.filters.BountyCreated?.();
    if (!filter) return [];
    const events = await contract.queryFilter(filter, fromBlock);
    return events;
  } catch (error) {
    console.error("Error fetching bounty events:", error);
    return [];
  }
}

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ 
    message: "On-chain Bounty service is running", 
    timestamp: new Date().toISOString(),
    contractConnected: !!contract,
    walletConnected: !!wallet
  });
});

// Get all bounties - READ FROM BLOCKCHAIN
router.get("/", async (req: Request, res: Response) => {
  try {
    if (!contract) {
      return res.status(503).json({ error: "Contract not initialized" });
    }

    // Get bounty creation events
    const events = await getBountyEvents();
    const bounties = [];

    for (const event of events) {
      try {
        const eventLog = event as ethers.EventLog;
        const bountyId = eventLog.args?.[0];
        if (!bountyId) continue;

        // Get bounty details from contract
        const bountyData = await contract!.getBounty(bountyId);
        
        // Get IPFS metadata
        const metadata = await getIPFSMetadata(bountyData.descriptionCid);
        
        const bounty = {
          id: bountyData.id.toString(),
          title: bountyData.title,
          description: metadata?.description || "",
          category: metadata?.category || "Other",
          reward: ethers.formatEther(bountyData.reward),
          totalFunded: ethers.formatEther(bountyData.totalFunded),
          status: ["OPEN", "IN_REVIEW", "COMPLETED", "CLOSED"][bountyData.status] || "OPEN",
          deadline: new Date(Number(bountyData.deadline) * 1000).toISOString(),
          submissionCount: bountyData.submissionCount.toString(),
          org: bountyData.org,
          createdAt: metadata?.createdAt || new Date().toISOString(),
          metadataCid: bountyData.descriptionCid
        };

        bounties.push(bounty);
      } catch (error) {
        console.error("Error processing bounty:", error);
        continue;
      }
    }

    res.json({ bounties });
  } catch (error: any) {
    console.error("Error fetching bounties:", error);
    res.status(500).json({ error: "Failed to fetch bounties from blockchain" });
  }
});

// Get single bounty - READ FROM BLOCKCHAIN
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!contract) {
      return res.status(503).json({ error: "Contract not initialized" });
    }

    const bountyId = parseInt(id);
    if (isNaN(bountyId)) {
      return res.status(400).json({ error: "Invalid bounty ID" });
    }

    // Get bounty from contract
    const bountyData = await contract!.getBounty(bountyId);
    
    // Get IPFS metadata
    const metadata = await getIPFSMetadata(bountyData.descriptionCid);
    
    // Get submissions
    const submissionIds = await contract!.getBountySubmissions(bountyId);
    const submissions = [];

    for (const submissionId of submissionIds) {
      try {
        const submissionData = await contract!.getSubmission(submissionId);
        const submissionMetadata = await getIPFSMetadata(submissionData.detailsCid);
        
        submissions.push({
          id: submissionData.id.toString(),
          bountyId: submissionData.bountyId.toString(),
          hunter: submissionData.hunter,
          details: submissionMetadata?.details || "",
          status: ["PENDING", "APPROVED", "REJECTED"][submissionData.status] || "PENDING",
          timestamp: new Date(Number(submissionData.timestamp) * 1000).toISOString(),
          detailsCid: submissionData.detailsCid
        });
      } catch (error) {
        console.error("Error processing submission:", error);
        continue;
      }
    }

    const bounty = {
      id: bountyData.id.toString(),
      title: bountyData.title,
      description: metadata?.description || "",
      category: metadata?.category || "Other",
      reward: ethers.formatEther(bountyData.reward),
      totalFunded: ethers.formatEther(bountyData.totalFunded),
      status: ["OPEN", "IN_REVIEW", "COMPLETED", "CLOSED"][bountyData.status] || "OPEN",
      deadline: new Date(Number(bountyData.deadline) * 1000).toISOString(),
      submissionCount: bountyData.submissionCount.toString(),
      org: bountyData.org,
      createdAt: metadata?.createdAt || new Date().toISOString(),
      metadataCid: bountyData.descriptionCid,
      submissions
    };

    res.json(bounty);
  } catch (error: any) {
    console.error("Error fetching bounty:", error);
    res.status(500).json({ error: "Failed to fetch bounty from blockchain" });
  }
});

// Create bounty - WRITE TO BLOCKCHAIN ONLY
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, category, reward, deadline } = req.body;

    if (!title || !reward || !deadline) {
      return res.status(400).json({ error: "Missing required fields: title, reward, deadline" });
    }

    if (!contract || !wallet) {
      return res.status(503).json({ error: "Contract or wallet not initialized" });
    }

    let metadataCid = "";

    // Step 1: Upload metadata to IPFS
    if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
      try {
        const metadata = {
          title,
          description: description || "",
          category: category || "Other",
          reward,
          deadline,
          createdAt: new Date().toISOString(),
        };

        const pinataResponse = await pinata.pinJSONToIPFS(metadata, {
          pinataMetadata: { name: `bounty-${title}-${Date.now()}` },
        });

        metadataCid = pinataResponse.IpfsHash;
        console.log("✅ Metadata uploaded to IPFS:", metadataCid);
      } catch (ipfsError: any) {
        console.error("⚠️  IPFS upload failed:", ipfsError.message);
        return res.status(500).json({ error: "Failed to upload metadata to IPFS" });
      }
    } else {
      return res.status(500).json({ error: "IPFS configuration required" });
    }

    // Step 2: Create bounty on blockchain
    try {
      const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
      const rewardInWei = ethers.parseEther(String(reward));

      const tx = await contract!.createBounty(
        title,
        metadataCid,
        deadlineTimestamp,
        { value: rewardInWei }
      );

      console.log("✅ Bounty creation transaction submitted:", tx.hash);

      // Wait for confirmation
      const receipt = await tx.wait(1);
      console.log("✅ Bounty creation confirmed in block:", receipt.blockNumber);

      // Extract bounty ID from events
      let bountyId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract!.interface.parseLog(log);
          if (parsed?.name === "BountyCreated") {
            bountyId = parsed.args[0].toString();
            break;
          }
        } catch (e) {
          continue;
        }
      }

      res.status(201).json({
        message: "Bounty created successfully on blockchain",
        bountyId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        metadataCid
      });

    } catch (contractError: any) {
      console.error("❌ Contract transaction failed:", contractError);
      res.status(500).json({ 
        error: "Failed to create bounty on blockchain",
        details: contractError.message 
      });
    }

  } catch (error: any) {
    console.error("Error creating bounty:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Submit report - WRITE TO BLOCKCHAIN ONLY
router.post("/:id/submit", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { details, hunter } = req.body;

    if (!details || !hunter) {
      return res.status(400).json({ error: "Missing required fields: details, hunter" });
    }

    if (!contract || !wallet) {
      return res.status(503).json({ error: "Contract or wallet not initialized" });
    }

    const bountyId = parseInt(id);
    if (isNaN(bountyId)) {
      return res.status(400).json({ error: "Invalid bounty ID" });
    }

    let detailsCid = "";

    // Step 1: Upload submission details to IPFS
    if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
      try {
        const submissionData = {
          details,
          hunter,
          bountyId,
          submittedAt: new Date().toISOString(),
        };

        const pinataResponse = await pinata.pinJSONToIPFS(submissionData, {
          pinataMetadata: { name: `submission-${bountyId}-${Date.now()}` },
        });

        detailsCid = pinataResponse.IpfsHash;
        console.log("✅ Submission details uploaded to IPFS:", detailsCid);
      } catch (ipfsError: any) {
        console.error("⚠️  IPFS upload failed:", ipfsError.message);
        return res.status(500).json({ error: "Failed to upload submission to IPFS" });
      }
    } else {
      return res.status(500).json({ error: "IPFS configuration required" });
    }

    // Step 2: Submit to blockchain
    try {
      const tx = await contract!.submitReport(bountyId, detailsCid);
      console.log("✅ Submission transaction submitted:", tx.hash);

      const receipt = await tx.wait(1);
      console.log("✅ Submission confirmed in block:", receipt.blockNumber);

      // Extract submission ID from events
      let submissionId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract!.interface.parseLog(log);
          if (parsed?.name === "SubmissionCreated") {
            submissionId = parsed.args[0].toString();
            break;
          }
        } catch (e) {
          continue;
        }
      }

      res.status(201).json({
        message: "Submission created successfully on blockchain",
        submissionId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        detailsCid
      });

    } catch (contractError: any) {
      console.error("❌ Contract transaction failed:", contractError);
      res.status(500).json({ 
        error: "Failed to submit report to blockchain",
        details: contractError.message 
      });
    }

  } catch (error: any) {
    console.error("Error submitting report:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Fund bounty as hacker - WRITE TO BLOCKCHAIN ONLY
router.post("/:id/fund-as-hacker", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ error: "Missing required field: amount" });
    }

    if (!contract || !wallet) {
      return res.status(503).json({ error: "Contract or wallet not initialized" });
    }

    const bountyId = parseInt(id);
    if (isNaN(bountyId)) {
      return res.status(400).json({ error: "Invalid bounty ID" });
    }

    // Submit to blockchain
    try {
      const amountInWei = ethers.parseEther(String(amount));
      
      const tx = await contract!.fundBountyAsHacker(bountyId, amountInWei);
      console.log("✅ Hacker funding transaction submitted:", tx.hash);

      const receipt = await tx.wait(1);
      console.log("✅ Hacker funding confirmed in block:", receipt.blockNumber);

      res.json({
        message: "Bounty funded successfully by hacker",
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        amount: ethers.formatEther(amountInWei)
      });

    } catch (contractError: any) {
      console.error("❌ Contract transaction failed:", contractError);
      res.status(500).json({ 
        error: "Failed to fund bounty on blockchain",
        details: contractError.message 
      });
    }

  } catch (error: any) {
    console.error("Error funding bounty:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve hacker - WRITE TO BLOCKCHAIN ONLY
router.post("/approve-hacker", async (req: Request, res: Response) => {
  try {
    const { hackerAddress, fundLimit } = req.body;

    if (!hackerAddress || !fundLimit) {
      return res.status(400).json({ error: "Missing required fields: hackerAddress, fundLimit" });
    }

    if (!contract || !wallet) {
      return res.status(503).json({ error: "Contract or wallet not initialized" });
    }

    try {
      const fundLimitInWei = ethers.parseEther(String(fundLimit));
      
      const tx = await contract!.approveHacker(hackerAddress, fundLimitInWei);
      console.log("✅ Hacker approval transaction submitted:", tx.hash);

      const receipt = await tx.wait(1);
      console.log("✅ Hacker approval confirmed in block:", receipt.blockNumber);

      res.json({
        message: "Hacker approved successfully",
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        hackerAddress,
        fundLimit: ethers.formatEther(fundLimitInWei)
      });

    } catch (contractError: any) {
      console.error("❌ Contract transaction failed:", contractError);
      res.status(500).json({ 
        error: "Failed to approve hacker on blockchain",
        details: contractError.message 
      });
    }

  } catch (error: any) {
    console.error("Error approving hacker:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Approve perfect submission - WRITE TO BLOCKCHAIN ONLY
router.post("/submissions/:submissionId/approve-perfect", async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { rewardAmount, tokenMetadata } = req.body;

    if (!rewardAmount || !tokenMetadata) {
      return res.status(400).json({ error: "Missing required fields: rewardAmount, tokenMetadata" });
    }

    if (!contract || !wallet) {
      return res.status(503).json({ error: "Contract or wallet not initialized" });
    }

    const submissionIdNum = parseInt(submissionId);
    if (isNaN(submissionIdNum)) {
      return res.status(400).json({ error: "Invalid submission ID" });
    }

    let tokenURI = "";

    // Step 1: Upload NFT metadata to IPFS
    if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
      try {
        const pinataResponse = await pinata.pinJSONToIPFS(tokenMetadata, {
          pinataMetadata: { name: `nft-metadata-${submissionId}-${Date.now()}` },
        });

        tokenURI = `https://gateway.pinata.cloud/ipfs/${pinataResponse.IpfsHash}`;
        console.log("✅ NFT metadata uploaded to IPFS:", tokenURI);
      } catch (ipfsError: any) {
        console.error("⚠️  IPFS upload failed:", ipfsError.message);
        return res.status(500).json({ error: "Failed to upload NFT metadata to IPFS" });
      }
    } else {
      return res.status(500).json({ error: "IPFS configuration required" });
    }

    // Step 2: Approve perfect submission on blockchain
    try {
      const rewardInWei = ethers.parseEther(String(rewardAmount));
      
      const tx = await contract!.approvePerfectSubmission(
        submissionIdNum,
        rewardInWei,
        tokenURI
      );
      console.log("✅ Perfect submission approval transaction submitted:", tx.hash);

      const receipt = await tx.wait(1);
      console.log("✅ Perfect submission approval confirmed in block:", receipt.blockNumber);

      // Extract token ID from events
      let tokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract!.interface.parseLog(log);
          if (parsed?.name === "PerfectSubmissionRewarded") {
            tokenId = parsed.args[2].toString();
            break;
          }
        } catch (e) {
          continue;
        }
      }

      res.json({
        message: "Perfect submission approved and NFT minted successfully",
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        tokenId,
        tokenURI,
        rewardAmount: ethers.formatEther(rewardInWei)
      });

    } catch (contractError: any) {
      console.error("❌ Contract transaction failed:", contractError);
      res.status(500).json({ 
        error: "Failed to approve perfect submission on blockchain",
        details: contractError.message 
      });
    }

  } catch (error: any) {
    console.error("Error approving perfect submission:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get hacker status - READ FROM BLOCKCHAIN
router.get("/hacker/:address/status", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!contract) {
      return res.status(503).json({ error: "Contract not initialized" });
    }

    const isApproved = await contract!.isHackerApproved(address);
    const availableFunds = await contract!.getHackerAvailableFunds(address);

    res.json({
      address,
      isApproved,
      availableFunds: ethers.formatEther(availableFunds)
    });

  } catch (error: any) {
    console.error("Error getting hacker status:", error);
    res.status(500).json({ error: "Failed to get hacker status from blockchain" });
  }
});

export default router;
