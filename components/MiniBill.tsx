
import React, { useState } from 'react';
import { SaleRecord, CompanyInfo } from '../types';
import { PrinterService } from '../services/printerService';

interface MiniBillProps {
  sale: SaleRecord;
  company: CompanyInfo;
  currencySymbol: string;
  onClose: () => void;
}

const MiniBill: React.FC<MiniBillProps> = ({ sale, company, currencySymbol, onClose }) => {
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const handleSystemPrint = () => {
    window.print();
  };

  const handleDirectPrint = async (type: 'BT' | 'USB') => {
    try {
      setPrintStatus(`Connecting to ${type}...`);
      if (type === 'BT') await PrinterService.connectBluetooth();
      else await PrinterService.connectUSB();
      
      const commands = PrinterService.generateEscPos(sale, company, currencySymbol);
      await PrinterService.printRaw(commands);
      setPrintStatus('Print Successful');
      setTimeout(() => setPrintStatus(null), 2000);
    } catch (err: any) {
      setPrintStatus(`Error: ${err.message}`);
      setTimeout(() => setPrintStatus(null), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300 print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in duration-300 print:shadow-none print:rounded-none print:max-w-none print:w-full">
        
        {/* Receipt Body */}
        <div id="receipt-content" className="p-8 space-y-6 text-slate-800">
          <div className="text-center space-y-2 border-b border-dashed border-slate-200 pb-6">
            {company.logo ? (
              <img src={company.logo} alt="Logo" className="w-16 h-16 mx-auto rounded-full mb-2 object-cover" />
            ) : (
              <div className="w-12 h-12 bg-indigo-600 rounded-full mx-auto flex items-center justify-center text-white mb-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            )}
            <h2 className="text-xl font-black uppercase tracking-tight">{company.name || 'SoleTrack Store'}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase leading-tight whitespace-pre-line">
              {company.address || 'Business Hub, Sector 12\nMain Street, Digital City'}
            </p>
            <p className="text-[10px] font-black text-indigo-600">{company.phone || '+91 000 000 0000'}</p>
          </div>

          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
            <span>Bill ID: #{sale.id.slice(-6)}</span>
            <span>{new Date(sale.timestamp).toLocaleString()}</span>
          </div>

          <div className="space-y-4 py-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-black text-sm">{sale.shoeName}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Color: {sale.variant.color} • Size: {sale.variant.size}
                </p>
              </div>
              <p className="font-black">{currencySymbol}{sale.totalPrice.toLocaleString()}</p>
            </div>
            
            <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>Qty: {sale.quantity} Unit(s)</span>
              <span>{currencySymbol}{sale.totalPrice.toLocaleString()} / unit</span>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-200 pt-4 space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span>Subtotal</span>
              <span>{currencySymbol}{sale.totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-black pt-2 border-t border-slate-100">
              <span>Grand Total</span>
              <span className="text-indigo-600">{currencySymbol}{sale.totalPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="text-center space-y-4 pt-6">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Thank you for shopping!
            </p>
          </div>
        </div>

        {/* Status Message */}
        {printStatus && (
          <div className="px-8 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase text-center animate-pulse">
            {printStatus}
          </div>
        )}

        {/* Actions - Hidden when printing */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 space-y-3 print:hidden">
          <button
            onClick={handleSystemPrint}
            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Xerox (System Print)</span>
          </button>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDirectPrint('BT')}
              className="py-3 bg-white border-2 border-indigo-600 text-indigo-600 font-black rounded-xl text-xs flex items-center justify-center space-x-2 hover:bg-indigo-50"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.88 16.29l-4.59-4.59 4.59-4.59 1.41 1.41-3.17 3.18 3.17 3.18-1.41 1.41zM7 12l4.59 4.59 1.41-1.41-3.17-3.18 3.17-3.18-1.41-1.41L7 12z" />
              </svg>
              <span>Bluetooth</span>
            </button>
            <button
              onClick={() => handleDirectPrint('USB')}
              className="py-3 bg-white border-2 border-slate-900 text-slate-900 font-black rounded-xl text-xs flex items-center justify-center space-x-2 hover:bg-slate-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>USB Raw</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 text-slate-400 font-black rounded-2xl border border-slate-200 hover:bg-slate-100 active:scale-95 transition-all text-sm uppercase"
          >
            Finish Transaction
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #receipt-content, #receipt-content * { visibility: visible; }
          #receipt-content { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 20px; }
        }
      `}</style>
    </div>
  );
};

export default MiniBill;
