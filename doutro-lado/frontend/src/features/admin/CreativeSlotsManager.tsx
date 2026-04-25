"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, ToggleLeft, ToggleRight, Plus, Upload, Loader2, X } from "lucide-react";

type SlotRow = {
  id: string;
  slot_key: string;
  title: string;
  media_type: "image" | "video";
  public_url: string;
  mobile_public_url: string | null;
  poster_public_url: string | null;
  alt_text: string | null;
  link_href: string | null;
  display_order: number;
  is_active: boolean;
  start_at: string | null;
  end_at: string | null;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
};

const SLOT_KEY_SUGGESTIONS = [
  "home.hero",
  "home.category.bags",
  "home.category.wallets",
  "home.category.accessories",
  "home.category.belts",
  "home.category.small-leather-goods",
  "home.category.jewelry",
  "home.style.everyday",
  "home.style.evening",
  "home.style.gift",
  "home.style.travel",
  "home.style.minimal",
];

type CreateForm = {
  slotKey: string;
  title: string;
  altText: string;
  linkHref: string;
  displayOrder: string;
  startAt: string;
  endAt: string;
};

const EMPTY_FORM: CreateForm = {
  slotKey: "",
  title: "",
  altText: "",
  linkHref: "",
  displayOrder: "0",
  startAt: "",
  endAt: "",
};

export function CreativeSlotsManager({ token }: { token: string }) {
  const [rows, setRows] = useState<SlotRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  async function fetchRows() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/creative-slots", { headers: authHeader });
      if (res.ok) setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchRows(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleToggle(row: SlotRow) {
    await fetch(`/api/admin/creative-slots/${row.id}/toggle`, {
      method: "POST",
      headers: authHeader,
    });
    fetchRows();
  }

  async function handleDelete(row: SlotRow) {
    if (!confirm(`Excluir criativo "${row.title}"?`)) return;
    await fetch(`/api/admin/creative-slots/${row.id}`, {
      method: "DELETE",
      headers: authHeader,
    });
    fetchRows();
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("Selecione um arquivo de mídia."); return; }
    if (!form.slotKey || !form.title) { setError("Slot key e título são obrigatórios."); return; }

    setUploading(true);
    setError(null);

    try {
      // 1. Get signed upload URL
      const urlRes = await fetch("/api/admin/creative-slots/upload-url", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          slotKey: form.slotKey,
          fileName: file.name,
          mimeType: file.type,
          fileSizeBytes: file.size,
          variant: "main",
        }),
      });
      if (!urlRes.ok) {
        const err = await urlRes.json();
        setError(err.error ?? "Falha ao obter URL de upload.");
        return;
      }
      const { signedUrl, storagePath, publicUrl } = await urlRes.json();

      // 2. Upload directly to Supabase Storage
      const putRes = await fetch(signedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!putRes.ok) { setError("Falha ao enviar arquivo para o storage."); return; }

      // 3. Register metadata
      const mediaType = file.type.startsWith("video/") ? "video" : "image";
      const createRes = await fetch("/api/admin/creative-slots", {
        method: "POST",
        headers: { ...authHeader, "Content-Type": "application/json" },
        body: JSON.stringify({
          slotKey: form.slotKey,
          title: form.title,
          mediaType,
          storagePath,
          publicUrl,
          altText: form.altText || null,
          linkHref: form.linkHref || null,
          displayOrder: parseInt(form.displayOrder, 10) || 0,
          startAt: form.startAt || null,
          endAt: form.endAt || null,
          fileSizeBytes: file.size,
          mimeType: file.type,
        }),
      });
      if (!createRes.ok) { setError("Falha ao registrar metadados."); return; }

      setForm(EMPTY_FORM);
      setFile(null);
      setShowCreate(false);
      fetchRows();
    } catch {
      setError("Erro inesperado.");
    } finally {
      setUploading(false);
    }
  }

  function fmtSize(bytes: number | null) {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-white">Criativos</h1>
          <p className="mt-1 text-sm text-white/40">Imagens e vídeos usados nas seções da landing page.</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-[14px] border border-[#C6A96B]/30 bg-[rgba(198,169,107,0.08)] px-4 py-2.5 text-sm text-[#C6A96B] transition hover:bg-[rgba(198,169,107,0.15)]"
        >
          <Plus size={15} />
          Novo criativo
        </button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#0e0e0e] p-6">
            <button
              onClick={() => { setShowCreate(false); setError(null); setFile(null); setForm(EMPTY_FORM); }}
              className="absolute right-4 top-4 text-white/40 hover:text-white"
            >
              <X size={18} />
            </button>
            <h2 className="mb-5 font-display text-xl text-white">Novo criativo</h2>

            <form onSubmit={handleCreate} className="space-y-4">
              {/* Slot key */}
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Slot key</label>
                <input
                  list="slot-key-suggestions"
                  value={form.slotKey}
                  onChange={(e) => setForm((f) => ({ ...f, slotKey: e.target.value }))}
                  placeholder="home.hero"
                  className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6A96B]/40"
                />
                <datalist id="slot-key-suggestions">
                  {SLOT_KEY_SUGGESTIONS.map((k) => <option key={k} value={k} />)}
                </datalist>
              </div>

              {/* Title */}
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Título</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="Hero principal — verão 2026"
                  className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6A96B]/40"
                />
              </div>

              {/* File */}
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Arquivo de mídia</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="flex cursor-pointer items-center gap-3 rounded-[10px] border border-dashed border-white/15 bg-white/3 px-4 py-5 transition hover:border-[#C6A96B]/30"
                >
                  <Upload size={18} className="shrink-0 text-white/30" />
                  <span className="text-sm text-white/40">
                    {file ? file.name : "Clique para selecionar imagem ou vídeo"}
                  </span>
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/avif,video/mp4,video/webm"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </div>

              {/* Alt text */}
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Texto alternativo (acessibilidade)</label>
                <input
                  value={form.altText}
                  onChange={(e) => setForm((f) => ({ ...f, altText: e.target.value }))}
                  placeholder="Bolsas de couro artesanais brasileiras"
                  className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6A96B]/40"
                />
              </div>

              {/* Link href */}
              <div>
                <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Link (opcional)</label>
                <input
                  value={form.linkHref}
                  onChange={(e) => setForm((f) => ({ ...f, linkHref: e.target.value }))}
                  placeholder="/brands/moda"
                  className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6A96B]/40"
                />
              </div>

              {/* Display order + schedule */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Ordem</label>
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))}
                    className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6A96B]/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Início</label>
                  <input
                    type="datetime-local"
                    value={form.startAt}
                    onChange={(e) => setForm((f) => ({ ...f, startAt: e.target.value }))}
                    className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6A96B]/40"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[11px] uppercase tracking-widest text-white/40">Fim</label>
                  <input
                    type="datetime-local"
                    value={form.endAt}
                    onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value }))}
                    className="w-full rounded-[10px] border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6A96B]/40"
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={uploading}
                className="flex w-full items-center justify-center gap-2 rounded-[14px] bg-[#C6A96B] py-3 text-sm font-medium text-black transition hover:bg-[#d4b87a] disabled:opacity-50"
              >
                {uploading ? <><Loader2 size={15} className="animate-spin" /> Enviando…</> : "Criar criativo"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex items-center gap-2 py-12 text-white/30">
          <Loader2 size={18} className="animate-spin" />
          Carregando…
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] py-16 text-center text-sm text-white/30">
          Nenhum criativo registrado ainda.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/8">
          <table className="w-full text-sm">
            <thead className="border-b border-white/8 bg-white/[0.03]">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/30">Prévia</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/30">Slot / Título</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/30">Tipo</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/30">Tamanho</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-widest text-white/30">Status</th>
                <th className="px-4 py-3 text-right text-[11px] uppercase tracking-widest text-white/30">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {rows.map((row) => (
                <tr key={row.id} className="transition hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    {row.media_type === "video" ? (
                      <video src={row.public_url} className="h-10 w-16 rounded object-cover" muted />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={row.public_url} alt="" className="h-10 w-16 rounded object-cover" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-white">{row.title}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-white/35">{row.slot_key}</p>
                  </td>
                  <td className="px-4 py-3 text-white/50">{row.media_type}</td>
                  <td className="px-4 py-3 text-white/50">{fmtSize(row.file_size_bytes)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] ${row.is_active ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-white/30"}`}>
                      {row.is_active ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(row)}
                        title={row.is_active ? "Desativar" : "Ativar"}
                        className="rounded-lg p-1.5 text-white/40 transition hover:bg-white/8 hover:text-white"
                      >
                        {row.is_active ? <ToggleRight size={16} className="text-emerald-400" /> : <ToggleLeft size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(row)}
                        title="Excluir"
                        className="rounded-lg p-1.5 text-white/40 transition hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
