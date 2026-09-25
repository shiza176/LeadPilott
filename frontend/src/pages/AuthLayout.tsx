import type { ReactNode } from 'react';
import { Radio } from 'lucide-react';
import { Logo } from '@/components/layout';
import { useLocation } from 'wouter';
import LoginPage from '@/pages/Login';
import RegisterPage from '@/pages/Register';

type Notice = { message: string; kind?: 'success' | 'default' };

export default function AuthLayout({ notify, onLogin, onRegister, children, mode: fixedMode }: {
  notify?: (notice: Notice) => void;
  onLogin?: (email: string, password: string) => void;
  onRegister?: (name: string, email: string, password: string) => void;
  children?: ReactNode;
  mode?: 'login' | 'register';
}) {
  const [location] = useLocation();
  const mode = fixedMode ?? (location === '/register' ? 'register' : 'login');

  return <div className="relative flex min-h-screen w-full overflow-hidden bg-[hsl(var(--background))]">
    <aside className="absolute top-0 z-0 hidden h-full w-2/5 overflow-hidden bg-[hsl(var(--sidebar))] px-8 py-8 text-[hsl(var(--sidebar-foreground))] md:flex md:flex-col lg:px-12" style={{ left: mode === 'login' ? '0%' : '60%', transition: 'left 500ms ease-in-out' }}>
      <div className="pointer-events-none absolute -right-32 top-1/4 h-96 w-96 rounded-full border border-[hsl(var(--sidebar-foreground)/.07)]" />
      <div className="pointer-events-none absolute -right-20 top-[30%] h-72 w-72 rounded-full border border-[hsl(var(--sidebar-foreground)/.05)]" />
      <div className="relative flex items-center gap-3">
        <Logo />
        <span className="rounded-full border border-[hsl(var(--sidebar-foreground)/.18)] px-2 py-1 text-[9px] font-bold uppercase tracking-[.12em] text-[hsl(var(--sidebar-foreground)/.65)]">Workspace</span>
      </div>
      <div className="relative mt-auto max-w-lg pb-10 pt-24">
        <p className="eyebrow mb-3 text-[hsl(var(--sidebar-foreground)/.5)]">Prospecting, with a point of view</p>
        <h1 className="text-4xl font-extrabold leading-[1.05] tracking-[-.05em] text-white lg:text-5xl">Find the right people. <span className="text-[hsl(var(--sidebar-primary))]">Start well.</span></h1>
        <p className="mt-5 max-w-md text-sm leading-6 text-[hsl(var(--sidebar-foreground)/.65)]">A focused workspace for founders and sales teams who would rather build useful relationships than chase noisy lists.</p>
      </div>
      <div className="relative flex items-center gap-2 border-t border-[hsl(var(--sidebar-foreground)/.15)] pt-5 text-[11px] font-semibold text-[hsl(var(--sidebar-foreground)/.6)]">
        <Radio size={13} />
        <span>Signal-led research, ready when you are.</span>
      </div>
    </aside>
    <main className="absolute top-0 z-10 flex h-full w-3/5 min-w-0 items-center justify-center p-4 md:p-8" style={{ left: mode === 'login' ? '40%' : '0%', transition: 'left 500ms ease-in-out' }}>
      {children ?? (mode === 'login' ? <LoginPage onSubmit={onLogin ?? (() => {})} /> : <RegisterPage onSubmit={onRegister ?? (() => {})} />)}
    </main>
  </div>;
}
