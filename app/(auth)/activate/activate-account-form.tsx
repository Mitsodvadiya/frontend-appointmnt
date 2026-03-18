"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Hospital, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";

const activateSchema = z.object({
  terms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions to activate your account",
  }),
});

type ActivateValues = z.infer<typeof activateSchema>;

export default function ActivateAccountForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();
  const { activateMutation } = useAuth();

  const form = useForm<ActivateValues>({
    resolver: zodResolver(activateSchema),
    defaultValues: {
      terms: false,
    },
  });

  function onSubmit(data: ActivateValues) {
    if (!token) {
      alert("Invalid activation link.");
      return;
    }
    activateMutation.mutate(token);
  }

  const isActivated = activateMutation.isSuccess;

  if (isActivated) {
    return (
      <div className="flex flex-col gap-6 text-center items-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Account Activated!</h2>
          <p className="text-muted-foreground max-w-sm mx-auto">
            Your account has been successfully verified. You can now proceed to set up your clinic.
          </p>
        </div>
        <Button onClick={() => router.push("/onboarding")} className="w-full text-base py-6 mt-4" size="lg">
          Continue to Onboarding
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
        <h2 className="text-3xl font-bold tracking-tight">Activate Account</h2>
        <p className="text-muted-foreground">
          You're almost there! Review our terms and conditions to activate your account.
        </p>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-600 mb-4 h-48 overflow-y-auto">
        <h3 className="font-semibold text-slate-900 mb-2">Terms of Service Summary</h3>
        <p className="mb-2">1. Acceptance of Terms: By accessing and using ClinicQ, you agree to comply with our policies.</p>
        <p className="mb-2">2. Data Privacy: We ensure the confidentiality of your clinic and patient records in accordance with standard medical compliance requirements.</p>
        <p className="mb-2">3. User Responsibilities: You are responsible for maintaining the security of your account and passwords.</p>
        <p>4. Service Usage: This service is intended for managing clinic queues and related operations solely.</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="terms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-sm">
                    I have read and agree to the full Terms and Conditions and Privacy Policy.
                  </FormLabel>
                   <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full text-base py-6" 
            size="lg" 
            disabled={!token || activateMutation.isPending}
          >
            {activateMutation.isPending ? "Activating..." : "Activate Account"}
          </Button>
          {!token && (
            <p className="text-destructive text-sm text-center">Invalid activation link (missing token).</p>
          )}
        </form>
      </Form>
    </div>
  );
}
