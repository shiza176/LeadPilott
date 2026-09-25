import { useEffect, useState } from "react";
import { Building2, Check, Mail, SlidersHorizontal } from "lucide-react";
import { locations } from "@/data";
import { SectionHeader } from "@/components/layout";
import { fetchSettings, saveSettingsApi } from "@/api/settings";

type Notice = { message: string; kind?: "success" | "default" };

export default function SettingsPage({
  notify,
  onSaved,
}: {
  notify: (notice: Notice) => void;
  onSaved?: (role: string) => void;
}) {
  const [workspace, setWorkspace] = useState("");
  const [role, setRole] = useState("Founder");
  const [defaultLocation, setDefaultLocation] = useState("Pakistan");
  const [resultsPerPage, setResultsPerPage] = useState(25);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings()
      .then((data) => {
        setWorkspace(data.workspace);
        setRole(data.role);
        setDefaultLocation(data.defaultLocation);
        setResultsPerPage(data.resultsPerPage);
        setEmailAlerts(data.emailAlerts);
      })
      .catch(() => notify({ message: "Could not load settings" }))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSettingsApi({
        workspace,
        role,
        defaultLocation,
        resultsPerPage,
        emailAlerts,
      });
      notify({ message: "Settings saved", kind: "success" });
      onSaved?.(role);
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-rise max-w-[930px]">
        <p className="text-[12px] text-[hsl(var(--muted-foreground))]">
          Loading settings…
        </p>
      </div>
    );
  }

  return (
    <div className="animate-rise max-w-[930px]">
      <SectionHeader
        eyebrow="Workspace controls"
        title="Settings."
        description="Keep the workspace tuned to the way your team researches new opportunities."
        action={
          <button
            data-testid="button-save-settings"
            className="btn-primary flex items-center gap-2"
            onClick={handleSave}
            disabled={saving}
          >
            <Check size={14} /> {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[190px_1fr]">
        <nav className="hidden space-y-1 lg:block">
          <div className="settings-nav active">Workspace</div>
          <div className="settings-nav">Preferences</div>
          <div className="settings-nav">Notifications</div>
        </nav>
        <div className="space-y-4">
          <section className="card p-5 md:p-6">
            <div className="mb-6 flex items-start gap-3">
              <div className="settings-icon">
                <Building2 size={16} />
              </div>
              <div>
                <h2 className="text-[14px] font-extrabold">
                  Workspace identity
                </h2>
                <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                  This is how your workspace appears to teammates.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="eyebrow mb-2 block">Workspace name</span>
                <input
                  data-testid="input-workspace-name"
                  className="field text-[12px]"
                  value={workspace}
                  onChange={(e) => setWorkspace(e.target.value)}
                />
              </label>
              <label>
                <span className="eyebrow mb-2 block">Your role</span>
                <select
                  data-testid="select-workspace-role"
                  className="field text-[12px]"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option>Founder</option>
                  <option>Revenue leader</option>
                  <option>Researcher</option>
                  <option>Advisor</option>
                </select>
              </label>
            </div>
          </section>
          <section className="card p-5 md:p-6">
            <div className="mb-6 flex items-start gap-3">
              <div className="settings-icon orange">
                <SlidersHorizontal size={16} />
              </div>
              <div>
                <h2 className="text-[14px] font-extrabold">
                  Discovery defaults
                </h2>
                <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                  Pre-fill the signals you reach for most often.
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="eyebrow mb-2 block">Default location</span>
                <select
                  data-testid="select-default-location"
                  className="field text-[12px]"
                  value={defaultLocation}
                  onChange={(e) => setDefaultLocation(e.target.value)}
                >
                 {Array.from(new Set(locations)).map((location) => (
                    <option key={location}>{location}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="eyebrow mb-2 block">Results per page</span>
                <select
                  data-testid="select-results-page"
                  className="field text-[12px]"
                  value={String(resultsPerPage)}
                  onChange={(e) => setResultsPerPage(Number(e.target.value))}
                >
                  <option value="25">25 results</option>
                  <option value="50">50 results</option>
                  <option value="100">100 results</option>
                </select>
              </label>
            </div>
          </section>
          <section className="card p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="settings-icon blue">
                <Mail size={16} />
              </div>
              <div>
                <h2 className="text-[14px] font-extrabold">Notifications</h2>
                <p className="mt-1 text-[11px] text-[hsl(var(--muted-foreground))]">
                  Choose when LeadPilot should nudge you.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] p-3.5">
              <div>
                <p className="text-[12px] font-bold">Weekly research digest</p>
                <p className="mt-1 text-[10px] text-[hsl(var(--muted-foreground))]">
                  A short summary of saved leads and new signals.
                </p>
              </div>
              <button
                data-testid="button-toggle-email-alerts"
                className={`switch ${emailAlerts ? "on" : ""}`}
                onClick={() => setEmailAlerts(!emailAlerts)}
                aria-label="Toggle weekly research digest"
              >
                <span />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
