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
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
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

  // ── Upload single file ───────────────────────────────────────────────────────

  async function uploadFile(file: File, isFirst: boolean): Promise<boolean> {
    if (!token) return false;

    const urlResult = await adminApi.getUploadUrl(
      token,
      productId,
      productBrand,
      "image",
      file.name
    );
    if (!urlResult.ok) throw new Error(urlResult.message);

    const { signedUrl, storagePath, bucket, publicUrl } = urlResult.data;

    const uploadRes = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type || "application/octet-stream" },
      body: file,
    });
    if (!uploadRes.ok) {
      throw new Error(`Upload falhou: ${uploadRes.status} ${uploadRes.statusText}`);
    }

    const registerResult = await adminApi.registerMedia(token, {
      productId,
      brand: productBrand,
      mediaType: "image",
      bucket,
      storagePath,
      publicUrl,
      mimeType: file.type || undefined,
      fileSizeBytes: file.size,
      isPrimary: isFirst,
    });
    if (!registerResult.ok) throw new Error(registerResult.message);

    return true;
  }

  // ── Handle multi-file selection ──────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !token) return;

    setUploading(true);
    setUploadError(null);
    setUploadProgress(`0 / ${files.length}`);

    try {
      const currentIsEmpty = media.length === 0;
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`${i + 1} / ${files.length} — ${files[i].name}`);
        await uploadFile(files[i], currentIsEmpty && i === 0);
      }
      await loadMedia();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Falha no upload");
    } finally {
      setUploading(false);
      setUploadProgress(null);
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

  // ── Reorder ──────────────────────────────────────────────────────────────────

  async function moveItem(index: number, direction: "up" | "down") {
    if (!token) return;
    const next = [...media];
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= next.length) return;
    [next[index], next[swap]] = [next[swap], next[index]];
    setMedia(next);
    setActionError(null);
    const result = await adminApi.reorderMedia(token, productId, next.map((m) => m.id));
    if (!result.ok) {
      setActionError(result.message);
      // revert on failure
      await loadMedia();
    }
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
          {uploading ? "Enviando..." : "+ Adicionar imagens"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
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

      {/* Upload progress */}
      {uploading && uploadProgress && (
        <div className="flex items-center gap-3 rounded-[12px] border border-[#C6A96B]/20 bg-[#C6A96B]/5 px-4 py-3">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#C6A96B] border-t-transparent" />
          <span className="text-sm text-[#C6A96B]/80">
            Enviando {uploadProgress}...
          </span>
        </div>
      )}

      {/* Media list */}
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
        <div className="space-y-2">
          {media.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 rounded-[14px] border p-3 transition ${
                item.isPrimary
                  ? "border-[#C6A96B]/40 bg-[#C6A96B]/5"
                  : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              {/* Thumbnail */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.asset.publicUrl}
                alt={item.asset.altText ?? "Imagem do produto"}
                className="h-16 w-16 flex-shrink-0 rounded-[10px] object-cover"
                loading="lazy"
              />

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-white/70">{item.asset.storagePath?.split("/").pop() ?? "imagem"}</p>
                {item.isPrimary && (
                  <span className="mt-0.5 inline-block rounded-full bg-[#C6A96B]/20 px-2 py-0.5 text-[10px] text-[#C6A96B]">
                    Principal
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-shrink-0 items-center gap-2">
                {/* Reorder */}
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => moveItem(index, "up")}
                    disabled={index === 0}
                    className="rounded-[6px] px-1.5 py-0.5 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-20"
                    title="Mover para cima"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, "down")}
                    disabled={index === media.length - 1}
                    className="rounded-[6px] px-1.5 py-0.5 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-20"
                    title="Mover para baixo"
                  >
                    ↓
                  </button>
                </div>

                {!item.isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(item.id)}
                    className="rounded-[8px] border border-[#C6A96B]/30 px-3 py-1.5 text-[11px] text-[#C6A96B] transition hover:bg-[#C6A96B]/15"
                  >
                    Principal
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleDelete(item.id, item.asset.id)}
                  className="rounded-[8px] border border-red-400/20 px-3 py-1.5 text-[11px] text-red-400 transition hover:bg-red-400/10"
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
          {media.length} {media.length === 1 ? "imagem" : "imagens"}.
          Arraste ↑↓ para reordenar. A imagem principal é exibida na vitrine.
        </p>
      )}
    </div>
  );
}
