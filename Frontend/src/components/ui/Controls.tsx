import { useAudioCapture, useScreenCapture } from "@/hooks/useMediaCapture";

export function Controls() {
  const { isListening, startListening, stopListening } = useAudioCapture();
  const { isScreenSharing, startCapture, stopCapture } = useScreenCapture();

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
      {/* Mic toggle */}
      <button
        onClick={isListening ? stopListening : startListening}
        className={`glass px-4 py-2 rounded-lg text-sm transition-all ${
          isListening
            ? "border-red-500/50 text-red-400 bg-red-500/10"
            : "border-neuro-border text-neuro-muted hover:border-neuro-accent/50"
        }`}
      >
        {isListening ? "Stop Listening" : "Start Listening"}
      </button>

      {/* Screen share toggle */}
      <button
        onClick={isScreenSharing ? stopCapture : startCapture}
        className={`glass px-4 py-2 rounded-lg text-sm transition-all ${
          isScreenSharing
            ? "border-green-500/50 text-green-400 bg-green-500/10"
            : "border-neuro-border text-neuro-muted hover:border-neuro-accent/50"
        }`}
      >
        {isScreenSharing ? "Stop Sharing" : "Share Screen"}
      </button>
    </div>
  );
}
