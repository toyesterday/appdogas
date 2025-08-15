import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useDepot } from '@/context/DepotContext';
import { Product } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const FavoritesPage = () => {
  const { favorites } = useApp();
  const { depot } = useDepot();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!depot.id) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('depot_id', depot.id);

      if (error) {
        console.error('Error fetching products:', error);
        setError('Não foi possível carregar os produtos.');
      } else {
        setAllProducts(data as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [depot.id]);

  const favoriteProducts = allProducts.filter(product => favorites.includes(product.id));

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500"><p>{error}</p></div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {favoriteProducts.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">Você ainda não favoritou nenhum produto.</p>
          <p className="text-sm text-gray-500 mb-4">Clique no coração dos produtos para adicioná-los aqui.</p>
          <Button asChild>
            <Link to={`/${depot.slug}/dashboard`}>Ver Produtos</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {favoriteProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;