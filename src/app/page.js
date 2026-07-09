'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ full_name: '', phone: '', address: '', city: '', zip_code: '' });
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
      if (prof) setProfile(prof);
    }
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts(data || []);
    setLoading(false);
  }

  const addToCart = (p) => {
    setCart([...cart, { ...p, cartId: Math.random() }]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter(item => item.cartId !== cartId));
  };

  const handleCheckout = () => {
    if (!profile.full_name || !profile.phone || !profile.address) {
      alert('Por favor, preencha seus dados no perfil antes de finalizar.');
      setView('profile');
      return;
    }

    const productList = cart.map(i => `• ${i.name} (R$ ${i.price})`).join('%0A');
    const total = cart.reduce((a, b) => a + Number(b.price), 0).toFixed(2);
    
    const message = `Olá! Quero comprar os produtos:%0A${productList}%0A%0ATotal: R$ ${total}%0A%0A*Dados para Entrega:*%0ANome: ${profile.full_name}%0AEndereço: ${profile.address}%0ACidade: ${profile.city}%0ATelefone: ${profile.phone}%0A%0AQuero calcular o frete.`;
    
    window.open(`https://api.whatsapp.com/send?phone=5521959079144&text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen">
      {/* NAVBAR */}
      <header>
        <div className="wrap navbar">
          <div className="brand stencil" onClick={() => setView('home')}>
            <span className="flag-dot"></span>DOS STATES
          </div>
          <nav className="links">
            <button onClick={() => setView('home')}>Catálogo</button>
            <button onClick={() => { setView('home'); setTimeout(() => document.getElementById('como-funciona')?.scrollIntoView(), 100); }}>Como funciona</button>
            {user ? (
               <button onClick={() => setView('profile')}>Meu Perfil</button>
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
            <section className="hero">
              <div className="wrap text-center">
                <h1 className="text-7xl mb-6">Importação sem fronteiras.</h1>
                <p className="hero-sub mx-auto">Produtos originais dos Estados Unidos direto para sua porta.</p>
                <div className="flex justify-center gap-4 mt-10">
                  <button className="btn primary" onClick={() => document.getElementById('catalogo').scrollIntoView()}>Ver catálogo</button>
                </div>
              </div>
            </section>

            <section id="como-funciona" className="py-20 border-t border-white/5">
              <div className="wrap">
                <h2 className="stencil text-4xl mb-12">Como funciona</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 font-mono text-sm">
                  <div className="space-y-4 border-l border-[#D6A94B] pl-6">
                    <div className="text-[#D6A94B] font-bold">01. VOCÊ ESCOLHE</div>
                    <p className="opacity-60">Navegue o catálogo ou envie o link do produto que quer nos EUA.</p>
                  </div>
                  <div className="space-y-4 border-l border-[#D6A94B] pl-6">
                    <div className="text-[#D6A94B] font-bold">02. NÓS CONSOLIDAMOS</div>
                    <p className="opacity-60">Compramos e agrupamos seus itens em nosso depósito nos Estados Unidos.</p>
                  </div>
                  <div className="space-y-4 border-l border-[#D6A94B] pl-6">
                    <div className="text-[#D6A94B] font-bold">03. VOCÊ RECEBE</div>
                    <p className="opacity-60">Despacho internacional com entrega direta no seu endereço no Brasil.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="catalogo" className="products">
              <div className="wrap">
                <h2 className="stencil text-5xl text-[#211C14] mb-12">Produtos Disponíveis</h2>
                {loading ? (
                  <div className="mono text-center py-20 text-black">Carregando catálogo...</div>
                ) : (
                  <div className="grid">
                    {products.map(p => (
                      <div key={p.id} className="tag-card">
                        <div className="punch"></div>
                        <div className="prod-brand">{p.brand}</div>
                        <div className="prod-name">{p.name}</div>
                        <div className="prod-foot">
                          <div className="prod-price"><small>PREÇO</small>R$ {p.price}</div>
                          <button className="stamp-btn" onClick={() => addToCart(p)}>+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {view === 'cart' && (
          <div className="wrap py-24 max-w-2xl">
            <h2 className="stencil text-6xl mb-10">Carrinho</h2>
            {cart.length === 0 ? (
              <p className="mono opacity-50 py-10 border-t border-dashed border-white/10">CARRINHO VAZIO</p>
            ) : (
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.cartId} className="flex justify-between items-center border-b border-white/10 py-4 mono">
                    <div>
                      <div>{item.name}</div>
                      <div className="text-[10px] opacity-40">{item.brand}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-bold">R$ {item.price}</span>
                      <button onClick={() => removeFromCart(item.cartId)} className="text-[#C1432E] text-xs">Remover</button>
                    </div>
                  </div>
                ))}
                <div className="pt-10">
                   <div className="stencil text-4xl mb-6 text-right">TOTAL: R$ {cart.reduce((a,b)=>a+Number(b.price),0).toFixed(2)}</div>
                   <button className="btn primary w-full text-xl" onClick={handleCheckout}>FINALIZAR E ENVIAR WHATSAPP</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div className="wrap py-24 max-w-xl">
            <h2 className="stencil text-6xl mb-10">Meu Perfil</h2>
            <div className="space-y-4 mono">
              <p className="text-xs opacity-50">E-MAIL: {user?.email}</p>
              <input className="manifest-input" placeholder="NOME COMPLETO" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
              <input className="manifest-input" placeholder="TELEFONE" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              <input className="manifest-input" placeholder="ENDEREÇO COMPLETO" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
              <input className="manifest-input" placeholder="CIDADE / ESTADO" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
              <button className="btn primary w-full" onClick={async () => {
                 await supabase.from('profiles').upsert({ id: user.id, ...profile });
                 alert('Perfil atualizado!');
              }}>SALVAR ALTERAÇÕES</button>
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="wrap py-24 max-w-md">
            <h2 className="stencil text-6xl mb-10">Acesse sua conta</h2>
            <input className="manifest-input" placeholder="E-MAIL" id="email" />
            <input className="manifest-input" type="password" placeholder="SENHA" id="pass" />
            <div className="flex gap-4">
              <button className="btn primary flex-1" onClick={async () => {
                  const { error } = await supabase.auth.signInWithPassword({ email: document.getElementById('email').value, password: document.getElementById('pass').value });
                  if(error) alert(error.message); else { checkUser(); setView('home'); }
              }}>ENTRAR</button>
              <button className="btn flex-1" onClick={async () => {
                  const { error } = await supabase.auth.signUp({ email: document.getElementById('email').value, password: document.getElementById('pass').value });
                  if(error) alert('Verifique seu e-mail!'); else alert('Conta criada!');
              }}>CADASTRAR</button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-20 text-center mono text-[10px] opacity-30 uppercase tracking-widest">
        DOS STATES — IMPORTAÇÃO DIRETA — RIO DE JANEIRO / MIAMI
      </footer>
    </div>
  );
}
