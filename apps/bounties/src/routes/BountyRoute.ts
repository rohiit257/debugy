import express, { Request, Response, Router } from "express";
import { ethers } from "ethers";
import PinataSDK from "@pinata/sdk";
import { prisma } from "@repo/db/client";

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
        "name": "setInReview",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "uint256", "name": "bountyId", "type": "uint256" }],
        "name": "completeBounty",
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
          { "indexed": true, "internalType": "uint256", "name": "bountyId", "type": "uint256" },
          { "indexed": true, "internalType": "address", "name": "org", "type": "address" },
          { "indexed": false, "internalType": "string", "name": "metadataCid", "type": "string" },
          { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }
        ],
        "name": "BountyCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "uint256", "name": "bountyId", "type": "uint256" },
          { "indexed": true, "internalType": "address", "name": "funder", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" },
          { "indexed": false, "internalType": "uint256", "name": "totalFunded", "type": "uint256" }
        ],
        "name": "BountyFunded",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "uint256", "name": "submissionId", "type": "uint256" },
          { "indexed": true, "internalType": "uint256", "name": "bountyId", "type": "uint256" },
          { "indexed": true, "internalType": "address", "name": "hunter", "type": "address" },
          { "indexed": false, "internalType": "string", "name": "detailsCid", "type": "string" }
        ],
        "name": "SubmissionCreated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "uint256", "name": "submissionId", "type": "uint256" },
          { "indexed": false, "internalType": "enum BountyPlatform.SubmissionStatus", "name": "status", "type": "uint8" }
        ],
        "name": "SubmissionUpdated",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          { "indexed": true, "internalType": "uint256", "name": "submissionId", "type": "uint256" },
          { "indexed": true, "internalType": "uint256", "name": "bountyId", "type": "uint256" },
          { "indexed": true, "internalType": "address", "name": "hunter", "type": "address" },
          { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "RewardPaid",
        "type": "event"
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
    ];

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, wallet);
    console.log("✅ Contract initialized at:", CONTRACT_ADDRESS);
  } catch (error: any) {
    console.error("❌ Failed to initialize wallet/contract:", error.message);
  }
} else {
  console.warn("⚠️  RELAYER_PRIVATE_KEY not set. Blockchain features will be disabled.");
}

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Bounty service is running", timestamp: new Date().toISOString() });
});

// Create bounty
router.post("/", async (req: Request, res: Response) => {
  try {
    const { title, description, category, reward, deadline, orgId } = req.body;

    // Validation
    if (!title || !reward || !deadline) {
      return res.status(400).json({ error: "Missing required fields: title, reward, deadline" });
    }

    let metadataCid = "";
    let txHash = "";

    // Step 1: Upload metadata to IPFS (if Pinata is configured)
    if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
      try {
        const metadata = {
          title,
          description,
          category,
          reward,
          deadline,
          orgId,
          createdAt: new Date().toISOString(),
        };

        const pinataResponse = await pinata.pinJSONToIPFS(metadata, {
          pinataMetadata: { name: `bounty-${title}-${Date.now()}` },
        });

        metadataCid = pinataResponse.IpfsHash;
        console.log("✅ Metadata uploaded to IPFS:", metadataCid);
      } catch (ipfsError: any) {
        console.error("⚠️  IPFS upload failed:", ipfsError.message);
        // Continue without IPFS
      }
    }

    

    // Step 2: Create bounty in database
    const bounty = await prisma.bounty.create({
      data: {
        title,
        description: description || "",
        category: category || "Other",
        reward: Number(reward),
        deadline: new Date(deadline),
        status: "OPEN",
        ...(orgId && { orgId }), // Only include orgId if it exists
      },
    });

    console.log("✅ Bounty created in DB:", bounty.id);

    // Step 3: Submit blockchain transaction (if wallet is configured)
    if (contract && wallet) {
      try {
        const deadlineTimestamp = Math.floor(new Date(deadline).getTime() / 1000);
        const rewardInWei = ethers.parseEther(String(reward));

        const tx = await (contract as any).createBounty(
          title,
          metadataCid || "QmDefault",
          deadlineTimestamp,
          { value: rewardInWei }
        );

        txHash = tx.hash;
        console.log("✅ Transaction submitted:", txHash);

        // Wait for confirmation in background
        tx.wait(1)
          .then(async (receipt: any) => {
            console.log("✅ Transaction confirmed:", receipt.hash);
            
            // Parse events to get onchain bounty ID
            const iface = new ethers.Interface([
              {
                "anonymous": false,
                "inputs": [
                  { "indexed": true, "internalType": "uint256", "name": "bountyId", "type": "uint256" },
                  { "indexed": true, "internalType": "address", "name": "org", "type": "address" },
                  { "indexed": false, "internalType": "string", "name": "metadataCid", "type": "string" },
                  { "indexed": false, "internalType": "uint256", "name": "reward", "type": "uint256" },
                  { "indexed": false, "internalType": "uint256", "name": "deadline", "type": "uint256" }
                ],
                "name": "BountyCreated",
                "type": "event"
              }
            ]);

            for (const log of receipt.logs) {
              try {
                const parsed = iface.parseLog({ topics: log.topics as string[], data: log.data });
                if (parsed && parsed.name === "BountyCreated") {
                  const onchainId = parsed.args.bountyId.toString();
                  console.log("✅ Onchain bounty ID:", onchainId);
                  break;
                }
              } catch (e) {
                // Not our event
              }
            }
          })
          .catch(async (err: any) => {
            console.error("❌ Transaction failed:", err);
            // Mark bounty as closed if blockchain tx fails
            await prisma.bounty.update({
              where: { id: bounty.id },
              data: { status: "CLOSED" },
            });
          });
      } catch (chainError: any) {
        console.error("⚠️  Blockchain transaction failed:", chainError.message);
        // Continue without blockchain
      }
    }

    // Step 4: Return success response
    res.json({
      success: true,
      bounty: {
        id: bounty.id,
        title: bounty.title,
        description: bounty.description,
        category: bounty.category,
        reward: bounty.reward,
        deadline: bounty.deadline,
        status: bounty.status,
        createdAt: bounty.createdAt,
      },
      metadataCid: metadataCid || null,
      txHash: txHash || null,
      message: txHash 
        ? "Bounty created and submitted to blockchain" 
        : "Bounty created successfully",
    });
  } catch (err: any) {
    console.error("❌ Error creating bounty:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get all bounties
router.get("/", async (req: Request, res: Response) => {
  try {
    const { orgId, status } = req.query;

    const where: any = {};
    if (orgId) where.orgId = orgId as string;
    if (status) where.status = status as string;

    const bounties = await prisma.bounty.findMany({
      where,
      include: {
        submissions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ bounties });
  } catch (err: any) {
    console.error("❌ Error fetching bounties:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get single bounty
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const bounty = await prisma.bounty.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            hunter: {
              select: {
                address: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    res.json({ bounty });
  } catch (err: any) {
    console.error("❌ Error fetching bounty:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Close bounty
router.patch("/:id/close", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { orgId } = req.body;

    const bounty = await prisma.bounty.findUnique({ where: { id } });

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    if (bounty.orgId !== orgId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update in DB
    const updatedBounty = await prisma.bounty.update({
      where: { id },
      data: { status: "CLOSED" },
    });

    res.json({ success: true, bounty: updatedBounty });
  } catch (err: any) {
    console.error("❌ Error closing bounty:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Fund bounty (add additional funds)
router.post("/:id/fund", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, funderAddress } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const bounty = await prisma.bounty.findUnique({ where: { id } });

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    if (bounty.status !== "OPEN") {
      return res.status(400).json({ error: "Bounty is not open for funding" });
    }

    let txHash = "";

    // Submit to blockchain if configured
    if (contract && wallet) {
      try {
        const amountInWei = ethers.parseEther(String(amount));
        
        // Call fundBounty on contract (assuming we have onchain bounty ID)
        // For now, we'll skip blockchain integration and just update DB
        console.log("⚠️  Blockchain funding not yet implemented");
      } catch (chainError: any) {
        console.error("⚠️  Blockchain funding failed:", chainError.message);
      }
    }

    // Update bounty reward in database
    const updatedBounty = await prisma.bounty.update({
      where: { id },
      data: {
        reward: bounty.reward + Number(amount),
      },
    });

    res.json({
      success: true,
      bounty: updatedBounty,
      message: "Bounty funded successfully",
      txHash: txHash || null,
    });
  } catch (err: any) {
    console.error("❌ Error funding bounty:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Submit report to bounty
router.post("/:id/submit", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hunterId, details, hunterAddress } = req.body;

    if (!hunterId || !details) {
      return res.status(400).json({ error: "Missing required fields: hunterId, details" });
    }

    const bounty = await prisma.bounty.findUnique({ where: { id } });

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    if (bounty.status !== "OPEN") {
      return res.status(400).json({ error: "Bounty is not accepting submissions" });
    }

    if (new Date() > new Date(bounty.deadline)) {
      return res.status(400).json({ error: "Bounty deadline has passed" });
    }

    let detailsCid = "";
    let txHash = "";

    // Upload submission details to IPFS
    if (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
      try {
        const submissionData = {
          bountyId: id,
          hunterId,
          details,
          timestamp: new Date().toISOString(),
        };

        const pinataResponse = await pinata.pinJSONToIPFS(submissionData, {
          pinataMetadata: { name: `submission-${id}-${hunterId}-${Date.now()}` },
        });

        detailsCid = pinataResponse.IpfsHash;
        console.log("✅ Submission uploaded to IPFS:", detailsCid);
      } catch (ipfsError: any) {
        console.error("⚠️  IPFS upload failed:", ipfsError.message);
      }
    }

    // Create submission in database
    const submission = await prisma.submission.create({
      data: {
        bounty: {
          connect: { id }
        },
        hunter: {
          connect: { id: hunterId }
        },
        details,
        status: "PENDING",
      },
      include: {
        hunter: {
          select: {
            id: true,
            address: true,
            name: true,
          },
        },
        bounty: {
          select: {
            id: true,
            title: true,
            reward: true,
          },
        },
      },
    });

    console.log("✅ Submission created in DB:", submission.id);

    // Submit to blockchain if configured
    if (contract && wallet && hunterAddress) {
      try {
        // Call submitReport on contract
        // For now, we'll skip blockchain integration
        console.log("⚠️  Blockchain submission not yet implemented");
      } catch (chainError: any) {
        console.error("⚠️  Blockchain submission failed:", chainError.message);
      }
    }

    res.json({
      success: true,
      submission,
      detailsCid: detailsCid || null,
      txHash: txHash || null,
      message: "Submission created successfully",
    });
  } catch (err: any) {
    console.error("❌ Error creating submission:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Update bounty status
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, orgId } = req.body;

    if (!status || !["OPEN", "CLOSED", "IN_REVIEW", "COMPLETED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const bounty = await prisma.bounty.findUnique({ where: { id } });

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    if (bounty.orgId !== orgId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedBounty = await prisma.bounty.update({
      where: { id },
      data: { status },
    });

    res.json({ success: true, bounty: updatedBounty });
  } catch (err: any) {
    console.error("❌ Error updating bounty status:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Approve hacker for funding
router.post("/admin/approve-hacker", async (req: Request, res: Response) => {
  try {
    const { hackerAddress, fundLimit, adminAddress } = req.body;

    if (!hackerAddress || !fundLimit || !adminAddress) {
      return res.status(400).json({ error: "Missing required fields: hackerAddress, fundLimit, adminAddress" });
    }

    let txHash = "";

    // Submit to blockchain if configured
    if (contract && wallet) {
      try {
        const fundLimitInWei = ethers.parseEther(String(fundLimit));
        
        const tx = await (contract as any).approveHacker(
          hackerAddress,
          fundLimitInWei
        );

        txHash = tx.hash;
        console.log("✅ Hacker approval transaction submitted:", txHash);

        // Wait for confirmation
        await tx.wait(1);
        console.log("✅ Hacker approval confirmed:", txHash);
      } catch (chainError: any) {
        console.error("⚠️  Blockchain hacker approval failed:", chainError.message);
        return res.status(500).json({ error: "Blockchain transaction failed", details: chainError.message });
      }
    }

    res.json({
      success: true,
      message: "Hacker approved for funding",
      txHash: txHash || null,
      hackerAddress,
      fundLimit,
    });
  } catch (err: any) {
    console.error("❌ Error approving hacker:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Check hacker approval status
router.get("/hacker/:address/status", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!contract) {
      return res.status(503).json({ error: "Blockchain not configured" });
    }

    try {
      const isApproved = await (contract as any).isHackerApproved(address);
      const availableFunds = await (contract as any).getHackerAvailableFunds(address);
      
      res.json({
        address,
        isApproved,
        availableFunds: ethers.formatEther(availableFunds),
      });
    } catch (chainError: any) {
      console.error("⚠️  Error checking hacker status:", chainError.message);
      res.status(500).json({ error: "Blockchain query failed", details: chainError.message });
    }
  } catch (err: any) {
    console.error("❌ Error checking hacker status:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Fund bounty as approved hacker
router.post("/:id/fund-as-hacker", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { amount, hackerAddress } = req.body;

    if (!amount || amount <= 0 || !hackerAddress) {
      return res.status(400).json({ error: "Invalid amount or missing hacker address" });
    }

    const bounty = await prisma.bounty.findUnique({ where: { id } });

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    if (bounty.status !== "OPEN") {
      return res.status(400).json({ error: "Bounty is not open for funding" });
    }

    let txHash = "";

    // Submit to blockchain if configured
    if (contract && wallet) {
      try {
        const amountInWei = ethers.parseEther(String(amount));
        
        // Call fundBountyAsHacker on contract
        const bountyIdNum = parseInt(id, 10);
        if (isNaN(bountyIdNum)) {
          throw new Error("Invalid bounty ID");
        }
        
        const tx = await (contract as any).fundBountyAsHacker(
          bountyIdNum,
          amountInWei
        );

        txHash = tx.hash;
        console.log("✅ Hacker funding transaction submitted:", txHash);

        // Wait for confirmation
        await tx.wait(1);
        console.log("✅ Hacker funding confirmed:", txHash);
      } catch (chainError: any) {
        console.error("⚠️  Blockchain hacker funding failed:", chainError.message);
        return res.status(500).json({ error: "Blockchain transaction failed", details: chainError.message });
      }
    }

    // Update bounty reward in database
    const updatedBounty = await prisma.bounty.update({
      where: { id },
      data: {
        reward: bounty.reward + Number(amount),
      },
    });

    res.json({
      success: true,
      bounty: updatedBounty,
      message: "Bounty funded by approved hacker",
      txHash: txHash || null,
    });
  } catch (err: any) {
    console.error("❌ Error funding bounty as hacker:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Approve submission as perfect (with NFT minting)
router.post("/submissions/:id/approve-perfect", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rewardAmount, orgId, tokenMetadata } = req.body;

    if (!rewardAmount || !orgId) {
      return res.status(400).json({ error: "Missing required fields: rewardAmount, orgId" });
    }

    // Find submission in database
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        bounty: true,
        hunter: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    if (submission.bounty.orgId !== orgId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (submission.status !== "PENDING") {
      return res.status(400).json({ error: "Submission already processed" });
    }

    let tokenURI = "";
    let txHash = "";

    // Upload token metadata to IPFS if provided
    if (tokenMetadata && process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET) {
      try {
        const metadata = {
          name: `Perfect Bug Bounty Submission #${id}`,
          description: `Perfect submission for bounty: ${submission.bounty.title}`,
          image: tokenMetadata.image || "",
          attributes: [
            {
              trait_type: "Bounty Title",
              value: submission.bounty.title
            },
            {
              trait_type: "Reward Amount",
              value: `${rewardAmount} ETH`
            },
            {
              trait_type: "Submission Date",
              value: submission.createdAt.toISOString()
            },
            {
              trait_type: "Hunter",
              value: submission.hunter.address
            }
          ],
          ...tokenMetadata
        };

        const pinataResponse = await pinata.pinJSONToIPFS(metadata, {
          pinataMetadata: { name: `perfect-submission-token-${id}` },
        });

        tokenURI = `ipfs://${pinataResponse.IpfsHash}`;
        console.log("✅ Token metadata uploaded to IPFS:", tokenURI);
      } catch (ipfsError: any) {
        console.error("⚠️  IPFS token metadata upload failed:", ipfsError.message);
        tokenURI = `data:application/json,{"name":"Perfect Submission #${id}","description":"Perfect bug bounty submission"}`;
      }
    } else {
      tokenURI = `data:application/json,{"name":"Perfect Submission #${id}","description":"Perfect bug bounty submission"}`;
    }

    // Submit to blockchain if configured
    if (contract && wallet) {
      try {
        const rewardInWei = ethers.parseEther(String(rewardAmount));
        
        const submissionIdNum = parseInt(id, 10);
        if (isNaN(submissionIdNum)) {
          throw new Error("Invalid submission ID");
        }
        
        const tx = await (contract as any).approvePerfectSubmission(
          submissionIdNum,
          rewardInWei,
          tokenURI
        );

        txHash = tx.hash;
        console.log("✅ Perfect submission approval transaction submitted:", txHash);

        // Wait for confirmation
        await tx.wait(1);
        console.log("✅ Perfect submission approval confirmed:", txHash);
      } catch (chainError: any) {
        console.error("⚠️  Blockchain perfect submission approval failed:", chainError.message);
        return res.status(500).json({ error: "Blockchain transaction failed", details: chainError.message });
      }
    }

    // Update submission status in database
    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status: "APPROVED" }, // We could add PERFECT status to DB schema too
      include: {
        hunter: {
          select: {
            id: true,
            address: true,
            name: true,
          },
        },
        bounty: {
          select: {
            id: true,
            title: true,
            reward: true,
          },
        },
      },
    });

    res.json({
      success: true,
      submission: updatedSubmission,
      message: "Perfect submission approved and NFT minted",
      txHash: txHash || null,
      tokenURI,
      rewardAmount,
    });
  } catch (err: any) {
    console.error("❌ Error approving perfect submission:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
