
import React, { useState } from 'react';
import { Subject, Prize, Worksheet, WonPrize, SubjectMetrics } from '../types';
import { resizeImage, getStorageUsage } from '../utils/imageUtils';
import { validateWorksheetImage } from '../services/geminiService';
import { 
  Plus, Trash2, ArrowLeft, Settings, Gift, BookOpen, 
  Loader2, Upload, BarChart3, 
  CalendarDays, Zap, Wallet,
  HardDrive, History, CheckCircle2, XCircle, AlertCircle
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
}

const Backoffice: React.FC<BackofficeProps> = ({ 
  prizes = [], worksheets = [], wonHistory = [], subjectStats = {}, 
  doubleCreditDays = [], credits = 0,
  onUpdateDoubleCreditDays, onUpdateCredits, onUpdatePrizes, onUpdateWorksheets, onClose 
}) => {
  const [activeTab, setActiveTab] = useState<'prizes' | 'worksheets' | 'performance' | 'config' | 'history'>('worksheets');
  const [isUploading, setIsUploading] = useState(false);
  
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

  const handleAddWorksheet = () => {
    const validImages = newWorksheet.images.filter(img => img.status === 'valid').map(img => img.base64);
    if (validImages.length === 0) return;

    const worksheet: Worksheet = {
      id: Math.random().toString(36).substr(2, 9),
      subject: newWorksheet.subject,
      images: validImages,
      name: newWorksheet.namePrefix || `Ficha de ${newWorksheet.subject}`,
      date: new Date().toLocaleDateString()
    };
    onUpdateWorksheets([...worksheets, worksheet]);
    setNewWorksheet({ ...newWorksheet, images: [], namePrefix: '' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const resized = await resizeImage(base64, 1000, 1000);
        
        const newImg: UploadedImage = { base64: resized, status: 'validating' };
        setNewWorksheet(prev => ({ ...prev, images: [...prev.images, newImg] }));
        
        const result = await validateWorksheetImage(resized);
        
        setNewWorksheet(prev => ({
          ...prev,
          images: prev.images.map(img => img.base64 === resized ? { ...img, status: result.isValid ? 'valid' : 'invalid', feedback: result.feedback } : img)
        }));
      };
      reader.readAsDataURL(file);
    }
    setIsUploading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <button onClick={onClose} className="text-gray-500 font-bold flex items-center gap-2 mb-2"><ArrowLeft size={18}/> Voltar</button>
          <h1 className="text-3xl font-black text-gray-800 flex items-center gap-2"><Settings className="text-blue-500" /> Painel de Pais</h1>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-2xl border border-blue-100 flex items-center gap-2 text-blue-600 font-black text-xs uppercase">
          <HardDrive size={14} /> Memória: {getStorageUsage().percentage}%
        </div>
      </div>

      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {[
          { id: 'worksheets', label: 'Fichas', icon: BookOpen },
          { id: 'prizes', label: 'Baú', icon: Gift },
          { id: 'performance', label: 'Notas', icon: BarChart3 },
          { id: 'config', label: 'Ajustes', icon: CalendarDays },
          { id: 'history', label: 'Histórico', icon: History }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shrink-0 ${
              activeTab === tab.id ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-gray-500 border border-gray-100'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'worksheets' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-[35px] shadow-sm border-2 border-blue-50 h-fit space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="text-blue-500"/> Nova Ficha</h2>
            <input type="text" placeholder="Nome da Ficha" value={newWorksheet.namePrefix} onChange={e => setNewWorksheet({...newWorksheet, namePrefix: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
            <select value={newWorksheet.subject} onChange={e => setNewWorksheet({...newWorksheet, subject: e.target.value as Subject})} className="w-full p-3 border-2 rounded-xl">
              {Object.values(Subject).filter(s => s !== Subject.ALL).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            
            <div className="p-6 border-2 border-dashed border-gray-200 rounded-2xl text-center bg-gray-50 hover:bg-blue-50 transition-colors">
              <input type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" id="ws-file" />
              <label htmlFor="ws-file" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="text-blue-500" />
                <span className="text-sm font-bold text-gray-500">Adicionar Páginas</span>
              </label>
            </div>

            {newWorksheet.images.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase text-gray-400">Estado das Fotos:</p>
                {newWorksheet.images.map((img, i) => (
                  <div key={i} className={`p-2 rounded-xl border flex items-center justify-between text-xs ${img.status === 'valid' ? 'bg-green-50 border-green-100' : img.status === 'invalid' ? 'bg-red-50 border-red-100' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2">
                      <img src={img.base64} className="w-8 h-8 rounded object-cover" />
                      <span className="font-bold">{img.status === 'validating' ? 'A validar...' : img.status === 'valid' ? 'Pronta!' : 'Erro na foto'}</span>
                    </div>
                    {img.status === 'valid' ? <CheckCircle2 className="text-green-500" size={14}/> : img.status === 'invalid' ? <XCircle className="text-red-500" size={14}/> : <Loader2 className="animate-spin text-blue-500" size={14}/>}
                  </div>
                ))}
              </div>
            )}

            <button 
              onClick={handleAddWorksheet} 
              disabled={!newWorksheet.images.some(img => img.status === 'valid')}
              className="w-full bg-blue-500 text-white py-4 rounded-xl font-bold shadow-lg disabled:opacity-50"
            >
              Guardar Ficha Validada
            </button>
          </div>

          <div className="lg:col-span-2 space-y-3">
            <h2 className="font-black text-gray-400 uppercase text-xs tracking-widest">Fichas no Sistema ({worksheets.length})</h2>
            {worksheets.length === 0 ? (
              <div className="bg-white p-12 rounded-[40px] border-4 border-dashed border-gray-100 text-center text-gray-300">
                <BookOpen size={48} className="mx-auto mb-4 opacity-20" />
                <p className="font-bold">Nenhuma ficha carregada.</p>
              </div>
            ) : (
              worksheets.map(w => (
                <div key={w.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-4">
                    <img src={w.images[0]} className="w-12 h-12 rounded-xl object-cover" />
                    <div><p className="font-bold text-gray-800">{w.name}</p><span className="text-[10px] font-black text-blue-500 uppercase">{w.subject}</span></div>
                  </div>
                  <button onClick={() => onUpdateWorksheets(worksheets.filter(x => x.id !== w.id))} className="text-red-400 p-2"><Trash2 size={18} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'prizes' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-[40px] border-2 border-purple-50 space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Plus className="text-purple-500"/> Novo Prémio</h2>
            <input type="text" placeholder="Ex: Gelado" value={newPrize.name} onChange={e => setNewPrize({...newPrize, name: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
            <input type="number" placeholder="Custo (€)" value={newPrize.cost} onChange={e => setNewPrize({...newPrize, cost: Number(e.target.value)})} className="w-full p-3 border-2 rounded-xl" />
            <input type="text" placeholder="Link da Imagem" value={newPrize.image} onChange={e => setNewPrize({...newPrize, image: e.target.value})} className="w-full p-3 border-2 rounded-xl" />
            <button onClick={handleAddPrize} className="w-full bg-purple-500 text-white py-4 rounded-xl font-bold shadow-lg">Adicionar</button>
          </div>
          <div className="space-y-3">
            {prizes.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-3xl border flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <img src={p.image} className="w-12 h-12 rounded-xl object-cover" />
                  <div><p className="font-bold">{p.name}</p><span className="text-yellow-600 font-black">{p.cost.toFixed(2)}€</span></div>
                </div>
                <button onClick={() => onUpdatePrizes(prizes.filter(x => x.id !== p.id))} className="text-red-400 p-2"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(subjectStats).map(([subj, data]: [any, any]) => (
            <div key={subj} className="bg-white p-6 rounded-[35px] border-2 border-gray-50 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-2">{subj}</p>
              <p className="text-3xl font-black text-gray-800">{data.totalQuestions}</p>
              <p className="text-[10px] font-bold text-gray-500">Respondidas</p>
              <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: `${(data.correctAnswers / (data.totalQuestions || 1)) * 100}%` }}></div>
              </div>
              <p className="text-[10px] font-black text-green-600 mt-2">{Math.round((data.correctAnswers / (data.totalQuestions || 1)) * 100)}% Acerto</p>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'config' && (
        <div className="bg-white p-8 rounded-[40px] border-2 border-orange-50 max-w-xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-orange-600"><Zap size={20}/> Definições Rápidas</h2>
          <div className="space-y-8">
            <div>
              <p className="font-black text-xs uppercase text-gray-400 mb-2">Saldo da Helena (€)</p>
              <div className="flex items-center gap-4">
                <input type="number" value={credits} onChange={e => onUpdateCredits(Number(e.target.value))} className="w-32 p-4 border-2 rounded-2xl text-2xl font-black text-center" />
                <p className="text-sm text-gray-500">Podes ajustar o mealheiro manualmente para dar bónus!</p>
              </div>
            </div>
            <div>
              <p className="font-black text-xs uppercase text-gray-400 mb-2">Dias a Dobrar</p>
              <div className="flex gap-2">
                {['D','S','T','Q','Q','S','S'].map((d, i) => (
                  <button 
                    key={i} 
                    onClick={() => onUpdateDoubleCreditDays(doubleCreditDays.includes(i) ? doubleCreditDays.filter(x => x !== i) : [...doubleCreditDays, i])}
                    className={`w-10 h-10 rounded-xl font-black transition-all ${doubleCreditDays.includes(i) ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'}`}
                  >{d}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="bg-white rounded-[40px] overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Prémio</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Data</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase text-gray-400">Valor</th>
              </tr>
            </thead>
            <tbody>
              {wonHistory.map((h, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="px-6 py-4 font-bold">{h.name}</td>
                  <td className="px-6 py-4 text-gray-500 text-sm">{h.dateWon}</td>
                  <td className="px-6 py-4 font-black text-yellow-600">{h.cost.toFixed(2)}€</td>
                </tr>
              ))}
              {wonHistory.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-12 text-center text-gray-300 italic">Ainda não foram trocados prémios.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Backoffice;
