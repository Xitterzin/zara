import { OrderStatus } from "@/types";

const config: Record<OrderStatus, string> = {
  "Em análise": "bg-white text-ink border-ink/20",
  "Em produção": "bg-ink text-paper border-ink",
  Finalizado: "bg-porcelain text-ink border-ink/15",
};

export default function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex items-center border px-3 py-1 text-[9px] uppercase tracking-[0.24em] ${
        config[status] ?? config["Em análise"]
      }`}
    >
      {status}
    </span>
  );
}
