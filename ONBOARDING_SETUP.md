# Onboarding Flow Setup Guide

## Overview
This guide explains the new multi-step onboarding process that has been implemented.

## Onboarding Flow

### 1. **Connect Wallet (SIWE Authentication)**
   - User connects their wallet
   - Signs a SIWE message to authenticate
   - Backend creates user with `onboardingStatus: PENDING`
   - User is redirected to role selection

### 2. **Role Selection** (`/onboarding/role`)
   - User chooses between:
     - **Bug Hunter**: Find vulnerabilities and earn rewards
     - **Organization**: Create bug bounty programs
   - Backend updates user with selected role
   - `onboardingStatus` changes to `ROLE_SELECTED`
   - User is redirected to profile setup

### 3. **Profile Completion** (`/onboarding/profile`)
   - User fills in profile information:
     - Basic: Name, Email, Bio, Location, Website
     - Social Links: Twitter, GitHub, LinkedIn, Discord, Telegram
     - Organization-specific: Org Name, Org Website (if ORG role)
   - Backend updates user profile
   - `onboardingStatus` changes to `COMPLETED`
   - User is redirected to timeline

## Database Schema Changes

### New Fields Added to User Model:
- `onboardingStatus`: Tracks onboarding progress (PENDING, ROLE_SELECTED, COMPLETED)
- `role`: Now nullable until selected during onboarding
- `avatar`: Profile picture URL or IPFS hash
- `location`: User's location
- `website`: Personal/company website
- `twitter`, `github`, `linkedin`, `discord`, `telegram`: Social media handles
- `badges`: JSON array for achievements/badges
- `orgName`, `orgWebsite`: Organization-specific fields

## Setup Instructions

### 1. Generate Prisma Client
```bash
cd packages/db
pnpm prisma generate
```

### 2. Create and Apply Migration
```bash
cd packages/db
pnpm prisma migrate dev --name add_onboarding_and_social_fields
```

### 3. Restart Services
```bash
# Terminal 1 - Auth Service
cd apps/auth
pnpm dev

# Terminal 2 - Frontend
cd apps/frontend
pnpm dev
```

## API Endpoints

### Authentication
- `POST /api/auth/siwe` - SIWE authentication (creates user with PENDING status)
- `POST /api/auth/select-role` - Select user role during onboarding
- `POST /api/auth/complete-profile` - Complete profile setup
- `PATCH /api/auth/update-profile` - Update profile (for existing users)

### Request Examples

#### Select Role
```json
POST http://localhost:8000/api/auth/select-role
{
  "address": "0x...",
  "role": "HUNTER" // or "ORG"
}
```

#### Complete Profile
```json
POST http://localhost:8000/api/auth/complete-profile
{
  "address": "0x...",
  "name": "John Doe",
  "email": "john@example.com",
  "bio": "Security researcher",
  "location": "San Francisco, CA",
  "website": "https://johndoe.com",
  "twitter": "@johndoe",
  "github": "johndoe",
  "linkedin": "johndoe",
  "discord": "johndoe#1234",
  "telegram": "@johndoe",
  "orgName": "Acme Corp", // if ORG role
  "orgWebsite": "https://acme.com" // if ORG role
}
```

## Frontend Pages

### New Pages Created:
1. `/onboarding/role` - Role selection page
2. `/onboarding/profile` - Profile completion page

### Updated Pages:
1. `/login` - Now redirects based on `onboardingStatus`
2. NextAuth options - Updated to include all new user fields in session

## Testing the Flow

1. **Clear existing session**: Logout if already logged in
2. **Connect wallet**: Go to `/login` and connect wallet
3. **Select role**: You'll be redirected to `/onboarding/role`
4. **Complete profile**: After selecting role, you'll be redirected to `/onboarding/profile`
5. **Access app**: After completing profile, you'll be redirected to `/timeline`

## Migration for Existing Users

Existing users in the database will need to:
1. Have their `onboardingStatus` set to `COMPLETED` (default is `PENDING`)
2. Have their `role` field populated (it's now nullable)

Run this SQL to update existing users:
```sql
UPDATE "User" 
SET "onboardingStatus" = 'COMPLETED' 
WHERE "onboardingStatus" IS NULL OR "onboardingStatus" = 'PENDING';
```

## Features

### Badges System
- Stored as JSON array in `badges` field
- Can be used to display achievements, certifications, etc.
- Example structure:
```json
[
  {
    "id": "top-hunter-2024",
    "name": "Top Hunter 2024",
    "icon": "trophy",
    "earnedAt": "2024-01-15T00:00:00Z"
  }
]
```

### Social Links
- All major platforms supported
- Displayed on user profiles
- Can be used for verification and reputation building

### Organization Features
- Separate fields for organization name and website
- Helps distinguish between individual hunters and companies
- Can be used for branding on bounty programs

## Troubleshooting

### TypeScript Errors in AuthRoute.ts
These are expected until you regenerate the Prisma client:
```bash
cd packages/db
pnpm prisma generate
```

### Users Stuck in Onboarding
Check the user's `onboardingStatus` in the database and update if needed.

### Session Not Updating
After completing onboarding steps, the session is updated using NextAuth's `update()` function. If issues persist, try logging out and back in.
