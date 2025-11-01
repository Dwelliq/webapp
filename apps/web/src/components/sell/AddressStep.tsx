"use client";

import { useState, useEffect, useRef } from "react";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

type AddressStepProps = {
  formData: {
    address: string;
    suburb: string;
    state: string;
    postcode: string;
    lat: number | null;
    lng: number | null;
  };
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
};

export function AddressStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  currentStep,
  totalSteps,
}: AddressStepProps) {
  const geocoderRef = useRef<HTMLDivElement>(null);
  const geocoderInstanceRef = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapboxToken || !geocoderRef.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxToken,
      placeholder: "Search for an address",
      countries: "au", // Australia
      proximity: [151.2093, -33.8688], // Sydney coordinates (optional)
      types: "address",
    });

    geocoder.addTo(geocoderRef.current);

    geocoder.on("result", (e: any) => {
      const result = e.result;
      const context = result.context || [];
      
      // Extract address components
      const address = result.place_name || result.text;
      const postcode = context.find((c: any) => c.id.startsWith("postcode"))?.text || "";
      const suburb = context.find((c: any) => c.id.startsWith("place"))?.text || "";
      const state = context.find((c: any) => c.id.startsWith("region"))?.text || "";

      updateFormData({
        address,
        suburb,
        state,
        postcode,
        lat: result.center[1],
        lng: result.center[0],
      });
    });

    geocoderInstanceRef.current = geocoder;

    return () => {
      geocoder.remove();
    };
  }, []);

  const canProceed = formData.address && formData.suburb && formData.state && formData.lat && formData.lng;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Property Address</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search Address
          </label>
          <div ref={geocoderRef} className="mb-4" />
        </div>

        {formData.address && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="font-semibold">{formData.address}</p>
            <p className="text-sm text-gray-600">
              {formData.suburb}, {formData.state} {formData.postcode}
            </p>
            {formData.lat && formData.lng && (
              <p className="text-xs text-gray-500 mt-1">
                Coordinates: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            disabled={currentStep === 1}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={onNext}
            disabled={!canProceed}
            className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

