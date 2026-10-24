// Dados do projeto no Supabase (Dashboard > Project Settings > API).
// A anon key é pública por natureza: quem protege os dados são as regras (RLS) do supabase/schema.sql.
export const SUPABASE_URL = 'https://ibhnxwlqpagqrntynuxq.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImliaG54d2xxcGFncXJudHludXhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI4NzUzNDksImV4cCI6MjEwODQ1MTM0OX0.C6zKL4MdQSaxfsxxjsZS4dqCJrCtk8o00kqS0mFVsAg';

// Canais de contato da Pet Friends. Enquanto estiverem vazios, a section de contato mostra "em breve".
export const CONTACT = {
    email: '',
    // só números, com DDI e DDD, ex.: 5551999999999
    whatsapp: '',
};
