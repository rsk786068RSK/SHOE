
import React, { useState, useMemo } from 'react';
import { Shoe, ShoeVariant } from '../types';
import CameraSearchModal from './CameraSearchModal';

interface InventoryGalleryProps {
  shoes: Shoe[];
  onSelectShoe: (shoe: Shoe) => void;
  currencySymbol: string;
  isOnline: boolean;
}

const InventoryGallery: React.FC<InventoryGalleryProps> = ({ shoes, onSelectShoe, currencySymbol, isOnline }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCameraSearchOpen, setIsCameraSearchOpen] = useState(false);

  const filteredShoes = shoes.filter(shoe => 
    shoe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shoe.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const businessSummary = useMemo(() => {
    let totalStock = 0;
    let inventoryValue = 0;
    shoes.forEach(s => {
      const shoeStock = s.variants.reduce((acc, v) => acc + v.stock, 0);
      totalStock += shoeStock;
      inventoryValue += shoeStock * s.retailerPrice;
    });
    return { totalStock, inventoryValue };
  }, [shoes]);

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-700">
      {/* Dashboard Summary Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 text-white p-6 rounded-[2rem] shadow-xl border border-white/10">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Designs</p>
          <p className="text-3xl font-black">{shoes.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Stock</p>
          <p className="text-3xl font-black text-slate-900">{businessSummary.totalStock.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Potential Value</p>
          <p className="text-3xl font-black text-indigo-600">{currencySymbol}{businessSummary.inventoryValue.toLocaleString()}</p>
        </div>
        <div className="bg-indigo-600 text-white p-6 rounded-[2rem] shadow-xl">
          <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Sync Status</p>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-amber-400 animate-pulse'}`} />
            <p className="text-xl font-black">{isOnline ? 'Live Mode' : 'Local Mode'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Main Gallery</h2>
          <p className="text-slate-500 font-medium">Manage your product matrix and variants</p>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-[400px]">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by model or brand..."
              className="block w-full pl-12 pr-4 py-4 border-none rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-slate-900 font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <button 
            onClick={() => setIsCameraSearchOpen(true)}
            className="p-4 bg-slate-900 text-white rounded-[1.2rem] shadow-lg hover:bg-indigo-600 transition-all active:scale-90 flex-shrink-0"
            title="Search by Camera"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>

      {filteredShoes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <p className="text-slate-400 font-bold">Inventory empty or no matches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredShoes.map((shoe) => {
            const totalStock = shoe.variants.reduce((acc, v) => acc + v.stock, 0);
            
            // Organize variants efficiently for the card UI
            const variantsByColor: Record<string, ShoeVariant[]> = {};
            shoe.variants.forEach(v => {
              if (v.color.trim()) {
                if (!variantsByColor[v.color]) variantsByColor[v.color] = [];
                variantsByColor[v.color].push(v);
              }
            });

            return (
              <div 
                key={shoe.id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer flex flex-col relative active:scale-[0.98]"
                onClick={() => onSelectShoe(shoe)}
              >
                <div className="relative h-60 overflow-hidden">
                  <img 
                    src={shoe.imageUrl} 
                    alt={shoe.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  <div className="absolute inset-0 bg-indigo-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-md text-slate-900 px-6 py-3 rounded-full font-black text-xs shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 uppercase tracking-widest">
                      Edit Matrix
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col items-end space-y-1 z-10">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-xl border border-white/20">
                      {currencySymbol}{shoe.retailerPrice.toLocaleString()}
                    </div>
                  </div>

                  {totalStock === 0 && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center z-10">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl">Restock Required</span>
                    </div>
                  )}
                </div>
                
                <div className="p-7 flex flex-col flex-1 bg-white">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                        {shoe.brand}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      {shoe.name}
                    </h3>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[140px] pr-2 no-scrollbar">
                    {Object.entries(variantsByColor).slice(0, 3).map(([color, variants]) => (
                      <div key={color} className="space-y-1.5">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                          {color}
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {variants.map((v, i) => (
                            <div key={i} className={`px-2 py-1 rounded-lg text-[9px] font-black border ${v.stock > 0 ? 'bg-slate-50 border-slate-100 text-slate-600' : 'bg-red-50 border-red-100 text-red-400 opacity-50'}`}>
                              S:{v.size}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {Object.keys(variantsByColor).length > 3 && (
                      <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest pt-1">
                        + {Object.keys(variantsByColor).length - 3} more colors...
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Available</span>
                      <span className={`text-sm font-black ${totalStock > 0 ? 'text-slate-900' : 'text-red-500'}`}>
                        {totalStock} Pair{totalStock !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-slate-50 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CameraSearchModal 
        isOpen={isCameraSearchOpen} 
        onClose={() => setIsCameraSearchOpen(false)} 
        shoes={shoes} 
        onMatchFound={onSelectShoe} 
        isOnline={isOnline}
      />
    </div>
  );
};

export default InventoryGallery;
