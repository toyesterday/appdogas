import { Star, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, toggleFavorite, isFavorite } = useApp();
  const favorite = isFavorite(product.id);

  return (
    <Card className="overflow-hidden relative">
      <div className="absolute top-3 left-3 flex flex-col space-y-1 z-10">
        {product.featured && (
          <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400">
            <Star className="w-3 h-3 mr-1" /> Destaque
          </Badge>
        )}
        {product.promotion && (
          <Badge variant="destructive">{product.promotion}</Badge>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleFavorite(product.id)}
        className="absolute top-2 right-2 h-8 w-8 rounded-full z-10"
      >
        <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      </Button>
      
      <CardContent className="p-4">
        <div className="flex items-start space-x-4">
          <div className="w-20 h-20 flex-shrink-0 flex items-center justify-center">
            {product.image && product.image.startsWith('/') ? (
              <img src={product.image} alt={product.name} className="max-w-full max-h-full object-contain" />
            ) : (
              <span className="text-4xl">{product.image}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600 text-sm mb-2">{product.description}</p>
            <div className="flex items-center space-x-1 mb-2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-gray-600">{product.rating} ({product.reviews} avaliações)</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                {product.originalPrice && (
                  <span className="text-sm text-gray-500 line-through mr-2">
                    R$ {product.originalPrice.toFixed(2).replace('.', ',')}
                  </span>
                )}
                <span className="text-2xl font-bold text-red-600">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <Button onClick={() => addToCart(product)}>
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;