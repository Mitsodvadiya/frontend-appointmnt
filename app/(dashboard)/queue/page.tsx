"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AddPatientDialog } from "@/components/queue/add-patient-dialog";
import { QueueGridView } from "@/components/queue/queue-grid-view";
import { Users, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { ClinicService } from "@/services/clinic.service";
import { useAppStore } from "@/store/use-app-store";

export default function QueuePage() {
  const { clinic, user } = useAppStore();
  const [activeDoctorId, setActiveDoctorId] = useState<string | null>(null);

  const isDoctor = user?.role === "DOCTOR";
  const isStaff = user?.role === "STAFF";
  const isAdmin = user?.role === "CLINIC_ADMIN";

  const { data: membersResponse, isLoading } = useQuery({
    queryKey: ["clinicMembers", clinic?.id],
    queryFn: () => ClinicService.getClinicMembers(clinic!.id),
    enabled: !!clinic?.id && !isDoctor,
  });

  const doctors = useMemo(() => {
    if (!membersResponse?.data) return [];
    return membersResponse.data.filter((m: any) => m.role === "DOCTOR");
  }, [membersResponse]);

  // Doctors only see their own queue
  useEffect(() => {
    if (isDoctor && user?.id) {
      setActiveDoctorId(user.id);
    } else if (doctors.length > 0 && !activeDoctorId) {
      setActiveDoctorId(doctors[0].user?.id || doctors[0].userId);
    }
  }, [doctors, activeDoctorId, isDoctor, user?.id]);

  const activeDoctor = doctors.find((d: any) => (d.user?.id || d.userId) === activeDoctorId);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
             {isDoctor ? "My Queue" : "Queue Management"}
          </h2>
          <p className="text-muted-foreground">
             {isDoctor 
               ? "Manage your active patient queue and tokens." 
               : "View and manage all doctor queues and add new patients."}
          </p>
        </div>
        
        {/* Doctors cannot add patients based on requirement */}
        {!isDoctor && <AddPatientDialog />}
      </div>

      {isLoading || !clinic ? (
        <div className="flex justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
        </div>
      ) : (
        <>
          {!isDoctor && doctors.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
              {doctors.map((doc: any) => {
                const docId = doc.user?.id || doc.userId;
                const isActive = activeDoctorId === docId;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setActiveDoctorId(docId)}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 ${
                      isActive 
                        ? 'border-primary text-primary bg-primary/5' 
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Queue for {doc.user?.name || doc.name || "Doctor"}
                  </button>
                );
              })}
            </div>
          )}

          {activeDoctorId ? (
            <QueueGridView 
              clinicId={clinic.id} 
              doctorId={activeDoctorId} 
              userRole={user?.role || ""}
              userId={user?.id || ""}
            />
          ) : (
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center mt-6">
              <Users className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-900">
                No active doctors
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                There are no active doctors to show a queue for.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
