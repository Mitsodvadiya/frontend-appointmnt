"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Hospital } from "lucide-react";

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
import { useAuth } from "@/hooks/use-auth";

const resetPasswordSchema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const { resetPasswordMutation } = useAuth();
  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(data: ResetPasswordValues) {
    // In a real app, assuming the token comes from URL, we would read it via useSearchParams
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    
    if (!token) {
      alert("Missing token");
      return;
    }

    resetPasswordMutation.mutate({
      token,
      newPassword: data.password,
    });
  }

  const isSuccess = resetPasswordMutation.isSuccess;

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
        <h2 className="text-3xl font-bold tracking-tight">Set new password</h2>
        <p className="text-muted-foreground">
          {isSuccess 
            ? "Your password has been successfully reset. You can now log in."
            : "Your new password must be different from previous used passwords."}
        </p>
      </div>

      {!isSuccess ? (
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

            <Button 
              type="submit" 
              className="w-full text-base py-6" 
              size="lg"
              disabled={resetPasswordMutation.isPending}
            >
              {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <Button asChild className="w-full text-base py-6" size="lg">
            <Link href="/login">Continue to Log in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
