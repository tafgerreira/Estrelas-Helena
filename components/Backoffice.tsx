import React, { useState, useEffect } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { Plus, Trash2, Image as ImageIcon, ArrowLeft, Settings, Gift, BookOpen, Save, History as HistoryIcon, Euro, Loader2, Upload, BarChart3, Clock, Target, CalendarDays, Zap, Database, AlertCircle, Layers } from 'lucide-react';

interface BackofficeProps {
  prizes: Prize[];
  worksheets: Worksheet[];
  wonHistory: WonPrize[];
  subjectStats: Record<Subject, SubjectMetrics>;
  doubleCreditDays: number[];
  onUpdateDoubleCreditDays: (days: number[]) => void;
  onUpdatePrizes: (prizes: Prize[]) => void;
  onUpdateWorksheets: (worksheets: Worksheet[]) => void;
  onClose: () => void;
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  prizes = [], 
  worksheets = [], 
  wonHistory = [], 
  subjectStats, 
  doubleCreditDays = [],
  onUpdateDoubleCreditDays,
  onUpdatePrizes, 
  onUpdateWorksheets, 
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'prizes' | 'worksheets' | 'history' | 'performance' | 'config'>('prizes');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [storageStatus, setStorageStatus] = useState(getStorageUsage());
  
  const [newPrize, setNewPrize] = useState<{name: string, cost: number, image: string}>({ name: '', cost: 0, image: '' });
  const [newWorksheet, setNewWorksheet] = useState<{subject: Subject, images: string[], namePrefix: string}>({
    subject: Subject.PORTUGUESE,
    images: [],
    namePrefix: ''
  });

  useEffect(() => {
    setStorageStatus(getStorageUsage());
  }, [prizes, worksheets]);

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

  const handleDeleteWorksheet = (id: string) => {
    onUpdateWorksheets(worksheets.filter(w => w.id !== id));
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
      console.error("Erro ao processar imagens:", err);
    } finally {
      setIsProcessingBatch(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button onClick={onClose} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800 mb-2">
            <ArrowLeft /> Voltar ao Dashboard
          </button>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-500" /> Painel de Controle
          </h1>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <Database className={`w-6 h-6 ${storageStatus.percentage > 85 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`} />
          <div className="w-32">
            <div className="flex justify-between text-[10px] font-black uppercase mb-1">
              <span>Memória</span>
              <span>{storageStatus.percentage}%</span>
            </div>
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full transition-all ${storageStatus.percentage > 85 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${storageStatus.percentage}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <button onClick={() => setActiveTab('prizes')} className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'prizes' ? 'bg-purple-500 text-white shadow-lg' : 'bg-white text-gray-500'}`}><Gift /> Prémios</button>
        <button onClick={() => setActiveTab('worksheets')} className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'worksheets' ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-500'}`}><BookOpen /> Fichas</button>
        <button onClick={() => setActiveTab('performance')} className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'performance' ? 'bg-green-500 text-white shadow-lg' : 'bg-white text-gray-500'}`}><BarChart3 /> Desempenho</button>
        <button onClick={() => setActiveTab('config')} className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'config' ? 'bg-orange-500 text-white shadow-lg' : 'bg-white text-gray-500'}`}><CalendarDays /> Regras</button>
        <button onClick={() => setActiveTab('history')} className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'history' ? 'bg-yellow-500 text-white shadow-lg' : 'bg-white text-gray-500'}`}><HistoryIcon /> Histórico</button>
      </div>

      {activeTab === 'worksheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Importar Nova Ficha</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome da Ficha" value={newWorksheet.namePrefix} onChange={e => setNewWorksheet({...newWorksheet, namePrefix: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              <select value={newWorksheet.subject} onChange={e => setNewWorksheet({...newWorksheet, subject: e.target.value as Subject})} className="w-full p-3 border-2 rounded-xl">
                {Object.values(Subject).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="p-4 border-2 border-dashed rounded-xl text-center bg-gray-50">
                <input type="file" multiple accept="image/*" onChange={handleMultipleImagesUpload} className="hidden" id="multi-upload" />
                <label htmlFor="multi-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="text-blue-500" />
                  <span className="text-sm font-bold text-gray-500">Selecionar Páginas ({newWorksheet.images.length})</span>
                </label>
              </div>
              <button onClick={handleAddWorksheet} disabled={isProcessingBatch || newWorksheet.images.length === 0} className="w-full bg-blue-500 text-white py-3 rounded-xl font-black flex justify-center">
                {isProcessingBatch ? <Loader2 className="animate-spin" /> : 'Guardar Ficha Completa'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {worksheets.map(w => (
              <div key={w.id} className="bg-white p-3 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="relative w-12 h-12 flex-shrink-0">
                    <img src={w.images[0]} className="w-full h-full rounded-lg object-cover border" />
                    {w.images.length > 1 && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                        {w.images.length}
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-sm truncate">{w.name}</p>
                    <p className="text-[10px] text-gray-400">{w.subject} • {w.images.length} página(s)</p>
                  </div>
                </div>
                <button onClick={() => handleDeleteWorksheet(w.id)} className="p-2 text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prizes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Novo Prémio</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={newPrize.name} onChange={e => setNewPrize({...newPrize, name: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 mt-1 outline-none" />
              <input type="number" step="0.01" value={newPrize.cost} onChange={e => setNewPrize({...newPrize, cost: Number(e.target.value) || 0})} className="w-full p-3 rounded-xl border-2 border-gray-100" />
              <input type="file" accept="image/*" onChange={e => {
                const f = e.target.files?.[0];
                if(f) {
                  const r = new FileReader();
                  r.onload = async () => setNewPrize({...newPrize, image: await resizeImage(r.result as string, 400, 400)});
                  r.readAsDataURL(f);
                }
              }} className="text-xs" />
              <button onClick={handleAddPrize} className="w-full bg-purple-500 text-white py-3 rounded-xl font-bold">Adicionar</button>
            </div>
          </div>
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prizes.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover" />
                  <div><h3 className="font-bold">{p.name}</h3><p className="text-purple-600 font-black">{p.cost.toFixed(2)}€</p></div>
                </div>
                <button onClick={() => onUpdatePrizes(prizes.filter(pr => pr.id !== p.id))} className="text-gray-300 hover:text-red-500"><Trash2 /></button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Backoffice;