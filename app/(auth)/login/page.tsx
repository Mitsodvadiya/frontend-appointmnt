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
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { loginMutation } = useAuth();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate({
      email: data.email,
      password: data.password,
    });
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
        <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
        <p className="text-muted-foreground">
          Enter your credentials to access your account.
        </p>
      </div>

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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center mb-1">
                  <FormLabel>Password</FormLabel>
                  <Link href="/forget-password" className="text-sm font-medium hover:text-primary hover:underline underline-offset-4">
                    Forgot Password?
                  </Link>
                </div>
                <FormControl>
                  <Input placeholder="Enter your password" type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="remember"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 py-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal text-sm">
                    Remember me for 30 days
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full text-base py-6" 
            size="lg"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Logging in..." : "Log In"}
          </Button>

          <div className="text-center text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="font-semibold underline underline-offset-4 hover:text-primary">
              Sign up
            </Link>
          </div>
        </form>
      </Form>
    </div>
  );
}
