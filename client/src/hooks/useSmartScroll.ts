import { useState, useEffect, useRef, useCallback } from 'react';

export function useSmartScroll() {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(3); // 1 a 10
  const [isTemporarilyPaused, setIsTemporarilyPaused] = useState<boolean>(false);

  const animationFrameRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Pausa Inteligente de 2 segundos ao detectar toque na tela ou rolagem do músico
  const handleUserInteraction = useCallback(() => {
    if (!isPlaying) return;

    setIsTemporarilyPaused(true);

    if (pauseTimeoutRef.current) {
      window.clearTimeout(pauseTimeoutRef.current);
    }

    pauseTimeoutRef.current = window.setTimeout(() => {
      setIsTemporarilyPaused(false);
    }, 2000); // 2 segundos conforme especificação
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
        // Velocidade 1..10 mapeada para pixels por segundo (ex: vel 1 = 15px/s, vel 10 = 150px/s)
        const pixelsPerSecond = speed * 15;
        const pixelsToScroll = (pixelsPerSecond * delta) / 1000;

        window.scrollBy({
          top: pixelsToScroll,
          left: 0,
          behavior: 'auto'
        });

        // Verificar se atingiu o fim da página
        const reachedBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 5);
        if (reachedBottom) {
          setIsPlaying(false);
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
  }, [isPlaying, isTemporarilyPaused, speed]);

  const togglePlay = () => {
    setIsPlaying(prev => !prev);
    setIsTemporarilyPaused(false);
  };

  const increaseSpeed = () => setSpeed(prev => Math.min(10, prev + 1));
  const decreaseSpeed = () => setSpeed(prev => Math.max(1, prev - 1));

  return {
    isPlaying,
    speed,
    isTemporarilyPaused,
    setSpeed,
    togglePlay,
    increaseSpeed,
    decreaseSpeed
  };
}
