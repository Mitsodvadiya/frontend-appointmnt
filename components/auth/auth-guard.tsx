"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppStore } from "@/store/use-app-store";
import { AuthService } from "@/services/auth.service";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, token, user, setAuth, logout } = useAppStore();
  const [isInitializing, setIsInitializing] = useState(true);
  const effectRan = useRef(false);

  useEffect(() => {
    if (effectRan.current) return;
    
    const checkAuthStatus = async () => {
      effectRan.current = true;
      
      // If we already have a token in memory, we are authenticated
      if (isAuthenticated && token && user) {
        setIsInitializing(false);
        return;
      }

      // If we don't have a token, attempt silent refresh using HttpOnly cookie
      try {
        const refreshResponse = await AuthService.refresh() as any;
        // Handling both raw payload vs nested data payload
        const newToken = refreshResponse.data?.token || refreshResponse.token;

        // Preload token for the Axios interceptor
        useAppStore.getState().setToken(newToken);

        const meResponse = await AuthService.getMe() as any;
        const payload = meResponse.data ? meResponse.data : meResponse;

        // Populate the in-memory store
        setAuth(payload.user, newToken, payload.clinic || null);
        setIsInitializing(false);
      } catch (error) {
        console.log("Not authenticated, redirecting to login");
        logout();
        setIsInitializing(false);
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    };

    checkAuthStatus();
  }, [isAuthenticated, token, user, setAuth, logout, router, pathname]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Double check, should not render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
