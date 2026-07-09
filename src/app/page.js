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

  // --- CONTROLE DE CARRINHO ---
  const addToCart = (p) => {
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }).filter(item => item.qty > 0));
  };

  const handleCheckout = () => {
    if (!profile.full_name || !profile.phone || !profile.address) {
      alert('Por favor, preencha seus dados de entrega no Perfil antes de finalizar.');
      setView('profile');
      return;
    }

    const productList = cart.map(i => `• ${i.name} [x${i.qty}] - (R$ ${(i.price * i.qty).toFixed(2)})`).join('%0A');
    const total = cart.reduce((a, b) => a + (Number(b.price) * b.qty), 0).toFixed(2);
    
    const message = `Olá! Quero comprar os produtos:%0A${productList}%0A%0A*Total: R$ ${total}*%0A%0A---%0A*Dados de Entrega:*%0ANome: ${profile.full_name}%0AEndereço: ${profile.address}%0ACidade: ${profile.city}%0ATelefone: ${profile.phone}%0A%0AQuero calcular o frete.`;
    
    window.open(`https://api.whatsapp.com/send?phone=5521959079144&text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen">
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
            CARRINHO <span id="cart-count">{String(cart.reduce((a,b) => a + b.qty, 0)).padStart(2, '0')}</span>
          </div>
        </div>
      </header>

      <main>
        {view === 'home' && (
          <>
            <section className="hero">
              <div className="wrap text-center">
                <h1 className="text-7xl mb-6">Importação sem fronteiras.</h1>
                <p className="hero-sub mx-auto">Originalidade dos EUA direto para sua casa.</p>
                <div className="flex justify-center gap-4 mt-10">
                  <button className="btn primary" onClick={() => document.getElementById('catalogo').scrollIntoView()}>Ver catálogo</button>
                </div>
              </div>
            </section>

            <section id="como-funciona" className="py-20 border-t border-white/5">
              <div className="wrap">
                <h2 className="stencil text-4xl mb-12">Como funciona</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 font-mono text-sm">
                  <div className="p-8 border border-white/10 bg-white/5">
                    <div className="text-[#D6A94B] stencil text-2xl mb-4">01. Escolha</div>
                    <p className="opacity-60 leading-relaxed">Navegue o catálogo ou nos envie o link de qualquer produto americano. Confirmamos o valor final em reais.</p>
                  </div>
                  <div className="p-8 border border-white/10 bg-white/5">
                    <div className="text-[#D6A94B] stencil text-2xl mb-4">02. Consolidação</div>
                    <p className="opacity-60 leading-relaxed">Compramos e conferimos seus itens em nosso depósito em Miami. Tudo em um só pacote.</p>
                  </div>
                  <div className="p-8 border border-white/10 bg-white/5">
                    <div className="text-[#D6A94B] stencil text-2xl mb-4">03. Entrega</div>
                    <p className="opacity-60 leading-relaxed">Despacho com rastreio internacional e entrega direto no seu endereço em todo o Brasil.</p>
                  </div>
                </div>
              </div>
            </section>

            <section id="catalogo" className="products">
              <div className="wrap">
                <h2 className="stencil text-5xl text-[#211C14] mb-12">Catálogo</h2>
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
              </div>
            </section>
          </>
        )}

        {view === 'cart' && (
          <div className="wrap py-24 max-w-2xl">
            <h2 className="stencil text-6xl mb-10">Carrinho</h2>
            {cart.length === 0 ? (
              <p className="mono opacity-50 py-10 border-t border-dashed border-white/10">SEU CARRINHO ESTÁ VAZIO</p>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center border-b border-white/10 pb-6 mono">
                    <div>
                      <div className="font-bold">{item.name}</div>
                      <div className="text-xs text-[#D6A94B]">R$ {item.price} cada</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-white/20 px-2 py-1 gap-4">
                        <button onClick={() => updateQty(item.id, -1)} className="hover:text-[#C1432E]">-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="hover:text-[#D6A94B]">+</button>
                      </div>
                      <div className="font-bold w-24 text-right">R$ {(item.price * item.qty).toFixed(2)}</div>
                    </div>
                  </div>
                ))}
                <div className="pt-10">
                   <div className="stencil text-5xl mb-8 text-right">TOTAL: R$ {cart.reduce((a,b)=>a+(Number(b.price)*b.qty),0).toFixed(2)}</div>
                   <button className="btn primary w-full text-xl py-6" onClick={handleCheckout}>FINALIZAR PEDIDO NO WHATSAPP</button>
                </div>
              </div>
            )}
          </div>
        )}

        {view === 'profile' && (
          <div className="wrap py-24 max-w-xl">
            <h2 className="stencil text-6xl mb-10">Meus Dados</h2>
            <div className="space-y-4 mono">
              <div className="text-xs opacity-50 mb-6">LOGADO COMO: {user?.email}</div>
              <label className="text-[10px] opacity-40 block">NOME COMPLETO</label>
              <input className="manifest-input" placeholder="Ex: João Silva" value={profile.full_name} onChange={e => setProfile({...profile, full_name: e.target.value})} />
              <label className="text-[10px] opacity-40 block">TELEFONE WHATSAPP</label>
              <input className="manifest-input" placeholder="Ex: 21 99999-9999" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
              <label className="text-[10px] opacity-40 block">ENDEREÇO DE ENTREGA</label>
              <input className="manifest-input" placeholder="Rua, Número, Complemento" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
              <label className="text-[10px] opacity-40 block">CIDADE / ESTADO</label>
              <input className="manifest-input" placeholder="São Paulo - SP" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
              <button className="btn primary w-full mt-6" onClick={async () => {
                 await supabase.from('profiles').upsert({ id: user.id, ...profile });
                 alert('Dados salvos com sucesso!');
              }}>ATUALIZAR MEU PERFIL</button>
              <button onClick={() => { supabase.auth.signOut(); setView('home'); }} className="w-full text-center mt-10 text-[10px] opacity-30">SAIR DA CONTA</button>
            </div>
          </div>
        )}

        {view === 'login' && (
          <div className="wrap py-24 max-w-md">
            <h2 className="stencil text-6xl mb-10">Acesso</h2>
            <input className="manifest-input" placeholder="E-MAIL" id="email" />
            <input className="manifest-input" type="password" placeholder="SENHA" id="pass" />
            <div className="flex gap-4">
              <button className="btn primary flex-1" onClick={async () => {
                  const { error } = await supabase.auth.signInWithPassword({ email: document.getElementById('email').value, password: document.getElementById('pass').value });
                  if(error) alert(error.message); else { checkUser(); setView('home'); }
              }}>ENTRAR</button>
              <button className="btn flex-1" onClick={async () => {
                  const { error } = await supabase.auth.signUp({ email: document.getElementById('email').value, password: document.getElementById('pass').value });
                  if(error) alert('Confirme o link no seu e-mail!'); else alert('Conta criada!');
              }}>CADASTRAR</button>
            </div>
          </div>
        )}
      </main>

      <footer className="py-20 text-center mono text-[10px] opacity-30 uppercase tracking-[0.4em]">
        DOS STATES — EUA ⇄ BRASIL
      </footer>
    </div>
  );
}
