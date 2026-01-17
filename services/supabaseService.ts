
import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string): string => {
  try {
    // Tenta obter de múltiplas fontes comuns (Vite, Process, etc)
    return (
      (import.meta as any).env?.[name] || 
      (globalThis as any).process?.env?.[name] || 
      (window as any).process?.env?.[name] || 
      ''
    );
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY') || getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true },
      global: { headers: { 'x-application-name': 'estrelas-conhecimento' } }
    }) 
  : null;

export const saveToCloud = async (data: { stats: any, prizes: any, worksheets: any }): Promise<boolean> => {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('user_data')
      .upsert({ 
        family_id: 'helena_family',
        stats: data.stats, 
        prizes: data.prizes, 
        worksheets: data.worksheets,
        updated_at: new Date().toISOString()
      }, { onConflict: 'family_id' });

    if (error) {
      console.warn("Supabase Upsert Error:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Erro fatal ao gravar na nuvem:", err);
    return false;
  }
};

export const loadFromCloud = async () => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('family_id', 'helena_family')
      .maybeSingle();

    if (error) {
      console.warn("Supabase Fetch Error:", error.message);
      throw error;
    }
    return data;
  } catch (err) {
    console.error("Erro fatal ao carregar da nuvem:", err);
    return null;
  }
};
