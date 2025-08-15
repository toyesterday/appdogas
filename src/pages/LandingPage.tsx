import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold mb-4">🔥 GásExpress</h1>
      <p className="text-xl text-gray-600 mb-8">Seu gás, rápido e fácil.</p>
      <Button asChild size="lg">
        <Link to="/depots">Ver Depósitos</Link>
      </Button>
    </div>
  );
};
export default LandingPage;