"use client";

import Link from "next/link";
import { useCart } from "@/presentation/components/common/CartContext";
import { ROUTES } from "@/presentation/constants";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex-grow pt-32 pb-24 px-8 max-w-[1440px] mx-auto w-full flex flex-col items-center justify-center text-center">
        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-slate-300 text-4xl">shopping_bag</span>
        </div>
        <h1 className="text-3xl font-bold text-slate-950 mb-4">Your cart is empty</h1>
        <p className="text-slate-500 mb-10 max-w-md text-sm">Looks like you haven't added anything to your cart yet. Explore our collection to find your next favorite piece.</p>
        <Link 
          href={ROUTES.SHOP} 
          className="bg-slate-950 text-white font-bold text-xs px-10 py-4 rounded uppercase tracking-widest hover:bg-slate-800 transition-colors"
        >
          Start Shopping
        </Link>
      </main>
    );
  }

  return (
    <main className="flex-grow pt-32 pb-24 px-8 max-w-[1440px] mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-20">
        
        {/* Cart Items */}
        <div className="flex-grow lg:max-w-3xl">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-slate-950 mb-2">Shopping Bag</h1>
            <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">{items.length} {items.length === 1 ? 'item' : 'items'}</p>
          </header>

          <div className="space-y-12">
            {items.map((item) => (
              <div key={item.id} className="flex gap-8 group">
                <div className="w-32 h-40 bg-slate-50 rounded-lg overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img 
                      alt={item.title} 
                      className="w-full h-full object-cover mix-blend-multiply opacity-90" 
                      src={item.imageUrl} 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <span className="material-symbols-outlined">image</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col flex-grow py-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-slate-950 text-lg mb-1">{item.title}</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Premium Selection</p>
                    </div>
                    <p className="font-bold text-slate-950 text-base">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>

                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center border border-slate-100 rounded-full h-9 px-1">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">remove</span>
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-950">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-950 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-[400px] flex-shrink-0">
          <div className="bg-slate-50 rounded-2xl p-10 sticky top-32">
            <h2 className="text-xl font-bold text-slate-950 mb-8">Order Summary</h2>
            
            <div className="space-y-6 mb-8 pb-8 border-b border-slate-200">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-950 font-bold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Shipping</span>
                <span className="text-slate-950 font-bold uppercase text-[10px] tracking-widest">Calculated at checkout</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Estimated Tax</span>
                <span className="text-slate-950 font-bold">${(subtotal * 0.08).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-10">
              <span className="font-bold text-slate-950">Total</span>
              <span className="text-2xl font-bold text-slate-950">${(subtotal * 1.08).toFixed(2)}</span>
            </div>

            <Link 
              href={ROUTES.CHECKOUT}
              className="w-full bg-slate-950 text-white font-bold text-xs py-5 rounded uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-[#0051d5] transition-all"
            >
              Secure Checkout
            </Link>

            <div className="mt-10 pt-10 border-t border-slate-200 grid grid-cols-3 gap-4 opacity-30 grayscale pointer-events-none">
              <div className="h-8 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold">VISA</div>
              <div className="h-8 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold">MC</div>
              <div className="h-8 bg-slate-200 rounded flex items-center justify-center text-[10px] font-bold">AMEX</div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
