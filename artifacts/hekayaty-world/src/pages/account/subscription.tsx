import React, { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { Crown, CheckCircle2, AlertCircle, Clock, XCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function AccountSubscription() {
  const { session } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }

    fetch('/api/account/subscription', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background pt-32 px-4 text-center">
        <h1 className="text-2xl font-serif text-primary">Sign in to view subscription account</h1>
        <Link href="/auth" className="text-xs font-bold uppercase text-foreground hover:underline mt-4 inline-block">Sign In</Link>
      </div>
    );
  }

  const sub = data?.subscription;
  const pendingPayment = data?.pendingPayment;
  const history = data?.paymentHistory || [];

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-2">
          <Crown className="w-7 h-7 text-primary" /> Hekayaty Originals Membership Account
        </h1>
      </div>

      {/* Main Status Banner */}
      <div className="bg-card rounded-2xl border border-primary/30 p-8 space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border pb-6">
          <div>
            <div className="text-xs uppercase font-bold text-muted-foreground">Subscription Status</div>
            <div className="text-2xl font-serif font-bold flex items-center gap-2 mt-1">
              {data?.hasSubscription ? (
                <>
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="text-emerald-400 uppercase">Active Membership</span>
                </>
              ) : pendingPayment ? (
                <>
                  <Clock className="w-6 h-6 text-amber-400" />
                  <span className="text-amber-400 uppercase">Pending Admin Verification</span>
                </>
              ) : sub?.status === 'rejected' ? (
                <>
                  <XCircle className="w-6 h-6 text-destructive" />
                  <span className="text-destructive uppercase">Payment Rejected</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-6 h-6 text-muted-foreground" />
                  <span className="text-muted-foreground uppercase">No Active Membership</span>
                </>
              )}
            </div>
          </div>

          <Link
            href="/subscription"
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-primary text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center gap-1.5"
          >
            {data?.hasSubscription ? 'Renew / Upgrade Plan' : 'Subscribe Now (InstaPay)'}
          </Link>
        </div>

        {/* Pending Banner */}
        {pendingPayment && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl space-y-1 text-xs text-amber-300">
            <div className="font-bold uppercase flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-400" /> InstaPay Transaction Submitted: {pendingPayment.transactionRef}
            </div>
            <div>Your payment of <span className="font-bold text-white">{pendingPayment.amountEgp} EGP</span> is currently under manual admin verification. Access will be activated upon approval.</div>
          </div>
        )}

        {/* Active Sub Details */}
        {sub && data?.hasSubscription && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
            <div className="bg-secondary/40 rounded-xl p-4 border border-border">
              <div className="text-xs text-muted-foreground">Current Plan</div>
              <div className="text-lg font-bold text-primary capitalize mt-1">{sub.planType} ({sub.amountEgp} EGP)</div>
            </div>
            <div className="bg-secondary/40 rounded-xl p-4 border border-border">
              <div className="text-xs text-muted-foreground">Days Remaining</div>
              <div className="text-lg font-bold text-emerald-400 mt-1">{sub.daysRemaining} Days</div>
            </div>
            <div className="bg-secondary/40 rounded-xl p-4 border border-border">
              <div className="text-xs text-muted-foreground">Expires On</div>
              <div className="text-base font-semibold mt-1">{new Date(sub.expiresAt).toLocaleDateString()}</div>
            </div>
          </div>
        )}
      </div>

      {/* Payment History Ledger */}
      <div className="bg-card rounded-2xl border border-border p-6 md:p-8 space-y-4 shadow-xl">
        <h2 className="text-xl font-serif font-bold text-white border-b border-border pb-3">InstaPay Payment History</h2>

        {history.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">No payment history recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/40 text-muted-foreground uppercase font-semibold border-b border-border">
                <tr>
                  <th className="p-3">Reference ID</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {history.map((h: any) => (
                  <tr key={h.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-mono font-bold text-foreground">{h.transactionRef}</td>
                    <td className="p-3 font-bold">{h.amountEgp} EGP</td>
                    <td className="p-3 uppercase">{h.paymentMethod}</td>
                    <td className="p-3 font-bold">
                      <span className={`px-2 py-0.5 rounded uppercase ${
                        h.status === 'verified' || h.status === 'successful'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : h.status === 'pending_verification'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-destructive/20 text-destructive'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">{new Date(h.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
