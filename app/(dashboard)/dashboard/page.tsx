"use client";

import { Users, Clock, CalendarCheck, TrendingUp } from "lucide-react";
import { useAppStore } from "@/store/use-app-store";

export default function DashboardPage() {
  const { clinic } = useAppStore();

  const stats = [
    { name: 'Patients in Queue', value: '12', icon: Users, change: '+2', changeType: 'increase' },
    { name: 'Average Wait Time', value: '18 min', icon: Clock, change: '-4 min', changeType: 'decrease' },
    { name: 'Appointments Today', value: '28', icon: CalendarCheck, change: '+14%', changeType: 'increase' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
          <p className="text-slate-500">Welcome back to {clinic?.name || "your clinic"}. Here's what's happening today.</p>
        </div>
      </div>

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => (
          <div
            key={item.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-xl border border-slate-100 overflow-hidden"
          >
            <dt>
              <div className="absolute bg-primary/10 rounded-lg p-3">
                <item.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-slate-500 truncate">{item.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-slate-900">{item.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold rounded-full px-2 py-0.5 ${
                  item.changeType === 'increase' ? 'text-emerald-700 bg-emerald-100' : 'text-emerald-700 bg-emerald-100'
                }`}
              >
                {item.change}
              </p>
              <div className="absolute bottom-0 inset-x-0 bg-slate-50 px-4 py-4 sm:px-6 border-t border-slate-100">
                <div className="text-sm">
                  <span className="font-medium text-primary hover:text-primary/80">
                    View all<span className="sr-only"> {item.name} stats</span>
                  </span>
                </div>
              </div>
            </dd>
          </div>
        ))}
      </dl>

      <div className="bg-white shadow rounded-xl border border-slate-100 p-6 flex items-center justify-center h-64 text-slate-500 text-sm">
        Queue Overview Placeholder / Chart Area
      </div>
    </div>
  );
}
