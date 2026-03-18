"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { UserPlus, Search, CheckCircle2, ArrowRight, Loader2 } from "lucide-react";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PatientService } from "@/services/patient.service";
import { AuthService } from "@/services/auth.service";
import { QueueService } from "@/services/queue.service";
import { useAppStore } from "@/store/use-app-store";

// Flow States
type Step = "SEARCH" | "PATIENT_FORM" | "VERIFY_OTP" | "SUCCESS";

// Mock Types
interface Patient {
  id: string;
  phone: string;
  name?: string;
  age?: number;
  weight?: number;
  gender?: "MALE" | "FEMALE" | "OTHER";
  address?: string;
}

// Schemas
const searchSchema = z.object({
  phone: z.string().min(10, "Valid phone number required").max(15),
});

const patientSchema = z.object({
  phone: z.string().min(10, "Valid phone number required"),
  name: z.string().min(2, "Name required"),
  age: z.string().optional(),
  weight: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
  address: z.string().optional(),
});

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export function AddPatientDialog() {
  const { user, clinic } = useAppStore();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("SEARCH");
  
  const [patient, setPatient] = useState<Patient | null>(null);
  const [initialPatientData, setInitialPatientData] = useState<Patient | null>(null);
  const [isExistingPatient, setIsExistingPatient] = useState(false);
  
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);

  // Forms
  const searchForm = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: { phone: "" },
  });

  const patientForm = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      phone: "",
      name: "",
      age: "",
      weight: "",
      gender: undefined,
      address: "",
    },
  });

  const otpForm = useForm<z.infer<typeof otpSchema>>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  // Handlers
  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setTimeout(() => {
        setStep("SEARCH");
        setPatient(null);
        setInitialPatientData(null);
        setIsExistingPatient(false);
        setPhone("");
        searchForm.reset();
        patientForm.reset();
        otpForm.reset();
        setGeneratedToken(null);
      }, 200);
    }
  };

  const onSearchSubmit = async (data: z.infer<typeof searchSchema>) => {
    setIsSearching(true);
    setPhone(data.phone);
    try {
      const response = await PatientService.searchByPhone(data.phone);
      
      if (response && response.data) {
        const foundPatient = response.data;
        setPatient(foundPatient as Patient);
        setInitialPatientData(foundPatient as Patient);
        setIsExistingPatient(true);
        patientForm.reset({
          phone: foundPatient.phone,
          name: foundPatient.name || "",
          age: (foundPatient.age !== undefined && foundPatient.age !== null) ? String(foundPatient.age) : "",
          weight: (foundPatient.weight !== undefined && foundPatient.weight !== null) ? String(foundPatient.weight) : "",
          gender: foundPatient.gender || undefined,
          address: foundPatient.address || "",
        });
        setStep("PATIENT_FORM");
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setPatient(null);
        setInitialPatientData(null);
        setIsExistingPatient(false);
        patientForm.reset({
          phone: data.phone,
          name: "",
          age: "",
          weight: "",
          gender: undefined,
          address: "",
        });
        setStep("PATIENT_FORM");
      } else {
        toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to search patient");
      }
    } finally {
      setIsSearching(false);
    }
  };

  const onGenerateToken = async () => {
    setIsSubmitting(true);
    try {
      if (!patient?.id || !user?.id || !clinic?.id) {
        toast.error("Missing critical data for token generation. Ensure you are logged in and in a clinic.");
        return;
      }

      const response = await QueueService.createToken({
        doctorId: user.id, // currently assumes logged in user is the doctor
        clinicId: clinic.id,
        patientId: patient.id,
        reason: "Routine Checkup",
        source: "WALK_IN"
      });
      
      setGeneratedToken(response.data?.tokenNumber || "TKN-??");
      setStep("SUCCESS");
      toast.success(response.message || "Token generated successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || "Failed to generate token");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onPatientSubmit = async (data: z.infer<typeof patientSchema>) => {
    setIsSubmitting(true);
    try {
      if (isExistingPatient) {
        // Check if data changed
        const isChanged = 
          data.name !== initialPatientData?.name ||
          (data.age ? Number(data.age) : undefined) !== initialPatientData?.age ||
          (data.weight ? Number(data.weight) : undefined) !== initialPatientData?.weight ||
          data.gender !== initialPatientData?.gender ||
          data.address !== initialPatientData?.address;

        if (isChanged) {
          const patientIdToUpdate = initialPatientData?.id || patient?.id;
          if (!patientIdToUpdate) throw new Error("Missing patient ID");
          
          await PatientService.sendUpdateOtp(patientIdToUpdate);
          
          setPatient({
            id: patientIdToUpdate,
            phone: data.phone,
            name: data.name,
            age: data.age ? Number(data.age) : undefined,
            weight: data.weight ? Number(data.weight) : undefined,
            gender: data.gender,
            address: data.address,
          });
          setStep("VERIFY_OTP");
          toast.success("Update OTP sent to " + data.phone);
        } else {
          // Direct to generate token for existing patient if not changed
          setPatient({
            id: initialPatientData?.id || patient?.id || "p_123",
            phone: data.phone,
            name: data.name,
            age: data.age ? Number(data.age) : undefined,
            weight: data.weight ? Number(data.weight) : undefined,
            gender: data.gender,
            address: data.address,
          });
          await onGenerateToken();
        }
      } else {
        // New patient - hit send-otp API first
        await AuthService.sendOtp(data.phone);
        
        setPatient({
          id: "p_new", // Temp ID until created
          phone: data.phone,
          name: data.name,
          age: data.age ? Number(data.age) : undefined,
          weight: data.weight ? Number(data.weight) : undefined,
          gender: data.gender,
          address: data.address,
        });
        setStep("VERIFY_OTP");
        toast.success("OTP sent to " + data.phone);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || error.response?.data?.message || (isExistingPatient ? "Failed to update patient" : "Failed to send OTP"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onOtpSubmit = async (data: z.infer<typeof otpSchema>) => {
    if (!patient) return;
    setIsSubmitting(true);
    try {
      if (isExistingPatient) {
        // Update flow
        const response = await PatientService.updateAndVerify(patient.id, {
          otp: data.otp,
          phone: patient.phone,
          name: patient.name || "Unknown",
          age: patient.age,
          weight: patient.weight,
          gender: patient.gender,
          address: patient.address,
        });

        if (response && response.patient) {
          setPatient(response.patient);
        }
        toast.success("Patient updated successfully!");
      } else {
        // Create flow
        const response = await PatientService.create({
          phone: patient.phone,
          otp: data.otp,
          name: patient.name || "Unknown",
          age: patient.age,
          weight: patient.weight,
          gender: patient.gender,
          address: patient.address,
        });
        
        if (response && response.data) {
          setPatient(response.data);
        }
        toast.success("Patient created successfully!");
      }
      
      await onGenerateToken();
    } catch (error: any) {
      otpForm.setError("otp", { message: error.response?.data?.error || error.response?.data?.message || "Failed to verify OTP" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Patient
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        {step === "SEARCH" && (
          <>
            <DialogHeader>
              <DialogTitle>Add Patient</DialogTitle>
              <DialogDescription>
                Search for an existing patient by phone number.
              </DialogDescription>
            </DialogHeader>
            <Form {...searchForm}>
              <form onSubmit={searchForm.handleSubmit(onSearchSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={searchForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSearching}>
                  {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                  {isSearching ? "Searching..." : "Search Patient"}
                </Button>
              </form>
            </Form>
          </>
        )}

        {step === "PATIENT_FORM" && (
          <>
            <DialogHeader>
              <DialogTitle>{isExistingPatient ? "Patient Details" : "New Patient Details"}</DialogTitle>
              <DialogDescription>
                {isExistingPatient 
                  ? "Verify or update the patient's information before generating a token." 
                  : `No patient found. Please create a new profile for ${phone}.`}
              </DialogDescription>
            </DialogHeader>
            <Form {...patientForm}>
              <form onSubmit={patientForm.handleSubmit(onPatientSubmit)} className="space-y-4 pt-2">
                <FormField
                  control={patientForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Patient Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={patientForm.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Enter age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={patientForm.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" placeholder="Enter weight" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={patientForm.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MALE">Male</SelectItem>
                          <SelectItem value="FEMALE">Female</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={patientForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter address details" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting 
                    ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                    : (isExistingPatient 
                        ? (patientForm.formState.isDirty ? "Update & Generate Token" : "Generate Token") 
                        : "Save & Send OTP")}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setStep("SEARCH")} className="w-full">
                  Cancel
                </Button>
              </form>
            </Form>
          </>
        )}

        {step === "VERIFY_OTP" && (
          <>
            <DialogHeader>
              <DialogTitle>Verify Mobile Number</DialogTitle>
              <DialogDescription>
                Please enter the 6-digit OTP sent to {phone}.
              </DialogDescription>
            </DialogHeader>
            <Form {...otpForm}>
              <form onSubmit={otpForm.handleSubmit(onOtpSubmit)} className="space-y-4 pt-4">
                <FormField
                  control={otpForm.control}
                  name="otp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>One-Time Password</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" maxLength={6} className="text-center tracking-widest text-lg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verify & Generate Token"}
                </Button>
              </form>
            </Form>
          </>
        )}

        {step === "SUCCESS" && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="bg-green-100 p-3 rounded-full">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <DialogTitle className="text-xl">Token Generated!</DialogTitle>
            <div className="flex flex-col items-center gap-1 my-2">
              <span className="text-sm text-slate-500">Your token number is</span>
              <span className="text-4xl font-extrabold text-primary tracking-tight">
                {generatedToken}
              </span>
              {patient && (
                <span className="text-sm font-medium mt-2">{patient.name}</span>
              )}
            </div>
            <Button onClick={() => handleOpenChange(false)} className="w-full mt-4">
              Close & return to Queue
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
