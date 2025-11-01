"use client";

import { useState } from "react";

type PayStepProps = {
  formData: {
    listingId: string | null;
    paid: boolean;
  };
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
};

export function PayStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: PayStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!formData.listingId) {
      setError("Listing not created. Please go back and complete previous steps.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/billing/listing-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId: formData.listingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  if (formData.paid) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Payment Complete</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Payment Successful!</h3>
              <p className="text-sm text-green-700">Your listing payment has been processed.</p>
            </div>
          </div>
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
            className="px-6 py-2 bg-blue-600 text-white rounded-md"
          >
            Continue to Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Payment Required</h2>

      <div className="space-y-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-semibold text-yellow-900 mb-2">Listing Fee</h3>
          <p className="text-2xl font-bold text-yellow-900 mb-2">$99.00</p>
          <p className="text-sm text-yellow-700">
            Pay a one-time fee to publish your listing and submit it for moderation.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={onBack}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700"
          >
            Back
          </button>
          <button
            onClick={handleCheckout}
            disabled={loading || !formData.listingId}
            className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}

