'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) {
      const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(prof);
      const { data: ord } = await supabase.from('orders').select('*').eq('user_id', user.id);
      setOrders(ord || []);
    }
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
    setLoading(false);
  }

  const addToCart = (p) => {
    setCart([...cart, { ...p, cartId: Math.random() }]);
  };

  return (
    <div className="min-h-screen">
      {/* HEADER 100% DESIGN ORIGINAL */}
      <header>
        <div className="wrap navbar">
          <div className="brand stencil" onClick={() => setView('home')}>
            <span className="flag-dot"></span>DOS STATES
          </div>
          <nav className="links">
            <button onClick={() => setView('home')}>Catálogo</button>
            {user ? (
              <>
                <button onClick={() => setView('orders')}>Minhas Compras</button>
                <button onClick={() => setView('profile')}>Meu Perfil</button>
              </>
            ) : (
              <button onClick={() => setView('login')}>Entrar</button>
            )}
          </nav>
          <div className="cart-chip" onClick={() => setView('cart')}>
            CARRINHO <span id="cart-count">{String(cart.length).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <main>
        {view === 'home' && (
          <>
            {/* HERO 100% DESIGN ORIGINAL */}
            <section className="hero">
              <div className="wrap">
                <div className="manifest">
                  <div className="stub from">ORIGEM · DESPACHO <div className="country">USA</div></div>
                  <div className="route">
                    <svg viewBox="0 0 220 70"><path d="M4,50 C60,-10 160,110 216,50" fill="none" stroke="rgba(237,226,201,0.35)" strokeWidth="2" strokeDasharray="6 8" /></svg>
                  </div>
                  <div className="stub to">DESTINO · ENTREGA <div className="country">BRASIL</div></div>
                </div>
                <div className="hero-head">
                  <div className="eyebrow">MANIFESTO DE IMPORTAÇÃO Nº DS-2026</div>
                  <h1>O que existe <em>lá</em>,<br/>agora chega <em>aqui</em>.</h1>
                  <p className="hero-sub">A Dos States compra, consolida e despacha produtos originais dos Estados Unidos direto para a sua porta no Brasil.</p>
                </div>
              </div>
            </section>

            <section className="products">
              <div className="wrap">
                <div className="section-head">
                  <div className="section-tag">/// CATÁLOGO ATIVO</div>
                  <h2 style={{color: '#211C14'}} className="stencil text-5xl">Direto das prateleiras dos EUA</h2>
                </div>
                <div className="grid">
                  {products.map(p => (
                    <div key={p.id} className="tag-card">
                      <div className="punch"></div>
                      <div className="prod-brand">{p.brand}</div>
                      <div className="prod-name">{p.name}</div>
                      <div className="prod-foot">
                        <div className="prod-price"><small>VALOR</small>R$ {p.price}</div>
                        <button className="stamp-btn" onClick={() => addToCart(p)}>
                           <span style={{fontSize: '20px'}}>+</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {view === 'orders' && (
          <div className="wrap py-20">
            <h2 className="stencil text-6xl mb-10">Minhas Compras</h2>
            {orders.length === 0 ? (
              <p className="mono opacity-50 border-t border-dashed border-[#EDE2C9]/20 pt-10">
                — NENHUM REGISTRO DE CARGA ENCONTRADO —
              </p>
            ) : (
              <div className="space-y-6">
                {orders.map(order => (
                  <div key={order.id} className="border border-[#EDE2C9]/20 p-8 mono">
                    <div className="flex justify-between mb-4">
                      <span>ORDEM: {order.id.slice(0,8).toUpperCase()}</span>
                      <span className="text-[#D6A94B]">{order.status}</span>
                    </div>
                    <div className="text-xl font-bold">R$ {order.total_price}</div>
                    {order.tracking_code && <div className="mt-4 text-xs opacity-50">RASTREIO: {order.tracking_code}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'cart' && (
          <div className="wrap py-20 max-w-2xl">
            <h2 className="stencil text-6xl mb-10">Carrinho</h2>
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.cartId} className="flex justify-between border-b border-[#EDE2C9]/10 py-4 mono">
                  <span>{item.name}</span>
                  <span className="font-bold">R$ {item.price}</span>
                </div>
              ))}
              {cart.length > 0 && (
                <button className="btn primary w-full mt-10 text-xl">FINALIZAR COMPRA</button>
              )}
            </div>
          </div>
        )}

        {view === 'profile' && (
          <div className="wrap py-20 max-w-xl">
            <h2 className="stencil text-6xl mb-10">Meu Perfil</h2>
            <div className="space-y-4 mono">
              <p>NOME: {profile?.full_name || '—'}</p>
              <p>EMAIL: {user?.email}</p>
              <p>FONE: {profile?.phone || '—'}</p>
              <div className="pt-10 border-t border-dashed border-white/10">
                 <h3 className="stencil text-2xl mb-4">Abrir Ticket / Solicitação</h3>
                 <textarea className="manifest-input h-32" placeholder="Descreva o produto ou sua dúvida..."></textarea>
                 <button className="btn primary w-full">ENVIAR DECLARAÇÃO</button>
              </div>
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="wrap py-20 max-w-md">
            <h2 className="stencil text-6xl mb-10">Identificação</h2>
            <input className="manifest-input" placeholder="E-MAIL" id="email" />
            <input className="manifest-input" type="password" placeholder="SENHA" id="pass" />
            <button className="btn primary w-full" onClick={async () => {
                const email = document.getElementById('email').value;
                const password = document.getElementById('pass').value;
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) alert(error.message); else { checkUser(); setView('home'); }
            }}>ENTRAR NO SISTEMA</button>
          </div>
        )}
      </main>

      <footer className="py-20 text-center mono text-[10px] opacity-30">
        DOS STATES IMPORT CO. — MIAMI ⇄ RIO DE JANEIRO
      </footer>
    </div>
  );
}
