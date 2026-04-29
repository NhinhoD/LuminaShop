import { useState } from 'react';
import { Lock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Checkout() {
  return (
    <div className="pt-40 pb-20 min-h-screen bg-slate-50/50">
      <div className="max-w-[1280px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-8">
            <span className="text-black">Information</span>
            <ChevronRight size={14} />
            <span>Shipping</span>
            <ChevronRight size={14} />
            <span>Payment</span>
          </nav>

          <section className="bg-white rounded-xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-extrabold tracking-tighter mb-8 border-b border-slate-100 pb-4">Shipping Information</h2>
            
            <form className="space-y-6">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Contact</label>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  className="w-full border-slate-200 rounded-sm py-3 px-4 focus:border-blue-600 focus:ring-0 text-sm bg-slate-50 transition-colors"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 block mb-2">Shipping Address</label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <input placeholder="First name" className="border-slate-200 rounded-sm py-3 px-4 text-sm bg-slate-50 w-full" />
                  <input placeholder="Last name" className="border-slate-200 rounded-sm py-3 px-4 text-sm bg-slate-50 w-full" />
                </div>
                <input placeholder="Address" className="border-slate-200 rounded-sm py-3 px-4 text-sm bg-slate-50 w-full mb-4" />
                <input placeholder="Apartment, suite, etc. (optional)" className="border-slate-200 rounded-sm py-3 px-4 text-sm bg-slate-50 w-full mb-4" />
                <div className="grid grid-cols-3 gap-4">
                  <input placeholder="City" className="border-slate-200 rounded-sm py-3 px-4 text-sm bg-slate-50" />
                  <select className="border-slate-200 rounded-sm py-3 px-4 text-sm bg-slate-50 appearance-none">
                    <option>State / Province</option>
                  </select>
                  <input placeholder="ZIP code" className="border-slate-200 rounded-sm py-3 px-4 text-sm bg-slate-50" />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input type="checkbox" className="w-5 h-5 text-blue-600 border-slate-200 rounded focus:ring-blue-600" />
                <span className="text-sm text-slate-600 group-hover:text-black">Save this information for next time</span>
              </label>
            </form>
          </section>

          <div className="mt-8 flex justify-end">
            <button className="bg-blue-600 text-white font-bold py-4 px-12 rounded-sm hover:bg-blue-700 transition-all active:scale-95 shadow-md">
              Continue to Shipping
            </button>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="sticky top-40 bg-white rounded-xl p-8 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-extrabold tracking-tighter mb-8 border-b border-slate-100 pb-4">Order Summary</h2>
            
            <div className="space-y-6 mb-8 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              <div className="flex gap-4 items-center">
                <div className="w-20 h-20 rounded bg-slate-50 overflow-hidden shrink-0 relative border border-slate-100">
                  <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" />
                  <div className="absolute -top-2 -right-2 bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">1</div>
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-slate-900">Aero Glide Runners</h4>
                  <p className="text-xs text-slate-400">Crimson Red / Size 10</p>
                </div>
                <span className="font-bold text-slate-900">$145.00</span>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-bold">$195.00</span>
              </div>
              <div className="flex justify-between items-end pt-4">
                <span className="text-xl font-bold">Total</span>
                <span className="text-4xl font-extrabold">$210.60</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
