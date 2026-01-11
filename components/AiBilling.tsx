
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { detectShoeFromImage } from '../services/geminiService';
import { ShoeVariant, SaleRecord } from '../types';

interface AiBillingProps {
  onCompleteSale: (sale: SaleRecord) => void;
  isEnabled: boolean;
  currencySymbol: string;
}

interface DetectedShoe {
  color: string;
  size: string;
  wholesalePrice: number;
  retailerPrice: number;
  brand: string;
  confidence: number;
  notes: string;
}

const AiBilling: React.FC<AiBillingProps> = ({ onCompleteSale, isEnabled, currencySymbol }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [detectedInfo, setDetectedInfo] = useState<DetectedShoe | null>(null);
  const [error, setError] = useState<{ message: string; type: 'permission' | 'notfound' | 'busy' | 'unknown' } | null>(null);

  const initCamera = useCallback(async () => {
    if (!isEnabled) return;
    setError(null);
    try {
      // 1. Try environment (back) camera first
      const constraints = {
        video: { 
          facingMode: { ideal: 'environment' }, 
          width: { ideal: 1280 }, 
          height: { ideal: 720 } 
        }
      };
      
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (e) {
        // 2. Fallback to any available camera (front-facing or default)
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Camera Initialization Error:", err);
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError({
          type: 'permission',
          message: "Camera Access Blocked. Please click the 'Lock' icon in your browser address bar and set Camera to 'Allow'."
        });
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError({
          type: 'notfound',
          message: "No Camera Hardware Detected. Please ensure your camera is connected and recognized by your device."
        });
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError({
          type: 'busy',
          message: "Camera Already in Use. Please close other apps or browser tabs that might be using your camera."
        });
      } else {
        setError({
          type: 'unknown',
          message: "Unable to start camera. Please refresh the page and try again."
        });
      }
    }
  }, [isEnabled]);

  useEffect(() => {
    initCamera();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [initCamera]);

  const captureAndDetect = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsProcessing(true);
    setStatusMessage('Scanning product features...');

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64Image = dataUrl.split(',')[1];
        const result = await detectShoeFromImage(base64Image);
        
        if (result.brand === "None detected" || result.confidence < 0.2) {
          // Internal AI error, don't trigger the hardware error overlay
          setStatusMessage(result.notes || "Shoe not clearly detected. Try again.");
          setTimeout(() => setStatusMessage(''), 3000);
        } else {
          setDetectedInfo(result);
        }
      }
    } catch (err: any) {
      setStatusMessage("AI Service busy. Please try again.");
      setTimeout(() => setStatusMessage(''), 3000);
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleConfirmSale = () => {
    if (detectedInfo) {
      const sale: SaleRecord = {
        id: `AI-${Date.now()}`,
        shoeId: 'ai-detected',
        shoeName: `${detectedInfo.brand} ${detectedInfo.color}`,
        variant: { color: detectedInfo.color, size: detectedInfo.size, stock: 0 },
        quantity: 1,
        totalPrice: detectedInfo.retailerPrice,
        timestamp: Date.now()
      };
      onCompleteSale(sale);
      setDetectedInfo(null);
    }
  };

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center h-[500px] bg-slate-100 rounded-[2rem] border-2 border-dashed border-slate-300">
        <h3 className="text-xl font-bold text-slate-900">AI Billing is Disabled</h3>
        <p className="text-slate-500 mt-2">Enable it in settings to start scanning.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Vision Billing</h1>
          <p className="text-slate-500 font-medium">Automatic Xerox detection and billing.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900 aspect-square border-8 border-white group">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <canvas ref={canvasRef} className="hidden" />
          
          {error && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300">
               <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                 </svg>
               </div>
               <h3 className="text-white text-lg font-black mb-3 uppercase tracking-wider">
                 {error.type === 'permission' ? 'Permission Needed' : error.type === 'busy' ? 'Hardware Busy' : 'Camera Error'}
               </h3>
               <p className="text-slate-400 font-medium text-sm leading-relaxed mb-8">
                 {error.message}
               </p>
               <button 
                onClick={initCamera} 
                className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-xs uppercase shadow-xl hover:bg-indigo-600 hover:text-white transition-all active:scale-95"
               >
                 Try Re-Initializing Camera
               </button>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-indigo-600/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
              <div className="w-16 h-16 border-4 border-t-indigo-200 border-white/20 rounded-full animate-spin mb-4" />
              <p className="font-bold tracking-widest uppercase text-[10px]">{statusMessage}</p>
            </div>
          )}

          {!error && statusMessage && !isProcessing && (
            <div className="absolute top-8 inset-x-0 flex justify-center z-20">
              <div className="bg-slate-900/80 backdrop-blur-md text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {statusMessage}
              </div>
            </div>
          )}
          
          <div className="absolute bottom-8 inset-x-0 flex justify-center z-10">
            <button 
              onClick={captureAndDetect} 
              disabled={isProcessing || !!error} 
              className="px-12 py-5 rounded-full shadow-2xl bg-white text-slate-900 hover:bg-indigo-600 hover:text-white font-black text-lg transition-all active:scale-95 disabled:opacity-50 disabled:scale-95"
            >
              Snap to Bill
            </button>
          </div>
        </div>

        <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col">
          <h3 className="text-xl font-black text-slate-900 mb-8 uppercase tracking-tight">AI Attributes</h3>
          {detectedInfo ? (
            <div className="space-y-6 flex-1 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Brand</p>
                  <p className="font-black text-slate-900">{detectedInfo.brand}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Color</p>
                  <p className="font-black text-slate-900">{detectedInfo.color}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Final Price</p>
                  <p className="font-black text-indigo-700">{currencySymbol}{detectedInfo.retailerPrice.toLocaleString()}</p>
                </div>
              </div>
              <div className="pt-4 mt-auto">
                <button 
                  onClick={handleConfirmSale} 
                  className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-2xl hover:bg-slate-800 transition-all flex items-center justify-center space-x-3"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Generate Mini Bill</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 opacity-50 space-y-4">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-slate-200 flex items-center justify-center">
                 <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                 </svg>
              </div>
              <p className="font-bold text-sm">Waiting for valid product detection...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiBilling;
