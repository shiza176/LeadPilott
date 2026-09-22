import type { SearchFilters, Company } from '@/data';

type SearchResponse = {
  companies: Company[];
  cached?: boolean;
};

export async function searchCompanies(params: {
  query: string;
  filters: SearchFilters;
}): Promise<SearchResponse> {
  const response = await fetch('http://localhost:4000/api/ai/search', {
    method: 'POST',
    headers: {
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