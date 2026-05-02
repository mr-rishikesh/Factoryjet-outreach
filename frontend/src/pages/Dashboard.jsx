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
    <div className="space-y-8">
      {/* Page Header with gradient effect */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">Outreach</h1>
            <p className="text-sm text-[#71717a] max-w-xl">
              Manage prospects, automate cold emails, and track replies — all in one place.
            </p>
          </div>
          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold bg-white text-black rounded-lg hover:bg-gray-100 transition-all duration-200 active:scale-95 self-start sm:self-auto shrink-0 shadow-sm hover:shadow-md"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      {stats && <StatsBar stats={stats} />}

      {/* Toolbar with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#52525b] pointer-events-none" strokeWidth={2} />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
              value={searchInput}
              onChange={handleSearchChange}
              className="w-full h-10 pl-10 pr-4 text-sm bg-[#0d0d0d] border border-[#262626] text-white placeholder:text-[#52525b] focus:outline-none focus:border-[#3f3f3f] focus:ring-1 focus:ring-[#3f3f3f] rounded-lg transition-colors"
            />
          </div>
        </form>

        {/* Divider */}
        <div className="w-px h-5 bg-[#1f1f1f] shrink-0 hidden sm:block" />

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 h-10 px-3 text-sm font-medium rounded-lg transition-colors shrink-0 ${
            showFilters || activeFilterCount > 0
              ? "bg-[#161616] text-white border border-[#262626]"
              : "text-[#a1a1aa] hover:text-white hover:bg-[#161616] border border-[#262626]"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center bg-white text-black text-xs font-mono font-semibold rounded h-5 min-w-5 px-1.5">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear Filters */}
        {activeFilterCount > 0 && (
          <button
            onClick={() => { clearFilters(); setShowFilters(false); }}
            className="inline-flex items-center gap-1.5 h-10 px-3 text-sm font-medium text-[#71717a] hover:text-red-400 hover:bg-red-500/10 border border-[#262626] rounded-lg transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        )}

        {/* Page Size */}
        <select
          value={pagination.limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="h-10 px-3 text-sm bg-[#0d0d0d] border border-[#262626] rounded-lg text-[#a1a1aa] cursor-pointer hover:border-[#3f3f3f] hover:text-white transition-colors shrink-0"
        >
          <option value={10}>10 rows</option>
          <option value={25}>25 rows</option>
          <option value={50}>50 rows</option>
          <option value={100}>100 rows</option>
        </select>
      </div>

      {showFilters && (
        <div className="bg-[#0d0d0d] border border-[#262626] rounded-lg p-4">
          <FilterPanel
            filters={filters}
            onApply={(f) => { applyFilters(f); setShowFilters(false); }}
            onClear={clearFilters}
          />
        </div>
      )}

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
