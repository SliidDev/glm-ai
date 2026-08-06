import { useCallback, useEffect, useState } from 'react';
import { RecentPrompt, getPromptHistory, clearPromptHistory } from '../storage/promptHistoryStorage';

export function usePromptHistory() {
  const [history, setHistory] = useState<RecentPrompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    const stored = await getPromptHistory();
    setHistory(stored);
  }, []);

  useEffect(() => {
    void (async () => {
      await load();
      setIsLoading(false);
    })();
  }, [load]);

  const clear = useCallback(async () => {
    setHistory([]);
    await clearPromptHistory();
  }, []);

  return { history, isLoading, refresh: load, clear };
}
