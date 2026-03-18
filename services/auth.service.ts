import { apiClient } from '@/lib/axios';

// Request Types
export interface RegisterData {
  name: string;
  email: string;
  password?: string;
}

export interface LoginData {
  email: string;
  password?: string;
}

export interface ResetPasswordData {
  token: string;
  newPassword?: string;
  password?: string;
}

export interface AuthResponse {
  status: number;
  message: string;
  data: {
    token: string;
    user: {
      id: string;
      email: string;
      role: string;
      name?: string;
    };
    clinic: any | null; // using any for now, or you can import the specific Clinic type
  };
}

export const AuthService = {
  // 1. Register Web User
  register: async (data: RegisterData) => {
    const response = await apiClient.post('/auth/register', data);
    return response.data;
  },

  // 2. Activate Web User
  activate: async (token: string): Promise<AuthResponse> => {
    const response = await apiClient.get(`/auth/activate/${token}`);
    return response.data;
  },

  // Resend Activation Email
  resendActivation: async (email: string) => {
    const response = await apiClient.post('/auth/resend-activation', { email });
    return response.data;
  },


  // 3. Login Web User
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', data);
    return response.data;
  },

  // 4. Refresh Web Token
  // Note: Usually triggered by interceptor, but exported here if needed manually
  refresh: async (): Promise<{ token: string }> => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  // 5. Logout Web User
  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },

  // 6. Forget Password
  forgotPassword: async (email: string) => {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  // 7. Reset Password
  resetPassword: async (data: ResetPasswordData) => {
    // Handling field name mapping just in case form uses 'confirmPassword'
    const payload = {
      token: data.token,
      newPassword: data.newPassword || data.password,
    };
    const response = await apiClient.post('/auth/reset-password', payload);
    return response.data;
  },

  // Send OTP
  sendOtp: async (phone: string) => {
    const response = await apiClient.post('/auth/send-otp', { phone });
    return response.data;
  },

  // 8. Get Current Profile
  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // 9. Update Current Profile
  updateMe: async (data: Partial<RegisterData>) => {
    const response = await apiClient.patch('/auth/me', data);
    return response.data;
  },
};
