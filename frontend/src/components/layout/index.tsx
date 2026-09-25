import { useState, type ReactNode } from "react";
import {
  Bookmark,
  ChevronDown,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  Target,
} from "lucide-react";
import { Link, useLocation } from "wouter";

type Notice = { message: string; kind?: "success" | "default" };

export function Avatar({
  initials,
  tone = "teal",
  size = "md",
}: {
  initials: string;
  tone?: string;
  size?: "sm" | "md" | "lg";
}) {
  return (
    <div
      data-testid={`avatar-${initials}`}
      className={`avatar avatar-${size} avatar-${tone}`}
    >
      {initials}
    </div>
  );
}

export function Logo() {
  return (
    <Link
      href="/dashboard"
      data-testid="link-brand"
      className="flex items-center gap-2.5"
    >
      <span className="brand-mark">
        <span />
      </span>
      <span className="text-[15px] font-extrabold tracking-[-.04em] text-[hsl(var(--sidebar-foreground))]">
        Lead<span className="text-[hsl(var(--sidebar-primary))]">Pilot</span>
      </span>
    </Link>
  );
}

export function AppShell({
  children,
  notify,
  onLogout,
  savedCount = 0,
  userName = "",
  role = "Founder",
}: {
  children: ReactNode;
  notify: (notice: Notice) => void;
  onLogout: () => void;
  savedCount?: number;
  userName?: string;
  role?: string;
}) {
  const [path] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials =
    userName
      .trim()
      .split(/\s+/)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .slice(0, 2)
      .join("") || "?";
  const nav = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/search", label: "Discover leads", icon: Target },
    { href: "/saved", label: "Saved", icon: Bookmark },
    { href: "/history", label: "Search history", icon: History },
  ];
  return (
    <div className="app-shell grain flex">
      <aside className="sidebar fixed inset-y-0 left-0 z-40 hidden w-[238px] flex-col border-r border-[hsl(var(--sidebar-border))] md:flex">
        <div className="flex h-[76px] items-center px-6">
          <Logo />
        </div>
        <div className="px-4">
          <Link
            href="/search"
            data-testid="link-sidebar-new-search"
            className="group flex w-full items-center justify-between rounded-lg bg-[hsl(var(--sidebar-primary))] px-3 py-2.5 text-[11px] font-extrabold text-[hsl(var(--sidebar-primary-foreground))] shadow-[0_8px_18px_hsl(var(--sidebar-primary)/.12)] transition-transform hover:-translate-y-0.5"
          >
            <span className="flex items-center gap-2">
              <Plus size={15} strokeWidth={2.5} /> New discovery
            </span>
            <span className="opacity-60">⌘ K</span>
          </Link>
        </div>
        <nav className="mt-8 px-3" aria-label="Primary navigation">
          <p className="eyebrow mb-2 px-3 text-[hsl(var(--sidebar-foreground)/.4)]">
            Workspace
          </p>
          {nav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              data-testid={`link-nav-${label.toLowerCase().replaceAll(" ", "-")}`}
              className={`nav-item ${path === href ? "active" : ""}`}
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
              {label === "Saved" && savedCount > 0 && (
                <span className="ml-auto rounded-full bg-[hsl(var(--sidebar-accent))] px-1.5 py-0.5 text-[10px]">
                  {savedCount}
                </span>
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto px-4 pb-5">
          <Link
            href="/settings"
            data-testid="link-nav-settings"
            className={`nav-item ${path === "/settings" ? "active" : ""}`}
          >
            <Settings size={16} strokeWidth={1.8} />
            <span>Settings</span>
          </Link>
          <button
            type="button"
            data-testid="button-sidebar-logout"
            className="nav-item w-full"
            onClick={onLogout}
          >
            <LogOut size={16} strokeWidth={1.8} />
            <span>Log out</span>
          </button>
          <div className="mt-3 flex items-center gap-2.5 border-t border-[hsl(var(--sidebar-border))] pt-4">
            <Avatar initials={initials} tone="orange" size="sm" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-bold">
                {userName || "Your account"}
              </p>
              <p className="truncate text-[10px] text-[hsl(var(--sidebar-foreground)/.45)]">
                {role} workspace
              </p>
            </div>
            <ChevronDown
              size={14}
              className="ml-auto text-[hsl(var(--sidebar-foreground)/.45)]"
            />
          </div>
        </div>
      </aside>
      <div className="min-w-0 flex-1 md:ml-[238px]">
        <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--background)/.9)] px-4 backdrop-blur-md md:px-9">
          <div className="flex items-center gap-3">
            <button
              data-testid="button-open-menu"
              className="btn-quiet p-2 md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Menu size={18} />
            </button>
            <div className="hidden md:block">
              <span className="eyebrow">Revenue intelligence / </span>
              <span className="text-[11px] font-bold text-[hsl(var(--muted-foreground))]">
                {path === "/search" ? "Discovery" : path.slice(1) || "overview"}
              </span>
            </div>
            <div className="md:hidden">
              <Logo />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              data-testid="button-command-search"
              className="btn-quiet hidden items-center gap-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 text-[11px] sm:flex"
              onClick={() =>
                notify({
                  message: "Command search is ready for your next discovery.",
                })
              }
            >
              <Search size={14} /> Quick find{" "}
              <span className="font-mono text-[10px] text-[hsl(var(--muted-foreground))]">
                ⌘ K
              </span>
            </button>
            <Link
              href="/settings"
              data-testid="link-header-settings"
              className="btn-quiet p-2"
            >
              <Settings size={16} />
            </Link>
            <div className="status-dot" title="All systems operational" />
          </div>
        </header>
        {menuOpen && (
          <div className="sidebar absolute left-0 right-0 top-[62px] z-40 p-3 shadow-lg md:hidden">
            {nav.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                data-testid={`link-mobile-${label.toLowerCase().replaceAll(" ", "-")}`}
                className={`nav-item ${path === href ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            ))}
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              data-testid="link-mobile-settings"
              className="nav-item"
            >
              <Settings size={16} />
              <span>Settings</span>
            </Link>
            <button
              type="button"
              data-testid="button-mobile-logout"
              onClick={() => {
                setMenuOpen(false);
                onLogout();
              }}
              className="nav-item w-full"
            >
              <LogOut size={16} />
              <span>Log out</span>
            </button>
          </div>
        )}
        <main className="content-wrap mx-auto max-w-[1440px] px-4 py-7 md:px-9 md:py-9">
          {children}
        </main>
      </div>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="eyebrow mb-2">{eyebrow}</p>
        <h1 className="text-[27px] font-extrabold tracking-[-.045em] text-[hsl(var(--foreground))] md:text-[31px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-xl text-[13px] leading-6 text-[hsl(var(--muted-foreground))]">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Metric({
  label,
  value,
  detail,
  icon: Icon,
  accent = "teal",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Target;
  accent?: string;
}) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className={`metric-icon metric-${accent}`}>
        <Icon size={16} />
      </div>
      <p className="eyebrow mt-5">{label}</p>
      <p className="mt-1 text-[29px] font-extrabold tracking-[-.06em]">
        {value}
      </p>
      <p className="mt-1 text-[11px] font-semibold text-[hsl(var(--muted-foreground))]">
        {detail}
      </p>
    </div>
  );
}
