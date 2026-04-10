"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";
import { useAdminToken } from "@/hooks/useAdminToken";
import type { ProductMedia } from "@/lib/types";

type Props = {
  productId: string;
  productBrand: string;
};

export function ProductMediaManager({ productId, productBrand }: Props) {
  const token = useAdminToken();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadMedia = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const result = await adminApi.listMedia(token, productId);
    if (result.ok) setMedia(result.data);
    setLoading(false);
  }, [token, productId]);

  useEffect(() => {
    if (token) loadMedia();
  }, [token, loadMedia]);

  // ── Upload flow ──────────────────────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Get signed upload URL from backend
      const urlResult = await adminApi.getUploadUrl(
        token,
        productId,
        productBrand,
        "image",
        file.name
      );
      if (!urlResult.ok) throw new Error(urlResult.message);

      const { signedUrl, storagePath, bucket, publicUrl } = urlResult.data;

      // 2. Upload file directly to Supabase Storage via signed URL
      const uploadRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!uploadRes.ok) {
        throw new Error(`Upload falhou: ${uploadRes.status} ${uploadRes.statusText}`);
      }

      // 3. Register asset in DB
      const registerResult = await adminApi.registerMedia(token, {
        productId,
        brand: productBrand,
        mediaType: "image",
        bucket,
        storagePath,
        publicUrl,
        mimeType: file.type || undefined,
        fileSizeBytes: file.size,
        isPrimary: media.length === 0,  // first image becomes primary automatically
      });
      if (!registerResult.ok) throw new Error(registerResult.message);

      // Reload media list
      await loadMedia();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
      // Reset input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // ── Set primary ──────────────────────────────────────────────────────────────

  async function handleSetPrimary(pmId: string) {
    if (!token) return;
    setActionError(null);
    const result = await adminApi.setPrimary(token, productId, pmId);
    if (!result.ok) { setActionError(result.message); return; }
    setMedia((prev) =>
      prev.map((m) => ({ ...m, isPrimary: m.id === pmId }))
    );
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  async function handleDelete(pmId: string, assetId: string) {
    if (!token) return;
    if (!confirm("Remover esta imagem do produto?")) return;
    setActionError(null);
    const result = await adminApi.deleteMedia(token, assetId, productId);
    if (!result.ok) { setActionError(result.message); return; }
    setMedia((prev) => prev.filter((m) => m.id !== pmId));
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="h-32 animate-pulse rounded-[18px] bg-white/[0.03]" />
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">Mídia</p>
          <h2 className="mt-1 font-display text-[22px] text-white">
            Imagens do produto
          </h2>
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !token}
          className="rounded-[12px] border border-[#C6A96B]/40 bg-[#C6A96B]/8 px-5 py-2 text-sm text-[#C6A96B] transition hover:bg-[#C6A96B]/15 disabled:opacity-40"
        >
          {uploading ? "Enviando..." : "+ Adicionar imagem"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Errors */}
      {uploadError && (
        <p className="rounded-[12px] border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-400">
          {uploadError}
        </p>
      )}
      {actionError && (
        <p className="rounded-[12px] border border-red-400/25 bg-red-400/5 px-4 py-3 text-sm text-red-400">
          {actionError}
        </p>
      )}

      {/* Upload progress indicator */}
      {uploading && (
        <div className="flex items-center gap-3 rounded-[12px] border border-[#C6A96B]/20 bg-[#C6A96B]/5 px-4 py-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C6A96B] border-t-transparent" />
          <span className="text-sm text-[#C6A96B]/80">Enviando imagem para Supabase Storage...</span>
        </div>
      )}

      {/* Media grid */}
      {media.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[18px] border border-dashed border-white/10 bg-white/[0.02] py-12 text-center">
          <p className="text-sm text-white/30">Nenhuma imagem cadastrada</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !token}
            className="mt-4 text-sm text-[#C6A96B]/60 underline underline-offset-2 hover:text-[#C6A96B] disabled:opacity-40"
          >
            Adicionar primeira imagem
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {media.map((item) => (
            <div
              key={item.id}
              className={`group relative overflow-hidden rounded-[16px] border transition ${
                item.isPrimary
                  ? "border-[#C6A96B]/50 ring-1 ring-[#C6A96B]/30"
                  : "border-white/8 hover:border-white/20"
              } bg-white/[0.03]`}
            >
              {/* Image */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.asset.publicUrl}
                alt={item.asset.altText ?? "Imagem do produto"}
                className="aspect-square w-full object-cover"
                loading="lazy"
              />

              {/* Primary badge */}
              {item.isPrimary && (
                <div className="absolute left-2 top-2 rounded-full bg-[#C6A96B] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-black">
                  Principal
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/70 px-2 py-2 opacity-0 transition group-hover:opacity-100">
                {!item.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(item.id)}
                    className="flex-1 rounded-[8px] bg-[#C6A96B]/20 px-2 py-1 text-[10px] text-[#C6A96B] hover:bg-[#C6A96B]/35 transition"
                    title="Definir como imagem principal"
                  >
                    Principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.asset.id)}
                  className="rounded-[8px] bg-red-400/15 px-2 py-1 text-[10px] text-red-400 hover:bg-red-400/30 transition"
                  title="Remover imagem"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <p className="text-[11px] text-white/25">
          {media.length} {media.length === 1 ? "imagem" : "imagens"} cadastrada{media.length !== 1 ? "s" : ""}.
          Passe o mouse sobre uma imagem para ver as ações.
        </p>
      )}
    </div>
  );
}
