import { useEffect, useState } from "react";
import { api } from "../api";
import { toast } from "react-hot-toast";

const SimpleBarChart = ({ data, dataKey }) => {
  const maxValue = Math.max(...data.map((d) => d[dataKey] || 0), 1);
  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.name} className="flex items-center gap-4">
          <div className="w-32 text-sm text-gray-400">{item.name}</div>
          <div className="flex-1 bg-neutral-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${(item[dataKey] / maxValue) * 100}%` }}
            />
          </div>
          <div className="w-12 text-right text-white font-semibold text-sm">{item[dataKey]}</div>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadAnalytics();
  }, [filter]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await api.sequences.analytics(filter === "all" ? null : filter);
      setAnalytics(res);
    } catch (err) {
      toast.error("Failed to load analytics: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-400">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-gray-400">No analytics data available</div>;
  }

  const statusData = Object.entries(analytics.sequenceStatusBreakdown).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    count,
  }));

  const emailFunnelData = Object.entries(analytics.emailsSentBreakdown).map(([email, count]) => ({
    name: email,
    sent: count,
  }));

  const abTestData = Object.entries(analytics.abTestResults).map(([variant, data]) => ({
    name: variant,
    sent: data.sent,
    replies: data.replies,
    replyRate: parseFloat(data.replyRate.toFixed(2)),
  }));

  const summaryStats = [
    { label: "Total Sequences", value: analytics.totalSequencesStarted },
    { label: "Total Replies", value: analytics.totalReplies },
    { label: "Reply Rate", value: `${analytics.replyRate.toFixed(1)}%` },
    { label: "Avg Emails/Sequence", value: analytics.avgEmailsPerSequence.toFixed(1) },
    { label: "Total Bounced", value: analytics.bounceStats.totalBounced },
    { label: "Hard Bounces", value: analytics.bounceStats.hardBounces },
  ];

  return (
    <div className="w-full">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-semibold text-white">Analytics</h1>
            <p className="text-sm text-gray-400 mt-1">Performance metrics and sequence insights</p>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
                <div className="text-xs text-gray-400 mb-2">{stat.label}</div>
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
              <h2 className="text-lg font-semibold text-white mb-6">Sequence Status Breakdown</h2>
              <SimpleBarChart data={statusData} dataKey="count" />
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
              <h2 className="text-lg font-semibold text-white mb-6">Email Funnel</h2>
              <SimpleBarChart data={emailFunnelData} dataKey="sent" />
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
              <h2 className="text-lg font-semibold text-white mb-6">A/B Test Performance</h2>
              <div className="space-y-6">
                {abTestData.map((variant) => (
                  <div key={variant.name}>
                    <div className="text-sm font-semibold text-white mb-3">{variant.name}</div>
                    <div className="space-y-2 ml-2">
                      <div className="flex items-center gap-3">
                        <div className="w-20 text-xs text-gray-400">Sent</div>
                        <div className="flex-1 bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-blue-500 h-full"
                            style={{ width: `${(variant.sent / Math.max(...abTestData.map((d) => d.sent))) * 100}%` }}
                          />
                        </div>
                        <div className="w-8 text-right text-white text-xs font-semibold">{variant.sent}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-20 text-xs text-gray-400">Replies</div>
                        <div className="flex-1 bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-purple-500 h-full"
                            style={{
                              width: `${(variant.replies / Math.max(...abTestData.map((d) => d.replies), 1)) * 100}%`,
                            }}
                          />
                        </div>
                        <div className="w-8 text-right text-white text-xs font-semibold">{variant.replies}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-neutral-900 rounded-2xl p-6 sm:p-8 border border-neutral-800">
              <h2 className="text-lg font-semibold text-white mb-6">Bounce Analysis</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-lg">
                  <span className="text-sm text-gray-400">Total Bounced</span>
                  <span className="text-white font-semibold">{analytics.bounceStats.totalBounced}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                  <span className="text-sm text-gray-300">Hard Bounces</span>
                  <span className="text-red-400 font-semibold">{analytics.bounceStats.hardBounces}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <span className="text-sm text-gray-300">Soft Bounces</span>
                  <span className="text-amber-400 font-semibold">{analytics.bounceStats.softBounces}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                  <span className="text-sm text-gray-300">Complaints</span>
                  <span className="text-orange-400 font-semibold">{analytics.bounceStats.complaints}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
