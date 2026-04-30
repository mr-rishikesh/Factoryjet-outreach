import { useState } from "react";
import { api } from "../api";
import toast from "react-hot-toast";
import {
  Send, RefreshCw, MessageSquare, Ban, X,
  ThumbsUp, ThumbsDown, StickyNote, ToggleRight, ToggleLeft,
} from "lucide-react";
import EmailSendingModal from "./EmailSendingModal";

const OUTREACH_STATUSES = [
  "NOT_SENT", "SENT", "FOLLOWUP_PENDING", "REPLIED_POSITIVE",
  "REPLIED_NEGATIVE", "NO_RESPONSE", "CLOSED",
];

export default function BulkActions({ selectedIds, count, onClear, onDone }) {
  const [loading, setLoading] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState("");
  const [emailModal, setEmailModal] = useState({ phase: null, type: null, result: null });

  const runBulk = async (update, label) => {
    setLoading(true);
    try {
      await api.bulkUpdate(selectedIds, update);
      toast.success(`${label} — ${count} contacts updated`);
      onDone();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    setLoading(true);
    setEmailModal({ phase: "sending", type: "email", result: null });
    try {
      const res = await api.sendEmails(selectedIds);
      setEmailModal({ phase: "result", type: "email", result: res.results });
    } catch (err) {
      setEmailModal({ phase: "result", type: "email", result: { sent: [], failed: selectedIds.map((id) => ({ id, email: "Unknown", error: err.message })) } });
    } finally {
      setLoading(false);
    }
  };

  const handleSendFollowup = async () => {
    setLoading(true);
    setEmailModal({ phase: "sending", type: "followup", result: null });
    try {
      const res = await api.sendFollowups(selectedIds);
      setEmailModal({ phase: "result", type: "followup", result: res.results });
    } catch (err) {
      setEmailModal({ phase: "result", type: "followup", result: { sent: [], failed: selectedIds.map((id) => ({ id, email: "Unknown", error: err.message })) } });
    } finally {
      setLoading(false);
    }
  };

  const closeEmailModal = () => {
    setEmailModal({ phase: null, type: null, result: null });
    onDone();
  };

  return (
    <>
      {/* sticky top = 56 (header) + 40 (tabs) = 96px */}
      <div className="bg-[#0d0d0d] border border-[#262626] rounded-lg sticky top-24 z-40 shadow-xl shadow-black/30">
        <div className="flex flex-wrap items-center gap-1 p-1.5">
          {/* Count */}
          <div className="inline-flex items-center gap-2 h-8 px-2.5 mr-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse shrink-0" />
            <span className="text-[12px] font-mono tabular-nums text-white leading-none">
              {count} selected
            </span>
          </div>

          <Sep />

          {/* Primary actions */}
          <BulkBtn onClick={handleSendEmail} disabled={loading} icon={<Send />} primary>
            Send email
          </BulkBtn>
          <BulkBtn onClick={handleSendFollowup} disabled={loading} icon={<RefreshCw />}>
            Followup
          </BulkBtn>
          <BulkBtn onClick={() => setShowStatusModal(true)} disabled={loading} icon={<MessageSquare />}>
            Status
          </BulkBtn>
          <BulkBtn onClick={() => setShowNotesModal(true)} disabled={loading} icon={<StickyNote />}>
            Notes
          </BulkBtn>

          <Sep />

          <BulkBtn onClick={() => runBulk({ "followup.followupEnabled": true }, "Followups enabled")} disabled={loading} icon={<ToggleRight />}>
            Enable FU
          </BulkBtn>
          <BulkBtn onClick={() => runBulk({ "followup.followupEnabled": false }, "Followups disabled")} disabled={loading} icon={<ToggleLeft />}>
            Disable FU
          </BulkBtn>

          <Sep />

          <BulkBtn onClick={() => runBulk({ "reply.replied": true, "reply.replyType": "positive", outreachStatus: "REPLIED_POSITIVE" }, "Marked replied positive")} disabled={loading} icon={<ThumbsUp />} tone="success">
            Replied +
          </BulkBtn>
          <BulkBtn onClick={() => runBulk({ "reply.replied": true, "reply.replyType": "negative", outreachStatus: "REPLIED_NEGATIVE" }, "Marked replied negative")} disabled={loading} icon={<ThumbsDown />} tone="warning">
            Replied −
          </BulkBtn>
          <BulkBtn onClick={() => runBulk({ "flags.doNotContact": true }, "Marked do not contact")} disabled={loading} icon={<Ban />} tone="danger">
            DNC
          </BulkBtn>

          <button
            onClick={onClear}
            className="ml-auto inline-flex items-center justify-center w-8 h-8 text-[#71717a] hover:text-white hover:bg-[#161616] rounded-md transition-colors shrink-0"
            title="Clear selection"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <EmailSendingModal
        phase={emailModal.phase}
        type={emailModal.type}
        result={emailModal.result}
        onClose={closeEmailModal}
        count={count}
      />

      {showStatusModal && (
        <Modal onClose={() => setShowStatusModal(false)} title="Update status" subtitle={`Set status for ${count} contacts`}>
          <div className="space-y-0.5">
            {OUTREACH_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => {
                  runBulk({ outreachStatus: s }, `Status set to ${s.replace(/_/g, " ").toLowerCase()}`);
                  setShowStatusModal(false);
                }}
                className="w-full flex items-center gap-2.5 h-9 px-3 text-[13px] font-medium text-[#ededed] hover:bg-[#161616] rounded-md transition-colors leading-none"
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  s === "REPLIED_POSITIVE" ? "bg-emerald-500"
                  : s === "REPLIED_NEGATIVE" ? "bg-red-500"
                  : s === "SENT" ? "bg-blue-500"
                  : s === "FOLLOWUP_PENDING" ? "bg-amber-500"
                  : s === "NO_RESPONSE" ? "bg-orange-500"
                  : s === "CLOSED" ? "bg-purple-500"
                  : "bg-[#525252]"
                }`} />
                {s.replace(/_/g, " ").toLowerCase()}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {showNotesModal && (
        <Modal onClose={() => setShowNotesModal(false)} title="Update notes" subtitle={`Add notes to ${count} contacts`}>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 text-[13px] bg-[#0a0a0a] border border-[#262626] rounded-md text-[#ededed] placeholder:text-[#52525b] focus:border-[#525252] resize-none transition-colors"
            placeholder="Enter notes..."
            autoFocus
          />
          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => {
                runBulk({ notes }, "Notes updated");
                setShowNotesModal(false);
                setNotes("");
              }}
              className="flex-1 h-9 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] transition-colors"
            >
              Save notes
            </button>
            <button
              onClick={() => setShowNotesModal(false)}
              className="h-9 px-4 bg-transparent border border-[#262626] text-[13px] font-medium text-[#a1a1aa] rounded-md hover:bg-[#161616] hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* divider sits flush with the gap-1 (4px) of parent — no extra mx so visual spacing stays even */
function Sep() {
  return <div className="w-px h-5 bg-[#262626] shrink-0 self-center" />;
}

function BulkBtn({ onClick, disabled, icon, children, primary, tone }) {
  const toneClasses = primary
    ? "bg-white text-black hover:bg-[#e5e5e5]"
    : tone === "success"
    ? "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
    : tone === "warning"
    ? "text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
    : tone === "danger"
    ? "text-red-400 hover:bg-red-500/10 hover:text-red-300"
    : "text-[#a1a1aa] hover:text-white hover:bg-[#161616]";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 h-8 px-2.5 text-[12px] font-medium rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed leading-none shrink-0 ${toneClasses}`}
    >
      <span className="[&>svg]:w-3.5 [&>svg]:h-3.5 shrink-0">{icon}</span>
      <span className="hidden md:inline">{children}</span>
    </button>
  );
}

function Modal({ onClose, title, subtitle, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-[#0d0d0d] border border-[#262626] rounded-lg shadow-2xl shadow-black/50 w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-[#1a1a1a]">
          <h3 className="text-[15px] font-semibold text-white leading-tight">{title}</h3>
          {subtitle && <p className="text-[12px] text-[#71717a] mt-1 leading-tight">{subtitle}</p>}
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
