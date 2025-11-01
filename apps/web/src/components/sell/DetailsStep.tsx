"use client";

type DetailsStepProps = {
  formData: {
    propertyType: string;
    beds: number | null;
    baths: number | null;
    parking: number | null;
    landSize: number | null;
    description: string;
  };
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
};

const PROPERTY_TYPES = [
  { value: "house", label: "House" },
  { value: "apartment", label: "Apartment" },
  { value: "townhouse", label: "Townhouse" },
  { value: "unit", label: "Unit" },
  { value: "villa", label: "Villa" },
  { value: "land", label: "Land" },
];

export function DetailsStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: DetailsStepProps) {
  const canProceed =
    formData.propertyType &&
    formData.beds !== null &&
    formData.baths !== null &&
    formData.parking !== null;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Property Details</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Type *
          </label>
          <select
            value={formData.propertyType}
            onChange={(e) => updateFormData({ propertyType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select property type</option>
            {PROPERTY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bedrooms *
            </label>
            <input
              type="number"
              min="0"
              value={formData.beds || ""}
              onChange={(e) =>
                updateFormData({ beds: e.target.value ? parseInt(e.target.value) : null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bathrooms *
            </label>
            <input
              type="number"
              min="0"
              value={formData.baths || ""}
              onChange={(e) =>
                updateFormData({ baths: e.target.value ? parseInt(e.target.value) : null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parking Spaces *
            </label>
            <input
              type="number"
              min="0"
              value={formData.parking || ""}
              onChange={(e) =>
                updateFormData({ parking: e.target.value ? parseInt(e.target.value) : null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Land Size (sqm)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.landSize || ""}
              onChange={(e) =>
                updateFormData({ landSize: e.target.value ? parseFloat(e.target.value) : null })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe your property..."
          />
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
    </div>
  );
}

