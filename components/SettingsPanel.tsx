
import React, { useState, useRef, useCallback } from 'react';
import { Shoe, AppSettings, ShoeVariant, SaleRecord } from '../types';
import { PrinterService } from '../services/printerService';

interface SettingsPanelProps {
  shoes: Shoe[];
  sales: SaleRecord[];
  onAddShoe: (shoe: Shoe) => void;
  onDeleteShoe: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  onDataImport: (data: { shoes: Shoe[], sales: SaleRecord[], settings: AppSettings }) => void;
  currencySymbol: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  shoes, sales, onAddShoe, onDeleteShoe, settings, onUpdateSettings, onDataImport, currencySymbol 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [newShoe, setNewShoe] = useState<Partial<Shoe>>({
    name: '', brand: '', wholesalePrice: 0, retailerPrice: 0, imageUrl: '', description: '', variants: []
  });
  
  const [initialVariants, setInitialVariants] = useState<ShoeVariant[]>(
    Array.from({ length: 10 }, () => ({ color: '', size: '', stock: 0 }))
  );
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints = {
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1024 }, height: { ideal: 1024 } } 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setCameraError("Camera blocked. Check permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewUrl(dataUrl);
        setNewShoe(prev => ({ ...prev, imageUrl: dataUrl }));
        stopCamera();
      }
    }
  };

  const handleExportData = () => {
    const data = { shoes, sales, settings, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup-${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (confirm('Importing will overwrite local data. Proceed?')) {
            onDataImport(data);
          }
        } catch (err) {
          alert('Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const updateVariant = (index: number, field: keyof ShoeVariant, value: string | number) => {
    const updated = [...initialVariants];
    updated[index] = { ...updated[index], [field]: value };
    setInitialVariants(updated);
  };

  const handleAddShoe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newShoe.name && newShoe.brand && newShoe.retailerPrice) {
      const activeVariants = initialVariants.filter(v => v.color.trim() !== '' && v.size.trim() !== '');
      const shoe: Shoe = {
        id: Date.now().toString(),
        name: newShoe.name || '',
        brand: newShoe.brand || '',
        wholesalePrice: Number(newShoe.wholesalePrice) || 0,
        retailerPrice: Number(newShoe.retailerPrice) || 0,
        imageUrl: newShoe.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
        description: newShoe.description || '',
        variants: activeVariants.length > 0 ? activeVariants : [{ color: 'Standard', size: 'N/A', stock: 1 }]
      };
      onAddShoe(shoe);
      setNewShoe({ name: '', brand: '', wholesalePrice: 0, retailerPrice: 0, imageUrl: '', description: '', variants: [] });
      setInitialVariants(Array.from({ length: 10 }, () => ({ color: '', size: '', stock: 0 })));
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Configuration</h1>
          <p className="text-slate-500 font-medium">Control your inventory matrix and hardware connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Core Identity & Data */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Data Management</h3>
            <div className="space-y-3">
              <button onClick={handleExportData} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Export Local Backup</span>
              </button>
              <button onClick={() => importInputRef.current?.click()} className="w-full py-4 bg-indigo-50 text-indigo-700 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 border border-indigo-100">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span>Import Local Data</span>
              </button>
              <input type="file" ref={importInputRef} className="hidden" accept=".json" onChange={handleImportData} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-tight">Branding</h3>
            <div 
              onClick={() => logoInputRef.current?.click()}
              className="w-full aspect-square rounded-[2rem] bg-slate-50 border-4 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 overflow-hidden relative group"
            >
              {settings.company?.logo ? (
                <img src={settings.company.logo} className="w-full h-full object-cover" alt="Logo" />
              ) : (
                <div className="text-center p-6">
                  <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upload Store Logo</p>
                </div>
              )}
              <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => onUpdateSettings({...settings, company: {...settings.company, logo: reader.result as string}});
                  reader.readAsDataURL(file);
                }
              }} />
            </div>
            <div className="mt-6 space-y-3">
              <input type="text" placeholder="Store Name" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none" value={settings.company?.name} onChange={(e) => onUpdateSettings({...settings, company: {...settings.company, name: e.target.value}})} />
              <textarea placeholder="Store Address" className="w-full p-4 bg-slate-50 rounded-2xl text-xs font-bold outline-none" rows={2} value={settings.company?.address} onChange={(e) => onUpdateSettings({...settings, company: {...settings.company, address: e.target.value}})} />
            </div>
          </div>
        </div>

        {/* Right Column: Add New Design with Variant Matrix */}
        <div className="lg:col-span-8 space-y-8">
          <form onSubmit={handleAddShoe} className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-10">
            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Create New Entry</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                  <div className="relative group rounded-[2.5rem] overflow-hidden min-h-[300px] border-4 border-dashed border-slate-100 bg-slate-50 flex items-center justify-center">
                    {isCameraActive ? (
                      <video ref={videoRef} autoPlay muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                    ) : previewUrl ? (
                      <img src={previewUrl} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <p className="text-xs font-black text-slate-300 uppercase tracking-widest">Product Imagery</p>
                    )}
                    <div className="absolute bottom-6 inset-x-0 flex justify-center space-x-3">
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="px-6 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">Files</button>
                      <button type="button" onClick={isCameraActive ? capturePhoto : startCamera} className="px-6 py-2 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">{isCameraActive ? 'Capture' : 'Camera'}</button>
                    </div>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const r = new FileReader();
                      r.onloadend = () => { setPreviewUrl(r.result as string); setNewShoe({...newShoe, imageUrl: r.result as string}); };
                      r.readAsDataURL(file);
                    }
                  }} />
                  <canvas ref={canvasRef} className="hidden" />
               </div>

               <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Shoe Model</label>
                      <input type="text" className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-500" value={newShoe.name} onChange={e => setNewShoe({...newShoe, name: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Brand</label>
                      <input type="text" className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-indigo-500" value={newShoe.brand} onChange={e => setNewShoe({...newShoe, brand: e.target.value})} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wholesale</label>
                        <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none" value={newShoe.wholesalePrice || ''} onChange={e => setNewShoe({...newShoe, wholesalePrice: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Retail</label>
                        <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl font-black outline-none" value={newShoe.retailerPrice || ''} onChange={e => setNewShoe({...newShoe, retailerPrice: Number(e.target.value)})} required />
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory Matrix (10 Slots)</h4>
                <div className="text-[10px] font-black text-indigo-500 uppercase">Input Color + Size to Active</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
                {initialVariants.map((v, i) => (
                  <div key={i} className="flex items-center p-3 bg-slate-50 rounded-2xl space-x-2 border border-slate-100">
                    <span className="text-[10px] font-black text-slate-300 w-4">{i+1}</span>
                    <input type="text" placeholder="Color" className="w-1/3 bg-white p-2 rounded-xl text-[10px] font-bold outline-none" value={v.color} onChange={e => updateVariant(i, 'color', e.target.value)} />
                    <input type="text" placeholder="Size" className="w-1/3 bg-white p-2 rounded-xl text-[10px] font-bold outline-none" value={v.size} onChange={e => updateVariant(i, 'size', e.target.value)} />
                    <input type="number" placeholder="Qty" className="w-1/4 bg-white p-2 rounded-xl text-[10px] font-bold outline-none" value={v.stock || ''} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} />
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="w-full py-6 bg-slate-900 text-white font-black rounded-[2rem] shadow-2xl hover:bg-slate-800 transition-all active:scale-95 text-lg uppercase tracking-widest">
              Publish to Registry
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
