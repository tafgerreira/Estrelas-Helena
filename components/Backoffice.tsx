import React, { useState, useEffect, useRef } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { SUBJECT_CONFIG } from '../constants';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { 
  Plus, Trash2, Image as ImageIcon, ArrowLeft, Settings, Gift, BookOpen, Save, 
  History as HistoryIcon, Euro, Loader2, Upload, BarChart3, Clock, Target, 
  CalendarDays, Zap, Database, AlertCircle, Layers, CheckCircle2, TrendingUp, 
  Cloud, Copy, Download, Share2, FileText, FileUp
} from 'lucide-react';

interface BackofficeProps {
  prizes: Prize[];
  worksheets: Worksheet[];
  wonHistory: WonPrize[];
  subjectStats: Record<Subject, SubjectMetrics>;
  doubleCreditDays: number[];
  credits: number;
  onUpdateDoubleCreditDays: (days: number[]) => void;
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
  onUpdateDoubleCreditDays,
  onUpdatePrizes, 
  onUpdateWorksheets, 
  onImportData,
  onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'prizes' | 'worksheets' | 'history' | 'performance' | 'config' | 'sync'>('prizes');
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [storageStatus, setStorageStatus] = useState(getStorageUsage());
  const [syncCode, setSyncCode] = useState('');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [newPrize, setNewPrize] = useState<{name: string, cost: number, image: string}>({ name: '', cost: 0, image: '' });
  const [newWorksheet, setNewWorksheet] = useState<{subject: Subject, images: string[], namePrefix: string}>({
    subject: Subject.PORTUGUESE,
    images: [],
    namePrefix: ''
  });

  const daysOfWeek = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  useEffect(() => {
    setStorageStatus(getStorageUsage());
  }, [prizes, worksheets]);

  const toggleDoubleCreditDay = (dayIndex: number) => {
    if (doubleCreditDays.includes(dayIndex)) {
      onUpdateDoubleCreditDays(doubleCreditDays.filter(d => d !== dayIndex));
    } else {
      onUpdateDoubleCreditDays([...doubleCreditDays, dayIndex]);
    }
  };

  const generateBackupData = () => {
    const data = {
      prizes,
      worksheets,
      stats: {
        credits,
        wonHistory,
        subjectStats,
        doubleCreditDays
      }
    };
    const json = JSON.stringify(data);
    return btoa(unescape(encodeURIComponent(json)));
  };

  const handleExportData = () => {
    const encoded = generateBackupData();
    navigator.clipboard.writeText(encoded);
    alert("Código de sincronização copiado! Podes colá-lo noutro dispositivo.");
  };

  const handleExportFile = () => {
    const encoded = generateBackupData();
    const blob = new Blob([encoded], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `helena_progresso_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      }
    };
    reader.readAsText(file);
    // Reset input
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

  const handleDeleteWorksheet = (id: string) => {
    if(confirm("Tens a certeza que queres apagar esta ficha?")) {
      onUpdateWorksheets(worksheets.filter(w => w.id !== id));
    }
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
        <button onClick={() => setActiveTab('sync')} className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${activeTab === 'sync' ? 'bg-indigo-500 text-white shadow-lg' : 'bg-white text-gray-500'}`}><Cloud /> Sincronização</button>
      </div>

      {/* ABA DE SINCRONIZAÇÃO */}
      {activeTab === 'sync' && (
        <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-8 rounded-[40px] shadow-sm border-2 border-indigo-100">
            <h2 className="text-2xl font-black text-gray-800 mb-4">Transferir dados</h2>
            <p className="text-gray-500 mb-6 font-medium leading-relaxed">
              Guarda um ficheiro com todo o progresso da Helena para abrir noutro iPad ou computador.
            </p>
            
            <div className="space-y-6">
              {/* EXPORTAR */}
              <div className="p-6 bg-indigo-50 rounded-3xl border-2 border-indigo-100">
                <h3 className="font-black text-indigo-700 mb-4 flex items-center gap-2"><Download className="w-5 h-5" /> Exportar Dados</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button 
                    onClick={handleExportFile}
                    className="bg-white text-indigo-600 border-2 border-indigo-200 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all shadow-sm"
                  >
                    <FileText className="w-5 h-5" /> Descarregar .txt
                  </button>
                  <button 
                    onClick={handleExportData}
                    className="bg-indigo-500 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all shadow-md"
                  >
                    <Copy className="w-5 h-5" /> Copiar Código
                  </button>
                </div>
              </div>

              {/* IMPORTAR */}
              <div className="p-6 bg-white rounded-3xl border-2 border-gray-100">
                <h3 className="font-black text-gray-700 mb-4 flex items-center gap-2"><FileUp className="w-5 h-5" /> Importar Dados</h3>
                
                <div className="space-y-4">
                  <input 
                    type="file" 
                    accept=".txt" 
                    ref={fileInputRef}
                    onChange={handleImportFile}
                    className="hidden" 
                    id="file-import" 
                  />
                  <label 
                    htmlFor="file-import"
                    className="w-full bg-blue-50 text-blue-600 border-2 border-dashed border-blue-200 py-6 rounded-2xl font-black flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-blue-100 transition-all"
                  >
                    <FileUp className="w-8 h-8" />
                    <span>Selecionar ficheiro .txt do outro aparelho</span>
                  </label>

                  <div className="relative pt-4">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                      <span className="bg-white px-2 text-gray-300">Ou colar código</span>
                    </div>
                  </div>

                  <textarea 
                    value={syncCode}
                    onChange={(e) => setSyncCode(e.target.value)}
                    placeholder="Cola o código aqui..."
                    className="w-full p-4 border-2 border-gray-100 rounded-2xl h-24 text-xs font-mono bg-gray-50 focus:border-indigo-300 outline-none"
                  />
                  <button 
                    disabled={!syncCode}
                    onClick={handleImport}
                    className="w-full bg-green-500 disabled:bg-gray-200 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-md"
                  >
                    {importStatus === 'success' ? <CheckCircle2 /> : <Save />}
                    {importStatus === 'success' ? 'Sincronizado!' : 'Importar Código'}
                  </button>
                </div>
                {importStatus === 'error' && <p className="text-red-500 text-xs font-bold mt-2 text-center">Ficheiro ou código inválido!</p>}
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-[30px] border-2 border-blue-100 flex items-start gap-4">
            <AlertCircle className="text-blue-500 shrink-0 mt-1" />
            <div>
              <p className="text-sm font-bold text-blue-800">Dica:</p>
              <p className="text-xs text-blue-600 font-medium leading-relaxed">Podes enviar o ficheiro .txt para ti mesmo por e-mail ou WhatsApp e depois carregá-lo noutro aparelho usando o botão acima.</p>
            </div>
          </div>
        </div>
      )}

      {/* ABA DE FICHAS */}
      {activeTab === 'worksheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-blue-100 h-fit">
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
            {worksheets.length === 0 && <p className="text-center py-10 text-gray-400 font-bold italic">Nenhuma ficha importada ainda.</p>}
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

      {/* ABA DE PRÉMIOS */}
      {activeTab === 'prizes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-2">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-purple-100 h-fit">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Novo Prémio</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome" value={newPrize.name} onChange={e => setNewPrize({...newPrize, name: e.target.value})} className="w-full p-3 rounded-xl border-2 border-gray-100 outline-none focus:border-purple-300" />
              <div className="relative">
                <input type="number" step="0.01" value={newPrize.cost} onChange={e => setNewPrize({...newPrize, cost: Number(e.target.value) || 0})} className="w-full p-3 rounded-xl border-2 border-gray-100 pr-10" />
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
            {prizes.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-16 h-16 rounded-xl object-cover" />
                  <div><h3 className="font-bold text-gray-800">{p.name}</h3><p className="text-purple-600 font-black">{p.cost.toFixed(2)}€</p></div>
                </div>
                <button onClick={() => onUpdatePrizes(prizes.filter(pr => pr.id !== p.id))} className="p-2 text-gray-200 hover:text-red-500 transition-colors"><Trash2 className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA DE DESEMPENHO */}
      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-2">
          {Object.values(Subject).map(s => {
            const stats = subjectStats[s] || { totalQuestions: 0, correctAnswers: 0, totalMinutes: 0 };
            const accuracy = stats.totalQuestions > 0 ? Math.round((stats.correctAnswers / stats.totalQuestions) * 100) : 0;
            const config = SUBJECT_CONFIG[s];
            
            return (
              <div key={s} className="bg-white p-6 rounded-[35px] border-4 border-gray-50 shadow-sm relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${config.gradient} opacity-10 rounded-bl-[100px] transition-transform group-hover:scale-110`}></div>
                <div className="flex flex-col items-center text-center">
                  <div className={`p-4 rounded-2xl mb-4 bg-gradient-to-br ${config.gradient} shadow-lg`}>
                    {config.icon}
                  </div>
                  <h3 className="text-xl font-black text-gray-800 mb-6">{s}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-blue-400 mb-1">Precisão</p>
                      <p className="text-xl font-black text-blue-600">{accuracy}%</p>
                    </div>
                    <div className="bg-green-50 p-3 rounded-2xl">
                      <p className="text-[10px] font-black uppercase text-green-400 mb-1">Estudo</p>
                      <p className="text-xl font-black text-green-600">{stats.totalMinutes}m</p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded-2xl col-span-2">
                      <p className="text-[10px] font-black uppercase text-purple-400 mb-1">Perguntas Respondidas</p>
                      <p className="text-xl font-black text-purple-600">{stats.correctAnswers} / {stats.totalQuestions}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ABA DE REGRAS (CONFIG) */}
      {activeTab === 'config' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-[40px] shadow-sm border-2 border-orange-100 animate-in slide-in-from-bottom-2">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-orange-100 rounded-3xl">
              <Zap className="text-orange-500 w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800">Créditos a Dobrar 2x</h2>
              <p className="text-gray-500 font-medium">Escolha os dias em que a Helena ganha o dobro das estrelas.</p>
            </div>
          </div>

          <div className="space-y-3">
            {daysOfWeek.map((day, index) => {
              const isActive = doubleCreditDays.includes(index);
              return (
                <button
                  key={day}
                  onClick={() => toggleDoubleCreditDay(index)}
                  className={`w-full p-6 rounded-3xl border-4 flex items-center justify-between transition-all ${
                    isActive 
                      ? 'border-orange-400 bg-orange-50' 
                      : 'border-gray-50 bg-gray-50/50 grayscale hover:grayscale-0'
                  }`}
                >
                  <span className={`text-xl font-black ${isActive ? 'text-orange-600' : 'text-gray-400'}`}>{day}</span>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${isActive ? 'bg-orange-400 text-white' : 'bg-gray-100 text-gray-300'}`}>
                    <CheckCircle2 className={isActive ? 'opacity-100' : 'opacity-30'} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ABA DE HISTÓRICO */}
      {activeTab === 'history' && (
        <div className="max-w-4xl mx-auto space-y-4 animate-in slide-in-from-bottom-2">
          <h2 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
            <TrendingUp className="text-yellow-500" /> Prémios Conquistados
          </h2>
          
          {wonHistory.length === 0 && (
            <div className="bg-white p-20 rounded-[40px] text-center border-4 border-dashed border-gray-100">
              <Gift className="w-16 h-16 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-bold text-xl">A Helena ainda não conquistou prémios. Força!</p>
            </div>
          )}

          {wonHistory.map((item, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[35px] shadow-sm border-2 border-gray-50 flex items-center gap-6 group hover:border-yellow-200 transition-all">
              <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-md flex-shrink-0">
                <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform" alt={item.name} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-2xl font-black text-gray-800">{item.name}</h3>
                  <span className="bg-green-100 text-green-600 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Conquistado</span>
                </div>
                <div className="flex items-center gap-4 text-gray-400">
                  <div className="flex items-center gap-1">
                    <CalendarDays className="w-4 h-4" />
                    <span className="text-sm font-bold">{item.dateWon}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Euro className="w-4 h-4" />
                    <span className="text-sm font-bold">{item.cost.toFixed(2)}€ investidos</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Backoffice;