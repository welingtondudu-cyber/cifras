import { useState, useEffect, useRef, useCallback } from 'react';

interface UseSmartScrollOptions {
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

  // Pausa Inteligente de 2 segundos ao detectar toque na tela ou rolagem do músico
  const handleUserInteraction = useCallback(() => {
    if (!isPlaying) return;

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
    const events = ['touchstart', 'touchmove', 'wheel', 'keydown'];

    events.forEach(evt => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(evt => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      if (pauseTimeoutRef.current) {
        clearTimeout(pauseTimeoutRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, [handleUserInteraction]);

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

  // Loop de rolagem suave com requestAnimationFrame
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
      if (lastTimeRef.current !== null) {
        const delta = time - lastTimeRef.current;
        // Velocidade 1..10 mapeada para pixels por segundo
        const pixelsPerSecond = speed * 15;
        const pixelsToScroll = (pixelsPerSecond * delta) / 1000;

        window.scrollBy({
          top: pixelsToScroll,
          left: 0,
          behavior: 'auto'
        });

        // Verificar se atingiu o fim da página
        const reachedBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 10);
        if (reachedBottom) {
          // Caso rolagem dupla (2x) e ainda no 1º ciclo: retornar suavemente ao topo e repetir
          if (scrollCycles === 2 && currentCycleRef.current === 1) {
            currentCycleRef.current = 2;
            setCurrentCycle(2);
            setIsTemporarilyPaused(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            if (resetTimeoutRef.current) window.clearTimeout(resetTimeoutRef.current);
            resetTimeoutRef.current = window.setTimeout(() => {
              setIsTemporarilyPaused(false);
            }, 1800);
            return;
          }

          // Completou todos os ciclos (1x ou 2x)
          setIsPlaying(false);
          currentCycleRef.current = 1;
          setCurrentCycle(1);

          // Se estiver em repertório com avanço automático ativo
          if (autoAdvanceEnabled && options?.canAutoAdvance && options?.onAutoAdvance) {
            setTimeout(() => {
              options.onAutoAdvance?.();
            }, 1200);
          }
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
  }, [isPlaying, isTemporarilyPaused, speed, scrollCycles, autoAdvanceEnabled, options]);

  const togglePlay = () => {
    if (!isPlaying) {
      currentCycleRef.current = 1;
      setCurrentCycle(1);
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

