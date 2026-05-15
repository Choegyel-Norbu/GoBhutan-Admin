import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../lib/authAPI';
import { Eye, EyeOff, ShieldCheck, RotateCcw, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const STEPS = ['username', 'otp', 'password'];

const stepLabel = { username: 'Identify', otp: 'Verify OTP', password: 'Set Password' };

const SetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode = location.state?.mode ?? 'reset'; // 'reset' = forgot password, 'setup' = first-time setup
  // Pre-fill username if coming from the sign-in error redirect
  const [username, setUsername] = useState(location.state?.username || '');
  const [step, setStep] = useState('username');

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [resendNotice, setResendNotice] = useState('');

  const clearErrors = () => { setError(''); setFieldErrors({}); };

  // ── Step 1: send OTP ──────────────────────────────────────────────
  const handleSendOtp = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!username.trim()) {
      setFieldErrors({ username: 'Username is required.' });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.sendForgotPasswordOtp(username.trim());
      setStep('otp');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to send OTP. Please check your username and try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────
  const handleResendOtp = async () => {
    setIsResending(true);
    setError('');
    setResendNotice('');
    try {
      await authAPI.sendForgotPasswordOtp(username.trim());
      setResendNotice('A new OTP has been sent to your registered email address.');
    } catch {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearErrors();

    if (!otp.trim()) {
      setFieldErrors({ otp: 'Please enter the OTP.' });
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.verifyForgotPasswordOtp({ username: username.trim(), otp: otp.trim() });
      setStep('password');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Invalid or expired OTP. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 3: reset password ────────────────────────────────────────
  const handleResetPassword = async (e) => {
    e.preventDefault();
    clearErrors();

    const errors = {};
    if (!newPassword) errors.newPassword = 'Password is required.';
    else if (newPassword.length < 8) errors.newPassword = 'Password must be at least 8 characters.';
    if (!confirmPassword) errors.confirmPassword = 'Please confirm your password.';
    else if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match.';

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await authAPI.resetForgotPassword({
        username: username.trim(),
        otp: otp.trim(),
        newPassword,
      });
      setSuccessMessage(
        mode === 'setup'
          ? 'Password set successfully! Redirecting to sign in…'
          : 'Password reset successfully! Redirecting to sign in…'
      );
      setTimeout(() => navigate('/signin'), 1800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to set password. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepIndex = STEPS.indexOf(step);

  const inputBase =
    'w-full px-4 py-3 rounded-lg border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors';
  const errBorder = 'border-destructive focus:ring-destructive/40';
  const normalBorder = 'border-border';

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-2xl shadow-xl p-8 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-3">
              <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
                <ShieldCheck size={28} />
              </span>
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              {mode === 'setup' ? 'Password Setup Required' : 'Reset Password'}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step === 'username' && mode === 'setup' &&
                'Your account has not been fully set up yet. Enter your username to receive a one-time password (OTP) and create your password.'}
              {step === 'username' && mode === 'reset' &&
                'Enter your username and we\'ll send a one-time password (OTP) to your registered email address.'}
              {step === 'otp' && (
                <>
                  An OTP has been sent to the email linked to{' '}
                  <span className="font-medium text-foreground">{username}</span>. Enter it below to continue.
                </>
              )}
              {step === 'password' && 'OTP verified. Choose a strong new password for your account.'}
            </p>
          </div>

          {/* Step indicator */}
          <div className="flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold border-2 transition-colors ${
                      i < currentStepIndex
                        ? 'border-primary/40 bg-primary/10 text-primary'
                        : i === currentStepIndex
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  <span
                    className={`text-xs font-medium whitespace-nowrap ${
                      i === currentStepIndex ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {stepLabel[s]}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-2 transition-colors ${
                      i < currentStepIndex ? 'bg-primary/40' : 'bg-border'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Notices */}
          {resendNotice && (
            <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3 text-sm text-blue-700 dark:text-blue-400">
              <ShieldCheck size={16} className="mt-0.5 shrink-0" />
              <span>{resendNotice}</span>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {successMessage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700 dark:text-green-400"
            >
              {successMessage}
            </motion.div>
          )}

          <AnimatePresence mode="wait">

            {/* ── Step 1: username ── */}
            {step === 'username' && (
              <motion.form
                key="username-form"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSendOtp}
                className="space-y-4"
                noValidate
              >
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">Username</label>
                  <div className="relative">
                    <input
                      type="text"
                      autoComplete="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        if (fieldErrors.username) setFieldErrors((p) => ({ ...p, username: '' }));
                        if (error) setError('');
                      }}
                      className={`${inputBase} pl-10 ${fieldErrors.username ? errBorder : normalBorder}`}
                    />
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  </div>
                  {fieldErrors.username && (
                    <p className="text-xs text-destructive">{fieldErrors.username}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>Send OTP <ArrowRight size={18} /></>
                  )}
                </button>
              </motion.form>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <motion.form
                key="otp-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleVerifyOtp}
                className="space-y-4"
                noValidate
              >
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">OTP</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter the OTP from your email"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      if (fieldErrors.otp) setFieldErrors((p) => ({ ...p, otp: '' }));
                      if (error) setError('');
                    }}
                    className={`${inputBase} ${fieldErrors.otp ? errBorder : normalBorder}`}
                  />
                  {fieldErrors.otp && (
                    <p className="text-xs text-destructive">{fieldErrors.otp}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>Verify OTP <ArrowRight size={18} /></>
                  )}
                </button>

                <div className="text-center space-y-1 pt-1">
                  <p className="text-sm text-muted-foreground">Didn&apos;t receive the OTP?</p>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                  >
                    <RotateCcw size={14} className={isResending ? 'animate-spin' : ''} />
                    {isResending ? 'Sending…' : 'Resend OTP'}
                  </button>
                </div>
              </motion.form>
            )}

            {/* ── Step 3: Set Password ── */}
            {step === 'password' && (
              <motion.form
                key="password-form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleResetPassword}
                className="space-y-4"
                noValidate
              >
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.newPassword) setFieldErrors((p) => ({ ...p, newPassword: '' }));
                        if (error) setError('');
                      }}
                      className={`${inputBase} pr-11 ${fieldErrors.newPassword ? errBorder : normalBorder}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-foreground">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter your new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) setFieldErrors((p) => ({ ...p, confirmPassword: '' }));
                        if (error) setError('');
                      }}
                      className={`${inputBase} pr-11 ${fieldErrors.confirmPassword ? errBorder : normalBorder}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !!successMessage}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <>Set Password <ArrowRight size={18} /></>
                  )}
                </button>
              </motion.form>
            )}

          </AnimatePresence>

          <div className="text-center text-sm text-muted-foreground">
            <Link to="/signin" className="font-medium text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SetPasswordPage;
