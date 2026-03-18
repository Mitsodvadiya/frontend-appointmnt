import { apiClient } from '@/lib/axios';

export interface CreateTokenPayload {
  doctorId: string;
  clinicId: string;
  patientId: string;
  reason: string;
  source: string;
}

export const QueueService = {
  // 1. Create Token (Join Queue)
  createToken: async (data: CreateTokenPayload) => {
    const response = await apiClient.post('/queue/tokens', data);
    return response.data;
  },
};
