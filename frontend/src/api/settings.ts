import { authHeaders } from './client';

export type UserSettingsData = {
  workspace: string;
  role: string;
  defaultLocation: string;
  resultsPerPage: number;
  emailAlerts: boolean;
};

export async function fetchSettings(): Promise<UserSettingsData> {
  const response = await fetch('http://localhost:4000/api/settings', {
    headers: { ...authHeaders() },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to load settings');
  return data;
}

export async function saveSettingsApi(settings: UserSettingsData): Promise<void> {
  const response = await fetch('http://localhost:4000/api/settings', {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.error || 'Failed to save settings');
  }
}