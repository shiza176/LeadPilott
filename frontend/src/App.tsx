import { useCallback, useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Router as WouterRouter, Switch, useLocation } from 'wouter';
import { Check, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/layout';
import DashboardPage from '@/pages/Dashboard';
import DiscoveryPage from '@/pages/Discovery';
import SavedPage from '@/pages/Saved';
import SearchHistoryPage from '@/pages/SearchHistory';
import SettingsPage from '@/pages/Settings';
import DetailPanel from '@/components/DetailPanel';
import NotFound from '@/pages/not-found';
import { companies, leads, type Company, type Lead, type SearchRecord } from '@/data';
import type { GeneratedSearchResults } from '@/search-engine';
import { fetchHistory, deleteHistoryEntry } from '@/api/history';
import { fetchSavedItems } from '@/api/saved';
const queryClient = new QueryClient();
type Notice = { message: string; kind?: 'success' | 'default' };
type Detail = { kind: 'lead'; item: Lead } | { kind: 'company'; item: Company } | null;

function App() {
  const [location, navigate] = useLocation();
  const [savedLeadIds, setSavedLeadIds] = useState<string[]>(leads.filter(lead => lead.saved).map(lead => lead.id));
  const [savedCompanyIds, setSavedCompanyIds] = useState<string[]>(['sapphire-textiles', 'khaadi']);
  const [knownLeads, setKnownLeads] = useState<Lead[]>(leads);
  const [knownCompanies, setKnownCompanies] = useState<Company[]>(companies);
  const [searches, setSearches] = useState<SearchRecord[]>([]);
  const [rerunRecord, setRerunRecord] = useState<SearchRecord | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [detail, setDetail] = useState<Detail>(null);
  const notify = (next: Notice) => { setNotice(next); window.setTimeout(() => setNotice(null), 3000); };
  
  useEffect(() => { 
    fetchHistory().then(setSearches).catch(() => {});
    fetchSavedItems().then(data => {
      if (data.savedCompanyIds?.length) setSavedCompanyIds(data.savedCompanyIds);
      if (data.savedLeadIds?.length) setSavedLeadIds(data.savedLeadIds);
      if (data.companies?.length) {
        setKnownCompanies(curr => {
          const map = new Map(curr.map(c => [c.id, c]));
          data.companies.forEach(c => map.set(c.id, c));
          return [...map.values()];
        });
      }
    }).catch(() => {});
  }, []);
  const deleteSearch = async (id: string) => { try { await deleteHistoryEntry(id); setSearches(current => current.filter(item => item.id !== id)); notify({ message: 'Search removed from history' }); } catch (error) { notify({ message: error instanceof Error ? error.message : 'Failed to delete search' }); } };
  const registerResults = useCallback((results: GeneratedSearchResults) => {
    setKnownLeads(current => { const next = new Map(current.map(lead => [lead.id, lead])); results.peopleResults.forEach(lead => next.set(lead.id, lead)); return [...next.values()]; });
    setKnownCompanies(current => { const next = new Map(current.map(company => [company.id, company])); results.companyResults.forEach(company => next.set(company.id, company)); return [...next.values()]; });
  }, []);
  const rerun = (record: SearchRecord) => { setRerunRecord(record); navigate('/search'); notify({ message: `Rerunning “${record.query}”`, kind: 'success' }); };
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppShell notify={notify}><ErrorBoundary resetKey={location}><Switch><Route path="/"><DashboardPage notify={notify} /></Route><Route path="/dashboard"><DashboardPage notify={notify} /></Route><Route path="/search"><DiscoveryPage savedLeadIds={savedLeadIds} setSavedLeadIds={setSavedLeadIds} savedCompanyIds={savedCompanyIds} setSavedCompanyIds={setSavedCompanyIds} searches={searches} setSearches={setSearches} notify={notify} onOpen={setDetail} rerunRecord={rerunRecord} registerResults={registerResults} /></Route><Route path="/saved"><SavedPage savedLeadIds={savedLeadIds} setSavedLeadIds={setSavedLeadIds} savedCompanyIds={savedCompanyIds} setSavedCompanyIds={setSavedCompanyIds} notify={notify} onOpen={setDetail} allLeads={knownLeads} allCompanies={knownCompanies} /></Route><Route path="/history"><SearchHistoryPage searches={searches} setSearches={setSearches} notify={notify} onRerun={rerun} /></Route><Route path="/settings"><SettingsPage notify={notify} /></Route><Route component={NotFound} /></Switch></ErrorBoundary></AppShell></WouterRouter><DetailPanel detail={detail} onClose={() => setDetail(null)} savedLeadIds={savedLeadIds} setSavedLeadIds={setSavedLeadIds} notify={notify} companyCatalog={knownCompanies} /><Toaster />{notice && <div className="toast-note animate-rise" data-testid="status-toast"><span className="toast-check"><Check size={13} /></span><span>{notice.message}</span><button data-testid="button-close-toast" onClick={() => setNotice(null)}><X size={13} /></button></div>}</TooltipProvider></QueryClientProvider>;
}

export default App;
