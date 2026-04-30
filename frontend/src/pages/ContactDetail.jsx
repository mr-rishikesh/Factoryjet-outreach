import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api";
import toast from "react-hot-toast";
import {
  ArrowLeft, Send, RefreshCw, Save, Mail, Building2,
  Globe, Phone, MapPin, MessageSquare, Clock,
  Loader2, UserX, ExternalLink,
} from "lucide-react";
import EmailSendingModal from "../components/EmailSendingModal";

const STATUS_DOT = {
  NOT_SENT: "bg-[#525252]",
  SENT: "bg-blue-500",
  FOLLOWUP_PENDING: "bg-amber-500",
  REPLIED_POSITIVE: "bg-emerald-500",
  REPLIED_NEGATIVE: "bg-red-500",
  NO_RESPONSE: "bg-orange-500",
  CLOSED: "bg-purple-500",
};

const STATUS_TEXT = {
  NOT_SENT: "text-[#a1a1aa]",
  SENT: "text-blue-400",
  FOLLOWUP_PENDING: "text-amber-400",
  REPLIED_POSITIVE: "text-emerald-400",
  REPLIED_NEGATIVE: "text-red-400",
  NO_RESPONSE: "text-orange-400",
  CLOSED: "text-purple-400",
};

const OUTREACH_STATUSES = [
  "NOT_SENT", "SENT", "FOLLOWUP_PENDING", "REPLIED_POSITIVE",
  "REPLIED_NEGATIVE", "NO_RESPONSE", "CLOSED",
];

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [emailModal, setEmailModal] = useState({ phase: null, type: null, result: null });

  useEffect(() => {
    api.getContact(id).then((d) => {
      setContact(d.data);
      setNotes(d.data.notes || "");
      setStatus(d.data.outreachStatus || "NOT_SENT");
      setLoading(false);
    }).catch((err) => {
      toast.error(err.message);
      setLoading(false);
    });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.updateContact(id, { notes, outreachStatus: status });
      setContact(res.data);
      toast.success("Contact updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    setEmailModal({ phase: "sending", type: "email", result: null });
    try {
      const res = await api.sendEmails([id]);
      setEmailModal({ phase: "result", type: "email", result: res.results });
    } catch (err) {
      setEmailModal({ phase: "result", type: "email", result: { sent: [], failed: [{ id, email: contact?.email || "Unknown", error: err.message }] } });
    } finally {
      setSending(false);
    }
  };

  const handleSendFollowup = async () => {
    setSending(true);
    setEmailModal({ phase: "sending", type: "followup", result: null });
    try {
      const res = await api.sendFollowups([id]);
      setEmailModal({ phase: "result", type: "followup", result: res.results });
    } catch (err) {
      setEmailModal({ phase: "result", type: "followup", result: { sent: [], failed: [{ id, email: contact?.email || "Unknown", error: err.message }] } });
    } finally {
      setSending(false);
    }
  };

  const closeEmailModal = async () => {
    setEmailModal({ phase: null, type: null, result: null });
    try {
      const d = await api.getContact(id);
      setContact(d.data);
      setNotes(d.data.notes || "");
      setStatus(d.data.outreachStatus || "NOT_SENT");
    } catch (_) { /* noop */ }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#71717a] gap-3">
        <Loader2 className="w-5 h-5 animate-spin" />
        <p className="text-[13px]">Loading contact</p>
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-[#71717a] gap-3">
        <UserX className="w-8 h-8 stroke-[1.5]" />
        <p className="text-[13px] font-medium text-[#a1a1aa]">Contact not found</p>
        <button onClick={() => navigate("/")} className="text-[12px] text-[#71717a] hover:text-white transition-colors underline underline-offset-4 decoration-[#3f3f3f]">
          Back to overview
        </button>
      </div>
    );
  }

  const c = contact;
  const initials = ((c.firstName?.[0] || "") + (c.lastName?.[0] || "")).toUpperCase() || "?";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <button
        onClick={() => navigate("/")}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#71717a] hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* Header Card */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg p-5 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-zinc-400 to-zinc-700 ring-1 ring-[#2a2a2a] grid place-items-center text-[14px] font-mono font-semibold text-white shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h1 className="text-[20px] font-semibold tracking-tight text-white truncate">
                {c.firstName} {c.lastName}
              </h1>
              <p className="text-[13px] text-[#a1a1aa] truncate mt-0.5">
                {c.title}{c.title && c.companyName ? " · " : ""}{c.companyName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.outreachStatus] || STATUS_DOT.NOT_SENT}`} />
              <span className={`text-[12px] font-medium ${STATUS_TEXT[c.outreachStatus] || STATUS_TEXT.NOT_SENT}`}>
                {(c.outreachStatus || "NOT_SENT").replace(/_/g, " ").toLowerCase()}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          <Card title="Contact information">
            <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-[#1a1a1a]">
              <div className="grid grid-cols-1 divide-y divide-[#1a1a1a]">
                <InfoRow icon={<Mail className="w-3.5 h-3.5" />} label="Email" value={c.email} mono />
                <InfoRow icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={c.workDirectPhone || c.mobilePhone || "—"} mono />
                <InfoRow icon={<Building2 className="w-3.5 h-3.5" />} label="Company" value={c.companyName} />
                <InfoRow icon={<Globe className="w-3.5 h-3.5" />} label="Website" value={c.website} link />
              </div>
              <div className="grid grid-cols-1 divide-y divide-[#1a1a1a]">
                <InfoRow icon={<MapPin className="w-3.5 h-3.5" />} label="Location" value={[c.city, c.state, c.country].filter(Boolean).join(", ") || "—"} />
                <InfoRow label="Industry" value={c.industry || "—"} />
                <InfoRow label="Employees" value={c.employees || "—"} mono />
                <InfoRow label="LinkedIn" value={c.personLinkedinUrl} link />
              </div>
            </div>
          </Card>

          <Card title="Email history" countBadge={c.emails?.length}>
            {c.emails && c.emails.length > 0 ? (
              <div className="divide-y divide-[#1a1a1a]">
                {c.emails.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className={`p-1.5 rounded-md shrink-0 border ${
                      e.type === "followup"
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-blue-500/10 border-blue-500/20"
                    }`}>
                      {e.type === "followup"
                        ? <RefreshCw className="w-3 h-3 text-amber-400" />
                        : <Send className="w-3 h-3 text-blue-400" />
                      }
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-white truncate">{e.subject}</p>
                      <p className="text-[11px] font-mono text-[#71717a] flex items-center gap-1.5 mt-0.5 tabular-nums">
                        <Clock className="w-3 h-3 shrink-0" />
                        {e.sentAt ? new Date(e.sentAt).toLocaleString() : "—"}
                      </p>
                    </div>
                    <span className={`shrink-0 text-[10px] font-mono font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                      e.type === "followup"
                        ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                        : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                    }`}>
                      {e.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Mail className="w-7 h-7 text-[#3f3f3f] mx-auto mb-2 stroke-[1.5]" />
                <p className="text-[13px] text-[#71717a]">No emails sent yet</p>
              </div>
            )}
          </Card>

          {c.reply?.replied && (
            <Card title="Reply" icon={<MessageSquare className="w-3.5 h-3.5" />}>
              <div className="space-y-3 text-[13px]">
                <Field label="Type">
                  <span className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                    c.reply.replyType === "positive" ? "text-emerald-400"
                    : c.reply.replyType === "negative" ? "text-red-400"
                    : "text-[#a1a1aa]"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      c.reply.replyType === "positive" ? "bg-emerald-500"
                      : c.reply.replyType === "negative" ? "bg-red-500"
                      : "bg-[#525252]"
                    }`} />
                    {c.reply.replyType}
                  </span>
                </Field>
                {c.reply.replyMessage && (
                  <Field label="Message">
                    <p className="text-[#ededed] bg-[#0d0d0d] border border-[#1a1a1a] rounded-md px-3 py-2.5">{c.reply.replyMessage}</p>
                  </Field>
                )}
                {c.reply.repliedAt && (
                  <Field label="Date">
                    <span className="font-mono text-[12px] text-[#a1a1aa] tabular-nums">{new Date(c.reply.repliedAt).toLocaleString()}</span>
                  </Field>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5">
          <Card title="Actions">
            <div className="space-y-2">
              <button
                onClick={handleSendEmail}
                disabled={sending || c.flags?.doNotContact}
                className="w-full inline-flex items-center justify-center gap-2 h-9 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {sending ? "Sending..." : "Send email"}
              </button>
              <button
                onClick={handleSendFollowup}
                disabled={sending || c.flags?.doNotContact}
                className="w-full inline-flex items-center justify-center gap-2 h-9 bg-transparent border border-[#262626] text-[#ededed] text-[13px] font-medium rounded-md hover:bg-[#161616] hover:border-[#3f3f3f] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {sending ? "Sending..." : "Send follow-up"}
              </button>
            </div>
          </Card>

          <Card title="Status & Tracking">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[12px] font-medium text-[#a1a1aa]">Outreach status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full appearance-none h-9 px-3 pr-8 text-[13px] bg-[#0a0a0a] border border-[#262626] rounded-md text-[#ededed] hover:border-[#3f3f3f] focus:border-[#525252] cursor-pointer transition-colors bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23a1a1aa%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_10px_center]"
                >
                  {OUTREACH_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.replace(/_/g, " ").toLowerCase()}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-px bg-[#1a1a1a] border border-[#1a1a1a] rounded-md overflow-hidden">
                <Stat label="Emails sent" value={c.emailStats?.emailsSent || 0} />
                <Stat label="Followups" value={`${c.followup?.followupCount || 0}/${c.followup?.maxFollowups || 3}`} />
                <Stat label="Opened" value={c.emailStats?.opened ? "Yes" : "No"} positive={c.emailStats?.opened} />
                <Stat label="FU enabled" value={c.followup?.followupEnabled ? "Yes" : "No"} positive={c.followup?.followupEnabled} />
              </div>

              {(c.flags?.doNotContact || c.flags?.bounced || c.flags?.unsubscribe) && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.flags?.doNotContact && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/20 uppercase">DNC</span>
                  )}
                  {c.flags?.bounced && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">Bounced</span>
                  )}
                  {c.flags?.unsubscribe && (
                    <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold tracking-wider rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 uppercase">Unsub</span>
                  )}
                </div>
              )}
            </div>
          </Card>

          <Card title="Notes">
            <div className="space-y-3">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={5}
                className="w-full px-3 py-2.5 text-[13px] bg-[#0a0a0a] border border-[#262626] rounded-md text-[#ededed] placeholder:text-[#52525b] hover:border-[#3f3f3f] focus:border-[#525252] resize-none transition-colors"
                placeholder="Add notes about this contact..."
              />
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full inline-flex items-center justify-center gap-2 h-9 bg-white text-black text-[13px] font-medium rounded-md hover:bg-[#e5e5e5] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          </Card>
        </div>
      </div>

      <EmailSendingModal
        phase={emailModal.phase}
        type={emailModal.type}
        result={emailModal.result}
        onClose={closeEmailModal}
        count={1}
      />
    </div>
  );
}

function Card({ children, title, icon, countBadge }) {
  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
      {title && (
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            {icon && <span className="text-[#71717a]">{icon}</span>}
            <h2 className="text-[13px] font-semibold text-white tracking-tight">{title}</h2>
          </div>
          {countBadge != null && countBadge > 0 && (
            <span className="text-[11px] font-mono tabular-nums text-[#71717a]">{countBadge}</span>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function Stat({ label, value, positive }) {
  return (
    <div className="bg-[#0a0a0a] px-4 py-3">
      <p className="text-[10px] font-mono font-semibold text-[#71717a] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-[15px] font-semibold tabular-nums tracking-tight ${
        positive === true ? "text-emerald-400" : positive === false ? "text-[#71717a]" : "text-white"
      }`}>{value}</p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid grid-cols-[80px_1fr] gap-3 items-start">
      <span className="text-[12px] text-[#71717a] pt-0.5">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

function InfoRow({ icon, label, value, link, mono }) {
  const display = value && value !== "—" ? value : null;
  return (
    <div className="flex items-start gap-3 px-5 py-3 first:pt-0 sm:px-5 sm:py-3">
      {icon && <span className="text-[#52525b] mt-0.5 shrink-0">{icon}</span>}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-mono font-semibold text-[#71717a] uppercase tracking-wider mb-0.5">{label}</p>
        {link && display ? (
          <a
            href={display.startsWith("http") ? display : `https://${display}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[13px] text-white hover:underline underline-offset-4 decoration-[#3f3f3f] break-all transition-colors"
          >
            <span className="font-mono text-[12px]">{display}</span>
            <ExternalLink className="w-3 h-3 text-[#525252] shrink-0" />
          </a>
        ) : (
          <p className={`text-[13px] break-all ${mono ? "font-mono text-[12px]" : ""} ${display ? "text-[#ededed]" : "text-[#3f3f3f]"}`}>
            {display || "—"}
          </p>
        )}
      </div>
    </div>
  );
}
