import { Mail, Lock, Info, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-transparent">
      <div className="mb-12">
        <Link to="/" className="text-4xl font-black tracking-tighter text-white uppercase font-display">Lumina</Link>
      </div>
      <div className="w-full max-w-[540px] glass-panel rounded-[40px] border-white/10 p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/10 blur-[80px] -ml-32 -mt-32"></div>
        
        <div className="mb-12 text-center relative z-10">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-4">New Era Join</p>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Create Account</h1>
        </div>
        
        <form className="space-y-6 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-3 ml-1">First Identity</label>
              <input placeholder="Jane" className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium" />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-3 ml-1">Last Identity</label>
              <input placeholder="Doe" className="w-full h-14 px-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-3 ml-1">Email Connection</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="email" 
                placeholder="jane.doe@example.com" 
                className="w-full h-14 pl-14 pr-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-3 ml-1">Secure Passkey</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full h-14 pl-14 pr-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-3 mt-3 ml-1 text-white/30">
              <Info size={14} className="shrink-0" />
              <p className="text-[9px] leading-tight uppercase font-bold tracking-widest">Complexity required: 8+ chars, numbers & uppercase.</p>
            </div>
          </div>

          <button className="w-full h-14 bg-white text-[#0f172a] font-black rounded-2xl hover:bg-white/90 transition-all uppercase text-xs tracking-widest shadow-xl active:scale-95 mt-4 group flex items-center justify-center gap-3">
            Register Agent
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="my-10 flex items-center gap-4 relative z-10">
          <div className="flex-grow h-px bg-white/10"></div>
          <span className="text-[10px] font-bold text-white/20 uppercase tracking-[0.3em]">Protocol</span>
          <div className="flex-grow h-px bg-white/10"></div>
        </div>

        <div className="text-center relative z-10">
          <p className="text-sm font-medium text-white/40">
            Existing member? <Link to="/login" className="font-bold text-white hover:text-purple-300 transition-colors border-b border-white/10 ml-2 pb-0.5">Authorization Flow</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
