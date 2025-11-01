import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

/**
 * POST /api/listings/create
 * Creates a new listing with property details
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      address,
      suburb,
      state,
      postcode,
      lat,
      lng,
      propertyType,
      beds,
      baths,
      parking,
      landSize,
      description,
      photoKeys,
      priceMin,
      priceMax,
    } = body;

    // Validate required fields
    if (!address || !suburb || !state || !propertyType || beds === null || baths === null || parking === null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create or find property
    let property = await prisma.property.findFirst({
      where: {
        address,
        suburb,
        state,
      },
    });

    if (!property) {
      property = await prisma.property.create({
        data: {
          address,
          suburb,
          state,
          postcode,
          lat,
          lng,
          propertyType,
          beds,
          baths,
          parking,
          landSize,
        },
      });
    } else {
      // Update existing property if needed
      property = await prisma.property.update({
        where: { id: property.id },
        data: {
          lat: lat ?? property.lat,
          lng: lng ?? property.lng,
          propertyType: propertyType ?? property.propertyType,
          beds: beds ?? property.beds,
          baths: baths ?? property.baths,
          parking: parking ?? property.parking,
          landSize: landSize ?? property.landSize,
        },
      });
    }

    // Create listing
    const listing = await prisma.listing.create({
      data: {
        propertyId: property.id,
        userId: user.id,
        description,
        photoKeys: photoKeys || [],
        priceMin,
        priceMax,
        status: "REVIEW",
        paid: false,
        ownershipVerified: false,
      },
    });

    return NextResponse.json({ listingId: listing.id });
  } catch (error) {
    console.error("Error creating listing:", error);
    return NextResponse.json(
      { error: "Failed to create listing" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/listings/create
 * Updates an existing listing
 */
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { listingId, ...updateData } = body;

    if (!listingId) {
      return NextResponse.json(
        { error: "listingId is required" },
        { status: 400 }
      );
    }

    // Verify listing belongs to user
    const existingListing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: user.id,
      },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found" },
        { status: 404 }
      );
    }

    // Update listing
    const listing = await prisma.listing.update({
      where: { id: listingId },
      data: {
        description: updateData.description,
        photoKeys: updateData.photoKeys,
        priceMin: updateData.priceMin,
        priceMax: updateData.priceMax,
      },
    });

    return NextResponse.json({ listingId: listing.id });
  } catch (error) {
    console.error("Error updating listing:", error);
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 }
    );
  }
}

