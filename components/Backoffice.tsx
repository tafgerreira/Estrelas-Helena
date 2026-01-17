
import React, { useState, useEffect, useRef } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { validateWorksheetImage } from '../services/geminiService';
import { 
  Plus, Trash2, ArrowLeft, Settings, Gift, BookOpen, Save, 
  History as HistoryIcon, Euro, Loader2, Upload, BarChart3, 
  CalendarDays, Zap, Database, CheckCircle2, Cloud, FileText, FileUp, 
  TrendingUp, Clock, Target, Copy, Download, X, Wallet,
  Star, RefreshCw, HardDrive, AlertCircle, Eye, CheckCircle, XCircle
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

const Backoffice: React.FC<BackofficeProps> = ({ 
  prizes = [], worksheets = [], wonHistory = [], subjectStats = {} as any, 
  doubleCreditDays = [], credits = 0, cloudStatus,
  onUpdateDoubleCreditDays, onUpdateCredits, onUpdatePrizes, onUpdateWorksheets, onImportData, onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'prizes' | 'worksheets' | 'performance' | 'config' | 'history' | 'sync'>('worksheets');
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

    // Marcar como validando
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

    // Processar redimensionamento primeiro
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

    // Adicionar ao estado
    setNewWorksheet(prev => ({ ...prev, images: [...prev.images, ...incomingImages] }));
    
    // Validar uma a uma automaticamente
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
            <ArrowLeft size={20} /> Voltar ao Início
          </button>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2">
            <Settings className="w-8 h-8 text-blue-500" /> Painel de Controle
          </h1>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-3">
          <HardDrive size={16} className="text-blue-500" />
          <span className="text-xs font-black text-blue-700 uppercase">Memória: {storageStatus.percentage}%</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-8 bg-white/50 p-2 rounded-[30px] border border-gray-100">
        {[
          { id: 'worksheets', label: 'Fichas da Helena', icon: BookOpen, color: 'blue' },
          { id: 'prizes', label: 'Baú de Prémios', icon: Gift, color: 'purple' },
          { id: 'performance', label: 'Estatísticas', icon: BarChart3, color: 'green' },
          { id: 'config', label: 'Configurações', icon: CalendarDays, color: 'orange' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all ${
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
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Plus className="text-blue-500" /> Nova Ficha
              </h2>
              {isUploading && <Loader2 className="animate-spin text-blue-500" size={20} />}
            </div>
            
            <div className="space-y-4">
              <input type="text" placeholder="Nome (Ex: Ficha de Animais)" value={newWorksheet.namePrefix} onChange={e => setNewWorksheet({...newWorksheet, namePrefix: e.target.value})} className="w-full p-3 border-2 rounded-xl focus:border-blue-300 outline-none" />
              <select value={newWorksheet.subject} onChange={e => setNewWorksheet({...newWorksheet, subject: e.target.value as Subject})} className="w-full p-3 border-2 rounded-xl bg-white">
                {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              
              <div className="p-6 border-2 border-dashed rounded-xl text-center bg-gray-50 border-gray-200 hover:bg-blue-50 transition-colors">
                <input type="file" multiple accept="image/*" onChange={handleMultipleImagesUpload} className="hidden" id="worksheet-upload" disabled={isUploading} />
                <label htmlFor="worksheet-upload" className={`cursor-pointer flex flex-col items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                  <Upload className="text-blue-500 w-8 h-8" />
                  <span className="text-sm font-black text-gray-500">Adicionar Páginas da Ficha</span>
                  <p className="text-[10px] text-gray-400">O robô vai validar cada página automaticamente</p>
                </label>
              </div>

              {newWorksheet.images.length > 0 && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Estado das Fotos:</p>
                    <span className="text-[10px] font-bold text-blue-500">{newWorksheet.images.filter(i => i.status === 'valid').length} prontas</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {newWorksheet.images.map((img, idx) => (
                      <div key={idx} className={`p-2 rounded-xl border flex items-center gap-3 transition-all ${
                        img.status === 'valid' ? 'bg-green-50 border-green-200' : 
                        img.status === 'invalid' ? 'bg-red-50 border-red-200' : 
                        img.status === 'validating' ? 'bg-blue-50 border-blue-200 animate-pulse' : 
                        'bg-white border-gray-100'
                      }`}>
                        <img src={img.base64} className="w-10 h-10 rounded-lg object-cover border" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-[10px] font-bold truncate ${img.status === 'invalid' ? 'text-red-600' : 'text-gray-600'}`}>
                            {img.status === 'validating' ? "O Robô está a ler..." : (img.feedback || "Aguardando...")}
                          </p>
                          {img.topic && <span className="text-[8px] font-black text-blue-500 uppercase">{img.topic}</span>}
                        </div>
                        <div className="flex items-center gap-1">
                          {img.status === 'valid' && <CheckCircle className="text-green-500" size={16} />}
                          {img.status === 'invalid' && <XCircle className="text-red-500" size={16} />}
                          {img.status === 'validating' && <Loader2 className="animate-spin text-blue-400" size={16} />}
                          
                          {(img.status === 'invalid' || img.status === 'pending') && (
                            <button onClick={() => validateImageAtIndex(idx, newWorksheet.images)} className="p-1.5 text-blue-500 hover:bg-blue-100 rounded-lg">
                              <RefreshCw size={14} />
                            </button>
                          )}
                          
                          <button onClick={() => setNewWorksheet(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))} className="p-1.5 text-gray-300 hover:text-red-400">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <button 
                onClick={handleAddWorksheet} 
                disabled={isProcessingBatch || isUploading || !newWorksheet.images.some(i => i.status === 'valid')} 
                className={`w-full py-4 rounded-xl font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                  !isUploading && newWorksheet.images.some(i => i.status === 'valid') 
                    ? 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-[1.02] active:scale-95' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isProcessingBatch ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Guardar Ficha Validada</>}
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <h3 className="font-black text-gray-700 uppercase text-xs tracking-widest px-2">Fichas no Sistema ({worksheets.length})</h3>
            {worksheets.length === 0 && (
              <div className="bg-white p-20 rounded-[40px] text-center border-4 border-dashed border-gray-100">
                <FileText className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold italic">Nenhuma ficha carregada.</p>
              </div>
            )}
            <div className="space-y-3">
              {worksheets.map(w => (
                <div key={w.id} className="bg-white p-4 rounded-[30px] shadow-sm border-2 border-gray-50 flex items-center justify-between group hover:border-blue-100 transition-all">
                  <div className="flex items-center gap-4">
                    <img src={w.images[0]} className="w-16 h-16 rounded-2xl object-cover border" />
                    <div>
                      <p className="font-black text-gray-800 leading-none mb-1">{w.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-black uppercase">{w.subject}</span>
                        <span className="text-[10px] text-gray-400 font-bold">{w.images.length} páginas</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => onUpdateWorksheets(worksheets.filter(ws => ws.id !== w.id))} className="p-3 text-red-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Outras tabs seriam renderizadas aqui */}
    </div>
  );
};

export default Backoffice;
