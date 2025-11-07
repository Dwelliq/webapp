"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const [formData, setFormData] = useState({
    q: searchParams.get("q") || "",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    beds: searchParams.get("beds") || "",
    baths: searchParams.get("baths") || "",
    propertyType: searchParams.get("propertyType") || "",
  });

  useEffect(() => {
    // Update form when URL params change (e.g., browser back/forward)
    setFormData({
      q: searchParams.get("q") || "",
      priceMin: searchParams.get("priceMin") || "",
      priceMax: searchParams.get("priceMax") || "",
      beds: searchParams.get("beds") || "",
      baths: searchParams.get("baths") || "",
      propertyType: searchParams.get("propertyType") || "",
    });
  }, [searchParams]);

  const updateURL = (updates: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    // Reset to page 1 when filters change
    params.delete("page");

    const queryString = params.toString();
    window.history.pushState(
      {},
      "",
      `/search${queryString ? `?${queryString}` : ""}`
    );
    router.refresh();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Immediate update for non-text fields
    if (name !== "q") {
      updateURL({ [name]: value });
    }
  };

  // Debounce text input (q field)
  useEffect(() => {
    if (formData.q === (searchParams.get("q") || "")) return;

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      updateURL({ q: formData.q });
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [formData.q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateURL(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg bg-white p-6 shadow-sm"
      aria-label="Search filters"
    >
      <fieldset className="space-y-4">
        <legend className="sr-only">Filter properties</legend>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label htmlFor="filter-q" className="mb-1 block text-sm font-medium text-gray-700">
              Search
            </label>
            <input
              type="text"
              id="filter-q"
              name="q"
              value={formData.q}
              onChange={handleChange}
              placeholder="Location, suburb, or address"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="filter-priceMin"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Min Price
            </label>
            <input
              type="number"
              id="filter-priceMin"
              name="priceMin"
              value={formData.priceMin}
              onChange={handleChange}
              placeholder="Min"
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="filter-priceMax"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Max Price
            </label>
            <input
              type="number"
              id="filter-priceMax"
              name="priceMax"
              value={formData.priceMax}
              onChange={handleChange}
              placeholder="Max"
              min="0"
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="filter-beds"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Bedrooms
            </label>
            <select
              id="filter-beds"
              name="beds"
              value={formData.beds}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
              <option value="5">5+</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-baths"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Bathrooms
            </label>
            <select
              id="filter-baths"
              name="baths"
              value={formData.baths}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
              <option value="4">4+</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="filter-propertyType"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Property Type
            </label>
            <select
              id="filter-propertyType"
              name="propertyType"
              value={formData.propertyType}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Any</option>
              <option value="house">House</option>
              <option value="apartment">Apartment</option>
              <option value="townhouse">Townhouse</option>
              <option value="unit">Unit</option>
              <option value="land">Land</option>
            </select>
          </div>
        </div>
      </fieldset>
    </form>
  );
}

