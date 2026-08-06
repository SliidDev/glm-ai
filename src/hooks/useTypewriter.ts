import { useEffect, useRef, useState } from 'react';
import { TYPEWRITER_TICK_MS, TYPEWRITER_CHARS_PER_TICK } from '../constants/config';

interface UseTypewriterOptions {
  /** false renders the full text immediately — used for every
   * message except the one currently streaming. */
  active: boolean;
  /** Flips true when the user taps "stop" while this message is
   * still revealing. Freezes the animation at whatever is on screen. */
  stopRequested: boolean;
  reducedMotion: boolean;
  /** Fires exactly once per streaming session — on natural
   * completion (finalText === fullText) or on stop (finalText is
   * whatever had been revealed). The caller persists finalText and
   * flips the message's status to 'sent'. */
  onSettled: (finalText: string) => void;
}

export function useTypewriter(
  fullText: string,
  { active, stopRequested, reducedMotion, onSettled }: UseTypewriterOptions
) {
  const [visibleLength, setVisibleLength] = useState(() =>
    active && !reducedMotion ? 0 : fullText.length
  );
  const settledRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    settledRef.current = false;

    const settle = (length: number) => {
      if (settledRef.current) return;
      settledRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
      onSettled(fullText.slice(0, length));
    };

    if (!active || reducedMotion) {
      setVisibleLength(fullText.length);
      settle(fullText.length);
      return;
    }

    setVisibleLength(0);
    intervalRef.current = setInterval(() => {
      setVisibleLength((prev) => {
        const next = Math.min(fullText.length, prev + TYPEWRITER_CHARS_PER_TICK);
        if (next >= fullText.length) settle(next);
        return next;
      });
    }, TYPEWRITER_TICK_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // fullText is deliberately the only text-affecting dependency: a
    // message that's already streaming shouldn't restart mid-reveal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullText, active, reducedMotion]);

  useEffect(() => {
    if (!stopRequested || settledRef.current) return;
    if (intervalRef.current) clearInterval(intervalRef.current);
    setVisibleLength((current) => {
      settledRef.current = true;
      onSettled(fullText.slice(0, current));
      return current;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopRequested]);

  return {
    displayedText: fullText.slice(0, visibleLength),
    isAnimating: active && !reducedMotion && !settledRef.current && visibleLength < fullText.length,
  };
}
