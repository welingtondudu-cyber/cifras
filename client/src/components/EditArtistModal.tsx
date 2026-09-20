import React, { useState, useRef } from 'react';
import { Camera, Upload, Link, Check, X, User } from 'lucide-react';

interface EditArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  artistName: string;
  currentAvatarUrl?: string;
  onSaveAvatar: (artistName: string, newAvatarUrl: string) => void;
}

export const EditArtistModal: React.FC<EditArtistModalProps> = ({
  isOpen,
  onClose,
  artistName,
  currentAvatarUrl = '',
  onSaveAvatar,
}) => {
  const [avatarPreview, setAvatarPreview] = useState<string>(currentAvatarUrl);
  const [urlInput, setUrlInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Carregar imagem local do dispositivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setAvatarPreview(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleSave = () => {
    if (avatarPreview) {
      onSaveAvatar(artistName, avatarPreview);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#141414] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-500 border border-orange-500/30">
              <Camera size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Editar Foto do Artista</h2>
              <p className="text-xs text-orange-400 font-semibold">{artistName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-5">
          {/* Avatar Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-orange-500 shadow-xl bg-zinc-800 flex items-center justify-center relative group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={artistName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={44} className="text-zinc-600" />
              )}
            </div>
            <span className="text-xs text-zinc-400">Pré-visualização da foto</span>
          </div>

          {/* Selector de Método (Upload do PC vs URL) */}
          <div className="flex items-center gap-2 p-1 bg-[#141414] border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload size={13} />
              <span>Enviar Arquivo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url'
                  ? 'bg-orange-500 text-white shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Link size={13} />
              <span>Colar Link (URL)</span>
            </button>
          </div>

          {/* Conteúdo da Aba */}
          {activeTab === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-zinc-700 hover:border-orange-500 bg-[#141414] hover:bg-orange-500/5 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-orange-500 group-hover:text-white text-zinc-400 flex items-center justify-center transition-colors">
                <Upload size={18} />
              </div>
              <span className="text-xs font-bold text-white">
                Clique para selecionar uma foto do seu computador
              </span>
              <span className="text-[10px] text-zinc-500">
                Suporta PNG, JPG, JPEG ou WEBP
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-zinc-300">
                Endereço da Imagem na Web
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/foto-artista.jpg"
                  className="flex-1 bg-[#121212] border border-zinc-750 text-white text-xs rounded-xl px-3 py-2.5 focus:border-orange-500 outline-none"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold"
                >
                  Carregar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141414] border-t border-zinc-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Check size={14} />
            <span>Salvar Foto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
