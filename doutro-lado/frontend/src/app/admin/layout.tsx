import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchApiData } from "@/lib/api";
import type { AuthProfile } from "@/lib/types";
import { AdminSidebar } from "@/features/admin/AdminSidebar";

/**
 * Admin layout — server component.
 * Enforces: (1) authenticated session, (2) admin role.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/admin");

  const { data: { session } } = await supabase.auth.getSession();
  const profile = await fetchApiData<AuthProfile>("/auth/session", {
    token: session?.access_token,
    revalidate: 0,
  });

  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,rgba(198,169,107,0.09),transparent_36%),linear-gradient(180deg,#080808,#040404)] text-white">
      <div className="mx-auto flex max-w-[1600px] gap-0">
        {/* Sidebar */}
        <AdminSidebar email={profile.email} name={profile.fullName ?? "Admin"} />
        {/* Content */}
        <main className="min-h-screen flex-1 overflow-auto px-8 py-8 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
