'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function App() {
  const [view, setView] = useState('home'); // home, login, dashboard, admin
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);

  // Admin Email
  const ADMIN_EMAIL = 'seu-email-admin@gmail.com'; 

  useEffect(() => {
    fetchProducts();
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) fetchTickets(user.id);
  }

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  async function fetchTickets(userId) {
    const { data } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
    setTickets(data || []);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('home');
  };

  return (
    <div className="min-h-screen">
      {/* HEADER ORIGINAL FIXADO */}
      <header>
        <div className="wrap navbar">
          <div className="brand stencil" onClick={() => setView('home')}>
            <span className="flag-dot"></span>DOS STATES
          </div>
          <nav className="links flex gap-6 font-mono text-xs uppercase tracking-widest items-center">
            <button onClick={() => setView('home')} className="hover:text-[#D6A94B]">Catálogo</button>
            {user ? (
              <>
                <button onClick={() => setView('dashboard')} className="hover:text-[#D6A94B]">Minha Conta</button>
                {user.email === ADMIN_EMAIL && (
                  <button onClick={() => setView('admin')} className="text-[#D6A94B] font-bold">ADMIN</button>
                )}
                <button onClick={handleLogout} className="opacity-50">Sair</button>
              </>
            ) : (
              <button onClick={() => setView('login')} className="btn primary !py-2 !px-4">ENTRAR</button>
            )}
            <div className="flex items-center gap-2 border border-[#EDE2C9]/35 px-4 py-2 font-mono text-[13px]">
              LISTA <span className="text-[#D6A94B] font-bold">{String(cart.length).padStart(2, '0')}</span>
            </div>
          </nav>
        </div>
      </header>

      {/* RENDERIZAÇÃO DE TELAS */}
      {view === 'home' && <HomeView products={products} loading={loading} onAddCart={(p) => setCart([...cart, p])} />}
      {view === 'login' && <LoginView onBack={() => setView('home')} onLogin={checkUser} />}
      {view === 'dashboard' && <DashboardView user={user} tickets={tickets} onBack={() => setView('home')} />}
      {view === 'admin' && <AdminView products={products} refresh={fetchProducts} onBack={() => setView('home')} />}
      
      <footer className="py-20 text-center opacity-30 font-mono text-[10px] uppercase tracking-[0.3em]">
        DOS STATES IMPORT CO. — MIAMI ⇄ RIO DE JANEIRO
      </footer>
    </div>
  );
}

// --- SUB-TELAS ---

function HomeView({ products, loading, onAddCart }) {
  return (
    <div className="wrap py-16">
      <div className="manifest mb-20">
        <div className="mono text-xs opacity-70">ORIGEM · DESPACHO <div className="stencil text-4xl mt-1">USA</div></div>
        <div className="w-40 h-20"><svg viewBox="0 0 220 70"><path d="M4,50 C60,-10 160,110 216,50" fill="none" stroke="rgba(237,226,201,0.35)" strokeWidth="2" strokeDasharray="6 8" /></svg></div>
        <div className="mono text-xs opacity-70 text-right">DESTINO · ENTREGA <div className="stencil text-4xl mt-1">BRASIL</div></div>
      </div>

      <div className="text-center mb-24">
        <div className="mono text-[#D6A94B] text-xs tracking-[0.3em] mb-4">MANIFESTO DE IMPORTAÇÃO Nº DS-2026</div>
        <h1 className="text-6xl md:text-8xl stencil leading-[0.9]">O QUE EXISTE <span className="text-[#C1432E]">LÁ</span>,<br/>AGORA CHEGA <span className="text-[#C1432E]">AQUI</span>.</h1>
      </div>

      <section className="products -mx-7 px-7">
        <div className="wrap">
          <h2 className="stencil text-4xl mb-2">/// CATÁLOGO ATIVO</h2>
          {loading ? <p className="mono animate-pulse">CARREGANDO DADOS...</p> : (
            <div className="grid">
              {products.map(p => (
                <div key={p.id} className="tag-card group">
                  <div className="mono text-[10px] opacity-50 uppercase">{p.brand}</div>
                  <div className="font-bold text-lg leading-tight my-2 h-12">{p.name}</div>
                  <div className="flex justify-between items-end border-t border-dashed border-black/10 pt-4 mt-4">
                    <div className="mono text-xl font-black">R$ {p.price}</div>
                    <button onClick={() => onAddCart(p)} className="w-10 h-10 border border-black rounded-full flex items-center justify-center hover:bg-black hover:text-white transition-all">+</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function LoginView({ onBack, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    
    if (error) alert(error.message);
    else { onLogin(); onBack(); }
  };

  return (
    <div className="wrap py-20 max-w-md">
      <h2 className="stencil text-5xl mb-8">{isSignUp ? 'CRIAR CONTA' : 'IDENTIFICAÇÃO'}</h2>
      <div className="space-y-4">
        <input type="email" placeholder="E-MAIL" className="input-field" onChange={e => setEmail(e.target.value)} />
        <input type="password" placeholder="SENHA" className="input-field" onChange={e => setPassword(e.target.value)} />
        <button onClick={handleSubmit} className="btn primary w-full">{isSignUp ? 'CONFIRMAR CADASTRO' : 'ENTRAR NO SISTEMA'}</button>
        <button onClick={() => setIsSignUp(!isSignUp)} className="w-full mono text-[10px] opacity-50">
          {isSignUp ? 'JÁ TENHO CONTA' : 'NÃO TENHO CONTA (CADASTRAR)'}
        </button>
      </div>
    </div>
  );
}

function AdminView({ products, refresh, onBack }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');

  const addProduct = async () => {
    await supabase.from('products').insert([{ name, price: parseFloat(price), brand }]);
    refresh();
    alert('Produto Adicionado!');
  };

  return (
    <div className="wrap py-20">
      <h2 className="stencil text-5xl text-[#C1432E] mb-10">PAINEL DE CONTROLE</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
        <div>
          <h3 className="stencil text-2xl mb-6">ADICIONAR PRODUTO</h3>
          <div className="space-y-4">
            <input placeholder="NOME DO PRODUTO" className="input-field" onChange={e => setName(e.target.value)} />
            <input placeholder="MARCA" className="input-field" onChange={e => setBrand(e.target.value)} />
            <input placeholder="PREÇO (R$)" type="number" className="input-field" onChange={e => setPrice(e.target.value)} />
            <button onClick={addProduct} className="btn primary">PUBLICAR NO CATÁLOGO</button>
          </div>
        </div>
        <div>
          <h3 className="stencil text-2xl mb-6">TICKETS PENDENTES</h3>
          <p className="mono opacity-50">Nenhuma dúvida nova recebida.</p>
        </div>
      </div>
    </div>
  );
}

function DashboardView({ user, tickets, onBack }) {
  return (
    <div className="wrap py-20">
      <h2 className="stencil text-5xl mb-4">MINHA ÁREA</h2>
      <p className="mono text-xs text-[#D6A94B] mb-12">PASSAPORTE: {user?.email}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="border border-[#EDE2C9]/20 p-8">
          <h3 className="stencil text-2xl mb-4 text-[#D6A94B]">TICKETS / DÚVIDAS</h3>
          {tickets.length === 0 ? <p className="mono opacity-40">Nenhum ticket aberto.</p> : null}
          <button className="btn mt-6">ABRIR NOVO TICKET</button>
        </div>
        <div className="border border-[#EDE2C9]/20 p-8 opacity-40">
          <h3 className="stencil text-2xl mb-4">MINHAS COMPRAS</h3>
          <p className="mono">Você ainda não possui pedidos registrados.</p>
        </div>
      </div>
    </div>
  );
}
