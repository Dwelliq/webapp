# Resend Email Setup Guide

## What is Resend?

Resend is a modern email API for developers. It's perfect for sending transactional emails (notifications, confirmations, etc.) from your Next.js app.

---

## Step 1: Sign Up & Get API Key

1. **Sign up for Resend**
   - Go to https://resend.com
   - Sign up for a free account (100 emails/day free)

2. **Get your API Key**
   - Go to **API Keys** in the left sidebar
   - Click **"+ Create API Key"**
   - Give it a name (e.g., "Next.js App")
   - Choose **"Sending access"**
   - Click **"Create"**
   - **Copy the key immediately** (you won't see it again!)
   - Format: `re_xxxxxxxxxxxxxx`

3. **Add to `.env.local`**
   ```bash
   RESEND_API_KEY=re_xxxxxxxxxxxxxx
   ```

---

## Step 2: Verify Your Domain (Production)

For production, you should verify your domain to send from `@yourdomain.com`.

### Quick Setup (Optional for Testing)

- For testing, you can use Resend's default domain: `onboarding@resend.dev`
- But you **cannot send TO this address**, only FROM it
- For production, you **must** verify your domain

### Domain Verification Steps:

1. Go to **Domains** in Resend dashboard
2. Click **"+ Add Domain"**
3. Enter your domain (e.g., `yourdomain.com`)
4. Resend will provide DNS records to add:
   - **DKIM Record** (CNAME)
   - **SPF Record** (TXT)
   - **DMARC Record** (TXT) - Optional but recommended
5. Add these records to your domain's DNS provider (Cloudflare, AWS Route 53, etc.)
6. Wait for verification (usually 1-5 minutes)
7. Once verified, you can send from `noreply@yourdomain.com`, `hello@yourdomain.com`, etc.

---

## Step 3: Basic Setup in Your App

### Create Email Utility

Create `apps/web/src/lib/email.ts`:

```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  from = "onboarding@resend.dev", // Change to your verified domain in production
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Resend error:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
```

### Example: Send Welcome Email

Create `apps/web/src/lib/emails/welcome.ts`:

```typescript
export function getWelcomeEmailHtml(name: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">Welcome to Our Platform!</h1>
        <p>Hi ${name},</p>
        <p>Thanks for signing up! We're excited to have you on board.</p>
        <p>Get started by creating your first listing.</p>
        <a href="https://yourdomain.com/sell/new" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          Create Listing
        </a>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Best regards,<br>
          The Team
        </p>
      </body>
    </html>
  `;
}
```

---

## Step 4: Use Cases for Your App

### Use Case 1: Listing Submitted Notification

Create `apps/web/src/lib/emails/listingSubmitted.ts`:

```typescript
export function getListingSubmittedEmailHtml(listingAddress: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a;">Listing Submitted!</h1>
        <p>Your listing for <strong>${listingAddress}</strong> has been submitted for moderation.</p>
        <p>Our team will review it within 24-48 hours. You'll receive an email notification once it's approved.</p>
        <a href="https://yourdomain.com/sell/listings" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          View My Listings
        </a>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Best regards,<br>
          The Team
        </p>
      </body>
    </html>
  `;
}
```

### Use Case 2: Payment Confirmation

Create `apps/web/src/lib/emails/paymentConfirmed.ts`:

```typescript
export function getPaymentConfirmedEmailHtml(amount: number, listingAddress: string) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #16a34a;">Payment Confirmed!</h1>
        <p>Your payment of <strong>$${amount.toFixed(2)}</strong> for the listing at <strong>${listingAddress}</strong> has been confirmed.</p>
        <p>You can now submit your listing for moderation.</p>
        <a href="https://yourdomain.com/sell/listings" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
          Continue to Listing
        </a>
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Best regards,<br>
          The Team
        </p>
      </body>
    </html>
  `;
}
```

### Use Case 3: Listing Approved/Rejected

Create `apps/web/src/lib/emails/listingStatus.ts`:

```typescript
export function getListingStatusEmailHtml(
  status: "approved" | "rejected",
  listingAddress: string,
  reason?: string
) {
  const isApproved = status === "approved";
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: ${isApproved ? "#16a34a" : "#dc2626"};">
          ${isApproved ? "Listing Approved!" : "Listing Needs Changes"}
        </h1>
        <p>Your listing for <strong>${listingAddress}</strong> has been ${isApproved ? "approved and is now live!" : "rejected."}</p>
        ${!isApproved && reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
        ${isApproved 
          ? `<a href="https://yourdomain.com/listings/[id]" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
              View Listing
            </a>`
          : `<a href="https://yourdomain.com/sell/listings" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
              Edit Listing
            </a>`
        }
        <p style="margin-top: 30px; font-size: 14px; color: #666;">
          Best regards,<br>
          The Team
        </p>
      </body>
    </html>
  `;
}
```

---

## Step 5: Integration Examples

### Example 1: Send Email When Listing is Submitted

Update `apps/web/src/app/api/listings/[id]/submit/route.ts`:

```typescript
// Add at the top
import { sendEmail } from "@/lib/email";
import { getListingSubmittedEmailHtml } from "@/lib/emails/listingSubmitted";
import prisma from "@/lib/prisma";

// In your POST handler, after successfully submitting:
const listing = await prisma.listing.findUnique({
  where: { id },
  include: { property: true, user: true },
});

if (listing) {
  await sendEmail({
    to: listing.user.email,
    subject: "Listing Submitted for Review",
    html: getListingSubmittedEmailHtml(listing.property.address),
  });
}
```

### Example 2: Send Email When Payment is Confirmed

Update `apps/web/src/app/api/billing/webhook/route.ts`:

```typescript
// Add at the top
import { sendEmail } from "@/lib/email";
import { getPaymentConfirmedEmailHtml } from "@/lib/emails/paymentConfirmed";

// In the checkout.session.completed handler, after updating listing:
const listing = await prisma.listing.findUnique({
  where: { id: listingId },
  include: { property: true, user: true },
});

if (listing) {
  const amount = session.amount_total ? session.amount_total / 100 : 0; // Convert from cents
  await sendEmail({
    to: listing.user.email,
    subject: "Payment Confirmed",
    html: getPaymentConfirmedEmailHtml(amount, listing.property.address),
  });
}
```

---

## Step 6: Using React Email (Advanced)

For better email templates, consider using React Email with Resend:

### Install React Email:

```bash
pnpm add react-email @react-email/components
```

### Create Email Template:

Create `apps/web/src/lib/emails/ListingSubmitted.tsx`:

```tsx
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from "@react-email/components";

export function ListingSubmittedEmail({ address }: { address: string }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>Listing Submitted!</Text>
            <Text style={paragraph}>
              Your listing for <strong>{address}</strong> has been submitted for moderation.
            </Text>
            <Button style={button} href="https://yourdomain.com/sell/listings">
              View My Listings
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>Best regards, The Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const title = {
  fontSize: "24px",
  lineHeight: "1.3",
  fontWeight: "700",
  color: "#484848",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#484848",
};

const button = {
  backgroundColor: "#2563eb",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px 24px",
  margin: "20px 0",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "1.5",
};
```

### Render and Send:

```typescript
import { render } from "@react-email/components";
import { ListingSubmittedEmail } from "@/lib/emails/ListingSubmitted";

const html = await render(ListingSubmittedEmail({ address: "123 Main St" }));

await sendEmail({
  to: user.email,
  subject: "Listing Submitted",
  html,
});
```

---

## Environment Variables

Add to `.env.local`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxx
```

For production, update the `from` address in `lib/email.ts`:

```typescript
from = "noreply@yourdomain.com" // Use your verified domain
```

---

## Testing

### Test Locally:

1. Create a test API route: `apps/web/src/app/api/test-email/route.ts`
2. Use Resend's test mode or send to your own email
3. Check Resend dashboard → **Logs** to see sent emails

### Test in Production:

- Send test emails to yourself first
- Check spam folder if emails don't arrive
- Monitor Resend dashboard for delivery status

---

## Best Practices

1. **Always handle errors** - Email sending can fail
2. **Use verified domains** for production (better deliverability)
3. **Don't send sensitive data** in emails
4. **Rate limit** - Don't spam users
5. **Use React Email** for complex templates (optional but recommended)
6. **Monitor logs** in Resend dashboard
7. **Keep API keys secret** - Never commit to git

---

## Pricing

- **Free tier**: 100 emails/day, 3,000 emails/month
- **Pro tier**: $20/month for 50,000 emails
- Perfect for transactional emails (not marketing blasts)

---

## Troubleshooting

- **Emails not sending**: Check API key, check logs in Resend dashboard
- **Domain not verified**: Wait for DNS propagation (can take up to 48 hours)
- **Emails in spam**: Verify domain, use proper SPF/DKIM records
- **Rate limited**: Upgrade plan or wait for limit reset

