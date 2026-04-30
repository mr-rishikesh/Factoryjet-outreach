import { useState } from "react";

const OUTREACH_STATUSES = [
  "NOT_SENT", "SENT", "FOLLOWUP_PENDING", "REPLIED_POSITIVE",
  "REPLIED_NEGATIVE", "NO_RESPONSE", "CLOSED",
];

const REPLY_TYPES = ["positive", "negative", "neutral"];

const fieldClass =
  "w-full h-9 px-3 text-[13px] bg-[#0a0a0a] border border-[#262626] rounded-md text-[#ededed] placeholder:text-[#52525b] hover:border-[#3f3f3f] focus:border-[#525252] transition-colors";

const selectClass = `${fieldClass} appearance-none cursor-pointer pr-8 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23a1a1aa%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_10px_center] bg-[length:12px_12px]`;

export default function FilterPanel({ filters, onApply, onClear }) {
  const [local, setLocal] = useState({ ...filters });

  const set = (key, value) => setLocal((p) => ({ ...p, [key]: value }));

  return (
    <div className="px-5 py-5 lg:px-6 lg:py-6 space-y-6">
      <FilterGroup title="Status & Engagement">
        <FilterField label="Outreach Status">
          <select value={local.outreachStatus || ""} onChange={(e) => set("outreachStatus", e.target.value)} className={selectClass}>
            <option value="">All statuses</option>
            {OUTREACH_STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, " ")}</option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Replied">
          <select value={local.replied ?? ""} onChange={(e) => set("replied", e.target.value)} className={selectClass}>
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </FilterField>

        <FilterField label="Reply Type">
          <select value={local.replyType || ""} onChange={(e) => set("replyType", e.target.value)} className={selectClass}>
            <option value="">All types</option>
            {REPLY_TYPES.map((t) => (
              <option key={t} value={t} className="capitalize">{t}</option>
            ))}
          </select>
        </FilterField>

        <FilterField label="Email Opened">
          <select value={local.opened ?? ""} onChange={(e) => set("opened", e.target.value)} className={selectClass}>
            <option value="">All</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </FilterField>
      </FilterGroup>

      <FilterGroup title="Activity & Metrics">
        <FilterField label="Min Followup Count">
          <input type="number" min={0} value={local.followupCountMin || ""} onChange={(e) => set("followupCountMin", e.target.value)} className={fieldClass} placeholder="0" />
        </FilterField>

        <FilterField label="Min Emails Sent">
          <input type="number" min={0} value={local.emailsSentMin || ""} onChange={(e) => set("emailsSentMin", e.target.value)} className={fieldClass} placeholder="0" />
        </FilterField>

        <FilterField label="Company">
          <input type="text" value={local.company || ""} onChange={(e) => set("company", e.target.value)} className={fieldClass} placeholder="Acme Inc" />
        </FilterField>

        <FilterField label="Role / Title">
          <input type="text" value={local.role || ""} onChange={(e) => set("role", e.target.value)} className={fieldClass} placeholder="Founder, CEO" />
        </FilterField>
      </FilterGroup>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FilterGroup title="Flags">
          <FilterField label="Do Not Contact">
            <select value={local.doNotContact ?? ""} onChange={(e) => set("doNotContact", e.target.value)} className={selectClass}>
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </FilterField>

          <FilterField label="Bounced">
            <select value={local.bounced ?? ""} onChange={(e) => set("bounced", e.target.value)} className={selectClass}>
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </FilterField>

          <FilterField label="Unsubscribed">
            <select value={local.unsubscribe ?? ""} onChange={(e) => set("unsubscribe", e.target.value)} className={selectClass}>
              <option value="">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </FilterField>
        </FilterGroup>

        <FilterGroup title="Date Range">
          <FilterField label="Created From">
            <input type="date" value={local.dateFrom || ""} onChange={(e) => set("dateFrom", e.target.value)} className={fieldClass} />
          </FilterField>

          <FilterField label="Created To">
            <input type="date" value={local.dateTo || ""} onChange={(e) => set("dateTo", e.target.value)} className={fieldClass} />
          </FilterField>
        </FilterGroup>
      </div>

      <div className="flex items-center gap-2 mt-2 pt-5 border-t border-[#1a1a1a]">
        <button
          onClick={() => onApply(local)}
          className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-medium bg-white text-black rounded-md hover:bg-[#e5e5e5] transition-colors"
        >
          Apply filters
        </button>
        <button
          onClick={() => { setLocal({}); onClear(); }}
          className="inline-flex items-center justify-center h-9 px-4 text-[13px] font-medium bg-transparent border border-[#262626] text-[#a1a1aa] rounded-md hover:bg-[#161616] hover:text-white hover:border-[#3f3f3f] transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-[#71717a] uppercase tracking-wider mb-3 leading-none">{title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {children}
      </div>
    </div>
  );
}

function FilterField({ label, children }) {
  return (
    <div>
      <label className="block text-[12px] font-medium text-[#a1a1aa] mb-1.5 leading-none">{label}</label>
      {children}
    </div>
  );
}
