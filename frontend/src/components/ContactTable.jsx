import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Columns3,
  Inbox,
} from "lucide-react";

const ALL_COLUMNS = [
  { key: "firstName", label: "Name", minW: "min-w-[200px]" },
  { key: "email", label: "Email", minW: "min-w-[240px]" },
  { key: "companyName", label: "Company", minW: "min-w-[160px]" },
  { key: "title", label: "Title", minW: "min-w-[160px]" },
  { key: "outreachStatus", label: "Status", minW: "min-w-[140px]" },
  { key: "emailStats.emailsSent", label: "Sent", minW: "min-w-[80px]" },
  { key: "reply.replied", label: "Replied", minW: "min-w-[90px]" },
  { key: "followup.followupCount", label: "Followups", minW: "min-w-[100px]" },
  { key: "flags.doNotContact", label: "DNC", minW: "min-w-[70px]" },
];

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

// Consistent row padding tokens
const CELL_X = "px-3";
const CELL_Y = "py-3";
const FIRST_X = "pl-4 pr-2"; // checkbox column
const FIRST_W = "w-10";

function getNestedValue(obj, path) {
  return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

function initials(c) {
  return ((c.firstName?.[0] || "") + (c.lastName?.[0] || "")).toUpperCase() || "?";
}

export default function ContactTable({
  contacts,
  loading,
  selected,
  onSelect,
  onSelectAll,
  pagination,
  onPageChange,
  onSort,
}) {
  const navigate = useNavigate();
  const [visibleCols, setVisibleCols] = useState(ALL_COLUMNS.map((c) => c.key));
  const [showColPicker, setShowColPicker] = useState(false);
  const [sortField, setSortField] = useState("-createdAt");
  const [dragStart, setDragStart] = useState(null);

  const toggleCol = (key) => {
    setVisibleCols((prev) =>
      prev.includes(key) ? prev.filter((c) => c !== key) : [...prev, key]
    );
  };

  const handleSort = (key) => {
    const newSort = sortField === key ? `-${key}` : key;
    setSortField(newSort);
    onSort(newSort);
  };

  const getSortIcon = (key) => {
    if (sortField === key) return <ArrowUp className="w-3 h-3 text-white" />;
    if (sortField === `-${key}`) return <ArrowDown className="w-3 h-3 text-white" />;
    return <ArrowUpDown className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />;
  };

  const columns = ALL_COLUMNS.filter((c) => visibleCols.includes(c.key));
  const allSelected = contacts.length > 0 && selected.length === contacts.length;

  const handleMouseDown = (id) => setDragStart(id);
  const handleMouseEnter = (id) => {
    if (dragStart === null) return;
    const startIdx = contacts.findIndex((c) => c._id === dragStart);
    const endIdx = contacts.findIndex((c) => c._id === id);
    if (startIdx === -1 || endIdx === -1) return;
    const min = Math.min(startIdx, endIdx);
    const max = Math.max(startIdx, endIdx);
    const range = contacts.slice(min, max + 1).map((c) => c._id);
    range.forEach((rid) => {
      if (!selected.includes(rid)) onSelect(rid);
    });
  };
  const handleMouseUp = () => setDragStart(null);

  const startRow = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endRow = Math.min(pagination.page * pagination.limit, pagination.total);

  return (
    <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg overflow-hidden">
      {/* Table Toolbar */}
      <div className="flex items-center justify-between h-11 px-4 border-b border-[#1a1a1a]">
        <div className="flex items-center gap-2 text-[12px] leading-none">
          <span className="font-mono tabular-nums text-[#a1a1aa]">
            {pagination.total.toLocaleString()} {pagination.total === 1 ? "result" : "results"}
          </span>
          {selected.length > 0 && (
            <>
              <span className="text-[#3f3f3f]">·</span>
              <span className="font-mono tabular-nums text-white">{selected.length} selected</span>
            </>
          )}
        </div>

        {/* Column Picker */}
        <div className="relative">
          <button
            onClick={() => setShowColPicker(!showColPicker)}
            className="inline-flex items-center gap-1.5 h-7 px-2.5 text-[12px] font-medium text-[#a1a1aa] hover:text-white hover:bg-[#161616] rounded-md transition-colors leading-none"
          >
            <Columns3 className="w-3.5 h-3.5" />
            Columns
          </button>
          {showColPicker && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowColPicker(false)} />
              <div className="absolute right-0 top-full mt-1.5 bg-[#0d0d0d] border border-[#262626] rounded-md shadow-2xl shadow-black/50 p-1 z-20 w-52">
                <p className="px-2.5 py-1.5 text-[10px] font-mono font-semibold text-[#52525b] uppercase tracking-wider leading-none">
                  Toggle columns
                </p>
                {ALL_COLUMNS.map((col) => (
                  <label
                    key={col.key}
                    className="flex items-center gap-2.5 px-2.5 py-1.5 text-[13px] text-[#ededed] hover:bg-[#161616] rounded cursor-pointer transition-colors leading-none"
                  >
                    <input
                      type="checkbox"
                      checked={visibleCols.includes(col.key)}
                      onChange={() => toggleCol(col.key)}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto" onMouseUp={handleMouseUp}>
        <table className="w-full text-[13px] border-collapse">
          <thead>
            <tr className="border-b border-[#1a1a1a] bg-[#0d0d0d]">
              <th className={`${FIRST_W} ${FIRST_X} h-9 text-left align-middle`}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${CELL_X} h-9 text-left align-middle text-[11px] font-medium text-[#71717a] uppercase tracking-wider cursor-pointer select-none group ${col.minW}`}
                >
                  <span className="inline-flex items-center gap-1.5 leading-none hover:text-white transition-colors">
                    {col.label}
                    {getSortIcon(col.key)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-[#141414] last:border-b-0">
                  <td className={`${FIRST_W} ${FIRST_X} ${CELL_Y} align-middle`}>
                    <div className="w-3.5 h-3.5 rounded shimmer" />
                  </td>
                  {columns.map((col) => (
                    <td key={col.key} className={`${CELL_X} ${CELL_Y} align-middle`}>
                      <div className="h-3 rounded shimmer" style={{ width: `${30 + Math.random() * 50}%` }} />
                    </td>
                  ))}
                </tr>
              ))
            ) : contacts.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="py-20">
                  <div className="flex flex-col items-center justify-center gap-2 text-[#52525b]">
                    <Inbox className="w-8 h-8 stroke-[1.5]" />
                    <div className="text-center mt-1">
                      <p className="text-[13px] font-medium text-[#a1a1aa] leading-tight">No results found</p>
                      <p className="text-[12px] text-[#52525b] mt-1 leading-tight">Try adjusting your search or filters</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              contacts.map((contact) => (
                <tr
                  key={contact._id}
                  className={`group border-b border-[#141414] last:border-b-0 transition-colors cursor-pointer ${
                    selected.includes(contact._id)
                      ? "bg-[#161616]"
                      : "hover:bg-[#0f0f0f]"
                  }`}
                  onMouseDown={() => handleMouseDown(contact._id)}
                  onMouseEnter={() => handleMouseEnter(contact._id)}
                >
                  <td className={`${FIRST_W} ${FIRST_X} ${CELL_Y} align-middle`} onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selected.includes(contact._id)}
                      onChange={() => onSelect(contact._id)}
                    />
                  </td>
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${CELL_X} ${CELL_Y} align-middle whitespace-nowrap`}
                      onClick={() => {
                        if (dragStart === null) navigate(`/contacts/${contact._id}`);
                      }}
                    >
                      {col.key === "firstName" ? (
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-zinc-500 to-zinc-700 ring-1 ring-[#2a2a2a] grid place-items-center text-[10px] font-mono font-semibold text-white shrink-0 leading-none">
                            {initials(contact)}
                          </div>
                          <span className="font-medium text-white group-hover:underline underline-offset-4 decoration-[#3f3f3f] truncate">
                            {contact.firstName} {contact.lastName}
                          </span>
                        </div>
                      ) : col.key === "email" ? (
                        <span className="font-mono text-[12px] text-[#a1a1aa] truncate block">{contact.email || "—"}</span>
                      ) : col.key === "outreachStatus" ? (
                        <span className="inline-flex items-center gap-1.5 leading-none">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[contact.outreachStatus] || STATUS_DOT.NOT_SENT}`} />
                          <span className={`text-[12px] font-medium ${STATUS_TEXT[contact.outreachStatus] || STATUS_TEXT.NOT_SENT}`}>
                            {(contact.outreachStatus || "NOT_SENT").replace(/_/g, " ").toLowerCase()}
                          </span>
                        </span>
                      ) : col.key === "reply.replied" ? (
                        <span className={`inline-flex items-center gap-1.5 text-[12px] leading-none ${
                          getNestedValue(contact, col.key) ? "text-emerald-400" : "text-[#52525b]"
                        }`}>
                          <span className={`w-1 h-1 rounded-full shrink-0 ${
                            getNestedValue(contact, col.key) ? "bg-emerald-500" : "bg-[#3f3f3f]"
                          }`} />
                          {getNestedValue(contact, col.key) ? "Yes" : "No"}
                        </span>
                      ) : col.key === "flags.doNotContact" ? (
                        getNestedValue(contact, col.key) ? (
                          <span className="inline-flex items-center h-[18px] px-1.5 text-[10px] font-mono font-semibold tracking-wider rounded bg-red-500/10 text-red-400 border border-red-500/20 leading-none">
                            DNC
                          </span>
                        ) : (
                          <span className="text-[#3f3f3f]">—</span>
                        )
                      ) : col.key.includes(".") ? (
                        <span className="font-mono tabular-nums text-[#a1a1aa]">
                          {getNestedValue(contact, col.key) ?? 0}
                        </span>
                      ) : (
                        <span className="text-[#d4d4d8] truncate block">
                          {getNestedValue(contact, col.key) || <span className="text-[#3f3f3f]">—</span>}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-[#1a1a1a]">
          <p className="text-[12px] text-[#a1a1aa] font-mono tabular-nums leading-none order-2 sm:order-1">
            <span className="text-white">{startRow}</span>
            <span className="text-[#3f3f3f] mx-1">–</span>
            <span className="text-white">{endRow}</span>
            <span className="text-[#71717a] mx-1.5">of</span>
            <span className="text-white">{pagination.total.toLocaleString()}</span>
          </p>

          <div className="flex items-center gap-1 order-1 sm:order-2">
            <PageBtn
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              ariaLabel="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </PageBtn>
            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              let page;
              if (pagination.pages <= 5) page = i + 1;
              else if (pagination.page <= 3) page = i + 1;
              else if (pagination.page >= pagination.pages - 2) page = pagination.pages - 4 + i;
              else page = pagination.page - 2 + i;
              const active = page === pagination.page;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`inline-flex items-center justify-center w-8 h-8 text-[12px] font-mono font-medium rounded-md transition-colors leading-none ${
                    active
                      ? "bg-white text-black"
                      : "text-[#a1a1aa] hover:text-white hover:bg-[#161616]"
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <PageBtn
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
              ariaLabel="Next page"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </PageBtn>
          </div>
        </div>
      )}
    </div>
  );
}

function PageBtn({ onClick, disabled, children, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[#a1a1aa] hover:text-white hover:bg-[#161616] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[#a1a1aa] transition-colors"
    >
      {children}
    </button>
  );
}
