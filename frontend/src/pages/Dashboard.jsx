import { useState, useEffect, useRef } from "react";
import { useContacts } from "../hooks/useContacts";
import { api } from "../api";
import ContactTable from "../components/ContactTable";
import FilterPanel from "../components/FilterPanel";
import BulkActions from "../components/BulkActions";
import StatsBar from "../components/StatsBar";
import { Search, SlidersHorizontal, X, Upload } from "lucide-react";
import UploadModal from "../components/UploadModal";

export default function Dashboard() {
  const {
    contacts,
    pagination,
    loading,
    setSearch,
    setPage,
    setSort,
    setLimit,
    filters,
    applyFilters,
    clearFilters,
    refetch,
  } = useContacts();

  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    api.getStats().then((d) => setStats(d.data)).catch(console.error);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchInput(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearch(val.trim()), 400);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    clearTimeout(debounceRef.current);
    setSearch(searchInput.trim());
  };

  const handleSelectAll = (checked) => {
    setSelected(checked ? contacts.map((c) => c._id) : []);
  };

  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const activeFilterCount = Object.keys(filters).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight text-white leading-tight">Outreach</h1>
          <p className="text-[13px] text-[#a1a1aa] mt-1.5 leading-relaxed">
            Manage prospects, automate cold emails, and track replies — all in one place.
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="inline-flex items-center gap-2 h-9 px-3.5 text-[13px] font-medium bg-white text-black rounded-md hover:bg-[#e5e5e5] transition-colors self-start sm:self-auto shrink-0"
        >
          <Upload className="w-3.5 h-3.5" />
          Import CSV
        </button>
      </div>

      {/* Stats */}
      {stats && <StatsBar stats={stats} />}

      {/* Toolbar */}
      <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-lg">
        <div className="flex items-center gap-1 p-1.5">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#525252] pointer-events-none" strokeWidth={2} />
              <input
                type="text"
                placeholder="Search by name, email, or company..."
                value={searchInput}
                onChange={handleSearchChange}
                className="w-full h-9 pl-9 pr-3 text-[13px] bg-transparent border-0 text-[#ededed] placeholder:text-[#52525b] focus:outline-none focus:ring-0 rounded-md"
              />
            </div>
          </form>

          {/* Divider */}
          <div className="w-px h-5 bg-[#1f1f1f] shrink-0" />

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 h-9 px-3 text-[13px] font-medium rounded-md transition-colors shrink-0 ${
              showFilters || activeFilterCount > 0
                ? "bg-[#161616] text-white"
                : "text-[#a1a1aa] hover:text-white hover:bg-[#161616]"
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline leading-none">Filters</span>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center bg-white text-black text-[10px] font-mono font-semibold rounded h-4 min-w-4 px-1 leading-none">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => { clearFilters(); setShowFilters(false); }}
              className="inline-flex items-center gap-1.5 h-9 px-2.5 text-[13px] font-medium text-[#71717a] hover:text-red-400 transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span className="hidden sm:inline leading-none">Clear</span>
            </button>
          )}

          {/* Page Size */}
          <select
            value={pagination.limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="appearance-none h-9 pl-3 pr-7 text-[13px] bg-transparent border border-[#262626] rounded-md text-[#a1a1aa] cursor-pointer hover:border-[#3f3f3f] hover:text-white transition-colors shrink-0 bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2210%22 height=%2210%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23a1a1aa%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22/></svg>')] bg-no-repeat bg-[right_8px_center] bg-[length:10px_10px]"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {showFilters && (
          <div className="border-t border-[#1a1a1a]">
            <FilterPanel
              filters={filters}
              onApply={(f) => { applyFilters(f); setShowFilters(false); }}
              onClear={clearFilters}
            />
          </div>
        )}
      </div>

      {/* Bulk Actions */}
      {selected.length > 0 && (
        <BulkActions
          selectedIds={selected}
          count={selected.length}
          onClear={() => setSelected([])}
          onDone={() => { setSelected([]); refetch(); }}
        />
      )}

      {/* Table */}
      <ContactTable
        contacts={contacts}
        loading={loading}
        selected={selected}
        onSelect={handleSelect}
        onSelectAll={handleSelectAll}
        pagination={pagination}
        onPageChange={setPage}
        onSort={setSort}
      />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => {
            refetch();
            api.getStats().then((d) => setStats(d.data)).catch(console.error);
          }}
        />
      )}
    </div>
  );
}
