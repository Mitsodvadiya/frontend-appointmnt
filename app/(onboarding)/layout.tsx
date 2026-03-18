import { Hospital } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-12 pb-24 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl mb-8 flex items-center gap-2 justify-center">
        <div className="bg-primary p-2 rounded-lg">
          <Hospital className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-2xl font-bold tracking-tight text-slate-900">
          ClinicQ
        </span>
      </div>
      
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
