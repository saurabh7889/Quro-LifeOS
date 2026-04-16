import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, Mail, Lock, User, ArrowRight, Sparkles, Sun, Moon, KeyRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../api";

type AuthView = 'login' | 'register' | 'forgot' | 'reset';

export function Login() {
  const { login, register } = useAuth();
  const [view, setView] = useState<AuthView>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains("dark"));
  
  const [resetToken, setResetToken] = useState("");
  const [resetId, setResetId] = useState("");

  useEffect(() => {
    const handleThemeChange = () => setIsDark(document.documentElement.classList.contains("dark"));
    window.addEventListener("themechange", handleThemeChange);
    
    // Check if we have a reset token in the URL
    const params = new URLSearchParams(window.location.search);
    const token = params.get('resetToken');
    const id = params.get('id');
    if (token && id) {
      setResetToken(token);
      setResetId(id);
      setView('reset');
    }
    
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  const toggleTheme = () => {
    const html = document.documentElement;
    if (html.classList.contains("dark")) {
      html.classList.remove("dark");
      localStorage.setItem("quro_theme", "light");
      setIsDark(false);
    } else {
      html.classList.add("dark");
      localStorage.setItem("quro_theme", "dark");
      setIsDark(true);
    }
    window.dispatchEvent(new Event("themechange"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      if (view === 'register') {
        if (!name.trim()) throw new Error("Name is required");
        await register(name, email, password);
      } else if (view === 'login') {
        await login(email, password);
      } else if (view === 'forgot') {
        if (!email.trim()) throw new Error("Email is required");
        const res = await api.auth.forgotPassword(email);
        setSuccess(res.message || "Reset link sent to your email");
      } else if (view === 'reset') {
        if (password !== confirmPassword) throw new Error("Passwords do not match");
        if (password.length < 4) throw new Error("Password must be at least 4 characters");
        const res = await api.auth.resetPassword(resetId, resetToken, password);
        setSuccess(res.message || "Password reset successfully");
        setTimeout(() => {
          window.location.href = '/'; // clear URL params and hit login
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Switch to another view, clearing errors
  const switchView = (newView: AuthView) => {
    setView(newView);
    setError("");
    setSuccess("");
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex items-center justify-center relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <button onClick={toggleTheme} className="absolute top-6 right-6 p-3 rounded-xl glass hover:bg-white/10 transition-colors z-50 shadow-xl">
        {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-400" />}
      </button>

      <motion.div initial={{ opacity: 0, y: 30, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5 }} className="relative z-10 w-full max-w-md mx-4">
        <div className="glass rounded-3xl p-8 space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto glow">
              {view === 'forgot' || view === 'reset' ? <KeyRound className="w-9 h-9 text-white" /> : <Brain className="w-9 h-9 text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">QURO</h1>
              <p className="text-sm text-muted-foreground">Life Operating System</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">
                {view === 'register' && "Start your journey today"}
                {view === 'login' && "Welcome back, warrior"}
                {view === 'forgot' && "Recover your account"}
                {view === 'reset' && "Secure your account"}
              </span>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {view === 'register' && (
                <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                  <label className="block text-sm text-muted-foreground mb-2">Name</label>
                  <div className="relative mb-4">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Chen" className="w-full bg-input pl-10 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                </motion.div>
              )}

              {(view === 'login' || view === 'register' || view === 'forgot') && (
                <motion.div key="email" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <label className="block text-sm text-muted-foreground mb-2">Email</label>
                  <div className="relative mb-4">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@example.com" required className="w-full bg-input pl-10 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                </motion.div>
              )}

              {(view === 'login' || view === 'register' || view === 'reset') && (
                <motion.div key="password" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm text-muted-foreground">{view === 'reset' ? 'New Password' : 'Password'}</label>
                    {view === 'login' && (
                      <button type="button" onClick={() => switchView('forgot')} className="text-xs text-primary hover:text-accent transition-colors">Forgot?</button>
                    )}
                  </div>
                  <div className="relative mb-4">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={4} className="w-full bg-input pl-10 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                </motion.div>
              )}

              {view === 'reset' && (
                <motion.div key="confirm" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <label className="block text-sm text-muted-foreground mb-2">Confirm Password</label>
                  <div className="relative mb-4">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required minLength={4} className="w-full bg-input pl-10 pr-4 py-3 rounded-xl border border-border focus:border-primary focus:outline-none transition-colors" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-500 text-center p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                {error}
              </motion.p>
            )}

            {success && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-green-500 text-center p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                {success}
              </motion.p>
            )}

            <button type="submit" disabled={loading} className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-xl hover:glow transition-all flex items-center justify-center gap-2 font-medium disabled:opacity-50">
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'register' && "Create Account"}
                  {view === 'login' && "Sign In"}
                  {view === 'forgot' && "Send Reset Link"}
                  {view === 'reset' && "Reset Password"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {view !== 'reset' && (
            <p className="text-center text-sm text-muted-foreground mt-6">
              {view === 'register' ? "Already have an account?" : view === 'forgot' ? "Remembered your password?" : "Don't have an account?"}{" "}
              <button type="button" onClick={() => switchView(view === 'register' || view === 'forgot' ? 'login' : 'register')} className="text-primary hover:text-accent transition-colors font-medium">
                {view === 'register' || view === 'forgot' ? "Sign In" : "Create Account"}
              </button>
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
