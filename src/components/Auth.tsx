import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Skeleton } from './ui/skeleton';

interface AuthGuardProps {
  children: ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { session, loading } = useApp();

  if (loading) {
    return (
       <div className="p-4 max-w-4xl mx-auto space-y-4">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg h-24" />
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

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;