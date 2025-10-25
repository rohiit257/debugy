# Onboarding Flow - Changes Summary

## 🎯 Overview
Implemented a comprehensive multi-step onboarding process with role selection, profile completion, and enhanced user schema with badges and social links.

## 📋 Changes Made

### 1. Database Schema (`packages/db/prisma/schema.prisma`)

#### New Enum
```prisma
enum OnboardingStatus {
  PENDING       // Just connected wallet
  ROLE_SELECTED // Selected role
  COMPLETED     // Completed profile
}
```

#### Updated User Model
**Added Fields:**
- `onboardingStatus: OnboardingStatus` - Tracks onboarding progress
- `role: UserRole?` - Now nullable until selected
- `avatar: String?` - Profile picture URL/IPFS hash
- `location: String?` - User location
- `website: String?` - Personal/company website
- `twitter: String?` - Twitter handle
- `github: String?` - GitHub username
- `linkedin: String?` - LinkedIn username
- `discord: String?` - Discord username
- `telegram: String?` - Telegram username
- `badges: Json?` - JSON array of badges (default: [])
- `orgName: String?` - Organization name (for ORG role)
- `orgWebsite: String?` - Organization website (for ORG role)

### 2. Backend Changes (`apps/auth/src/routes/AuthRoute.ts`)

#### Updated Endpoints

**`POST /api/auth/siwe`** (Modified)
- Creates user with `onboardingStatus: PENDING`
- Returns all new user fields in response
- Normalizes wallet address to lowercase

**`POST /api/auth/select-role`** (New)
- Accepts: `{ address, role }`
- Validates role (HUNTER or ORG)
- Updates user with selected role
- Sets `onboardingStatus: ROLE_SELECTED`

**`POST /api/auth/complete-profile`** (New)
- Accepts all profile fields
- Updates user profile
- Sets `onboardingStatus: COMPLETED`
- Supports both required and optional fields

**`PATCH /api/auth/update-profile`** (Enhanced)
- Now supports all new fields
- Allows updating badges, social links, etc.
- For users who have completed onboarding

### 3. Frontend Changes

#### New Pages

**`apps/frontend/app/onboarding/role/page.tsx`**
- Beautiful role selection UI
- Two cards: Bug Hunter vs Organization
- Detailed feature lists for each role
- Redirects to profile setup after selection

**`apps/frontend/app/onboarding/profile/page.tsx`**
- Comprehensive profile form
- Sections:
  - Basic Information (name, email, bio, location, website)
  - Organization Details (conditional for ORG role)
  - Social Links (Twitter, GitHub, LinkedIn, Discord, Telegram)
- "Skip for now" option
- Redirects to timeline after completion

#### Updated Files

**`apps/frontend/app/(auth)/login/page.tsx`**
- Updated redirect logic based on `onboardingStatus`
- Routes users to appropriate onboarding step
- Removed old profile dialog logic

**`apps/frontend/app/api/auth/[...nextauth]/options.ts`**
- Updated to include all new user fields in session
- Properly handles `onboardingStatus` for routing
- Maintains session updates during onboarding

### 4. Documentation

**`ONBOARDING_SETUP.md`**
- Complete setup guide
- API endpoint documentation
- Testing instructions
- Migration guide for existing users

**`setup-onboarding.ps1`**
- Automated setup script for Windows
- Generates Prisma client
- Creates and applies migration
- Provides next steps

## 🔄 Onboarding Flow

```
1. User connects wallet
   ↓
2. SIWE authentication
   ↓
3. User created with onboardingStatus: PENDING
   ↓
4. Redirect to /onboarding/role
   ↓
5. User selects role (HUNTER or ORG)
   ↓
6. onboardingStatus: ROLE_SELECTED
   ↓
7. Redirect to /onboarding/profile
   ↓
8. User completes profile (or skips)
   ↓
9. onboardingStatus: COMPLETED
   ↓
10. Redirect to /timeline
```

## 🚀 Setup Instructions

### Quick Setup
```powershell
# Run the setup script
.\setup-onboarding.ps1
```

### Manual Setup
```bash
# 1. Generate Prisma client
cd packages/db
pnpm prisma generate

# 2. Create migration
pnpm prisma migrate dev --name add_onboarding_and_social_fields

# 3. Start services
cd ../../apps/auth
pnpm dev

# In another terminal
cd apps/frontend
pnpm dev
```

## 📊 Database Migration

The migration will:
1. Add `OnboardingStatus` enum
2. Add all new fields to User table
3. Set default values for existing users
4. Make `role` field nullable

**Important:** Existing users will have `onboardingStatus: PENDING` by default. You may want to update them to `COMPLETED`:

```sql
UPDATE "User" 
SET "onboardingStatus" = 'COMPLETED' 
WHERE "createdAt" < NOW();
```

## 🎨 UI/UX Features

### Role Selection Page
- Modern card-based design
- Visual feedback on selection
- Checkmark indicator for selected role
- Feature highlights for each role
- Smooth animations and transitions

### Profile Setup Page
- Clean, organized form layout
- Conditional fields based on role
- Icon-enhanced input fields
- Skip option for quick onboarding
- Loading states and error handling

## 🔐 Security Considerations

1. **Address Normalization**: All wallet addresses are converted to lowercase for consistency
2. **Role Validation**: Only HUNTER and ORG roles are accepted
3. **Required Fields**: Name and email are required for profile completion
4. **Session Updates**: Session is properly updated after each onboarding step

## 🧪 Testing Checklist

- [ ] New user can connect wallet
- [ ] User is redirected to role selection
- [ ] Can select HUNTER role
- [ ] Can select ORG role
- [ ] Profile form shows correct fields for each role
- [ ] Can complete profile with all fields
- [ ] Can skip profile completion
- [ ] Session updates correctly
- [ ] Redirects to timeline after completion
- [ ] Existing users can still log in
- [ ] Profile update endpoint works for completed users

## 📝 Notes

- **TypeScript Errors**: You'll see TypeScript errors in `AuthRoute.ts` until you run `pnpm prisma generate`
- **Session Management**: The session is updated using NextAuth's `update()` function during onboarding
- **Badges System**: Ready for implementation - stored as JSON array
- **Social Links**: All major platforms supported for future integrations

## 🔮 Future Enhancements

1. **Badge System**: Implement badge earning logic and display
2. **Avatar Upload**: Add image upload functionality for avatars
3. **Profile Verification**: Verify social media accounts
4. **Onboarding Analytics**: Track completion rates
5. **Profile Completion Percentage**: Show progress indicator
6. **Email Verification**: Send verification emails
7. **Profile Privacy Settings**: Allow users to control visibility

## 🐛 Known Issues

None at the moment. All TypeScript errors will resolve after running Prisma generate.

## 📞 Support

If you encounter any issues:
1. Check `ONBOARDING_SETUP.md` for detailed instructions
2. Ensure Prisma client is generated
3. Verify database migration was applied
4. Check browser console for errors
5. Review backend logs for API errors
