import { Mail, Lock, Apple } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-transparent">
      <div className="mb-12">
        <Link to="/" className="text-4xl font-black tracking-tighter text-white uppercase font-display">Lumina</Link>
      </div>
      <div className="w-full max-w-[480px] glass-panel rounded-[40px] border-white/10 p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] -mr-32 -mt-32"></div>
        
        <div className="mb-12 text-center relative z-10">
          <p className="text-[10px] font-bold text-purple-400 uppercase tracking-[0.4em] mb-4">Welcome Back</p>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">Access Account</h1>
        </div>
        
        <form className="space-y-6 relative z-10">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-3 ml-1">Email Identifier</label>
            <div className="relative">
              <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="email" 
                placeholder="name@example.com" 
                className="w-full h-14 pl-14 pr-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 block mb-3 ml-1">Secret Key</label>
            <div className="relative">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full h-14 pl-14 pr-5 rounded-2xl bg-white/5 border border-white/10 focus:border-white/30 text-white outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded-md border border-white/20 bg-white/5 flex items-center justify-center transition-all group-hover:border-white/40">
                <div className="w-2 h-2 bg-white rounded-sm opacity-0 0 group-hover:opacity-20"></div>
              </div>
              <span className="text-xs font-bold text-white/40 group-hover:text-white transition-colors tracking-wide">Stay connected</span>
            </label>
            <Link to="#" className="text-xs font-bold text-purple-300 hover:text-white transition-all uppercase tracking-widest">Recovery</Link>
          </div>

          <button className="w-full h-14 bg-white text-[#0f172a] font-black rounded-2xl hover:bg-white/90 transition-all uppercase text-xs tracking-widest shadow-xl active:scale-95 mt-4">
            Authorize
          </button>
        </form>

        <div className="my-10 flex items-center gap-4 relative z-10">
          <div className="flex-grow h-px bg-white/10"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">Standard Access</span>
          <div className="flex-grow h-px bg-white/10"></div>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <button className="h-14 glass-panel border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest text-white/70">
            <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" className="w-5 h-5 opacity-70" alt="Google" />
            Google
          </button>
          <button className="h-14 glass-panel border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all text-xs font-bold uppercase tracking-widest text-white/70">
            <Apple size={20} className="fill-white" />
            Apple
          </button>
        </div>

        <div className="mt-12 text-center relative z-10">
          <p className="text-sm font-medium text-white/40">
            New here? <Link to="/register" className="font-bold text-white hover:text-purple-300 transition-colors border-b border-white/10 ml-2 pb-0.5">Register account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
