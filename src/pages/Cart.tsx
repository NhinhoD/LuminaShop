import { Plus, Minus, Trash2, Lock, Truck, ShieldCheck, CreditCard } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

export default function Cart() {
  const cartItems = [
    { id: 1, name: 'Aura Lounge Chair', price: 895, qty: 1, variant: 'Color: Oat • Material: Bouclé', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2158&auto=format&fit=crop' },
    { id: 2, name: 'Nocturne Ceramic Vase', price: 145, qty: 2, variant: 'Size: Large • Finish: Matte', img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=2070&auto=format&fit=crop' },
  ];

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;

  return (
    <div className="pt-32 pb-20 px-8 max-w-[1280px] mx-auto w-full">
      <header className="mb-12">
        <h1 className="text-4xl font-extrabold tracking-tighter">Your Cart</h1>
        <p className="text-slate-500 font-medium mt-2">{cartItems.length} items selected</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Cart Items */}
        <div className="lg:col-span-8 space-y-6">
          {cartItems.map((item) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col sm:flex-row gap-8 p-6 bg-white rounded-xl shadow-sm border border-slate-100 group"
            >
              <div className="w-full sm:w-40 h-40 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col flex-grow justify-between py-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight text-slate-900">{item.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">{item.variant}</p>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">${item.price.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center mt-6">
                  <div className="flex items-center border border-slate-200 rounded-sm h-10">
                    <button className="px-3 hover:text-black transition-colors"><Minus size={16} /></button>
                    <span className="px-4 font-bold text-sm min-w-[40px] text-center">{item.qty}</span>
                    <button className="px-3 hover:text-black transition-colors"><Plus size={16} /></button>
                  </div>
                  <button className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors">
                    <Trash2 size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Remove</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Sidebar Summary */}
        <div className="lg:col-span-4 sticky top-32">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-bold">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="font-bold uppercase text-[10px] tracking-widest text-slate-400">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estimated Tax</span>
                <span className="font-bold">${taxes.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-slate-100 pt-6 mb-8">
              <span className="text-xl font-bold">Total</span>
              <span className="text-3xl font-extrabold">${total.toLocaleString()}</span>
            </div>

            <Link 
              to="/checkout"
              className="w-full bg-blue-600 text-white py-4 rounded-sm font-bold flex items-center justify-center gap-3 hover:bg-blue-700 transition-all shadow-md group"
            >
              <Lock size={18} />
              Proceed to Checkout
            </Link>

            <div className="mt-8 flex justify-center gap-6 text-slate-300">
              <Truck size={24} />
              <ShieldCheck size={24} />
              <CreditCard size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
