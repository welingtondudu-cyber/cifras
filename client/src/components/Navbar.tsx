import React from 'react';
import { Music, Radio, ChevronRight } from 'lucide-react';

interface NavbarProps {
  songTitle: string;
  artist: string;
  currentKey: string;
  isRealtimeConnected: boolean;
  onOpenLibrary: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  songTitle,
  artist,
  currentKey,
  isRealtimeConnected,
  onOpenLibrary,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-850 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-cyan-500/20">
            <Music size={18} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-black text-sm tracking-tight text-white">CIFRALAB</span>
              <span className="text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded">PRO V7</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider">STAGE RUNNER</span>
          </div>
        </div>

        {/* Current Playing Song Pill */}
        <div
          onClick={onOpenLibrary}
          className="flex items-center gap-2.5 px-3.5 py-1.5 bg-slate-900/80 hover:bg-slate-850 border border-slate-750 rounded-xl cursor-pointer transition-all shadow-inner group"
        >
          <div className="text-left">
            <div className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors flex items-center gap-1.5">
              {songTitle}
              <span className="px-1.5 py-0.5 text-[10px] font-mono bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                {currentKey}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">{artist}</div>
          </div>
          <ChevronRight size={14} className="text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </div>

        {/* Realtime Status Indicator */}
        <div className="flex items-center gap-2">
          <div
            title={isRealtimeConnected ? 'Supabase Realtime ativo: alterações sincronizadas com a banda' : 'Modo local'}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono"
          >
            <Radio size={12} className={isRealtimeConnected ? 'text-emerald-400 animate-pulse' : 'text-amber-400'} />
            <span className="hidden md:inline text-slate-400">Banda:</span>
            <span className={isRealtimeConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
              {isRealtimeConnected ? 'Sincronizado' : 'Local'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
