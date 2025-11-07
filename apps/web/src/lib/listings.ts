import prisma from "./prisma";

export async function getFeaturedListings(limit = 8) {
  const listings = await prisma.listing.findMany({
    where: {
      status: "LIVE",
    },
    include: {
      property: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  return listings.map((listing) => ({
    id: listing.id,
    priceMin: listing.priceMin,
    priceMax: listing.priceMax,
    photoKeys: listing.photoKeys,
    property: {
      address: listing.property.address,
      suburb: listing.property.suburb,
      state: listing.property.state,
      beds: listing.property.beds,
      baths: listing.property.baths,
      parking: listing.property.parking,
    },
    firstPhotoKey: listing.photoKeys[0] || null,
  }));
}

