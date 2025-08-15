import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Skeleton } from '@/components/ui/skeleton';

interface DepotManagerGuardProps {
  children: ReactNode;
}

const DepotManagerGuard = ({ children }: DepotManagerGuardProps) => {
  const { profile, loading } = useApp();

  if (loading) {
    return (
      <div className="p-4">
        <Skeleton className="h-screen w-full" />
      </div>
    );
  }

  if (profile?.role !== 'depot_manager') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default DepotManagerGuard;