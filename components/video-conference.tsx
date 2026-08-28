"use client";

import React, { useEffect, useRef } from "react";

interface VideoConferenceProps {
  roomId: string;
  isHost?: boolean;
  onLeave: () => void;
  userId?: string;
  userName?: string;
}

export default function VideoConference({ roomId, isHost, onLeave, userId, userName }: VideoConferenceProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let zp: any = null;

    const initZego = async () => {
      const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt");

      const appID = Number(process.env.NEXT_PUBLIC_ZEGO_APP_ID) || 0;
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET || "";

      if (!appID || !serverSecret) {
        console.error("ZegoCloud App ID or Server Secret is missing in .env");
      }

      const uid = userId || Date.now().toString();
      const uname = userName || (isHost ? "Admin" : "Attendee " + uid.slice(-4));

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomId,
        uid,
        uname
      );

      zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: containerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        turnOnMicrophoneWhenJoining: false,
        turnOnCameraWhenJoining: false,
        showMyCameraToggleButton: true,
        showMyMicrophoneToggleButton: true,
        showAudioVideoSettingsButton: true,
        showScreenSharingButton: isHost ? true : false,
        onLeaveRoom: () => {
          onLeave();
        },
        showLeaveRoomConfirmDialog: false,
      });
    };

    initZego();

    return () => {
      if (zp && typeof zp.destroy === 'function') {
        zp.destroy();
      }
    };
  }, [roomId, isHost, onLeave, userId, userName]);

  return (
    <div
      className="w-full h-full min-h-screen bg-slate-900"
      ref={containerRef}
    />
  );
}
