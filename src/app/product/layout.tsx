import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Navbar from "@/components/layout/Navbar";

export default async function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  return (
    <div className="min-h-screen bg-beige-light">
      <Navbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
