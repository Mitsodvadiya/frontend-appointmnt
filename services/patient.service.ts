import { apiClient } from '@/lib/axios';

export interface Patient {
  id: string;
  phone: string;
  name?: string;
  age?: number;
  weight?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
}

export interface SearchPatientResponse {
  message: string;
  data: Patient | null;
}

export const PatientService = {
  // 1. Search Patient Precisely by Phone
  searchByPhone: async (phone: string): Promise<SearchPatientResponse> => {
    const response = await apiClient.get(`/patient/search?phone=${encodeURIComponent(phone)}`);
    return response.data;
  },

  // 2. Create Patient (Verify OTP)
  create: async (data: {
    phone: string;
    otp: string;
    name: string;
    age?: number;
    weight?: number;
    gender?: "MALE" | "FEMALE" | "OTHER";
    address?: string;
  }) => {
    const response = await apiClient.post('/patient/', data);
    return response.data;
  },

  // 3. Send Patient Update OTP (Admin)
  sendUpdateOtp: async (patientId: string) => {
    const response = await apiClient.post(`/patient/${patientId}/send-update-otp`);
    return response.data;
  },

  // 4. Verify and Update Patient (Admin)
  updateAndVerify: async (patientId: string, data: {
    otp: string;
    phone: string;
    name?: string;
    age?: number;
    weight?: number;
    gender?: "MALE" | "FEMALE" | "OTHER";
    address?: string;
  }) => {
    const response = await apiClient.patch(`/patient/${patientId}/update`, data);
    return response.data;
  },
};

