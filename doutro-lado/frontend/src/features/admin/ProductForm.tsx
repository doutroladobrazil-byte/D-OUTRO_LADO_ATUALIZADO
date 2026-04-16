"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/admin-api";
import { useAdminToken } from "@/hooks/useAdminToken";
import type { AdminProductDetail, AdminCategory } from "@/lib/admin-api";

// =============================================================================
// Helpers
// =============================================================================

const WEIGHT_RANGES = ["100g-1kg", "1-3kg", "3-5kg", "5-10kg", "10-15kg", "15-20kg"] as const;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// =============================================================================
// Field components
// =============================================================================

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[11px] uppercase tracking-[0.22em] text-white/40 mb-1.5">
      {children}
    </label>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-[#C6A96B]/50 focus:bg-white/[0.06] ${props.className ?? ""}`}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-[12px] border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-[#C6A96B]/50 resize-y min-h-[80px] ${props.className ?? ""}`}
    />
  );
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  const { children, ...rest } = props;
  return (
    <select
      {...rest}
      className="w-full rounded-[12px] border border-white/10 bg-[#111] px-4 py-2.5 text-sm text-white outline-none transition focus:border-[#C6A96B]/50"
    >
      {children}
    </select>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] uppercase tracking-[0.3em] text-[#C6A96B]/70 mt-8 mb-4 pb-2 border-b border-white/5">
      {children}
    </h3>
  );
}

// =============================================================================
// Form state
// =============================================================================

type FormData = {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  subcategoryId: string;
  shortDescription: string;
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  material: string;
  dimensions: string;
  origin: string;
  careInstructions: string;
  weightRange: string;
  weightGrams: string;
  retailPriceBRL: string;
  wholesalePriceBRL: string;
  wholesaleMinQty: string;
  stock: string;
  costPriceBRL: string;
  badge: string;
  isFeatured: boolean;
  isActive: boolean;
  collection: string;
  tagsRaw: string;
  position: string;
};

function initForm(product?: AdminProductDetail): FormData {
  if (!product) {
    return {
      name: "",
      slug: "",
      sku: "",
      categoryId: "",
      subcategoryId: "",
      shortDescription: "",
      longDescription: "",
      seoTitle: "",
      seoDescription: "",
      material: "",
      dimensions: "",
      origin: "",
      careInstructions: "",
      weightRange: "1-3kg",
      weightGrams: "",
      retailPriceBRL: "",
      wholesalePriceBRL: "",
      wholesaleMinQty: "1",
      stock: "0",
      costPriceBRL: "",
      badge: "",
      isFeatured: false,
      isActive: true,
      collection: "",
      tagsRaw: "",
      position: "0",
    };
  }
  return {
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    categoryId: product.categoryId ?? "",
    subcategoryId: product.subcategoryId ?? "",
    shortDescription: product.shortDescription,
    longDescription: product.longDescription,
    seoTitle: product.seoTitle ?? "",
    seoDescription: product.seoDescription ?? "",
    material: product.material,
    dimensions: product.dimensions,
    origin: product.origin ?? "",
    careInstructions: product.careInstructions ?? "",
    weightRange: product.weightRange,
    weightGrams: product.weightGrams != null ? String(product.weightGrams) : "",
    retailPriceBRL: String(product.retailPriceBRL),
    wholesalePriceBRL: product.wholesalePriceBRL != null ? String(product.wholesalePriceBRL) : "",
    wholesaleMinQty: String(product.wholesaleMinQty),
    stock: String(product.stock),
    costPriceBRL: product.costPriceBRL != null ? String(product.costPriceBRL) : "",
    badge: product.badge ?? "",
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    collection: product.collection ?? "",
    tagsRaw: (product.tags ?? []).join(", "),
    position: String(product.position),
  };
}

function buildPayload(form: FormData): Record<string, unknown> {
  const tags = form.tagsRaw
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);

  return {
    brand: "moda",
    name: form.name.trim(),
    slug: form.slug.trim(),
    sku: form.sku.trim().toUpperCase(),
    categoryId: form.categoryId || null,
    subcategoryId: form.subcategoryId || null,
    shortDescription: form.shortDescription.trim(),
    longDescription: form.longDescription.trim(),
    seoTitle: form.seoTitle.trim() || null,
    seoDescription: form.seoDescription.trim() || null,
    material: form.material.trim(),
    dimensions: form.dimensions.trim(),
    origin: form.origin.trim() || null,
    careInstructions: form.careInstructions.trim() || null,
    weightRange: form.weightRange,
    weightGrams: form.weightGrams ? Number(form.weightGrams) : null,
    retailPriceBRL: Number(form.retailPriceBRL),
    wholesalePriceBRL: form.wholesalePriceBRL ? Number(form.wholesalePriceBRL) : null,
    wholesaleMinQty: Number(form.wholesaleMinQty),
    stock: Number(form.stock),
    costPriceBRL: form.costPriceBRL ? Number(form.costPriceBRL) : null,
    badge: form.badge.trim() || null,
    isFeatured: form.isFeatured,
    isActive: form.isActive,
    collection: form.collection.trim() || null,
    tags,
    position: Number(form.position),
  };
}

// =============================================================================
// Props
// =============================================================================

type Props = {
  mode: "create" | "edit";
  product?: AdminProductDetail;
};

// =============================================================================
// Component
// =============================================================================

export function ProductForm({ mode, product }: Props) {
  const router = useRouter();
  const token = useAdminToken();
  const [form, setForm] = useState<FormData>(() => initForm(product));
  const [slugManual, setSlugManual] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Taxonomy
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const selectedCategory = categories.find((c) => c.id === form.categoryId);
  const subcategories = selectedCategory?.subcategories ?? [];

  // Load categories
  useEffect(() => {
    if (!token) return;
    adminApi.listCategories(token, "moda").then((result) => {
      if (result.ok) setCategories(result.data);
    });
  }, [token]);

  // Reset subcategory when category changes
  function handleCategoryChange(newCatId: string) {
    setForm((prev) => ({ ...prev, categoryId: newCatId, subcategoryId: "" }));
    setSuccess(false);
    setError(null);
  }

  // Auto-generate slug from name in create mode
  useEffect(() => {
    if (mode === "create" && !slugManual && form.name) {
      setForm((prev) => ({ ...prev, slug: slugify(form.name) }));
    }
  }, [form.name, mode, slugManual]);

  function set(field: keyof FormData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) { setError("Sessão expirada. Recarregue a página."); return; }

    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = buildPayload(form);

    if (mode === "create") {
      const result = await adminApi.createProduct(token, payload);
      setSaving(false);
      if (!result.ok) { setError(result.message); return; }
      window.location.href = `/admin/products/${result.data.id}#media`;
    } else {
      if (!product) return;
      const result = await adminApi.patchProduct(token, product.id, payload);
      setSaving(false);
      if (!result.ok) { setError(result.message); return; }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
  }

  async function handleDeactivate() {
    if (!token || !product) return;
    if (!confirm("Desativar este produto? Ele não aparecerá mais na loja.")) return;
    const result = await adminApi.deleteProduct(token, product.id);
    if (!result.ok) { setError(result.message); return; }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-1">
      {/* ── Identificação ──────────────────────────────────────────── */}
      <SectionTitle>Identificação</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Nome do produto *</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Ex: Bolsa Atelier Noir"
            required
          />
        </div>
        <div>
          <Label>Brand</Label>
          <div className="flex h-[42px] items-center rounded-[12px] border border-white/10 bg-white/[0.03] px-4 text-sm text-[#C6A96B]">
            Moda
          </div>
        </div>
        <div>
          <Label>Slug (URL) *</Label>
          <Input
            value={form.slug}
            onChange={(e) => { setSlugManual(true); set("slug", e.target.value); }}
            placeholder="bolsa-atelier-noir"
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            title="Apenas letras minúsculas, números e hífens"
            required
          />
          {mode === "create" && !slugManual && (
            <p className="mt-1 text-[11px] text-white/30">Gerado automaticamente a partir do nome</p>
          )}
        </div>
        <div>
          <Label>SKU *</Label>
          <Input
            value={form.sku}
            onChange={(e) => set("sku", e.target.value)}
            placeholder="MODA-001"
            required
          />
        </div>
      </div>

      {/* ── Taxonomia ──────────────────────────────────────────────── */}
      <SectionTitle>Categoria</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Categoria</Label>
          <Select
            value={form.categoryId}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="">— Selecionar —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Subcategoria</Label>
          <Select
            value={form.subcategoryId}
            onChange={(e) => set("subcategoryId", e.target.value)}
            disabled={subcategories.length === 0}
          >
            <option value="">— Selecionar —</option>
            {subcategories.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          {subcategories.length === 0 && form.categoryId && (
            <p className="mt-1 text-[11px] text-white/30">Nenhuma subcategoria cadastrada para esta categoria.</p>
          )}
        </div>
      </div>

      {/* ── Preços e estoque ────────────────────────────────────────── */}
      <SectionTitle>Preços e estoque</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Label>Preço varejo (BRL) *</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={form.retailPriceBRL}
            onChange={(e) => set("retailPriceBRL", e.target.value)}
            placeholder="1290.00"
            required
          />
        </div>
        <div>
          <Label>Preço atacado (BRL)</Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            value={form.wholesalePriceBRL}
            onChange={(e) => set("wholesalePriceBRL", e.target.value)}
            placeholder="1030.00"
          />
        </div>
        <div>
          <Label>Qtd. mín. atacado</Label>
          <Input
            type="number"
            min="1"
            value={form.wholesaleMinQty}
            onChange={(e) => set("wholesaleMinQty", e.target.value)}
          />
        </div>
        <div>
          <Label>Estoque *</Label>
          <Input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => set("stock", e.target.value)}
            required
          />
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Custo de aquisição (BRL) — interno</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={form.costPriceBRL}
            onChange={(e) => set("costPriceBRL", e.target.value)}
            placeholder="420.00"
          />
          <p className="mt-1 text-[11px] text-white/30">Custo de fabricação + logística inbound. Não é exibido na loja.</p>
        </div>
      </div>

      {/* ── Descrição ───────────────────────────────────────────────── */}
      <SectionTitle>Descrição</SectionTitle>
      <div className="space-y-4">
        <div>
          <Label>Descrição curta (máx. 500 caracteres)</Label>
          <Textarea
            value={form.shortDescription}
            onChange={(e) => set("shortDescription", e.target.value)}
            maxLength={500}
            rows={2}
            placeholder="Presença editorial com construção limpa e couro premium."
          />
        </div>
        <div>
          <Label>Descrição longa</Label>
          <Textarea
            value={form.longDescription}
            onChange={(e) => set("longDescription", e.target.value)}
            rows={5}
            placeholder="Descrição detalhada do produto, materiais, construção..."
          />
        </div>
      </div>

      {/* ── Dimensões físicas ───────────────────────────────────────── */}
      <SectionTitle>Especificações físicas</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Material</Label>
          <Input
            value={form.material}
            onChange={(e) => set("material", e.target.value)}
            placeholder="Couro legítimo"
          />
        </div>
        <div>
          <Label>Dimensões</Label>
          <Input
            value={form.dimensions}
            onChange={(e) => set("dimensions", e.target.value)}
            placeholder="28 x 19 x 10 cm"
          />
        </div>
        <div>
          <Label>Origem</Label>
          <Input
            value={form.origin}
            onChange={(e) => set("origin", e.target.value)}
            placeholder="Brasil"
          />
        </div>
        <div>
          <Label>Instruções de cuidado</Label>
          <Input
            value={form.careInstructions}
            onChange={(e) => set("careInstructions", e.target.value)}
            placeholder="Limpar com pano seco..."
          />
        </div>
      </div>

      {/* ── Peso e frete ────────────────────────────────────────────── */}
      <SectionTitle>Peso e frete</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Faixa de peso *</Label>
          <Select
            value={form.weightRange}
            onChange={(e) => set("weightRange", e.target.value)}
          >
            {WEIGHT_RANGES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Peso exato (gramas)</Label>
          <Input
            type="number"
            min="1"
            value={form.weightGrams}
            onChange={(e) => set("weightGrams", e.target.value)}
            placeholder="350"
          />
        </div>
      </div>

      {/* ── SEO ─────────────────────────────────────────────────────── */}
      <SectionTitle>SEO</SectionTitle>
      <div className="space-y-4">
        <div>
          <Label>Título SEO</Label>
          <Input
            value={form.seoTitle}
            onChange={(e) => set("seoTitle", e.target.value)}
            placeholder="Bolsa Atelier Noir — Couro Premium | D'OUTRO LADO"
            maxLength={255}
          />
        </div>
        <div>
          <Label>Descrição SEO</Label>
          <Textarea
            value={form.seoDescription}
            onChange={(e) => set("seoDescription", e.target.value)}
            rows={2}
            placeholder="Bolsa editorial em couro premium com ferragens discretas..."
            maxLength={500}
          />
        </div>
      </div>

      {/* ── Vitrine ─────────────────────────────────────────────────── */}
      <SectionTitle>Vitrine e merchandising</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label>Badge (etiqueta)</Label>
          <Input
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            placeholder="Editorial, Bestseller, Novo..."
            maxLength={64}
          />
        </div>
        <div>
          <Label>Coleção</Label>
          <Input
            value={form.collection}
            onChange={(e) => set("collection", e.target.value)}
            placeholder="Atelier 2026"
            maxLength={128}
          />
        </div>
        <div>
          <Label>Posição na listagem</Label>
          <Input
            type="number"
            min="0"
            value={form.position}
            onChange={(e) => set("position", e.target.value)}
          />
        </div>
      </div>
      <div className="mt-4">
        <Label>Tags (separadas por vírgula)</Label>
        <Input
          value={form.tagsRaw}
          onChange={(e) => set("tagsRaw", e.target.value)}
          placeholder="couro, fashion, editorial, gift"
        />
        <p className="mt-1 text-[11px] text-white/30">Separar por vírgula. Serão convertidas para minúsculas.</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-6">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => set("isFeatured", e.target.checked)}
            className="h-4 w-4 accent-[#C6A96B] rounded"
          />
          <span className="text-sm text-white/70">Produto em destaque</span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="h-4 w-4 accent-[#C6A96B] rounded"
          />
          <span className="text-sm text-white/70">Ativo (visível na loja)</span>
        </label>
      </div>

      {/* ── Ações ───────────────────────────────────────────────────── */}
      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={saving || !token}
          className="rounded-[14px] bg-[#C6A96B] px-8 py-2.5 text-sm font-medium text-black transition hover:bg-[#d4b87a] disabled:opacity-40"
        >
          {saving ? "Salvando..." : mode === "create" ? "Criar produto" : "Salvar alterações"}
        </button>

        {mode === "edit" && product && (
          <button
            type="button"
            onClick={handleDeactivate}
            disabled={saving}
            className="rounded-[14px] border border-red-400/30 bg-red-400/5 px-6 py-2.5 text-sm text-red-400 transition hover:bg-red-400/10 disabled:opacity-40"
          >
            Desativar produto
          </button>
        )}

        <a
          href="/admin/products"
          className="text-sm text-white/35 underline underline-offset-2 hover:text-white/60"
        >
          Cancelar
        </a>

        {success && (
          <span className="text-sm text-green-400">✓ Produto salvo com sucesso</span>
        )}
        {error && (
          <span className="max-w-sm text-sm text-red-400">{error}</span>
        )}
      </div>
    </form>
  );
}
