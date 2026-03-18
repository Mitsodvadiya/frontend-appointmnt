"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { AuthService } from "@/services/auth.service";

export default function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, token, user, setAuth } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    
    const checkGuestStatus = async () => {
      effectRan.current = true;
      
      // If we already have a token in memory, we are authenticated -> redirect
      if (isAuthenticated && token && user) {
        const clinicData = useAppStore.getState().clinic;
        if (clinicData) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
        return;
      }

      // We might have an active cookie but an empty store (e.g., page reload)
      try {
        const { data: refreshData } = await AuthService.refresh() as any;
        const newToken = refreshData?.token || (await AuthService.refresh() as any).token;

        // Preload token for the Axios interceptor
        useAppStore.getState().setToken(newToken);

        const meResponse = await AuthService.getMe() as any;
        const payload = meResponse.data ? meResponse.data : meResponse;

        // We actually HAVE a session, so store it and redirect away from guest page
        setAuth(payload.user, newToken, payload.clinic || null);

        if (payload.clinic) {
          router.replace("/dashboard");
        } else {
          router.replace("/onboarding");
        }
      } catch (error) {
        // Refresh failed, meaning they are truly a guest. Proceed to render children.
        setIsInitializing(false);
      }
    };

    checkGuestStatus();
  }, [isAuthenticated, token, user, setAuth, router]);

  if (isInitializing) {
    // Show nothing while checking session to avoid flickering the login page
    return null;
  }

  return <>{children}</>;
}
