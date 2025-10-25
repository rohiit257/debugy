import express, { Request, Response, Router } from "express";
import { prisma } from "@repo/db/client";

const router: Router = express.Router();

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ message: "User service is running", timestamp: new Date().toISOString() });
});

// Get user by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        address: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        reputation: true,
        onboardingStatus: true,
        avatar: true,
        location: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        discord: true,
        telegram: true,
        badges: true,
        orgName: true,
        orgWebsite: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err: any) {
    console.error("❌ Error fetching user:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get user by wallet address (with full details including submissions)
router.get("/wallet/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ error: "Wallet address is required" });
    }

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      include: {
        submissions: {
          include: {
            bounty: {
              select: {
                id: true,
                title: true,
                reward: true,
                status: true,
                category: true,
                deadline: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate stats
    const stats = {
      totalSubmissions: user.submissions.length,
      approved: user.submissions.filter((s) => s.status === "APPROVED").length,
      pending: user.submissions.filter((s) => s.status === "PENDING").length,
      rejected: user.submissions.filter((s) => s.status === "REJECTED").length,
      totalEarnings: user.submissions
        .filter((s) => s.status === "APPROVED")
        .reduce((sum, s) => sum + s.bounty.reward, 0),
    };

    console.log(`✅ Fetched user by wallet: ${address}`);

    res.json({
      user: {
        id: user.id,
        address: user.address,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        reputation: user.reputation,
        onboardingStatus: user.onboardingStatus,
        avatar: user.avatar,
        location: user.location,
        website: user.website,
        twitter: user.twitter,
        github: user.github,
        linkedin: user.linkedin,
        discord: user.discord,
        telegram: user.telegram,
        badges: user.badges,
        orgName: user.orgName,
        orgWebsite: user.orgWebsite,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats,
      submissions: user.submissions,
    });
  } catch (err: any) {
    console.error("❌ Error fetching user by wallet:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get user by wallet address (basic info only)
router.get("/address/:address", async (req: Request, res: Response) => {
  try {
    const { address } = req.params;

    const user = await prisma.user.findUnique({
      where: { address: address.toLowerCase() },
      select: {
        id: true,
        address: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        reputation: true,
        onboardingStatus: true,
        avatar: true,
        location: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        discord: true,
        telegram: true,
        badges: true,
        orgName: true,
        orgWebsite: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user });
  } catch (err: any) {
    console.error("❌ Error fetching user by address:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Update user profile
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, bio } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(email !== undefined && { email }),
        ...(bio !== undefined && { bio }),
      },
      select: {
        id: true,
        address: true,
        email: true,
        name: true,
        role: true,
        bio: true,
        reputation: true,
        onboardingStatus: true,
        avatar: true,
        location: true,
        website: true,
        twitter: true,
        github: true,
        linkedin: true,
        discord: true,
        telegram: true,
        badges: true,
        orgName: true,
        orgWebsite: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log("✅ User updated:", updatedUser.id);

    res.json({
      success: true,
      user: updatedUser,
      message: "Profile updated successfully",
    });
  } catch (err: any) {
    console.error("❌ Error updating user:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// Get user stats (for profile page)
router.get("/:id/stats", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        submissions: {
          include: {
            bounty: {
              select: {
                id: true,
                title: true,
                reward: true,
                status: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Calculate stats
    const stats = {
      totalSubmissions: user.submissions.length,
      approved: user.submissions.filter((s) => s.status === "APPROVED").length,
      pending: user.submissions.filter((s) => s.status === "PENDING").length,
      rejected: user.submissions.filter((s) => s.status === "REJECTED").length,
      totalEarnings: user.submissions
        .filter((s) => s.status === "APPROVED")
        .reduce((sum, s) => sum + s.bounty.reward, 0),
    };

    res.json({
      user: {
        id: user.id,
        address: user.address,
        email: user.email,
        name: user.name,
        role: user.role,
        bio: user.bio,
        reputation: user.reputation,
        onboardingStatus: user.onboardingStatus,
        avatar: user.avatar,
        location: user.location,
        website: user.website,
        twitter: user.twitter,
        github: user.github,
        linkedin: user.linkedin,
        discord: user.discord,
        telegram: user.telegram,
        badges: user.badges,
        orgName: user.orgName,
        orgWebsite: user.orgWebsite,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      stats,
      submissions: user.submissions,
    });
  } catch (err: any) {
    console.error("❌ Error fetching user stats:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

export default router;
