'use client';
// The frame around every signed-in page: top bar, demo notice, sign-in check.
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { getMe, isDemo, signOut } from '@/lib/client';
import { ROLES, type Profile } from '@/lib/types';

const UserCtx = createContext<Profile | null>(null);
export const useUser = () => useContext(UserCtx)!;

export function DemoBanner() {
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    isDemo().then(setDemo);
  }, []);
  if (!demo) return null;
  return (
    <div className="demo-banner">
      Demo mode: no real accounts and data is cleared when the server restarts. Connect Supabase to go live (see README).
    </div>
  );
}

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    getMe().then((u) => {
      if (!u) router.replace('/');
      setUser(u);
    });
  }, [router]);

  if (!user) return <div className="page muted">Loading…</div>;
  const roleLabel = ROLES.find((r) => r.id === user.role)?.label;

  return (
    <UserCtx.Provider value={user}>
      <DemoBanner />
      <header className="topbar">
        <div className="topbar-inner">
          <Link href="/hub" className="logo">MDSSPL Service Hub</Link>
          <nav>
            <Link href="/hub">Projects</Link>
            {(user.role === 'admin' || user.role === 'staff') && <Link href="/admin">Users</Link>}
          </nav>
          <span className="who">{user.full_name || user.email} · {roleLabel}</span>
          <button
            className="btn"
            onClick={async () => {
              await signOut();
              router.replace('/');
            }}
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="page">{children}</main>
    </UserCtx.Provider>
  );
}
