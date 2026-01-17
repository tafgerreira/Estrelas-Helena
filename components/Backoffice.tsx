
import React, { useState } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { validateWorksheetImage } from '../services/geminiService';
import { 
  Plus, Trash2, ArrowLeft, Settings, Gift, BookOpen, Save, 
  Euro, Loader2, Upload, BarChart3, 
  CalendarDays, Zap, FileText, 
  TrendingUp, Clock, Target, Download, X, Wallet,
  Star, RefreshCw, HardDrive, CheckCircle, XCircle, History
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

interface UploadedImage {
  base64: string;
  status: 'pending' | 'validating' | 'valid' | 'invalid';
  feedback?: string;
  topic?: string;
}

// Fixed type inference by ensuring subjectStats has a proper type in the destructuring and explicitly casting Object.entries
const Backoffice: React.FC<BackofficeProps> = ({ 
  prizes = [], 
  worksheets = [], 
  wonHistory = [], 
  subjectStats, 
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
  const [activeTab, setActiveTab] = useState<'prizes' | 'worksheets' | 'performance' | 'config' | 'history'>('worksheets');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [storageStatus, setStorageStatus] = useState(getStorageUsage());
  
  const [newPrize, setNewPrize] = useState({ name: '', cost: 0, image: '' });
  const [newWorksheet, setNewWorksheet] = useState({
    subject: Subject.PORTUGUESE,
    images: [] as UploadedImage[],
    namePrefix: ''
  });

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
    const validImages = newWorksheet.images.filter(img => img.status === 'valid').map(img => img.base64);
    if (validImages.length === 0) return;

    setIsProcessingBatch(true);
    const worksheet: Worksheet = {
      id: Math.random().toString(36).substr(2, 9),
      subject: newWorksheet.subject,
      images: validImages,
      name: newWorksheet.namePrefix || `Ficha de ${newWorksheet.subject}`,
      date: new Date().toLocaleDateString()
    };
    onUpdateWorksheets([...worksheets, worksheet]);
    setNewWorksheet({ ...newWorksheet, images: [], namePrefix: '' });
    setIsProcessingBatch(false);
  };

  const validateImageAtIndex = async (index: number, currentImages: UploadedImage[]) => {
    const img = currentImages[index];
    if (!img) return;

    setNewWorksheet(prev => {
      const copy = [...prev.images];
      if (copy[index]) copy[index].status = 'validating';
      return { ...prev, images: copy };
    });

    const result = await validateWorksheetImage(img.base64);

    setNewWorksheet(prev => {
      const copy = [...prev.images];
      if (copy[index]) {
        copy[index] = { 
          ...copy[index], 
          status: result.isValid ? 'valid' : 'invalid',
          feedback: result.feedback,
          topic: result.topic
        };
      }
      return { ...prev, images: copy };
    });
  };

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const startIndex = newWorksheet.images.length;
    const incomingImages: UploadedImage[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await new Promise<string>((res) => {
          const r = new FileReader();
          r.onloadend = () => res(r.result as string);
          r.readAsDataURL(file);
        });
        const resized = await resizeImage(base64, 1000, 1000);
        incomingImages.push({ base64: resized, status: 'pending' });
      } catch (err) {
        console.error("Erro ao processar imagem:", err);
      }
    }

    setNewWorksheet(prev => ({ ...prev, images: [...prev.images, ...incomingImages] }));
    const updatedImages = [...newWorksheet.images, ...incomingImages];
    for (let i = 0; i < incomingImages.length; i++) {
      await validateImageAtIndex(startIndex + i, updatedImages);
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button onClick={onClose} className="flex items-center gap-2 text-gray-500 font-bold hover:text-gray-800 mb-2">
            <ArrowLeft size={20} /> Voltar
          </button>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-500" /> Painel de Pais
          </h1>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-3">
          <HardDrive size={16} className="text-blue-500" />
          <span className="text-xs font-black text-blue-700 uppercase">Memória: {storageStatus.percentage}%</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white/50 p-2 rounded-[30px] border border-gray-100 overflow-x-auto">
        {[
          { id: 'worksheets', label: 'Fichas', icon: BookOpen, color: 'blue' },
          { id: 'prizes', label: 'Prémios', icon: Gift, color: 'purple' },
          { id: 'performance', label: 'Performance', icon: BarChart3, color: 'green' },
          { id: 'config', label: 'Definições', icon: CalendarDays, color: 'orange' },
          { id: 'history', label: 'Histórico', icon: History, color: 'gray' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === tab.id ? `bg-${tab.color}-500 text-white shadow-lg` : 'text-gray-500 hover:bg-white'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'worksheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-[35px] shadow-sm border-2 border-blue-100 h-fit space-y-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2"><Plus className="text-blue-500" /> Nova Ficha</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome da Ficha" value={newWorksheet.namePrefix} onChange={e => setNewWorksheet({...newWorksheet, namePrefix: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
              <select value={newWorksheet.subject} onChange={e => setNewWorksheet({...newWorksheet, subject: e.target.value as Subject})} className="w-full p-3 border-2 rounded-xl bg-white">
                {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <div className="p-6 border-2 border-dashed rounded-xl text-center bg-gray-50 hover:bg-blue-50 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleMultipleImagesUpload} className="hidden" id="ws-upload" disabled={isUploading} />
                <label htmlFor="ws-upload" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="text-blue-500 w-8 h-8" />
                  <span className="text-sm font-black text-gray-500">Upload Imagens</span>
                </label>
              </div>
              <button 
                onClick={handleAddWorksheet} 
                disabled={!newWorksheet.images.some(i => i.status === 'valid')} 
                className={`w-full py-4 rounded-xl font-black text-white ${newWorksheet.images.some(i => i.status === 'valid') ? 'bg-blue-500' : 'bg-gray-300'}`}
              >
                {isProcessingBatch ? <Loader2 className="animate-spin mx-auto" /> : "Guardar Ficha"}
              </button>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-3">
            {worksheets.map(w => (
              <div key={w.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={w.images[0]} className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <p className="font-bold">{w.name}</p>
                    <span className="text-[10px] uppercase font-black text-blue-500">{w.subject}</span>
                  </div>
                </div>
                <button onClick={() => onUpdateWorksheets(worksheets.filter(x => x.id !== w.id))} className="text-red-400 p-2"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'prizes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[35px] border-2 border-purple-100 h-fit space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Gift className="text-purple-500" /> Novo Prémio</h2>
            <input type="text" placeholder="Nome do Prémio" value={newPrize.name} onChange={e => setNewPrize({...newPrize, name: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
            <div className="flex gap-4">
              <input type="number" placeholder="Custo (€)" value={newPrize.cost} onChange={e => setNewPrize({...newPrize, cost: Number(e.target.value)})} className="flex-1 p-3 border-2 rounded-xl" />
              <input type="text" placeholder="URL da Imagem" value={newPrize.image} onChange={e => setNewPrize({...newPrize, image: e.target.value})} className="flex-[2] p-3 border-2 rounded-xl" />
            </div>
            <button onClick={handleAddPrize} className="w-full bg-purple-500 text-white py-4 rounded-xl font-black">Adicionar ao Baú</button>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {prizes.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                  <div><p className="font-bold">{p.name}</p><span className="text-yellow-600 font-black">{p.cost.toFixed(2)}€</span></div>
                </div>
                <button onClick={() => onUpdatePrizes(prizes.filter(x => x.id !== p.id))} className="text-red-400 p-2"><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Explicitly cast Object.entries to solve type inference issues for 'unknown' properties */}
            {(Object.entries(subjectStats || {}) as [string, SubjectMetrics][]).map(([subj, data]) => (
              <div key={subj} className="bg-white p-6 rounded-[35px] border-2 border-gray-100 text-center">
                <p className="text-xs font-black text-gray-400 uppercase mb-2">{subj}</p>
                <p className="text-3xl font-black text-gray-800">{data.totalQuestions || 0}</p>
                <p className="text-[10px] font-bold text-gray-500">Perguntas Totais</p>
                <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500" style={{ width: `${data.totalQuestions ? (data.correctAnswers / data.totalQuestions) * 100 : 0}%` }}></div>
                </div>
                <p className="text-[10px] mt-2 font-black text-green-600">{Math.round((data.correctAnswers / (data.totalQuestions || 1)) * 100)}% Acerto</p>
              </div>
            ))}
          </div>
          <div className="bg-white p-8 rounded-[40px] border-2 border-green-50 space-y-4">
             <h3 className="font-black text-gray-800 flex items-center gap-2"><TrendingUp className="text-green-500" /> Evolução da Helena</h3>
             <p className="text-sm text-gray-500 italic">Os dados mostram um resumo de todas as atividades realizadas na plataforma.</p>
          </div>
        </div>
      )}

      {activeTab === 'config' && (
        <div className="max-w-2xl bg-white p-8 rounded-[40px] border-2 border-orange-100 space-y-8">
          <section>
            <h3 className="font-black mb-4 flex items-center gap-2 text-orange-600"><Wallet size={20} /> Saldo Manual</h3>
            <div className="flex gap-4 items-center">
              <input type="number" value={credits} onChange={e => onUpdateCredits(Number(e.target.value))} className="w-32 p-3 border-2 rounded-xl text-xl font-bold text-center" />
              <p className="text-sm text-gray-500">Dê créditos extra à Helena como recompensa por bom comportamento ou outras tarefas!</p>
            </div>
          </section>
          <section>
             <h3 className="font-black mb-4 flex items-center gap-2 text-indigo-600"><Zap size={20} /> Créditos a Dobrar</h3>
             <div className="flex flex-wrap gap-2">
               {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                 <button 
                   key={i} 
                   onClick={() => {
                     const newDays = doubleCreditDays.includes(i) ? doubleCreditDays.filter(d => d !== i) : [...doubleCreditDays, i];
                     onUpdateDoubleCreditDays(newDays);
                   }}
                   className={`w-12 h-12 rounded-2xl font-black transition-all border-2 ${doubleCreditDays.includes(i) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-400 border-gray-100'}`}
                 >
                   {day}
                 </button>
               ))}
             </div>
             <p className="text-xs text-gray-400 mt-2">Escolha os dias da semana em que os exercícios valem o dobro (ex: fins de semana).</p>
          </section>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[40px] border-2 border-gray-50 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Prémio</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Custo</th>
                <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {wonHistory.map((w, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-700">{w.name}</td>
                  <td className="px-6 py-4 font-black text-yellow-600">{w.cost.toFixed(2)}€</td>
                  <td className="px-6 py-4 text-gray-400 text-sm">{w.dateWon}</td>
                </tr>
              ))}
              {wonHistory.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-20 text-center text-gray-400 italic">Nenhum prémio conquistado ainda. Vamos estudar!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
