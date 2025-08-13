import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Flame, Droplet, Zap, ShieldCheck, Star, Truck } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-red-600">
            🔥 GásExpress
          </div>
          <div className="space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/login">Peça Agora</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="bg-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
            Gás e Água na sua porta, <span className="text-red-600">rápido e fácil.</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Peça seu botijão de gás ou galão de água em segundos e receba em minutos. A GásExpress é a solução que você precisava.
          </p>
          <div className="mt-8">
            <Button size="lg" className="text-lg h-12 px-8" asChild>
              <Link to="/login">QUERO PEDIR AGORA</Link>
            </Button>
          </div>
          <img src="/images/gas-13kg.png" alt="Botijão de Gás" className="mt-12 mx-auto h-64" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Por que escolher a GásExpress?</h2>
            <p className="text-gray-600 mt-2">Simples, rápido e seguro. Veja as vantagens:</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <Truck className="w-12 h-12 mx-auto text-red-600" />
              <h3 className="mt-4 text-xl font-semibold">Entrega Super Rápida</h3>
              <p className="mt-2 text-gray-600">Receba seu pedido em até 45 minutos. A gente não brinca em serviço.</p>
            </div>
            <div className="p-6">
              <Zap className="w-12 h-12 mx-auto text-red-600" />
              <h3 className="mt-4 text-xl font-semibold">Peça em Segundos</h3>
              <p className="mt-2 text-gray-600">Nosso app é intuitivo e fácil de usar. Pedir gás nunca foi tão simples.</p>
            </div>
            <div className="p-6">
              <ShieldCheck className="w-12 h-12 mx-auto text-red-600" />
              <h3 className="mt-4 text-xl font-semibold">Pagamento Seguro</h3>
              <p className="mt-2 text-gray-600">Pague com PIX, cartão ou dinheiro na entrega. Você escolhe.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Como funciona?</h2>
            <p className="text-gray-600 mt-2">Em 3 passos simples, seu problema está resolvido.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="text-center">
              <div className="text-5xl font-bold text-red-200">1</div>
              <h3 className="mt-2 text-xl font-semibold">Escolha o produto</h3>
              <p className="mt-2 text-gray-600">Navegue por nossa seleção de botijões de gás e galões de água.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-200">2</div>
              <h3 className="mt-2 text-xl font-semibold">Informe o endereço</h3>
              <p className="mt-2 text-gray-600">Digite seu endereço e escolha a forma de pagamento.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-200">3</div>
              <h3 className="mt-2 text-xl font-semibold">Receba em casa</h3>
              <p className="mt-2 text-gray-600">Acompanhe o entregador e receba seu pedido no conforto da sua casa.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">Nossos Produtos</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="flex items-center p-6">
              <img src="/images/gas-13kg.png" alt="Gás P13" className="w-24 h-24 mr-6" />
              <div>
                <h3 className="text-2xl font-bold">Gás de Cozinha P13</h3>
                <p className="text-gray-600">O botijão ideal para sua casa. Qualidade e segurança garantidas.</p>
              </div>
            </Card>
            <Card className="flex items-center p-6">
              <img src="/images/agua.png" alt="Água Mineral" className="w-24 h-24 mr-6" />
              <div>
                <h3 className="text-2xl font-bold">Água Mineral 20L</h3>
                <p className="text-gray-600">Água pura e cristalina para matar sua sede. Galão retornável.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-red-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold">O que nossos clientes dizem</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />)}
                </div>
                <p className="italic">"Serviço incrível! Pedi e em 20 minutos o gás estava na minha porta. Salvou meu almoço de domingo!"</p>
                <p className="mt-4 font-semibold">- Maria S., Contagem</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />)}
                </div>
                <p className="italic">"Finalmente um app que funciona de verdade. Fácil de usar e a entrega é muito rápida. Recomendo!"</p>
                <p className="mt-4 font-semibold">- João P., Betim</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex mb-2">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />)}
                </div>
                <p className="italic">"Uso toda semana para pedir água. O preço é justo e a comodidade não tem preço. App nota 10!"</p>
                <p className="mt-4 font-semibold">- Ana L., Belo Horizonte</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="text-4xl font-bold">Pronto para fazer seu pedido?</h2>
          <p className="mt-4 text-lg max-w-2xl mx-auto">
            Chega de passar aperto. Cadastre-se agora e tenha gás e água sempre que precisar, com a rapidez que você merece.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" className="text-lg h-12 px-8" asChild>
              <Link to="/login">COMEÇAR AGORA</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-6 text-center text-sm">
          <p>© {new Date().getFullYear()} GásExpress. Todos os direitos reservados.</p>
          <p className="mt-1">Feito com ❤️ para facilitar sua vida.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;