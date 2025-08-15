import { useEffect, useState } from 'react';
import { useParams, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Depot } from '@/types';
import { DepotProvider } from '@/context/DepotContext';
import NotFound from '@/pages/NotFound';
import { Skeleton } from '@/components/ui/skeleton';

const DepotLayout = () => {
  const { depotSlug } = useParams<{ depotSlug: string }>();
  const [depot, setDepot] = useState<Depot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchDepot = async () => {
      if (!depotSlug) {
        setError(true);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(false);
      const { data, error } = await supabase
        .from('depots')
        .select('*')
        .eq('slug', depotSlug)
        .single();

      if (error || !data) {
        setError(true);
      } else {
        setDepot(data);
      }
      setLoading(false);
    };

    fetchDepot();
  }, [depotSlug]);

  if (loading) {
    return (
      <div className="p-4 max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="pt-16 pb-24">
          <Skeleton className="h-24 w-full mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  if (error || !depot) {
    return <NotFound />;
  }

  return (
    <DepotProvider depot={depot}>
      <Outlet />
    </DepotProvider>
  );
};

export default DepotLayout;