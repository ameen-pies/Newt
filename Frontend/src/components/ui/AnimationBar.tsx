import { useAppStore } from "@/stores/app";

const ANIMATIONS = [
  { label: "Idle", path: "/animations/idle.fbx" },
  { label: "Mma Idle", path: "/animations/mma-idle.fbx" },
  { label: "Push Up", path: "/animations/pushup-idle.fbx" },
  { label: "Standard", path: "/animations/standard-idle.fbx" },
  { label: "Standing", path: "/animations/standing.fbx" },
  { label: "Rumba", path: "/animations/rumba.fbx" },
];

export function AnimationBar() {
  const testAnimation = useAppStore((s) => s.testAnimation);
  const setTestAnimation = useAppStore((s) => s.setTestAnimation);

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 glass-strong px-3 py-2 animate-slide-up">
      <span className="text-neuro-muted text-xs self-center mr-1">ANIM</span>
      {ANIMATIONS.map((anim) => (
        <button
          key={anim.path}
          onClick={() =>
            setTestAnimation(
              testAnimation === anim.path ? null : anim.path
            )
          }
          className={`px-2.5 py-1 rounded text-xs border transition-all ${
            testAnimation === anim.path
              ? "border-neuro-accent bg-neuro-accent/20 text-neuro-accent"
              : "border-neuro-border text-neuro-muted hover:border-neuro-accent/50"
          }`}
        >
          {anim.label}
        </button>
      ))}
    </div>
  );
}
