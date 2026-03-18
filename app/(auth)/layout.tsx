import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import GuestGuard from "@/components/auth/guest-guard";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen">
      {/* Left side - Branding/Marketing (Hidden on smaller screens) */}
      <div className="relative hidden w-0 flex-1 lg:block bg-[#F8F9FE] p-12">
        <div className="flex h-full flex-col justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-1.5 rounded-md">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              ClinicQ
            </span>
          </div>

          <div className="max-w-md">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground mb-4">
              Manage clinic operations in one place
            </h1>
            <p className="text-lg text-muted-foreground mb-12">
              Take ClinicQ for a spin and see how you can automate patient queues and operations in your clinic.
            </p>

            {/* Placeholder for an abstract illustration or dashboard preview */}
            <div className="relative w-full aspect-video bg-white rounded-xl shadow-xl overflow-hidden border border-border/50 flex flex-col">
              {/* Fake Dashboard Header */}
              <div className="h-10 border-b border-border/50 flex items-center px-4 gap-2 bg-slate-50/50">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
              </div>
              {/* Fake Dashboard Content */}
              <div className="flex-1 p-6 flex gap-4">
                <div className="w-1/4 flex flex-col gap-3">
                  <div className="w-full h-8 bg-slate-100 rounded-md" />
                  <div className="w-3/4 h-8 bg-slate-100 rounded-md" />
                  <div className="w-full h-8 bg-slate-100 rounded-md" />
                </div>
                <div className="flex-1 flex flex-col gap-4">
                  <div className="w-full h-32 bg-primary/5 rounded-lg border border-primary/10" />
                  <div className="w-full flex-1 bg-slate-50 rounded-lg border border-border/50" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ClinicQ. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right side - Forms */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:w-[600px] xl:w-[700px] 2xl:w-[800px] lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:max-w-md">
          {children}
        </div>
      </div>
      </div>
    </GuestGuard>
  );
}
