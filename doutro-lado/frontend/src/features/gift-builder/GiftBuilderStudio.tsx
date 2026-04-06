"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { DragEvent } from "react";
import type { Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";

export function GiftBuilderStudio({ products }: { products: Product[] }) {
  const [kit, setKit] = useState<Product[]>([]);

  function handleAdd(product: Product) {
    setKit((current) => [...current, product]);
  }

  function handleDrop(productId: string) {
    const product = products.find((entry) => entry.id === productId);
    if (product) handleAdd(product);
  }

  const total = useMemo(() => kit.reduce((sum, item) => sum + item.retailPriceBRL, 0), [kit]);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((product, index) => (
          <div
            key={product.id}
            draggable
            onDragStart={(event: DragEvent<HTMLDivElement>) => event.dataTransfer.setData("productId", product.id)}
            className="cursor-grab active:cursor-grabbing"
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              viewport={{ once: true }}
              className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 shadow-luxe"
            >
              <div className="mb-4 aspect-[1.1] rounded-[20px] bg-[radial-gradient(circle_at_top,rgba(198,169,107,0.16),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(10,10,10,0.8))]" />
              <p className="text-[11px] uppercase tracking-[0.24em] text-white/45">{product.category}</p>
              <h3 className="mt-3 font-display text-[28px] tracking-[-0.5px] text-white">{product.name}</h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-white">R$ {product.retailPriceBRL.toFixed(2)}</span>
                <Button variant="secondary" onClick={() => handleAdd(product)}>Adicionar</Button>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          handleDrop(event.dataTransfer.getData("productId"));
        }}
        className="rounded-[28px] border border-gold/20 bg-[linear-gradient(180deg,rgba(198,169,107,0.08),rgba(255,255,255,0.03))] p-6 shadow-halo"
      >
        <p className="text-[13px] uppercase tracking-[0.28em] text-gold/70">Preview do kit</p>
        <h2 className="mt-4 font-display text-[36px] leading-[1.05] tracking-[-0.5px] text-white">Monte uma narrativa de presente.</h2>
        <div className="mt-6 space-y-3">
          {kit.length === 0 ? (
            <div className="rounded-[22px] border border-dashed border-white/12 px-5 py-10 text-center text-white/45">
              Arraste produtos para compor o kit premium.
            </div>
          ) : (
            kit.map((item, index) => (
              <motion.div
                key={`${item.id}-${index}`}
                layout
                className="flex items-center justify-between rounded-[20px] border border-white/10 bg-black/25 px-4 py-4"
              >
                <div>
                  <p className="text-white">{item.name}</p>
                  <p className="text-sm text-white/45">{item.category}</p>
                </div>
                <span className="text-gold">R$ {item.retailPriceBRL.toFixed(2)}</span>
              </motion.div>
            ))
          )}
        </div>
        <div className="mt-8 rounded-[22px] border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between text-sm text-white/55">
            <span>Total estimado</span>
            <span className="text-lg text-white">R$ {total.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-white/55">
            <span>Packaging signature</span>
            <span className="text-white">Premium box</span>
          </div>
          <Button className="mt-6 w-full">Salvar composicao</Button>
        </div>
      </div>
    </div>
  );
}
