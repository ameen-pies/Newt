import { useState } from "react";
import { useAppStore, AvatarConfig } from "@/stores/app";

const VOICE_OPTIONS = [
  { id: "deep", label: "Deep" },
  { id: "sarcastic", label: "Sarcastic" },
  { id: "soft", label: "Soft" },
  { id: "dynamic", label: "Dynamic" },
];

const ROOM_OPTIONS = [
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "minimalist", label: "Minimalist" },
  { id: "cozy", label: "Cozy" },
];

const SKIN_COLORS = ["#f5d0a9", "#c68642", "#8d5524", "#ffdbac", "#e0ac69", "#503335"];
const HAIR_COLORS = ["#3b2f2f", "#090806", "#b55239", "#d6c4c2", "#ceb888", "#a55728"];

export function SetupScreen() {
  const { setSetup } = useAppStore();
  const [voice, setVoice] = useState("dynamic");
  const [room, setRoom] = useState("cyberpunk");
  const [avatar, setAvatar] = useState<AvatarConfig>({
    body_type: "default",
    skin_color: "#f5d0a9",
    hair_style: "short",
    hair_color: "#3b2f2f",
    outfit: "casual",
  });

  const handleStart = () => {
    setSetup(avatar, voice, room);
  };

  return (
    <div className="fixed inset-0 bg-neuro-bg flex items-center justify-center z-50">
      <div className="glass-strong p-8 w-[480px] max-h-[90vh] overflow-y-auto">
        <h1 className="text-2xl font-bold text-neuro-accent mb-1">
          Character Select
        </h1>
        <p className="text-sm text-neuro-muted mb-6">
          Configure your AI companion
        </p>

        {/* Avatar preview placeholder */}
        <div className="w-full h-48 rounded-lg bg-neuro-glass border border-neuro-border flex items-center justify-center mb-6">
          <div className="text-center">
            <div
              className="w-16 h-16 rounded-full mx-auto mb-2"
              style={{ backgroundColor: avatar.skin_color }}
            />
            <p className="text-xs text-neuro-muted">Avatar Preview</p>
          </div>
        </div>

        {/* Skin color */}
        <div className="mb-4">
          <label className="text-sm text-neuro-muted mb-2 block">
            Skin Tone
          </label>
          <div className="flex gap-2">
            {SKIN_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setAvatar({ ...avatar, skin_color: color })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  avatar.skin_color === color
                    ? "border-neuro-accent scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Hair color */}
        <div className="mb-4">
          <label className="text-sm text-neuro-muted mb-2 block">
            Hair Color
          </label>
          <div className="flex gap-2">
            {HAIR_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => setAvatar({ ...avatar, hair_color: color })}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  avatar.hair_color === color
                    ? "border-neuro-accent scale-110"
                    : "border-transparent"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Voice persona */}
        <div className="mb-4">
          <label className="text-sm text-neuro-muted mb-2 block">
            Voice Persona
          </label>
          <div className="grid grid-cols-2 gap-2">
            {VOICE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setVoice(opt.id)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  voice === opt.id
                    ? "border-neuro-accent bg-neuro-accent/20 text-neuro-accent"
                    : "border-neuro-border text-neuro-muted hover:border-neuro-accent/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Room style */}
        <div className="mb-6">
          <label className="text-sm text-neuro-muted mb-2 block">
            Room Style
          </label>
          <div className="grid grid-cols-3 gap-2">
            {ROOM_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setRoom(opt.id)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all ${
                  room === opt.id
                    ? "border-neuro-accent bg-neuro-accent/20 text-neuro-accent"
                    : "border-neuro-border text-neuro-muted hover:border-neuro-accent/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start button */}
        <button
          onClick={handleStart}
          className="w-full py-3 rounded-lg bg-neuro-accent text-white font-semibold hover:bg-neuro-accent/80 transition-colors glow"
        >
          Initiate Synapse
        </button>
      </div>
    </div>
  );
}
