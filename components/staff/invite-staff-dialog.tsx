"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Plus, Trash2, Loader2, Mail } from "lucide-react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ClinicService, InviteMemberData } from "@/services/clinic.service";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

// Re-using the exact schema from onboarding
const inviteSchema = z.object({
  invites: z.array(
    z.object({
      email: z.string().email("Invalid email address"),
      name: z.string().min(2, "Name must be at least 2 characters"),
      role: z.enum(["DOCTOR", "STAFF", "CLINIC_ADMIN"]),
      phone: z.string().min(10, "Valid phone number required"),
    })
  ),
});

type InviteFormValues = z.infer<typeof inviteSchema>;

export function InviteStaffDialog() {
  const [open, setOpen] = useState(false);
  const { clinic } = useAppStore();
  const queryClient = useQueryClient();

  const inviteForm = useForm<InviteFormValues>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      invites: [{ email: "", name: "", role: "STAFF", phone: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: inviteForm.control,
    name: "invites",
  });

  const inviteMutation = useMutation({
    mutationFn: (data: InviteMemberData) => ClinicService.inviteMember(data),
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => inviteForm.reset(), 200);
    }
  };

  async function onInviteSubmit(data: InviteFormValues) {
    if (!clinic?.id) {
      toast.error("Clinic context bound not found.");
      return;
    }

    const validInvites = data.invites.filter((inv) => inv.email.trim() !== "" && inv.name.trim() !== "");
    
    if (validInvites.length === 0) {
      toast.error("Please provide at least one valid invitation.");
      return;
    }

    try {
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
      
      // Invalidate the cache to instantly show new users
      queryClient.invalidateQueries({ queryKey: ["clinicMembers", clinic.id] });
      setOpen(false);
    } catch (error: any) {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Failed to send invitations.");
      toast.error(msg);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Staff
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite new team members</DialogTitle>
          <DialogDescription>
            Add doctors and staff to your clinic by filling out their details.
          </DialogDescription>
        </DialogHeader>

        <Form {...inviteForm}>
          <form onSubmit={inviteForm.handleSubmit(onInviteSubmit)} className="space-y-6 pt-4">
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-slate-200 rounded-lg relative bg-slate-50">
                  
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
                          <FormLabel>Full Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="E.g. Dr. Jane Doe" {...field} />
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
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input placeholder="staff@clinic.com" type="email" {...field} />
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
                          <FormLabel>Phone Number *</FormLabel>
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
                          <FormLabel>Role *</FormLabel>
                          <FormControl>
                            <select 
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="STAFF">Staff</option>
                              <option value="DOCTOR">Doctor</option>
                              <option value="CLINIC_ADMIN">Admin</option>
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
              onClick={() => append({ email: "", name: "", role: "STAFF", phone: "" })}
              className="text-primary border-primary/20 hover:bg-primary/5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add another team member
            </Button>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Send Invites
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
