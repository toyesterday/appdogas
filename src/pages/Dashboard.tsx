import { useState, useEffect } from 'react';
import { MapPin, Clock, Phone, Search, Filter, Star } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDepot } from '@/context/DepotContext';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { profile, updateProfile, appSettings } = useApp();
  const { depot } = useDepot();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [localAddress, setLocalAddress] = useState(profile?.address || '');

  useEffect(() => {
    if (profile?.address) {
      setLocalAddress(profile.address);
    }
  }, [profile]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!depot.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('depot_id', depot.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        setError('Não foi possível carregar os produtos. Tente novamente mais tarde.');
      } else {
        setAllProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [depot.id]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalAddress(e.target.value);
  };

  const handleAddressBlur = () => {
    if (localAddress !== profile?.address) {
      updateProfile({ address: localAddress });
    }
  };

  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (product.brand || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesBrand = selectedBrand === 'all' || product.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const featuredProducts = filteredProducts.filter(p => p.featured);
  const regularProducts = filteredProducts.filter(p => !p.featured);

  const brands = ['all', ...Array.from(new Set(allProducts.map(p => p.brand).filter(Boolean) as string[]))];

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg">
          <Skeleton className="h-10 w-full bg-white/20" />
        </div>
        <div className="p-4 bg-white border-b">
          <Skeleton className="h-10 w-full mb-3" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-28 rounded-full" />
          </div>
        </div>
        <div className="grid gap-4 p-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
        <div className="flex items-center space-x-2 mb-2">
          <MapPin className="w-4 h-4" />
          <Input
            type="text"
            placeholder="Digite seu endereço completo..."
            value={localAddress}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
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

      {featuredProducts.length > 0 && (
        <div className="p-4">
          <h2 className="text-lg font-bold mb-4 flex items-center">
            <Star className="w-5 h-5 mr-2 text-yellow-500" />
            Destaques
          </h2>
          <div className="grid gap-4">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {appSettings?.free_shipping_banner_text && (
        <div className="bg-yellow-100 border border-yellow-300 p-4 m-4 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🎉</span>
            <div>
              <p className="font-semibold text-yellow-800">Promoção especial!</p>
              <p className="text-sm text-yellow-700">{appSettings.free_shipping_banner_text}</p>
            </div>
          </div>
        </div>
      )}

      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">Produtos disponíveis</h2>
        <div className="grid gap-4">
          {regularProducts.map(product => (
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

export default Dashboard;