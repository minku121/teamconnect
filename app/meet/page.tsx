"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import VideoConference from "@/components/video-conference";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function MeetingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [meetingId, setMeetingId] = useState(searchParams.get("meetingId") || "");
  const [userName, setUserName] = useState("");
  const [hasJoined, setHasJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingId.trim() && userName.trim()) {
      setHasJoined(true);
    }
  };

  if (hasJoined) {
    return (
      <div className="fixed inset-0 w-full h-full z-40 bg-slate-900">
        <VideoConference 
          roomId={meetingId} 
          isHost={false} 
          userName={userName}
          onLeave={() => router.push("/")} 
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">Join Meeting</h1>
        
        <form onSubmit={handleJoin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Meeting ID
            </label>
            <Input 
              required
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">
              Your Name
            </label>
            <Input 
              required
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className="bg-slate-900 border-slate-700 text-white"
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 mt-6">
            Join Now
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function Meeting() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-slate-900"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>}>
      <MeetingContent />
    </Suspense>
  );
}