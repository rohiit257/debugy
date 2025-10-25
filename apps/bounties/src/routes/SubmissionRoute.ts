import express, { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";

const router: Router = express.Router();

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "Submission service is running", timestamp: new Date().toISOString() });
});

// Create submission
router.post("/", async (req: Request, res: Response) => {
  try {
    const { bountyId, hunterId, details } = req.body;

    // Validation
    if (!bountyId || !hunterId || !details) {
      return res.status(400).json({ error: "Missing required fields: bountyId, hunterId, details" });
    }

    // Check if bounty exists and is open
    const bounty = await prisma.bounty.findUnique({
      where: { id: bountyId },
    });

    if (!bounty) {
      return res.status(404).json({ error: "Bounty not found" });
    }

    if (bounty.status !== "OPEN") {
      return res.status(400).json({ error: "Bounty is not open for submissions" });
    }

    // Check if hunter exists
    const hunter = await prisma.user.findUnique({
      where: { id: hunterId },
    });

    if (!hunter) {
      return res.status(404).json({ error: "Hunter not found" });
    }

    if (hunter.role !== "HUNTER") {
      return res.status(403).json({ error: "Only hunters can submit reports" });
    }

    // Create submission
    const submission = await prisma.submission.create({
      data: {
        bountyId,
        hunterId,
        details,
        status: "PENDING",
      },
      include: {
        hunter: {
          select: {
            id: true,
            name: true,
            address: true,
            reputation: true,
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

    console.log("✅ Submission created:", submission.id);

    res.json({
      success: true,
      submission,
      message: "Submission created successfully",
    });
  } catch (err: any) {
    console.error("❌ Error creating submission:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get all submissions for a bounty
router.get("/bounty/:bountyId", async (req: Request, res: Response) => {
  try {
    const { bountyId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { bountyId },
      include: {
        hunter: {
          select: {
            id: true,
            name: true,
            address: true,
            reputation: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ submissions });
  } catch (err: any) {
    console.error("❌ Error fetching submissions:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get all submissions by a hunter
router.get("/hunter/:hunterId", async (req: Request, res: Response) => {
  try {
    const { hunterId } = req.params;

    const submissions = await prisma.submission.findMany({
      where: { hunterId },
      include: {
        bounty: {
          select: {
            id: true,
            title: true,
            reward: true,
            status: true,
            deadline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ submissions });
  } catch (err: any) {
    console.error("❌ Error fetching submissions:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Update submission status (for org/admin)
router.patch("/:id/status", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, orgId } = req.body;

    if (!status || !["PENDING", "APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        bounty: true,
      },
    });

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" });
    }

    // Check authorization
    if (submission.bounty.orgId !== orgId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: { status },
      include: {
        hunter: {
          select: {
            id: true,
            name: true,
            address: true,
            reputation: true,
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

    res.json({ success: true, submission: updatedSubmission });
  } catch (err: any) {
    console.error("❌ Error updating submission:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
