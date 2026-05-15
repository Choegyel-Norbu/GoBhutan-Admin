import { useEffect, useRef, useState } from 'react';
import { Wallet, Plus, Landmark, CheckCircle2, AlertCircle, BadgeCheck, RefreshCw, ArrowUpRight, ArrowDownLeft, X, ChevronRight } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useWallet } from '@/contexts/WalletContext';
import { api } from '@/lib/apiService';
import Swal from 'sweetalert2';

// ─── Step badge ────────────────────────────────────────────────────────────────
function StepBadge({ number, active, done }) {
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
        done
          ? 'bg-green-600 text-white'
          : active
          ? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
          : 'bg-muted text-muted-foreground'
      }`}
    >
      {done ? <CheckCircle2 className="h-4 w-4" /> : number}
    </div>
  );
}

// ─── Section header with step number ──────────────────────────────────────────
function StepHeader({ number, title, subtitle, active, done }) {
  return (
    <div className="flex items-start gap-3">
      <StepBadge number={number} active={active} done={done} />
      <div className="pt-0.5">
        <p className={`text-base font-semibold leading-tight ${active || done ? 'text-foreground' : 'text-muted-foreground'}`}>
          {title}
        </p>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function WalletPage() {
  const { walletBalance, refreshWalletBalance } = useWallet();
  const verifySectionRef = useRef(null);
  const debitMessageRef = useRef(null);

  const [showTopupForm, setShowTopupForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [remitterEmail, setRemitterEmail] = useState('');
  const [remitterBankId, setRemitterBankId] = useState('');
  const [remitterAccNo, setRemitterAccNo] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isInitiating, setIsInitiating] = useState(false);
  const [isInquiring, setIsInquiring] = useState(false);
  const [isDebiting, setIsDebiting] = useState(false);
  const [initiatedData, setInitiatedData] = useState(null);
  const [inquiryData, setInquiryData] = useState(null);
  const [debitData, setDebitData] = useState(null);
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [isLedgerLoading, setIsLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState('');

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-BT', { style: 'currency', currency: 'BTN', minimumFractionDigits: 2 }).format(value);

  const formatLedgerDate = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return 'N/A';
    return new Intl.DateTimeFormat('en-BT', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(d);
  };

  const isFailedInquiryResponse = (data) => {
    const status = String(data?.status || '').toUpperCase();
    const responseCode = String(data?.responseCode || '').toUpperCase();
    const responseDesc = String(data?.responseDesc || '').toUpperCase();
    const failedStatuses = ['FAILED', 'FAILURE', 'REJECTED', 'DECLINED', 'ERROR'];
    if (failedStatuses.includes(status)) return true;
    if (responseCode && !['00', '0', '000', 'SUCCESS'].includes(responseCode)) return true;
    return responseDesc.includes('FAIL') || responseDesc.includes('ERROR') || responseDesc.includes('DECLINED');
  };

  const getRemitterEmail = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('gobhutan_user_data') || '{}');
      const authData = JSON.parse(localStorage.getItem('gobhutan_auth_data') || '{}');
      return userData.email || authData.email || '';
    } catch { return ''; }
  };

  const resetTopupFlow = (shouldPrefillEmail = true) => {
    setAmount('');
    setDescription('');
    setRemitterEmail(shouldPrefillEmail ? getRemitterEmail() : '');
    setRemitterBankId('');
    setRemitterAccNo('');
    setOtp('');
    setError('');
    setInitiatedData(null);
    setInquiryData(null);
    setDebitData(null);
  };

  const handleShowTopupForm = () => {
    setShowTopupForm(true);
    resetTopupFlow();
  };

  const handleInitiateTopup = async (e) => {
    e.preventDefault();
    setError('');
    setRemitterBankId('');
    setRemitterAccNo('');
    setInquiryData(null);
    setDebitData(null);

    const parsedAmount = parseFloat(amount);
    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!remitterEmail.trim()) {
      setError('Please provide remitter email.');
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(remitterEmail.trim())) {
      setError('Please enter a valid remitter email address.');
      return;
    }

    const payload = {
      amount: parsedAmount,
      currency: 'BTN',
      description: description.trim() || 'Wallet top-up',
      remitterEmail: remitterEmail.trim(),
    };

    try {
      setIsInitiating(true);
      const response = await api.wallet.initiateTopup(payload);
      if (!response?.success || !response?.data?.topupRef) {
        throw new Error(response?.message || 'Failed to initiate top-up.');
      }
      setInitiatedData(response.data);
    } catch (err) {
      setError(err?.message || 'Failed to initiate top-up.');
    } finally {
      setIsInitiating(false);
    }
  };

  const handleSelectBank = (bankId) => {
    setError('');
    setRemitterBankId(bankId);
    setInquiryData(null);
    setDebitData(null);
  };

  const handleAccountInquiry = async () => {
    setError('');
    setDebitData(null);
    if (!initiatedData?.topupRef) { setError('Please initiate top-up first.'); return; }
    if (!remitterBankId) { setError('Please select a bank from the list.'); return; }
    if (!remitterAccNo.trim()) { setError('Please enter remitter account number.'); return; }

    try {
      setIsInquiring(true);
      const response = await api.wallet.accountInquiryTopup({
        topupRef: initiatedData.topupRef,
        remitterBankId,
        remitterAccNo: remitterAccNo.trim(),
      });
      if (!response?.success || !response?.data) {
        throw new Error(response?.message || 'Failed to verify account.');
      }
      setInquiryData(response.data);
    } catch (err) {
      setInquiryData(null);
      setError(err?.message || 'Failed to verify account.');
    } finally {
      setIsInquiring(false);
    }
  };

  const handleDebitTopup = async () => {
    setError('');
    if (!initiatedData?.topupRef) { setError('Please initiate top-up first.'); return; }
    if (!isInquiryVerified) { setError('Please complete a successful account inquiry before transaction.'); return; }
    if (!otp.trim()) { setError('Please enter OTP.'); return; }

    try {
      setIsDebiting(true);
      const response = await api.wallet.debitTopup({ topupRef: initiatedData.topupRef, otp: otp.trim() });

      // Debit can return `success: true` with `data.status: FAILED` — check provider fields.
      if (response?.data && isFailedInquiryResponse(response.data)) throw new Error('Incorrect OTP. Please try again.');
      if (!response?.data) throw new Error(response?.message || 'Failed to debit top-up.');
      if (!response?.success) throw new Error(response?.message || 'Failed to debit top-up.');

      setDebitData(response.data);
      await refreshWalletBalance();
      await fetchLedgerHistory();

      await Swal.fire({
        icon: 'success',
        title: 'Top-up completed',
        text: 'Your wallet has been successfully credited. You can continue using your updated balance.',
        confirmButtonText: 'Great',
        confirmButtonColor: '#2563eb',
      });

      resetTopupFlow(false);
    } catch (err) {
      setError(err?.message || 'Failed to debit top-up.');
    } finally {
      setIsDebiting(false);
    }
  };

  const fetchLedgerHistory = async () => {
    setIsLedgerLoading(true);
    setLedgerError('');
    try {
      const response = await api.wallet.getLedger();
      if (!response?.success || !Array.isArray(response?.data)) {
        throw new Error(response?.message || 'Failed to load transaction history.');
      }
      const sorted = [...response.data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setLedgerEntries(sorted);
    } catch (err) {
      setLedgerError(err?.message || 'Failed to load transaction history.');
      setLedgerEntries([]);
    } finally {
      setIsLedgerLoading(false);
    }
  };

  const scrollToSection = (sectionRef) => {
    if (!sectionRef.current) return;
    sectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    sectionRef.current.focus({ preventScroll: true });
  };

  useEffect(() => { if (initiatedData && showTopupForm) scrollToSection(verifySectionRef); }, [initiatedData, showTopupForm]);
  useEffect(() => { if (debitData && showTopupForm) scrollToSection(debitMessageRef); }, [debitData, showTopupForm]);
  useEffect(() => { refreshWalletBalance(); }, [refreshWalletBalance]);
  useEffect(() => { fetchLedgerHistory(); }, []);

  const bankList = initiatedData?.bankList || [];
  const selectedBank = bankList.find((b) => b.bankId === remitterBankId);
  const canRunInquiry = Boolean(initiatedData?.topupRef && remitterBankId && remitterAccNo.trim());
  const isInquiryVerified = Boolean(inquiryData) && !isFailedInquiryResponse(inquiryData);
  const canDebit = Boolean(isInquiryVerified && otp.trim());

  // Step tracking
  const step1Done = Boolean(initiatedData);
  const step2Done = isInquiryVerified;
  const step1Active = !step1Done;
  const step2Active = step1Done && !step2Done;
  const step3Active = step2Done;

  return (
    <PageWrapper
      title="Wallet"
      description="Top up your wallet with secure initiate, account inquiry, and OTP debit steps."
    >
      <div className="mx-auto max-w-3xl space-y-6">

        {/* ── Balance Hero Card ─────────────────────────────────────────────── */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-6 py-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Wallet className="h-4 w-4" />
                  Available Balance
                </div>
                <p className="text-5xl font-bold tracking-tight text-foreground tabular-nums">
                  {formatCurrency(walletBalance)}
                </p>
                <p className="text-xs text-muted-foreground">Bhutanese Ngultrum (BTN)</p>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                {!showTopupForm ? (
                  <Button onClick={handleShowTopupForm} className="flex items-center gap-2 shadow-sm">
                    <Plus className="h-4 w-4" />
                    Top Up Wallet
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => { setShowTopupForm(false); setError(''); }}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel Top-Up
                  </Button>
                )}
                <p className="text-xs text-muted-foreground">3-step secure bank debit</p>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Top-Up Flow ───────────────────────────────────────────────────── */}
        {showTopupForm && (
          <div className="space-y-4">

            {/* Global error banner */}
            {error && (
              <div role="alert" className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* ── Step 1: Initiate ────────────────────────────────────────── */}
            <Card>
              <CardHeader className="pb-3">
                <StepHeader
                  number="1"
                  title="Initiate Top-Up"
                  subtitle="Enter the amount and your remitter email to start the process."
                  active={step1Active}
                  done={step1Done}
                />
              </CardHeader>
              <CardContent>
                <form onSubmit={handleInitiateTopup} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="topupAmount">Amount (BTN) <span className="text-destructive">*</span></Label>
                      <Input
                        id="topupAmount"
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="e.g. 500.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        disabled={step1Done}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="topupEmail">Remitter Email <span className="text-destructive">*</span></Label>
                      <Input
                        id="topupEmail"
                        type="email"
                        placeholder="your@email.com"
                        value={remitterEmail}
                        onChange={(e) => setRemitterEmail(e.target.value)}
                        required
                        disabled={step1Done}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="topupDescription">Description <span className="text-xs text-muted-foreground">(optional)</span></Label>
                    <Input
                      id="topupDescription"
                      type="text"
                      placeholder="e.g. Wallet top-up for bookings"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={step1Done}
                    />
                  </div>

                  {step1Done ? (
                    <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50/60 px-4 py-2.5">
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span>Top-up initiated · Ref: <span className="font-mono font-semibold">{initiatedData.topupRef}</span></span>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted-foreground hover:text-destructive"
                        onClick={() => resetTopupFlow(true)}
                      >
                        Reset
                      </Button>
                    </div>
                  ) : (
                    <Button type="submit" disabled={isInitiating} className="w-full sm:w-auto">
                      {isInitiating ? (
                        <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Initiating…</>
                      ) : (
                        <>Initiate Top-Up <ChevronRight className="ml-1 h-4 w-4" /></>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* ── Step 2: Verify Account ──────────────────────────────────── */}
            <Card ref={verifySectionRef} tabIndex={-1} className="outline-none">
              <CardHeader className="pb-3">
                <StepHeader
                  number="2"
                  title="Verify Remitter Account"
                  subtitle="Select your bank and enter your account number to verify."
                  active={step2Active}
                  done={step2Done}
                />
              </CardHeader>
              <CardContent className="space-y-5">
                {!initiatedData ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">Complete Step 1 first to unlock this section.</p>
                  </div>
                ) : (
                  <>
                    {/* Initiation summary */}
                    <div className="grid gap-2 rounded-lg border bg-muted/30 p-4 text-xs sm:grid-cols-2">
                      <p><span className="font-medium text-foreground">Topup Ref:</span> <span className="font-mono">{initiatedData.topupRef}</span></p>
                      <p><span className="font-medium text-foreground">Provider Txn ID:</span> {initiatedData.providerTransactionId || 'N/A'}</p>
                      <p><span className="font-medium text-foreground">Status:</span> {initiatedData.status || 'PENDING'}</p>
                      <p><span className="font-medium text-foreground">Response:</span> {initiatedData.responseCode} – {initiatedData.responseDesc}</p>
                      <p className="sm:col-span-2"><span className="font-medium text-foreground">Expires At:</span> {initiatedData.expiresAt || 'N/A'}</p>
                    </div>

                    {/* Bank list */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Select Remitter Bank <span className="text-destructive">*</span></Label>
                        {selectedBank && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                            <CheckCircle2 className="h-3 w-3" />
                            {selectedBank.bankName}
                          </span>
                        )}
                      </div>
                      <div className="max-h-60 overflow-y-auto rounded-lg border p-2">
                        {bankList.length === 0 ? (
                          <p className="p-4 text-center text-sm text-muted-foreground">No banks returned from API.</p>
                        ) : (
                          <ul className="grid gap-2 sm:grid-cols-2">
                            {bankList.map((bank) => {
                              const isActive = remitterBankId === bank.bankId;
                              const isOnline = String(bank.bankStatus || '').toUpperCase() === 'ACTIVE';
                              return (
                                <li key={bank.bankId}>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectBank(bank.bankId)}
                                    disabled={step2Done}
                                    className={`group w-full rounded-lg border px-3 py-2.5 text-left transition-all cursor-pointer ${
                                      isActive
                                        ? 'border-primary bg-primary/8 shadow-sm'
                                        : 'border-border hover:border-primary/40 hover:bg-muted/40'
                                    }`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isActive ? 'bg-primary/15' : 'bg-muted'}`}>
                                        <Landmark className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <p className={`truncate text-sm font-medium leading-tight ${isActive ? 'text-primary' : 'text-foreground'}`}>
                                          {bank.bankName}
                                        </p>
                                        <div className="mt-0.5 flex items-center gap-1.5">
                                          <span className={`h-1.5 w-1.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted-foreground/50'}`} />
                                          <span className="text-xs text-muted-foreground">{bank.bankStatus || 'Unknown'}</span>
                                        </div>
                                      </div>
                                      {isActive && <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />}
                                    </div>
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Account number */}
                    <div className="space-y-1.5">
                      <Label htmlFor="remitterAccNo">Account Number <span className="text-destructive">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id="remitterAccNo"
                          type="text"
                          placeholder="Enter remitter account number"
                          value={remitterAccNo}
                          onChange={(e) => { setRemitterAccNo(e.target.value); setInquiryData(null); setDebitData(null); }}
                          disabled={step2Done}
                          className="flex-1"
                          autoComplete="off"
                        />
                        <Button
                          type="button"
                          onClick={handleAccountInquiry}
                          disabled={isInquiring || !canRunInquiry || step2Done}
                          className="shrink-0"
                        >
                          {isInquiring ? (
                            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Verifying…</>
                          ) : (
                            'Verify Account'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Enter your bank account number to receive the OTP.</p>
                    </div>

                    {/* Inquiry result */}
                    {inquiryData && isInquiryVerified && (
                      <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50/60 p-4">
                        <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-green-700">Account verified</p>
                          <p className="text-xs text-green-700/80">Check your registered phone for the OTP, then enter it in Step 3 below.</p>
                        </div>
                      </div>
                    )}

                    {inquiryData && !isInquiryVerified && (
                      <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
                        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-destructive">Verification failed</p>
                          <p className="text-xs text-destructive/80">{inquiryData.responseDesc || 'Re-check your bank selection and account number, then try again.'}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* ── Step 3: OTP Debit ───────────────────────────────────────── */}
            <Card>
              <CardHeader className="pb-3">
                <StepHeader
                  number="3"
                  title="Enter OTP & Confirm Debit"
                  subtitle="Enter the OTP sent to your registered mobile to authorise the debit."
                  active={step3Active}
                  done={Boolean(debitData)}
                />
              </CardHeader>
              <CardContent className="space-y-4">
                {!isInquiryVerified ? (
                  <div className="rounded-lg border border-dashed p-6 text-center">
                    <p className="text-sm text-muted-foreground">Complete Step 2 to unlock OTP entry.</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <Label htmlFor="topupOtp">One-Time Password (OTP) <span className="text-destructive">*</span></Label>
                      <div className="flex gap-2">
                        <Input
                          id="topupOtp"
                          type="text"
                          inputMode="numeric"
                          placeholder="Enter OTP from your bank"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          autoComplete="one-time-code"
                          className="max-w-xs tracking-widest"
                        />
                        <Button
                          type="button"
                          onClick={handleDebitTopup}
                          disabled={isDebiting || !canDebit}
                        >
                          {isDebiting ? (
                            <><RefreshCw className="mr-2 h-4 w-4 animate-spin" />Processing…</>
                          ) : (
                            'Confirm Debit'
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">OTP was sent to your bank-registered mobile number.</p>
                    </div>

                    {debitData && (
                      <div ref={debitMessageRef} tabIndex={-1} className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50/60 p-4 outline-none">
                        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                        <div className="space-y-0.5">
                          <p className="text-sm font-semibold text-green-700">Transaction successful</p>
                          <p className="text-xs text-green-700/80">Your wallet has been credited. The updated balance is shown above.</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Transaction History ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-base">Transaction History</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchLedgerHistory}
              disabled={isLedgerLoading}
              className="flex items-center gap-1.5"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLedgerLoading ? 'animate-spin' : ''}`} />
              {isLedgerLoading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {ledgerError && (
              <div role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{ledgerError}</span>
              </div>
            )}

            {isLedgerLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
                ))}
              </div>
            ) : ledgerEntries.length === 0 ? (
              <div className="rounded-lg border border-dashed py-10 text-center">
                <Wallet className="mx-auto mb-3 h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm font-medium text-muted-foreground">No transactions yet</p>
                <p className="mt-1 text-xs text-muted-foreground">Top up your wallet to see history here.</p>
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border overflow-hidden">
                {ledgerEntries.map((entry) => {
                  const isCredit = String(entry.type).toUpperCase() === 'CREDIT';
                  return (
                    <div
                      key={`${entry.id}-${entry.createdAt}`}
                      className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-muted/30"
                    >
                      {/* Icon */}
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        isCredit ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                      }`}>
                        {isCredit
                          ? <ArrowDownLeft className="h-4 w-4" />
                          : <ArrowUpRight className="h-4 w-4" />
                        }
                      </div>

                      {/* Description + date */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">
                          {entry.referenceType || 'Wallet transaction'}
                        </p>
                        <p className="text-xs text-muted-foreground">{formatLedgerDate(entry.createdAt)}</p>
                      </div>

                      {/* Amount + balance */}
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold tabular-nums ${isCredit ? 'text-green-600' : 'text-red-600'}`}>
                          {isCredit ? '+' : '−'}{formatCurrency(entry.amount || 0)}
                        </p>
                        <p className="text-xs text-muted-foreground tabular-nums">
                          Balance: {formatCurrency(entry.balanceAfter || 0)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}

export default WalletPage;
