"use client";

import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { Users, Loader2, Play, CheckCircle2, XCircle, SkipForward, Clock, UserCheck } from "lucide-react";
import { QueueService } from "@/services/queue.service";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface QueueGridViewProps {
  clinicId: string;
  doctorId: string;
  userRole: string;
  userId: string;
}

export function QueueGridView({ clinicId, doctorId, userRole, userId }: QueueGridViewProps) {
  const queryClient = useQueryClient();
  const [socket, setSocket] = useState<Socket | null>(null);

  const canManageTokens = userRole === "DOCTOR" && userId === doctorId;

  // 1. Fetch current queue session purely to get the queueId
  const { data: currentQueueRes, isLoading: isFetchingQueue } = useQuery({
    queryKey: ["currentQueue", clinicId, doctorId],
    queryFn: () => QueueService.getCurrentQueue(clinicId, doctorId),
    enabled: !!clinicId && !!doctorId,
  });

  const queueId = currentQueueRes?.data?.id;

  // 2. Establish Socket Connection and Listeners
  useEffect(() => {
    if (!queueId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
    const socketUrl = apiUrl.replace(/\/api\/?$/, ""); 
    
    const newSocket = io(socketUrl, { transports: ["websocket", "polling"] });

    newSocket.on("connect", () => newSocket.emit("join_queue", queueId));

    newSocket.on("queue_updated", () => {
      queryClient.invalidateQueries({ queryKey: ["queueDetails", queueId] });
      queryClient.invalidateQueries({ queryKey: ["currentQueue", clinicId, doctorId] });
    });

    setSocket(newSocket);
    return () => { newSocket.disconnect(); };
  }, [queueId, clinicId, doctorId, queryClient]);

  // 3. Fetch full queue details with tokens
  const { data: queueDetailsRes, isLoading: isFetchingDetails } = useQuery({
    queryKey: ["queueDetails", queueId],
    queryFn: () => QueueService.getQueueDetails(queueId!),
    enabled: !!queueId,
  });

  const queueDetails = queueDetailsRes?.data;
  const tokens = queueDetails?.tokens || [];
  
  // Categorize tokens
  const waitingTokens = tokens.filter((t: any) => t.status === "WAITING");
  const inProgressTokens = tokens.filter((t: any) => t.status === "IN_PROGRESS");
  const skippedTokens = tokens.filter((t: any) => t.status === "SKIPPED");
  const completedTokens = tokens.filter((t: any) => t.status === "COMPLETED");

  const currentToken = inProgressTokens[0]; // Grab the active token if it exists
  
  // Mutations
  const callNextMutation = useMutation({
    mutationFn: () => QueueService.callNextToken(queueId!, userId),
    onSuccess: () => toast.success("Called next patient!"),
    onError: (err: any) => toast.error(err.response?.data?.error || "Failed to call next token")
  });

  const completeMutation = useMutation({
    mutationFn: (tokenId: string) => QueueService.completeToken(tokenId, userId),
    onSuccess: () => toast.success("Token marked as completed"),
    onError: (err: any) => toast.error(err.response?.data?.error || "Action failed")
  });

  const skipMutation = useMutation({
    mutationFn: (tokenId: string) => QueueService.skipToken(tokenId, userId),
    onSuccess: () => toast.warning("Token marked as skipped"),
    onError: (err: any) => toast.error(err.response?.data?.error || "Action failed")
  });

  const cancelMutation = useMutation({
    mutationFn: (tokenId: string) => QueueService.cancelToken(tokenId, userId),
    onSuccess: () => toast.error("Token cancelled"),
    onError: (err: any) => toast.error(err.response?.data?.error || "Action failed")
  });

  const handleAction = (action: "COMPLETE" | "SKIP" | "CANCEL", tokenId: string) => {
    if (action === "COMPLETE") completeMutation.mutate(tokenId);
    if (action === "SKIP") skipMutation.mutate(tokenId);
    if (action === "CANCEL") cancelMutation.mutate(tokenId);
  };

  if (isFetchingQueue || isFetchingDetails) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-slate-200 shadow-sm mt-6">
        <Loader2 className="h-8 w-8 text-slate-300 animate-spin mb-4" />
        <p className="text-slate-500">Loading live queue dashboard...</p>
      </div>
    );
  }

  if (!queueDetails) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 flex flex-col items-center justify-center text-center mt-6">
        <Users className="h-12 w-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-medium text-slate-900">No active queue session</h3>
        <p className="mt-1 text-sm text-slate-500">The doctor's queue session has not been properly initialized.</p>
      </div>
    );
  }

  const renderTokenItem = (token: any, type: "WAITING" | "SKIPPED" | "COMPLETED") => {
    const patient = token.visit?.patient;
    return (
      <div key={token.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b last:border-0 hover:bg-slate-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg font-bold text-xl bg-slate-100 text-slate-700">
            {token.tokenNumber}
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">{patient?.name || "Unknown Patient"}</h4>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              {patient?.phone && <span>{patient.phone}</span>}
              {patient?.age && <span className="opacity-40">• {patient.age} yrs</span>}
              {patient?.gender && <span className="capitalize opacity-40">• {patient.gender.toLowerCase()}</span>}
              {token.visit?.reason && <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600 truncate max-w-[150px]">{token.visit.reason}</span>}
            </div>
          </div>
        </div>

        {canManageTokens && (
          <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100">
            {type === "WAITING" && (
              <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto" onClick={() => handleAction("CANCEL", token.id)} disabled={cancelMutation.isPending}>
                <XCircle className="w-4 h-4 mr-2" /> Cancel
              </Button>
            )}
            {type === "SKIPPED" && (
              <>
                <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-green-200 text-green-700 hover:bg-green-50" onClick={() => handleAction("COMPLETE", token.id)} disabled={completeMutation.isPending}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Complete
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 sm:flex-none text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleAction("CANCEL", token.id)} disabled={cancelMutation.isPending}>
                  <XCircle className="w-4 h-4 mr-1" /> Cancel
                </Button>
              </>
            )}
            {type === "COMPLETED" && (
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-none px-3 py-1">
                Finished
              </Badge>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-6 flex flex-col gap-8">
      
      {/* Top Section: Active Patient & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Token Prominent Display */}
        <Card className="lg:col-span-2 border-primary/20 shadow-md bg-gradient-to-br from-white to-primary/5">
          <CardHeader className="pb-3 border-b border-primary/10">
            <CardTitle className="flex items-center text-primary">
              <Play className="h-5 w-5 mr-2" fill="currentColor" />
              Current Token
              <Badge className="ml-auto bg-primary text-white shadow-none px-3 animate-pulse">In Progress</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 pb-6">
            {currentToken ? (
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="w-32 h-32 rounded-2xl bg-primary text-white flex items-center justify-center text-6xl font-black shadow-lg shadow-primary/30 shrink-0">
                  {currentToken.tokenNumber}
                </div>
                <div className="flex-1 space-y-3 w-full text-center sm:text-left">
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                    {currentToken.visit?.patient?.name || "Unknown Patient"}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm text-slate-600 font-medium">
                    {currentToken.visit?.patient?.phone && (
                      <span className="bg-white/80 px-3 py-1 rounded-md border border-primary/10">{currentToken.visit.patient.phone}</span>
                    )}
                    {currentToken.visit?.patient?.age && (
                      <span className="bg-white/80 px-3 py-1 rounded-md border border-primary/10">{currentToken.visit.patient.age} years old</span>
                    )}
                    {currentToken.visit?.patient?.gender && (
                      <span className="bg-white/80 px-3 py-1 rounded-md border border-primary/10 capitalize">{currentToken.visit.patient.gender.toLowerCase()}</span>
                    )}
                  </div>
                  {currentToken.visit?.reason && (
                    <div className="mt-4 p-3 bg-white/80 rounded-md border border-primary/10 text-slate-700 text-sm">
                      <span className="font-semibold block mb-1">Reason for visit:</span>
                      {currentToken.visit.reason}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Users className="h-16 w-16 mb-4 opacity-50" />
                <p className="text-xl font-medium text-slate-500">No Patient In Progress</p>
                <p className="text-sm mt-1">Please call the next patient to begin.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-white/50 border-t border-primary/10 pt-4 flex flex-col sm:flex-row gap-3">
             {canManageTokens ? (
               currentToken ? (
                 <>
                   <Button size="lg" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md text-base h-14" onClick={() => handleAction("COMPLETE", currentToken.id)} disabled={completeMutation.isPending}>
                     <CheckCircle2 className="h-5 w-5 mr-3" /> Complete
                   </Button>
                   <div className="flex gap-3 flex-1">
                      <Button variant="outline" size="lg" className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 h-14 font-semibold" onClick={() => handleAction("SKIP", currentToken.id)} disabled={skipMutation.isPending}>
                        <SkipForward className="h-4 w-4 mr-2" /> Skip
                      </Button>
                      <Button variant="outline" size="lg" className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-14 font-semibold" onClick={() => handleAction("CANCEL", currentToken.id)} disabled={cancelMutation.isPending}>
                        <XCircle className="h-4 w-4 mr-2" /> Cancel
                      </Button>
                   </div>
                 </>
               ) : (
                 <Button 
                   size="lg" 
                   className="w-full h-16 text-lg font-bold tracking-wide shadow-lg hover:shadow-xl transition-all" 
                   disabled={waitingTokens.length === 0 || callNextMutation.isPending}
                   onClick={() => callNextMutation.mutate()}
                 >
                   {callNextMutation.isPending ? <Loader2 className="mr-3 h-6 w-6 animate-spin" /> : <Play className="mr-3 h-6 w-6" fill="currentColor" />}
                   {waitingTokens.length === 0 ? "No Waiting Patients" : "Call Next Patient Now"}
                 </Button>
               )
             ) : (
                <div className="w-full flex items-center justify-center h-12 text-slate-500 text-sm font-medium">
                  Token controls are restricted to the assigned Doctor.
                </div>
             )}
          </CardFooter>
        </Card>

        {/* Total Waiting Card */}
        <Card className="shadow-sm border-slate-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-600 text-base font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col gap-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100">
              <span className="text-slate-600 font-medium">Total Waiting</span>
              <span className="text-3xl font-black text-slate-900">{waitingTokens.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 text-center">
                <span className="block text-xl font-bold text-emerald-700">{completedTokens.length}</span>
                <span className="text-xs font-semibold uppercase text-emerald-600 mt-1 block">Completed</span>
              </div>
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 text-center">
                <span className="block text-xl font-bold text-amber-700">{skippedTokens.length}</span>
                <span className="text-xs font-semibold uppercase text-amber-600 mt-1 block">Skipped</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lists Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Waiting List */}
        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="bg-slate-50/80 border-b border-slate-100 py-4">
            <CardTitle className="text-base font-semibold text-slate-800 flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-primary" />
                Waiting List
              </div>
              <Badge variant="secondary" className="bg-slate-200">{waitingTokens.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[400px] overflow-y-auto bg-white">
            {waitingTokens.length === 0 ? (
              <div className="p-10 text-center text-slate-400 font-medium h-full flex items-center justify-center">
                No patients waiting currently.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {waitingTokens.map((t: any) => renderTokenItem(t, "WAITING"))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skipped and Completed Layout Container */}
        <div className="flex flex-col gap-6">
          {/* Skipped List */}
          <Card className="shadow-sm border-slate-200 overflow-hidden flex-1">
            <CardHeader className="bg-amber-50/50 border-b border-amber-100 py-3">
              <CardTitle className="text-base font-semibold text-amber-800 flex items-center justify-between">
                <div className="flex items-center">
                  <SkipForward className="w-4 h-4 mr-2 text-amber-600" />
                  Skipped Patients
                </div>
                <Badge variant="secondary" className="bg-amber-200 text-amber-800">{skippedTokens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[220px] overflow-y-auto bg-white">
              {skippedTokens.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-medium text-sm">
                  No skipped patients.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {skippedTokens.map((t: any) => renderTokenItem(t, "SKIPPED"))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Completed List */}
          <Card className="shadow-sm border-slate-200 overflow-hidden flex-1">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 py-3">
              <CardTitle className="text-base font-semibold text-emerald-800 flex items-center justify-between">
                <div className="flex items-center">
                  <UserCheck className="w-4 h-4 mr-2 text-emerald-600" />
                  Completed Patients
                </div>
                <Badge variant="secondary" className="bg-emerald-200 text-emerald-800">{completedTokens.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 max-h-[180px] overflow-y-auto bg-white">
              {completedTokens.length === 0 ? (
                <div className="p-6 text-center text-slate-400 font-medium text-sm">
                  No completed patients yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {completedTokens.map((t: any) => renderTokenItem(t, "COMPLETED"))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
    </div>
  );
}
