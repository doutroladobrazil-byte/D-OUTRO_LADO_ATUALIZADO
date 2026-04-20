"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { AdminProduct } from "@/lib/admin-api";
import {
  AdminTable,
  BrandChip,
  StatusBadge,
  StockIndicator,
} from "@/features/admin/AdminComponents";
import { getSkuReadiness } from "@/features/admin/skuReadiness";

type Props = {
  products: AdminProduct[];
};

export function AdminProductsList({ products }: Props) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      if (statusFilter === "active" && !p.isActive) return false;
      if (statusFilter === "inactive" && p.isActive) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.category ?? "").toLowerCase().includes(q)
      );
    });
  }, [products, search, statusFilter]);

  const columns = [
    { key: "brand", label: "Brand", render: (r: AdminProduct) => <BrandChip brand={r.brand} /> },
    { key: "sku", label: "SKU" },
    { key: "name", label: "Produto" },
    { key: "category", label: "Categoria" },
    {
      key: "retailPriceBRL",
      label: "P. Varejo",
      align: "right" as const,
      render: (r: AdminProduct) => <span>R$ {r.retailPriceBRL.toFixed(2)}</span>,
    },
    {
      key: "stock",
      label: "Estoque",
      align: "right" as const,
      render: (r: AdminProduct) => <StockIndicator stock={r.stock} />,
    },
    {
      key: "isActive",
      label: "Status",
      render: (r: AdminProduct) => <StatusBadge status={r.isActive ? "active" : "inactive"} />,
    },
    {
      key: "operacao",
      label: "Operação",
      render: (r: AdminProduct) => {
        const s = getSkuReadiness(r);
        return (
          <span className={`text-[11px] font-medium ${s.className}`} title={s.hint || undefined}>
            {s.label}
          </span>
        );
      },
    },
    {
      key: "isFeatured",
      label: "Destaque",
      render: (r: AdminProduct) => r.isFeatured ? <StatusBadge status="active" /> : null,
    },
    {
      key: "id",
      label: "",
      render: (r: AdminProduct) => (
        <Link
          href={`/admin/products/${r.id}`}
          className="rounded-[8px] border border-white/10 bg-white/[0.03] px-3 py-1 text-[11px] text-white/50 transition hover:border-[#C6A96B]/40 hover:text-[#C6A96B]"
        >
          Editar
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome, SKU ou categoria..."
          className="h-9 w-full max-w-sm rounded-[10px] border border-white/10 bg-white/[0.04] px-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-[#C6A96B]/40"
        />
        <div className="flex gap-1">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`rounded-[8px] px-3 py-1.5 text-[11px] uppercase tracking-wider transition ${
                statusFilter === s
                  ? "bg-[#C6A96B]/20 text-[#C6A96B]"
                  : "text-white/35 hover:text-white/60"
              }`}
            >
              {s === "all" ? "Todos" : s === "active" ? "Ativos" : "Inativos"}
            </button>
          ))}
        </div>
        {(search || statusFilter !== "all") && (
          <span className="text-[11px] text-white/30">
            {filtered.length} de {products.length} SKUs
          </span>
        )}
      </div>

      <AdminTable
        columns={columns}
        rows={filtered as AdminProduct[]}
        rowKey={(r) => r.id}
        emptyMessage={
          search || statusFilter !== "all"
            ? "Nenhum produto encontrado para este filtro."
            : "Nenhum produto cadastrado. Clique em '+ Novo produto' para começar."
        }
      />
    </div>
  );
}
