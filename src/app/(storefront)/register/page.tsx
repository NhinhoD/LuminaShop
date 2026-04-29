import Link from "next/link";
import { signup } from "@/presentation/actions/auth";
import { ROUTES, BRAND_NAME, UI_LABELS, PLACEHOLDERS } from "@/presentation/constants";

export default async function RegisterPage({ searchParams }: { searchParams: { error?: string } }) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center py-20 px-4">
      {/* Brand Header */}
      <h1 className="text-4xl font-black tracking-[0.2em] text-slate-950 uppercase mb-12">
        {BRAND_NAME}
      </h1>

      {/* Registration Card */}
      <div className="w-full max-w-[540px] bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-slate-100 p-10 md:p-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{UI_LABELS.CREATE_ACCOUNT}</h2>
          <p className="text-slate-500 text-sm max-w-[80%] mx-auto">
            Join our community for an elevated shopping experience and exclusive early access.
          </p>
          {params?.error && (
            <p className="text-red-500 text-xs mt-4 font-medium bg-red-50 py-2 rounded-sm">Registration failed. Please try again.</p>
          )}
        </div>

        <form action={signup} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="firstName">
                First Name
              </label>
              <input 
                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all placeholder:text-slate-300"
                id="firstName" 
                name="firstName" 
                placeholder={PLACEHOLDERS.FIRST_NAME} 
                required 
                type="text" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="lastName">
                Last Name
              </label>
              <input 
                className="w-full h-12 px-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all placeholder:text-slate-300"
                id="lastName" 
                name="lastName" 
                placeholder={PLACEHOLDERS.LAST_NAME} 
                required 
                type="text" 
              />
            </div>
          </div>

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
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="password">
              Password
            </label>
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
            <p className="mt-2 flex items-start gap-2 text-[10px] text-slate-400 leading-tight">
              <span className="material-symbols-outlined text-[14px]">info</span>
              Must be at least 8 characters, with one uppercase letter and one number.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0051d5] transition-colors text-[20px]">
                lock_reset
              </span>
              <input 
                className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-sm text-sm focus:border-[#0051d5] focus:ring-1 focus:ring-[#0051d5] outline-none transition-all placeholder:text-slate-300"
                id="confirmPassword" 
                name="confirmPassword" 
                placeholder={PLACEHOLDERS.PASSWORD} 
                required 
                type="password" 
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full h-12 bg-black text-white font-bold rounded-sm hover:bg-slate-900 transition-all flex items-center justify-center gap-2 group shadow-lg active:scale-[0.98]"
          >
            {UI_LABELS.CREATE_ACCOUNT}
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
          Already have an account? <Link href={ROUTES.LOGIN} className="text-slate-950 font-black hover:underline underline-offset-4">{UI_LABELS.LOG_IN}</Link>
        </div>
      </div>
    </div>
  );
}
