
import React, { useState } from 'react';
import { Shoe, ShoeVariant } from '../types';
import CameraSearchModal from './CameraSearchModal';

interface InventoryGalleryProps {
  shoes: Shoe[];
  onSelectShoe: (shoe: Shoe) => void;
  currencySymbol: string;
}

const InventoryGallery: React.FC<InventoryGalleryProps> = ({ shoes, onSelectShoe, currencySymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCameraSearchOpen, setIsCameraSearchOpen] = useState(false);

  const filteredShoes = shoes.filter(shoe => 
    shoe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shoe.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Shoe Collection</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time inventory separated by color and size</p>
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
            className="p-4 bg-indigo-600 text-white rounded-[1.2rem] shadow-lg hover:bg-indigo-700 transition-all active:scale-90 flex-shrink-0"
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
          <p className="text-slate-400 font-bold">No shoes found matching your search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredShoes.map((shoe) => {
            const totalStock = shoe.variants.reduce((acc, v) => acc + v.stock, 0);
            
            const variantsByColor: Record<string, ShoeVariant[]> = {};
            shoe.variants.forEach(v => {
              if (!variantsByColor[v.color]) variantsByColor[v.color] = [];
              variantsByColor[v.color].push(v);
            });

            return (
              <div 
                key={shoe.id} 
                className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 cursor-pointer flex flex-col relative active:scale-[0.98]"
                onClick={() => onSelectShoe(shoe)}
              >
                <div className="relative h-64 overflow-hidden">
                  <img 
                    src={shoe.imageUrl} 
                    alt={shoe.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="bg-white text-indigo-600 px-6 py-3 rounded-full font-black text-sm shadow-2xl transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 uppercase tracking-widest">
                      Manage Product
                    </div>
                  </div>

                  <div className="absolute top-5 right-5 flex flex-col items-end space-y-1 z-10">
                    <div className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-slate-900 shadow-xl border border-white/20">
                      <span className="text-indigo-600 mr-1">R:</span>{currencySymbol}{shoe.retailerPrice.toLocaleString()}
                    </div>
                    <div className="bg-slate-900/95 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-xl border border-white/10">
                      <span className="text-slate-400 mr-1">W:</span>{currencySymbol}{shoe.wholesalePrice.toLocaleString()}
                    </div>
                  </div>

                  {totalStock <= 5 && totalStock > 0 && (
                    <div className="absolute top-5 left-5 bg-amber-500 px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest shadow-lg z-10 animate-pulse">
                      Low Stock
                    </div>
                  )}
                  {totalStock === 0 && (
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <span className="bg-red-600 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em] shadow-2xl">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="p-7 flex flex-col flex-1 bg-white">
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">
                        {shoe.brand}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${totalStock > 10 ? 'bg-green-500' : totalStock > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                      {shoe.name}
                    </h3>
                  </div>

                  {/* Scrollable variants list for the 10-variant support */}
                  <div className="flex-1 space-y-5 overflow-y-auto max-h-[160px] pr-2 custom-scrollbar-thin">
                    {Object.entries(variantsByColor).map(([color, variants]) => (
                      <div key={color} className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                            {color}
                          </span>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        
                        <div className="grid grid-cols-3 gap-1.5">
                          {variants.sort((a, b) => parseFloat(a.size) - parseFloat(b.size)).map((v, i) => (
                            <div 
                              key={i} 
                              className={`flex flex-col items-center justify-center p-1.5 rounded-xl border transition-all ${
                                v.stock > 0 
                                  ? 'bg-slate-50 border-slate-100 text-slate-700' 
                                  : 'bg-slate-50/50 border-slate-50 text-slate-300 opacity-50'
                              }`}
                            >
                              <span className="text-[10px] font-black">S:{v.size}</span>
                              <span className={`text-[8px] font-bold ${v.stock > 0 ? 'text-indigo-500' : 'text-slate-200'}`}>
                                Q:{v.stock}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Stock</span>
                      <span className={`text-sm font-black ${totalStock > 10 ? 'text-green-600' : totalStock > 0 ? 'text-amber-600' : 'text-red-500'}`}>
                        {totalStock} Pair{totalStock !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="w-10 h-10 bg-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white rounded-full flex items-center justify-center transition-all duration-300">
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
      />

      <style>{`
        .custom-scrollbar-thin::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default InventoryGallery;
