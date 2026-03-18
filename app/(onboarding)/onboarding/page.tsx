"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, ChevronRight, Plus, Trash2 } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { ClinicService, CreateClinicData, InviteMemberData } from "@/services/clinic.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAppStore } from "@/store/use-app-store";

// Zod schemas for Steps
const clinicSchema = z.object({
  name: z.string().min(2, "Clinic name must be at least 2 characters"),
  address: z.string().min(5, "Please enter a valid address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
});

const inviteSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email("Invalid email address"),
      name: z.string().min(2, "Name must be at least 2 characters"),
      role: z.enum(["DOCTOR", "STAFF"]),
      phone: z.string().min(10, "Valid phone number required"),
    })
  ),
});

type ClinicFormValues = z.infer<typeof clinicSchema>;
type InviteFormValues = z.infer<typeof inviteSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const { setClinic, clinic } = useAppStore();

  const createClinicMutation = useMutation({
    mutationFn: (data: CreateClinicData) => ClinicService.createClinic(data),
    onSuccess: (response, variables) => {
      setClinic({
        id: response.data.id,
        name: response.data.name,
        address: response.data.address,
        phoneNumber: variables.phone,
      });
      toast.success("Clinic created successfully!");
      setStep(2);
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Failed to create clinic.");
      toast.error(msg);
    },
  });

  const clinicForm = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicSchema),
    defaultValues: {
      name: "",
      address: "",
      phoneNumber: "",
    },
  });

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: [{ email: "", name: "", role: "DOCTOR", phone: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: inviteForm.control,
    name: "invites",
  });

  function onClinicSubmit(data: ClinicFormValues) {
    createClinicMutation.mutate({
      name: data.name,
      address: data.address,
      phone: data.phoneNumber,
    });
  }

  const inviteMutation = useMutation({
    mutationFn: (data: InviteMemberData) => ClinicService.inviteMember(data),
  });

  async function onInviteSubmit(data: InviteFormValues) {
    if (!clinic?.id) {
      toast.error("Clinic information not found. Try creating it again.");
      return;
    }

    // Filter out empty emails (or you can validate name properly)
    const validInvites = data.invites.filter((inv) => inv.email.trim() !== "" && inv.name.trim() !== "");
    
    if (validInvites.length === 0) {
      toast.error("Please provide at least one valid invitation or skip this step.");
      return;
    }

    try {
      // Create an array of promises to send multiple invites
      const invitePromises = validInvites.map(inv => 
        inviteMutation.mutateAsync({
          clinicId: clinic.id,
          email: inv.email,
          name: inv.name,
          role: inv.role,
          phone: inv.phone,
        })
      );
      
      await Promise.all(invitePromises);
      toast.success("Invitations sent successfully!");
      setStep(3);
    } catch (error: any) {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Failed to send invitations.");
      toast.error(msg);
    }
  }

  function skipInvite() {
    console.log("Skipping invites");
    setStep(3);
  }

  return (
    <div>
      {/* Progress Header */}
      {step < 3 && (
        <div className="bg-slate-50 border-b border-slate-100 px-8 py-5 flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-semibold text-slate-900">
              {step === 1 ? "Clinic Details" : "Invite Team"}
            </h2>
            <p className="text-sm text-slate-500">
              Step {step} of 2
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-slate-200'}`} />
            <div className={`w-8 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-slate-200'}`} />
          </div>
        </div>
      )}

      {/* Forms Container */}
      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Set up your clinic</h3>
              <p className="text-slate-500">Provide the basic details of your clinic so patients and staff can identify it.</p>
            </div>

            <Form {...clinicForm}>
              <form onSubmit={clinicForm.handleSubmit(onClinicSubmit)} className="space-y-5">
                <FormField
                  control={clinicForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. City Health Clinic" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={clinicForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clinic Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Health Ave, Medical District" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={clinicForm.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 000-0000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4 flex justify-end">
                  <Button type="submit" size="lg" className="min-w-[120px]" disabled={createClinicMutation.isPending}>
                    {createClinicMutation.isPending ? "Creating..." : "Continue"} <ChevronRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Invite your team</h3>
              <p className="text-slate-500">Invite doctors, receptionists, and nurses to join your clinic workspace. You can also skip this and do it later.</p>
            </div>

            <Form {...inviteForm}>
              <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-6">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-slate-200 rounded-lg relative bg-white">
                      
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 top-2 text-slate-400 hover:text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                        <FormField
                          control={inviteForm.control}
                          name={`invites.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Dr. Jane Doe" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={inviteForm.control}
                          name={`invites.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address</FormLabel>
                              <FormControl>
                                <Input placeholder="doctor@clinic.com" type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={inviteForm.control}
                          name={`invites.${index}.phone`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input placeholder="919876543210" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={inviteForm.control}
                          name={`invites.${index}.role`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Role</FormLabel>
                              <FormControl>
                                <select 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                  {...field}
                                >
                                  <option value="DOCTOR">Doctor</option>
                                  <option value="STAFF">Staff</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ email: "", name: "", role: "DOCTOR", phone: "" })}
                  className="text-primary hover:text-primary mt-2"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add another team member
                </Button>

                <div className="pt-8 flex items-center justify-between border-t border-slate-100 mt-8">
                  <Button type="button" variant="ghost" onClick={skipInvite}>
                    Skip for now
                  </Button>
                  <Button type="submit" size="lg" className="min-w-[120px]" disabled={inviteMutation.isPending}>
                    {inviteMutation.isPending ? "Sending..." : "Send Invites"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}

        {step === 3 && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-4">You're all set!</h2>
            <p className="text-lg text-slate-500 max-w-md mx-auto mb-10">
              Your clinic workspace has been successfully configured. You are ready to start managing your queues.
            </p>
            <Button size="lg" className="px-10 py-6 text-lg" onClick={() => router.push("/dashboard")}>
              Go to Dashboard <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
