import ProtectedShell from "@/components/layout/ProtectedShell";

export default function CatalogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
