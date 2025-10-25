import { Request, Response, Router } from "express";
import jwt from 'jsonwebtoken'
import { SiweMessage } from 'siwe'

import { prisma } from "@repo/db/client"



const router: Router = Router()

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ message: "Auth service is running", timestamp: new Date().toISOString() })
})

router.post('/siwe', async (req: Request, res: Response) => {
    try {
        const { message, signature } = req.body ?? {};
        console.log("Received message:", message)
        console.log("Received signature:", signature)

        if (!message || !signature) {
            return res.status(400).json({ message: "Missing message or signature" });
        }


        const siweMessage = new SiweMessage(message);

        const verifyResult = await siweMessage.verify({ signature });
        if (!verifyResult.success) {
            return res.status(401).json({ message: "Invalid SIWE signature" });
        }

        const address = siweMessage.address.toLowerCase();
        console.log("✅ Normalized address:", address)
        const jwtSecret = process.env.JWT_SECRET || "dev-secret-change-me";
        const token = jwt.sign(
            { sub: address, address },
            jwtSecret,
            { expiresIn: "1d" }
        );

         const user = await prisma.user.upsert({
             where: { address },
             update: {
                 updatedAt: new Date()
             },
             create: {
                 address,
                 onboardingStatus: 'PENDING'
             }
         })

        console.log("✅ User authenticated:", { id: user.id, address: user.address, onboardingStatus: user.onboardingStatus })

        return res.status(200).json({
            user: { 
                id: user.id,
                address: user.address,
                name: user.name,
                email: user.email,
                bio: user.bio,
                role: user.role,
                onboardingStatus: user.onboardingStatus,
                avatar: user.avatar,
                twitter: user.twitter,
                github: user.github,
                linkedin: user.linkedin,
                discord: user.discord,
                telegram: user.telegram,
                badges: user.badges,
                orgName: user.orgName,
                orgWebsite: user.orgWebsite
            },
            token
        });
    } catch (error: any) {
        return res.status(400).json({ message: error?.message || "Something Went Wrong" })
    }
})

// Select role during onboarding
router.post('/select-role', async (req: Request, res: Response) => {
    try {
        const { address, role } = req.body ?? {};
        
        if (!address || !role) {
            return res.status(400).json({ message: "Address and role are required" })
        }
        
        if (!['HUNTER', 'ORG'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be HUNTER or ORG" })
        }
        
        const user = await prisma.user.findUnique({
            where: { address }
        })
        
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        
        const updatedUser = await prisma.user.update({
            where: { address },
            data: { 
                role,
                onboardingStatus: 'ROLE_SELECTED'
            }
        })
        
        console.log("✅ Role selected:", { address, role })
        
        return res.status(200).json({ 
            message: "Role selected successfully",
            user: {
                id: updatedUser.id,
                address: updatedUser.address,
                role: updatedUser.role,
                onboardingStatus: updatedUser.onboardingStatus
            }
        })
        
    } catch (error: any) {
        console.error("❌ Error selecting role:", error)
        return res.status(400).json({ message: error?.message || "Something Went Wrong" })
    }
})

// Complete profile during onboarding
router.post('/complete-profile', async (req: Request, res: Response) => {
    try {
        const { 
            address, name, email, bio, avatar, location, website,
            twitter, github, linkedin, discord, telegram,
            orgName, orgWebsite
        } = req.body ?? {};
        
        if (!address) {
            return res.status(400).json({ message: "Address is required" })
        }
        
        const user = await prisma.user.findUnique({
            where: { address }
        })
        
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        
        // Build update data object
        const updateData: any = {
            onboardingStatus: 'COMPLETED',
            updatedAt: new Date()
        }
        
        // Add fields if provided
        if (name !== undefined) updateData.name = name
        if (email !== undefined) updateData.email = email
        if (bio !== undefined) updateData.bio = bio
        if (avatar !== undefined) updateData.avatar = avatar
        if (location !== undefined) updateData.location = location
        if (website !== undefined) updateData.website = website
        if (twitter !== undefined) updateData.twitter = twitter
        if (github !== undefined) updateData.github = github
        if (linkedin !== undefined) updateData.linkedin = linkedin
        if (discord !== undefined) updateData.discord = discord
        if (telegram !== undefined) updateData.telegram = telegram
        if (orgName !== undefined) updateData.orgName = orgName
        if (orgWebsite !== undefined) updateData.orgWebsite = orgWebsite
        
        const updatedUser = await prisma.user.update({
            where: { address },
            data: updateData
        })
        
        console.log("✅ Profile completed:", { address, name })
        
        return res.status(200).json({ 
            message: "Profile completed successfully",
            user: {
                id: updatedUser.id,
                address: updatedUser.address,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                role: updatedUser.role,
                onboardingStatus: updatedUser.onboardingStatus,
                avatar: updatedUser.avatar,
                location: updatedUser.location,
                website: updatedUser.website,
                twitter: updatedUser.twitter,
                github: updatedUser.github,
                linkedin: updatedUser.linkedin,
                discord: updatedUser.discord,
                telegram: updatedUser.telegram,
                orgName: updatedUser.orgName,
                orgWebsite: updatedUser.orgWebsite,
                badges: updatedUser.badges
            }
        })
        
    } catch (error: any) {
        console.error("❌ Error completing profile:", error)
        return res.status(400).json({ message: error?.message || "Something Went Wrong" })
    }
})

// Update profile (for existing users)
router.patch('/update-profile', async (req: Request, res: Response) => {
    try {
        const { 
            address, name, email, bio, avatar, location, website,
            twitter, github, linkedin, discord, telegram,
            orgName, orgWebsite, badges
        } = req.body ?? {};
        
        const user = await prisma.user.findUnique({
            where: { address }
        })
        
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }
        
        // Build update data object
        const updateData: any = {}
        
        if (name !== undefined) updateData.name = name
        if (email !== undefined) updateData.email = email
        if (bio !== undefined) updateData.bio = bio
        if (avatar !== undefined) updateData.avatar = avatar
        if (location !== undefined) updateData.location = location
        if (website !== undefined) updateData.website = website
        if (twitter !== undefined) updateData.twitter = twitter
        if (github !== undefined) updateData.github = github
        if (linkedin !== undefined) updateData.linkedin = linkedin
        if (discord !== undefined) updateData.discord = discord
        if (telegram !== undefined) updateData.telegram = telegram
        if (orgName !== undefined) updateData.orgName = orgName
        if (orgWebsite !== undefined) updateData.orgWebsite = orgWebsite
        if (badges !== undefined) updateData.badges = badges
        
        const updatedUser = await prisma.user.update({
            where: { address },
            data: updateData
        })
        
        console.log("✅ Profile updated:", { address })
        
        return res.status(200).json({ 
            message: "Profile updated successfully",
            user: {
                id: updatedUser.id,
                address: updatedUser.address,
                name: updatedUser.name,
                email: updatedUser.email,
                bio: updatedUser.bio,
                role: updatedUser.role,
                onboardingStatus: updatedUser.onboardingStatus,
                avatar: updatedUser.avatar,
                location: updatedUser.location,
                website: updatedUser.website,
                twitter: updatedUser.twitter,
                github: updatedUser.github,
                linkedin: updatedUser.linkedin,
                discord: updatedUser.discord,
                telegram: updatedUser.telegram,
                orgName: updatedUser.orgName,
                orgWebsite: updatedUser.orgWebsite,
                badges: updatedUser.badges
            }
        })
        
    } catch (error: any) {
        console.error("❌ Error updating profile:", error)
        return res.status(400).json({ message: error?.message || "Something Went Wrong" })
    }
})
export default router