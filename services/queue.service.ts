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

  getCurrentQueue: async (clinicId: string, doctorId: string) => {
    const response = await apiClient.get(`/queue/current`, { params: { clinicId, doctorId } });
    return response.data;
  },

  getQueueDetails: async (queueId: string) => {
    const response = await apiClient.get(`/queue/${queueId}`);
    return response.data;
  },

  callNextToken: async (queueId: string, userId: string) => {
    const response = await apiClient.post(`/queue/call-next`, { queueId, userId });
    return response.data;
  },

  completeToken: async (tokenId: string, userId: string) => {
    const response = await apiClient.post(`/queue/tokens/${tokenId}/complete`, { userId });
    return response.data;
  },

  skipToken: async (tokenId: string, userId: string) => {
    const response = await apiClient.post(`/queue/tokens/${tokenId}/skip`, { userId });
    return response.data;
  },

  cancelToken: async (tokenId: string, userId: string) => {
    const response = await apiClient.post(`/queue/tokens/${tokenId}/cancel`, { userId });
    return response.data;
  }
};
