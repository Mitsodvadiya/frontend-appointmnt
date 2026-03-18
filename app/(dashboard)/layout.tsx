"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Hospital, LayoutDashboard, Users, Calendar, Settings, LogOut, Menu, Bell } from "lucide-react";

import { useAppStore } from "@/store/use-app-store";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import AuthGuard from "@/components/auth/auth-guard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { clinic } = useAppStore();
  const { logoutMutation } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Queue", href: "/queue", icon: Users },
    { name: "Appointments", href: "/appointments", icon: Calendar },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-slate-200">
        <div className="flex-1 flex flex-col min-h-0 bg-white">
          <div className="flex items-center h-16 shrink-0 px-6 border-b border-slate-100 mb-4 gap-2">
            <div className="bg-primary p-1.5 rounded-md">
              <Hospital className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 truncate">
              {clinic?.name || "ClinicQ"}
            </span>
          </div>
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "bg-slate-100 text-primary" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <item.icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                      isActive ? "text-primary" : "text-slate-400 group-hover:text-slate-500"
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
          <Button variant="ghost" className="w-full justify-start text-slate-600" onClick={() => logoutMutation.mutate()}>
            <LogOut className="mr-3 h-5 w-5 text-slate-400" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top Header */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white border-b border-slate-200 lg:border-none lg:bg-transparent lg:h-auto lg:py-4">
          <button
            type="button"
            className="px-4 border-r border-slate-200 text-slate-500 focus:outline-none lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 lg:px-8 flex justify-between">
            <div className="flex-1 flex items-center lg:hidden">
              <span className="text-lg font-bold truncate">{clinic?.name || "ClinicQ"}</span>
            </div>
            <div className="flex-1 hidden lg:flex items-center">
              {/* Optional Search bar here */}
            </div>
            <div className="ml-4 flex items-center md:ml-6 gap-4">
              <button
                type="button"
                className="bg-white lg:bg-slate-100 p-1.5 rounded-full text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-5 w-5" aria-hidden="true" />
              </button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full border border-slate-200">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://github.com/shadcn.png" alt="@doctor" />
                      <AvatarFallback className="bg-primary/10 text-primary">DR</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal border-b pb-2 mb-2">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">Dr. Smith</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        doctor@clinicq.com
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuItem>
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Clinic Details
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-destructive focus:bg-destructive/10">
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
      </div>
    </AuthGuard>
  );
}
