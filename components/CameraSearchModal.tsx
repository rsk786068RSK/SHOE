
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { detectShoeFromImage } from '../services/geminiService';
import { Shoe } from '../types';

interface CameraSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  shoes: Shoe[];
  onMatchFound: (shoe: Shoe) => void;
  isOnline: boolean;
}

const CameraSearchModal: React.FC<CameraSearchModalProps> = ({ isOpen, onClose, shoes, onMatchFound, isOnline }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      if (!isOnline) {
        setError("Visual Search requires an internet connection.");
        return;
      }

      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } 
      })
        .then(stream => { if (videoRef.current) videoRef.current.srcObject = stream; })
        .catch(err => { setError("Could not access camera. Check permissions."); });
    }
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isOnline]);

  const handleScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || !isOnline) return;
    setIsProcessing(true);
    setError(null);

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
        
        if (result.confidence < 0.2) {
          setError("Could not identify shoe. Try a clearer angle.");
        } else {
          const match = shoes.find(s => 
            s.name.toLowerCase().includes(result.brand.toLowerCase()) || 
            result.brand.toLowerCase().includes(s.brand.toLowerCase()) ||
            s.name.toLowerCase().includes(result.color.toLowerCase())
          );

          if (match) {
            onMatchFound(match);
            onClose();
          } else {
            setError(`Identified as ${result.brand} ${result.color}, but not found in your inventory.`);
          }
        }
      }
    } catch (err: any) {
      setError("Identification failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  }, [shoes, onMatchFound, onClose, isOnline]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Visual Search</h2>
            <p className="text-slate-500 text-sm">Point camera at a shoe to find it</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="relative aspect-video bg-slate-900">
          <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover ${!isOnline ? 'grayscale opacity-50' : ''}`} />
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute inset-0 pointer-events-none border-[40px] border-slate-900/20">
            <div className="w-full h-full border-2 border-white/50 border-dashed rounded-3xl" />
          </div>

          {isProcessing && (
            <div className="absolute inset-0 bg-indigo-600/40 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mb-4" />
                <span className="text-white font-black tracking-widest uppercase text-xs">Matching with Inventory...</span>
              </div>
            </div>
          )}

          {!isOnline && (
            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center p-8 text-center">
               <div className="max-w-xs">
                 <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                   <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                   </svg>
                 </div>
                 <p className="text-white font-black uppercase text-xs tracking-widest mb-2">Cloud Connectivity Lost</p>
                 <p className="text-slate-400 text-[10px] font-bold">Visual search is unavailable in offline mode. Use the text search bar in the gallery.</p>
               </div>
            </div>
          )}
        </div>

        <div className="p-8">
          {error && !(!isOnline) && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-bold border border-red-100 flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            onClick={handleScan}
            disabled={isProcessing || !isOnline}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>{!isOnline ? 'Go Online to Scan' : 'Scan to Find Product'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraSearchModal;
