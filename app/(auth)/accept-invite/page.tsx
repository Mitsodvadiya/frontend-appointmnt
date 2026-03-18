import { Suspense } from "react";
import CreatePasswordForm from "./create-password-form";

export default function CreatePasswordPage() {
  return (
    <Suspense fallback={<div className="flex h-full items-center justify-center p-8">Loading...</div>}>
      <CreatePasswordForm />
    </Suspense>
  );
}
