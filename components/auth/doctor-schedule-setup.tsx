"use client";

import * as React from "react";
import { useMutation } from "@tanstack/react-query";
import { DoctorService, ScheduleItem } from "@/services/doctor.service";
import { toast } from "sonner";
import { Loader2, CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface DoctorScheduleSetupProps {
  clinicId: string;
  doctorId: string;
  onComplete: () => void;
}

const DAYS = [
  { id: 1, name: "Monday" },
  { id: 2, name: "Tuesday" },
  { id: 3, name: "Wednesday" },
  { id: 4, name: "Thursday" },
  { id: 5, name: "Friday" },
  { id: 6, name: "Saturday" },
  { id: 7, name: "Sunday" },
];

export function DoctorScheduleSetup({ clinicId, doctorId, onComplete }: DoctorScheduleSetupProps) {
  // Pre-fill Mon-Fri with default 9 to 5
  const [scheduleState, setScheduleState] = React.useState<Record<number, any>>(() => {
    const initialState: Record<number, any> = {};
    DAYS.forEach(day => {
      initialState[day.id] = {
        isActive: day.id >= 1 && day.id <= 5, // Mon-Fri active by default
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 15,
      };
    });
    return initialState;
  });

  const mutation = useMutation({
    mutationFn: (items: ScheduleItem[]) => DoctorService.bulkUpdateSchedule(clinicId, doctorId, items),
    onSuccess: () => {
      toast.success("Schedule successfully saved!");
      onComplete();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to save schedule.");
    }
  });

  const handleDayToggle = (dayId: number, checked: boolean) => {
    setScheduleState(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], isActive: checked }
    }));
  };

  const handleTimeChange = (dayId: number, field: string, value: string | number) => {
    setScheduleState(prev => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Transform state into API array payload
    const payload: ScheduleItem[] = [];
    
    // Validate
    let hasError = false;

    Object.entries(scheduleState).forEach(([dayId, data]) => {
      if (data.isActive) {
        if (!data.startTime || !data.endTime) {
          toast.error(`Please provide start and end times for ${DAYS.find(d => d.id === Number(dayId))?.name}`);
          hasError = true;
        }
        if (data.startTime >= data.endTime) {
          toast.error(`End time must be after start time for ${DAYS.find(d => d.id === Number(dayId))?.name}`);
          hasError = true;
        }

        payload.push({
          dayOfWeek: Number(dayId),
          startTime: data.startTime,
          endTime: data.endTime,
          slotDuration: Number(data.slotDuration) || 15
        });
      }
    });

    if (hasError) return;
    
    if (payload.length === 0) {
      toast.error("You must select at least one active working day.");
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <div className="flex flex-col gap-6 text-left w-full max-w-2xl mx-auto">
      <div className="flex justify-center mb-2">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
          <CalendarClock className="w-8 h-8" />
        </div>
      </div>
      
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold tracking-tight">Set Your Weekly Schedule</h2>
        <p className="text-muted-foreground mt-2">
          Configure your standard working hours and appointment slot duration. You can adjust these later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white border text-sm rounded-lg overflow-hidden shadow-sm">
          <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b font-medium text-slate-500">
            <div className="col-span-4">Day</div>
            <div className="col-span-3">Start Time</div>
            <div className="col-span-3">End Time</div>
            <div className="col-span-2 text-center">Slot (min)</div>
          </div>
          
          <div className="divide-y">
            {DAYS.map(day => {
              const data = scheduleState[day.id];
              return (
                <div key={day.id} className={`grid grid-cols-12 gap-4 p-4 items-center transition-colors ${data.isActive ? 'bg-white' : 'bg-slate-50 opacity-60'}`}>
                  <div className="col-span-4 flex items-center gap-3">
                    <Checkbox 
                      id={`day-${day.id}`} 
                      checked={data.isActive} 
                      onCheckedChange={(c) => handleDayToggle(day.id, c as boolean)}
                    />
                    <Label htmlFor={`day-${day.id}`} className="font-medium cursor-pointer">
                      {day.name}
                    </Label>
                  </div>
                  
                  <div className="col-span-3">
                    <Input 
                      type="time" 
                      value={data.startTime}
                      onChange={(e) => handleTimeChange(day.id, 'startTime', e.target.value)}
                      disabled={!data.isActive}
                      className="h-9"
                      required={data.isActive}
                    />
                  </div>
                  
                  <div className="col-span-3">
                    <Input 
                      type="time" 
                      value={data.endTime}
                      onChange={(e) => handleTimeChange(day.id, 'endTime', e.target.value)}
                      disabled={!data.isActive}
                      className="h-9"
                      required={data.isActive}
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <Input 
                      type="number" 
                      value={data.slotDuration}
                      onChange={(e) => handleTimeChange(day.id, 'slotDuration', e.target.value)}
                      disabled={!data.isActive}
                      className="h-9 text-center"
                      min={5}
                      step={5}
                      required={data.isActive}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <Button type="submit" className="w-full py-6 text-base" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : null}
          {mutation.isPending ? "Saving Schedule..." : "Save Schedule & Continue"}
        </Button>
      </form>
    </div>
  );
}
