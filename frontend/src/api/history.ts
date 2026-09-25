import type { SearchRecord } from '@/data';
import { authHeaders } from './client';

export async function fetchHistory(): Promise<SearchRecord[]> {
  const response = await fetch('http://localhost:4000/api/history', {
    headers: { ...authHeaders() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to load search history');
  return data.history;
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  const response = await fetch(`http://localhost:4000/api/history/${id}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to delete history entry');
  }
}