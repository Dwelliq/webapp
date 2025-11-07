"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HomeSearchBar() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    q: "",
    priceMin: "",
    priceMax: "",
    beds: "",
    baths: "",
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const params = new URLSearchParams();

    if (formData.q.trim()) {
      params.set("q", formData.q.trim());
    }
    if (formData.priceMin) {
      params.set("priceMin", formData.priceMin);
    }
    if (formData.priceMax) {
      params.set("priceMax", formData.priceMax);
    }
    if (formData.beds) {
      params.set("beds", formData.beds);
    }
    if (formData.baths) {
      params.set("baths", formData.baths);
    }

    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ""}`);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg"
      aria-label="Search properties"
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <label htmlFor="home-search-q" className="mb-1 block text-sm font-medium text-gray-700">
            Search Location
          </label>
          <input
            type="text"
            id="home-search-q"
            name="q"
            value={formData.q}
            onChange={handleChange}
            placeholder="Location, suburb, or address"
            aria-label="Search"
            className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="priceMin"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Min Price
          </label>
          <input
            type="number"
            id="priceMin"
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
            htmlFor="priceMax"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Max Price
          </label>
          <input
            type="number"
            id="priceMax"
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
            htmlFor="beds"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Bedrooms
          </label>
          <select
            id="beds"
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
            htmlFor="baths"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Bathrooms
          </label>
          <select
            id="baths"
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

        <div className="flex items-end">
          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}

