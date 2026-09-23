import React, { useState } from 'react';
import type { UserProfile } from '../types/music';
import { signInUser } from '../lib/supabaseClient';
import { Lock, User, ArrowRight, Music } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const res = await signInUser(username.trim(), password);
    setLoading(false);

    if (res.user) {
      onLoginSuccess(res.user);
    } else {
      setErrorMsg(res.error || 'Usuário ou senha incorretos.');
    }
  };


  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col items-center justify-center p-4 selection:bg-orange-500/30 selection:text-orange-300">
      <div className="w-full max-w-md bg-[#181818] border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow sutil de palco em laranja */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Brand */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-500 border border-orange-500/30 flex items-center justify-center shadow-lg shadow-orange-500/10 mb-3">
            <Music size={26} />
          </div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-3xl font-black tracking-tight text-white">cifralab</h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1.5">
            Acesso exclusivo para músicos e bandas
          </p>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300 text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="login-username" className="block text-xs font-semibold text-zinc-300 mb-1.5">Usuário</label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="login-username"
                name="username"
                type="text"
                autoComplete="username"
                required
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Digite seu usuário"
                className="w-full bg-[#121212] border border-zinc-750 focus:border-orange-500 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-semibold text-zinc-300 mb-1.5">Senha</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                id="login-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121212] border border-zinc-750 focus:border-orange-500 text-white text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span>Entrando...</span>
            ) : (
              <>
                <span>Entrar no Sistema</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Informação sobre acesso */}
        <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
          <p className="text-[11px] text-zinc-500">
            Acesso restrito. O gerenciamento de credenciais é realizado pela administração.
          </p>
        </div>
      </div>
    </div>
  );
};
