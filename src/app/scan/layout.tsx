import ProtectedShell from "@/components/layout/ProtectedShell";

export default function ScanLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedShell>{children}</ProtectedShell>;
}
