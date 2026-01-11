import { createClient } from '@supabase/supabase-js';

// No Vite, as variáveis definidas em 'define' no config ficam disponíveis em process.env
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl !== '');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.log("✅ Supabase configurado e pronto.");
} else {
  console.warn("⚠️ Supabase não configurado. Verifique as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.");
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
    return data;
  } catch (err) {
    console.error("❌ Erro ao carregar da cloud:", err);
    return null;
  }
};