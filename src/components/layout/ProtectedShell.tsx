import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default async function ProtectedShell({
  children,
}: {
  children: React.ReactNode;
}) {
  if (hasSupabaseEnv()) {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/auth");
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <Navbar />
      <main className="pt-20">{children}</main>
    </div>
  );
}
