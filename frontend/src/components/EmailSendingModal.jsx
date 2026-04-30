import { CheckCircle2, XCircle, Send, RefreshCw, AlertTriangle, Ban } from "lucide-react";

export default function EmailSendingModal({ phase, type, result, onClose, count }) {
  if (!phase) return null;

  const isFollowup = type === "followup";
  const label = isFollowup ? "follow-up" : "email";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div
        className="bg-[#0d0d0d] border border-[#262626] rounded-lg shadow-2xl shadow-black/50 w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {phase === "sending" && <SendingView label={label} isFollowup={isFollowup} count={count} />}
        {phase === "result" && <ResultView label={label} result={result} onClose={onClose} />}
      </div>
    </div>
  );
}

function SendingView({ label, isFollowup, count }) {
  return (
    <div className="px-6 py-8 flex flex-col items-center text-center">
      <div className="w-14 h-14 rounded-full bg-[#161616] border border-[#262626] flex items-center justify-center mb-5">
        {isFollowup
          ? <RefreshCw className="w-5 h-5 text-white animate-spin" style={{ animationDuration: "2s" }} />
          : <Send className="w-5 h-5 text-white" />
        }
      </div>

      <h3 className="text-[15px] font-semibold text-white leading-tight mb-2">
        Sending {label}{count > 1 ? "s" : ""}
      </h3>
      <p className="text-[13px] text-[#71717a] mb-6 max-w-[300px] leading-relaxed">
        {count > 1
          ? `Personalizing and dispatching ${count} ${label}s. This may take a moment.`
          : `Generating and dispatching a personalized ${label}.`
        }
      </p>

      <div className="w-full max-w-[260px] h-0.5 bg-[#1a1a1a] rounded-full overflow-hidden animate-progress" />

      <p className="text-[11px] font-mono text-[#52525b] mt-4 uppercase tracking-wider leading-none">
        AI · personalization · delivery
      </p>
    </div>
  );
}

function ResultView({ label, result, onClose }) {
  if (!result) return null;

  const sentCount = result.sent?.length || 0;
  const failedCount = result.failed?.length || 0;
  const skippedCount = result.skipped?.length || 0;
  const allSuccess = failedCount === 0 && skippedCount === 0 && sentCount > 0;
  const allFailed = sentCount === 0 && skippedCount === 0;

  return (
    <div>
      {/* Symmetric padding header */}
      <div className="px-6 py-7 text-center border-b border-[#1a1a1a]">
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border border-[#262626] mb-4">
          {allSuccess
            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            : allFailed
            ? <XCircle className="w-5 h-5 text-red-500" />
            : <AlertTriangle className="w-5 h-5 text-amber-500" />
          }
        </div>
        <h3 className="text-[15px] font-semibold text-white leading-tight mb-1.5">
          {allSuccess
            ? `${capitalize(label)}${sentCount > 1 ? "s" : ""} sent`
            : allFailed
            ? "Sending failed"
            : "Partially sent"
          }
        </h3>
        <p className="text-[13px] text-[#71717a] leading-relaxed">
          {allSuccess
            ? `${sentCount} ${label}${sentCount > 1 ? "s" : ""} delivered`
            : allFailed
            ? "Could not deliver to any contacts"
            : `${sentCount} sent · ${failedCount} failed${skippedCount ? ` · ${skippedCount} skipped` : ""}`
          }
        </p>
      </div>

      <div className="p-5 space-y-4">
        <div className={`grid gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-md overflow-hidden ${skippedCount > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
          <StatCell label="Sent" value={sentCount} dotColor="bg-emerald-500" />
          <StatCell label="Failed" value={failedCount} dotColor="bg-red-500" />
          {skippedCount > 0 && <StatCell label="Skipped" value={skippedCount} dotColor="bg-[#525252]" />}
        </div>

        {sentCount > 0 && (
          <Details title={`Sent · ${sentCount}`}>
            {result.sent.map((item, i) => (
              <Row key={i} icon={<CheckCircle2 className="w-3 h-3 text-emerald-500" />} email={item.email} />
            ))}
          </Details>
        )}

        {failedCount > 0 && (
          <Details title={`Failed · ${failedCount}`}>
            {result.failed.map((item, i) => (
              <Row
                key={i}
                icon={<XCircle className="w-3 h-3 text-red-500" />}
                email={item.email}
                meta={item.error}
              />
            ))}
          </Details>
        )}

        {skippedCount > 0 && (
          <Details title={`Skipped · blocked domain · ${skippedCount}`}>
            {result.skipped.map((item, i) => (
              <Row
                key={i}
                icon={<Ban className="w-3 h-3 text-[#71717a]" />}
                email={item.email}
                meta={item.reason}
              />
            ))}
          </Details>
        )}

        <button
          onClick={onClose}
          className="w-full inline-flex items-center justify-center h-9 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function StatCell({ label, value, dotColor }) {
  return (
    <div className="bg-[#0d0d0d] px-4 py-3">
      <div className="flex items-center gap-1.5 h-3 mb-1.5">
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
        <span className="text-[10px] font-mono font-semibold text-[#71717a] uppercase tracking-wider leading-none">{label}</span>
      </div>
      <p className="text-[20px] font-semibold text-white tabular-nums tracking-tight leading-none">{value}</p>
    </div>
  );
}

function Row({ icon, email, meta }) {
  return (
    <div className="flex items-center gap-2.5 px-3 h-9 text-[13px] border-b border-[#141414] last:border-b-0">
      <span className="shrink-0">{icon}</span>
      <span className="font-mono text-[12px] text-[#a1a1aa] truncate flex-1 min-w-0 leading-none">{email}</span>
      {meta && (
        <span className="text-[11px] text-[#52525b] shrink-0 truncate max-w-[140px] leading-none" title={meta}>
          {meta}
        </span>
      )}
    </div>
  );
}

function Details({ title, children }) {
  return (
    <details className="rounded-md border border-[#1a1a1a] overflow-hidden bg-[#0a0a0a] group">
      <summary className="flex items-center justify-between h-9 px-3 text-[11px] font-mono font-semibold text-[#a1a1aa] uppercase tracking-wider cursor-pointer select-none hover:text-white hover:bg-[#0f0f0f] transition-colors leading-none">
        <span>{title}</span>
        <span className="text-[#525252] group-open:rotate-90 transition-transform">›</span>
      </summary>
      <div className="max-h-44 overflow-y-auto border-t border-[#1a1a1a]">
        {children}
      </div>
    </details>
  );
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
