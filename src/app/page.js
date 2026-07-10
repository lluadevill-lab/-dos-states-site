'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Platform() {
  const [view, setView] = useState('home'); // home, shop, product, cart, dashboard
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUserData(session.user.id);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchData() {
    const { data } = await supabase.from('products').select('*');
    setProducts(data || []);
    setLoading(false);
  }

  async function fetchUserData(userId) {
    const { data: favs } = await supabase.from('favorites').select('product_id').eq('user_id', userId);
    setFavorites(favs?.map(f => f.product_id) || []);
  }

  const addToCart = (p) => {
    const existing = cart.find(item => item.id === p.id);
    if (existing) {
      setCart(cart.map(item => item.id === p.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...p, qty: 1 }]);
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const toggleFavorite = async (pId) => {
    if (!user) return alert('Faça login para favoritar');
    if (favorites.includes(pId)) {
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('product_id', pId);
      setFavorites(favorites.filter(id => id !== pId));
    } else {
      await supabase.from('favorites').insert({ user_id: user.id, product_id: pId });
      setFavorites([...favorites, pId]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-sm text-gray-800">
      {/* HEADER PROFISSIONAL */}
      <header className="header-sticky border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="text-2xl font-black stencil tracking-tighter cursor-pointer text-blue-900" onClick={() => setView('home')}>
            DOS STATES<span className="text-amber-500">.</span>
          </div>
          
          <nav className="hidden md:flex gap-10 font-semibold uppercase text-[12px] tracking-widest">
            <button onClick={() => setView('home')} className={view === 'home' ? 'text-amber-600' : ''}>Home</button>
            <button onClick={() => setView('shop')} className={view === 'shop' ? 'text-amber-600' : ''}>Loja</button>
            <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'text-amber-600' : ''}>Minha Conta</button>
          </nav>

          <div className="flex items-center gap-6">
             <button onClick={() => setView('cart')} className="relative">
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 6h15l-1.5 9h-12L6 6z"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((a,b) => a + b.qty, 0)}
                </span>
             </button>
             {user ? (
               <div className="w-8 h-8 rounded-full bg-blue-900 text-white flex items-center justify-center text-xs font-bold cursor-pointer" onClick={() => setView('dashboard')}>
                 {user.email[0].toUpperCase()}
               </div>
             ) : (
               <button onClick={() => setView('dashboard')} className="font-bold text-xs uppercase underline">Login</button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {view === 'home' && <HomeView onShop={() => setView('shop')} />}
        {view === 'shop' && <ShopView products={products} onProductClick={(p) => {setSelectedProduct(p); setView('product');}} onAddToCart={addToCart} favs={favorites} onFav={toggleFavorite} />}
        {view === 'product' && <ProductDetail product={selectedProduct} onAddToCart={addToCart} onBack={() => setView('shop')} />}
        {view === 'cart' && <CartView cart={cart} setCart={setCart} onCheckout={() => alert('Checkout Whatsapp')} />}
        {view === 'dashboard' && <DashboardView user={user} products={products} favorites={favorites} onProductClick={(p) => {setSelectedProduct(p); setView('product');}} />}
      </main>

      {showToast && <div className="toast-success">Item adicionado ao carrinho com sucesso!</div>}

      <footer className="bg-white border-t py-12">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-xs">
          © 2026 DOS STATES — IMPORTAÇÃO SEM FRONTEIRAS
        </div>
      </footer>
    </div>
  );
}

// --- VISTAS ESPECÍFICAS ---

function HomeView({ onShop }) {
  return (
    <div className="bg-white">
      <section className="h-[70vh] flex items-center bg-[#F5F5F3] px-10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center">
          <div className="space-y-6">
            <h1 className="text-7xl font-bold leading-tight">Sua vitrine <br/> nos EUA.</h1>
            <p className="text-gray-500 max-w-sm">Tudo o que você ama das lojas americanas, entregue em sua porta com segurança total.</p>
            <button onClick={onShop} className="bg-black text-white px-10 py-4 font-bold uppercase text-xs">Ir para a Loja</button>
          </div>
          <div className="hidden md:block bg-gray-200 h-[500px] rounded-sm"></div>
        </div>
      </section>
      <section className="py-24 max-w-7xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-12">Como Funciona</h2>
        <div className="grid md:grid-cols-3 gap-20">
          <div className="space-y-4">
            <div className="text-4xl font-black opacity-10">01</div>
            <h3 className="text-xl font-bold uppercase">Escolha</h3>
            <p className="text-gray-500 leading-relaxed">Navegue em nosso catálogo de pronta entrega ou envie o link de qualquer produto americano.</p>
          </div>
          <div className="space-y-4">
            <div className="text-4xl font-black opacity-10">02</div>
            <h3 className="text-xl font-bold uppercase">Consolidação</h3>
            <p className="text-gray-500 leading-relaxed">Recebemos em nosso depósito em Miami, conferimos cada detalhe e embalamos para envio.</p>
          </div>
          <div className="space-y-4">
            <div className="text-4xl font-black opacity-10">03</div>
            <h3 className="text-xl font-bold uppercase">Receba</h3>
            <p className="text-gray-500 leading-relaxed">Acompanhe pelo código de rastreio até a chegada em sua porta no Brasil.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ShopView({ products, onProductClick, onAddToCart, favs, onFav }) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-end mb-12">
         <h2 className="text-4xl font-bold">Nossos Produtos</h2>
         <span className="text-gray-400 text-xs uppercase font-bold">{products.length} Itens encontrados</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map(p => (
          <div key={p.id} className="product-card">
             <div className="img-placeholder relative group" onClick={() => onProductClick(p)}>
                <span className="text-[10px] uppercase font-bold tracking-widest">{p.brand}</span>
                <button 
                  onClick={(e) => {e.stopPropagation(); onFav(p.id);}} 
                  className={`absolute top-4 right-4 p-2 rounded-full bg-white shadow-sm ${favs.includes(p.id) ? 'text-red-500' : 'text-gray-300'}`}
                >
                  <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </button>
             </div>
             <div className="p-4 bg-white">
                <h3 className="font-bold text-gray-700 truncate mb-1">{p.name}</h3>
                <div className="text-amber-600 font-black text-lg mb-4">R$ {p.price}</div>
                <button onClick={() => onAddToCart(p)} className="w-full bg-black text-white py-3 text-[10px] uppercase font-bold hover:bg-amber-600 transition-colors">Adicionar ao Carrinho</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductDetail({ product, onAddToCart, onBack }) {
  const [reviews, setReviews] = useState([]);
  useEffect(() => {
    supabase.from('reviews').select('*').eq('product_id', product.id).then(({data}) => setReviews(data || []));
  }, [product]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <button onClick={onBack} className="text-gray-400 mb-10 flex items-center gap-2">← Voltar para a Loja</button>
      <div className="grid md:grid-cols-2 gap-20">
        <div className="bg-gray-100 h-[600px] flex items-center justify-center">
          <span className="text-4xl stencil opacity-10">DOS STATES</span>
        </div>
        <div className="space-y-8">
          <div className="mono text-xs text-amber-600 font-bold uppercase tracking-widest">{product.brand}</div>
          <h2 className="text-5xl font-bold">{product.name}</h2>
          <div className="text-3xl font-black">R$ {product.price}</div>
          <p className="text-gray-500 leading-relaxed py-6 border-y border-gray-100">
            Produto 100% original adquirido em lojas oficiais nos Estados Unidos. Garantia de procedência Dos States.
          </p>
          <button onClick={() => onAddToCart(product)} className="w-full bg-black text-white py-5 font-bold uppercase text-xs">Adicionar ao Carrinho</button>
          
          <div className="pt-10">
             <h4 className="font-bold mb-6 text-xl">Avaliações ({reviews.length})</h4>
             {reviews.length === 0 ? <p className="text-gray-400 italic">Nenhuma avaliação ainda para este item.</p> : (
               <div className="space-y-6">
                 {reviews.map(r => (
                   <div key={r.id} className="border-b pb-6">
                      <div className="flex gap-2 text-amber-500 mb-2">
                        {Array.from({length: r.rating}).map((_, i) => <span key={i}>★</span>)}
                      </div>
                      <p className="text-gray-700 mb-1">{r.comment}</p>
                      <span className="text-[10px] uppercase font-bold opacity-30">{r.user_name?.replace(/(.{2}).+(.{2})/, '$1***$2')}</span>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function CartView({ cart, setCart, onCheckout }) {
  const updateQty = (id, delta) => {
    setCart(cart.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + delta) } : item).filter(item => item.qty > 0));
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h2 className="text-4xl font-bold mb-10">Seu Carrinho</h2>
      {cart.length === 0 ? <div className="py-20 text-center text-gray-400">Seu carrinho está vazio.</div> : (
        <div className="space-y-6">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-center bg-white p-6 border">
               <div className="flex gap-6 items-center">
                  <div className="w-16 h-16 bg-gray-100"></div>
                  <div>
                    <div className="font-bold">{item.name}</div>
                    <div className="text-xs text-gray-400 uppercase tracking-widest">{item.brand}</div>
                  </div>
               </div>
               <div className="flex items-center gap-10">
                  <div className="flex items-center border p-2 gap-4">
                    <button onClick={() => updateQty(item.id, -1)}>-</button>
                    <span className="font-bold">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)}>+</button>
                  </div>
                  <div className="font-bold text-lg w-32 text-right">R$ {(item.price * item.qty).toFixed(2)}</div>
               </div>
            </div>
          ))}
          <div className="pt-10 border-t flex justify-between items-end">
             <div>
                <div className="text-xs uppercase font-bold text-gray-400 mb-1">Total da Compra</div>
                <div className="text-5xl font-black">R$ {cart.reduce((a,b) => a + (b.price * b.qty), 0).toFixed(2)}</div>
             </div>
             <button onClick={onCheckout} className="bg-black text-white px-12 py-5 font-bold uppercase text-xs">Finalizar Pedido (WhatsApp)</button>
          </div>
        </div>
      )}
    </div>
  );
}

function DashboardView({ user, products, favorites, onProductClick }) {
  const [tab, setTab] = useState('orders');
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (user) supabase.from('orders').select('*').eq('user_id', user.id).then(({data}) => setOrders(data || []));
  }, [user]);

  if (!user) return <div className="max-w-xl mx-auto py-20">Faça login para acessar seu painel.</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-4xl font-bold">Minha Conta</h2>
        <button onClick={() => supabase.auth.signOut()} className="text-xs font-bold uppercase opacity-30">Encerrar Sessão</button>
      </div>

      <div className="flex gap-10 border-b mb-10">
        <button onClick={() => setTab('orders')} className={`tab-btn ${tab === 'orders' ? 'active' : ''}`}>Minhas Compras</button>
        <button onClick={() => setTab('favorites')} className={`tab-btn ${tab === 'favorites' ? 'active' : ''}`}>Favoritos</button>
        <button onClick={() => setTab('tracking')} className={`tab-btn ${tab === 'tracking' ? 'active' : ''}`}>Itens à Caminho</button>
      </div>

      {tab === 'orders' && (
        <div className="space-y-4">
           {orders.length === 0 ? <p className="text-gray-400 italic">Você ainda não realizou compras.</p> : (
             orders.map(o => (
               <div key={o.id} className="bg-white border p-6 flex justify-between">
                  <div>
                    <div className="text-xs text-gray-400">PEDIDO #{o.id.slice(0,8).toUpperCase()}</div>
                    <div className="font-bold text-lg">Total: R$ {o.total_price}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold uppercase text-amber-600">{o.status}</div>
                    {o.tracking_code && <div className="text-[10px] opacity-40">RASTREIO: {o.tracking_code}</div>}
                  </div>
               </div>
             ))
           )}
        </div>
      )}

      {tab === 'favorites' && (
        <div className="grid grid-cols-4 gap-6">
           {products.filter(p => favorites.includes(p.id)).map(p => (
             <div key={p.id} className="product-card cursor-pointer" onClick={() => onProductClick(p)}>
                <div className="img-placeholder text-[8px] uppercase">{p.brand}</div>
                <div className="p-4"><h4 className="font-bold truncate">{p.name}</h4></div>
             </div>
           ))}
        </div>
      )}

      {tab === 'tracking' && (
        <div className="space-y-4">
           {orders.filter(o => o.status === 'Em Trânsito').map(o => (
             <div key={o.id} className="bg-blue-50 border border-blue-100 p-8 rounded-sm">
                <div className="flex justify-between items-center">
                   <div>
                     <div className="text-blue-900 font-bold mb-1">SEU PACOTE ESTÁ VOANDO!</div>
                     <div className="text-xs opacity-50">Código de Rastreio: {o.tracking_code}</div>
                   </div>
                   <button className="bg-blue-900 text-white px-6 py-2 text-[10px] font-bold uppercase">Rastrear no site</button>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
