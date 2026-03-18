"use client";

import { AddPatientDialog } from "@/components/queue/add-patient-dialog";
import { Users } from "lucide-react";

export default function QueuePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Queue Management</h2>
          <p className="text-muted-foreground">
            Manage the current patient queue. Add new patients to generate tokens.
          </p>
        </div>
        
        {/* The target Add Patient button inside its own component */}
        <AddPatientDialog />
      </div>

      {/* Queue list placeholder */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center">
        <Users className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No patients in queue</h3>
        <p className="mt-1 text-sm text-slate-500">
          Get started by adding a patient and generating a token.
        </p>
      </div>
    </div>
  );
}
