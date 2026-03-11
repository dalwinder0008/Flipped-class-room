import React, { useState } from "react";
import { auth, googleProvider, signInWithPopup } from "@/src/lib/firebase";
import { motion } from "framer-motion";
import { LogIn, GraduationCap, BookOpen, School, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/");
    } catch (err: any) {
      console.error(err);
      setError("Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden">
      {/* Background Blobs & Patterns */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-600/10 rounded-full blur-[120px] animate-blob" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] animate-blob [animation-delay:2s]" />
        
        {/* Floating Education Icons */}
        <div className="absolute top-[15%] left-[15%] text-white/5 animate-pulse">
          <BookOpen className="w-24 h-24 rotate-12" />
        </div>
        <div className="absolute bottom-[20%] left-[20%] text-white/5 animate-bounce [animation-duration:10s]">
          <GraduationCap className="w-32 h-32 -rotate-12" />
        </div>
        <div className="absolute top-[40%] right-[15%] text-white/5 animate-pulse [animation-delay:3s]">
          <School className="w-28 h-28 rotate-6" />
        </div>
        <div className="absolute bottom-[10%] right-[25%] text-white/5 animate-bounce [animation-duration:8s]">
          <Pencil className="w-20 h-20 -rotate-45" />
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 md:p-12 max-w-md w-full relative z-10 text-center"
      >
        <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-600/40 mx-auto mb-6">
          <span className="text-3xl font-bold text-white">F</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Welcome to FlipSense</h1>
        <p className="text-slate-400 mb-8">Sign in to share your flipped classroom feedback and view analytics.</p>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm mb-6">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 font-bold py-4 rounded-xl hover:bg-slate-100 transition-all disabled:opacity-50"
        >
          {loading ? (
            <div className="w-6 h-6 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
              Continue with Google
            </>
          )}
        </button>

        <p className="mt-8 text-xs text-slate-500">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
