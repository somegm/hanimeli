export interface AuthUser {
  id: string;
  displayName: string;
  email: string | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export type AuthMode = 'login' | 'signup';
