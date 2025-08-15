import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Zap, ShieldCheck, Star, Truck, Droplet, Flame } from 'lucide-react';
import AnimatedSection from '@/components/AnimatedSection';

const LandingPage = () => {
  return (
    <div className="bg-white text-gray-800 overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50">
        <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="text-2xl font-bold text-red-600 flex items-center">
            <Flame className="w-7 h-7 mr-2" />
            AppdoGás
          </div>
          <div className="space-x-2">
            <Button variant="ghost" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="bg-red-600 hover:bg-red-700">
              <Link to="/depots">Peça Agora</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gray-50 overflow-hidden">
        <div className="container mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center relative z-10">
          <AnimatedSection>
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
              Gás e Água na sua porta,
              <br />
              <span className="text-red-600">rápido e fácil.</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Peça seu botijão de gás ou galão de água em segundos e receba em minutos. O AppdoGás é a solução que você precisava.
            </p>
            <div className="mt-8">
              <Button size="lg" className="text-lg h-14 px-8 bg-red-600 hover:bg-red-700 shadow-lg transform hover:scale-105 transition-transform" asChild>
                <Link to="/depots">QUERO PEDIR AGORA</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
        <div className="absolute top-0 left-0 w-full h-full z-0">
            <Flame className="absolute -bottom-8 -left-8 w-40 h-40 text-red-100/50 animate-pulse" />
            <Droplet className="absolute top-1/4 right-10 w-24 h-24 text-blue-100/60 animate-pulse delay-500" />
            <Truck className="absolute bottom-1/3 right-1/4 w-32 h-32 text-gray-200/50 animate-pulse delay-1000" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Por que escolher o AppdoGás?</h2>
            <p className="text-gray-600 mt-3 text-lg">Simples, rápido e seguro. Veja as vantagens:</p>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay="0ms">
              <div className="text-center p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="inline-block p-4 bg-red-100 rounded-full">
                  <Truck className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">Entrega Super Rápida</h3>
                <p className="mt-2 text-gray-600">Receba seu pedido em até 45 minutos. A gente não brinca em serviço.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay="200ms">
              <div className="text-center p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="inline-block p-4 bg-red-100 rounded-full">
                  <Zap className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">Peça em Segundos</h3>
                <p className="mt-2 text-gray-600">Nosso app é intuitivo e fácil de usar. Pedir gás nunca foi tão simples.</p>
              </div>
            </AnimatedSection>
            <AnimatedSection delay="400ms">
              <div className="text-center p-6 transform hover:-translate-y-2 transition-transform duration-300">
                <div className="inline-block p-4 bg-red-100 rounded-full">
                  <ShieldCheck className="w-10 h-10 text-red-600" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">Pagamento Seguro</h3>
                <p className="mt-2 text-gray-600">Pague com PIX, cartão ou dinheiro na entrega. Você escolhe.</p>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Como funciona?</h2>
            <p className="text-gray-600 mt-3 text-lg">Em 3 passos simples, seu problema está resolvido.</p>
          </AnimatedSection>
          <div className="relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-red-200"></div>
            <div className="grid md:grid-cols-3 gap-12 relative">
              <AnimatedSection delay="0ms" className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 mx-auto flex items-center justify-center bg-red-600 text-white text-3xl font-bold rounded-full border-4 border-gray-50">1</div>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Escolha o produto</h3>
                <p className="mt-2 text-gray-600">Navegue por nossa seleção de botijões de gás e galões de água.</p>
              </AnimatedSection>
              <AnimatedSection delay="200ms" className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 mx-auto flex items-center justify-center bg-red-600 text-white text-3xl font-bold rounded-full border-4 border-gray-50">2</div>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Informe o endereço</h3>
                <p className="mt-2 text-gray-600">Digite seu endereço e escolha a forma de pagamento.</p>
              </AnimatedSection>
              <AnimatedSection delay="400ms" className="text-center">
                <div className="relative inline-block">
                  <div className="w-20 h-20 mx-auto flex items-center justify-center bg-red-600 text-white text-3xl font-bold rounded-full border-4 border-gray-50">3</div>
                </div>
                <h3 className="mt-4 text-xl font-semibold">Receba em casa</h3>
                <p className="mt-2 text-gray-600">Acompanhe o entregador e receba seu pedido no conforto da sua casa.</p>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Nossos Produtos Principais</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <AnimatedSection delay="0ms">
              <Card className="flex flex-col sm:flex-row items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img src="/images/gas-13kg.png" alt="Gás P13" className="w-28 h-28 mb-4 sm:mb-0 sm:mr-6" />
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">Gás de Cozinha P13</h3>
                  <p className="text-gray-600 mt-2">O botijão ideal para sua casa. Qualidade e segurança garantidas.</p>
                </div>
              </Card>
            </AnimatedSection>
            <AnimatedSection delay="200ms">
              <Card className="flex flex-col sm:flex-row items-center p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <img src="/images/agua.png" alt="Água Mineral" className="w-28 h-28 mb-4 sm:mb-0 sm:mr-6" />
                <div className="text-center sm:text-left">
                  <h3 className="text-2xl font-bold">Água Mineral 20L</h3>
                  <p className="text-gray-600 mt-2">Água pura e cristalina para matar sua sede. Galão retornável.</p>
                </div>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <AnimatedSection className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">O que nossos clientes dizem</h2>
          </AnimatedSection>
          <div className="grid md:grid-cols-3 gap-8">
            <AnimatedSection delay="0ms">
              <Card className="transform h-full hover:-translate-y-2 transition-transform duration-300">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="italic text-gray-700 flex-grow">"Serviço incrível! Pedi e em 20 minutos o gás estava na minha porta. Salvou meu almoço de domingo!"</p>
                  <p className="mt-6 font-semibold text-gray-900">- Maria S., Contagem</p>
                </CardContent>
              </Card>
            </AnimatedSection>
            <AnimatedSection delay="200ms">
              <Card className="transform h-full hover:-translate-y-2 transition-transform duration-300">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="italic text-gray-700 flex-grow">"Finalmente um app que funciona de verdade. Fácil de usar e a entrega é muito rápida. Recomendo!"</p>
                  <p className="mt-6 font-semibold text-gray-900">- João P., Betim</p>
                </CardContent>
              </Card>
            </AnimatedSection>
            <AnimatedSection delay="400ms">
              <Card className="transform h-full hover:-translate-y-2 transition-transform duration-300">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)}
                  </div>
                  <p className="italic text-gray-700 flex-grow">"Uso toda semana para pedir água. O preço é justo e a comodidade não tem preço. App nota 10!"</p>
                  <p className="mt-6 font-semibold text-gray-900">- Ana L., Belo Horizonte</p>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-red-600 text-white">
        <div className="container mx-auto px-6 py-20 text-center">
          <AnimatedSection>
            <h2 className="text-3xl md:text-4xl font-bold">Pronto para fazer seu pedido?</h2>
            <p className="mt-4 text-lg max-w-2xl mx-auto">
              Chega de passar aperto. Cadastre-se agora e tenha gás e água sempre que precisar, com a rapidez que você merece.
            </p>
            <div className="mt-8">
              <Button size="lg" variant="secondary" className="text-lg h-14 px-8 bg-white text-red-600 hover:bg-gray-100 shadow-lg transform hover:scale-105 transition-transform" asChild>
                <Link to="/depots">COMEÇAR AGORA</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-6 py-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} AppdoGás. Todos os direitos reservados.</p>
          <p className="mt-2 text-sm">Feito com ❤️ para facilitar sua vida.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;