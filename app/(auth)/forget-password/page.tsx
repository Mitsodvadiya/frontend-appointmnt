"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Hospital } from "lucide-react";

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

const forgetPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type ForgetPasswordValues = z.infer<typeof forgetPasswordSchema>;

export default function ForgetPasswordPage() {
  const { forgotPasswordMutation } = useAuth();
  const form = useForm<ForgetPasswordValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(data: ForgetPasswordValues) {
    forgotPasswordMutation.mutate(data.email);
  }

  const isSuccess = forgotPasswordMutation.isSuccess;

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
        <h2 className="text-3xl font-bold tracking-tight">Forgot password?</h2>
        <p className="text-muted-foreground">
          {isSuccess 
            ? "We've sent a password reset link to your email if it exists in our system."
            : "No worries, we'll send you reset instructions."}
        </p>
      </div>

      {!isSuccess ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your@email.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full text-base py-6" 
              size="lg"
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? "Sending..." : "Reset Password"}
            </Button>

            <div className="text-center text-sm pt-4 flex justify-center items-center">
              <Link href="/login" className="flex items-center gap-2 font-medium hover:text-primary group text-muted-foreground transition-colors">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to log in
              </Link>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          <div className="text-center text-sm pt-4 flex justify-center items-center">
            <Link href="/login" className="flex items-center gap-2 font-medium hover:text-primary group text-muted-foreground transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Back to log in
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
