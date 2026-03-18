"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Hospital, CheckCircle2 } from "lucide-react";

import { useMutation } from "@tanstack/react-query";
import { ClinicService, ActivateMemberData } from "@/services/clinic.service";
import { useAppStore } from "@/store/use-app-store";
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

const createPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type CreatePasswordValues = z.infer<typeof createPasswordSchema>;

export default function CreatePasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const [isSuccess, setIsSuccess] = React.useState(false);
  const { setAuth } = useAppStore();

  const activateMutation = useMutation({
    mutationFn: (data: ActivateMemberData) => ClinicService.activateMember(data),
    onSuccess: (response) => {
      // Backend returns data like: { status, message, data: { token, user, clinic } } if it wraps in 'data'
      // Adjust based on exact response mapping...
      const payload = response.data || response;
      if (payload.user && payload.token) {
        setAuth(payload.user, payload.token, payload.clinic);
        toast.success("Account activated successfully!");
        setIsSuccess(true);
      } else {
        toast.error("Invalid activation response from server.");
      }
    },
    onError: (error: any) => {
      const errRes = error.response?.data;
      const msg = (errRes?.error && typeof errRes.error === 'string') 
        ? errRes.error 
        : (errRes?.message || "Failed to activate account.");
      toast.error(msg);
    },
  });

  const form = useForm<CreatePasswordValues>({
    resolver: zodResolver(createPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: CreatePasswordValues) {
    if (!token) {
      toast.error("Invalid invitation link.");
      return;
    }
    
    activateMutation.mutate({
      token: token,
      newPassword: data.password
    });
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6 text-center items-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Welcome to the Team!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Your password has been successfully created. You can now access your clinic dashboard.
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard")} className="w-full text-base py-6 mt-4" size="lg">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Mobile Logo */}
      <div className="flex lg:hidden items-center gap-2 mb-4">
        <div className="bg-primary p-1.5 rounded-md">
          <Hospital className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">ClinicQ</span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Create your password</h2>
        <p className="text-muted-foreground">
          You've been invited to join a clinic. Please create a password to secure your account.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input placeholder="Minimum 8 characters" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="Minimum 8 characters" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full text-base py-6" size="lg" disabled={!token || activateMutation.isPending}>
            {activateMutation.isPending ? "Activating..." : "Create Account Password"}
          </Button>
          {!token && (
            <p className="text-destructive text-sm text-center">Invalid invitation link (missing token).</p>
          )}
        </form>
      </Form>
    </div>
  );
}
