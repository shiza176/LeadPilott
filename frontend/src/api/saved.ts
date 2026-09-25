import type { Company, Lead } from '@/data';
import { authHeaders } from './client';

export type SavedDataResponse = {
  savedCompanyIds: string[];
  savedLeadIds: string[];
  companies: Company[];
  leads: Lead[];
};

export async function fetchSavedItems(): Promise<SavedDataResponse> {
  const response = await fetch('http://localhost:4000/api/saved', {
    headers: { ...authHeaders() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to load saved items');
  return data;
}

export async function saveCompanyApi(companyId: string): Promise<void> {
  const response = await fetch('http://localhost:4000/api/saved/companies', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ companyId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to save company');
  }
}

export async function unsaveCompanyApi(companyId: string): Promise<void> {
  const response = await fetch(`http://localhost:4000/api/saved/companies/${companyId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to unsave company');
  }
}

export async function saveLeadApi(leadId: string): Promise<void> {
  const response = await fetch('http://localhost:4000/api/saved/leads', {
    method: 'POST',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId }),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to save lead');
  }
}

export async function unsaveLeadApi(leadId: string): Promise<void> {
  const response = await fetch(`http://localhost:4000/api/saved/leads/${leadId}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to unsave lead');
  }
}
