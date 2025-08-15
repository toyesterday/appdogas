import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const DepotSelectionPage = () => {
  // Dados de exemplo
  const depots = [
    { id: 1, name: 'Depósito Central', slug: 'deposito-central' },
    { id: 2, name: 'Depósito Bairro Novo', slug: 'deposito-bairro-novo' },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold mb-6">Selecione um Depósito</h1>
      <div className="w-full max-w-md space-y-4">
        {depots.map(depot => (
          <Link to={`/${depot.slug}/dashboard`} key={depot.id}>
            <Card className="hover:bg-gray-50">
              <CardHeader>
                <CardTitle>{depot.name}</CardTitle>
                <CardDescription>Clique para ver os produtos</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
export default DepotSelectionPage;