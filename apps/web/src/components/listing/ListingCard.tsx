import Link from "next/link";
import Image from "next/image";

type ListingCardProps = {
  id: string;
  address: string;
  suburb: string;
  state: string;
  priceMin: number | null;
  priceMax: number | null;
  beds: number | null;
  baths: number | null;
  parking: number | null;
  firstPhotoKey: string | null;
};

export function ListingCard({
  id,
  address,
  suburb,
  state,
  priceMin,
  priceMax,
  beds,
  baths,
  parking,
  firstPhotoKey,
}: ListingCardProps) {
  const imageUrl = firstPhotoKey
    ? `https://utfs.io/f/${firstPhotoKey}`
    : "/placeholder-property.jpg";

  const formatPrice = (price: number | null) => {
    if (!price) return null;
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const priceDisplay =
    priceMin && priceMax
      ? `${formatPrice(priceMin)} - ${formatPrice(priceMax)}`
      : priceMin
        ? `From ${formatPrice(priceMin)}`
        : priceMax
          ? `Up to ${formatPrice(priceMax)}`
          : "Price on request";

  return (
    <Link
      href={`/listing/${id}`}
      className="group block rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-lg bg-gray-100">
        <Image
          src={imageUrl}
          alt={`${address}, ${suburb}, ${state}`}
          fill
          className="object-cover transition-transform group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="p-4">
        <h3 className="mb-1 text-lg font-semibold text-gray-900 line-clamp-1">
          {address}
        </h3>
        <p className="mb-2 text-sm text-gray-600">
          {suburb}, {state}
        </p>
        <p className="mb-3 text-lg font-semibold text-blue-600">{priceDisplay}</p>
        <div className="flex gap-4 text-sm text-gray-600">
          {beds !== null && (
            <span>
              <span className="sr-only">Bedrooms:</span>
              {beds} bed{beds !== 1 ? "s" : ""}
            </span>
          )}
          {baths !== null && (
            <span>
              <span className="sr-only">Bathrooms:</span>
              {baths} bath{baths !== 1 ? "s" : ""}
            </span>
          )}
          {parking !== null && (
            <span>
              <span className="sr-only">Parking:</span>
              {parking} parking
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

