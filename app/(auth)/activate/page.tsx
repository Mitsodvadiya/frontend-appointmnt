import { Suspense } from "react";
import ActivateAccountForm from "./activate-account-form";

export default function ActivatePage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-8">Loading...</div>}>
      <ActivateAccountForm />
    </Suspense>
  );
}
