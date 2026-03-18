import { apiClient } from '@/lib/axios';

export interface CreateClinicData {
  name: string;
  address: string;
  phone: string;
}

export interface ClinicResponse {
  status: number;
  message: string;
  data: {
    id: string;
    name: string;
    address: string;
  };
}

export interface InviteMemberData {
  clinicId: string;
  email: string;
  name: string;
  role: string;
  phone: string;
}

export interface ActivateMemberData {
  token: string;
  newPassword?: string;
}

export const ClinicService = {
  createClinic: async (data: CreateClinicData): Promise<ClinicResponse> => {
    const response = await apiClient.post('/clinic', data);
    return response.data;
  },
  inviteMember: async (data: InviteMemberData) => {
    const { clinicId, ...payload } = data;
    const response = await apiClient.post(`/clinic/${clinicId}/invite`, payload);
    return response.data;
  },
  activateMember: async (data: ActivateMemberData) => {
    const response = await apiClient.post('/clinic/activate-member', data);
    return response.data;
  }
};
