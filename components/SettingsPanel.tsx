
import React, { useState, useRef, useCallback } from 'react';
import { Shoe, AppSettings, ShoeVariant } from '../types';
import { PrinterService } from '../services/printerService';

interface SettingsPanelProps {
  shoes: Shoe[];
  onAddShoe: (shoe: Shoe) => void;
  onDeleteShoe: (id: string) => void;
  settings: AppSettings;
  onUpdateSettings: (settings: AppSettings) => void;
  currencySymbol: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  shoes, onAddShoe, onDeleteShoe, settings, onUpdateSettings, currencySymbol 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
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
  const [printerInfo, setPrinterInfo] = useState<string>('No Hardware Connected');

  const startCamera = async () => {
    setCameraError(null);
    try {
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, 
          width: { ideal: 1024 }, 
          height: { ideal: 1024 } 
        } 
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCameraActive(true);
      }
    } catch (err) {
      setCameraError("Camera blocked. Please check site permissions in your browser bar.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
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

  const setupPrinter = async (type: 'BT' | 'USB') => {
    try {
      let name = '';
      if (type === 'BT') name = await PrinterService.connectBluetooth();
      else name = await PrinterService.connectUSB();
      setPrinterInfo(`Online: ${name}`);
    } catch (err: any) {
      setPrinterInfo(`Error: ${err.message}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setPreviewUrl(base64String);
        setNewShoe(prev => ({ ...prev, imageUrl: base64String }));
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateSettings({
          ...settings,
          company: { ...settings.company, logo: reader.result as string }
        });
      };
      reader.readAsDataURL(file);
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
        variants: activeVariants.length > 0 ? activeVariants : [{ color: 'Standard', size: 'One Size', stock: 1 }]
      };
      
      onAddShoe(shoe);
      setNewShoe({ name: '', brand: '', wholesalePrice: 0, retailerPrice: 0, imageUrl: '', description: '', variants: [] });
      setInitialVariants(Array.from({ length: 10 }, () => ({ color: '', size: '', stock: 0 })));
      setPreviewUrl(null);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Control Center</h1>
          <p className="text-slate-500">Hardware registry and store identity</p>
        </div>
        <div className="bg-indigo-600 px-4 py-2 rounded-xl text-white font-black text-xs uppercase animate-pulse">
          {printerInfo}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Hardware Setup</h3>
            <div className="space-y-4">
              <button 
                onClick={() => setupPrinter('BT')}
                className="w-full p-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-between hover:bg-slate-800 transition-all"
              >
                <span>Pair BT Thermal Printer</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M14.88 16.29l-4.59-4.59 4.59-4.59 1.41 1.41-3.17 3.18 3.17 3.18-1.41 1.41zM7 12l4.59 4.59 1.41-1.41-3.17-3.18 3.17-3.18-1.41-1.41L7 12z" /></svg>
              </button>
              <button 
                onClick={() => setupPrinter('USB')}
                className="w-full p-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase flex items-center justify-between hover:bg-indigo-700 transition-all"
              >
                <span>Connect USB Printer</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2-2v10a2 2 0 002 2z" /></svg>
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Company Identity</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 mb-4">
                <div 
                  onClick={() => logoInputRef.current?.click()}
                  className="w-16 h-16 rounded-full bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-200 overflow-hidden"
                >
                  {settings.company?.logo ? (
                    <img src={settings.company.logo} className="w-full h-full object-cover" alt="Logo" />
                  ) : (
                    <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                  <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoChange} />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-900 uppercase">Store Logo</p>
                </div>
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Company Name"
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white transition-all outline-none"
                  value={settings.company?.name || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, company: { ...settings.company, name: e.target.value } })}
                />
                <textarea
                  placeholder="Address"
                  className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold focus:bg-white transition-all outline-none"
                  rows={2}
                  value={settings.company?.address || ''}
                  onChange={(e) => onUpdateSettings({ ...settings, company: { ...settings.company, address: e.target.value } })}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Add New Design</h3>
            <form onSubmit={handleAddShoe} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-4">
                <label className="block text-sm font-black text-slate-900 uppercase tracking-wider">Product Media</label>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => { stopCamera(); fileInputRef.current?.click(); }}
                    className="flex items-center justify-center space-x-2 py-3 bg-slate-100 rounded-2xl text-slate-700 font-bold hover:bg-indigo-100 hover:text-indigo-600 transition-all text-xs uppercase"
                  >
                    <span>Upload File</span>
                  </button>
                  <button
                    type="button"
                    onClick={isCameraActive ? stopCamera : startCamera}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-2xl font-bold transition-all text-xs uppercase ${
                      isCameraActive ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>{isCameraActive ? 'Cancel Camera' : 'Access Camera'}</span>
                  </button>
                </div>

                <div className="relative group border-4 border-dashed border-slate-100 rounded-[2rem] overflow-hidden min-h-[300px] flex items-center justify-center bg-slate-50">
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  <canvas ref={canvasRef} className="hidden" />

                  {isCameraActive ? (
                    <div className="relative w-full h-full min-h-[400px]">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                      <div className="absolute bottom-6 inset-x-0 flex justify-center">
                        <button 
                          type="button"
                          onClick={capturePhoto}
                          className="w-16 h-16 bg-white border-4 border-indigo-600 rounded-full flex items-center justify-center shadow-2xl active:scale-90"
                        >
                          <div className="w-10 h-10 bg-indigo-600 rounded-full" />
                        </button>
                      </div>
                    </div>
                  ) : previewUrl ? (
                    <div className="relative h-64 w-full md:h-80">
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover rounded-[1.5rem]" />
                      <button 
                        type="button" 
                        onClick={() => setPreviewUrl(null)}
                        className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full shadow-lg"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="text-center p-8 space-y-3">
                      <p className="font-bold text-slate-400 text-sm">Choose upload or camera above</p>
                      {cameraError && (
                        <div className="space-y-3">
                          <p className="text-xs text-red-500 font-medium">{cameraError}</p>
                          <button 
                            type="button"
                            onClick={startCamera}
                            className="text-[10px] font-black text-indigo-600 uppercase underline"
                          >
                            Retry Permission Request
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Model Name</label>
                <input
                  type="text"
                  placeholder="e.g. Air Force 1"
                  className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 focus:bg-white outline-none"
                  value={newShoe.name}
                  onChange={e => setNewShoe({...newShoe, name: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Nike"
                  className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 focus:bg-white outline-none"
                  value={newShoe.brand}
                  onChange={e => setNewShoe({...newShoe, brand: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Wholesale Cost ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="Your Buy Price"
                  className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 focus:bg-white outline-none"
                  value={newShoe.wholesalePrice || ''}
                  onChange={e => setNewShoe({...newShoe, wholesalePrice: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Retail Price ({currencySymbol})</label>
                <input
                  type="number"
                  placeholder="Customer Price"
                  className="w-full p-4 border border-slate-100 rounded-2xl bg-slate-50 focus:bg-white outline-none"
                  value={newShoe.retailerPrice || ''}
                  onChange={e => setNewShoe({...newShoe, retailerPrice: Number(e.target.value)})}
                  required
                />
              </div>

              <div className="md:col-span-2 mt-4 space-y-6">
                <div className="flex items-center justify-between">
                   <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Inventory Variants (Max 10)</h4>
                   <span className="text-[10px] font-bold text-slate-400">Fill at least one to activate</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {initialVariants.map((variant, index) => (
                    <div key={index} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Variant Slot {index + 1}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Color (e.g. Red)"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={variant.color}
                          onChange={e => updateVariant(index, 'color', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Size (e.g. 42)"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                          value={variant.size}
                          onChange={e => updateVariant(index, 'size', e.target.value)}
                        />
                      </div>
                      <input
                        type="number"
                        placeholder="Initial Stock Qty"
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                        value={variant.stock || ''}
                        onChange={e => updateVariant(index, 'stock', Number(e.target.value))}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="md:col-span-2 py-5 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 transition-all shadow-2xl mt-4"
              >
                Publish Design to Gallery
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
