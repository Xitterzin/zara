type Status = "Em análise" | "Em produção" | "Finalizado";

const config: Record<Status, { color: string; dot: string }> = {
  "Em análise": {
    color: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
  },
  "Em produção": {
    color: "bg-blue-50 text-blue-700 border border-blue-200",
    dot: "bg-blue-400",
  },
  Finalizado: {
    color: "bg-green-50 text-green-700 border border-green-200",
    dot: "bg-green-400",
  },
};

export default function StatusBadge({ status }: { status: Status }) {
  const { color, dot } = config[status] ?? config["Em análise"];
  return (
    <span className={`status-badge ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {status}
    </span>
  );
}
