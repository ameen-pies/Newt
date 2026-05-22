import { useRef, useCallback, useEffect } from "react";
import { useAppStore } from "@/stores/app";
import { sendAudio, sendScreenFrame } from "@/lib/api";

const SCREEN_CAPTURE_INTERVAL = 5000; // 5 seconds

export function useAudioCapture() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { isListening, setListening } = useAppStore();

  const startListening = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        chunksRef.current = [];

        if (blob.size > 1000) {
          try {
            await sendAudio(blob);
          } catch (e) {
            console.error("Audio send error:", e);
          }
        }
      };

      // Record in 5-second chunks
      mediaRecorder.start();
      const interval = setInterval(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
          mediaRecorder.start();
        }
      }, 5000);

      mediaRecorderRef.current = mediaRecorder;
      setListening(true);

      // Store cleanup
      (mediaRecorder as any)._cleanup = () => {
        clearInterval(interval);
        stream.getTracks().forEach((t) => t.stop());
      };
    } catch (e) {
      console.error("Microphone access error:", e);
    }
  }, [setListening]);

  const stopListening = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state === "recording") {
      mr.stop();
      (mr as any)._cleanup?.();
    }
    setListening(false);
  }, [setListening]);

  return { isListening, startListening, stopListening };
}

export function useScreenCapture() {
  const intervalRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { isScreenSharing, setScreenSharing } = useAppStore();

  const startCapture = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 1 },
      });

      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();
      videoRef.current = video;

      const canvas = document.createElement("canvas");
      canvasRef.current = canvas;

      // Capture frame every 5 seconds
      intervalRef.current = window.setInterval(async () => {
        if (!videoRef.current || !canvasRef.current) return;

        canvas.width = video.videoWidth || 1280;
        canvas.height = video.videoHeight || 720;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.5);
        const base64 = dataUrl.split(",")[1];

        try {
          await sendScreenFrame(base64);
        } catch (e) {
          console.error("Screen frame error:", e);
        }
      }, SCREEN_CAPTURE_INTERVAL);

      setScreenSharing(true);

      // Handle user stopping share
      stream.getVideoTracks()[0].onended = () => stopCapture();
    } catch (e) {
      console.error("Screen capture error:", e);
    }
  }, [setScreenSharing]);

  const stopCapture = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current = null;
    }
    setScreenSharing(false);
  }, [setScreenSharing]);

  useEffect(() => {
    return () => stopCapture();
  }, [stopCapture]);

  return { isScreenSharing, startCapture, stopCapture };
}
