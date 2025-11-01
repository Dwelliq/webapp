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
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://yourdomain.com'}/sell/listings" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
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

