export interface BridgeIt {
  id: string;
  name: string;
  status: 'available' | 'busy' | 'maintenance';
  lastMaintenance: string;
}

export interface Player {
  id: string;
  name: string;
  ranking: number;
}

export interface TablePlayers {
  north: string | null;
  south: string | null;
  east: string | null;
  west: string | null;
}

export interface TableConfig {
  id: string;
  number: number;
  bridgeIt: string | null;
  players: TablePlayers;
}

export interface TableState {
  elapsedTime: number;
  isFinished: boolean;
  finishTime?: number;
}

export interface TournamentState {
  currentBoard: number;
  totalBoards: number;
  tables: TableConfig[];
  tableStates: { [key: string]: TableState };
  pairScores: PairScore[];
  boardResults: BoardResult[];
  isActive: boolean;
}

export interface BoardResult {
  boardNumber: number;
  tableId: string;
  score: number;
}

export interface TableScore {
  tableId: string;
  northSouth: number;
  eastWest: number;
}

export interface PairScore {
  tableId: string;
  pairId: string;
  players: {
    player1Id: string;
    player2Id: string;
  };
  direction: 'NS' | 'EW';
  score: number;
} 