"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, Info, Building2 } from "lucide-react";
import { ClinicService } from "@/services/clinic.service";
import { useAppStore } from "@/store/use-app-store";
import { InviteStaffDialog } from "@/components/staff/invite-staff-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function StaffPage() {
  const { clinic } = useAppStore();

  const { data: membersResponse, isLoading, error } = useQuery({
    queryKey: ["clinicMembers", clinic?.id],
    queryFn: () => ClinicService.getClinicMembers(clinic!.id),
    enabled: !!clinic?.id,
  });

  const members = membersResponse?.data || [];

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "CLINIC_ADMIN": return "bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200";
      case "DOCTOR": return "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200";
      case "STAFF": return "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200";
      default: return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Manage Staff</h1>
          <p className="text-slate-500 mt-1">
            View and manage doctors, receptionists, and administrative staff.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <InviteStaffDialog />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header List */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 grid grid-cols-12 gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-12 sm:col-span-5 md:col-span-4">Member</div>
          <div className="hidden sm:block sm:col-span-4 md:col-span-3">Contact</div>
          <div className="hidden md:block col-span-3">Role</div>
          <div className="hidden sm:block sm:col-span-3 md:col-span-2 text-right">Status</div>
        </div>

        {/* Content list */}
        <div className="divide-y divide-slate-100">
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="px-6 py-4 grid grid-cols-12 gap-4 items-center animate-pulse">
              <div className="col-span-12 sm:col-span-5 md:col-span-4 flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <div className="hidden sm:block sm:col-span-4 md:col-span-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="hidden md:block col-span-3">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <div className="hidden sm:block sm:col-span-3 md:col-span-2 flex justify-end">
                <Skeleton className="h-6 w-16 ml-auto rounded-full" />
              </div>
            </div>
          ))}

          {!isLoading && error && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto w-12 h-12 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-3">
                <Info className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Failed to load staff</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1">There was an issue fetching the clinic members. Please try again later.</p>
            </div>
          )}

          {!isLoading && !error && members.length === 0 && (
            <div className="px-6 py-12 text-center">
              <div className="mx-auto w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">No members found</h3>
              <p className="text-slate-500 max-w-sm mx-auto mt-1">You haven't invited any staff to this clinic yet.</p>
            </div>
          )}

          {!isLoading && !error && members.map((member: any) => {
            const userName = member.user?.name || "Unknown";
            const userEmail = member.user?.email || "No email";
            const userPhone = member.user?.phone || "No phone provided";
            const isActive = member.user?.isActive;
            const initials = userName.substring(0, 2).toUpperCase();

            return (
              <div key={member.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-slate-50 transition-colors">
                <div className="col-span-12 sm:col-span-5 md:col-span-4 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-slate-200">
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {userEmail}
                    </p>
                  </div>
                </div>
                
                <div className="hidden sm:block sm:col-span-4 md:col-span-3">
                  <p className="text-sm text-slate-700 truncate">{userPhone}</p>
                </div>

                <div className="hidden md:block col-span-3">
                  <Badge variant="outline" className={`capitalize font-medium ${getRoleBadgeColor(member.role)}`}>
                    {member.role?.replace('_', ' ').toLowerCase() || "Staff"}
                  </Badge>
                </div>

                <div className="hidden sm:flex sm:col-span-3 md:col-span-2 justify-end">
                  {isActive ? (
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-transparent shadow-none">Active</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-transparent shadow-none">Pending</Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
