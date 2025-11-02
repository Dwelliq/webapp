import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

const STATUS_COLORS = {
  REVIEW: "bg-yellow-100 text-yellow-800",
  LIVE: "bg-green-100 text-green-800",
  PAUSED: "bg-gray-100 text-gray-800",
  REJECTED: "bg-red-100 text-red-800",
  SOLD: "bg-blue-100 text-blue-800",
};

export default async function SellerDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const listings = await prisma.listing.findMany({
    where: {
      userId: user.id,
    },
    include: {
      property: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Listings</h1>
          <Link
            href="/sell/new"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Create New Listing
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">You haven't created any listings yet.</p>
            <Link
              href="/sell/new"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {listings.map((listing: typeof listings[0]) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold mb-2">
                      {listing.property.address}
                    </h2>
                    <p className="text-gray-600">
                      {listing.property.suburb}, {listing.property.state} {listing.property.postcode}
                    </p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      {listing.property.beds && (
                        <span>{listing.property.beds} bed{listing.property.beds !== 1 ? "s" : ""}</span>
                      )}
                      {listing.property.baths && (
                        <span>{listing.property.baths} bath{listing.property.baths !== 1 ? "s" : ""}</span>
                      )}
                      {listing.property.parking && (
                        <span>{listing.property.parking} parking</span>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[listing.status]}`}
                  >
                    {listing.status}
                  </span>
                </div>

                {listing.priceMin && listing.priceMax && (
                  <p className="text-lg font-semibold text-gray-900 mb-2">
                    ${listing.priceMin.toLocaleString()} - ${listing.priceMax.toLocaleString()}
                  </p>
                )}

                {listing.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                )}

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(listing.createdAt).toLocaleDateString()}
                    {listing.paid && (
                      <span className="ml-4 text-green-600 font-semibold">✓ Paid</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {listing.status === "LIVE" && (
                      <button className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                        View
                      </button>
                    )}
                    {listing.status === "REJECTED" && (
                      <Link
                        href={`/sell/edit/${listing.id}`}
                        className="px-4 py-2 text-sm border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50"
                      >
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

