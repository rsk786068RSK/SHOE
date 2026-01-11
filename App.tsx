
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import Layout from './components/Layout';
import InventoryGallery from './components/InventoryGallery';
import ShoeDetail from './components/ShoeDetail';
import Reports from './components/Reports';
import SettingsPanel from './components/SettingsPanel';
import AiBilling from './components/AiBilling';
import MiniBill from './components/MiniBill';
import { Shoe, SaleRecord, AppSettings, AppView, ShoeVariant } from './types';
import { INITIAL_SHOES, INITIAL_SALES } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('gallery');
  const [shoes, setShoes] = useState<Shoe[]>(INITIAL_SHOES);
  const [sales, setSales] = useState<SaleRecord[]>(INITIAL_SALES);
  const [selectedShoe, setSelectedShoe] = useState<Shoe | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<SaleRecord | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    aiBillingEnabled: true,
    currency: 'INR',
    company: {
      name: 'SoleTrack Elite Footwear',
      address: 'Shop No. 42, Galleria Market, New Delhi',
      phone: '+91 98765 43210'
    }
  });

  const currencySymbol = useMemo(() => {
    switch (settings.currency) {
      case 'INR': return '₹';
      case 'EUR': return '€';
      case 'GBP': return '£';
      default: return '$';
    }
  }, [settings.currency]);

  useEffect(() => {
    const savedShoes = localStorage.getItem('shoes');
    const savedSales = localStorage.getItem('sales');
    const savedSettings = localStorage.getItem('app-settings');
    if (savedShoes) setShoes(JSON.parse(savedShoes));
    if (savedSales) setSales(JSON.parse(savedSales));
    if (savedSettings) setSettings(JSON.parse(savedSettings));
  }, []);

  useEffect(() => {
    localStorage.setItem('shoes', JSON.stringify(shoes));
  }, [shoes]);

  useEffect(() => {
    localStorage.setItem('sales', JSON.stringify(sales));
  }, [sales]);

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
  }, [settings]);

  const handleUpdateStock = useCallback((shoeId: string, variantIndex: number, newStock: number) => {
    setShoes(prevShoes => prevShoes.map(shoe => {
      if (shoe.id === shoeId) {
        const updatedVariants = [...shoe.variants];
        updatedVariants[variantIndex] = { ...updatedVariants[variantIndex], stock: newStock };
        return { ...shoe, variants: updatedVariants };
      }
      return shoe;
    }));
  }, []);

  const handleAddVariant = useCallback((shoeId: string, variant: ShoeVariant) => {
    setShoes(prevShoes => prevShoes.map(shoe => {
      if (shoe.id === shoeId) {
        return { ...shoe, variants: [...shoe.variants, variant] };
      }
      return shoe;
    }));
  }, []);

  const handleSale = useCallback((shoe: Shoe, variant: ShoeVariant, quantity: number) => {
    const sale: SaleRecord = {
      id: Date.now().toString(),
      shoeId: shoe.id,
      shoeName: shoe.name,
      variant,
      quantity,
      totalPrice: shoe.retailerPrice * quantity,
      timestamp: Date.now()
    };

    setSales(prev => [...prev, sale]);
    const variantIndex = shoe.variants.findIndex(v => v.color === variant.color && v.size === variant.size);
    if (variantIndex !== -1) {
      handleUpdateStock(shoe.id, variantIndex, variant.stock - quantity);
    }
    setSelectedShoe(null);
    setActiveReceipt(sale);
  }, [handleUpdateStock]);

  const handleCompleteAiSale = useCallback((sale: SaleRecord) => {
    setSales(prev => [...prev, sale]);
    setActiveReceipt(sale);
  }, []);

  const handleAddShoe = useCallback((shoe: Shoe) => {
    setShoes(prev => [...prev, shoe]);
  }, []);

  const handleDeleteShoe = useCallback((id: string) => {
    setShoes(prev => prev.filter(s => s.id !== id));
  }, []);

  return (
    <Layout activeView={activeView} setView={setActiveView}>
      {activeView === 'gallery' && (
        <InventoryGallery shoes={shoes} onSelectShoe={setSelectedShoe} currencySymbol={currencySymbol} />
      )}
      {activeView === 'billing' && (
        <AiBilling isEnabled={settings.aiBillingEnabled} onCompleteSale={handleCompleteAiSale} currencySymbol={currencySymbol} />
      )}
      {activeView === 'reports' && (
        <Reports sales={sales} currencySymbol={currencySymbol} />
      )}
      {activeView === 'settings' && (
        <SettingsPanel 
          shoes={shoes} 
          onAddShoe={handleAddShoe} 
          onDeleteShoe={handleDeleteShoe} 
          settings={settings} 
          onUpdateSettings={setSettings} 
          currencySymbol={currencySymbol} 
        />
      )}
      
      {selectedShoe && (
        <ShoeDetail 
          shoe={shoes.find(s => s.id === selectedShoe.id) || selectedShoe}
          onClose={() => setSelectedShoe(null)}
          onUpdateStock={handleUpdateStock}
          onAddVariant={handleAddVariant}
          onSell={handleSale}
          currencySymbol={currencySymbol}
        />
      )}

      {activeReceipt && (
        <MiniBill 
          sale={activeReceipt} 
          company={settings.company} 
          currencySymbol={currencySymbol} 
          onClose={() => setActiveReceipt(null)} 
        />
      )}
    </Layout>
  );
};

export default App;
