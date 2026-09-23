import React, { useEffect, useState, useMemo } from 'react';
import {
  Play,
  CheckCircle2,
  Circle,
  Clock,
  Trophy,
  ArrowLeft,
  GraduationCap,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import type { AcademyLevel, AcademyModule, UserProfile } from '../../types/music';
import academyData from '../../data/academyContent.json';
import {
  getSavedAcademyProgress,
  setModuleCompletion
} from '../../lib/storage';
import {
  fetchUserAcademyProgress,
  updateUserAcademyModuleProgress
} from '../../lib/supabaseClient';
import { AcademyLessonModal } from './AcademyLessonModal';

interface AcademyViewProps {
  user: UserProfile | null;
  onBack: () => void;
  onAskAI?: (prompt: string, lessonContext?: { levelTitle: string; levelNumber: number; module: AcademyModule }) => void;
  onSelectActiveLesson?: (lesson: { levelTitle: string; levelNumber: number; module: AcademyModule } | null) => void;
}

export const AcademyView: React.FC<AcademyViewProps> = ({
  user,
  onBack,
  onAskAI,
  onSelectActiveLesson
}) => {
  const [levels, setLevels] = useState<AcademyLevel[]>([]);
  const [progressMap, setProgressMap] = useState<Record<number, boolean>>(() => {
    return getSavedAcademyProgress();
  });

  // Estado para controlar níveis expandidos (todos iniciam OCULTOS por padrão)
  const [expandedLevels, setExpandedLevels] = useState<Record<number, boolean>>({});

  const toggleLevel = (levelNumber: number) => {
    setExpandedLevels(prev => ({
      ...prev,
      [levelNumber]: !prev[levelNumber]
    }));
  };

  // Lição ativa para leitura no modal
  const [activeLesson, setActiveLesson] = useState<{
    module: AcademyModule;
    levelTitle: string;
    levelNumber: number;
  } | null>(null);

  // Inicializar dados do JSON
  useEffect(() => {
    setLevels(academyData.levels as unknown as AcademyLevel[]);
  }, []);

  // Notificar componente pai sobre lição em estudo para contextualizar a IA
  useEffect(() => {
    if (onSelectActiveLesson) {
      onSelectActiveLesson(activeLesson);
    }
  }, [activeLesson, onSelectActiveLesson]);

  // Sincronizar progresso com Supabase se usuário estiver autenticado
  useEffect(() => {
    if (user?.id) {
      fetchUserAcademyProgress(user.id).then((dbProgress) => {
        if (Object.keys(dbProgress).length > 0) {
          setProgressMap((prev) => {
            const merged = { ...prev, ...dbProgress };
            localStorage.setItem('cifralab_academy_progress', JSON.stringify(merged));
            return merged;
          });
        }
      });
    }
  }, [user?.id]);

  // Escutar eventos de sincronização de progresso
  useEffect(() => {
    const handleProgressUpdate = (e: Event) => {
      const custom = e as CustomEvent<Record<number, boolean>>;
      if (custom.detail) {
        setProgressMap(custom.detail);
      }
    };
    window.addEventListener('cifralab_academy_progress_updated', handleProgressUpdate);
    return () => {
      window.removeEventListener('cifralab_academy_progress_updated', handleProgressUpdate);
    };
  }, []);

  // Lista plana de todos os módulos para navegação sequencial (Próxima/Anterior)
  const allModulesFlat = useMemo(() => {
    const list: { module: AcademyModule; levelTitle: string; levelNumber: number }[] = [];
    levels.forEach((lvl) => {
      lvl.modules.forEach((mod) => {
        list.push({
          module: mod,
          levelTitle: lvl.title,
          levelNumber: lvl.level
        });
      });
    });
    return list;
  }, [levels]);

  // Alternar conclusão de lição (optimistic UI + local storage + Supabase)
  const handleToggleComplete = (moduleId: number) => {
    const nextState = !progressMap[moduleId];
    const updated = setModuleCompletion(moduleId, nextState);
    setProgressMap(updated);

    if (user?.id) {
      updateUserAcademyModuleProgress(user.id, moduleId, nextState);
    }
  };

  // Métricas globais
  const totalLessons = allModulesFlat.length;
  const completedLessons = useMemo(() => {
    return allModulesFlat.filter((item) => progressMap[item.module.id]).length;
  }, [allModulesFlat, progressMap]);

  const globalPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  // Navegação anterior e próxima no modal
  const currentIndex = activeLesson
    ? allModulesFlat.findIndex((item) => item.module.id === activeLesson.module.id)
    : -1;

  const handleNextLesson = () => {
    if (currentIndex >= 0 && currentIndex < allModulesFlat.length - 1) {
      setActiveLesson(allModulesFlat[currentIndex + 1]);
    }
  };

  const handlePrevLesson = () => {
    if (currentIndex > 0) {
      setActiveLesson(allModulesFlat[currentIndex - 1]);
    }
  };

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-7 animate-in fade-in duration-300">
      
      {/* CABEÇALHO SIMPLIFICADO DA ACADEMIA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-zinc-800">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors mr-1"
              title="Voltar ao início"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="p-2 rounded-xl bg-[#ff7b00]/15 text-[#ff7b00] border border-[#ff7b00]/30 shadow-md shadow-orange-950/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 tracking-tight flex items-center gap-2">
                CIFRALAB <span className="text-[#ff7b00]">Academia</span>
              </h1>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl pl-10 sm:pl-11">
            Trilhas de conhecimento progressivas para dominar o instrumento, campos harmônicos e dinâmica de palco.
          </p>
        </div>

        {/* AÇÕES DE CABEÇALHO: PROGRESSO GERAL */}
        <div className="flex items-center gap-3 self-stretch md:self-auto flex-wrap">
          {/* CARD DE PROGRESSO GERAL COMPACTO */}
          <div className="flex-1 sm:flex-none bg-[#181818] border border-zinc-800/90 rounded-xl px-4 py-2 flex items-center gap-3 shadow-md">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#121212] border border-zinc-700/60 text-[#ff7b00] shrink-0">
              <Trophy size={16} className={globalPercentage === 100 ? 'text-amber-400' : 'text-[#ff7b00]'} />
            </div>
            <div className="min-w-[130px]">
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-zinc-300">Progresso</span>
                <span className="text-[#ff7b00] font-bold">{globalPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${globalPercentage}%` }}
                />
              </div>
              <div className="text-[10px] text-zinc-500 mt-0.5 text-right font-mono">
                {completedLessons}/{totalLessons} aulas
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TELA INICIAL SIMPLIFICADA: NÍVEIS EXPANDÍVEIS/OCULTOS (INICIA OCULTO POR PADRÃO) */}
      <div className="space-y-4 sm:space-y-5">
        {levels.map((lvl) => {
          const lvlCompleted = lvl.modules.filter((m) => progressMap[m.id]).length;
          const lvlTotal = lvl.modules.length;
          const lvlPct = lvlTotal > 0 ? Math.round((lvlCompleted / lvlTotal) * 100) : 0;
          const isLvlDone = lvlTotal > 0 && lvlCompleted === lvlTotal;
          const isExpanded = Boolean(expandedLevels[lvl.level]);

          const badgeStyles =
            lvl.level === 1
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : lvl.level === 2
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : lvl.level === 3
              ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
              : lvl.level === 4
              ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              : lvl.level === 5
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-[#ff7b00]/10 text-[#ff7b00] border-[#ff7b00]/30';

          return (
            <div
              key={lvl.level}
              className={`bg-[#181818] border rounded-2xl overflow-hidden shadow-lg transition-all ${
                isLvlDone
                  ? 'border-amber-500/40 ring-1 ring-amber-500/20'
                  : 'border-zinc-800/90 hover:border-zinc-700/80'
              }`}
            >
              {/* CABEÇALHO DO NÍVEL COM RESUMO (CLIQUE PARA EXPANDIR/OCULTAR) */}
              <div
                onClick={() => toggleLevel(lvl.level)}
                className={`p-4 sm:p-5 bg-[#151515] hover:bg-[#181818] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none ${
                  isExpanded ? 'border-b border-zinc-800/80' : ''
                }`}
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`border px-2.5 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase ${badgeStyles}`}>
                      NÍVEL {lvl.level} • {lvl.levelBadge || 'Trilha'}
                    </span>
                    {isLvlDone && (
                      <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30">
                        <CheckCircle2 size={12} className="fill-amber-400/20" /> Módulo Concluído
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-zinc-100 tracking-tight">
                    {lvl.title}
                  </h2>
                  <p className="text-xs text-zinc-400">{lvl.description}</p>
                </div>

                {/* PROGRESSO DO NÍVEL + BOTÃO EXPANDIR/OCULTAR */}
                <div className="flex items-center gap-3 self-stretch sm:self-auto justify-between sm:justify-end shrink-0">
                  <div className="bg-[#121212] border border-zinc-800 px-3 py-2 rounded-xl min-w-[150px]">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-zinc-400 text-[11px]">Progresso</span>
                      <span className={`font-bold ${isLvlDone ? 'text-amber-400' : 'text-[#ff7b00]'}`}>
                        {lvlPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          isLvlDone
                            ? 'bg-gradient-to-r from-amber-400 to-amber-300'
                            : 'bg-gradient-to-r from-orange-500 to-[#ff7b00]'
                        }`}
                        style={{ width: `${lvlPct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1 text-right font-mono">
                      {lvlCompleted}/{lvlTotal} concluídas
                    </div>
                  </div>

                  {/* Indicador de Expandir/Ocultar Nível */}
                  <div
                    className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-850 hover:bg-zinc-800 text-zinc-300 border border-zinc-750 flex items-center gap-1.5 text-xs font-semibold transition-colors"
                  >
                    <span className="hidden sm:inline">
                      {isExpanded ? 'Ocultar' : 'Expandir'}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[#ff7b00] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* SUBNÍVEIS / AULAS DO NÍVEL (RENDERIZADOS APENAS QUANDO EXPANDIDO) */}
              {isExpanded && (
                <div className="divide-y divide-zinc-850 animate-in fade-in duration-200">
                  {lvl.modules.map((mod) => {
                    const isDone = Boolean(progressMap[mod.id]);

                    return (
                      <div
                        key={mod.id || mod.number}
                        onClick={() =>
                          setActiveLesson({
                            module: mod,
                            levelTitle: lvl.title,
                            levelNumber: lvl.level
                          })
                        }
                        className={`group p-3.5 sm:p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                          isDone
                            ? 'bg-[#141414]/70 hover:bg-[#181818]'
                            : 'bg-[#121212] hover:bg-[#161616]'
                        }`}
                      >
                        {/* LADO ESQUERDO: ÍCONE, NÚMERO, TÍTULO, CHORDS E TEMPO */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleComplete(mod.id);
                            }}
                            className="shrink-0 text-zinc-500 hover:text-emerald-400 transition-colors p-1"
                            title={isDone ? 'Desmarcar conclusão' : 'Marcar como concluída'}
                          >
                            {isDone ? (
                              <CheckCircle2 size={20} className="text-emerald-500 fill-emerald-500/20" />
                            ) : (
                              <Circle size={20} className="text-zinc-600 group-hover:text-zinc-400" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-mono font-bold text-[#ff7b00] shrink-0">
                                {lvl.level}.{mod.number}
                              </span>
                              <h3
                                className={`text-sm sm:text-base font-semibold truncate transition-colors ${
                                  isDone
                                    ? 'text-zinc-400 group-hover:text-zinc-200'
                                    : 'text-zinc-100 group-hover:text-white'
                                }`}
                              >
                                {mod.title}
                              </h3>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap text-xs text-zinc-500">
                              {mod.time_estimate && (
                                <span className="inline-flex items-center gap-1 text-[11px] bg-zinc-800/80 px-2 py-0.5 rounded text-zinc-400">
                                  <Clock size={11} /> {mod.time_estimate}
                                </span>
                              )}

                              {mod.key_chords && mod.key_chords.length > 0 && (
                                <div className="hidden sm:flex items-center gap-1 flex-wrap">
                                  {mod.key_chords.slice(0, 4).map((c) => (
                                    <span
                                      key={c}
                                      className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#ff7b00]/10 text-orange-400 border border-[#ff7b00]/20"
                                    >
                                      {c}
                                    </span>
                                  ))}
                                  {mod.key_chords.length > 4 && (
                                    <span className="text-[10px] text-zinc-500">
                                      +{mod.key_chords.length - 4}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* LADO DIREITO: BOTÃO ESTUDAR */}
                        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pl-9 sm:pl-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLesson({
                                module: mod,
                                levelTitle: lvl.title,
                                levelNumber: lvl.level
                              });
                            }}
                            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 ${
                              isDone
                                ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-750'
                                : 'bg-[#ff7b00]/15 hover:bg-[#ff7b00] text-[#ff7b00] hover:text-zinc-950 border border-[#ff7b00]/30 shadow-sm'
                            }`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Estudar</span>
                            <ChevronRight size={13} className="hidden sm:inline" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL COM O CONTEÚDO DE FATO (CONCEITO, EXEMPLOS, ACORDES, EXERCÍCIOS E IA) */}
      {activeLesson && (
        <AcademyLessonModal
          module={activeLesson.module}
          levelTitle={activeLesson.levelTitle}
          levelNumber={activeLesson.levelNumber}
          isCompleted={Boolean(progressMap[activeLesson.module.id])}
          onToggleComplete={handleToggleComplete}
          onClose={() => setActiveLesson(null)}
          onNext={handleNextLesson}
          onPrev={handlePrevLesson}
          hasNext={currentIndex < allModulesFlat.length - 1}
          hasPrev={currentIndex > 0}
          onAskAI={(prompt) => {
            if (onAskAI) {
              onAskAI(prompt, activeLesson);
            }
          }}
        />
      )}
    </div>
  );
};
