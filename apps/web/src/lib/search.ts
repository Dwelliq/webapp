import prisma from "./prisma";

export type SearchParams = {
  q?: string;
  suburb?: string;
  state?: string;
  propertyType?: string;
  beds?: number;
  baths?: number;
  priceMin?: number;
  priceMax?: number;
  page?: number;
  pageSize?: number;
  bbox?: string; // bounding box: "minLng,minLat,maxLng,maxLat"
};

export async function searchListings(params: SearchParams) {
  const {
    q,
    suburb,
    state,
    propertyType,
    beds,
    baths,
    priceMin,
    priceMax,
    page = 1,
    pageSize = 20,
    bbox,
  } = params;

  const pageNumber = Math.max(1, page);
  const limit = Math.min(100, Math.max(1, pageSize));
  const skip = (pageNumber - 1) * limit;

  // Build where clause
  const where: any = {
    status: "LIVE",
  };

  // Text search (q) - using ILIKE for now; TODO: implement Postgres FTS
  if (q) {
    where.OR = [
      { property: { address: { contains: q, mode: "insensitive" } } },
      { property: { suburb: { contains: q, mode: "insensitive" } } },
      { property: { state: { contains: q, mode: "insensitive" } } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  // Location filters
  if (suburb) {
    where.property = {
      ...where.property,
      suburb: { contains: suburb, mode: "insensitive" },
    };
  }

  if (state) {
    where.property = {
      ...where.property,
      state: { contains: state, mode: "insensitive" },
    };
  }

  if (propertyType) {
    where.property = {
      ...where.property,
      propertyType: { equals: propertyType, mode: "insensitive" },
    };
  }

  // Numeric filters
  if (beds !== undefined && beds !== null) {
    where.property = {
      ...where.property,
      beds: { gte: beds },
    };
  }

  if (baths !== undefined && baths !== null) {
    where.property = {
      ...where.property,
      baths: { gte: baths },
    };
  }

  // Price filters
  if (priceMin !== undefined && priceMin !== null) {
    where.OR = [
      ...(where.OR || []),
      { priceMax: { gte: priceMin } },
      { priceMin: { gte: priceMin } },
    ];
  }

  if (priceMax !== undefined && priceMax !== null) {
    where.priceMin = where.priceMin
      ? { ...where.priceMin, lte: priceMax }
      : { lte: priceMax };
  }

  // Bounding box filter (geospatial)
  if (bbox) {
    const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map(parseFloat);
    if (
      !isNaN(minLng) &&
      !isNaN(minLat) &&
      !isNaN(maxLng) &&
      !isNaN(maxLat)
    ) {
      where.property = {
        ...where.property,
        AND: [
          { lng: { gte: minLng, lte: maxLng } },
          { lat: { gte: minLat, lte: maxLat } },
        ],
      };
    }
  }

  // Execute query
  const [items, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        property: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    items: items.map((listing) => ({
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
        lat: listing.property.lat,
        lng: listing.property.lng,
      },
      firstPhotoKey: listing.photoKeys[0] || null,
    })),
    total,
    page: pageNumber,
    pageSize: limit,
  };
}

