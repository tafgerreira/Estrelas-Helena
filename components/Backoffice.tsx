import React, { useState, useEffect, useRef } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { isSupabaseConfigured } from '../services/supabaseService';
import { 
  Plus, Trash2, ArrowLeft, Settings, Gift, BookOpen, Save, 
  History as HistoryIcon, Euro, Loader2, Upload, BarChart3, 
  CalendarDays, Zap, Database, CheckCircle2, Cloud, FileText, FileUp, 
  ShieldCheck, ShieldAlert, TrendingUp, Clock, Target, Copy, Download, X, Wallet
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
    if (window.confirm("Queres mesmo eliminar esta ficha?")) {
      onUpdateWorksheets(worksheets.filter(ws => ws.id !== id));
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
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {[
          { id: 'prizes', label: 'Baú (Prémios)', icon: Gift, color: 'purple' },
          { id: 'worksheets', label: 'Fichas', icon: BookOpen, color: 'blue' },
          { id: 'performance', label: 'Desempenho', icon: BarChart3, color: 'green' },
          { id: 'config', label: 'Regras', icon: CalendarDays, color: 'orange' },
          { id: 'sync', label: 'Nuvem', icon: Cloud, color: 'indigo' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-5 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
              activeTab === tab.id 
                ? `bg-${tab.color}-500 text-white shadow-lg` 
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
            <h2 className="text-xl font-bold text-gray-800 mb-6">Novo Prémio para o Baú</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={newPrize.name} onChange={e => setNewPrize({...newPrize, name: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100" />
              <input type="number" step="0.5" value={newPrize.cost} onChange={e => setNewPrize({...newPrize, cost: Number(e.target.value) || 0})} className="w-full p-3 rounded-xl border-2 border-gray-100" />
              <input type="file" accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if(f) {
                  const r = new FileReader();
                  r.onload = async () => setNewPrize({...newPrize, image: await resizeImage(r.result as string, 400, 400)});
                  r.readAsDataURL(f);
                }
              }} className="text-xs bg-gray-50 p-2 rounded-lg w-full" />
              <button onClick={handleAddPrize} className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold">Adicionar ao Baú</button>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prizes.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover" alt={p.name} />
                  <div><h3 className="font-bold">{p.name}</h3><p className="text-purple-600 font-black">{p.cost.toFixed(2)}€</p></div>
                </div>
                <button onClick={() => onUpdatePrizes(prizes.filter(pr => pr.id !== p.id))} className="p-2 text-gray-300 hover:text-red-500"><Trash2 /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'worksheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Importar Ficha Manual</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={newWorksheet.namePrefix} onChange={e => setNewWorksheet({...newWorksheet, namePrefix: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              <select value={newWorksheet.subject} onChange={e => setNewWorksheet({...newWorksheet, subject: e.target.value as Subject})} className="w-full p-3 border-2 rounded-xl bg-white">
                {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="p-6 border-2 border-dashed rounded-xl text-center bg-gray-50">
                <input type="file" multiple accept="image/*" onChange={handleMultipleImagesUpload} className="hidden" id="multi-upload-back" />
                <label htmlFor="multi-upload-back" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-500">Selecionar Fotos ({newWorksheet.images.length})</span>
                </label>
              </div>
              <button onClick={handleAddWorksheet} disabled={isProcessingBatch || newWorksheet.images.length === 0} className="w-full bg-blue-500 text-white py-4 rounded-xl font-black">
                {isProcessingBatch ? <Loader2 className="animate-spin mx-auto" /> : 'Guardar Ficha'}
              </button>
            </div>
            <p className="mt-4 text-[10px] text-gray-400 font-bold italic">Nota: A categoria "Tudo" agrupa automaticamente todas as fichas.</p>
          </div>
          <div className="lg:col-span-2 space-y-3">
            <div className="flex justify-between items-center mb-2 px-2">
              <h3 className="font-bold text-gray-700">Fichas Importadas ({worksheets.length})</h3>
              <span className="text-[10px] font-black uppercase text-gray-400">Podes apagar fichas antigas aqui</span>
            </div>
            {worksheets.map(w => (
              <div key={w.id} className="bg-white p-4 rounded-3xl shadow-sm border-2 border-gray-50 flex items-center justify-between group hover:border-blue-100 transition-all">
                <div className="flex items-center gap-4">
                  <img src={w.images[0]} className="w-16 h-16 rounded-2xl object-cover border" alt={w.name} />
                  <div>
                    <p className="font-bold text-gray-800">{w.name}</p>
                    <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{w.subject}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDeleteWorksheet(w.id)} 
                  className="p-4 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-2xl transition-all shadow-sm"
                  title="Eliminar esta ficha"
                >
                  <Trash2 size={24} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(Subject).map(s => {
            const stats = subjectStats[s] || { totalQuestions: 0, correctAnswers: 0, totalMinutes: 0 };
            const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
            const config = SUBJECT_CONFIG[s];
            return (
              <div key={s} className="bg-white p-6 rounded-[35px] border-4 border-gray-50 shadow-sm flex flex-col items-center">
                <div className={`p-4 rounded-2xl mb-4 bg-gradient-to-br ${config.gradient} text-white`}>{config.icon}</div>
                <h3 className="text-xl font-black mb-4">{s}</h3>
                <div className="w-full space-y-2">
                  <div className="flex justify-between p-3 bg-blue-50 rounded-2xl">
                    <Target size={18} className="text-blue-500" /><span className="font-black">{accuracy}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Backoffice;