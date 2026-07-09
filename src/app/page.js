'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function DosStatesApp() {
  const [view, setView] = useState('home'); // home, cart, profile, orders, login, admin
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('pronta-entrega');

  useEffect(() => {
    fetchProducts();
    checkUser();
    const savedCart = localStorage.getItem('ds-cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('ds-cart', JSON.stringify(cart));
  }, [cart]);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
    }
  }

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    setProducts(data || []);
    setLoading(false);
  }

  const addToCart = (p) => {
    setCart([...cart, { ...p, cartId: Math.random() }]);
    alert('Item adicionado à sua carga!');
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* NAVBAR ORIGINAL */}
      <header>
        <div className="wrap navbar">
          <div className="brand stencil" onClick={() => setView('home')}>
            <span className="flag-dot"></span>DOS STATES
          </div>
          <nav className="hidden md:flex gap-7 font-mono text-[13px] uppercase tracking-widest opacity-80">
            <button onClick={() => setView('home')} className="hover:text-[#D6A94B]">Catálogo</button>
            {user ? (
              <>
                <button onClick={() => setView('orders')} className="hover:text-[#D6A94B]">Minhas Compras</button>
                <button onClick={() => setView('profile')} className="hover:text-[#D6A94B]">Meu Perfil</button>
              </>
            ) : (
              <button onClick={() => setView('login')} className="text-[#D6A94B]">Entrar / Cadastro</button>
            )}
          </nav>
          <div className="flex items-center gap-2 border border-[#EDE2C9]/35 px-4 py-2 font-mono text-[13px] cursor-pointer" onClick={() => setView('cart')}>
            CARGA <span className="text-[#D6A94B] font-bold">{String(cart.length).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      {/* RENDERIZADOR DE TELAS */}
      <main className="wrap pt-10">
        {view === 'home' && (
          <>
            {/* HERO MANIFESTO */}
            <div className="manifest mb-16">
                <div className="mono text-xs">ORIGEM: USA <div className="stencil text-4xl">MIAMI</div></div>
                <div className="w-40 h-10"><svg viewBox="0 0 220 70"><path d="M4,50 C60,-10 160,110 216,50" fill="none" stroke="rgba(237,226,201,0.2)" strokeWidth="2" strokeDasharray="6 8" /></svg></div>
                <div className="mono text-xs text-right">DESTINO: BR <div className="stencil text-4xl">BRASIL</div></div>
            </div>

            <div className="flex gap-4 mb-10 border-b border-[#EDE2C9]/10 pb-4">
              <button onClick={() => setCategory('pronta-entrega')} className={`stencil text-2xl ${category === 'pronta-entrega' ? 'text-[#D6A94B]' : 'opacity-40'}`}>/// Pronta Entrega (No BR)</button>
              <button onClick={() => setCategory('encomenda')} className={`stencil text-2xl ${category === 'encomenda' ? 'text-[#D6A94B]' : 'opacity-40'}`}>/// Sob Encomenda</button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.filter(p => p.stock_type === category).map(p => (
                <div key={p.id} className="tag-card">
                  <div className="badge">{p.stock_type === 'pronta-entrega' ? 'NO BRASIL' : 'IMPORTADO'}</div>
                  <div className="mono text-[10px] opacity-40 uppercase mb-1">{p.brand}</div>
                  <div className="font-bold text-base leading-tight mb-4 h-12">{p.name}</div>
                  <div className="flex justify-between items-end border-t border-dashed border-black/10 pt-4">
                    <div className="mono text-xl font-black">R$ {p.price}</div>
                    <button onClick={() => addToCart(p)} className="stamp-btn">
                      <span className="text-xl">+</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {category === 'encomenda' && (
              <div className="mt-16 p-8 border border-dashed border-[#D6A94B]/30 text-center">
                <h3 className="stencil text-3xl mb-4 text-[#D6A94B]">Não achou o que procurava?</h3>
                <p className="mono text-sm opacity-60 mb-6">Nós buscamos qualquer produto nos EUA para você.</p>
                <button onClick={() => setView('profile')} className="btn primary">SOLICITAR PRODUTO ESPECÍFICO (ABRIR TICKET)</button>
              </div>
            )}
          </>
        )}

        {view === 'cart' && (
          <div className="max-w-2xl mx-auto">
            <h2 className="stencil text-5xl mb-10">SUA CARGA</h2>
            {cart.length === 0 ? <p className="mono opacity-50 text-center py-20">Nenhum item na lista.</p> : (
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.cartId} className="flex justify-between border-b border-[#EDE2C9]/10 py-4 font-mono">
                    <div>
                      <div className="text-sm font-bold">{item.name}</div>
                      <div className="text-[10px] opacity-50">ORIGEM: {item.stock_type === 'pronta-entrega' ? 'ESTOQUE BR' : 'ESTOQUE EUA'}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="font-bold">R$ {item.price}</div>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-[#C1432E]">Remover</button>
                    </div>
                  </div>
                ))}
                <div className="pt-10 text-right">
                   <div className="stencil text-4xl mb-6">Total: R$ {cart.reduce((acc, i) => acc + Number(i.price), 0).toFixed(2)}</div>
                   <button className="btn primary w-full text-xl py-6" onClick={() => alert('Finalização de compra integrada com WhatsApp ou Checkout.')}>FECHAR DECLARAÇÃO / COMPRAR</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div className="max-w-xl mx-auto">
             <h2 className="stencil text-5xl mb-4 text-[#D6A94B]">MEU PERFIL</h2>
             <div className="space-y-6 mt-10">
                <div className="border border-[#EDE2C9]/20 p-6">
                  <div className="mono text-[10px] opacity-50 mb-4 tracking-widest uppercase">Dados do Importador</div>
                  <div className="space-y-4 font-mono">
                    <p>NOME: <span className="text-[#D6A94B]">{profile?.full_name || 'Não informado'}</span></p>
                    <p>E-MAIL: <span className="text-[#D6A94B]">{user?.email}</span></p>
                    <p>TELEFONE: <span className="text-[#D6A94B]">{profile?.phone || 'Não informado'}</span></p>
                  </div>
                  <button className="btn mt-8 text-xs w-full">EDITAR DADOS</button>
                </div>
                
                <div className="border border-dashed border-[#D6A94B]/30 p-6">
                  <h3 className="stencil text-2xl mb-2 text-[#D6A94B]">ABRIR TICKET</h3>
                  <p className="mono text-xs opacity-50 mb-6">Dúvida sobre entrega ou pedido de produto específico.</p>
                  <textarea className="manifest-input h-32 mb-4" placeholder="Descreva aqui sua solicitação..."></textarea>
                  <button className="btn primary w-full">ENVIAR PARA ADM</button>
                </div>
             </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="stencil text-5xl mb-10">MINHAS COMPRAS</h2>
            <div className="space-y-6">
               <div className="border border-[#EDE2C9]/20 p-8 font-mono">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <div className="text-[10px] opacity-40">PEDIDO Nº DS-9982</div>
                      <div className="text-lg font-bold">2 Itens</div>
                    </div>
                    <div className="bg-[#D6A94B] text-[#16233D] text-[10px] px-3 py-1 font-bold">EM TRÂNSITO</div>
                  </div>
                  <div className="border-t border-dashed border-[#EDE2C9]/10 pt-4 text-xs space-y-2 opacity-70">
                    <p>• Cookies Chips Ahoy c/ Hershey's</p>
                    <p>• Youtheory Colágeno Verisol</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <div className="text-xl font-bold text-[#D6A94B]">R$ 483,00</div>
                    <div className="text-[10px] border border-[#D6A94B]/40 px-3 py-1 uppercase tracking-widest">Rastreio: BR827364551US</div>
                  </div>
               </div>
               <p className="text-center mono text-xs opacity-30 mt-10">— FIM DO HISTÓRICO —</p>
            </div>
          </div>
        )}

        {view === 'login' && <LoginScreen onLogin={() => {checkUser(); setView('home');}} />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else onLogin();
  };
  return (
    <div className="max-w-md mx-auto py-20">
      <h2 className="stencil text-5xl mb-8">ACESSO AO SISTEMA</h2>
      <div className="space-y-4">
        <input type="email" placeholder="E-MAIL" className="manifest-input" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="SENHA" className="manifest-input" onChange={e => setPassword(e.target.value)} />
        <button onClick={handleLogin} className="btn primary w-full text-lg">AUTENTICAR</button>
      </div>
    </div>
  );
}
