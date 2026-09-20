import React, { useState, useEffect, useRef } from 'react';
import type { Song } from '../types/music';
import { convertStandardCifraToChordPro } from '../chordEngine/cifraConverter';
import {
  Search,
  Plus,
  Music,
  Check,
  X,
  Globe,
  Lock,
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle2,
  Edit3
} from 'lucide-react';

interface SongLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: Song[];
  activeSongId: string;
  onSelectSong: (song: Song) => void;
  onAddSong: (newSong: Omit<Song, 'id'>) => Promise<void>;
  onAddBatchSongs?: (newSongs: Omit<Song, 'id'>[]) => Promise<void>;
  editingSong?: Song | null;
  onUpdateSong?: (updatedSong: Song) => Promise<void>;
  isRealtimeConnected: boolean;
}

export const SongLibraryModal: React.FC<SongLibraryModalProps> = ({
  isOpen,
  onClose,
  songs,
  activeSongId,
  onSelectSong,
  onAddSong,
  onAddBatchSongs,
  editingSong = null,
  onUpdateSong,
  isRealtimeConnected,
}) => {
  const [search, setSearch] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [createMode, setCreateMode] = useState<'single' | 'bulk'>('single');

  // Form states
  const [formatType, setFormatType] = useState<'standard' | 'chordpro'>('standard');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [estilo, setEstilo] = useState('MPB');
  const [key, setKey] = useState('Dm');
  const [cifraText, setCifraText] = useState('');

  // Bulk upload states
  const [bulkFiles, setBulkFiles] = useState<{ name: string; text: string }[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados de edição quando houver editingSong
  useEffect(() => {
    if (editingSong) {
      setIsCreating(true);
      setCreateMode('single');
      setTitle(editingSong.titulo);
      setArtist(editingSong.artista);
      setEstilo(editingSong.estilo || 'MPB');
      setKey(editingSong.tom_original || 'C');
      setCifraText(editingSong.chordpro);
      setFormatType('chordpro');
    } else {
      setTitle('');
      setArtist('');
      setEstilo('MPB');
      setKey('Dm');
      setCifraText('');
      setFormatType('standard');
    }
  }, [editingSong, isOpen]);

  if (!isOpen) return null;

  const filteredSongs = songs.filter(
    s =>
      s.titulo.toLowerCase().includes(search.toLowerCase()) ||
      s.artista.toLowerCase().includes(search.toLowerCase())
  );

  // Auto-detecção ao colar
  const handleTextChange = (text: string) => {
    setCifraText(text);

    // Se estiver no formato padrão ou se detectar linhas de acordes acima de letras
    if (formatType === 'standard' || !text.includes('[')) {
      const converted = convertStandardCifraToChordPro(text);
      if (converted.title && !title) setTitle(converted.title);
      if (converted.artist && !artist) setArtist(converted.artist);
      if (converted.key && key === 'Dm') setKey(converted.key);
    }
  };

  const handleSaveSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !cifraText.trim()) return;

    let finalChordPro = cifraText.trim();
    if (formatType === 'standard' || !cifraText.includes('[')) {
      const converted = convertStandardCifraToChordPro(cifraText);
      finalChordPro = converted.chordpro;
    }

    if (editingSong && onUpdateSong) {
      await onUpdateSong({
        ...editingSong,
        titulo: title.trim(),
        artista: artist.trim() || 'Artista Desconhecido',
        estilo: estilo.trim() || 'Samba',
        tom_original: key.trim() || 'C',
        chordpro: finalChordPro,
      });
    } else {
      await onAddSong({
        titulo: title.trim(),
        artista: artist.trim() || 'Artista Desconhecido',
        estilo: estilo.trim() || 'Samba',
        tom_original: key.trim() || 'C',
        chordpro: finalChordPro,
        publico: true
      });
    }

    setIsCreating(false);
    setTitle('');
    setArtist('');
    setCifraText('');
    onClose();
  };

  // Upload Massivo de Arquivos .txt
  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readFiles: { name: string; text: string }[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      try {
        const text = await f.text();
        readFiles.push({ name: f.name, text });
      } catch (err) {
        console.error('Erro ao ler', f.name, err);
      }
    }
    setBulkFiles(readFiles);
  };

  const handleProcessBulkUpload = async () => {
    if (bulkFiles.length === 0 || !onAddBatchSongs) return;
    setIsUploading(true);
    setBulkStatus(`Processando ${bulkFiles.length} arquivos...`);

    const newSongs: Omit<Song, 'id'>[] = [];

    for (const file of bulkFiles) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
      let detectedArtist = 'Artista Desconhecido';
      let detectedTitle = nameWithoutExt;

      if (nameWithoutExt.includes(' - ')) {
        const parts = nameWithoutExt.split(' - ');
        detectedArtist = parts[0].trim();
        detectedTitle = parts.slice(1).join(' - ').trim();
      }

      const converted = convertStandardCifraToChordPro(file.text);
      if (converted.title) detectedTitle = converted.title;
      if (converted.artist && converted.artist !== 'Artista Desconhecido') {
        detectedArtist = converted.artist;
      }

      newSongs.push({
        titulo: detectedTitle,
        artista: detectedArtist,
        estilo: estilo || 'Samba',
        tom_original: converted.key || 'C',
        chordpro: converted.chordpro,
        publico: true
      });
    }

    await onAddBatchSongs(newSongs);
    setIsUploading(false);
    setBulkStatus(`✅ ${newSongs.length} músicas importadas com sucesso!`);
    setTimeout(() => {
      setBulkFiles([]);
      setBulkStatus(null);
      setIsCreating(false);
      onClose();
    }, 1600);
  };

  const sampleStandardCifra = `Marisa Monte - Ainda Bem

Tom: Dm

[Intro] Dm

[Primeira Parte]

       Dm
Ainda bem
                       Bb/D
Que agora encontrei você
                  C
Eu realmente não sei
                      Dm    A7
O que eu fiz pra merecer você

[Refrão]

             Dm
Você iria ficar
                 Bb/D
Você veio pra ficar
                   C
Você que me faz feliz
                    Dm     A7
Você que me faz cantar, assim`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn select-none">
      <div className="bg-[#1c1c1c] border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-[#141414] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-orange-500/15 text-orange-500 border border-orange-500/30">
              {editingSong ? <Edit3 size={20} /> : <Music size={20} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {editingSong ? 'Editar Cifra' : 'Repertório & Músicas'}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono border bg-emerald-500/15 text-emerald-400 border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  {isRealtimeConnected ? 'Realtime Conectado' : 'Modo Seguro'}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                {editingSong
                  ? `Editando dados de "${editingSong.titulo}"`
                  : 'Selecione uma música, cadastre individualmente ou faça upload massivo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editingSong && (
              <button
                onClick={() => setIsCreating(prev => !prev)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
              >
                <Plus size={15} />
                <span>{isCreating ? 'Ver Lista' : 'Nova Cifra'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        {isCreating ? (
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
            {/* Se não estiver editando, permitir alternar entre Individual e Upload Massivo */}
            {!editingSong && (
              <div className="flex items-center gap-2 p-1 bg-[#141414] border border-zinc-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setCreateMode('single')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                    createMode === 'single'
                      ? 'bg-orange-500 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Digitar / Colar Cifra
                </button>
                <button
                  type="button"
                  onClick={() => setCreateMode('bulk')}
                  className={`flex-1 py-2 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
                    createMode === 'bulk'
                      ? 'bg-orange-500 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <UploadCloud size={15} />
                  <span>Upload Massivo (.txt)</span>
                </button>
              </div>
            )}

            {/* MODO BULK: UPLOAD MASSIVO DE .TXT */}
            {createMode === 'bulk' && !editingSong ? (
              <div className="space-y-4">
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-zinc-700 hover:border-orange-500 bg-[#141414] hover:bg-orange-500/5 rounded-2xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.chordpro,.cho"
                    onChange={handleSelectFiles}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-full bg-zinc-800 group-hover:bg-orange-500 group-hover:text-white text-zinc-400 flex items-center justify-center transition-colors">
                    <UploadCloud size={28} />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Clique ou arraste arquivos .txt aqui
                    </span>
                    <span className="text-xs text-zinc-400 mt-1 block">
                      Selecione múltiplos arquivos .txt de uma só vez (formato Cifra Club ou ChordPro)
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/30">
                    O nome do arquivo ou cabeçalho define Artista e Título automaticamente
                  </span>
                </div>

                {/* Lista de Arquivos Selecionados */}
                {bulkFiles.length > 0 && (
                  <div className="bg-[#141414] border border-zinc-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs text-zinc-300 font-bold border-b border-zinc-800 pb-2">
                      <span className="flex items-center gap-1.5">
                        <FileText size={14} className="text-orange-500" />
                        {bulkFiles.length} arquivos selecionados para importação
                      </span>
                      <button
                        onClick={() => setBulkFiles([])}
                        className="text-zinc-500 hover:text-red-400 text-[11px]"
                      >
                        Limpar
                      </button>
                    </div>

                    <div className="max-h-40 overflow-y-auto space-y-1 divide-y divide-zinc-850 text-xs text-zinc-400">
                      {bulkFiles.map((file, idx) => (
                        <div key={idx} className="pt-1 flex items-center justify-between">
                          <span className="truncate max-w-sm">{file.name}</span>
                          <CheckCircle2 size={13} className="text-emerald-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status / Feedback */}
                {bulkStatus && (
                  <div className="p-3 bg-zinc-900 border border-orange-500/50 rounded-xl text-center text-xs font-bold text-orange-400 animate-fadeIn">
                    {bulkStatus}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setBulkFiles([]);
                      setIsCreating(false);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={bulkFiles.length === 0 || isUploading}
                    onClick={handleProcessBulkUpload}
                    className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold text-xs shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    {isUploading ? 'Importando...' : `Importar ${bulkFiles.length} Cifras`}
                  </button>
                </div>
              </div>
            ) : (
              /* MODO SINGLE: FORMULÁRIO INDIVIDUAL OU EDIÇÃO */
              <form onSubmit={handleSaveSong} className="space-y-4">
                {/* Alternador de Formato de Entrada */}
                <div className="p-2 bg-[#141414] border border-zinc-800 rounded-xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="font-bold text-white block">Formato da Cifra:</span>
                    <span className="text-[10px] text-zinc-400">
                      {formatType === 'standard'
                        ? 'Padrão Cifra Club (acordes na linha de cima da letra)'
                        : 'Formato ChordPro (com colchetes [C])'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setFormatType('standard')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        formatType === 'standard'
                          ? 'bg-orange-500 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      Cifra Club
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormatType('chordpro')}
                      className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                        formatType === 'chordpro'
                          ? 'bg-orange-500 text-white'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      ChordPro
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Título da Música *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Ex: Ainda Bem"
                      className="w-full bg-[#121212] border border-zinc-750 text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Tom Original</label>
                    <input
                      type="text"
                      value={key}
                      onChange={e => setKey(e.target.value)}
                      placeholder="Ex: Dm ou C"
                      className="w-full bg-[#121212] border border-zinc-750 text-white text-sm font-mono rounded-xl px-3.5 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Artista / Compositor</label>
                    <input
                      type="text"
                      value={artist}
                      onChange={e => setArtist(e.target.value)}
                      placeholder="Ex: Marisa Monte"
                      className="w-full bg-[#121212] border border-zinc-750 text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">Estilo Musical</label>
                    <select
                      value={estilo}
                      onChange={e => setEstilo(e.target.value)}
                      className="w-full bg-[#121212] border border-zinc-750 text-white text-sm rounded-xl px-3.5 py-2.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none transition-colors"
                    >
                      <option value="MPB">MPB</option>
                      <option value="Samba">Samba / Pagode</option>
                      <option value="Rock">Rock</option>
                      <option value="Sertanejo">Sertanejo</option>
                      <option value="Gospel">Gospel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-zinc-300">
                      {formatType === 'standard'
                        ? 'Cole a cifra no formato Cifra Club (acordes em cima da letra):'
                        : 'Cole a cifra em formato ChordPro ([C]Letra):'}
                    </label>

                    {!editingSong && (
                      <button
                        type="button"
                        onClick={() => handleTextChange(sampleStandardCifra)}
                        className="text-xs text-orange-400 hover:text-orange-300 underline flex items-center gap-1 font-medium"
                      >
                        <Sparkles size={12} />
                        <span>Preencher exemplo</span>
                      </button>
                    )}
                  </div>

                  <textarea
                    required
                    rows={10}
                    value={cifraText}
                    onChange={e => handleTextChange(e.target.value)}
                    placeholder={
                      formatType === 'standard'
                        ? `Exemplo:\n       Dm\nAinda bem\n                       Bb/D\nQue agora encontrei você`
                        : `Exemplo:\n[Dm]Ainda bem que agora encon[Bb/D]trei você`
                    }
                    className="w-full bg-[#121212] border border-zinc-750 text-zinc-200 font-mono text-[13px] sm:text-sm rounded-xl p-3.5 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 outline-none leading-relaxed"
                  />
                </div>

                <div className="flex justify-end gap-2.5 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      if (editingSong) onClose();
                    }}
                    className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
                  >
                    {editingSong ? 'Atualizar Cifra' : 'Salvar no Acervo'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          <>
            {/* Search Bar */}
            <div className="p-3 sm:p-4 bg-[#141414] border-b border-zinc-800">
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por música ou artista..."
                  className="w-full bg-[#181818] border border-zinc-750 focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-white text-sm rounded-xl pl-10 pr-4 py-2.5 outline-none transition-colors"
                />
              </div>
            </div>

            {/* Song List */}
            <div className="p-3 sm:p-4 overflow-y-auto flex-1 space-y-2 scrollbar-thin scrollbar-thumb-zinc-700">
              {filteredSongs.length === 0 ? (
                <div className="text-center py-12 text-zinc-500 text-sm">
                  Nenhuma música encontrada com o termo "{search}".
                </div>
              ) : (
                filteredSongs.map(song => {
                  const isActive = song.id === activeSongId;

                  return (
                    <div
                      key={song.id}
                      onClick={() => {
                        onSelectSong(song);
                        onClose();
                      }}
                      className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                        isActive
                          ? 'bg-orange-500/15 border-orange-500/50 shadow-md'
                          : 'bg-[#181818] border-zinc-800 hover:border-zinc-700 hover:bg-[#202020]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-bold text-xs sm:text-[13px] border shadow-inner ${
                          isActive ? 'bg-orange-500 border-orange-400 text-white' : 'bg-zinc-800 border-zinc-750 text-orange-400'
                        }`}>
                          {song.tom_original}
                        </div>

                        <div>
                          <div className="font-bold text-sm text-white flex items-center gap-1.5">
                            {song.titulo}
                            {song.publico ? (
                              <span title="Público / Compartilhado"><Globe size={12} className="text-zinc-500" /></span>
                            ) : (
                              <span title="Privado"><Lock size={12} className="text-amber-500" /></span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-400 mt-0.5">
                            {song.artista} • {song.estilo}
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div className="p-1.5 rounded-full bg-orange-500/20 text-orange-400">
                          <Check size={16} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
