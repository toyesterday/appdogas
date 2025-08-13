import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Depot } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, MapPin } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

const DepotSelectionPage = () => {
  const [depots, setDepots] = useState<Depot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepots = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('depots').select('*').order('name');
      if (error) {
        console.error('Error fetching depots:', error);
      } else {
        setDepots(data);
      }
      setLoading(false);
    };
    fetchDepots();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-red-600">
            🔥 AppdoGás
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-6 py-12">
        <AnimatedSection className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Selecione um Depósito</h1>
          <p className="mt-3 text-lg text-gray-600">Escolha a unidade mais próxima de você para começar a comprar.</p>
        </AnimatedSection>

        {loading ? (
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : (
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {depots.map((depot, index) => (
              <AnimatedSection key={depot.id} delay={`${index * 100}ms`}>
                <Link to={`/${depot.slug}/dashboard`}>
                  <Card className="h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
                    <CardHeader className="flex-grow">
                      <CardTitle className="flex items-center space-x-3">
                        {depot.logo_url ? (
                          <img src={depot.logo_url} alt={`${depot.name} logo`} className="w-10 h-10 object-contain rounded-md" />
                        ) : (
                          <div className="w-10 h-10 flex items-center justify-center bg-gray-100 rounded-md">
                            <Building className="w-6 h-6 text-red-600" />
                          </div>
                        )}
                        <span className="text-xl">{depot.name}</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{depot.address || 'Endereço não informado'}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DepotSelectionPage;