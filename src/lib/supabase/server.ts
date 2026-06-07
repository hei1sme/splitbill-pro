import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'dummy-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options as Parameters<typeof cookieStore.set>[2])
            );
          } catch {
            // setAll called from a Server Component — cookies can only be
            // modified in Route Handlers and Server Actions; safe to ignore
          }
        },
      },
    }
  );

  // DEV_MODE bypasses auth — use server-side env var (not NEXT_PUBLIC_)
  if (process.env.DEV_MODE === 'true' || process.env.DEV_MODE === '1') {
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
