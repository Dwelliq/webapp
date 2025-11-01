import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-10-29.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * POST /api/billing/webhook
 * Handles Stripe webhook events
 * Verifies signature and sets listing.paid = true on checkout.session.completed
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  // Handle checkout.session.completed event
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    // Get listingId from client_reference_id
    const listingId = session.client_reference_id;

    if (!listingId) {
      console.error("No client_reference_id in checkout session");
      return NextResponse.json(
        { error: "Missing listing ID" },
        { status: 400 }
      );
    }

    try {
      // Update listing to mark as paid
      await prisma.listing.update({
        where: { id: listingId },
        data: { paid: true },
      });

      console.log(`Listing ${listingId} marked as paid`);
    } catch (error) {
      console.error("Error updating listing:", error);
      return NextResponse.json(
        { error: "Failed to update listing" },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}

