import { useState } from 'react';
import { MapPin, Clock, Phone, Search, Filter } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { products as allProducts } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Index = () => {
  const { userAddress, setUserAddress } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const brands = ['all', ...Array.from(new Set(allProducts.map(p => p.brand)))];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4" />
          <Input
            type="text"
            placeholder="Digite seu endereço completo..."
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
            className="flex-1 bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/70 focus:outline-none focus:bg-white/30"
          />
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>Entrega em 45 min</span>
          </div>
          <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4" />
            <span>Suporte 24h</span>
          </div>
        </div>
      </div>

      <div className="p-4 bg-white border-b">
        <div className="flex space-x-2 mb-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-5 h-5 text-gray-600" />
          </Button>
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {brands.map((brand: string) => (
            <Button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              variant={selectedBrand === brand ? 'default' : 'secondary'}
              className="rounded-full whitespace-nowrap"
            >
              {brand === 'all' ? 'Todos' : brand}
            </Button>
          ))}
        </div>
      </div>

      <div className="bg-yellow-100 border border-yellow-300 p-4 m-4 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">🎉</span>
          <div>
            <p className="font-semibold text-yellow-800">Promoção especial!</p>
            <p className="text-sm text-yellow-700">Frete grátis para pedidos acima de R$ 80,00</p>
          </div>
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Produtos disponíveis</h2>
        <div className="grid gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-8">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Nenhum produto encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;