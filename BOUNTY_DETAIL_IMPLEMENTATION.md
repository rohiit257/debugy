# Bounty Detail Page Implementation

## Overview
Created a comprehensive bounty detail page with role-based conditional rendering, submission management, and close bounty functionality.

## Backend Changes

### 1. Submission API Route (`apps/bounties/src/routes/SubmissionRoute.ts`)
- **POST /submissions** - Create new submission
  - Validates bounty is open and user is a hunter
  - Creates submission with PENDING status
- **GET /submissions/bounty/:bountyId** - Get all submissions for a bounty
- **GET /submissions/hunter/:hunterId** - Get all submissions by a hunter
- **PATCH /submissions/:id/status** - Update submission status (APPROVED/REJECTED/PENDING)
  - Only accessible by bounty owner

### 2. Updated Server (`apps/bounties/src/index.ts`)
- Added submission route: `/submissions`

## Frontend Changes

### 1. Bounty Detail Page (`apps/frontend/app/bounties/[id]/page.tsx`)
**Features:**
- Fetches and displays complete bounty information
- Shows deadline, time remaining, and submission count
- **Role-Based Rendering:**
  - **ORG (Owner):**
    - Close/Reopen bounty toggle
    - View all submissions with full details
    - Approve/Reject pending submissions
  - **HUNTER:**
    - Submit Report button (only if bounty is open)
    - View own submissions with full details
    - See other submissions as "private"
  - **Other Users:**
    - View bounty details
    - Limited submission visibility

### 2. Submit Report Dialog (`apps/frontend/components/SubmitReportDialog.tsx`)
- Modal dialog for hunters to submit vulnerability reports
- Textarea for detailed vulnerability description
- Success/error handling with visual feedback
- Auto-refresh parent page on successful submission

### 3. UI Components
- **Switch** (`components/ui/switch.tsx`) - Toggle for close/open bounty
- **Textarea** (`components/ui/textarea.tsx`) - Multi-line input for reports

### 4. Updated BountyCard (`components/BountyCard.tsx`)
- Wrapped entire card in Link component
- Clicking anywhere on card navigates to detail page
- Changed button to div to avoid nested interactive elements

## Features Implemented

### ✅ Role-Based Access Control
- **Hunters** can submit reports only on open bounties
- **Org owners** can close/reopen their bounties
- **Org owners** can approve/reject submissions
- Privacy controls on submission details

### ✅ Close Bounty Toggle
- Visual switch component for org owners
- Updates bounty status between OPEN/CLOSED
- Prevents submissions when closed

### ✅ Submission Display
- Shows all submissions with status badges (PENDING/APPROVED/REJECTED)
- Hunter information (name, address, reputation)
- Submission timestamp
- Full details visible only to owner and submitter

### ✅ Submit Report Button
- Only visible to hunters on open bounties
- Opens dialog with detailed form
- Validates input before submission
- Success feedback with auto-close

## API Endpoints Used

### Bounties
- `GET /bounties/:id` - Fetch single bounty with submissions
- `PATCH /bounties/:id/close` - Close/reopen bounty

### Submissions
- `POST /submissions` - Create new submission
- `PATCH /submissions/:id/status` - Update submission status

## Schema Reference

### Bounty
- id, title, description, category, reward, deadline
- status: OPEN | CLOSED | IN_REVIEW | COMPLETED
- orgId: Owner's user ID
- submissions: Related submissions

### Submission
- id, bountyId, hunterId, details
- status: PENDING | APPROVED | REJECTED
- Relations: bounty, hunter (User)

## Installation
```bash
# Install new dependency
cd apps/frontend
npm install @radix-ui/react-switch
```

## Usage

### For Hunters
1. Browse bounties and click on any card
2. View bounty details and deadline
3. Click "Submit Report" button
4. Fill in vulnerability details
5. Submit and track status

### For Organizations
1. View your bounties at `/bounties`
2. Click on any bounty to see details
3. Toggle "Close Bounty" switch to close/reopen
4. Review submissions from hunters
5. Approve or reject pending submissions

## Next Steps (Optional Enhancements)
- Add pagination for submissions
- Add filtering/sorting for submissions
- Add email notifications on submission status changes
- Add file upload for proof of concept
- Add comments/discussion thread on submissions
- Add blockchain integration for reward distribution
