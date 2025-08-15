import { useEffect, useState } from 'react';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { User, MapPin, CreditCard, Star, Bell, Phone, LogOut, Edit, Check, Gift } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { LoyaltyProgram } from '@/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const LoyaltyCard = () => {
  const { session } = useApp();
  const [programs, setPrograms] = useState<LoyaltyProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrograms = async () => {
      if (!session?.user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('loyalty_programs')
        .select('*, products(name), depots(name)')
        .eq('user_id', session.user.id);
      
      if (error) console.error("Error fetching loyalty programs", error);
      else setPrograms(data as any);
      setLoading(false);
    };
    fetchPrograms();
  }, [session]);

  if (loading || programs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Gift className="w-5 h-5 mr-2 text-red-500" /> Programa de Fidelidade</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {programs.map(program => (
          <div key={program.id} className="p-3 border rounded-lg">
            <p className="font-semibold text-sm text-gray-500">Depósito {program.depots.name}</p>
            <div className="my-2">
              <div className="flex justify-between items-end mb-1">
                <p className="text-sm">Progresso:</p>
                <p className="font-bold">{program.current_purchases} / {program.target_purchases}</p>
              </div>
              <Progress value={(program.current_purchases / program.target_purchases) * 100} />
            </div>
            <p className="text-sm">
              Recompensa: <span className="font-semibold">{program.reward_discount_percentage}% OFF</span> em <span className="font-semibold">{program.products.name}</span>
            </p>
            {program.status === 'completed' && (
              <Badge className="mt-2">Recompensa Desbloqueada!</Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const ProfilePage = () => {
  const { orders, favorites, profile, session, signOut, updateProfile } = useApp();
  const { depotSlug } = useParams<{ depotSlug: string }>();
  const navigate = useNavigate();
  const [isEditingName, setIsEditingName] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');

  const menuItems = [
    { icon: MapPin, label: 'Meus Endereços', path: `/${depotSlug}/addresses`, disabled: false },
    { icon: CreditCard, label: 'Formas de Pagamento', path: '#', disabled: true },
    { icon: Star, label: 'Avaliar App', path: '#', disabled: true },
    { icon: Bell, label: 'Notificações', path: `/${depotSlug}/notifications`, disabled: false },
    { icon: Phone, label: 'Suporte', path: `/${depotSlug}/support`, disabled: false },
  ];

  const handleSaveName = async () => {
    if (fullName.trim() && fullName !== profile?.full_name) {
      await updateProfile({ full_name: fullName });
    }
    setIsEditingName(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <div className="flex-1">
              {isEditingName ? (
                <div className="flex items-center space-x-2">
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nome completo"
                  />
                  <Button size="icon" onClick={handleSaveName}><Check className="w-4 h-4" /></Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold">{profile?.full_name || 'Usuário'}</h2>
                  <Button variant="ghost" size="icon" onClick={() => setIsEditingName(true)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              )}
              <p className="text-gray-600">{session?.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <LoyaltyCard />

      <Card>
        <CardContent className="p-4">
          {menuItems.map((item, index) => {
            const itemContent = (
              <div className={`flex items-center justify-between py-3 ${index < menuItems.length - 1 ? 'border-b' : ''}`}>
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span>{item.label}</span>
                </div>
                <span className="text-gray-400">›</span>
              </div>
            );

            if (item.disabled) {
              return (
                <div key={item.label} className="opacity-50 cursor-not-allowed">
                  {itemContent}
                </div>
              );
            }

            return (
              <Link to={item.path} key={item.label} className="block hover:bg-gray-50">
                {itemContent}
              </Link>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-red-600">{orders.length}</div>
            <div className="text-sm text-gray-600">Pedidos</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">R$ {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2).replace('.', ',')}</div>
            <div className="text-sm text-gray-600">Gastos</div>
          </div>
          <Link to={`/${depotSlug}/favorites`} className="hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors">
            <div className="text-2xl font-bold text-red-600">{favorites.length}</div>
            <div className="text-sm text-gray-600">Favoritos</div>
          </Link>
        </CardContent>
      </Card>

      <Button variant="outline" className="w-full" onClick={handleSignOut}>
        <LogOut className="w-4 h-4 mr-2" />
        Sair da Conta
      </Button>
    </div>
  );
};

export default ProfilePage;