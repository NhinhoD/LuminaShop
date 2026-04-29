import Link from "next/link";
import { login } from "@/presentation/actions/auth";
import { ROUTES, BRAND_NAME, UI_LABELS, PLACEHOLDERS } from "@/presentation/constants";

export default async function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center py-20 px-4">
      {/* Brand Header */}
      <h1 className="text-4xl font-black tracking-[0.2em] text-slate-950 uppercase mb-12">
        {BRAND_NAME}
      </h1>

      {/* Login Card */}
      <div className="w-full max-w-[480px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{UI_LABELS.LOG_IN}</h2>
          <p className="text-slate-500 text-sm">Welcome back. Please enter your details.</p>
          {params?.error && (
            <p className="text-red-500 text-xs mt-4 font-medium bg-red-50 py-2 rounded-sm">Invalid email or password.</p>
          )}
        </div>

        <form action={login} className="space-y-6">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="email">
              Email Address
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0051d5] transition-colors text-[20px]">
                mail
              </span>
              <input 
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all placeholder:text-slate-300"
                id="email" 
                name="email" 
                placeholder={PLACEHOLDERS.EMAIL}
                required 
                type="email" 
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider" htmlFor="password">
                Password
              </label>
              <Link href="#" className="text-[10px] font-bold text-[#0051d5] uppercase tracking-wider hover:underline">Forgot password?</Link>
            </div>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0051d5] transition-colors text-[20px]">
                lock
              </span>
              <input 
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all placeholder:text-slate-300"
                id="password" 
                name="password" 
                placeholder={PLACEHOLDERS.PASSWORD}
                required 
                type="password" 
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-12 bg-[#0051d5] text-white font-bold rounded-sm hover:bg-[#0041ac] transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-[0.98]"
          >
            {UI_LABELS.LOG_IN}
            <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
          </button>
        </form>

        <div className="relative my-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            <span className="bg-white px-4">Or</span>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500">
          Don't have an account? <Link href={ROUTES.REGISTER} className="text-slate-950 font-black hover:underline underline-offset-4">Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
