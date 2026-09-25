import React, { useState, useEffect, useRef, useCallback } from 'react';

interface UseSmartScrollOptions {
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  onAutoAdvance?: () => void;
  canAutoAdvance?: boolean;
}

export function useSmartScroll(options?: UseSmartScrollOptions) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(3); // 1 a 10
  const [isTemporarilyPaused, setIsTemporarilyPaused] = useState<boolean>(false);

  // Rolagem única (1x) ou dupla (2x com repetição após chegar ao fim)
  const [scrollCycles, setScrollCycles] = useState<1 | 2>(() => {
    try {
      const saved = localStorage.getItem('cifralab_scroll_cycles');
      return saved === '2' ? 2 : 1;
    } catch {
      return 1;
    }
  });

  const [currentCycle, setCurrentCycle] = useState<number>(1);
  const currentCycleRef = useRef<number>(1);

  // Avanço automático para a próxima música em repertório
  const [autoAdvanceEnabled, setAutoAdvanceEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cifralab_auto_advance');
      return saved !== 'false'; // Padrão: ativado
    } catch {
      return true;
    }
  });

  const animationFrameRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const resetTimeoutRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const accumulatedScrollRef = useRef<number>(0);

  // Helper para obter o container com rolagem real (seja main, div de conteúdo ou window)
  const getTargetContainer = useCallback((): HTMLElement | null => {
    if (options?.scrollContainerRef?.current) {
      return options.scrollContainerRef.current;
    }
    const mainEl = document.getElementById('main-scroll-container') || document.querySelector('main.overflow-y-auto');
    if (mainEl instanceof HTMLElement) {
      return mainEl;
    }
    return (document.scrollingElement || document.documentElement || document.body) as HTMLElement | null;
  }, [options?.scrollContainerRef]);

  // Salvar preferências no localStorage
  const updateScrollCycles = (cycles: 1 | 2) => {
    setScrollCycles(cycles);
    try {
      localStorage.setItem('cifralab_scroll_cycles', cycles.toString());
    } catch {}
  };

  const updateAutoAdvance = (enabled: boolean) => {
    setAutoAdvanceEnabled(enabled);
    try {
      localStorage.setItem('cifralab_auto_advance', enabled ? 'true' : 'false');
    } catch {}
  };

  // Pausa Inteligente de 2 segundos ao detectar rolagem manual do músico
  const handleUserInteraction = useCallback((e: Event) => {
    if (!isPlaying) return;

    // Se o evento foi disparado dentro da barra flutuante ou de controles, ignora e não pausa
    const target = e.target as HTMLElement | null;
    if (
      target &&
      target.closest(
        '[data-scroll-control], .floating-toolbar, button, input, select, textarea, [role="dialog"], [role="menu"]'
      )
    ) {
      return;
    }

    setIsTemporarilyPaused(true);

    if (pauseTimeoutRef.current) {
      window.clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = window.setTimeout(() => {
      setIsTemporarilyPaused(false);
    }, 2000);
  }, [isPlaying]);

  // Listener para toques e rolagens manuais
  useEffect(() => {
    const handleWheelOrTouch = (e: Event) => handleUserInteraction(e);
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(e.key)) {
        const target = e.target as HTMLElement | null;
        if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
        handleUserInteraction(e);
      }
    };

    window.addEventListener('wheel', handleWheelOrTouch, { passive: true });
    window.addEventListener('touchmove', handleWheelOrTouch, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    const container = getTargetContainer();
    if (container) {
      container.addEventListener('wheel', handleWheelOrTouch, { passive: true });
      container.addEventListener('touchmove', handleWheelOrTouch, { passive: true });
    }

    return () => {
      window.removeEventListener('wheel', handleWheelOrTouch);
      window.removeEventListener('touchmove', handleWheelOrTouch);
      window.removeEventListener('keydown', handleKeyDown);
      if (container) {
        container.removeEventListener('wheel', handleWheelOrTouch);
        container.removeEventListener('touchmove', handleWheelOrTouch);
      }
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [handleUserInteraction, getTargetContainer]);

  // Diretriz Antigravity: Pausar auto-scroll em 'visibilitychange' para economizar CPU
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isPlaying) {
        setIsTemporarilyPaused(true);
      } else if (!document.hidden && isPlaying) {
        setIsTemporarilyPaused(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPlaying]);

  // Loop de rolagem suave com requestAnimationFrame e suporte a subpixels
  useEffect(() => {
    if (!isPlaying || isTemporarilyPaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      lastTimeRef.current = null;
      return;
    }

    const scrollLoop = (time: number) => {
      const container = getTargetContainer();

      if (lastTimeRef.current !== null && container) {
        const delta = time - lastTimeRef.current;
        // Velocidade 1..10 mapeada para pixels por segundo (16 a 160 px/s)
        const pixelsPerSecond = speed * 16;
        const pixelsToScroll = (pixelsPerSecond * delta) / 1000;

        // Acumulação de subpixels para garantir fluidez em qualquer taxa de quadros e navegador
        accumulatedScrollRef.current += pixelsToScroll;

        if (accumulatedScrollRef.current >= 1) {
          const toMove = Math.floor(accumulatedScrollRef.current);
          container.scrollTop += toMove;
          accumulatedScrollRef.current -= toMove;

          // Se o container for o document/body, também move via window.scrollBy
          if (container === document.documentElement || container === document.body) {
            window.scrollBy({ top: toMove, left: 0, behavior: 'auto' });
          }
        }

        const currentScroll = container.scrollTop || window.scrollY || 0;
        const scrollHeight = container.scrollHeight || document.documentElement.scrollHeight || 0;
        const clientHeight = container.clientHeight || window.innerHeight || 0;

        // Se a página tem altura para rolagem
        const canScroll = scrollHeight > clientHeight + 20;

        // Verificar se atingiu o fim da página
        const reachedBottom = canScroll && (clientHeight + currentScroll) >= (scrollHeight - 15);

        if (reachedBottom) {
          // Caso rolagem dupla (2x) e ainda no 1º ciclo: retornar suavemente ao topo e iniciar o ciclo 2
          if (scrollCycles === 2 && currentCycleRef.current === 1) {
            currentCycleRef.current = 2;
            setCurrentCycle(2);
            setIsTemporarilyPaused(true);
            accumulatedScrollRef.current = 0;

            if (container.scrollTo) {
              container.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
              container.scrollTop = 0;
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = window.setTimeout(() => {
              setIsTemporarilyPaused(false);
            }, 1800);
            return;
          }

          // Se estiver em repertório com avanço automático ativo e puder avançar para a próxima música
          if (autoAdvanceEnabled && options?.canAutoAdvance && options?.onAutoAdvance) {
            // Continua executando a rolagem (não desativa isPlaying), apenas faz uma pausa suave durante a transição
            setIsTemporarilyPaused(true);
            currentCycleRef.current = 1;
            setCurrentCycle(1);
            accumulatedScrollRef.current = 0;

            if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = window.setTimeout(() => {
              options.onAutoAdvance?.();

              // Garante retorno imediato ao topo da nova cifra
              if (container.scrollTo) {
                container.scrollTo({ top: 0, behavior: 'auto' });
              } else {
                container.scrollTop = 0;
              }
              window.scrollTo({ top: 0, behavior: 'auto' });

              // Aguarda um momento (1.2s) para o músico ler o título e tom da próxima música, e continua a rolagem automaticamente!
              setTimeout(() => {
                setIsTemporarilyPaused(false);
              }, 1200);
            }, 1000);
            return;
          }

          // Completou todos os ciclos (1x ou 2x) e não há avanço automático (ou chegou ao fim do repertório)
          setIsPlaying(false);
          currentCycleRef.current = 1;
          setCurrentCycle(1);
          accumulatedScrollRef.current = 0;
          return;
        }
      }

      lastTimeRef.current = time;
      animationFrameRef.current = requestAnimationFrame(scrollLoop);
    };

    animationFrameRef.current = requestAnimationFrame(scrollLoop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isPlaying, isTemporarilyPaused, speed, scrollCycles, autoAdvanceEnabled, options, getTargetContainer]);

  const togglePlay = () => {
    const container = getTargetContainer();
    if (!isPlaying) {
      currentCycleRef.current = 1;
      setCurrentCycle(1);
      accumulatedScrollRef.current = 0;

      // Se o usuário já estiver no final da página ao clicar Play, retorna ao topo para tocar do início
      if (container) {
        const currentScroll = container.scrollTop || window.scrollY || 0;
        const scrollHeight = container.scrollHeight || document.documentElement.scrollHeight || 0;
        const clientHeight = container.clientHeight || window.innerHeight || 0;
        if (scrollHeight > clientHeight + 30 && (currentScroll + clientHeight >= scrollHeight - 30)) {
          if (container.scrollTo) {
            container.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            container.scrollTop = 0;
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
    setIsPlaying(prev => !prev);
    setIsTemporarilyPaused(false);
  };

  const increaseSpeed = () => setSpeed(prev => Math.min(10, prev + 1));
  const decreaseSpeed = () => setSpeed(prev => Math.max(1, prev - 1));

  return {
    isPlaying,
    speed,
    isTemporarilyPaused,
    scrollCycles,
    currentCycle,
    autoAdvanceEnabled,
    setSpeed,
    togglePlay,
    increaseSpeed,
    decreaseSpeed,
    setScrollCycles: updateScrollCycles,
    setAutoAdvanceEnabled: updateAutoAdvance
  };
}

