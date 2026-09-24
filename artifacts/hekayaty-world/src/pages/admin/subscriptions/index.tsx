import React, { useEffect, useState } from "react";
import {
  Crown,
  DollarSign,
  Users,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Filter,
  ArrowUpDown,
  User,
  Phone,
  Calendar,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Sparkles,
  Bookmark,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

export function AdminSubscriptions() {
  const { session } = useAuth();
  const [, setLocation] = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal & Action states
  const [rejectingPayment, setRejectingPayment] = useState<any>(null);
  const [selectedReason, setSelectedReason] = useState<string>("Invalid payment ID");
  const [customReason, setCustomReason] = useState<string>("");
  const [viewingPayment, setViewingPayment] = useState<any>(null);
  const [viewingSubscriberProfile, setViewingSubscriberProfile] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchSubscriptions = async () => {
    if (!session) return;
    try {
      const res = await fetch("/api/admin/subscriptions", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const resData = await res.json();
      setData(resData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [session]);

  const handleApprove = async (paymentId: string) => {
    if (!session) return;
    setActionLoading(paymentId);
    setAlert(null);
    try {
      const res = await fetch(`/api/admin/payments/${paymentId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      });
      const result = await res.json();
      if (!res.ok) {
        setAlert({ type: "error", message: result.error || "Failed to approve payment" });
      } else {
        setAlert({ type: "success", message: result.message || "Payment approved and subscription activated!" });
        fetchSubscriptions();
      }
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Network error occurred" });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async () => {
    if (!session || !rejectingPayment) return;
    const finalReason = selectedReason === "Other" ? customReason : selectedReason;
    if (!finalReason.trim()) {
      setAlert({ type: "error", message: "Please provide a valid rejection reason." });
      return;
    }

    setActionLoading(rejectingPayment.id);
    setAlert(null);
    try {
      const res = await fetch(`/api/admin/payments/${rejectingPayment.id}/reject`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason: finalReason }),
      });
      const result = await res.json();
      if (!res.ok) {
        setAlert({ type: "error", message: result.error || "Failed to reject payment" });
      } else {
        setAlert({ type: "success", message: "Payment rejected successfully." });
        setRejectingPayment(null);
        setCustomReason("");
        fetchSubscriptions();
      }
    } catch (err: any) {
      setAlert({ type: "error", message: err.message || "Network error" });
    } finally {
      setActionLoading(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const summary = data?.summary || { totalSubscriptions: 0, activeSubscribers: 0, pendingVerificationCount: 0, totalRevenueEgp: 0 };
  const rawPayments = data?.payments || [];

  // Filter logic
  let filteredPayments = rawPayments.filter((p: any) => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  // Sort logic
  filteredPayments.sort((a: any, b: any) => {
    if (sortBy === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortBy === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortBy === "amount") return (b.amount_egp || 0) - (a.amount_egp || 0);
    return 0;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
      case "successful":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20"><CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED</span>;
      case "pending_verification":
      case "pending":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20"><Clock className="w-3.5 h-3.5" /> PENDING</span>;
      case "rejected":
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20"><XCircle className="w-3.5 h-3.5" /> REJECTED</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">{status.toUpperCase()}</span>;
    }
  };

  const formatDateWithTime = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const d = new Date(dateStr);
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-border pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2">
            <Crown className="w-6 h-6 text-primary" /> Hekayaty Originals InstaPay Verification Center
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Review manual InstaPay transactions, verify subscriber payments, and track active subscription start/end dates.</p>
        </div>
      </div>

      {/* Alert Banner */}
      {alert && (
        <div className={`p-4 rounded-xl border flex items-center justify-between ${
          alert.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
        }`}>
          <div className="flex items-center gap-2 text-sm font-medium">
            {alert.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {alert.message}
          </div>
          <button onClick={() => setAlert(null)} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl border border-border p-4 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-semibold flex items-center justify-between">
            Pending Queue <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-amber-400">{summary.pendingVerificationCount}</div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-semibold flex items-center justify-between">
            Active Members <Crown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">{summary.activeSubscribers}</div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-semibold flex items-center justify-between">
            Total Subscriptions <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-3xl font-extrabold text-foreground">{summary.totalSubscriptions}</div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 space-y-1">
          <div className="text-xs text-muted-foreground uppercase font-semibold flex items-center justify-between">
            Total Revenue <DollarSign className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-extrabold text-primary">{summary.totalRevenueEgp} EGP</div>
        </div>
      </div>

      {/* Controls Bar: Filters & Sort */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card/60 p-3 rounded-xl border border-border">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-muted-foreground font-semibold px-2 flex items-center gap-1"><Filter className="w-3.5 h-3.5" /> Status:</span>
          {[
            { id: "all", label: "All" },
            { id: "pending_verification", label: `Pending (${summary.pendingVerificationCount})` },
            { id: "verified", label: "Verified" },
            { id: "rejected", label: "Rejected" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === tab.id
                  ? "bg-primary text-primary-foreground font-bold shadow"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-background border border-border text-foreground text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="amount">Highest Amount</option>
          </select>
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-8 text-center text-xs text-muted-foreground">Loading verification queue...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground space-y-2">
            <ShieldCheck className="w-8 h-8 mx-auto text-muted-foreground/40" />
            <div className="text-sm font-bold">No payments found</div>
            <div className="text-xs">There are no transaction records matching the selected filter.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/60 text-muted-foreground uppercase font-semibold border-b border-border">
                <tr>
                  <th className="p-4">Subscriber Info</th>
                  <th className="p-4">Sender Phone / Account</th>
                  <th className="p-4">Plan & Amount</th>
                  <th className="p-4">InstaPay Ref ID</th>
                  <th className="p-4">Submission Date & Time</th>
                  <th className="p-4">Subscription Period (Start ➔ End)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredPayments.map((p: any) => {
                  const sub = p.subscription || {};
                  const userObj = p.user || {};
                  return (
                    <tr key={p.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Subscriber Name & Email */}
                      <td className="p-4">
                        <button
                          onClick={() => setViewingSubscriberProfile({ ...userObj, payment: p })}
                          className="text-left group flex items-start gap-2.5 focus:outline-none"
                          title="Click to view full subscriber profile"
                        >
                          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/40 flex items-center justify-center font-serif font-bold text-primary group-hover:bg-primary group-hover:text-black transition-all shrink-0 mt-0.5 shadow-sm">
                            {(userObj.displayName || "S")[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5 text-sm">
                              <span>{userObj.displayName || "Subscriber"}</span>
                              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="w-3 h-3 shrink-0 text-amber-400/80" />
                              <span className="truncate max-w-[190px] font-mono">{userObj.email || "No email"}</span>
                            </div>
                          </div>
                        </button>
                      </td>

                      {/* Sender Account / Phone */}
                      <td className="p-4 font-mono">
                        {p.sender_account ? (
                          <div className="inline-flex items-center gap-1 bg-secondary/50 px-2 py-1 rounded text-foreground font-semibold border border-border">
                            <Phone className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{p.sender_account}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-[11px]">Not provided</span>
                        )}
                      </td>

                      {/* Plan & Amount */}
                      <td className="p-4">
                        <span className="uppercase font-extrabold text-primary block">{sub.plan_type || "MONTHLY"}</span>
                        <span className="font-extrabold text-foreground text-sm">{p.amount_egp} EGP</span>
                      </td>

                      {/* InstaPay Ref ID */}
                      <td className="p-4">
                        <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-lg border border-primary/20 font-mono font-bold">
                          <span>{p.transaction_ref}</span>
                          <button
                            onClick={() => copyToClipboard(p.transaction_ref, p.id)}
                            className="p-1 hover:text-white transition-colors"
                            title="Copy Ref ID"
                          >
                            {copiedId === p.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                          </button>
                        </div>
                      </td>

                      {/* Submission Timestamp */}
                      <td className="p-4 font-mono text-muted-foreground whitespace-nowrap">
                        {formatDateWithTime(p.created_at)}
                      </td>

                      {/* Start & End of Subscription */}
                      <td className="p-4 font-mono text-xs">
                        {sub.starts_at ? (
                          <div className="space-y-0.5">
                            <div className="text-emerald-400 font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>Start: {formatDateWithTime(sub.starts_at)}</span>
                            </div>
                            <div className="text-amber-400 font-semibold flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>End: {formatDateWithTime(sub.expires_at)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">Activates upon approval</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-4">{getStatusBadge(p.status)}</td>

                      {/* Actions */}
                      <td className="p-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => setViewingPayment(p)}
                          className="px-2.5 py-1.5 bg-secondary text-foreground hover:bg-secondary/80 rounded-lg font-semibold transition-colors inline-flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" /> Details
                        </button>

                        {(p.status === "pending_verification" || p.status === "pending") && (
                          <>
                            <button
                              disabled={actionLoading === p.id}
                              onClick={() => handleApprove(p.id)}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              disabled={actionLoading === p.id}
                              onClick={() => {
                                setRejectingPayment(p);
                                setSelectedReason("Invalid payment ID");
                                setCustomReason("");
                              }}
                              className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white font-bold rounded-lg border border-rose-500/30 transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Reason Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-serif font-bold text-rose-400 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> Reject Payment Request
              </h3>
              <button onClick={() => setRejectingPayment(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <div><strong className="text-foreground">Subscriber:</strong> {rejectingPayment.user?.displayName} ({rejectingPayment.user?.email})</div>
              <div><strong className="text-foreground">InstaPay Ref:</strong> <span className="font-mono text-primary">{rejectingPayment.transaction_ref}</span></div>
              <div><strong className="text-foreground">Amount:</strong> {rejectingPayment.amount_egp} EGP</div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground block">Select Rejection Reason:</label>
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="w-full bg-background border border-border text-foreground text-xs rounded-lg p-2.5 focus:outline-none focus:border-primary"
              >
                <option value="Invalid payment ID">Invalid payment ID</option>
                <option value="Wrong amount">Wrong amount transferred</option>
                <option value="Payment not found">Payment not found in InstaPay account</option>
                <option value="Duplicate payment">Duplicate payment reference</option>
                <option value="Payment sent to incorrect account">Payment sent to incorrect account</option>
                <option value="Other">Other (custom reason)</option>
              </select>

              {selectedReason === "Other" && (
                <textarea
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Enter specific rejection reason for the user..."
                  className="w-full bg-background border border-border text-foreground text-xs rounded-lg p-2.5 focus:outline-none focus:border-primary h-20"
                />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setRejectingPayment(null)}
                className="px-4 py-2 bg-secondary text-foreground text-xs font-bold rounded-lg hover:bg-secondary/80"
              >
                Cancel
              </button>
              <button
                disabled={actionLoading === rejectingPayment.id}
                onClick={handleRejectSubmit}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Details Modal */}
      {viewingPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f0f15] border border-[#D4AF37]/40 rounded-2xl max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative text-white">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-[#D4AF37]" />
                <h3 className="text-xl font-serif font-bold text-[#FFF7D6]">Subscriber Transaction & Plan Record</h3>
              </div>
              <button onClick={() => setViewingPayment(null)} className="p-1 text-[#888] hover:text-white rounded-lg">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Subscriber Identity Box */}
              <div className="bg-[#161622] p-4 rounded-xl border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[#D4AF37]">Subscriber Information</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#888] block text-[10px]">Subscriber Name</span>
                    <strong className="text-white text-sm">{viewingPayment.user?.displayName || "Subscriber"}</strong>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">Email Address</span>
                    <strong className="text-[#dddddd] font-mono">{viewingPayment.user?.email}</strong>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">InstaPay Sender Phone / Account</span>
                    <strong className="text-emerald-400 font-mono">{viewingPayment.sender_account || "Not provided"}</strong>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">User ID</span>
                    <span className="font-mono text-[#888888]">{viewingPayment.user_id}</span>
                  </div>
                </div>
              </div>

              {/* Plan & Dates Box */}
              <div className="bg-[#161622] p-4 rounded-xl border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400">Subscription & Dates</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#888] block text-[10px]">Plan Type</span>
                    <strong className="text-[#D4AF37] uppercase text-sm font-extrabold">
                      {viewingPayment.subscription?.plan_type || "MONTHLY"}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">Amount EGP</span>
                    <strong className="text-emerald-400 text-sm font-black">{viewingPayment.amount_egp} EGP</strong>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">Subscription Start Timestamp</span>
                    <strong className="text-emerald-300 font-mono">
                      {formatDateWithTime(viewingPayment.subscription?.starts_at)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">Subscription Expiration Timestamp</span>
                    <strong className="text-amber-300 font-mono">
                      {formatDateWithTime(viewingPayment.subscription?.expires_at)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* InstaPay & Audit Box */}
              <div className="bg-[#161622] p-4 rounded-xl border border-white/10 space-y-2">
                <span className="text-[10px] font-mono uppercase font-bold text-[#888]">Audit & Verification Details</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[#888] block text-[10px]">InstaPay Transaction Reference</span>
                    <span className="font-mono font-bold text-[#FFF7D6] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30 inline-block">
                      {viewingPayment.transaction_ref}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px]">Submitted Exact Timestamp</span>
                    <span className="font-mono text-[#cccccc]">{formatDateWithTime(viewingPayment.created_at)}</span>
                  </div>
                  {viewingPayment.verified_at && (
                    <div>
                      <span className="text-[#888] block text-[10px]">Verified Exact Timestamp</span>
                      <span className="font-mono text-emerald-400">{formatDateWithTime(viewingPayment.verified_at)}</span>
                    </div>
                  )}
                  {viewingPayment.verified_by && (
                    <div>
                      <span className="text-[#888] block text-[10px]">Verified By Admin ID</span>
                      <span className="font-mono text-[#888888]">{viewingPayment.verified_by}</span>
                    </div>
                  )}
                </div>
                {viewingPayment.rejection_reason && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-300 mt-2">
                    <strong>Rejection Reason:</strong> {viewingPayment.rejection_reason}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingPayment(null)}
                className="px-6 py-2.5 bg-[#D4AF37] text-black text-xs font-serif font-bold rounded-xl hover:bg-[#bfa030] transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscriber Full Profile Drawer / Modal */}
      {viewingSubscriberProfile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f0f15] border border-primary/50 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-white max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-primary/50 flex items-center justify-center font-serif text-xl text-primary font-bold shadow-lg">
                  {(viewingSubscriberProfile.displayName || "S")[0].toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-serif font-bold text-white">{viewingSubscriberProfile.displayName || "Subscriber"}</h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/40">
                      {viewingSubscriberProfile.role || "reader"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">@{viewingSubscriberProfile.username || "user"}</p>
                </div>
              </div>
              <button onClick={() => setViewingSubscriberProfile(null)} className="p-1.5 text-muted-foreground hover:text-white rounded-lg">✕</button>
            </div>

            <div className="space-y-6">
              {/* Account Identity Card */}
              <div className="bg-[#161622] p-5 rounded-xl border border-white/10 space-y-4">
                <h4 className="text-xs uppercase font-bold text-primary tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4" /> Account Identity & Contact Info
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[#888] block text-[11px]">Email Address</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <strong className="text-white font-mono text-sm">{viewingSubscriberProfile.email}</strong>
                      <button
                        onClick={() => copyToClipboard(viewingSubscriberProfile.email, 'sub-email')}
                        className="p-1 hover:text-primary transition-colors text-muted-foreground"
                        title="Copy email"
                      >
                        {copiedId === 'sub-email' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#888] block text-[11px]">User UID</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-muted-foreground text-xs">{viewingSubscriberProfile.id}</span>
                      <button
                        onClick={() => copyToClipboard(viewingSubscriberProfile.id, 'sub-uid')}
                        className="p-1 hover:text-primary transition-colors text-muted-foreground"
                        title="Copy User ID"
                      >
                        {copiedId === 'sub-uid' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[#888] block text-[11px]">Registered Date</span>
                    <strong className="text-white font-mono">
                      {viewingSubscriberProfile.createdAt ? new Date(viewingSubscriberProfile.createdAt).toLocaleDateString() : 'N/A'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-[#888] block text-[11px]">Account Access Role</span>
                    <strong className="text-amber-400 uppercase font-bold">{viewingSubscriberProfile.role || 'reader'}</strong>
                  </div>
                </div>
              </div>

              {/* Related Payment / Subscription Record */}
              {viewingSubscriberProfile.payment && (
                <div className="bg-[#161622] p-5 rounded-xl border border-white/10 space-y-3">
                  <h4 className="text-xs uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Crown className="w-4 h-4" /> Active Subscription & Transaction Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-[#888] block text-[11px]">InstaPay Ref Code</span>
                      <strong className="text-primary font-mono text-sm">{viewingSubscriberProfile.payment.transaction_ref}</strong>
                    </div>
                    <div>
                      <span className="text-[#888] block text-[11px]">Plan Type & Amount</span>
                      <strong className="text-emerald-400 font-bold">{viewingSubscriberProfile.payment.subscription?.plan_type || 'MONTHLY'} ({viewingSubscriberProfile.payment.amount_egp} EGP)</strong>
                    </div>
                    <div>
                      <span className="text-[#888] block text-[11px]">Sender Phone / Account</span>
                      <strong className="text-white font-mono">{viewingSubscriberProfile.payment.sender_account || 'Not provided'}</strong>
                    </div>
                    <div>
                      <span className="text-[#888] block text-[11px]">Transaction Status</span>
                      <div>{getStatusBadge(viewingSubscriberProfile.payment.status)}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transactions Ledger for this subscriber */}
              <div className="space-y-3">
                <h4 className="text-xs uppercase font-bold text-muted-foreground tracking-wider">All Subscriber Payments</h4>
                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#161622] text-[#888] uppercase font-bold border-b border-white/10">
                      <tr>
                        <th className="p-2.5">InstaPay Ref</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {rawPayments
                        .filter((pay: any) => pay.user_id === viewingSubscriberProfile.id)
                        .map((pay: any) => (
                          <tr key={pay.id} className="hover:bg-white/5">
                            <td className="p-2.5 font-mono font-bold text-primary">{pay.transaction_ref}</td>
                            <td className="p-2.5 font-bold">{pay.amount_egp} EGP</td>
                            <td className="p-2.5">{getStatusBadge(pay.status)}</td>
                            <td className="p-2.5 text-[#888]">{new Date(pay.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setViewingSubscriberProfile(null);
                  setLocation("/admin/users");
                }}
                className="px-4 py-2 bg-secondary/80 hover:bg-secondary text-foreground text-xs font-bold rounded-xl transition-colors flex items-center gap-2 border border-border"
              >
                <Shield className="w-4 h-4 text-primary" /> Manage User Roles in CMS
              </button>

              <button
                onClick={() => setViewingSubscriberProfile(null)}
                className="px-6 py-2.5 bg-primary text-black font-serif font-bold text-xs rounded-xl hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
