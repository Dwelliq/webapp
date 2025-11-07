"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "mapbox-gl/dist/mapbox-gl.css";

type ListingWithCoords = {
  id: string;
  address: string;
  suburb: string;
  state: string;
  lat: number | null;
  lng: number | null;
};

type MapViewProps = {
  listings: ListingWithCoords[];
};

export function MapView({ listings }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const initMap = async () => {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken || !mapContainerRef.current) return;

      // Dynamic import to avoid SSR issues
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = mapboxToken;

      // Initialize map
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [151.2093, -33.8688], // Sydney default
        zoom: 10,
      });

      mapRef.current = map;

      // Add markers for listings with coordinates
      listings.forEach((listing) => {
        if (listing.lat && listing.lng) {
          const marker = new mapboxgl.Marker()
            .setLngLat([listing.lng, listing.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div class="p-2"><strong>${listing.address}</strong><br>${listing.suburb}, ${listing.state}</div>`
              )
            )
            .addTo(map);

          markersRef.current.push(marker);
        }
      });

      // Fit bounds to show all markers
      if (markersRef.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        listings.forEach((listing) => {
          if (listing.lat && listing.lng) {
            bounds.extend([listing.lng, listing.lat]);
          }
        });
        map.fitBounds(bounds, { padding: 50 });
      }

      // Handle map moveend (pan/zoom) - debounced bbox update
      const handleMoveEnd = () => {
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }

        updateTimeoutRef.current = setTimeout(() => {
          const bounds = map.getBounds();
          const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;

          const params = new URLSearchParams(searchParams.toString());
          params.set("bbox", bbox);
          params.delete("page"); // Reset pagination on map move

          const queryString = params.toString();
          window.history.pushState(
            {},
            "",
            `/search${queryString ? `?${queryString}` : ""}`
          );
          router.refresh();
        }, 500); // 500ms debounce
      };

      map.on("moveend", handleMoveEnd);

      return () => {
        map.off("moveend", handleMoveEnd);
        map.remove();
        if (updateTimeoutRef.current) {
          clearTimeout(updateTimeoutRef.current);
        }
      };
    };

    initMap();
  }, []); // Only initialize once

  // Update markers when listings change
  useEffect(() => {
    if (!mapRef.current) return;

    const updateMarkers = async () => {
      const mapboxgl = (await import("mapbox-gl")).default;

      // Remove old markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      listings.forEach((listing) => {
        if (listing.lat && listing.lng) {
          const marker = new mapboxgl.Marker()
            .setLngLat([listing.lng, listing.lat])
            .setPopup(
              new mapboxgl.Popup().setHTML(
                `<div class="p-2"><strong>${listing.address}</strong><br>${listing.suburb}, ${listing.state}</div>`
              )
            )
            .addTo(mapRef.current);

          markersRef.current.push(marker);
        }
      });

      // Fit bounds
      if (markersRef.current.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        listings.forEach((listing) => {
          if (listing.lat && listing.lng) {
            bounds.extend([listing.lng, listing.lat]);
          }
        });
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    };

    updateMarkers();
  }, [listings]);

  return (
    <div
      ref={mapContainerRef}
      className="h-[600px] w-full rounded-lg"
      role="application"
      aria-label="Property map"
    />
  );
}

