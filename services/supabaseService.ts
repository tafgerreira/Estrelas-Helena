import { createClient } from '@supabase/supabase-js';

// Função auxiliar para obter variáveis de ambiente de forma segura em diferentes ambientes (Vite, Vercel, etc.)
const getEnvVar = (name: string): string => {
  try {
    // Tenta via import.meta.env (Vite)
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
  } catch (e) {}

  try {
    // Tenta via process.env (Vite define ou Node)
    if (typeof process !== 'undefined' && process.env && process.env[name]) {
      return process.env[name];
    }
  } catch (e) {}

  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

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

    if (error) console.error("Erro ao guardar na cloud:", error);
  } catch (err) {
    console.error("Erro na comunicação com Supabase:", err);
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

    if (error) {
      console.error("Erro ao carregar da cloud:", error);
      return null;
    }
    return data;
  } catch (err) {
    console.error("Erro ao carregar dados do Supabase:", err);
    return null;
  }
};