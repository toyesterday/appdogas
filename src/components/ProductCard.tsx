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
      {product.promotion && (
        <Badge variant="destructive" className="absolute top-3 left-3">{product.promotion}</Badge>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => toggleFavorite(product.id)}
        className="absolute top-2 right-2 h-8 w-8 rounded-full"
      >
        <Heart className={`w-5 h-5 ${favorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      </Button>
      
      <CardContent className="p-4">
        <div className="flex items-start space-x-4 mt-6">
          <div className="text-4xl">{product.image}</div>
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