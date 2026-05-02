import { useState, useEffect, useRef } from "react";
import { useContacts } from "../hooks/useContacts";
import { api } from "../api";
import ContactTable from "../components/ContactTable";
import FilterPanel from "../components/FilterPanel";
import BulkActions from "../components/BulkActions";
import StatsBar from "../components/StatsBar";
import {
  Search, SlidersHorizontal, X, Upload, Play, Zap, Settings,
  CheckCircle, AlertCircle, Mail, BarChart3, Shield
} from "lucide-react";
import { toast } from "react-hot-toast";
import UploadModal from "../components/UploadModal";

export default function EnhancedDashboard() {
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

  // State
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [showSequenceModal, setShowSequenceModal] = useState(false);
  const [sequenceType, setSequenceType] = useState("A");
  const [sendingSequenceEmail, setSendingSequenceEmail] = useState(false);
  const [initializingSequence, setInitializingSequence] = useState(false);
  const [runningScheduled, setRunningScheduled] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    api.getStats().then((d) => setStats(d.data)).catch(console.error);
  }, []);

  // ==================== HANDLERS ====================

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

  // Send Email to Selected
  const handleSendEmail = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    try {
      setSendingSequenceEmail(true);
      const res = await api.sendEmails(selected);
      toast.success(`Sent ${res.successful} emails, ${res.failed} failed`);
      setSelected([]);
      refetch();
      api.getStats().then((d) => setStats(d.data)).catch(console.error);
    } catch (err) {
      toast.error("Failed to send emails: " + err.message);
    } finally {
      setSendingSequenceEmail(false);
    }
  };

  // Initialize Sequence for Selected
  const handleInitializeSequence = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    try {
      setInitializingSequence(true);
      let successCount = 0;
      let failCount = 0;

      for (const contactId of selected) {
        try {
          await api.sequences.initialize(contactId, sequenceType);
          successCount++;
        } catch (err) {
          failCount++;
          console.error(`Failed for ${contactId}:`, err.message);
        }
      }

      toast.success(`Started ${successCount} sequence${successCount !== 1 ? 's' : ''} (${sequenceType})`);
      if (failCount > 0) toast.error(`Failed to start ${failCount} sequence${failCount !== 1 ? 's' : ''}`);

      setSelected([]);
      setShowSequenceModal(false);
      refetch();
    } catch (err) {
      toast.error("Error: " + err.message);
    } finally {
      setInitializingSequence(false);
    }
  };

  // Run Scheduled Sends
  const handleRunScheduled = async () => {
    try {
      setRunningScheduled(true);
      const res = await api.sequences.runScheduled(50);
      toast.success(`Sent ${res.results.successful} emails, ${res.results.failed} failed`);
      refetch();
      api.getStats().then((d) => setStats(d.data)).catch(console.error);
    } catch (err) {
      toast.error("Failed to run scheduled sends: " + err.message);
    } finally {
      setRunningScheduled(false);
    }
  };

  // Send Followup to Selected
  const handleSendFollowup = async () => {
    if (selected.length === 0) {
      toast.error("Please select at least one contact");
      return;
    }

    try {
      setSendingSequenceEmail(true);
      const res = await api.sendFollowups(selected);
      toast.success(`Sent ${res.successful} followups, ${res.failed} failed`);
      setSelected([]);
      refetch();
      api.getStats().then((d) => setStats(d.data)).catch(console.error);
    } catch (err) {
      toast.error("Failed to send followups: " + err.message);
    } finally {
      setSendingSequenceEmail(false);
    }
  };

  const activeFilterCount = Object.keys(filters).length;

  // ==================== RENDER ====================

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight text-white">Outreach</h1>
            <p className="text-sm text-gray-400 max-w-xl">
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

      {/* Action Buttons Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={handleRunScheduled}
          disabled={runningScheduled}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Run scheduled email sends for all contacts due"
        >
          <Zap className="w-4 h-4" />
          {runningScheduled ? "Running..." : "Run Scheduled"}
        </button>

        <button
          onClick={handleSendEmail}
          disabled={selected.length === 0 || sendingSequenceEmail}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={`Send email to ${selected.length} contact${selected.length !== 1 ? 's' : ''}`}
        >
          <Mail className="w-4 h-4" />
          {sendingSequenceEmail ? "Sending..." : "Send Email"}
        </button>

        <button
          onClick={handleSendFollowup}
          disabled={selected.length === 0 || sendingSequenceEmail}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={`Send followup to ${selected.length} contact${selected.length !== 1 ? 's' : ''}`}
        >
          <Mail className="w-4 h-4" />
          {sendingSequenceEmail ? "Sending..." : "Send Followup"}
        </button>

        <button
          onClick={() => setShowSequenceModal(true)}
          disabled={selected.length === 0}
          className="inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title={`Start email sequence for ${selected.length} contact${selected.length !== 1 ? 's' : ''}`}
        >
          <Play className="w-4 h-4" />
          Start Sequence
        </button>
      </div>

      {/* Toolbar with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 min-w-0 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" strokeWidth={2} />
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

      {/* Selection Info Bar */}
      {selected.length > 0 && (
        <div className="flex items-center justify-between p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <span className="text-sm font-medium text-white">
            {selected.length} contact{selected.length !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={() => setSelected([])}
            className="text-xs text-blue-400 hover:text-blue-300"
          >
            Clear selection
          </button>
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

      {/* Upload Modal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onDone={() => {
            refetch();
            api.getStats().then((d) => setStats(d.data)).catch(console.error);
          }}
        />
      )}

      {/* Sequence Modal */}
      {showSequenceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#0d0d0d] border border-[#262626] rounded-lg shadow-2xl w-full max-w-md p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-white">Start Email Sequence</h3>
              <p className="text-sm text-gray-400 mt-1">
                Initialize sequence for {selected.length} contact{selected.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-white">Select Sequence Type:</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { type: "A", name: "Sequence A", desc: "US Shopify DTC" },
                  { type: "B", name: "Sequence B", desc: "UK Founder SMBs" }
                ].map(({ type, name, desc }) => (
                  <button
                    key={type}
                    onClick={() => setSequenceType(type)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      sequenceType === type
                        ? "border-white bg-white/10"
                        : "border-[#262626] hover:border-[#3f3f3f]"
                    }`}
                  >
                    <div className={`text-sm font-semibold ${sequenceType === type ? "text-white" : "text-gray-400"}`}>
                      {name}
                    </div>
                    <div className={`text-xs ${sequenceType === type ? "text-gray-300" : "text-gray-600"}`}>
                      {desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#161616] rounded-lg p-3 border border-[#262626]">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-white">5 emails</span> over <span className="font-semibold text-white">18 days</span>
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Days: 0, 3, 7, 12, 18 from initialization
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setShowSequenceModal(false)}
                className="flex-1 px-4 py-2 bg-[#161616] text-gray-400 rounded-lg hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInitializeSequence}
                disabled={initializingSequence}
                className="flex-1 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-100 disabled:opacity-50 font-medium transition-colors"
              >
                {initializingSequence ? "Starting..." : "Start Sequence"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
