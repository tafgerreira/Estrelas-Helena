import { createClient } from '@supabase/supabase-js';

// No Vite, as variáveis definidas em 'define' ficam disponíveis em process.env durante o build
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'));

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.log("✅ Supabase pronto para ligar à Cloud.");
} else {
  console.warn("⚠️ Variáveis do Supabase não detetadas ou inválidas.");
}

export const saveToCloud = async (data: { stats: any, prizes: any, worksheets: any }) => {
  if (!supabase) return;
  try {
    // Usamos upsert em vez de update para criar o registo se ele não existir
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
      .maybeSingle(); // maybeSingle não dá erro se não encontrar nada

    if (error) throw error;
    return data;
  } catch (err) {
    console.error("❌ Erro ao carregar da cloud:", err);
    return null;
  }
};