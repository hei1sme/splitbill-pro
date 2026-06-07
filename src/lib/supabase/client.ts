import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key'
  );

  if (process.env.NEXT_PUBLIC_DEV_MODE === 'true' || process.env.NEXT_PUBLIC_DEV_MODE === '1') {
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000000',
      aud: 'authenticated',
      role: 'authenticated',
      email: 'dev@local.host',
      app_metadata: { provider: 'email', providers: ['email'] },
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any;

    supabase.auth.getUser = async () => ({ data: { user: mockUser }, error: null } as any);
    supabase.auth.getSession = async () => ({
      data: { session: { access_token: 'mock-token', refresh_token: 'mock-token', expires_in: 3600, expires_at: 3600, token_type: 'bearer', user: mockUser } },
      error: null
    } as any);
  }

  return supabase;
}
