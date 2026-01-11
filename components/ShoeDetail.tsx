
import React, { useState } from 'react';
import { Shoe, ShoeVariant } from '../types';

interface ShoeDetailProps {
  shoe: Shoe;
  onClose: () => void;
  onUpdateStock: (shoeId: string, variantIndex: number, newStock: number) => void;
  onAddVariant: (shoeId: string, variant: ShoeVariant) => void;
  onSell: (shoe: Shoe, variant: ShoeVariant, quantity: number) => void;
  currencySymbol: string;
}

const ShoeDetail: React.FC<ShoeDetailProps> = ({ shoe, onClose, onUpdateStock, onAddVariant, onSell, currencySymbol }) => {
  const [sellQuantity, setSellQuantity] = useState(1);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [showAddVariant, setShowAddVariant] = useState(false);
  const [newVariant, setNewVariant] = useState<ShoeVariant>({ color: '', size: '', stock: 10 });

  const selectedVariant = shoe.variants[selectedVariantIndex];
  const totalStock = shoe.variants.reduce((acc, v) => acc + v.stock, 0);

  const handleSell = () => {
    if (selectedVariant && selectedVariant.stock >= sellQuantity) {
      onSell(shoe, selectedVariant, sellQuantity);
      setSellQuantity(1);
    }
  };

  const handleAddVariantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newVariant.color && newVariant.size) {
      onAddVariant(shoe.id, newVariant);
      setNewVariant({ color: '', size: '', stock: 10 });
      setShowAddVariant(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl flex flex-col md:flex-row animate-in zoom-in duration-300 max-h-[95vh]">
        
        {/* Left Side: Product Image & Quick Info */}
        <div className="md:w-5/12 relative bg-slate-50 h-72 md:h-auto overflow-hidden">
          <img 
            src={shoe.imageUrl} 
            alt={shoe.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
          
          <button 
            onClick={onClose}
            className="absolute top-8 left-8 p-3 bg-white/90 hover:bg-white rounded-full transition-all shadow-xl active:scale-90 z-20"
          >
            <svg className="w-6 h-6 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="absolute bottom-10 left-10 right-10 z-10 text-white">
            <span className="text-indigo-400 font-black tracking-[0.2em] text-[10px] uppercase bg-white/10 backdrop-blur-md px-3 py-1 rounded-full mb-3 inline-block">
              {shoe.brand}
            </span>
            <h2 className="text-3xl font-black leading-tight drop-shadow-md">{shoe.name}</h2>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">Stock Status</span>
                <span className={`text-xs font-black uppercase ${totalStock > 10 ? 'text-green-400' : totalStock > 0 ? 'text-amber-400' : 'text-red-400'}`}>
                  {totalStock > 10 ? 'Healthy' : totalStock > 0 ? 'Low Stock' : 'Sold Out'}
                </span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${totalStock > 10 ? 'bg-green-400' : totalStock > 0 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${Math.min(100, (totalStock / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Product Control Center */}
        <div className="md:w-7/12 p-8 md:p-12 flex flex-col overflow-y-auto bg-white custom-scrollbar">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Detailed Control</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-md">{shoe.description}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1">Selling Price</span>
              <span className="text-4xl font-black text-slate-900 tracking-tighter">{currencySymbol}{shoe.retailerPrice.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-10">
            {/* Price Breakdown */}
            <div className="grid grid-cols-2 gap-6">
               <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Business Cost</span>
                  <span className="text-2xl font-black text-slate-900">{currencySymbol}{shoe.wholesalePrice.toLocaleString()}</span>
                  <div className="text-[10px] text-slate-400 mt-2 font-bold italic">Source: Verified Vendor</div>
               </div>
               <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100 flex flex-col justify-between">
                  <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-4">Net Margin</span>
                  <span className="text-2xl font-black text-indigo-700">+{currencySymbol}{(shoe.retailerPrice - shoe.wholesalePrice).toLocaleString()}</span>
                  <div className="text-[10px] text-indigo-400 mt-2 font-bold italic">Profit per unit sold</div>
               </div>
            </div>

            {/* Variant Control */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <label className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center">
                  <svg className="w-4 h-4 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Available Variants
                </label>
                <button 
                  onClick={() => setShowAddVariant(!showAddVariant)}
                  className={`text-[10px] font-black px-4 py-2 rounded-full transition-all uppercase tracking-widest ${
                    showAddVariant 
                      ? 'bg-slate-900 text-white' 
                      : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  {showAddVariant ? 'Cancel' : '+ Add New'}
                </button>
              </div>

              {showAddVariant ? (
                <form onSubmit={handleAddVariantSubmit} className="bg-slate-50 p-8 rounded-[2rem] border-2 border-dashed border-indigo-200 space-y-6 animate-in slide-in-from-top-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Color Name</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Midnight Blue"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={newVariant.color}
                        onChange={e => setNewVariant({...newVariant, color: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Size (EU/US)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 44"
                        className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={newVariant.size}
                        onChange={e => setNewVariant({...newVariant, size: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Initial Stock Count</label>
                    <input 
                      type="number" 
                      placeholder="Units"
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      value={newVariant.stock}
                      onChange={e => setNewVariant({...newVariant, stock: parseInt(e.target.value)})}
                    />
                  </div>
                  <button type="submit" className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl shadow-indigo-100 active:scale-95 transition-all">
                    Update Registry
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {shoe.variants.map((v, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`p-5 text-left rounded-3xl border-2 transition-all relative ${
                        selectedVariantIndex === idx 
                          ? 'border-indigo-600 bg-indigo-50 shadow-lg ring-4 ring-indigo-50' 
                          : 'border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      {v.stock <= 2 && v.stock > 0 && (
                        <div className="absolute -top-2 -right-2 w-5 h-5 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
                      )}
                      <div className="font-black text-slate-900 leading-tight text-sm truncate">{v.color}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                        Size {v.size} • <span className={v.stock > 0 ? 'text-indigo-600' : 'text-red-400'}>{v.stock} left</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sale Console */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Active Checkout Console</span>
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-green-500 uppercase">System Ready</span>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-center gap-8 mb-10">
                  <div className="w-full md:w-1/2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Quantity to Process</label>
                    <div className="flex items-center bg-white/5 backdrop-blur-md rounded-3xl p-2 border border-white/10">
                      <button 
                        onClick={() => setSellQuantity(q => Math.max(1, q - 1))}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors bg-white/5 rounded-2xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M20 12H4" />
                        </svg>
                      </button>
                      <input 
                        type="number" 
                        className="w-full bg-transparent text-center font-black text-2xl focus:outline-none"
                        value={sellQuantity}
                        readOnly
                      />
                      <button 
                        onClick={() => setSellQuantity(q => q + 1)}
                        className="w-12 h-12 flex items-center justify-center text-slate-400 hover:text-white transition-colors bg-white/5 rounded-2xl"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="w-full md:w-1/2">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Final Calculation</label>
                    <div className="text-4xl font-black text-indigo-400 tracking-tighter">
                      {currencySymbol}{(shoe.retailerPrice * sellQuantity).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSell}
                  disabled={!selectedVariant || selectedVariant.stock < sellQuantity}
                  className={`w-full py-6 rounded-3xl font-black text-xl transition-all shadow-2xl flex items-center justify-center space-x-3 ${
                    selectedVariant && selectedVariant.stock >= sellQuantity
                      ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-indigo-500/30 active:scale-95'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{selectedVariant && selectedVariant.stock >= sellQuantity 
                    ? 'Finalize Transaction' 
                    : 'Insufficient Stock'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-slate-50 flex items-center justify-between text-[10px] font-black text-slate-300 uppercase tracking-widest">
            <span>System ID: ST-{shoe.id}</span>
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => onUpdateStock(shoe.id, selectedVariantIndex, selectedVariant.stock - 1)}
                className="text-slate-400 hover:text-red-500 transition-colors uppercase"
              >
                Reduce Stock
              </button>
              <button 
                onClick={() => onUpdateStock(shoe.id, selectedVariantIndex, selectedVariant.stock + 1)}
                className="text-indigo-600 hover:text-indigo-800 transition-all uppercase"
              >
                Manual Restock
              </button>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f8fafc; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default ShoeDetail;
