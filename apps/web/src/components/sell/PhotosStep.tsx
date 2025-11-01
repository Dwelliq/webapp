"use client";

import { useState } from "react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";

type PhotosStepProps = {
  formData: {
    photoKeys: string[];
  };
  updateFormData: (updates: any) => void;
  onNext: () => void;
  onBack: () => void;
  currentStep: number;
  totalSteps: number;
};

export function PhotosStep({
  formData,
  updateFormData,
  onNext,
  onBack,
}: PhotosStepProps) {
  const [uploading, setUploading] = useState(false);

  const handleUploadComplete = (res: any[]) => {
    const newKeys = res.map((file) => file.key);
    updateFormData({
      photoKeys: [...formData.photoKeys, ...newKeys],
    });
    setUploading(false);
  };

  const handleUploadError = (error: Error) => {
    console.error("Upload error:", error);
    setUploading(false);
  };

  const removePhoto = (index: number) => {
    const newKeys = formData.photoKeys.filter((_, i) => i !== index);
    updateFormData({ photoKeys: newKeys });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Property Photos</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload up to 30 photos (max 10MB each, JPEG/PNG only)
      </p>

      <div className="space-y-4">
        <div>
          <UploadButton<OurFileRouter>
            endpoint="listingPhotos"
            onClientUploadComplete={handleUploadComplete}
            onUploadError={handleUploadError}
            onUploadBegin={() => setUploading(true)}
            content={{
              button: ({ ready }) => (
                ready ? "Upload Photos" : "Preparing..."
              ),
              allowedContent: "Max 30 images (10MB each)",
            }}
          />
        </div>

        {formData.photoKeys.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Uploaded Photos ({formData.photoKeys.length}/30)
            </p>
            <div className="grid grid-cols-4 gap-4">
              {formData.photoKeys.map((key, index) => (
                <div key={index} className="relative group">
                  <img
                    src={`https://utfs.io/f/${key}`}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
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
          disabled={uploading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>
  );
}

