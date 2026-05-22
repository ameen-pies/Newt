import { Suspense } from "react";
import { Scene } from "@/components/3d/Scene";
import { ChatPanel } from "@/components/ui/ChatPanel";
import { CognitiveOverlay } from "@/components/ui/CognitiveOverlay";
import { SetupScreen } from "@/components/ui/SetupScreen";
import { Controls } from "@/components/ui/Controls";
import { useAppStore } from "@/stores/app";
import { useWebSocket } from "@/hooks/useWebSocket";

function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-neuro-bg flex items-center justify-center">
      <div className="text-neuro-accent text-lg animate-pulse">
        Initializing Newt...
      </div>
    </div>
  );
}

function AppContent() {
  // Initialize WebSocket connection
  useWebSocket();

  return (
    <div className="w-full h-full relative">
      {/* 3D Canvas */}
      <Suspense fallback={<LoadingScreen />}>
        <Scene />
      </Suspense>

      {/* UI Overlays */}
      <CognitiveOverlay />
      <ChatPanel />
      <Controls />
    </div>
  );
}

export default function App() {
  const { isSetup } = useAppStore();

  if (!isSetup) {
    return <SetupScreen />;
  }

  return <AppContent />;
}
