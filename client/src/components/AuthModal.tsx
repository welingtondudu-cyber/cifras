import React, { useState } from 'react';
import type { UserProfile } from '../types/music';
import { signInUser, signUpUser } from '../lib/supabaseClient';
import { X, Lock, Mail, User, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    if (isSignUp) {
      const res = await signUpUser(email, password, name || 'Músico');
      setLoading(false);
      if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'Erro ao cadastrar');
      }
    } else {
      const res = await signInUser(email, password);
      setLoading(false);
      if (res.user) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setErrorMsg(res.error || 'E-mail ou senha inválidos');
      }
    }
  };

  const handleDemoLogin = () => {
    const demoUser: UserProfile = {
      id: 'demo-user',
      email: 'welington_sc@cifralab.pro',
      name: 'Welington_sc',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop'
    };
    localStorage.setItem('cifralab_user', JSON.stringify(demoUser));
    onLoginSuccess(demoUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-zinc-400 hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {isSignUp ? 'Criar Conta no Cifralab' : 'Acessar seus Repertórios'}
            </h2>
            <p className="text-xs text-zinc-400">Autenticação via Supabase Auth</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-2.5 bg-red-500/20 border border-red-500/40 rounded-xl text-xs text-red-300">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Seu Nome</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Welington Silva"
                  className="w-full bg-[#121212] border border-zinc-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">E-mail</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu-email@exemplo.com"
                className="w-full bg-[#121212] border border-zinc-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-zinc-700 text-white text-xs rounded-xl pl-10 pr-3 py-2.5 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all mt-2"
          >
            {loading ? 'Aguarde...' : isSignUp ? 'Cadastrar' : 'Entrar'}
          </button>
        </form>

        <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <button
            onClick={() => setIsSignUp(prev => !prev)}
            className="hover:text-orange-400 underline"
          >
            {isSignUp ? 'Já tem conta? Entrar' : 'Não tem conta? Cadastrar'}
          </button>

          <button
            onClick={handleDemoLogin}
            className="text-orange-400 hover:underline font-medium"
          >
            Entrar como Welington_sc ›
          </button>
        </div>
      </div>
    </div>
  );
};
