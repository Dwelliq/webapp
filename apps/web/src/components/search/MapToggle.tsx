"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function MapToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMapView = searchParams.get("map") === "true";

  const toggleMap = () => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (isMapView) {
      params.delete("map");
    } else {
      params.set("map", "true");
    }

    const queryString = params.toString();
    window.history.pushState(
      {},
      "",
      `/search${queryString ? `?${queryString}` : ""}`
    );
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white p-1">
      <button
        type="button"
        onClick={() => {
          if (isMapView) toggleMap();
        }}
        aria-pressed={!isMapView}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          !isMapView
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        List
      </button>
      <button
        type="button"
        onClick={() => {
          if (!isMapView) toggleMap();
        }}
        aria-pressed={isMapView}
        className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isMapView
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`}
      >
        Map
      </button>
    </div>
  );
}

