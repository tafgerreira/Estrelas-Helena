import React, { useState, useEffect, useRef } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { isSupabaseConfigured } from '../services/supabaseService';
// Fix: Added missing AlertCircle import from lucide-react
import { 
  Plus, Trash2, ArrowLeft, Settings, Gift, BookOpen, Save, 
  History as HistoryIcon, Euro, Loader2, Upload, BarChart3, 
  CalendarDays, Zap, Database, CheckCircle2, Cloud, FileText, FileUp, 
  ShieldCheck, ShieldAlert, TrendingUp, Clock, Target, Copy, Download, X, Wallet,
  Star, RefreshCw, HardDrive, AlertCircle
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
  subjectStats = {} as any, 
  doubleCreditDays = [],
  credits = 0,
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

  const handleDeleteWorksheet = (id: string) => {
    if (window.confirm("Queres mesmo eliminar esta ficha para sempre?")) {
      onUpdateWorksheets(worksheets.filter(ws => ws.id !== id));
    }
  };

  const handleExportFile = () => {
    const data = { prizes, worksheets, stats: { credits, wonHistory, subjectStats, doubleCreditDays } };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    const blob = new Blob([encoded], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_helena_${new Date().toISOString().split('T')[0]}.txt`;
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

  const toggleDoubleCreditDay = (dayIndex: number) => {
    const newDays = doubleCreditDays.includes(dayIndex)
      ? doubleCreditDays.filter(d => d !== dayIndex)
      : [...doubleCreditDays, dayIndex];
    onUpdateDoubleCreditDays(newDays);
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
        
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <HardDrive className={storageStatus.isCritical ? "text-red-500" : "text-blue-500"} size={20} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Aparelho (Local)</p>
              <div className="w-24 h-2 bg-gray-100 rounded-full mt-1.5">
                <div className={`h-full rounded-full transition-all duration-500 ${storageStatus.isCritical ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${storageStatus.percentage}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
            <Cloud className={cloudStatus === 'online' ? "text-green-500" : "text-gray-300"} size={20} />
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Nuvem (Sync)</p>
              <div className="flex items-center gap-1.5 mt-1.5">
                 <div className={`w-2 h-2 rounded-full ${cloudStatus === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : cloudStatus === 'syncing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                 <span className="text-[10px] font-bold text-gray-600 uppercase tracking-tighter">
                   {cloudStatus === 'online' ? 'Seguro' : cloudStatus === 'syncing' ? 'A Gravar...' : 'Offline'}
                 </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white/50 p-2 rounded-[30px] border border-gray-100">
        {[
          { id: 'prizes', label: 'Baú', icon: Gift, color: 'purple' },
          { id: 'worksheets', label: 'Fichas', icon: BookOpen, color: 'blue' },
          { id: 'performance', label: 'Desempenho', icon: BarChart3, color: 'green' },
          { id: 'config', label: 'Regras', icon: CalendarDays, color: 'orange' },
          { id: 'history', label: 'Conquistas', icon: HistoryIcon, color: 'yellow' },
          { id: 'sync', label: 'Nuvem', icon: Cloud, color: 'indigo' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id 
                ? `bg-${tab.color}-500 text-white shadow-lg scale-105` 
                : 'text-gray-500 hover:bg-white'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'prizes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
            <div className="bg-white p-6 rounded-[35px] shadow-sm border-2 border-purple-100 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Novo Prémio</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Nome do Prémio" value={newPrize.name} onChange={e => setNewPrize({...newPrize, name: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100" />
                <div className="relative">
                  <input type="number" step="0.5" value={newPrize.cost} onChange={e => setNewPrize({...newPrize, cost: Number(e.target.value) || 0})} className="w-full p-3 rounded-xl border-2 border-gray-100" />
                  <Euro className="absolute right-3 top-3 text-gray-300" size={20} />
                </div>
                <input type="file" accept="image/*" onChange={e => {
                  const f = e.target.files?.[0];
                  if(f) {
                    const r = new FileReader();
                    r.onload = async () => setNewPrize({...newPrize, image: await resizeImage(r.result as string, 400, 400)});
                    r.readAsDataURL(f);
                  }
                }} className="text-xs bg-gray-50 p-2 rounded-lg w-full" />
                <button onClick={handleAddPrize} className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold hover:bg-purple-600 transition-colors">Adicionar ao Baú</button>
              </div>
            </div>
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {prizes.length === 0 && <p className="col-span-full text-center py-20 text-gray-400 font-bold italic">O baú está vazio.</p>}
              {prizes.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm border-2 border-gray-50 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <img src={p.image} className="w-16 h-16 rounded-2xl object-cover border" alt={p.name} />
                    <div><h3 className="font-bold text-gray-800">{p.name}</h3><p className="text-purple-600 font-black">{p.cost.toFixed(2)}€</p></div>
                  </div>
                  <button onClick={() => onUpdatePrizes(prizes.filter(pr => pr.id !== p.id))} className="p-3 text-red-200 hover:text-red-500 transition-all"><Trash2 /></button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'worksheets' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
            <div className="bg-white p-6 rounded-[35px] shadow-sm border-2 border-blue-100 h-fit">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Importar Ficha</h2>
              {storageStatus.isCritical && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-[10px] text-red-600 font-bold flex items-center gap-2 animate-pulse">
                  <AlertCircle size={14} /> Memória local cheia! Apaga fichas antigas.
                </div>
              )}
              <div className="space-y-4">
                <input type="text" placeholder="Nome da Ficha" value={newWorksheet.namePrefix} onChange={e => setNewWorksheet({...newWorksheet, namePrefix: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
                <select value={newWorksheet.subject} onChange={e => setNewWorksheet({...newWorksheet, subject: e.target.value as Subject})} className="w-full p-3 border-2 rounded-xl bg-white">
                  {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <div className="p-6 border-2 border-dashed rounded-xl text-center bg-gray-50">
                  <input type="file" multiple accept="image/*" onChange={handleMultipleImagesUpload} className="hidden" id="multi-upload-back" />
                  <label htmlFor="multi-upload-back" className="cursor-pointer flex flex-col items-center gap-2">
                    <Upload className="text-blue-500" />
                    <span className="text-sm font-bold text-gray-500">Adicionar Fotos ({newWorksheet.images.length})</span>
                  </label>
                </div>
                <button onClick={handleAddWorksheet} disabled={isProcessingBatch || newWorksheet.images.length === 0} className="w-full bg-blue-500 text-white py-4 rounded-xl font-black shadow-lg hover:bg-blue-600 active:scale-95 transition-all">
                  {isProcessingBatch ? <Loader2 className="animate-spin mx-auto" /> : 'Guardar Desafio'}
                </button>
              </div>
            </div>
            <div className="lg:col-span-2 space-y-3">
              <h3 className="font-bold text-gray-700 uppercase text-xs tracking-widest px-2 mb-2">Fichas Guardadas ({worksheets.length})</h3>
              {worksheets.length === 0 && <p className="text-center py-20 text-gray-400 font-bold italic">Nenhuma ficha guardada ainda.</p>}
              {worksheets.map(w => (
                <div key={w.id} className="bg-white p-5 rounded-[30px] shadow-sm border-2 border-gray-50 flex items-center justify-between group hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 shrink-0">
                      <img src={w.images[0]} className="w-full h-full rounded-2xl object-cover border" alt={w.name} />
                      {w.images.length > 1 && <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">{w.images.length}</span>}
                    </div>
                    <div>
                      <p className="font-black text-gray-800">{w.name}</p>
                      <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{w.subject}</span>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteWorksheet(w.id)} className="p-4 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all shadow-sm">
                    <Trash2 size={24} />
                  </button>
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
                  <div className={`p-4 rounded-2xl mb-4 bg-gradient-to-br ${config.gradient} text-white`}>{config.icon}</div>
                  <h3 className="text-xl font-black text-gray-800 mb-4">{s}</h3>
                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-2xl">
                      <Target size={18} className="text-blue-500" />
                      <span className="font-black text-blue-700">{accuracy}% de Acerto</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-2xl">
                      <Clock size={18} className="text-green-500" />
                      <span className="font-black text-green-700">{stats.totalMinutes}m estudados</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'config' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-2">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-yellow-200">
              <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-4">
                <Wallet className="text-yellow-500" /> Mealheiro da Helena
              </h2>
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <input type="number" step="0.01" value={editedCredits} onChange={(e) => setEditedCredits(Number(e.target.value))} className="w-full p-5 rounded-[30px] border-4 border-gray-100 text-3xl font-black text-yellow-700 focus:border-yellow-300 outline-none pr-12" />
                  <Euro className="absolute right-6 top-6 text-yellow-300 w-8 h-8" />
                </div>
                <button onClick={() => { onUpdateCredits(editedCredits); alert("Saldo atualizado!"); }} className="bg-yellow-400 text-white p-5 rounded-[30px] shadow-lg hover:bg-yellow-500 font-black">GUARDAR SALDO</button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-orange-100">
              <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-4">
                <Zap className="text-orange-500" /> Dias com Créditos a Dobrar (2x)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {daysOfWeek.map((day, idx) => {
                  const isActive = doubleCreditDays.includes(idx);
                  return (
                    <button
                      key={day}
                      onClick={() => toggleDoubleCreditDay(idx)}
                      className={`p-4 rounded-2xl font-bold border-4 transition-all ${isActive ? 'bg-orange-100 border-orange-400 text-orange-600' : 'bg-gray-50 border-gray-100 text-gray-400'}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="max-w-4xl mx-auto space-y-4 animate-in slide-in-from-bottom-2">
            <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
              <Star className="text-yellow-500" /> Prémios que a Helena já abriu
            </h2>
            {wonHistory.length === 0 && (
              <div className="bg-white p-20 rounded-[40px] text-center border-4 border-dashed border-gray-100">
                <Gift className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold text-xl">A Helena ainda não abriu prémios.</p>
              </div>
            )}
            {wonHistory.map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-[30px] shadow-sm border-2 border-gray-50 flex items-center gap-6 group">
                <img src={item.image} className="w-20 h-20 rounded-2xl object-cover border" alt={item.name} />
                <div className="flex-1">
                  <h3 className="text-xl font-black text-gray-800">{item.name}</h3>
                  <div className="flex gap-4 mt-1 text-xs font-bold text-gray-400">
                    <span className="flex items-center gap-1"><CalendarDays size={14}/> {item.dateWon}</span>
                    <span className="flex items-center gap-1"><Euro size={14}/> {item.cost.toFixed(2)}€</span>
                  </div>
                </div>
                <span className="bg-green-100 text-green-600 px-4 py-2 rounded-full text-[10px] font-black uppercase">Conquistado</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-2">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-indigo-100">
              <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <Cloud className="text-indigo-500" /> Saúde dos Dados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-6 rounded-3xl border-4 flex flex-col items-center text-center gap-2 ${isSupabaseConfigured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <Cloud className={isSupabaseConfigured ? "text-green-500" : "text-red-500"} size={40} />
                  <p className="font-black text-lg">Nuvem: {isSupabaseConfigured ? 'Ativa' : 'Desligada'}</p>
                  <p className="text-[10px] font-bold opacity-70">Sincroniza automaticamente todos os dados para que nunca se percam.</p>
                </div>
                <div className={`p-6 rounded-3xl border-4 flex flex-col items-center text-center gap-2 ${storageStatus.isCritical ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                  <HardDrive className={storageStatus.isCritical ? "text-red-500" : "text-blue-500"} size={40} />
                  <p className="font-black text-lg">Local: {storageStatus.percentage}%</p>
                  <p className="text-[10px] font-bold opacity-70">
                    {storageStatus.isCritical ? 'Aparelho quase cheio! Apaga fichas para libertar espaço.' : 'Tens espaço suficiente no teu aparelho.'}
                  </p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-indigo-50 rounded-2xl border-2 border-indigo-100">
                 <p className="text-[10px] font-black text-indigo-700 leading-relaxed italic">
                   "Atenção: Se o espaço local terminar, a app continuará a guardar os dados na Nuvem. Podes apagar fichas antigas aqui no painel sem medo, pois estarão sempre seguras na conta Supabase."
                 </p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-indigo-100">
              <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
                <FileUp className="text-indigo-500" /> Backup Manual
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <button onClick={handleExportFile} className="w-full bg-indigo-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg">
                    <Download size={20} /> DESCARREGAR TUDO
                  </button>
                </div>
                <div className="space-y-4">
                  <input type="file" accept=".txt" ref={fileInputRef} onChange={handleImportFile} className="hidden" id="file-import-backoffice" />
                  <label htmlFor="file-import-backoffice" className="w-full bg-white border-4 border-dashed border-gray-200 py-4 rounded-2xl font-black flex items-center justify-center gap-2 cursor-pointer text-gray-400 hover:border-indigo-300">
                    <Upload size={20} /> RESTAURAR BACKUP
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Backoffice;