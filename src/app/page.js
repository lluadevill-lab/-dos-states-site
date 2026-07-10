'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// --- COMPONENTES ESTILO OREBISHOPPING ---

const Header = ({ setView, cartCount }) => (
  <div className="w-full h-20 bg-white border-b-[1px] border-b-gray-200 sticky top-0 z-50">
    <div className="max-w-container mx-auto h-full px-4 flex items-center justify-between">
      <div onClick={() => setView('home')} className="cursor-pointer">
        <h1 className="text-2xl font-bold tracking-tighter">DOS STATES<span className="text-orange-500">.</span></h1>
      </div>
      <div>
        <ul className="flex items-center gap-10">
          <li className="navBarItem" onClick={() => setView('home')}>Home</li>
          <li className="navBarItem" onClick={() => setView('shop')}>Loja</li>
          <li className="navBarItem" onClick={() => setView('about')}>Sobre</li>
          <li className="navBarItem" onClick={() => setView('contact')}>Contato</li>
        </ul>
      </div>
      <div className="flex items-center gap-6 relative">
         <div onClick={() => setView('cart')} className="relative cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
            <span className="absolute -top-2 -right-2 bg-primeColor text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
         </div>
         <div onClick={() => setView('account')} className="cursor-pointer">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
         </div>
      </div>
    </div>
  </div>
);

const Product = ({ product, onAdd, onView }) => (
  <div className="w-full relative group border-[1px] border-gray-200 overflow-hidden">
    <div className="max-w-80 h-80 relative cursor-pointer bg-[#F5F5F3] flex items-center justify-center" onClick={() => onView(product)}>
       <span className="text-4xl font-black opacity-5 stencil">DOS STATES</span>
       <div className="absolute top-6 left-8">
          {product.badge && <div className="bg-primeColor w-20 h-7 text-white flex justify-center items-center text-xs font-semibold">{product.badge}</div>}
       </div>
       <div className="absolute bottom-0 w-full h-20 bg-white translate-y-[100%] group-hover:translate-y-0 transition-transform duration-500 flex flex-col justify-center px-4">
          <button onClick={(e) => {e.stopPropagation(); onAdd(product);}} className="text-sm font-bold flex items-center gap-2 hover:text-orange-600 transition-colors">
            ADICIONAR AO CARRINHO <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
          </button>
       </div>
    </div>
    <div className="max-w-80 py-6 flex flex-col gap-1 px-4">
      <div className="flex items-center justify-between font-titleFont">
        <h2 className="text-lg text-primeColor font-bold truncate">{product.name}</h2>
        <p className="text-[#767676] text-[14px]">R${product.price}</p>
      </div>
      <p className="text-[#767676] text-[14px]">{product.brand}</p>
    </div>
  </div>
);

// --- PÁGINA PRINCIPAL ---

export default function OrebishoppingPlatform() {
  const [view, setView] = useState('home');
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.from('products').select('*').then(({data}) => setProducts(data || []));
    supabase.auth.getUser().then(({data}) => setUser(data.user));
  }, []);

  const addToCart = (p) => {
    setCart([...cart, { ...p, cartId: Math.random(), qty: 1 }]);
    alert("Produto adicionado com sucesso!");
  };

  return (
    <div className="w-full mx-auto">
      <Header setView={setView} cartCount={cart.length} />
      
      <main>
        {view === 'home' && (
          <div className="w-full">
            {/* Banner Orebishopping Style */}
            <div className="w-full h-[600px] bg-[#F5F5F3] flex items-center px-20 overflow-hidden relative">
               <div className="max-w-container mx-auto grid grid-cols-2">
                  <div className="flex flex-col gap-6">
                    <h1 className="text-7xl font-bold text-primeColor leading-none">Novas chegadas <br/> de Miami.</h1>
                    <p className="text-base text-gray-500 max-w-[400px]">Sua ponte direta com as melhores lojas dos EUA. Originalidade e segurança garantida.</p>
                    <button onClick={() => setView('shop')} className="bg-primeColor text-white w-44 h-12 text-sm font-bold uppercase hover:bg-black">Ver Loja</button>
                  </div>
               </div>
            </div>
            {/* Como Funciona Section */}
            <div className="max-w-container mx-auto py-20 px-4 grid grid-cols-3 gap-10">
               <div className="flex flex-col gap-2">
                  <h3 className="font-bold text-xl uppercase italic">Logística Reversa</h3>
                  <p className="text-gray-500 text-sm">Compramos e consolidamos tudo em Miami para você economizar no frete.</p>
               </div>
               <div className="flex flex-col gap-2 border-l pl-10 border-gray-200">
                  <h3 className="font-bold text-xl uppercase italic">Segurança Total</h3>
                  <p className="text-gray-500 text-sm">Você acompanha cada passo da sua carga através do nosso sistema de rastreio.</p>
               </div>
               <div className="flex flex-col gap-2 border-l pl-10 border-gray-200">
                  <h3 className="font-bold text-xl uppercase italic">Atendimento VIP</h3>
                  <p className="text-gray-500 text-sm">Dúvidas? Nossa equipe no Brasil e nos EUA está pronta para responder seus tickets.</p>
               </div>
            </div>
          </div>
        )}

        {view === 'shop' && (
          <div className="max-w-container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold mb-10">Todos os Produtos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
               {products.map(p => (
                 <Product key={p.id} product={p} onAdd={addToCart} onView={(prod) => {setSelectedProduct(prod); setView('product');}} />
               ))}
            </div>
          </div>
        )}

        {view === 'product' && selectedProduct && (
          <div className="max-w-container mx-auto px-4 py-20 grid grid-cols-2 gap-20">
             <div className="w-full h-[600px] bg-[#F5F5F3] flex items-center justify-center">
                <span className="text-6xl font-black opacity-10">DOS STATES</span>
             </div>
             <div className="flex flex-col gap-6">
                <h2 className="text-4xl font-bold">{selectedProduct.name}</h2>
                <p className="text-2xl font-black text-orange-600">R$ {selectedProduct.price}</p>
                <div className="border-y py-6 border-gray-200 text-gray-500 leading-relaxed">
                  Este produto é 100% original. Adquirido diretamente em revendedores oficiais nos Estados Unidos.
                </div>
                <button onClick={() => addToCart(selectedProduct)} className="bg-primeColor text-white h-14 font-bold uppercase hover:bg-black duration-300">Adicionar ao Carrinho</button>
                <div className="mt-10">
                   <h4 className="font-bold text-lg mb-4">Avaliações</h4>
                   <p className="text-gray-400 italic text-sm">Nenhuma avaliação para este produto ainda.</p>
                </div>
             </div>
          </div>
        )}

        {view === 'cart' && (
          <div className="max-w-container mx-auto px-4 py-20">
            <h2 className="text-3xl font-bold mb-10">Carrinho</h2>
            <div className="w-full bg-[#F5F5F3] p-10 flex flex-col gap-4">
               {cart.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center border-b pb-4">
                    <div className="font-bold">{item.name}</div>
                    <div className="font-black text-lg">R$ {item.price}</div>
                 </div>
               ))}
               <div className="text-right mt-10">
                  <p className="text-4xl font-black">Total: R$ {cart.reduce((a,b) => a + Number(b.price), 0).toFixed(2)}</p>
                  <button className="bg-primeColor text-white px-10 py-4 mt-6 font-bold uppercase">Finalizar Compra</button>
               </div>
            </div>
          </div>
        )}

        {view === 'account' && (
           <div className="max-w-container mx-auto px-4 py-20">
              <h2 className="text-3xl font-bold mb-10">Minha Conta</h2>
              <div className="grid grid-cols-4 gap-10">
                 <div className="col-span-1 flex flex-col gap-4">
                    <button className="text-left font-bold border-b pb-2">Minhas Compras</button>
                    <button className="text-left opacity-50">Favoritos</button>
                    <button className="text-left opacity-50">Itens à Caminho</button>
                    <button className="text-left opacity-50">Meu Perfil</button>
                 </div>
                 <div className="col-span-3">
                    <div className="w-full border p-10">
                       <p className="text-gray-400 italic">— Nenhuma compra registrada —</p>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </main>
      
      <footer className="w-full bg-[#F5F5F3] py-20 mt-20">
         <div className="max-w-container mx-auto px-4 grid grid-cols-4 gap-10">
            <div className="col-span-2">
               <h1 className="text-2xl font-bold mb-4">DOS STATES.</h1>
               <p className="text-sm text-gray-500 max-w-sm">Sua solução definitiva para importação direta dos Estados Unidos para o Brasil.</p>
            </div>
            <div>
               <h4 className="font-bold mb-4 uppercase text-xs">Menu</h4>
               <ul className="text-sm text-gray-500 flex flex-col gap-2 cursor-pointer">
                  <li onClick={() => setView('home')}>Home</li>
                  <li onClick={() => setView('shop')}>Loja</li>
                  <li onClick={() => setView('account')}>Minha Conta</li>
               </ul>
            </div>
            <div>
               <h4 className="font-bold mb-4 uppercase text-xs">Suporte</h4>
               <ul className="text-sm text-gray-500 flex flex-col gap-2">
                  <li>WhatsApp</li>
                  <li>E-mail</li>
                  <li>Rastreio</li>
               </ul>
            </div>
         </div>
      </footer>
    </div>
  );
}
