import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
// Clave pública del proyecto: «Publishable key» (sb_publishable_…) en el panel nuevo, o la antigua «anon key».
const anonKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/**
 * Cliente de Supabase. Si faltan las variables de entorno, la app funciona en modo local
 * (todo en este navegador, sin cuentas), como antes.
 */
export const supabase: SupabaseClient | null = url && anonKey ? createClient(url, anonKey) : null;
export const isCloud = supabase !== null;

/** Avisa a la app que algo no se pudo guardar (normalmente, falta de conexión). */
export function reportSyncError(error: unknown) {
  console.error(error);
  window.dispatchEvent(new CustomEvent('semanas:sync-error'));
}
