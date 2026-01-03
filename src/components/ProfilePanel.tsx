"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";

type ProfilePanelProps = {
  userId: string;
  initialUsername: string;
  email?: string | null;
  initialAvatarUrl?: string | null;
  showNovoJogo?: boolean;
};

export function ProfilePanel({
  userId,
  initialUsername,
  email,
  initialAvatarUrl,
  showNovoJogo = false,
}: ProfilePanelProps) {
  const router = useRouter();
  const supabase = createBrowserSupabaseClient();
  const [username, setUsername] = useState(initialUsername);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl ?? null);
  const [pendingAvatar, setPendingAvatar] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const maxAvatarSizeBytes = 2 * 1024 * 1024;
  const allowedAvatarTypes = ["image/jpeg", "image/png", "image/webp"];

  async function handleSaveUsername() {
    setSaving(true);
    setStatus(null);
    const { error } = await supabase.auth.updateUser({
      data: { username },
    });
    if (error) {
      setStatus(error.message);
    } else {
      setStatus("Nome atualizado.");
    }
    setSaving(false);
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setPendingAvatar(null);
      return;
    }

    if (!allowedAvatarTypes.includes(file.type)) {
      setPendingAvatar(null);
      setStatus("Formato invalido. Use JPG, PNG ou WEBP.");
      return;
    }

    if (file.size > maxAvatarSizeBytes) {
      setPendingAvatar(null);
      setStatus("Arquivo muito grande. Maximo 2MB.");
      return;
    }

    setPendingAvatar(file);
    setStatus(null);
  }

  async function handleAvatarUpload() {
    if (!pendingAvatar) return;

    setUploading(true);
    setStatus(null);

    const fileExt = pendingAvatar.name.split(".").pop()?.toLowerCase() || "png";
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, pendingAvatar, { upsert: true });

    if (uploadErr) {
      setStatus(uploadErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const publicUrl = data.publicUrl;

    const { error: updateErr } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateErr) {
      setStatus(updateErr.message);
    } else {
      setAvatarUrl(publicUrl);
      setStatus("Foto atualizada.");
      setPendingAvatar(null);
      router.refresh();
    }

    setUploading(false);
  }

  return (
    <div className="space-y-5 rounded-2xl bg-white p-6 text-left text-zinc-900 shadow-xl shadow-emerald-900/25 ring-1 ring-emerald-50">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-2xl border border-emerald-200/50 bg-emerald-50">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Foto de perfil"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs font-semibold text-emerald-700">
              Sem foto
            </div>
          )}
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-600">Meu Perfil</p>
          <p className="text-base font-semibold text-zinc-900">
            {email || "Conta autenticada"}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">Nome de usuario</label>
        <div className="mt-1 flex flex-wrap gap-2">
          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="min-w-[220px] flex-1 rounded-lg border border-emerald-100 bg-white px-3 py-2 text-zinc-900 outline-none ring-emerald-200 transition focus:border-emerald-400 focus:ring"
          />
          <button
            type="button"
            onClick={handleSaveUsername}
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">Foto de perfil</label>
        <div className="mt-2 flex flex-wrap gap-2">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="min-w-[220px] flex-1 text-sm text-zinc-700 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-emerald-500"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={handleAvatarUpload}
            disabled={uploading || !pendingAvatar}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {uploading ? "Enviando..." : "Enviar foto"}
          </button>
        </div>
        <p className="mt-2 text-xs text-emerald-700">JPG ou PNG, ate 2MB.</p>
      </div>

      {status && <p className="text-xs text-emerald-700">{status}</p>}

      {showNovoJogo && (
        <a
          href="/novo-jogo"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-900/30 transition hover:-translate-y-0.5 hover:bg-emerald-600"
        >
          Ir para novo jogo
        </a>
      )}
    </div>
  );
}
