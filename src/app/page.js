'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
    setLoading(false);
  }

  return (
    <div className="min-h-screen">
      {/* HEADER 100% ORIGINAL */}
      <header>
        <div className="wrap navbar">
          <div className="brand stencil" onClick={() => setView('home')}>
            <span className="flag-dot"></span>DOS STATES
          </div>
          <nav className="links">
            <button onClick={() => setView('home')}>Catálogo</button>
            <button onClick={() => setView('home')}>Como funciona</button>
            {user ? (
               <button onClick={() => setView('profile')}>Minha Conta</button>
            ) : (
               <button onClick={() => setView('login')}>Entrar</button>
            )}
          </nav>
          <div className="cart-chip" onClick={() => setView('cart')}>
            LISTA <span id="cart-count">{String(cart.length).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <main>
        {view === 'home' && (
          <>
            <section className="hero">
              <div className="wrap">
                <div className="manifest">
                  <div className="stub from">ORIGEM · DESPACHO <div className="country">USA</div></div>
                  <div className="route">
                    <svg viewBox="0 0 220 70">
                      <path d="M4,50 C60,-10 160,110 216,50" fill="none" stroke="rgba(237,226,201,0.35)" strokeWidth="2" strokeDasharray="6 8" />
                    </svg>
                  </div>
                  <div className="stub to">DESTINO · ENTREGA <div className="country">BRASIL</div></div>
                </div>

                <div className="hero-head">
                  <div className="eyebrow">MANIFESTO DE IMPORTAÇÃO Nº DS-2026</div>
                  <h1>O que existe <em>lá</em>,<br/>agora chega <em>aqui</em>.</h1>
                  <p className="hero-sub">A Dos States compra, consolida e despacha produtos originais dos Estados Unidos direto para a sua porta no Brasil.</p>
                  <div className="flex justify-center gap-4 mt-10">
                    <button className="btn primary" onClick={() => document.getElementById('catalogo').scrollIntoView()}>Ver catálogo atual</button>
                    <button className="btn">Como funciona →</button>
                  </div>
                </div>
              </div>
            </section>

            <section id="catalogo" className="products">
              <div className="wrap">
                <div className="mb-14">
                  <div className="mono text-[#C1432E] text-xs mb-2 tracking-[0.2em]">/// CATÁLOGO ATIVO</div>
                  <h2 className="stencil text-5xl text-[#211C14]">Direto das prateleiras dos EUA</h2>
                </div>

                {loading ? (
                  <div className="mono text-center py-20 text-black animate-pulse">CARREGANDO MANIFESTO...</div>
                ) : (
                  <div className="grid">
                    {products.map(p => (
                      <div key={p.id} className="tag-card">
                        <div className="punch"></div>
                        <div className="prod-brand">{p.brand}</div>
                        <div className="prod-name">{p.name}</div>
                        <div className="prod-foot">
                          <div className="prod-price"><small>VALOR DECLARADO</small>R$ {p.price}</div>
                          <button className="stamp-btn" onClick={() => setCart([...cart, p])}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#211C14" strokeWidth="2"><circle cx="12" cy="12" r="8"/><path d="M8 12l3 3 5-6"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {view === 'login' && (
          <div className="wrap py-24 max-w-md">
            <h2 className="stencil text-6xl mb-10">Identificação</h2>
            <input className="manifest-input" placeholder="E-MAIL" id="email" />
            <input className="manifest-input" type="password" placeholder="SENHA" id="pass" />
            <button className="btn primary w-full" onClick={async () => {
              const { error } = await supabase.auth.signInWithPassword({
                email: document.getElementById('email').value,
                password: document.getElementById('pass').value
              });
              if(error) alert(error.message); else { checkUser(); setView('home'); }
            }}>AUTENTICAR NO SISTEMA</button>
          </div>
        )}

        {view === 'cart' && (
          <div className="wrap py-24 max-w-2xl">
            <h2 className="stencil text-6xl mb-10">Sua Lista</h2>
            {cart.length === 0 ? (
              <p className="mono opacity-50 py-10 border-t border-dashed border-white/20">— NENHUM ITEM DECLARADO —</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between border-b border-white/10 py-4 mono">
                    <span>{item.name}</span>
                    <span className="font-bold">R$ {item.price}</span>
                  </div>
                ))}
                <div className="pt-10 flex justify-between items-center">
                   <div className="stencil text-4xl">TOTAL: R$ {cart.reduce((a,b)=>a+Number(b.price),0).toFixed(2)}</div>
                   <button className="btn primary">FECHAR CARGA</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div className="wrap py-24 max-w-xl font-mono">
            <h2 className="stencil text-6xl mb-10">Meu Perfil</h2>
            <p className="mb-4">PASSAPORTE: <span className="text-[#D6A94B]">{user?.email}</span></p>
            <div className="border-t border-dashed border-white/20 pt-10 mt-10">
              <h3 className="stencil text-2xl mb-4">Abrir Ticket / Dúvida</h3>
              <textarea className="manifest-input h-32" placeholder="Descreva sua dúvida..."></textarea>
              <button className="btn primary w-full">ENVIAR PARA O COMANDO</button>
            </div>
            <button onClick={() => { supabase.auth.signOut(); checkUser(); setView('home'); }} className="mt-10 opacity-30 text-[10px] uppercase">Encerrar Sessão</button>
          </div>
        )}
      </main>

      <footer className="py-20 text-center mono text-[10px] opacity-30">
        DOS STATES IMPORT CO. — MIAMI ⇄ RIO DE JANEIRO — MANIFESTO DS-2026
      </footer>
    </div>
  );
}
