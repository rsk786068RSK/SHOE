
export interface ShoeVariant {
  color: string;
  size: string;
  stock: number;
}

export interface Shoe {
  id: string;
  name: string;
  brand: string;
  wholesalePrice: number;
  retailerPrice: number;
  imageUrl: string;
  variants: ShoeVariant[];
  description: string;
}

export interface SaleRecord {
  id: string;
  shoeId: string;
  shoeName: string;
  variant: ShoeVariant;
  quantity: number;
  totalPrice: number;
  timestamp: number;
}

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  logo?: string;
}

export interface AppSettings {
  aiBillingEnabled: boolean;
  currency: string;
  company: CompanyInfo;
}

export type AppView = 'gallery' | 'reports' | 'settings' | 'billing';
