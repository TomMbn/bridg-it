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

export interface Table {
  id: string;
  number: number;
  bridgeIt: BridgeIt | null;
  players: {
    north: Player | null;
    south: Player | null;
    east: Player | null;
    west: Player | null;
  };
}

export const mockBridgeIts: BridgeIt[] = [
  {
    id: 'bi-001',
    name: 'BridgeIt #1',
    status: 'available',
    lastMaintenance: '2024-03-15',
  },
  {
    id: 'bi-002',
    name: 'BridgeIt #2',
    status: 'available',
    lastMaintenance: '2024-03-14',
  },
  {
    id: 'bi-003',
    name: 'BridgeIt #3',
    status: 'maintenance',
    lastMaintenance: '2024-03-16',
  },
  {
    id: 'bi-004',
    name: 'BridgeIt #4',
    status: 'busy',
    lastMaintenance: '2024-03-13',
  },
];

export const mockPlayers: Player[] = [
  { id: 'p1', name: 'Alice Martin', ranking: 1850 },
  { id: 'p2', name: 'Bob Wilson', ranking: 1920 },
  { id: 'p3', name: 'Charlie Brown', ranking: 1750 },
  { id: 'p4', name: 'Diana Smith', ranking: 1890 },
  { id: 'p5', name: 'Eve Johnson', ranking: 1800 },
  { id: 'p6', name: 'Frank Davis', ranking: 1950 },
  { id: 'p7', name: 'Grace Taylor', ranking: 1830 },
  { id: 'p8', name: 'Henry Miller', ranking: 1870 },
];

export const mockPBNContent = `
[Event "Example Tournament"]
[Site "Bridge Club"]
[Date "2024.03.16"]
[Board "1"]
[Dealer "N"]
[Vulnerable "None"]
[Deal "N:KQ432.A3.KJ4.QJ2 A98.KQJ4.A32.K43 J7.98765.Q98.965 T65.T2.T765.AT87"]
[Scoring "IMP"]
[Declarer "N"]
[Contract "4H"]
[Result "10"]
`; 