import { Product } from '@/types';

export const products: Product[] = [
  {
    id: 1,
    name: 'Botijão P13 - Ultragaz',
    price: 89.90,
    originalPrice: 99.90,
    image: '🔥',
    description: '13kg - Entrega em até 45 minutos',
    brand: 'Ultragaz',
    rating: 4.8,
    reviews: 230,
    promotion: '10% OFF'
  },
  {
    id: 2,
    name: 'Botijão P13 - Liquigás',
    price: 87.50,
    image: '🔥',
    description: '13kg - Entrega em até 45 minutos',
    brand: 'Liquigás',
    rating: 4.6,
    reviews: 189,
    promotion: null
  },
  {
    id: 3,
    name: 'Botijão P13 - Copagaz',
    price: 85.90,
    originalPrice: 92.90,
    image: '🔥',
    description: '13kg - Entrega em até 45 minutos',
    brand: 'Copagaz',
    rating: 4.7,
    reviews: 156,
    promotion: '7% OFF'
  },
  {
    id: 4,
    name: 'Botijão P45 - Ultragaz',
    price: 189.90,
    image: '🔥',
    description: '45kg - Para estabelecimentos',
    brand: 'Ultragaz',
    rating: 4.9,
    reviews: 78,
    promotion: null
  },
  {
    id: 5,
    name: 'Kit Mangueira + Regulador',
    price: 45.90,
    image: '🔧',
    description: 'Kit completo de segurança',
    brand: 'Acessórios',
    rating: 4.5,
    reviews: 95,
    promotion: null
  },
  {
    id: 6,
    name: 'Botijão P5 - Portátil',
    price: 39.90,
    image: '🔥',
    description: '5kg - Ideal para camping',
    brand: 'Ultragaz',
    rating: 4.4,
    reviews: 67,
    promotion: null
  }
];