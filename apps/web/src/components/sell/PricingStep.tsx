"use client";

type PricingStepProps = {
  formData: {
    priceMin: number | null;
    priceMax: number | null;
  };
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
};

// Static comparable sales data (stub for now)
const COMPARABLE_SALES = [
  { address: "123 Sample St", suburb: "Sydney", price: 850000, beds: 3, baths: 2, distance: 0.5 },
  { address: "456 Example Ave", suburb: "Sydney", price: 920000, beds: 4, baths: 2, distance: 0.8 },
  { address: "789 Test Rd", suburb: "Sydney", price: 780000, beds: 3, baths: 1, distance: 1.2 },
];

export function PricingStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: PricingStepProps) {
  const canProceed = formData.priceMin !== null && formData.priceMax !== null && formData.priceMin < formData.priceMax;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Pricing</h2>

      <div className="space-y-6">
        {/* Comparable Sales Browser (Stub) */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-3">Comparable Sales</h3>
          <div className="space-y-2 text-sm">
            {COMPARABLE_SALES.map((sale, index) => (
              <div key={index} className="flex justify-between items-center">
                <div>
                  <span className="font-medium">{sale.address}, {sale.suburb}</span>
                  <span className="text-gray-600 ml-2">
                    {sale.beds} bed, {sale.baths} bath • {sale.distance}km away
                  </span>
                </div>
                <span className="font-semibold">${sale.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-700 mt-3 italic">
            * This is a static stub. AVM (Automated Valuation Model) integration coming soon.
          </p>
        </div>

        {/* Price Range Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Price ($) *
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.priceMin || ""}
              onChange={(e) =>
                updateFormData({ priceMin: e.target.value ? parseFloat(e.target.value) : null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 500000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Price ($) *
            </label>
            <input
              type="number"
              min="0"
              step="1000"
              value={formData.priceMax || ""}
              onChange={(e) =>
                updateFormData({ priceMax: e.target.value ? parseFloat(e.target.value) : null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 800000"
            />
          </div>
        </div>

        {formData.priceMin && formData.priceMax && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Price Range: <span className="font-semibold">
                ${formData.priceMin.toLocaleString()} - ${formData.priceMax.toLocaleString()}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-8">
        <button
          onClick={onBack}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
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
  );
}

