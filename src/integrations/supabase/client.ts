import { createClient } from '@supabase/supabase-js';

// Tenta ler as variáveis de ambiente, mas fornece um fallback para o ambiente de desenvolvimento
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://yaxheyenslhvqdivqewr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlheGhleWVuc2xodnFkaXZxZXdyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNTczNTUsImV4cCI6MjA2MzgzMzM1NX0.CMn_883KX9-8-szFYtHYGlF4ThCzwKowy5I_af5EU0w";

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  // Este erro agora é muito improvável de acontecer, mas é uma boa prática mantê-lo.
  throw new Error("VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});