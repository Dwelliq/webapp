import type { Metadata } from "next";
import { getFeaturedListings } from "@/lib/listings";
import { ListingCard } from "@/components/listing/ListingCard";
import { HomeSearchBar } from "@/components/search/HomeSearchBar";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Dwelliq - Find Your Perfect Property",
    description:
      "Discover the best properties for sale. Browse featured listings, search by location, price, and property features.",
    alternates: {
      canonical: "/",
    },
  };
}

export default async function Home() {
  const featuredListings = await getFeaturedListings(8);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-16 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-4 text-4xl font-bold md:text-5xl">
              Find Your Perfect Property
            </h1>
            <p className="mb-8 text-xl text-blue-100">
              Discover amazing properties for sale. Search, browse, and connect with sellers.
            </p>
            <HomeSearchBar />
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-gray-900">Featured Properties</h2>
          <Link
            href="/search"
            className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
          >
            View all →
          </Link>
        </div>

        {featuredListings.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow-sm">
            <p className="text-lg text-gray-600">
              No featured listings available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {featuredListings.map((listing) => (
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
        )}
      </section>
    </div>
  );
}
