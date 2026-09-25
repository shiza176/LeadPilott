import { useState } from 'react';
import { Link } from 'wouter';
import AuthLayout from '@/pages/AuthLayout';
import { forgotPassword } from '@/api/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await forgotPassword(email);
    } catch {
      // Keep the response generic whether or not the email exists.
    } finally {
      setSubmitted(true);
    }
  };

  return <AuthLayout mode="login">
    <div className="animate-rise w-full max-w-md">
      <section className="card p-5 md:p-6">
        <div className="mb-6">
          <p className="eyebrow mb-2">Account recovery</p>
          <h1 className="text-[20px] font-extrabold">Forgot password?</h1>
          <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Enter your email and we&apos;ll send a reset link if an account exists.</p>
        </div>
        {submitted ? <div className="space-y-4">
          <p className="text-sm text-[hsl(var(--primary))]">If that email exists, check your inbox for a reset link.</p>
          <Link href="/login" className="btn-primary block w-full text-center">Back to login</Link>
        </div> : <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="eyebrow mb-2 block">Email</span>
            <input className="field text-[12px]" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          </label>
          <button className="btn-primary w-full" type="submit">Send reset link</button>
          <Link href="/login" className="block text-center text-[11px] font-semibold text-[hsl(var(--primary))]">Back to login</Link>
        </form>}
      </section>
    </div>
  </AuthLayout>;
}
