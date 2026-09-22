import React, { useState, useEffect } from 'react';
import type { Song } from '../types/music';
import { Edit2, Check, ChevronDown, ChevronUp, StickyNote } from 'lucide-react';
import { getTransitionForSongs, saveTransitionCue } from '../lib/storage';

interface StageTransitionCueProps {
  setlistId: string;
  currentSong: Song;
  nextSong?: Song;
  onAskAITransition?: (fromTitle: string, toTitle: string, fromKey: string, toKey: string) => void;
  isVisible?: boolean;
}

export const StageTransitionCue: React.FC<StageTransitionCueProps> = ({
  setlistId,
  currentSong,
  nextSong,
  isVisible = true,
}) => {
  if (!nextSong || !isVisible) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const getLatestNoteText = () => {
    const existing = getTransitionForSongs(setlistId, currentSong.id, nextSong.id);
    return [
      existing?.chords?.length ? existing.chords.join(' ') : '',
      existing?.notes || ''
    ].filter(Boolean).join(' - ');
  };

  const [noteContent, setNoteContent] = useState(getLatestNoteText);
  const [savedNote, setSavedNote] = useState(getLatestNoteText);

  // Sincronizar ao trocar de música
  useEffect(() => {
    const text = getLatestNoteText();
    setSavedNote(text);
    setNoteContent(text);
  }, [setlistId, currentSong.id, nextSong?.id]);

  // Sincronizar em tempo real quando a IA ou outro componente salvar anotação
  useEffect(() => {
    const handleUpdate = (e: any) => {
      const detail = e.detail;
      if (
        detail &&
        detail.setlistId === setlistId &&
        detail.fromSongId === currentSong.id &&
        detail.toSongId === nextSong?.id
      ) {
        const text = [
          detail.chords?.length ? detail.chords.join(' ') : '',
          detail.notes || ''
        ].filter(Boolean).join(' - ');
        setSavedNote(text);
        setNoteContent(text);
      }
    };
    window.addEventListener('cifralab_annotation_updated', handleUpdate);
    return () => window.removeEventListener('cifralab_annotation_updated', handleUpdate);
  }, [setlistId, currentSong.id, nextSong?.id]);

  const handleSave = () => {
    const text = noteContent.trim();
    // Extrai possíveis acordes entre colchetes ou palavras
    const chordsList = text.match(/\[(.*?)\]/g)?.map(c => c.replace(/[[\]]/g, '')) || [];

    const existingCue = getTransitionForSongs(setlistId, currentSong.id, nextSong.id);
    const cue = {
      id: existingCue?.id || `cue-${Date.now()}`,
      setlistId,
      fromSongId: currentSong.id,
      toSongId: nextSong.id,
      chords: chordsList,
      notes: text,
    };

    saveTransitionCue(cue);
    setSavedNote(text);
    setIsEditing(false);
  };

  // Se estiver minimizado, exibe uma pílula compacta sem título com nome da música
  if (isMinimized) {
    return (
      <div className="my-2 select-none">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold transition-all active:scale-95 shadow-sm"
          title="Expandir anotação"
        >
          <StickyNote size={13} className="text-orange-400" />
          <ChevronDown size={14} className="text-orange-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="my-3 p-3 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-zinc-900/60 border-l-4 border-orange-500 rounded-r-2xl border-y border-r border-zinc-800 text-zinc-100 shadow-lg select-none">
      {/* Barra de Ações do Bloquinho (sem título e sem nome da música) */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
          <StickyNote size={13} className="text-orange-400" />
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              title="Editar anotação"
            >
              <Edit2 size={13} />
            </button>
          )}

          {/* Botão Minimizar */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Minimizar bloquinho de anotação"
          >
            <ChevronUp size={14} />
          </button>
        </div>
      </div>

      {/* Conteúdo do Bloquinho Único de Anotação */}
      {isEditing ? (
        <div className="space-y-2.5 mt-1">
          <textarea
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            rows={2}
            placeholder="Ex: [A7 D7 G] Fazer levada lenta na transição para o próximo tom..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-2.5 text-xs text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-orange-500 font-mono leading-relaxed"
          />

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              className="px-3.5 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <Check size={13} />
              <span>Salvar Anotação</span>
            </button>
            <button
              onClick={() => {
                setNoteContent(savedNote);
                setIsEditing(false);
              }}
              className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className="text-xs text-zinc-300 leading-relaxed font-mono pt-0.5">
          {savedNote ? (
            <div className="bg-zinc-900/70 border border-zinc-800/80 rounded-xl p-2.5 text-zinc-200">
              {savedNote}
            </div>
          ) : (
            <div className="italic text-zinc-400 flex items-center justify-between">
              <span>Nenhuma anotação configurada. Clique no lápis para adicionar.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
