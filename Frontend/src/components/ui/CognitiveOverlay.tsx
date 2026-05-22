import { useAppStore } from "@/stores/app";
import { getMemoryStats } from "@/lib/api";
import { useEffect, useState } from "react";

export function CognitiveOverlay() {
  const { cognitiveState, wsConnected } = useAppStore();
  const [memoryNodes, setMemoryNodes] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getMemoryStats();
        setMemoryNodes(stats.total_nodes);
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute left-4 top-4 glass p-3 w-48 text-xs space-y-2">
      <h3 className="text-neuro-accent font-semibold text-sm">Cognition</h3>

      <div className="space-y-1">
        <div className="flex justify-between">
          <span className="text-neuro-muted">mood</span>
          <span className="text-neuro-text">{cognitiveState.mood}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neuro-muted">curiosity</span>
          <div className="w-16 h-1.5 bg-neuro-border rounded-full overflow-hidden">
            <div
              className="h-full bg-neuro-accent rounded-full transition-all"
              style={{ width: `${cognitiveState.curiosity * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-neuro-muted">energy</span>
          <div className="w-16 h-1.5 bg-neuro-border rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${cognitiveState.energy * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between">
          <span className="text-neuro-muted">focus</span>
          <span className="text-neuro-text">{cognitiveState.focus}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neuro-muted">memory</span>
          <span className="text-neuro-text">{memoryNodes} nodes</span>
        </div>

        <div className="flex justify-between">
          <span className="text-neuro-muted">ws</span>
          <span className={wsConnected ? "text-green-400" : "text-red-400"}>
            {wsConnected ? "connected" : "disconnected"}
          </span>
        </div>
      </div>
    </div>
  );
}
