import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Crown, CreditCard, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Copy, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export function Checkout() {
  const [, setLocation] = useLocation();
  const { session } = useAuth();

  const queryParams = new URLSearchParams(window.location.search);
  const selectedPlan = queryParams.get('plan') || 'yearly';

  const planDetails: Record<string, { name: string; arabicName: string; price: number; interval: string }> = {
    monthly: { name: 'Monthly', arabicName: 'شهري', price: 59, interval: '1 Month' },
    quarterly: { name: '3 Months', arabicName: '3 أشهر', price: 139, interval: '3 Months' },
    yearly: { name: 'Yearly', arabicName: 'سنوي (أفضل قيمة)', price: 499, interval: '1 Year' },
  };

  const currentPlan = planDetails[selectedPlan] || planDetails.yearly;
  const [instapayInfo, setInstapayInfo] = useState<any>({
    handle: 'hekayaty@instapay',
    phoneNumber: '01000000000',
    accountName: 'Hekayaty Originals / حكاياتي',
  });

  const [transactionRef, setTransactionRef] = useState('');
  const [senderAccount, setSenderAccount] = useState('');
  const [copied, setCopied] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/api/subscription/plans')
      .then((res) => res.json())
      .then((data) => {
        if (data.instapay) setInstapayInfo(data.instapay);
      })
      .catch(() => {});
  }, []);

  const copyHandle = () => {
    navigator.clipboard.writeText(instapayInfo.handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setLocation('/auth');
      return;
    }

    if (!transactionRef.trim()) {
      setErrorMsg('Please enter your InstaPay transaction reference ID.');
      return;
    }

    setProcessing(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          planType: selectedPlan,
          transactionRef,
          senderAccount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');

      setSuccessData(data);
      setProcessing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Payment submission error');
      setProcessing(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-24 pb-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-card rounded-2xl border border-amber-500/40 p-8 text-center space-y-6 shadow-2xl">
          <CheckCircle2 className="w-16 h-16 text-amber-400 mx-auto" />
          <div className="space-y-2">
            <h1 className="text-3xl font-serif font-bold text-white">Payment Submitted!</h1>
            <p className="text-sm text-muted-foreground">
              Your InstaPay payment reference has been received. Your subscription will be activated upon admin verification.
            </p>
          </div>

          <div className="bg-secondary/40 rounded-xl p-4 border border-border text-xs space-y-1 text-left">
            <div><span className="text-muted-foreground">InstaPay Reference ID:</span> <span className="font-mono text-primary font-bold">{successData.transactionRef}</span></div>
            <div><span className="text-muted-foreground">Plan:</span> <span className="font-bold">{currentPlan.arabicName} ({currentPlan.price} EGP)</span></div>
            <div><span className="text-muted-foreground">Status:</span> <span className="text-amber-400 font-bold uppercase">Pending Verification</span></div>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <Link href="/account/subscription" className="w-full py-3 bg-primary text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-primary/90">
              View Membership Account Status
            </Link>
            <Link href="/stories" className="w-full py-3 bg-secondary text-foreground font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-secondary/80">
              Explore Free Stories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="border-b border-border pb-4">
        <h1 className="text-3xl font-serif font-bold text-white flex items-center gap-2">
          <Crown className="w-7 h-7 text-primary" /> Hekayaty Originals Checkout (InstaPay)
        </h1>
        <p className="text-xs text-muted-foreground mt-1">Manual InstaPay Payment Verification</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="md:col-span-1 bg-card rounded-xl border border-border p-6 space-y-6 h-fit">
          <h2 className="text-lg font-serif font-bold text-foreground border-b border-border pb-3">Order Summary</h2>

          <div className="space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Plan:</span>
              <span className="font-bold text-foreground">{currentPlan.arabicName}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Duration:</span>
              <span className="text-foreground">{currentPlan.interval}</span>
            </div>
            <div className="pt-3 border-t border-border flex justify-between items-baseline">
              <span className="text-base font-bold">Total Due:</span>
              <span className="text-2xl font-extrabold text-primary">{currentPlan.price} EGP</span>
            </div>
          </div>
        </div>

        {/* InstaPay Payment Instructions & Submission Form */}
        <div className="md:col-span-2 bg-card rounded-xl border border-border p-6 md:p-8 space-y-6">
          {/* Instructions Box */}
          <div className="bg-secondary/40 border border-primary/40 rounded-xl p-5 space-y-3">
            <h2 className="text-base font-serif font-bold text-primary flex items-center gap-2">
              <CreditCard className="w-5 h-5" /> 1. Send Payment via InstaPay App
            </h2>
            <div className="text-xs text-muted-foreground leading-relaxed dir-rtl text-right">
              قم بتحويل مبلغ <span className="text-white font-bold">{currentPlan.price} EGP</span> عبر تطبيق إنستاباي إلى الحساب التالي:
            </div>
            <div className="flex items-center justify-between bg-black/60 p-3 rounded-lg border border-border">
              <div>
                <div className="text-xs text-muted-foreground">InstaPay Handle:</div>
                <div className="text-sm font-mono font-bold text-primary">{instapayInfo.handle}</div>
              </div>
              <button
                onClick={copyHandle}
                className="px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 rounded text-xs font-bold flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleCheckout} className="space-y-6">
            <h2 className="text-base font-serif font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-primary" /> 2. Enter InstaPay Reference Details
            </h2>

            {errorMsg && (
              <div className="p-3 bg-destructive/10 border border-destructive text-destructive text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  InstaPay Transaction / Reference ID *
                </label>
                <input
                  type="text"
                  required
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="e.g. TXN-982401928"
                  className="w-full bg-secondary/50 border border-border focus:border-primary rounded-lg p-3 text-sm font-mono text-foreground outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Your InstaPay Account / Sender Phone (Optional)
                </label>
                <input
                  type="text"
                  value={senderAccount}
                  onChange={(e) => setSenderAccount(e.target.value)}
                  placeholder="e.g. 01012345678 or handle"
                  className="w-full bg-secondary/50 border border-border focus:border-primary rounded-lg p-3 text-sm text-foreground outline-none"
                />
              </div>
            </div>

            {!session && (
              <div className="p-4 bg-amber-500/10 border border-amber-500/40 rounded-xl text-xs text-amber-300">
                You must be logged in to submit a payment reference. Click below to sign in first.
              </div>
            )}

            <button
              type="submit"
              disabled={processing}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-primary text-black font-bold uppercase tracking-wider text-sm rounded-lg hover:brightness-110 shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting for Verification...
                </>
              ) : (
                'Submit InstaPay Payment for Verification'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
