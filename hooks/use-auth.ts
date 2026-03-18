import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthService, LoginData, RegisterData, ResetPasswordData } from '@/services/auth.service';
import { useAppStore } from '@/store/use-app-store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const { setAuth, logout, user } = useAppStore();
  const queryClient = useQueryClient();

  const router = useRouter();

  const handleAuthSuccess = (response: any) => {
    // Backend wraps response in 'data' object based on the new spec
    const payload = response.data ? response.data : response; 
    
    if (payload.user && payload.token) {
      setAuth(payload.user, payload.token, payload.clinic || null);
    }
  };

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => AuthService.login(data),
    onSuccess: (response) => {
      handleAuthSuccess(response);
      toast.success('Successfully logged in');

      const payload = response.data ? (response.data as any) : (response as any);
      if (payload.clinic) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Login failed. Please check your credentials.");
      toast.error(msg);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => AuthService.register(data),
    onSuccess: () => {
      toast.success('Registration successful. Please check your email to activate your account.');
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Registration failed. Please try again.");
      toast.error(msg);
    },
  });

  const activateMutation = useMutation({
    mutationFn: (token: string) => AuthService.activate(token),
    onSuccess: (response) => {
      handleAuthSuccess(response);
      toast.success('Account successfully activated!');
      
      const payload = response.data ? (response.data as any) : (response as any);
      if (payload.clinic) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Activation failed or link expired.");
      toast.error(msg);
    },
  });

  const resendActivationMutation = useMutation({
    mutationFn: (email: string) => AuthService.resendActivation(email),
    onSuccess: () => {
      toast.success('Activation email sent successfully.');
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Failed to resend activation email.");
      toast.error(msg);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => AuthService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Successfully logged out.');
      router.push('/login');
    },
    onError: () => {
      // Even if API fails, clear local state
      logout();
      queryClient.clear();
      toast.error('Session cleared, but logout from server failed.');
      router.push('/login');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => AuthService.forgotPassword(email),
    onSuccess: () => {
      toast.success('If an account exists, a reset link has been sent.');
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Failed to request password reset.");
      toast.error(msg);
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: (data: ResetPasswordData) => AuthService.resetPassword(data),
    onSuccess: () => {
      toast.success('Password successfully reset. You can now log in.');
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Failed to reset password.");
      toast.error(msg);
    },
  });

  return {
    loginMutation,
    registerMutation,
    activateMutation,
    resendActivationMutation,
    logoutMutation,
    forgotPasswordMutation,
    resetPasswordMutation,
    isAuthenticated: !!user,
  };
};
