import type { Metadata } from "next";
import { searchListings } from "@/lib/search";
import { ListingCard } from "@/components/listing/ListingCard";
import { SearchFilters } from "@/components/search/SearchFilters";
import { MapToggle } from "@/components/search/MapToggle";
import { MapView } from "@/components/search/MapView";
import Link from "next/link";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    suburb?: string;
    state?: string;
    propertyType?: string;
    beds?: string;
    baths?: string;
    priceMin?: string;
    priceMax?: string;
    page?: string;
    map?: string;
    bbox?: string;
  }>;
};

export async function generateMetadata(
  props: SearchPageProps
): Promise<Metadata> {
  const searchParams = await props.searchParams;
  const { q, suburb, state, propertyType, beds, baths, priceMin, priceMax } =
    searchParams;

  const filters: string[] = [];
  if (q) filters.push(`search "${q}"`);
  if (suburb) filters.push(`in ${suburb}`);
  if (state) filters.push(`in ${state}`);
  if (propertyType) filters.push(propertyType);
  if (beds) filters.push(`${beds}+ beds`);
  if (baths) filters.push(`${baths}+ baths`);
  if (priceMin || priceMax) {
    const priceRange = [priceMin, priceMax].filter(Boolean).join("-");
    filters.push(`$${priceRange}`);
  }

  const title = filters.length
    ? `Search Properties - ${filters.join(", ")} | Dwelliq`
    : "Search Properties | Dwelliq";

  const description = filters.length
    ? `Find properties matching: ${filters.join(", ")}. Browse listings and connect with sellers.`
    : "Search for properties for sale. Filter by location, price, bedrooms, and more.";

  return {
    title,
    description,
    alternates: {
      canonical: "/search",
    },
  };
}

export default async function SearchPage(props: SearchPageProps) {
  const searchParams = await props.searchParams;
  const {
    q,
    suburb,
    state,
    propertyType,
    beds,
    baths,
    priceMin,
    priceMax,
    page,
    map,
    bbox,
  } = searchParams;

  // Parse search params
  const params = {
    q,
    suburb,
    state,
    propertyType,
    beds: beds ? parseInt(beds, 10) : undefined,
    baths: baths ? parseInt(baths, 10) : undefined,
    priceMin: priceMin ? parseFloat(priceMin) : undefined,
    priceMax: priceMax ? parseFloat(priceMax) : undefined,
    page: page ? parseInt(page, 10) : 1,
    bbox,
  };

  const { items, total, page: currentPage, pageSize } = await searchListings(params);
  const isMapView = map === "true";

  const totalPages = Math.ceil(total / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Search Properties</h1>

        <div className="mb-6">
          <SearchFilters />
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div
            className="text-sm text-gray-600"
            role="status"
            aria-live="polite"
            aria-atomic="true"
            aria-label={total === 0 ? "No properties found" : `Showing ${items.length} of ${total} properties`}
          >
            {total === 0 ? (
              "No properties found"
            ) : (
              <>
                Showing {items.length} of {total} propert{total === 1 ? "y" : "ies"}
              </>
            )}
          </div>
          <MapToggle />
        </div>

        {isMapView ? (
          <MapView
            listings={items
              .filter(
                (item) => item.property.lat !== null && item.property.lng !== null
              )
              .map((item) => ({
                id: item.id,
                address: item.property.address,
                suburb: item.property.suburb,
                state: item.property.state,
                lat: item.property.lat!,
                lng: item.property.lng!,
              }))}
          />
        ) : total === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-600">
              No properties match your search criteria. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  address={listing.property.address}
                  suburb={listing.property.suburb}
                  state={listing.property.state}
                  priceMin={listing.priceMin}
                  priceMax={listing.priceMax}
                  beds={listing.property.beds}
                  baths={listing.property.baths}
                  parking={listing.property.parking}
                  firstPhotoKey={listing.firstPhotoKey}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav
                className="flex items-center justify-center gap-4"
                aria-label="Pagination"
              >
                {hasPrevPage && (
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(searchParams).filter(
                          ([key]) => key !== "page"
                        )
                      ),
                      page: String(currentPage - 1),
                    }).toString()}`}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Previous
                  </Link>
                )}
                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                {hasNextPage && (
                  <Link
                    href={`/search?${new URLSearchParams({
                      ...Object.fromEntries(
                        Object.entries(searchParams).filter(
                          ([key]) => key !== "page"
                        )
                      ),
                      page: String(currentPage + 1),
                    }).toString()}`}
                    className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Next
                  </Link>
                )}
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}

