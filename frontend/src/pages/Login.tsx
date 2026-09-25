import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { Eye, EyeOff } from 'lucide-react';

export type LoginProps = {
  onSubmit: (email: string, password: string) => void;
};

export default function LoginPage({ onSubmit }: LoginProps) {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address';
    if (!password) nextErrors.password = 'Password is required';
    setErrors(nextErrors);
    if (Object.keys(nextErrors

      
    ).length > 0) return;
    onSubmit(email, password);
  };

  return <div className="animate-rise w-full max-w-md">
    <section className="card p-5 md:p-6">
      <div className="mb-6 flex border-b border-[hsl(var(--border))]">
        <button type="button" className="flex-1 border-b-2 border-[hsl(var(--primary))] pb-3 text-xs font-bold text-[hsl(var(--primary))]" onClick={() => navigate('/login')}>Sign in</button>
        <button type="button" className="flex-1 pb-3 text-xs text-[hsl(var(--muted-foreground))]" onClick={() => navigate('/register')}>Create account</button>
      </div>
      <div className="mb-6">
        <p className="eyebrow mb-2">Welcome back</p>
        <h1 className="text-[20px] font-extrabold">Log in.</h1>
        <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">Continue to your LeadPilot workspace.</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="eyebrow mb-2 block">Email</span>
          <input className="field text-[12px]" type="email" value={email} onChange={event => setEmail(event.target.value)} required />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </label>
        <label className="block">
          <span className="eyebrow mb-2 block">Password</span>
          <div className="relative">
            <input className="field w-full pr-9 text-[12px]" type={showPassword ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} required />
            <button type="button" className="absolute inset-y-0 right-2 flex items-center text-[hsl(var(--muted-foreground))]" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
          <Link href="/forgot-password" className="mt-1 inline-block text-[11px] font-semibold text-[hsl(var(--primary))]">Forgot password?</Link>
        </label>
        <button className="btn-primary w-full" type="submit">Log in</button>
      </form>
    </section>
  </div>;
}
