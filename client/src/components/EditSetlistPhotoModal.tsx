import React, { useState, useRef } from 'react';
import { Camera, Upload, Link, Check, X, ListMusic } from 'lucide-react';

interface EditSetlistPhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  setlistName: string;
  currentPhotoUrl?: string;
  onSavePhoto: (newPhotoUrl: string) => void;
}

export const EditSetlistPhotoModal: React.FC<EditSetlistPhotoModalProps> = ({
  isOpen,
  onClose,
  setlistName,
  currentPhotoUrl = '',
  onSavePhoto,
}) => {
  const [photoPreview, setPhotoPreview] = useState<string>(currentPhotoUrl);
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
        setPhotoPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      setPhotoPreview(urlInput.trim());
      setUrlInput('');
    }
  };

  const handleSave = () => {
    if (photoPreview) {
      onSavePhoto(photoPreview);
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
              <h2 className="text-sm font-bold text-white">Editar Capa do Repertório</h2>
              <p className="text-xs text-orange-400 font-semibold truncate max-w-[240px]">{setlistName}</p>
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
          {/* Photo Preview */}
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-orange-500 shadow-xl bg-zinc-850 flex items-center justify-center relative">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={setlistName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ListMusic size={48} className="text-zinc-600" />
              )}
            </div>
            <span className="text-xs text-zinc-400">Pré-visualização da capa</span>
          </div>

          {/* Selector de Método (Upload vs URL) */}
          <div className="flex items-center gap-2 p-1 bg-[#141414] border border-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'upload'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Upload size={14} />
              <span>Enviar do Dispositivo</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('url')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'url'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Link size={14} />
              <span>Link da Web</span>
            </button>
          </div>

          {/* Form Tab: Upload */}
          {activeTab === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-6 border-2 border-dashed border-zinc-750 hover:border-orange-500 rounded-2xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-850/50 transition-all cursor-pointer"
              >
                <Upload size={24} className="text-orange-500" />
                <span className="text-xs font-semibold">Clique para escolher uma imagem</span>
                <span className="text-[10px] text-zinc-500">JPG, PNG ou WebP</span>
              </button>
            </div>
          )}

          {/* Form Tab: URL */}
          {activeTab === 'url' && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">URL da Imagem</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://exemplo.com/capa.jpg"
                  className="flex-1 bg-[#141414] border border-zinc-750 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500 font-mono"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Aplicar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#141414] border-t border-zinc-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!photoPreview}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Check size={14} />
            <span>Salvar Capa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
