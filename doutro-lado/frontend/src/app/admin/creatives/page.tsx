import { requireAdminToken } from "@/lib/admin-server-auth";
import { CreativeSlotsManager } from "@/features/admin/CreativeSlotsManager";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Criativos — D'OUTRO LADO Admin" };

export default async function CreativesPage() {
  const token = await requireAdminToken();
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <CreativeSlotsManager token={token} />
    </div>
  );
}
