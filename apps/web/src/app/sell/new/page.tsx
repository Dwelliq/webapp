import { Suspense } from "react";
import NewListingContent from "./NewListingContent";

export default function NewListingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <NewListingContent />
    </Suspense>
  );
}
