"use client";

import Link from "next/link";
import { useAppStore } from "@/store/use-app-store";
import { Button } from "@/components/ui/button";
import { Hospital, ArrowRight, LayoutDashboard, Users, Clock, LineChart } from "lucide-react";

export default function Home() {
  const { isAuthenticated, clinic } = useAppStore();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-primary/20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-primary p-1.5 rounded-lg shadow-sm">
                <Hospital className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">ClinicQ</span>
            </div>

            <nav className="flex items-center gap-4">
              {isAuthenticated ? (
                <Link href={clinic ? "/dashboard" : "/onboarding"}>
                  <Button variant="default" className="font-medium rounded-full px-6">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" className="font-medium">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="default" className="font-medium rounded-full px-6">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-24 pb-32 lg:pt-36 lg:pb-40">
          <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-8 mt-4">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
              Now available for Beta Testing
            </div>
            
            <h1 className="mx-auto max-w-4xl font-extrabold tracking-tight text-slate-900 text-5xl sm:text-6xl lg:text-7xl mb-6">
              Modernize your clinic's <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-600">
                Wait Experience
              </span>
            </h1>
            
            <p className="mx-auto max-w-2xl text-lg sm:text-lg text-slate-600 mb-10 leading-relaxed">
              Streamline patient flow, eliminate crowded waiting rooms, and give your staff the tools they need to run a flawless daily queue. All in one beautiful platform.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {isAuthenticated ? (
                 <Link href={clinic ? "/dashboard" : "/onboarding"}>
                  <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                 </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className="rounded-full px-8 h-14 text-base shadow-lg hover:shadow-xl transition-all w-full sm:w-auto">
                      Start for free <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-base w-full sm:w-auto bg-white">
                      Book a Demo
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Everything you need to manage your clinic
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Built specifically for modern healthcare facilities that prioritize patient experience and staff efficiency.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Feature 1 */}
              <div className="group relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg hover:bg-white transition-all duration-300">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Live Queue Tracking</h3>
                <p className="text-slate-600 leading-relaxed">
                  Patients can track their exact queue position from their phones, meaning no more crowded waiting rooms and less stress for everyone.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-emerald-500/20 hover:shadow-lg hover:bg-white transition-all duration-300">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Clock className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Smart Scheduling</h3>
                <p className="text-slate-600 leading-relaxed">
                  Effortlessly configure doctors' weekly shifts, manage walk-ins versus appointments, and dynamically adjust pacing on the fly.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-500/20 hover:shadow-lg hover:bg-white transition-all duration-300">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <LineChart className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">Beautiful Insights</h3>
                <p className="text-slate-600 leading-relaxed">
                  Get daily, weekly and monthly analytics describing wait times, patient volumes, and doctor efficiency to continuously improve.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400">
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 opacity-50 grayscale">
            <div className="bg-white p-1 rounded">
              <Hospital className="h-5 w-5 text-slate-900" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">ClinicQ</span>
          </div>
          <p className="text-sm">
            © {new Date().getFullYear()} ClinicQ Inc. All rights reserved. Built for modern healthcare.
          </p>
        </div>
      </footer>
    </div>
  );
}
