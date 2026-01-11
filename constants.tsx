
import { Shoe, SaleRecord } from './types';

export const INITIAL_SHOES: Shoe[] = [
  {
    id: '1',
    name: 'Air Max Pulse',
    brand: 'Nike',
    wholesalePrice: 8500,
    retailerPrice: 12500,
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=600',
    description: 'Iconic street style meets high-performance comfort.',
    variants: [
      { color: 'Red/Black', size: '42', stock: 12 },
      { color: 'Red/Black', size: '43', stock: 8 },
      { color: 'White/Cyan', size: '42', stock: 5 },
    ]
  },
  {
    id: '2',
    name: 'UltraBoost 22',
    brand: 'Adidas',
    wholesalePrice: 11000,
    retailerPrice: 15990,
    imageUrl: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=600',
    description: 'Responsive cushioning for the ultimate running experience.',
    variants: [
      { color: 'Black', size: '41', stock: 15 },
      { color: 'Grey', size: '42', stock: 10 },
    ]
  },
  {
    id: '3',
    name: 'Cloudflow 4',
    brand: 'On',
    wholesalePrice: 9500,
    retailerPrice: 13500,
    imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=600',
    description: 'Lightweight performance with superior grip.',
    variants: [
      { color: 'Navy', size: '44', stock: 7 },
      { color: 'Orange', size: '42', stock: 4 },
    ]
  }
];

export const INITIAL_SALES: SaleRecord[] = [
  {
    id: 's1',
    shoeId: '1',
    shoeName: 'Air Max Pulse',
    variant: { color: 'Red/Black', size: '42', stock: 0 },
    quantity: 1,
    totalPrice: 12500,
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 's2',
    shoeId: '2',
    shoeName: 'UltraBoost 22',
    variant: { color: 'Black', size: '41', stock: 0 },
    quantity: 1,
    totalPrice: 15990,
    timestamp: Date.now() - 3600000 * 5,
  }
];
