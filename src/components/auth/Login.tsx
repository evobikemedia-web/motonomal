import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Bike, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface LoginProps {
  onLoginSuccess: (role: string) => void;
  onNavigateRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, onNavigateRegister }) => {
  const { language } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Détection du rôle en fonction de l'email saisi
    setTimeout(() => {
      setIsLoading(false);
      let assignedRole = 'STAFF'; // Rôle par défaut
      const lowerEmail = email.toLowerCase();
      
      if (lowerEmail.includes('admin')) assignedRole = 'ADMIN';
      else if (lowerEmail.includes('manager')) assignedRole = 'MANAGER';
      else if (lowerEmail.includes('account')) assignedRole = 'ACCOUNTING';
      else if (lowerEmail.includes('staff')) assignedRole = 'STAFF';

      onLoginSuccess(assignedRole);
    }, 1200);
  };

  // Fonction utilitaire pour remplir rapidement les identifiants de démo
  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('motonomad2026');
  };

  return (
    <div className="min-h-screen flex bg-[#121212] text-[#F4F4F2] font-sans">
      {/* Left Side - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-[#121212]/80 via-[#121212]/40 to-transparent z-10" />
        <img 
          src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=1200&auto=format&fit=crop&q=80" 
          alt="Motonomad Fleet" 
          className="object-cover w-full h-full"
        />
        <div className="absolute bottom-12 left-12 z-20 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <Bike className="w-8 h-8 text-[#D4A017]" />
            <h1 className="text-3xl font-black tracking-widest text-white uppercase">MOTONOMAD</h1>
          </div>
          <p className="text-zinc-300 text-sm leading-relaxed">
            {language === 'fr' 
              ? "Le système exclusif de gestion de flotte et de location de motos premium au Maroc. Accès réservé au personnel autorisé."
              : "The exclusive premium motorcycle rental and fleet management system in Morocco. Authorized personnel access only."}
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <Bike className="w-6 h-6 text-[#D4A017]" />
          <span className="text-xl font-black tracking-widest uppercase">Motonomad</span>
        </div>

        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">
              {language === 'fr' ? 'Bon retour !' : 'Welcome back!'}
            </h2>
            <p className="text-zinc-400 text-sm">
              {language === 'fr' ? 'Veuillez vous connecter à votre espace de travail.' : 'Please log in to your workspace.'}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-zinc-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@motonomad.ma"
                  className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#D4A017] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{language === 'fr' ? 'Mot de passe' : 'Password'}</label>
                <a href="#" className="text-xs font-bold text-[#D4A017] hover:underline">
                  {language === 'fr' ? 'Oublié ?' : 'Forgot?'}
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-5 h-5 text-zinc-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#D4A017] transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-[#D4A017] hover:bg-[#b88a10] text-[#1C1C1C] py-3.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-[#1C1C1C] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {language === 'fr' ? 'Se Connecter' : 'Log In'} <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Raccourcis de test pour naviguer entre les 4 rôles facilement */}
          <div className="pt-6 border-t border-[#2D2D2D]">
            <div className="p-4 bg-[#D4A017]/5 border border-[#D4A017]/10 rounded-xl">
              <p className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 mb-3 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4A017]" />
                {language === 'fr' ? 'Comptes de Démo (Clic pour remplir)' : 'Demo Accounts (Click to fill)'}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button type="button" onClick={() => fillDemoAccount('admin@motonomad.ma')} className="text-left text-zinc-300 hover:text-[#D4A017] transition-colors truncate">
                  👑 admin@...
                </button>
                <button type="button" onClick={() => fillDemoAccount('manager@motonomad.ma')} className="text-left text-zinc-300 hover:text-[#D4A017] transition-colors truncate">
                  📊 manager@...
                </button>
                <button type="button" onClick={() => fillDemoAccount('accounting@motonomad.ma')} className="text-left text-zinc-300 hover:text-[#D4A017] transition-colors truncate">
                  💰 accounting@...
                </button>
                <button type="button" onClick={() => fillDemoAccount('staff@motonomad.ma')} className="text-left text-zinc-300 hover:text-[#D4A017] transition-colors truncate">
                  🛠️ staff@...
                </button>
              </div>
            </div>
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-zinc-400">
              {language === 'fr' ? "Vous n'avez pas de compte ?" : "Don't have an account?"}{' '}
              <button onClick={onNavigateRegister} className="text-[#D4A017] font-bold hover:underline cursor-pointer">
                {language === 'fr' ? 'Demander un accès' : 'Request access'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};