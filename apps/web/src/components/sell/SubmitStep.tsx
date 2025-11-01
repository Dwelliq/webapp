"use client";

import { useState } from "react";

type SubmitStepProps = {
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

export function SubmitStep({
  formData,
  onBack,
}: SubmitStepProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!formData.listingId) {
      setError("Listing not found");
      return;
    }

    if (!formData.paid) {
      setError("Payment required before submission");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/listings/${formData.listingId}/submit`, {
        method: "POST",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit listing");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Listing Submitted</h2>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="font-semibold text-green-900">Success!</h3>
              <p className="text-sm text-green-700">
                Your listing has been submitted for moderation. You'll be notified once it's reviewed.
              </p>
            </div>
          </div>
        </div>
        <a
          href="/sell/listings"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-md"
        >
          View My Listings
        </a>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Submit for Moderation</h2>

      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">Review Process</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Your listing will be reviewed by our team</li>
            <li>You'll receive a notification once the review is complete</li>
            <li>If approved, your listing will go live</li>
            <li>If rejected, you'll receive feedback on what needs to be changed</li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!formData.paid && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-700">
              Payment is required before submission. Please complete the payment step first.
            </p>
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
            onClick={handleSubmit}
            disabled={loading || !formData.paid}
            className="px-6 py-2 bg-green-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit for Moderation"}
          </button>
        </div>
      </div>
    </div>
  );
}

