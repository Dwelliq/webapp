"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AddressStep } from "@/components/sell/AddressStep";
import { DetailsStep } from "@/components/sell/DetailsStep";
import { PhotosStep } from "@/components/sell/PhotosStep";
import { PricingStep } from "@/components/sell/PricingStep";
import { PayStep } from "@/components/sell/PayStep";
import { SubmitStep } from "@/components/sell/SubmitStep";

type ListingFormData = {
  // Address & Property
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  lat: number | null;
  lng: number | null;
  propertyType: string;
  beds: number | null;
  baths: number | null;
  parking: number | null;
  landSize: number | null;
  
  // Listing details
  description: string;
  photoKeys: string[];
  
  // Pricing
  priceMin: number | null;
  priceMax: number | null;
  
  // Metadata
  listingId: string | null;
  paid: boolean;
};

const STEPS = [
  { id: 1, name: "Address", component: AddressStep },
  { id: 2, name: "Details", component: DetailsStep },
  { id: 3, name: "Photos", component: PhotosStep },
  { id: 4, name: "Pricing", component: PricingStep },
  { id: 5, name: "Pay", component: PayStep },
  { id: 6, name: "Submit", component: SubmitStep },
] as const;

export default function NewListingContent() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  
  // Check if returning from payment (success query param)
  useEffect(() => {
    const success = searchParams.get("success");
    if (success === "true") {
      // Mark as paid and go to pay step to show success
      setFormData((prev) => ({
        ...prev,
        paid: true,
      }));
      setCurrentStep(5); // Go to Pay step to show success
    }
  }, [searchParams]);

  const [formData, setFormData] = useState<ListingFormData>({
    address: "",
    suburb: "",
    state: "",
    postcode: "",
    lat: null,
    lng: null,
    propertyType: "",
    beds: null,
    baths: null,
    parking: null,
    landSize: null,
    description: "",
    photoKeys: [],
    priceMin: null,
    priceMax: null,
    listingId: null,
    paid: false,
  });

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  const saveListing = async (step: number) => {
    // Save listing after completing Address, Details, Photos, or Pricing steps
    if (step >= 2 && step <= 4) {
      setSaving(true);
      try {
        const endpoint = "/api/listings/create";
        const method = formData.listingId ? "PUT" : "POST";

        const response = await fetch(endpoint, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            listingId: formData.listingId,
            address: formData.address,
            suburb: formData.suburb,
            state: formData.state,
            postcode: formData.postcode,
            lat: formData.lat,
            lng: formData.lng,
            propertyType: formData.propertyType,
            beds: formData.beds,
            baths: formData.baths,
            parking: formData.parking,
            landSize: formData.landSize,
            description: formData.description,
            photoKeys: formData.photoKeys,
            priceMin: formData.priceMin,
            priceMax: formData.priceMax,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.listingId && !formData.listingId) {
            updateFormData({ listingId: data.listingId });
          }
        }
      } catch (error) {
        console.error("Error saving listing:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      await saveListing(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (updates: Partial<ListingFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step.id ? "✓" : step.id}
                  </div>
                  <span className="mt-2 text-sm text-gray-600">{step.name}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <CurrentStepComponent
            formData={formData}
            updateFormData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
            currentStep={currentStep}
            totalSteps={STEPS.length}
          />
        </div>
      </div>
    </div>
  );
}

