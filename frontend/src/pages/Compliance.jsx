import { useEffect, useState } from "react";
import { api } from "../api";
import { CheckCircle, AlertCircle, XCircle, Shield, Mail } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Compliance() {
  const [complianceScore, setComplianceScore] = useState(null);
  const [auditLog, setAuditLog] = useState([]);
  const [suppression, setSuppression] = useState([]);
  const [suppressionStats, setSuppressionStats] = useState(null);
  const [sequenceType, setSequenceType] = useState("A");
  const [loading, setLoading] = useState(true);
  const [checkingCompliance, setCheckingCompliance] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newReason, setNewReason] = useState("doNotContact");

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    try {
      setLoading(true);
      const [auditRes, suppRes, statsRes] = await Promise.all([
        api.compliance.auditLog(1, 20),
        api.compliance.suppression(1, 20),
        api.compliance.suppressionStats(),
      ]);
      setAuditLog(auditRes.data || []);
      setSuppression(suppRes.data || []);
      setSuppressionStats(statsRes.data);
    } catch (err) {
      toast.error("Failed to load compliance data: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckCompliance() {
    try {
      setCheckingCompliance(true);
      const res = await api.compliance.checkCompliance(sequenceType);
      setComplianceScore(res);
      toast.success("Compliance check completed");
    } catch (err) {
      toast.error("Failed to check compliance: " + err.message);
    } finally {
      setCheckingCompliance(false);
    }
  }

  async function handleAddSuppression() {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    try {
      await api.compliance.addSuppression(newEmail, newReason);
      toast.success("Email added to suppression list");
      setNewEmail("");
      await loadAllData();
    } catch (err) {
      toast.error("Failed to add suppression: " + err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading compliance data...</div>
      </div>
    );
  }

  const scoreColor = !complianceScore
    ? "gray"
    : complianceScore.score >= 80
    ? "green"
    : complianceScore.score >= 60
    ? "yellow"
    : "red";

  const scoreColorMap = {
    green: "bg-emerald-500/20 text-emerald-400",
    yellow: "bg-amber-500/20 text-amber-400",
    red: "bg-red-500/20 text-red-400",
    gray: "bg-gray-500/20 text-gray-400",
  };

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-white">Compliance</h1>
            <p className="text-sm text-gray-400 mt-1">Email compliance, suppression, and audit logs</p>
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
              <h2 className="text-xl font-semibold text-white flex items-center gap-3">
                <Shield className="w-5 h-5" />
                Compliance Score
              </h2>
              <div className="flex gap-2">
                {["A", "B"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSequenceType(type)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      sequenceType === type
                        ? "bg-white text-black"
                        : "bg-neutral-800 text-gray-400 hover:bg-neutral-700"
                    }`}
                  >
                    Sequence {type}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCheckCompliance}
              disabled={checkingCompliance}
              className="mb-8 px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {checkingCompliance ? "Checking..." : "Run Compliance Check"}
            </button>

            {complianceScore && (
              <>
                <div className="mb-8">
                  <div className="flex items-center gap-6 mb-6">
                    <div className="text-5xl font-bold text-white">{complianceScore.score}</div>
                    <div>
                      <div className="text-sm text-gray-400 mb-2">Overall Score</div>
                      <div className={`inline-block px-4 py-1 rounded-full text-sm font-medium ${scoreColorMap[scoreColor]}`}>
                        {complianceScore.compliant ? "Compliant" : "Review Required"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-800/50 rounded-xl overflow-hidden mb-8">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-700">
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Check</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Status</th>
                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                      {Object.entries(complianceScore.checks).map(([name, check]) => (
                        <tr key={name} className="hover:bg-neutral-800/30 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-medium capitalize">
                            {name.replace(/([A-Z])/g, " $1").trim()}
                          </td>
                          <td className="px-6 py-4">
                            {check.pass ? (
                              <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-400">{check.detail}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {complianceScore.recommendations.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                    <h3 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Recommendations
                    </h3>
                    <ul className="space-y-2">
                      {complianceScore.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm text-gray-300 flex gap-3">
                          <span className="text-amber-400 mt-0.5">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
            <h2 className="text-xl font-semibold text-white mb-6">Audit Log</h2>
            {auditLog.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No audit log entries yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Time</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Event</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Sequence</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700">
                    {auditLog.map((entry) => (
                      <tr key={entry._id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-block px-2 py-1 rounded-md text-xs font-medium bg-neutral-800 text-gray-400">
                            {entry.eventType.replace(/_/g, " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-white font-mono">{entry.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-400">{entry.sequenceType || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-3">
              <Mail className="w-5 h-5" />
              Suppression List
            </h2>

            {suppressionStats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-neutral-800/50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-400 mb-1">Total Suppressed</div>
                  <div className="text-2xl font-semibold text-white">{suppressionStats.totalSuppressed}</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-400 mb-1">Bounced</div>
                  <div className="text-2xl font-semibold text-white">{suppressionStats.bounced}</div>
                </div>
                <div className="bg-neutral-800/50 rounded-lg px-4 py-3">
                  <div className="text-xs text-gray-400 mb-1">Unsubscribed</div>
                  <div className="text-2xl font-semibold text-white">{suppressionStats.unsubscribed}</div>
                </div>
              </div>
            )}

            <div className="bg-neutral-800/30 rounded-xl p-4 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="Enter email to suppress..."
                  className="flex-1 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
                />
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-gray-500 transition-colors"
                >
                  <option value="bounced">Bounced</option>
                  <option value="unsubscribe">Unsubscribed</option>
                  <option value="doNotContact">Do Not Contact</option>
                </select>
                <button
                  onClick={handleAddSuppression}
                  className="px-6 py-2 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  Add
                </button>
              </div>
            </div>

            {suppression.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No suppressed emails yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-700">
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Reason</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-400">Added</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-700">
                    {suppression.map((contact) => (
                      <tr key={contact._id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-6 py-4 text-white font-mono text-xs">{contact.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-300">{contact.firstName || "—"}</td>
                        <td className="px-6 py-4">
                          <span className="text-xs px-2 py-1 rounded-md bg-neutral-800 text-gray-400">
                            {contact.flags?.bounced ? "Bounced" : contact.flags?.unsubscribe ? "Unsubscribed" : "DNC"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-400">
                          {contact.flags?.bouncedAt ? new Date(contact.flags.bouncedAt).toLocaleDateString() : "—"}
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
