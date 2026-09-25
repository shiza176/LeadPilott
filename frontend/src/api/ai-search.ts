import type { SearchFilters, Company, Lead } from '@/data';
import { authHeaders } from '@/api/client';

type SearchResponse = {
  companies: Company[];
  cached?: boolean;
};

type PeopleSearchResponse = {
  people: Lead[];
  cached?: boolean;
};

export async function searchCompanies(params: {
  query: string;
  filters: SearchFilters;
}): Promise<SearchResponse> {
  const response = await fetch('http://localhost:4000/api/ai/search', {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'AI search failed');
  }

  return data;
}

export async function searchPeople(params: {
  query: string;
  filters: SearchFilters;
}): Promise<PeopleSearchResponse> {
  const response = await fetch('http://localhost:4000/api/ai/search-people', {
    method: 'POST',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || 'AI people search failed');
  }

  return data;
}