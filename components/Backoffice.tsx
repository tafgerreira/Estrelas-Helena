import React, { useState, useEffect, useRef } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { isSupabaseConfigured } from '../services/supabaseService';
import { 
  Plus, Trash2, ArrowLeft, Settings, Gift, BookOpen, Save, 
  History as HistoryIcon, Euro, Loader2, Upload, BarChart3, 
  CalendarDays, Zap, Database, CheckCircle2, Cloud, FileText, FileUp, 
  ShieldCheck, ShieldAlert, TrendingUp, Clock, Target, Copy, Download, X, Info, Wallet
} from 'lucide-react';

interface BackofficeProps {
  prizes: Prize[];
  worksheets: Worksheet[];
  wonHistory: WonPrize[];
  subjectStats: Record<Subject, SubjectMetrics>;
  doubleCreditDays: number[];
  credits: number;
  cloudStatus: string;
  onUpdateDoubleCreditDays: (days: number[]) => void;
  onUpdateCredits: (credits: number) => void;
  onUpdatePrizes: (prizes: Prize[]) => void;
  onUpdateWorksheets: (worksheets: Worksheet[]) => void;
  onImportData: (data: string) => void;
  onClose: () => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  prizes = [], 
  worksheets = [], 
  wonHistory = [], 
  subjectStats, 
  doubleCreditDays = [],
  credits,
  cloudStatus,
  onUpdateDoubleCreditDays,
  onUpdateCredits,
  onUpdatePrizes, 
  onUpdateWorksheets, 
  onImportData,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'prizes' | 'worksheets' | 'performance' | 'config' | 'history' | 'sync'>('prizes');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [storageStatus, setStorageStatus] = useState(getStorageUsage());
  const [syncCode, setSyncCode] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // FIX: Added missing daysOfWeek definition
  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  const [newPrize, setNewPrize] = useState<{name: string, cost: number, image: string}>({ name: '', cost: 0, image: '' });
  const [newWorksheet, setNewWorksheet] = useState<{subject: Subject, images: string[], namePrefix: string}>({
    subject: Subject.PORTUGUESE,
    images: [],
    namePrefix: ''
  });

  const [editedCredits, setEditedCredits] = useState(credits);

  useEffect(() => {
    setStorageStatus(getStorageUsage());
  }, [prizes, worksheets]);

  useEffect(() => {
    setEditedCredits(credits);
  }, [credits]);

  const toggleDoubleCreditDay = (dayIndex: number) => {
    const newDays = doubleCreditDays.includes(dayIndex)
      ? doubleCreditDays.filter(d => d !== dayIndex)
      : [...doubleCreditDays, dayIndex];
    onUpdateDoubleCreditDays(newDays);
  };

  const handleExportFile = () => {
    const data = { prizes, worksheets, stats: { credits, wonHistory, subjectStats, doubleCreditDays } };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const blob = new Blob([encoded], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `estrelas_helena_backup_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        onImportData(content);
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch (err) {
        setImportStatus('error');
        alert("Erro ao importar ficheiro.");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = () => {
    try {
      onImportData(syncCode);
      setImportStatus('success');
      setSyncCode('');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch (e) {
      setImportStatus('error');
    }
  };

  const handleAddPrize = () => {
    if (!newPrize.name || !newPrize.image) return;
    const prize: Prize = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPrize.name,
      cost: Number(newPrize.cost) || 0,
      image: newPrize.image,
      unlocked: false
    };
    onUpdatePrizes([...prizes, prize]);
    setNewPrize({ name: '', cost: 0, image: '' });
  };

  const handleAddWorksheet = async () => {
    if (newWorksheet.images.length === 0) return;
    setIsProcessingBatch(true);
    const worksheet: Worksheet = {
      id: Math.random().toString(36).substr(2, 9),
      subject: newWorksheet.subject,
      images: newWorksheet.images,
      name: newWorksheet.namePrefix || `Ficha de ${newWorksheet.subject} (${new Date().toLocaleDateString()})`,
      date: new Date().toLocaleDateString()
    };
    onUpdateWorksheets([...worksheets, worksheet]);
    setNewWorksheet({ ...newWorksheet, images: [], namePrefix: '' });
    setIsProcessingBatch(false);
  };

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setIsProcessingBatch(true);
    const base64Images: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        const resized = await resizeImage(base64, 800, 800);
        base64Images.push(resized);
      }
      setNewWorksheet(prev => ({ ...prev, images: [...prev.images, ...base64Images] }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button onClick={onClose} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800 mb-2">
            <ArrowLeft size={20} /> Voltar ao Início
          </button>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-500" /> Painel de Controle
          </h1>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black text-gray-400 uppercase">Memória do Aparelho</span>
              <Database size={14} className={storageStatus.percentage > 90 ? 'text-orange-500' : 'text-blue-500'} />
            </div>
            <div className="w-40 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-1000 ${storageStatus.percentage > 90 ? 'bg-orange-500' : 'bg-blue-500'}`} 
                style={{ width: `${storageStatus.percentage}%` }}
              ></div>
            </div>
            <span className="text-[9px] font-bold text-gray-400 mt-1">{storageStatus.usedMB} MB / 5.00 MB</span>
          </div>
          <div className="w-[1px] h-8 bg-gray-100"></div>
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 mb-1">
              <Cloud size={14} className={isSupabaseConfigured ? 'text-green-500' : 'text-gray-300'} />
              <span className="text-[10px] font-black text-gray-400 uppercase">Espaço Cloud</span>
            </div>
            <div className={`px-2 py-0.5 rounded text-[10px] font-black ${isSupabaseConfigured ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              {isSupabaseConfigured ? 'ILIMITADO' : 'INATIVO'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'prizes', label: 'Prémios', icon: Gift, color: 'purple' },
          { id: 'worksheets', label: 'Fichas', icon: BookOpen, color: 'blue' },
          { id: 'performance', label: 'Desempenho', icon: BarChart3, color: 'green' },
          { id: 'config', label: 'Regras', icon: CalendarDays, color: 'orange' },
          { id: 'history', label: 'Histórico', icon: HistoryIcon, color: 'yellow' },
          { id: 'sync', label: 'Sincronização', icon: Cloud, color: 'indigo' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id 
                ? `bg-${tab.color}-500 text-white shadow-lg scale-105` 
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'prizes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Novo Prémio</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={newPrize.name} onChange={e => setNewPrize({...newPrize, name: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 outline-none focus:border-purple-300" />
              <div className="relative">
                <input type="number" step="0.5" value={newPrize.cost} onChange={e => setNewPrize({...newPrize, cost: Number(e.target.value) || 0})} className="w-full p-3 rounded-xl border-2 border-gray-100 pr-10" />
                <Euro className="absolute right-3 top-3.5 text-gray-300 w-5 h-5" />
              </div>
              <input type="file" accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if(f) {
                  const r = new FileReader();
                  r.onload = async () => setNewPrize({...newPrize, image: await resizeImage(r.result as string, 400, 400)});
                  r.readAsDataURL(f);
                }
              }} className="text-xs bg-gray-50 p-2 rounded-lg w-full" />
              <button onClick={handleAddPrize} className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors">Adicionar Prémio</button>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prizes.length === 0 && <p className="col-span-full text-center py-20 text-gray-400 font-bold italic">Nenhum prémio configurado.</p>}
            {prizes.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover border" alt={p.name} />
                  <div><h3 className="font-bold text-gray-800">{p.name}</h3><p className="text-purple-600 font-black">{p.cost.toFixed(2)}€</p></div>
                </div>
                <button onClick={() => onUpdatePrizes(prizes.filter(pr => pr.id !== p.id))} className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'worksheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Importar Ficha</h2>
            {storageStatus.percentage > 90 && isSupabaseConfigured && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl flex items-start gap-2 border border-blue-100">
                <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-blue-700 font-bold">A memória do aparelho está quase cheia, mas as novas fichas continuarão a ser guardadas na Cloud com segurança.</p>
              </div>
            )}
            <div className="space-y-4">
              <input type="text" placeholder="Nome da Ficha" value={newWorksheet.namePrefix} onChange={e => setNewWorksheet({...newWorksheet, namePrefix: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              <select value={newWorksheet.subject} onChange={e => setNewWorksheet({...newWorksheet, subject: e.target.value as Subject})} className="w-full p-3 border-2 rounded-xl bg-white">
                {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="p-6 border-2 border-dashed rounded-xl text-center bg-gray-50">
                <input type="file" multiple accept="image/*" onChange={handleMultipleImagesUpload} className="hidden" id="multi-upload-back" />
                <label htmlFor="multi-upload-back" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-500">Selecionar Páginas ({newWorksheet.images.length})</span>
                </label>
              </div>
              <button onClick={handleAddWorksheet} disabled={isProcessingBatch || newWorksheet.images.length === 0} className="w-full bg-blue-500 text-white py-4 rounded-xl font-black flex justify-center shadow-lg hover:bg-blue-600 active:scale-95 transition-all">
                {isProcessingBatch ? <Loader2 className="animate-spin" /> : 'Guardar Ficha'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-3">
            {worksheets.length === 0 && <p className="text-center py-20 text-gray-400 font-bold italic">Nenhuma ficha guardada ainda.</p>}
            {worksheets.map(w => (
              <div key={w.id} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 shrink-0">
                    <img src={w.images[0]} className="w-full h-full rounded-xl object-cover border" alt={w.name} />
                    {w.images.length > 1 && (
                      <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                        {w.images.length}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">{w.name}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{w.subject} • {w.date}</p>
                  </div>
                </div>
                <button onClick={() => onUpdateWorksheets(worksheets.filter(ws => ws.id !== w.id))} className="p-2 text-gray-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2">
          {Object.values(Subject).map(s => {
            const stats = subjectStats[s] || { totalQuestions: 0, correctAnswers: 0, totalMinutes: 0 };
            const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
            const config = SUBJECT_CONFIG[s];
            return (
              <div key={s} className="bg-white p-6 rounded-[35px] border-4 border-gray-50 shadow-sm flex flex-col items-center text-center">
                <div className={`p-4 rounded-2xl mb-4 bg-gradient-to-br ${config.gradient} shadow-lg text-white`}>
                  {config.icon}
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-6">{s}</h3>
                <div className="space-y-3 w-full">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-2xl">
                    <Target size={18} className="text-blue-500" />
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-blue-400">Precisão</p>
                      <p className="text-lg font-black text-blue-700">{accuracy}%</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded-2xl">
                    <Clock size={18} className="text-green-500" />
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase text-green-400">Tempo</p>
                      <p className="text-lg font-black text-green-700">{stats.totalMinutes}m</p>
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-2xl">
                    <p className="text-[10px] font-black uppercase text-purple-400 mb-1">Questões Respondidas</p>
                    <p className="text-lg font-black text-purple-700">{stats.correctAnswers} / {stats.totalQuestions}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-2">
          {/* Edição de Saldo */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-yellow-200">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-yellow-100 rounded-3xl">
                <Wallet className="text-yellow-600 w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Saldo da Helena (Mealheiro)</h2>
                <p className="text-gray-500 font-medium">Altera manualmente o valor total disponível para a Helena gastar na loja.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <input 
                  type="number" 
                  step="0.01" 
                  value={editedCredits} 
                  onChange={(e) => setEditedCredits(Number(e.target.value))}
                  className="w-full p-5 rounded-[30px] border-4 border-gray-100 text-3xl font-black text-yellow-700 focus:border-yellow-300 outline-none pr-12"
                />
                <Euro className="absolute right-6 top-6 text-yellow-300 w-8 h-8" />
              </div>
              <button 
                onClick={() => {
                  onUpdateCredits(editedCredits);
                  alert("Mealheiro atualizado com sucesso!");
                }}
                className="bg-yellow-400 text-white p-5 rounded-[30px] shadow-lg hover:bg-yellow-500 active:scale-95 transition-all flex items-center gap-2 font-black uppercase"
              >
                <Save /> Guardar
              </button>
            </div>
          </div>

          {/* Dias a Dobrar */}
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-orange-100">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-orange-100 rounded-3xl">
                <Zap className="text-orange-500 w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-800">Créditos a Dobrar 2x</h2>
                <p className="text-gray-500 font-medium">Dias da semana em que a Helena ganha o dobro das moedas.</p>
              </div>
            </div>
            <div className="space-y-3">
              {daysOfWeek.map((day, index) => {
                const isActive = doubleCreditDays.includes(index);
                return (
                  <button
                    key={day}
                    onClick={() => toggleDoubleCreditDay(index)}
                    className={`w-full p-5 rounded-3xl border-4 flex items-center justify-between transition-all ${
                      isActive ? 'border-orange-400 bg-orange-50' : 'border-gray-50 bg-gray-50/50 grayscale'
                    }`}
                  >
                    <span className={`text-xl font-black ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>{day}</span>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-orange-400 text-white shadow-lg' : 'bg-gray-200 text-gray-400'}`}>
                      {isActive ? <CheckCircle2 /> : <Plus />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-yellow-500" /> Conquistas da Helena
          </h2>
          {wonHistory.length === 0 && (
            <div className="bg-white p-20 rounded-[40px] text-center border-4 border-dashed border-gray-100">
              <Gift className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-xl">Nenhum prémio adquirido até agora.</p>
            </div>
          )}
          {wonHistory.map((item, idx) => (
            <div key={idx} className="bg-white p-5 rounded-[30px] shadow-sm border-2 border-gray-50 flex items-center gap-6 group">
              <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border group-hover:scale-110 transition-transform" alt={item.name} />
              <div className="flex-1">
                <h3 className="text-xl font-black text-gray-800">{item.name}</h3>
                <div className="flex gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                    <CalendarDays size={14} /> {item.dateWon}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-400">
                    <Euro size={14} /> {item.cost.toFixed(2)}€ investidos
                  </span>
                </div>
              </div>
              <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest">Conquistado</span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'sync' && (
        <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-indigo-100">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <Cloud className="text-indigo-500" /> Estado da Ligação Cloud (Supabase)
            </h2>
            <div className={`p-6 rounded-3xl border-4 flex flex-col md:flex-row items-center gap-6 ${isSupabaseConfigured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className={`p-4 rounded-full ${isSupabaseConfigured ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {isSupabaseConfigured ? <ShieldCheck size={40} /> : <ShieldAlert size={40} />}
              </div>
              <div className="flex-1 text-center md:text-left">
                <p className="font-black text-xl">{isSupabaseConfigured ? 'Cloud Configurada com Sucesso!' : 'Váriáveis Supabase não detetadas'}</p>
                <p className="text-sm font-bold opacity-70 leading-relaxed">
                  {isSupabaseConfigured 
                    ? `A app está a sincronizar os dados da Helena automaticamente com a base de dados (${cloudStatus}). Não tens limites de armazenamento na Cloud.` 
                    : 'A app não encontrou as chaves VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY. O armazenamento local de 5MB é o único disponível.'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-indigo-100">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <FileUp className="text-indigo-500" /> Cópia de Segurança e Transferência Manual
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-indigo-50 p-6 rounded-3xl space-y-4">
                <h3 className="font-black text-indigo-700 flex items-center gap-2"><Download size={20} /> Exportar</h3>
                <p className="text-xs text-indigo-600 font-bold">Cria uma cópia de segurança para passar os dados para outro telemóvel ou tablet.</p>
                <div className="grid grid-cols-1 gap-3">
                  <button onClick={handleExportFile} className="w-full bg-white text-indigo-600 py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-sm border-2 border-indigo-200 hover:bg-white/80 transition-all">
                    <FileText size={20} /> Descarregar Ficheiro .txt
                  </button>
                  <button onClick={() => {
                    const data = { prizes, worksheets, stats: { credits, wonHistory, subjectStats, doubleCreditDays } };
                    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
                    navigator.clipboard.writeText(encoded);
                    alert("Código copiado!");
                  }} className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-indigo-600 transition-all">
                    <Copy size={20} /> Copiar Código de Sincro
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-3xl space-y-4">
                <h3 className="font-black text-gray-700 flex items-center gap-2"><Upload size={20} /> Importar</h3>
                <div className="space-y-3">
                  <input type="file" accept=".txt" ref={fileInputRef} onChange={handleImportFile} className="hidden" id="file-import-parent" />
                  <label htmlFor="file-import-parent" className="w-full bg-white border-2 border-dashed border-gray-300 py-4 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-all text-gray-500">
                    <FileUp size={20} /> Selecionar Ficheiro .txt
                  </label>
                  <div className="relative">
                    <textarea 
                      value={syncCode} 
                      onChange={e => setSyncCode(e.target.value)}
                      placeholder="Ou cola o código aqui..."
                      className="w-full p-4 border-2 border-gray-200 rounded-2xl h-24 text-[10px] font-mono focus:border-indigo-300 outline-none resize-none"
                    />
                    {syncCode && <button onClick={() => setSyncCode('')} className="absolute top-2 right-2 p-1 text-gray-300 hover:text-red-500"><X size={16}/></button>}
                  </div>
                  <button 
                    disabled={!syncCode} 
                    onClick={handleImport}
                    className="w-full bg-green-500 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg hover:bg-green-600 transition-all"
                  >
                    {importStatus === 'success' ? <CheckCircle2 /> : <Save />}
                    {importStatus === 'success' ? 'Importado com Sucesso!' : 'Importar Dados Agora'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;