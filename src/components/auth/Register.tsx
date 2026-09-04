import React, { useState } from 'react';
import { Mail, Lock, User, ArrowLeft, Bike } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface RegisterProps {
  onRegisterSuccess: () => void;
  onNavigateLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onRegisterSuccess, onNavigateLogin }) => {
  const { language } = useLanguage();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'un appel API d'inscription
    setTimeout(() => {
      setIsLoading(false);
      onRegisterSuccess();
    }, 1500);
  };

  return (
    <div className="min-h-screen flex bg-[#121212] text-[#F4F4F2] font-sans">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 xl:p-24 relative">
        {/* Back to login */}
        <button 
          onClick={onNavigateLogin}
          className="absolute top-8 left-8 flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {language === 'fr' ? 'Retour' : 'Back'}
        </button>

        <div className="w-full max-w-md space-y-8 animate-fadeIn">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center border border-[#D4A017]/20 mb-4">
              <Bike className="w-8 h-8 text-[#D4A017]" />
            </div>
            <h2 className="text-3xl font-black text-white mb-2">
              {language === 'fr' ? 'Créer un compte' : 'Create an account'}
            </h2>
            <p className="text-zinc-400 text-sm">
              {language === 'fr' ? 'Rejoignez l\'espace de gestion Motonomad.' : 'Join the Motonomad management workspace.'}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{language === 'fr' ? 'Nom complet' : 'Full Name'}</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-5 h-5 text-zinc-500" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Tarik Ouhssain"
                  className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#D4A017] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-5 h-5 text-zinc-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tarik@motonomad.ma"
                  className="w-full pl-11 pr-4 py-3 bg-[#1A1A1A] border border-[#333333] rounded-xl text-white focus:outline-none focus:border-[#D4A017] transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">{language === 'fr' ? 'Mot de passe' : 'Password'}</label>
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
                language === 'fr' ? 'S\'inscrire' : 'Register'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image Background */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <div className="absolute inset-0 bg-[#121212]/40 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1599819822515-40f42337d1d2?w=1200&auto=format&fit=crop&q=80" 
          alt="Motonomad Desert" 
          className="object-cover w-full h-full grayscale-[20%]"
        />
      </div>
    </div>
  );
};