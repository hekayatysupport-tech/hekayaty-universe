import { API_BASE_URL } from '@/lib/api';
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  History,
  Search,
  Filter,
  RefreshCw,
  Eye,
  X,
  Clock,
  ShieldAlert,
  CheckCircle,
  FileText
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

interface AuditLogItem {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: any;
  timestamp: string;
  ipAddress?: string | null;
  user: string;
}

export const AdminAudit = () => {
  const { session } = useAuth();
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/api/admin/audit`;
      const params = new URLSearchParams();
      if (actionFilter !== "all") params.append("action", actionFilter);
      if (resourceFilter !== "all") params.append("resourceType", resourceFilter);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load audit telemetry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchLogs();
    }
  }, [session, actionFilter, resourceFilter]);

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "CREATE":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "UPDATE":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DELETE":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "WORKFLOW_CHANGE":
      case "QUICK_PUBLISH":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "ROLE_CHANGE":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-[#222228] text-[#a0a0a0] border-[#333]";
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f1f24] pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-serif font-bold text-[#f0f0f0]">
              Audit Logs & Security Telemetry
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/30">
              {logs.length} Recorded Actions
            </span>
          </div>
          <p className="text-xs text-[#888888] mt-1">
            Immutable chronological stream of administrative mutations, workflow state transitions, and role assignments.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-[#121216] border border-[#26262e] hover:border-[#d4af37] text-xs font-bold text-[#e0e0e0] rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#d4af37]" : ""}`} />
          Refresh Stream
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="w-full px-3 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] focus:outline-none"
        >
          <option value="all">All Mutation Actions</option>
          <option value="CREATE">CREATE</option>
          <option value="UPDATE">UPDATE</option>
          <option value="DELETE">DELETE</option>
          <option value="WORKFLOW_CHANGE">WORKFLOW_CHANGE</option>
          <option value="QUICK_PUBLISH">QUICK_PUBLISH</option>
          <option value="ROLE_CHANGE">ROLE_CHANGE</option>
        </select>

        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className="w-full px-3 py-2 bg-[#0d0d10] border border-[#222228] focus:border-[#d4af37] rounded-lg text-xs text-[#e0e0e0] focus:outline-none"
        >
          <option value="all">All Resources</option>
          <option value="character">Character</option>
          <option value="comic_series">Comic Series</option>
          <option value="comic_issue">Comic Issue</option>
          <option value="world">World</option>
          <option value="encyclopedia_entry">Encyclopedia</option>
          <option value="timeline_event">Timeline Event</option>
          <option value="news">News Article</option>
          <option value="media">Media Asset</option>
          <option value="user_role">User Role</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#0a0a0d] border border-[#1f1f24] rounded-xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="py-24 text-center text-[#888888] font-mono text-xs flex flex-col items-center justify-center">
            <RefreshCw className="w-8 h-8 animate-spin text-[#d4af37] mb-2" />
            Loading audit stream...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center text-[#666666]">
            <History className="w-12 h-12 mx-auto mb-2 opacity-25" />
            <p className="text-sm font-medium">No audit records matching filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#121216] border-b border-[#1f1f24] text-[#888888] uppercase tracking-wider font-mono">
                <tr>
                  <th className="px-6 py-3.5">Timestamp</th>
                  <th className="px-6 py-3.5">Actor</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Resource</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181f]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#111116] transition-colors group">
                    <td className="px-6 py-4 font-mono text-[11px] text-[#777777] whitespace-nowrap">
                      {log.timestamp ? format(new Date(log.timestamp), "MMM d, HH:mm:ss") : "—"}
                    </td>

                    <td className="px-6 py-4 font-bold text-[#d4af37]">
                      {log.user}
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-[#c0c0c0] capitalize">
                      {log.resourceType?.replace("_", " ")}
                    </td>

                    <td className="px-6 py-4 text-[#888888] max-w-xs truncate font-mono text-[11px]">
                      {log.details?.name || log.details?.title || JSON.stringify(log.details) || "—"}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 bg-[#181820] hover:bg-[#252530] text-[#a0a0a0] hover:text-[#d4af37] rounded transition-colors"
                        title="View JSON Payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Dialog */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e0e12] border border-[#2c2c34] rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#1f1f24]">
              <div>
                <h2 className="text-base font-serif font-bold text-[#f0f0f0]">Audit Log Inspector</h2>
                <p className="text-xs font-mono text-[#888888]">Record ID: {selectedLog.id}</p>
              </div>
              <button onClick={() => setSelectedLog(null)} className="text-[#666666] hover:text-[#f0f0f0]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#18181e]">
                <span className="text-[#777777]">Actor:</span>
                <span className="text-[#d4af37]">{selectedLog.user}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#18181e]">
                <span className="text-[#777777]">Action:</span>
                <span className="text-[#f0f0f0] font-bold">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#18181e]">
                <span className="text-[#777777]">Resource Type:</span>
                <span className="text-[#f0f0f0]">{selectedLog.resourceType}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#18181e]">
                <span className="text-[#777777]">Resource ID:</span>
                <span className="text-[#a0a0a0]">{selectedLog.resourceId || "—"}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#18181e]">
                <span className="text-[#777777]">Timestamp:</span>
                <span className="text-[#a0a0a0]">{selectedLog.timestamp}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase text-[#777777] mb-1 font-mono">Payload Details:</p>
              <pre className="p-3 bg-[#08080a] border border-[#1f1f24] rounded-lg text-xs font-mono text-green-400 overflow-x-auto max-h-48">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-[#181820] text-xs text-[#e0e0e0] rounded-lg font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
