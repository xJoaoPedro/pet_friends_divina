import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

export const isConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isConfigured) {
    console.warn('Pet Friends: preencha SUPABASE_URL e SUPABASE_ANON_KEY em src/js/config.js (veja docs/SUPABASE.md).');
}

export const supabase = isConfigured ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

export const PHOTO_BUCKET = 'animal-photos';

export async function getSession() {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
}

// manda para o login e volta para a página atual depois
export function goToLogin(next = currentPage()) {
    window.location.href = `login.html?next=${encodeURIComponent(next)}`;
}

// para páginas que só funcionam com login (anunciar, meus anúncios)
export async function requireSession() {
    const session = await getSession();
    if (!session) goToLogin();
    return session;
}

export function currentPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return page + window.location.search + window.location.hash;
}

export function displayName(user) {
    return user.user_metadata?.full_name || user.user_metadata?.name || user.email.split('@')[0];
}
