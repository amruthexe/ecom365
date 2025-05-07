import { Suspense } from "react";
import SuccessPage from "./SuccessContent";

export default function SuccessWrapper() {
  return (
    <Suspense fallback={<p className="p-8 text-center">Loading...</p>}>
      <SuccessPage />
    </Suspense>
  );
}
