import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { TableConfig, TournamentState, TableState, BoardResult } from '../types/tournament';

const STORAGE_KEY = 'tournament_state';

type TournamentAction =
  | { type: 'UPDATE_TIME'; payload: { tableId: string; time: number } }
  | { type: 'FINISH_BOARD'; payload: { tableId: string; results: BoardResult } }
  | { type: 'NEXT_BOARD' }
  | { type: 'LOAD_STATE'; payload: TournamentState }
  | { type: 'END_TOURNAMENT' };

const tournamentReducer = (state: TournamentState, action: TournamentAction): TournamentState => {
  let newState: TournamentState;

  switch (action.type) {
    case 'UPDATE_TIME':
      newState = {
        ...state,
        tables: state.tables.map((table: TableConfig) =>
          table.id === action.payload.tableId
            ? { ...table, timeElapsed: action.payload.time }
            : table
        ),
      };
      break;

    case 'FINISH_BOARD':
      newState = {
        ...state,
        tables: state.tables.map((table: TableConfig) =>
          table.id === action.payload.tableId
            ? { ...table, isFinished: true }
            : table
        ),
        boardResults: [...state.boardResults, action.payload.results],
      };
      break;

    case 'NEXT_BOARD':
      newState = {
        ...state,
        currentBoard: state.currentBoard + 1,
        tables: state.tables.map((table: TableConfig) => ({
          ...table,
          timeElapsed: 0,
          targetFinishTime: Math.floor(Math.random() * 30) + 1,
          isFinished: false,
        })),
      };
      break;

    case 'LOAD_STATE':
      newState = action.payload;
      break;

    case 'END_TOURNAMENT':
      newState = {
        ...state,
        isActive: false,
      };
      break;

    default:
      return state;
  }

  // Persister l'état dans localStorage
  localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  return newState;
};

const TournamentContext = createContext<{
  state: TournamentState;
  dispatch: React.Dispatch<TournamentAction>;
} | null>(null);

export const TournamentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tournamentReducer, null, () => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      currentBoard: 1,
      totalBoards: 12,
      tables: [],
      pairs: [],
      boardResults: [],
      isActive: false,
      startTime: Date.now(),
    };
  });

  return (
    <TournamentContext.Provider value={{ state, dispatch }}>
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => {
  const context = useContext(TournamentContext);
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
}; 