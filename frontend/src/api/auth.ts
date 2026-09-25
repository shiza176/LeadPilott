export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type LoginResponse = {
  token: string;
  user: AuthUser;
};

export async function register(name: string, email: string, password: string): Promise<AuthUser> {
  const response = await fetch('http://localhost:4000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to register');
  return data;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  const response = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to log in');
  return data;
}

export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch('http://localhost:4000/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to send password reset link');
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch('http://localhost:4000/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data?.error || 'Failed to reset password');
}
