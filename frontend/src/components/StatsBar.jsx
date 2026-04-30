import { Users, Send, MessageSquare, AlertTriangle } from "lucide-react";

export default function StatsBar({ stats }) {
  const cards = [
    {
      label: "Total Contacts",
      value: stats.total,
      icon: Users,
      delta: null,
    },
    {
      label: "Emails Sent",
      value: stats.statusBreakdown?.SENT || 0,
      icon: Send,
      delta: null,
    },
    {
      label: "Replied",
      value: stats.replied,
      icon: MessageSquare,
      delta: stats.total ? ((stats.replied / stats.total) * 100).toFixed(1) + "%" : null,
      tone: "success",
    },
    {
      label: "Bounced",
      value: stats.bounced,
      icon: AlertTriangle,
      delta: stats.total ? ((stats.bounced / stats.total) * 100).toFixed(1) + "%" : null,
      tone: "danger",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-lg overflow-hidden">
      {cards.map((card) => (
        <div
          key={card.label}
          className="bg-[#0a0a0a] px-5 py-4 hover:bg-[#0d0d0d] transition-colors"
        >
          <div className="flex items-center justify-between h-4 mb-3">
            <span className="text-[11px] font-medium text-[#71717a] uppercase tracking-wider leading-none">
              {card.label}
            </span>
            <card.icon className="w-3.5 h-3.5 text-[#52525b] shrink-0" strokeWidth={1.75} />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-[28px] leading-none font-semibold text-white tabular-nums tracking-tight">
              {card.value.toLocaleString()}
            </span>
            {card.delta && (
              <span className={`text-[11px] font-mono tabular-nums leading-none ${
                card.tone === "success" ? "text-emerald-500" : card.tone === "danger" ? "text-red-500" : "text-[#71717a]"
              }`}>
                {card.delta}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
