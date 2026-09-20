import React, { useState } from 'react';
import type { Song } from '../types/music';
import { X, ListPlus, Globe, Lock, Check } from 'lucide-react';

interface CreateSetlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  onCreate: (name: string, description: string, isPublic: boolean, selectedSongIds: string[]) => void;
}

export const CreateSetlistModal: React.FC<CreateSetlistModalProps> = ({
  isOpen,
  onClose,
  songs,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSongSelection = (songId: string) => {
    setSelectedIds(prev =>
      prev.includes(songId) ? prev.filter(id => id !== songId) : [...prev, songId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate(name.trim(), description.trim(), isPublic, selectedIds);
    setName('');
    setDescription('');
    setSelectedIds([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center justify-center">
              <ListPlus size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Criar Novo Repertório</h2>
              <p className="text-xs text-zinc-400">Monte seu setlist para o palco ou ensaio</p>
            </div>
          </div>

          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4 flex-1 overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Nome do Repertório *</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Pagode de Domingo / Ensaio Geral"
              className="w-full bg-[#121212] border border-zinc-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Ordem cronológica das músicas do show"
              className="w-full bg-[#121212] border border-zinc-700 text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
            />
          </div>

          {/* Alternador de Privacidade */}
          <div className="p-3.5 bg-[#141414] border border-zinc-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe size={18} className="text-emerald-400" />
              ) : (
                <Lock size={18} className="text-amber-400" />
              )}
              <div>
                <span className="text-xs sm:text-[13px] font-bold text-white block">
                  {isPublic ? 'Repertório Público' : 'Repertório Privado'}
                </span>
                <span className="text-[11px] text-zinc-400">
                  {isPublic
                    ? 'Visível e compartilhado em tempo real com todos os músicos da banda'
                    : 'Apenas você pode visualizar e editar este repertório'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPublic(prev => !prev)}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-[13px] font-bold border transition-colors ${
                isPublic
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-zinc-800 text-zinc-300 border-zinc-750'
              }`}
            >
              {isPublic ? 'Público' : 'Privado'}
            </button>
          </div>

          {/* Seleção de Músicas Iniciais */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Selecione as músicas para incluir ({selectedIds.length} selecionadas):
            </label>
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-[#121212] border border-zinc-800 rounded-xl">
              {songs.map(song => {
                const isSelected = selectedIds.includes(song.id);
                return (
                  <div
                    key={song.id}
                    onClick={() => toggleSongSelection(song.id)}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer text-xs sm:text-sm transition-colors ${
                      isSelected
                        ? 'bg-orange-500/20 border border-orange-500/40 text-white'
                        : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{song.titulo}</span>
                      <span className="text-xs text-zinc-400 ml-2">({song.artista} - {song.estilo})</span>
                    </div>

                    <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                      isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-zinc-700'
                    }`}>
                      {isSelected && <Check size={13} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
            >
              Criar Repertório
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
