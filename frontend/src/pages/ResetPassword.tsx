import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link } from 'wouter';
import AuthLayout from '@/pages/AuthLayout';
import { resetPassword } from '@/api/auth';

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const token = new URLSearchParams(window.location.search).get('token') ?? '';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const missing: string[] = [];
    if (!newPassword) {
      setError('Password is required');
      return;
    }
    if (newPassword.length < 8) missing.push('at least 8 characters');
    if (!/[A-Z]/.test(newPassword)) missing.push('an uppercase letter');
    if (!/[a-z]/.test(newPassword)) missing.push('a lowercase letter');
    if (!/\d/.test(newPassword)) missing.push('a digit');
    if (!/[!@#$%^&*]/.test(newPassword)) missing.push('a special character');
    if (missing.length > 0) {
      setError(`Password must contain ${missing.join(', ')}.`);
      return;
    }

    try {
      setError('');
      await resetPassword(token, newPassword);
      setSuccess(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Failed to reset password');
    }
  };

  return <AuthLayout mode="login">
    <div className="animate-rise w-full max-w-md">
      <section className="card p-5 md:p-6">
        <div className="mb-6">
          <p className="eyebrow mb-2">Account recovery</p>
          <h1 className="text-[20px] font-extrabold">Set a new password.</h1>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Choose a strong password for your LeadPilot account.</p>
        </div>
        {success ? <div className="space-y-4">
          <p className="text-sm text-[hsl(var(--primary))]">Your password has been reset successfully.</p>
          <Link href="/login" className="btn-primary block w-full text-center">Back to login</Link>
        </div> : <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="eyebrow mb-2 block">New password</span>
            <div className="relative">
              <input className="field w-full pr-9 text-[12px]" type={showPassword ? 'text' : 'password'} value={newPassword} onChange={event => setNewPassword(event.target.value)} required />
              <button type="button" className="absolute inset-y-0 right-2 flex items-center text-[hsl(var(--muted-foreground))]" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </label>
          <button className="btn-primary w-full" type="submit">Reset password</button>
          <Link href="/login" className="block text-center text-[11px] font-semibold text-[hsl(var(--primary))]">Back to login</Link>
        </form>}
      </section>
    </div>
  </AuthLayout>;
}
