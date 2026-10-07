import { useState, type FormEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { BACKGROUNDS } from '../domain/backgrounds';
import { colorForWeek, weekVars } from '../domain/palette';
import { getWeekKey } from '../domain/week';

type Mode = 'login' | 'signup' | 'forgot' | 'reset';

/** Traduce los errores de Supabase más comunes. */
function message(error: { message?: string; code?: string } | null): string {
  const m = error?.message ?? '';
  if (/invalid login credentials/i.test(m)) return 'Correo o contraseña incorrectos.';
  if (/email not confirmed/i.test(m)) return 'Aún no confirmas tu correo. Revisa tu bandeja de entrada (y spam).';
  if (/already registered|already been registered/i.test(m)) return 'Ya existe una cuenta con ese correo. Prueba entrando.';
  if (/password should be at least|weak password/i.test(m)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/rate limit|too many/i.test(m)) return 'Demasiados intentos. Espera un momento y vuelve a probar.';
  if (/invalid email|unable to validate email/i.test(m)) return 'Ese correo no parece válido.';
  if (/fetch|network/i.test(m)) return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
  return m || 'Algo salió mal. Inténtalo de nuevo.';
}

/** Fondo y vidrio como la app, para que la entrada se sienta parte de ella. */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="app wk relative" style={weekVars(colorForWeek(getWeekKey(new Date())))}>
      <div className="app-bg" style={{ ['--app-bg' as string]: BACKGROUNDS[0].css }} aria-hidden />
      <div className="relative z-10 grid min-h-dvh place-items-center p-4">
        <div className="w-full max-w-sm">
          <div className="shell !m-0 !h-auto !w-full p-7 sm:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function AuthScreen({ db, initialMode = 'login' }: { db: SupabaseClient; initialMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const go = (m: Mode) => {
    setMode(m);
    setError(null);
    setInfo(null);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      if (mode === 'login') {
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error) setError(message(error));
      } else if (mode === 'signup') {
        const { data, error } = await db.auth.signUp({
          email,
          password,
          options: { data: { name: name.trim() }, emailRedirectTo: location.origin },
        });
        if (error) setError(message(error));
        else if (!data.session) {
          setInfo('¡Listo! Te enviamos un correo para confirmar tu cuenta. Ábrelo y luego entra aquí.');
          setMode('login');
        }
      } else if (mode === 'forgot') {
        const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: location.origin });
        if (error) setError(message(error));
        else setInfo('Si existe una cuenta con ese correo, te llegará un link para crear una contraseña nueva.');
      } else {
        const { error } = await db.auth.updateUser({ password });
        if (error) setError(message(error));
        else {
          setInfo('Contraseña actualizada.');
          // La sesión ya está activa: limpiar el aviso de recuperación de la dirección y entrar.
          history.replaceState(null, '', location.pathname);
          location.reload();
        }
      }
    } catch (err) {
      setError(message(err as Error));
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<Mode, [string, string]> = {
    login: ['Hola de nuevo', 'Entra para ver tus semanas.'],
    signup: ['Crea tu cuenta', 'Tus tareas, una semana de cada color.'],
    forgot: ['¿Olvidaste tu contraseña?', 'Te enviaremos un link para crear una nueva.'],
    reset: ['Nueva contraseña', 'Elige una contraseña para tu cuenta.'],
  };

  return (
    <AuthShell>
      <div className="mb-6 flex flex-col items-center text-center">
        <img src="/icons/logo.png" alt="" className="mb-3 size-16" />
        <p className="font-display text-sm font-semibold text-[var(--ink-soft)]">Semanas</p>
        <h1 className="font-display text-2xl font-semibold tracking-tight">{titles[mode][0]}</h1>
        <p className="mt-1 text-sm text-[var(--ink-soft)]">{titles[mode][1]}</p>
      </div>

      {(mode === 'login' || mode === 'signup') && (
        <div role="tablist" className="surface mb-5 grid grid-cols-2 rounded-xl p-0.5 text-sm font-bold">
          {(['login', 'signup'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => go(m)}
              className={`relative cursor-pointer rounded-[10px] py-1.5 transition-colors ${
                mode === m ? 'text-[var(--ink)]' : 'text-[var(--ink-soft)] hover:text-[var(--ink)]'
              }`}
            >
              {mode === m && (
                <motion.span
                  layoutId="auth-tab"
                  className="absolute inset-0 rounded-[10px] shadow-sm"
                  style={{ background: 'var(--surface-strong)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}
              <span className="relative">{m === 'login' ? 'Entrar' : 'Crear cuenta'}</span>
            </button>
          ))}
        </div>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3">
        {mode === 'signup' && (
          <Field label="Tu nombre" value={name} onChange={setName} autoComplete="given-name" placeholder="Cómo te saludamos" />
        )}
        {mode !== 'reset' && (
          <Field label="Correo" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        )}
        {mode !== 'forgot' && (
          <Field
            label={mode === 'reset' ? 'Contraseña nueva' : 'Contraseña'}
            type="password"
            value={password}
            onChange={setPassword}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            minLength={6}
            required
          />
        )}

        <AnimatePresence>
          {(error || info) && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              role={error ? 'alert' : 'status'}
              className={`rounded-xl px-3 py-2 text-sm font-semibold ${error ? 'due-overdue' : 'opt'}`}
            >
              {error ?? info}
            </motion.p>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={busy}
          className="mt-1 cursor-pointer rounded-xl py-2.5 text-[15px] font-bold text-white shadow-md transition hover:brightness-110 disabled:cursor-wait disabled:opacity-60"
          style={{ background: 'var(--wk-accent)' }}
        >
          {busy
            ? 'Un momento…'
            : { login: 'Entrar', signup: 'Crear cuenta', forgot: 'Enviar link', reset: 'Guardar contraseña' }[mode]}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {mode === 'login' && (
          <button type="button" onClick={() => go('forgot')} className="cursor-pointer font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
            ¿Olvidaste tu contraseña?
          </button>
        )}
        {mode === 'forgot' && (
          <button type="button" onClick={() => go('login')} className="cursor-pointer font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] hover:underline">
            Volver a entrar
          </button>
        )}
      </div>
    </AuthShell>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="px-1 text-xs font-extrabold tracking-wide text-[var(--ink-soft)] uppercase">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="surface rounded-xl px-3.5 py-2.5 text-[15px] font-semibold outline-none placeholder:font-medium placeholder:text-[var(--ink-faint)] focus:border-[var(--wk-accent)]"
        {...rest}
      />
    </label>
  );
}
