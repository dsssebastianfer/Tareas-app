import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import App from '../App';
import { cloudBackend, localBackend } from '../data/backend';
import { supabase } from '../lib/supabase';
import { AuthScreen, AuthShell } from './AuthScreen';

/**
 * Sin Supabase configurado: la app en modo local, como siempre.
 * Con Supabase: pide iniciar sesión y entrega a la app los datos de esa cuenta.
 */
export function AuthGate() {
  if (!supabase) return <App backend={localBackend} />;
  return <CloudGate />;
}

function CloudGate() {
  const db = supabase!;
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    db.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = db.auth.onAuthStateChange((event, s) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, [db]);

  const userId = session?.user.id;
  const backend = useMemo(() => (userId ? cloudBackend(db, userId) : null), [db, userId]);

  if (session === undefined) {
    return (
      <AuthShell>
        <div className="flex flex-col items-center gap-3 py-6 text-sm font-semibold text-[var(--ink-soft)]">
          <img src="/icons/logo.png" alt="" className="size-14 animate-pulse" />
          Cargando…
        </div>
      </AuthShell>
    );
  }
  if (recovering) return <AuthScreen db={db} initialMode="reset" />;
  if (!session || !backend) return <AuthScreen db={db} />;

  return (
    <App
      key={session.user.id}
      backend={backend}
      account={{ email: session.user.email ?? '', onSignOut: () => void db.auth.signOut() }}
    />
  );
}
