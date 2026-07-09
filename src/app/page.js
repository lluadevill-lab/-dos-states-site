'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfessionalSite() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
    setLoading(false);
  }

  const addToCart = (p) => {
    setCart([...cart, p]);
    alert(`${p.name} adicionado ao carrinho!`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* NAVBAR */}
      <header>
        <div className="container flex justify-between items-center h-20">
          <div className="brand stencil text-2xl flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
             <div className="w-3 h-3 rounded-full bg-[#C1432E] shadow-[12px_0_0_#D6A94B]"></div>
             DOS STATES
          </div>
          
          <nav className="hidden md:flex gap-8 font-mono text-[11px] uppercase tracking-[2px]">
            <button onClick={() => setView('home')} className="hover:text-[#D6A94B] transition-colors">Catálogo</button>
            <button onClick={() => setView('home')} className="hover:text-[#D6A94B] transition-colors">Como Funciona</button>
            {user ? (
              <button onClick={() => setView('profile')} className="hover:text-[#D6A94B] transition-colors">Minha Conta</button>
            ) : (
              <button onClick={() => setView('login')} className="hover:text-[#D6A94B] transition-colors font-bold text-[#D6A94B]">Login</button>
            )}
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setView('cart')} className="border border-[#D6A94B]/40 px-5 py-2 rounded-full mono text-xs hover:bg-[#D6A94B] hover:text-[#16233D] transition-all">
              CARRINHO ({cart.length})
            </button>
          </div>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="flex-grow pt-20">
        {view === 'home' && (
          <>
            {/* HERO SECTION PROFISSIONAL */}
            <section className="hero-gradient">
              <div className="container grid md:grid-cols-2 gap-10 items-center">
                <div className="space-y-6">
                  <div className="mono text-[#D6A94B] text-sm tracking-[4px]">IMPORTADORA EXCLUSIVA</div>
                  <h1 className="stencil text-7xl md:text-8xl leading-none">
                    O LUXO DOS EUA <br/> <span className="text-[#C1432E]">NA SUA PORTA.</span>
                  </h1>
                  <p className="text-gray-300 text-lg max-w-lg leading-relaxed">
                    Compramos, conferimos e despachamos produtos originais direto de Miami para o Brasil com logística rastreada e segura.
                  </p>
                  <div className="flex gap-4 pt-4">
                    <button onClick={() => document.getElementById('catalogo').scrollIntoView()} className="btn-main">Ver Catálogo</button>
                    <button className="btn-outline">Como Funciona</button>
                  </div>
                </div>
                <div className="hidden md:block relative">
                   <div className="absolute -inset-10 bg-[#D6A94B]/10 blur-3xl rounded-full"></div>
                   <img src="https://images.unsplash.com/photo-1580674285054-bed31e145f59?auto=format&fit=crop&q=80&w=800" className="relative rounded-lg shadow-2xl grayscale hover:grayscale-0 transition-all duration-700" alt="Importação" />
                </div>
              </div>
            </section>

            {/* SEÇÃO DE BENEFÍCIOS */}
            <section className="bg-white text-black py-24">
              <div className="container">
                <div className="grid md:grid-cols-3 gap-12">
                  <div className="space-y-4">
                    <div className="text-4xl stencil text-[#D6A94B]">01.</div>
                    <h3 className="stencil text-2xl">Logística Reversa</h3>
                    <p className="opacity-70 text-sm">Recebemos seus produtos em nosso depósito nos EUA e consolidamos em um único frete.</p>
                  </div>
                  <div className="space-y-4 border-l border-gray-100 pl-12">
                    <div className="text-4xl stencil text-[#D6A94B]">02.</div>
                    <h3 className="stencil text-2xl">Seguro Total</h3>
                    <p className="opacity-70 text-sm">Todas as cargas são seguradas. Zero risco para o seu investimento e seus sonhos.</p>
                  </div>
                  <div className="space-y-4 border-l border-gray-100 pl-12">
                    <div className="text-4xl stencil text-[#D6A94B]">03.</div>
                    <h3 className="stencil text-2xl">Originalidade</h3>
                    <p className="opacity-70 text-sm">Compramos diretamente nas lojas oficiais: Apple, Sephora, Nike e muito mais.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* CATÁLOGO PROFISSIONAL */}
            <section id="catalogo" className="bg-[#f8f9fa] text-black">
              <div className="container">
                <div className="flex justify-between items-end mb-16">
                  <div>
                    <div className="mono text-[#C1432E] text-xs mb-2">/// DISPONIBILIDADE SEMANAL</div>
                    <h2 className="stencil text-5xl">Catálogo Pronta Entrega</h2>
                  </div>
                  <div className="hidden md:block text-right mono text-xs opacity-40">
                    ATUALIZADO EM: {new Date().toLocaleDateString()}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-20 animate-pulse">CARREGANDO MANIFESTO...</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map(p => (
                      <div key={p.id} className="product-card group">
                        <div className="product-image">
                           <span className="stencil text-4xl opacity-10">DOS STATES</span>
                        </div>
                        <div className="product-info">
                          <div className="mono text-[10px] text-gray-400 mb-1">{p.brand}</div>
                          <h4 className="font-bold text-lg mb-4">{p.name}</h4>
                          <div className="flex justify-between items-center mt-auto">
                            <span className="mono font-bold text-xl">R$ {p.price}</span>
                            <button onClick={() => addToCart(p)} className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-[#C1432E] hover:text-white transition-all">
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {/* TELAS DE ÁREA LOGADA (Estilizadas) */}
        {view === 'login' && (
          <section className="min-h-[70vh] flex items-center">
            <div className="container max-w-md bg-[#1e2d4d] p-12 rounded-lg border border-[#D6A94B]/20">
              <h2 className="stencil text-4xl mb-8">Identificação</h2>
              <input type="email" placeholder="E-mail" className="input-auth" id="email" />
              <input type="password" placeholder="Senha" className="input-auth" id="pass" />
              <button className="btn-main w-full" onClick={async () => {
                const { error } = await supabase.auth.signInWithPassword({
                  email: document.getElementById('email').value,
                  password: document.getElementById('pass').value
                });
                if(error) alert(error.message); else setView('home');
              }}>Acessar Painel</button>
              <p className="text-center mt-6 mono text-[10px] opacity-40 cursor-pointer" onClick={() => alert('Contate o admin para criar sua conta')}>Não tem conta? Solicite acesso.</p>
            </div>
          </section>
        )}

        {view === 'cart' && (
          <section className="container max-w-4xl min-h-[60vh]">
            <h2 className="stencil text-6xl mb-12">Seu Carrinho</h2>
            {cart.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-white/10 rounded-lg">
                <p className="mono opacity-40">O seu carrinho está vazio no momento.</p>
                <button onClick={() => setView('home')} className="btn-outline mt-6">Voltar ao Catálogo</button>
              </div>
            ) : (
              <div className="space-y-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 p-6 rounded-lg font-mono">
                    <span>{item.name}</span>
                    <span className="font-bold">R$ {item.price}</span>
                  </div>
                ))}
                <div className="pt-10 flex justify-between items-center">
                  <span className="stencil text-4xl">Total: R$ {cart.reduce((a,b) => a + Number(b.price), 0).toFixed(2)}</span>
                  <button className="btn-main">Finalizar Compra</button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {/* FOOTER ROBUSTO */}
      <footer>
        <div className="container grid md:grid-cols-4 gap-12">
          <div className="col-span-2 space-y-6">
            <div className="brand stencil text-3xl">DOS STATES</div>
            <p className="text-gray-500 text-sm max-w-sm">
              Sua ponte direta com o mercado americano. Qualidade, originalidade e segurança em cada despacho internacional.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="stencil text-lg">Links Úteis</h4>
            <nav className="flex flex-col gap-2 mono text-xs text-gray-400">
              <a href="#">Rastreio Global</a>
              <a href="#">Termos de Uso</a>
              <a href="#">Política de Taxas</a>
            </nav>
          </div>
          <div className="space-y-4">
            <h4 className="stencil text-lg">Suporte</h4>
            <nav className="flex flex-col gap-2 mono text-xs text-gray-400">
              <a href="#">WhatsApp Business</a>
              <a href="#">E-mail de Suporte</a>
              <a href="#">Miami Hub</a>
            </nav>
          </div>
        </div>
        <div className="container mt-20 pt-8 border-t border-white/5 text-center mono text-[10px] opacity-20">
          © 2026 DOS STATES IMPORT CO. — TODOS OS DIREITOS RESERVADOS.
        </div>
      </footer>
    </div>
  );
}
