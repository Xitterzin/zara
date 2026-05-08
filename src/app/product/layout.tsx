import ProtectedShell from "@/components/layout/ProtectedShell";

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
