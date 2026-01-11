import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name: string): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (e) {}
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.log("✅ Supabase configurado com sucesso. A tentar ligar...");
} else {
  console.warn("⚠️ Supabase NÃO configurado. A app funcionará apenas em modo local (LocalStorage).");
  console.info("Certifica-te que definiste VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no Vercel.");
}

export const saveToCloud = async (data: { stats: any, prizes: any, worksheets: any }) => {
  if (!supabase) return;
  try {
    const { error } = await supabase
      .from('user_data')
      .update({ 
        stats: data.stats, 
        prizes: data.prizes, 
        worksheets: data.worksheets,
        updated_at: new Date().toISOString()
      })
      .eq('family_id', 'helena_family');

    if (error) throw error;
  } catch (err) {
    console.error("❌ Erro ao guardar na cloud:", err);
    throw err;
  }
};

export const loadFromCloud = async () => {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('*')
      .eq('family_id', 'helena_family')
      .single();

    if (error) throw error;
    console.log("☁️ Dados carregados da Cloud com sucesso!");
    return data;
  } catch (err) {
    console.error("❌ Erro ao carregar da cloud:", err);
    return null;
  }
};