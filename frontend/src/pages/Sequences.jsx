import { useEffect, useState } from "react";
import { api } from "../api";
import { Mail, RefreshCw } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Sequences() {
  const [health, setHealth] = useState(null);
  const [dueEmails, setDueEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, [filter]);

  async function loadData() {
    try {
      setLoading(true);
      const [healthRes, dueRes] = await Promise.all([
        api.sequences.health(),
        api.sequences.dueForEmail(filter === "all" ? null : filter),
      ]);
      setHealth(healthRes);
      setDueEmails(dueRes.data || []);
    } catch (err) {
      toast.error("Failed to load sequences: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRunScheduled() {
    try {
      setRunning(true);
      const res = await api.sequences.runScheduled(50);
      toast.success(`Sent ${res.successful} emails, ${res.failed} failed`);
      await loadData();
    } catch (err) {
      toast.error("Failed to run scheduled sends: " + err.message);
    } finally {
      setRunning(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading sequences...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-white">Sequences</h1>
              <p className="text-sm text-gray-400 mt-1">Manage and monitor email sequences</p>
            </div>
            <button
              onClick={handleRunScheduled}
              disabled={running}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4" />
              {running ? "Running..." : "Run Scheduled Sends"}
            </button>
          </div>

          {health && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
                <div className="text-sm text-gray-400 mb-2">Active Sequences</div>
                <div className="text-3xl font-semibold text-white">{health.activeSequences}</div>
              </div>
              <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
                <div className="text-sm text-gray-400 mb-2">Ready to Send</div>
                <div className="text-3xl font-semibold text-white">{health.readyToSend}</div>
              </div>
              <div className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
                <div className="text-sm text-gray-400 mb-2">Total Sent</div>
                <div className="text-3xl font-semibold text-white">{health.totalEmailsSent || "—"}</div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {["all", "A", "B"].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === type
                    ? "bg-white text-black"
                    : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                }`}
              >
                {type === "all" ? "All Sequences" : `Sequence ${type}`}
              </button>
            ))}
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Mail className="w-5 h-5" />
              Due for Email ({dueEmails.length})
            </h2>
            {dueEmails.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No contacts due for email right now</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Company</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email #</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Scheduled For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700">
                    {dueEmails.map((contact) => (
                      <tr key={contact._id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-medium">{contact.firstName}</td>
                        <td className="px-6 py-4 text-gray-300 text-sm">{contact.email}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{contact.companyName || "—"}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{contact.emailSequence?.nextEmailNumber || "—"}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {contact.emailSequence?.nextEmailScheduledFor
                            ? new Date(contact.emailSequence.nextEmailScheduledFor).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
