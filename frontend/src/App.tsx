import { useCallback, useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Router as WouterRouter, Switch, useLocation } from "wouter";
import { Check, X } from "lucide-react";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppShell } from "@/components/layout";
import DashboardPage from "@/pages/Dashboard";
import DiscoveryPage from "@/pages/Discovery";
import SavedPage from "@/pages/Saved";
import SearchHistoryPage from "@/pages/SearchHistory";
import SettingsPage from "@/pages/Settings";
import AuthLayout from "@/pages/AuthLayout";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import ResetPasswordPage from "@/pages/ResetPassword";
import DetailPanel from "@/components/DetailPanel";
import NotFound from "@/pages/not-found";
import { type Company, type Lead, type SearchRecord } from "@/data";
import type { GeneratedSearchResults } from "@/search-engine";
import { fetchHistory, deleteHistoryEntry } from "@/api/history";
import { fetchSavedItems } from "@/api/saved";
import { login, register } from "@/api/auth";
import { fetchSettings } from "@/api/settings";
const queryClient = new QueryClient();
type Notice = { message: string; kind?: "success" | "default" };
type Detail =
  { kind: "lead"; item: Lead } | { kind: "company"; item: Company } | null;

function App() {
  const [location, navigate] = useLocation();
  const [savedLeadIds, setSavedLeadIds] = useState<string[]>([]);
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>([]);
  const [knownLeads, setKnownLeads] = useState<Lead[]>([]);
  const [knownCompanies, setKnownCompanies] = useState<Company[]>([]);
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [rerunRecord, setRerunRecord] = useState<SearchRecord | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [detail, setDetail] = useState<Detail>(null);
   const [userName, setUserName] = useState(() => {
     try {
      const stored = JSON.parse(localStorage.getItem("authUser") || "null");
      return stored?.name ?? "";
    } catch {
      return "";
    }
  });
  const [role, setRole] = useState("Founder");
  const syncRole = () => {
    fetchSettings()
      .then((data) => setRole(data.role))
      .catch(() => {});
  };
  const notify = (next: Notice) => {
    setNotice(next);
    window.setTimeout(() => setNotice(null), 3000);
  };
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    navigate("/login");
  };
  useEffect(() => {
    if (
      localStorage.getItem("authToken") === null &&
      location !== "/login" &&
      location !== "/register" &&
      location !== "/forgot-password" &&
      location !== "/reset-password"
    ) {
      navigate("/login");
    }
  }, [location, navigate]);

  useEffect(() => {
     syncRole();
    fetchHistory()
      .then(setSearches)
      .catch(() => {});
    fetchSavedItems()
      .then((data) => {
        if (data.savedCompanyIds?.length)
          setSavedCompanyIds(data.savedCompanyIds);
        if (data.savedLeadIds?.length) setSavedLeadIds(data.savedLeadIds);
        if (data.leads?.length) {
          setKnownLeads((curr) => {
            const map = new Map(curr.map((lead) => [lead.id, lead]));
            data.leads.forEach((lead) => map.set(lead.id, lead));
            return [...map.values()];
          });
        }
        if (data.companies?.length) {
          setKnownCompanies((curr) => {
            const map = new Map(curr.map((c) => [c.id, c]));
            data.companies.forEach((c) => map.set(c.id, c));
            return [...map.values()];
          });
        }
      })
      .catch(() => {});
  }, []);
  const deleteSearch = async (id: string) => {
    try {
      await deleteHistoryEntry(id);
      setSearches((current) => current.filter((item) => item.id !== id));
      notify({ message: "Search removed from history" });
    } catch (error) {
      notify({
        message:
          error instanceof Error ? error.message : "Failed to delete search",
      });
    }
  };
  const registerResults = useCallback((results: GeneratedSearchResults) => {
    setKnownLeads((current) => {
      const next = new Map(current.map((lead) => [lead.id, lead]));
      results.peopleResults.forEach((lead) => next.set(lead.id, lead));
      return [...next.values()];
    });
    setKnownCompanies((current) => {
      const next = new Map(current.map((company) => [company.id, company]));
      results.companyResults.forEach((company) =>
        next.set(company.id, company),
      );
      return [...next.values()];
    });
  }, []);
  const rerun = (record: SearchRecord) => {
    setRerunRecord(record);
    navigate("/search");
    notify({ message: `Rerunning “${record.query}”`, kind: "success" });
  };
  const authContent = (
    <AuthLayout
      notify={notify}
      onLogin={async (email, password) => {
        try {
          const data = await login(email, password);
          localStorage.setItem("authToken", data.token);
          localStorage.setItem("authUser", JSON.stringify(data.user));
           setUserName(data.user.name);
          syncRole();
          navigate("/");
        } catch (error) {
          notify({
            message:
              error instanceof Error ? error.message : "Failed to log in",
          });
        }
      }}
      onRegister={async (name, email, password) => {
        try {
          await register(name, email, password);
          navigate("/login");
          notify({ message: "Account created successfully", kind: "success" });
        } catch (error) {
          notify({
            message:
              error instanceof Error ? error.message : "Failed to register",
          });
        }
      }}
    />
  );
  const authRoutes = (
    <Switch>
      <Route path="/login">{authContent}</Route>
      <Route path="/register">{authContent}</Route>
      <Route path="/forgot-password">
        <ForgotPasswordPage />
      </Route>
      <Route path="/reset-password">
        <ResetPasswordPage />
      </Route>
    </Switch>
  );
  const routeContent = (
    <ErrorBoundary resetKey={location}>
      <Switch>
        <Route path="/">
          <DashboardPage notify={notify} searches={searches} savedLeadIds={savedLeadIds} savedCompanyIds={savedCompanyIds} />
        </Route>
        <Route path="/dashboard">
         <DashboardPage notify={notify} searches={searches} savedLeadIds={savedLeadIds} savedCompanyIds={savedCompanyIds} />
        </Route>
        <Route path="/search">
          <DiscoveryPage
            savedLeadIds={savedLeadIds}
            setSavedLeadIds={setSavedLeadIds}
            savedCompanyIds={savedCompanyIds}
            setSavedCompanyIds={setSavedCompanyIds}
            searches={searches}
            setSearches={setSearches}
            notify={notify}
            onOpen={setDetail}
            rerunRecord={rerunRecord}
            registerResults={registerResults}
          />
        </Route>
        <Route path="/saved">
          <SavedPage
            savedLeadIds={savedLeadIds}
            setSavedLeadIds={setSavedLeadIds}
            savedCompanyIds={savedCompanyIds}
            setSavedCompanyIds={setSavedCompanyIds}
            notify={notify}
            onOpen={setDetail}
            allLeads={knownLeads}
            allCompanies={knownCompanies}
          />
        </Route>
        <Route path="/history">
          <SearchHistoryPage searches={searches} notify={notify} onRerun={rerun} onDelete={deleteSearch} />
        </Route>
        <Route path="/settings">
          <SettingsPage notify={notify} onSaved={setRole} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </ErrorBoundary>
  );
  const isAuthRoute =
    location === "/login" ||
    location === "/register" ||
    location === "/forgot-password" ||
    location === "/reset-password";
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          {isAuthRoute ? (
            <ErrorBoundary resetKey={location}>{authRoutes}</ErrorBoundary>
          ) : (
            <AppShell notify={notify} onLogout={logout} savedCount={savedLeadIds.length + savedCompanyIds.length}userName={userName} role={role}>
              {routeContent}
            </AppShell>
          )}
        </WouterRouter>
        <DetailPanel
          detail={detail}
          onClose={() => setDetail(null)}
          savedLeadIds={savedLeadIds}
          setSavedLeadIds={setSavedLeadIds}
          notify={notify}
          companyCatalog={knownCompanies}
        />
        <Toaster />
        {notice && (
          <div className="toast-note animate-rise" data-testid="status-toast">
            <span className="toast-check">
              <Check size={13} />
            </span>
            <span>{notice.message}</span>
            <button
              data-testid="button-close-toast"
              onClick={() => setNotice(null)}
            >
              <X size={13} />
            </button>
          </div>
        )}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
