import { useState, useRef } from "react";
import { useAppStore, AvatarConfig } from "@/stores/app";
import { CHARACTERS } from "@/config/characters";
import { BUILTIN_VOICES } from "@/config/voices";
import { API_URL } from "@/lib/api";

export function SetupScreen() {
  const { setSetup, addCustomVoice, customVoices } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cloning, setCloning] = useState(false);

  const [voice, setVoice] = useState("dynamic");
  const [characterId, setCharacterId] = useState("newt-default");
  const [avatar, setAvatar] = useState<AvatarConfig>({
    body_type: "default",
    skin_color: "#f5d0a9",
    hair_style: "short",
    hair_color: "#3b2f2f",
    outfit: "casual",
  });

  const allVoices = [
    ...BUILTIN_VOICES,
    ...customVoices.map((v) => ({
      id: v.id,
      name: v.name,
      persona: "custom",
      type: "cloned" as const,
      description: "Cloned voice",
    })),
  ];

  const handleStart = () => {
    setSetup(avatar, voice, characterId);
  };

  const handleVoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCloning(true);
    try {
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("name", file.name.replace(/\.[^/.]+$/, ""));

      const res = await fetch(`${API_URL}/api/voice/clone`, {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        addCustomVoice({ id: data.id, name: data.name, filePath: data.file_path });
        setVoice(data.id);
      }
    } finally {
      setCloning(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="fixed inset-0 bg-neuro-bg flex items-center justify-center z-50">
      <div className="glass-strong p-8 w-[560px] max-h-[90vh] overflow-y-auto">
        <h1 className="text-2xl font-bold text-neuro-accent mb-1">Character Select</h1>
        <p className="text-sm text-neuro-muted mb-6">Configure your AI companion</p>

        {/* ── Character / Avatar ── */}
        <div className="mb-4">
          <label className="text-sm text-neuro-muted mb-2 block">Character Model</label>
          <div className="grid grid-cols-2 gap-2">
            {CHARACTERS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCharacterId(c.id)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                  characterId === c.id
                    ? "border-neuro-accent bg-neuro-accent/20 text-neuro-accent"
                    : "border-neuro-border text-neuro-muted hover:border-neuro-accent/50"
                }`}
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs opacity-60">{c.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Procedural avatar options ── */}
        {characterId === "newt-default" && (
          <>
            <div className="mb-4">
              <label className="text-sm text-neuro-muted mb-2 block">Skin Tone</label>
              <div className="flex gap-2">
                {["#f5d0a9", "#c68642", "#8d5524", "#ffdbac", "#e0ac69", "#503335"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAvatar({ ...avatar, skin_color: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      avatar.skin_color === color ? "border-neuro-accent scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="text-sm text-neuro-muted mb-2 block">Hair Color</label>
              <div className="flex gap-2">
                {["#3b2f2f", "#090806", "#b55239", "#d6c4c2", "#ceb888", "#a55728"].map((color) => (
                  <button
                    key={color}
                    onClick={() => setAvatar({ ...avatar, hair_color: color })}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      avatar.hair_color === color ? "border-neuro-accent scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Voice Persona ── */}
        <div className="mb-4">
          <label className="text-sm text-neuro-muted mb-2 block">Voice</label>
          <div className="grid grid-cols-2 gap-2">
            {allVoices.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setVoice(opt.id)}
                className={`px-3 py-2 rounded-lg text-sm border transition-all text-left ${
                  voice === opt.id
                    ? "border-neuro-accent bg-neuro-accent/20 text-neuro-accent"
                    : "border-neuro-border text-neuro-muted hover:border-neuro-accent/50"
                } ${opt.type === "cloned" ? "border-dashed" : ""}`}
              >
                <div className="font-medium">{opt.name}</div>
                <div className="text-xs opacity-60">{opt.description}</div>
              </button>
            ))}
          </div>

          {/* Clone voice upload */}
          <div className="mt-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              onChange={handleVoiceUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={cloning}
              className="w-full px-3 py-2 rounded-lg text-sm border border-dashed border-neuro-border text-neuro-muted hover:border-neuro-accent/50 hover:text-neuro-accent transition-all disabled:opacity-50"
            >
              {cloning ? "Cloning voice..." : "+ Upload voice sample to clone"}
            </button>
          </div>
        </div>

        {/* ── Start ── */}
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
