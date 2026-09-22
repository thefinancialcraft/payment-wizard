# Supabase to Google Sheets Sync

This Edge Function syncs new bookings from Supabase to Google Sheets.

## Setup Instructions

### 1. Deploy the Supabase Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy sync-to-sheets
```

### 2. Set Environment Variables

Add these environment variables in your Supabase project dashboard:

- `GOOGLE_SCRIPT_URL`: The deployed Google Apps Script web app URL
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key

### 3. Deploy Google Apps Script

1. Open the Google Sheet: https://docs.google.com/spreadsheets/d/1qzxbyavzNWD9x-hG5y6cNFZlMEMyubOR-JAN5-spWiA/edit
2. Go to Extensions → Apps Script
3. Copy the code from `google-apps-script/code.gs`
4. Paste it into the Apps Script editor
5. Deploy as Web App:
   - Click "Deploy" → "New deployment"
   - Select type: "Web app"
   - Description: "Supabase Sync"
   - Execute as: "Me"
   - Who has access: "Anyone"
   - Click "Deploy"
   - Copy the Web App URL

### 4. Set Up Supabase Webhook Trigger

You can trigger the Edge Function in two ways:

#### Option A: From your frontend code
After successful booking submission, call the Edge Function:

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/sync-to-sheets`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    record: bookingData,
    table: 'payment_bookings'
  })
});
```

#### Option B: Using Supabase Database Webhooks (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to Database → Webhooks
3. Create a new webhook:
   - Name: "Sync to Google Sheets"
   - Table: payment_bookings
   - Events: INSERT
   - URL: `${SUPABASE_URL}/functions/v1/sync-to-sheets`
   - Secret: Generate a secure secret

### 5. Sheet Structure

The Google Sheet `supabase_response` will have these columns:

1. Booking ID
2. Policy Holder Name
3. Contact No
4. Email
5. Number of Members
6. Pincode
7. City
8. District
9. State
10. Country
11. Payment Date
12. Payment Month
13. Effective Date
14. Next Renewal Date
15. Month
16. Insurance Company
17. Plan Name
18. Policy Type
19. Health Checkup
20. Extra Bonus
21. Tenure
22. Premium
23. Net Premium
24. Discount Offer
25. Discount Type
26. Updated Premium
27. Employee Name
28. Team
29. Previous Company
30. Business Type
31. Assistant Team
32. Relationship Manager
33. Agent Code
34. Proposal No
35. Grade
36. Lead Source
37. Payment Proof
38. Created At

## Flow

1. User submits booking form
2. Data is saved to Supabase `payment_bookings` table
3. Edge Function is triggered (via webhook or direct call)
4. Edge Function sends data to Google Apps Script
5. Google Apps Script appends row to Google Sheet
6. Confirmation is returned
