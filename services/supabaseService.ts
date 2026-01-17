
import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string): string => {
  try {
    return process.env[name] || (import.meta as any).env?.[name] || '';
  } catch {
    return (import.meta as any).env?.[name] || '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
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

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao gravar na nuvem:", err);
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

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("Erro ao carregar da nuvem:", err);
    return null;
  }
};
