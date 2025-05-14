import { useState, useEffect } from 'react';
import { useTournament } from '../contexts/TournamentContext';

export function useInitialLoad() {
  const [isLoading, setIsLoading] = useState(true);
  const { state } = useTournament();

  useEffect(() => {
    if (state) {
      setIsLoading(false);
    }
  }, [state]);

  return isLoading;
} 