import { apiClient } from '@/lib/axios';

export interface ScheduleItem {
  dayOfWeek: number; // 0=Sunday, 1=Monday... or 1=Monday? Usually 1=Mon, 7=Sun in ISO. Let's use user's mock: 1
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDuration: number; // In minutes, e.g., 15
  maxTokens?: number;
}

export const DoctorService = {
  bulkUpdateSchedule: async (clinicId: string, doctorId: string, scheduleItems: ScheduleItem[]) => {
    const response = await apiClient.post(`/doctor/${clinicId}/${doctorId}/schedule`, scheduleItems);
    return response.data;
  }
};
