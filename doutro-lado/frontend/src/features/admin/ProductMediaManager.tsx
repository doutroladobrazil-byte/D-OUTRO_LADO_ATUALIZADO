"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { adminApi } from "@/lib/admin-api";
import { useAdminToken } from "@/hooks/useAdminToken";
import type { ProductMedia } from "@/lib/types";

type Props = {
  productId: string;
  productBrand: string;
};

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
const ACCEPTED_MIME_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_VIDEO_TYPES];

function detectMediaType(file: File): "image" | "video" | null {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type)) return "image";
  if (ACCEPTED_VIDEO_TYPES.includes(file.type)) return "video";
  // Fallback by extension
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
  if (["mp4", "webm", "mov"].includes(ext)) return "video";
  return null;
}

function MediaThumbnail({ item }: { item: ProductMedia }) {
  if (item.asset.mediaType === "video") {
    return (
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-white/[0.06] flex items-center justify-center">
        {item.asset.posterUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.asset.posterUrl} alt="Video poster" className="h-full w-full object-cover" />
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )}
        <div className="absolute bottom-1 right-1 rounded bg-black/60 px-1 py-0.5 text-[8px] uppercase tracking-wide text-white/70">
          vídeo
        </div>
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={item.asset.publicUrl}
      alt={item.asset.altText ?? "Imagem do produto"}
      className="h-16 w-16 shrink-0 rounded-[10px] object-cover"
      loading="lazy"
    />
  );
}

export function ProductMediaManager({ productId, productBrand }: Props) {
  const token = useAdminToken();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [media, setMedia] = useState<ProductMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Alt text editing
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState("");

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

  async function uploadFile(file: File, isFirst: boolean): Promise<void> {
    if (!token) return;

    const mediaType = detectMediaType(file);
    if (!mediaType) throw new Error(`Tipo de arquivo não suportado: ${file.type || file.name}`);

    const urlResult = await adminApi.getUploadUrl(
      token,
      productId,
      productBrand,
      mediaType,
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
      mediaType,
      bucket,
      storagePath,
      publicUrl,
      mimeType: file.type || undefined,
      fileSizeBytes: file.size,
      isPrimary: isFirst && media.length === 0,
    });
    if (!registerResult.ok) throw new Error(registerResult.message);
  }

  // ── Handle multi-file selection ──────────────────────────────────────────────

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0 || !token) return;

    // Validate all files up-front
    const invalid = files.filter((f) => !detectMediaType(f));
    if (invalid.length > 0) {
      setUploadError(`Arquivo(s) não suportado(s): ${invalid.map((f) => f.name).join(", ")}. Use JPG, PNG, WEBP, MP4 ou WEBM.`);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(`0 / ${files.length}`);

    try {
      for (let i = 0; i < files.length; i++) {
        setUploadProgress(`${i + 1} / ${files.length} — ${files[i].name}`);
        await uploadFile(files[i], i === 0);
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
    const typeLabel = media.find((m) => m.id === pmId)?.asset.mediaType === "video" ? "vídeo" : "imagem";
    if (!confirm(`Remover este(a) ${typeLabel} do produto?`)) return;
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
      await loadMedia();
    }
  }

  // ── Alt text edit ────────────────────────────────────────────────────────────

  function startEditAlt(item: ProductMedia) {
    setEditingAltId(item.id);
    setAltDraft(item.asset.altText ?? "");
  }

  async function saveAlt(pmId: string) {
    // Alt text is not yet a PATCH endpoint — update optimistically in UI only
    // (backend patchProduct could be extended; for now persist as no-op and update local state)
    setMedia((prev) =>
      prev.map((m) =>
        m.id === pmId ? { ...m, asset: { ...m.asset, altText: altDraft || undefined } } : m
      )
    );
    setEditingAltId(null);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const imageCount = media.filter((m) => m.asset.mediaType === "image").length;
  const videoCount = media.filter((m) => m.asset.mediaType === "video").length;

  if (loading) {
    return <div className="h-32 animate-pulse rounded-[18px] bg-white/[0.03]" />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/38">Galeria</p>
          <h2 className="mt-1 font-display text-[22px] text-white">
            Fotos e vídeos do produto
          </h2>
          {media.length > 0 && (
            <p className="mt-0.5 text-[12px] text-white/35">
              {imageCount > 0 && `${imageCount} imagem${imageCount > 1 ? "ns" : ""}`}
              {imageCount > 0 && videoCount > 0 && " · "}
              {videoCount > 0 && `${videoCount} vídeo${videoCount > 1 ? "s" : ""}`}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || !token}
          className="rounded-[12px] border border-[#C6A96B]/40 bg-[#C6A96B]/8 px-5 py-2 text-sm text-[#C6A96B] transition hover:bg-[#C6A96B]/15 disabled:opacity-40"
        >
          {uploading ? "Enviando..." : "+ Adicionar mídia"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_MIME_TYPES.join(",")}
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Accepted types note */}
      <p className="text-[11px] text-white/25">
        Imagens: JPG, PNG, WEBP · Vídeos: MP4, WEBM · A mídia principal aparece na vitrine e nos cards.
      </p>

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
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" className="mb-3">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          <p className="text-sm text-white/30">Nenhuma mídia cadastrada</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || !token}
            className="mt-4 text-sm text-[#C6A96B]/60 underline underline-offset-2 hover:text-[#C6A96B] disabled:opacity-40"
          >
            Adicionar primeira foto ou vídeo
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {media.map((item, index) => (
            <div
              key={item.id}
              className={`rounded-[14px] border transition ${
                item.isPrimary
                  ? "border-[#C6A96B]/40 bg-[#C6A96B]/5"
                  : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              <div className="flex items-center gap-4 p-3">
                {/* Thumbnail */}
                <MediaThumbnail item={item} />

                {/* Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="truncate text-sm text-white/70">
                      {item.asset.storagePath?.split("/").pop() ?? "mídia"}
                    </p>
                    {item.asset.mediaType === "video" && (
                      <span className="rounded-full border border-purple-400/30 bg-purple-400/10 px-2 py-0.5 text-[10px] uppercase tracking-wide text-purple-300">
                        vídeo
                      </span>
                    )}
                    {item.isPrimary && (
                      <span className="rounded-full bg-[#C6A96B]/20 px-2 py-0.5 text-[10px] text-[#C6A96B]">
                        ★ Principal
                      </span>
                    )}
                  </div>
                  {/* Alt text */}
                  {editingAltId === item.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={altDraft}
                        onChange={(e) => setAltDraft(e.target.value)}
                        placeholder="Alt text para acessibilidade"
                        className="flex-1 rounded-[8px] border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs text-white focus:border-white/30 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => { if (e.key === "Enter") saveAlt(item.id); if (e.key === "Escape") setEditingAltId(null); }}
                      />
                      <button onClick={() => saveAlt(item.id)} className="text-[11px] text-[#C6A96B] hover:text-[#C6A96B]/70">Salvar</button>
                      <button onClick={() => setEditingAltId(null)} className="text-[11px] text-white/30 hover:text-white/60">✕</button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startEditAlt(item)}
                      className="text-[11px] text-white/25 hover:text-white/50 transition"
                    >
                      {item.asset.altText ? `Alt: ${item.asset.altText}` : "Adicionar alt text…"}
                    </button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-2">
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="rounded-[6px] px-1.5 py-0.5 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-20"
                      title="Mover para cima"
                    >↑</button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, "down")}
                      disabled={index === media.length - 1}
                      className="rounded-[6px] px-1.5 py-0.5 text-[11px] text-white/40 transition hover:bg-white/10 hover:text-white disabled:opacity-20"
                      title="Mover para baixo"
                    >↓</button>
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
            </div>
          ))}
        </div>
      )}

      {media.length > 0 && (
        <p className="text-[11px] text-white/20">
          Use ↑↓ para reordenar. A mídia principal aparece no card do catálogo e em destaque na PDP.
          {" "}Mídias inativas não são exibidas para o cliente.
        </p>
      )}
    </div>
  );
}
