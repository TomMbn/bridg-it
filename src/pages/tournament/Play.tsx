import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { mockPlayers } from '../../mocks/data';
import { TableConfig, PairScore } from '../../types/tournament';
import { GridItem } from '../../components/common/GridItem';

interface TableState {
  elapsedTime: number;
  isFinished: boolean;
  finishTime?: number; // Temps auquel la table a terminé
}

interface TournamentState {
  currentBoard: number;
  totalBoards: number;
  tableStates: { [key: string]: TableState };
  pairScores: PairScore[];
}

export default function TournamentPlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tables } = location.state as { tables: TableConfig[] };
  
  // Initialiser l'état du tournoi
  const [tournamentState, setTournamentState] = useState<TournamentState>(() => {
    const initialTableStates: { [key: string]: TableState } = {};
    const initialPairScores: PairScore[] = [];

    tables.forEach(table => {
      initialTableStates[table.id] = {
        elapsedTime: 0,
        isFinished: false,
      };

      if (table.players.north && table.players.south) {
        initialPairScores.push({
          tableId: table.id,
          pairId: `${table.players.north}-${table.players.south}`,
          players: {
            player1Id: table.players.north,
            player2Id: table.players.south,
          },
          direction: 'NS',
          score: 0,
        });
      }

      if (table.players.east && table.players.west) {
        initialPairScores.push({
          tableId: table.id,
          pairId: `${table.players.east}-${table.players.west}`,
          players: {
            player1Id: table.players.east,
            player2Id: table.players.west,
          },
          direction: 'EW',
          score: 0,
        });
      }
    });

    return {
      currentBoard: 1,
      totalBoards: 6,
      tableStates: initialTableStates,
      pairScores: initialPairScores,
    };
  });

  // Simuler la fin de la donne pour une table
  useEffect(() => {
    tables.forEach(table => {
      // Générer un temps de fin aléatoire entre 5 et 15 secondes pour chaque table
      const finishTime = Math.floor(Math.random() * 11) + 5; // 5-15 secondes
      const timer = setTimeout(() => {
        setTournamentState(prev => ({
          ...prev,
          tableStates: {
            ...prev.tableStates,
            [table.id]: {
              ...prev.tableStates[table.id],
              isFinished: true,
              finishTime,
            },
          },
        }));
      }, finishTime * 1000);

      return () => clearTimeout(timer);
    });
  }, [tables, tournamentState.currentBoard]);

  // Gérer le décompte du temps
  useEffect(() => {
    const timer = setInterval(() => {
      setTournamentState(prev => {
        const newTableStates = { ...prev.tableStates };
        let needsUpdate = false;

        // Mettre à jour le temps pour chaque table non terminée
        Object.keys(newTableStates).forEach(tableId => {
          if (!newTableStates[tableId].isFinished) {
            newTableStates[tableId] = {
              ...newTableStates[tableId],
              elapsedTime: newTableStates[tableId].elapsedTime + 1,
            };
            needsUpdate = true;
          }
        });

        if (!needsUpdate) {
          return prev;
        }

        return {
          ...prev,
          tableStates: newTableStates,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Vérifier si toutes les tables ont terminé
  const areAllTablesFinished = useCallback(() => {
    return Object.values(tournamentState.tableStates).every(state => state.isFinished);
  }, [tournamentState.tableStates]);

  // Passer à la donne suivante
  const moveToNextBoard = useCallback(() => {
    if (tournamentState.currentBoard < tournamentState.totalBoards) {
      setTournamentState(prev => {
        const newTableStates: { [key: string]: TableState } = {};
        tables.forEach(table => {
          newTableStates[table.id] = {
            elapsedTime: 0,
            isFinished: false,
          };
        });

        // Mettre à jour les scores des paires
        const newPairScores = prev.pairScores.map(pairScore => ({
          ...pairScore,
          score: pairScore.score + Math.floor(Math.random() * 100),
        }));

        return {
          ...prev,
          currentBoard: prev.currentBoard + 1,
          tableStates: newTableStates,
          pairScores: newPairScores,
        };
      });
    }
  }, [tables, tournamentState.currentBoard, tournamentState.totalBoards]);

  // Vérifier si toutes les tables ont terminé et passer à la donne suivante
  useEffect(() => {
    if (areAllTablesFinished()) {
      const timer = setTimeout(() => {
        moveToNextBoard();
      }, 2000); // Attendre 2 secondes avant de passer à la donne suivante
      return () => clearTimeout(timer);
    }
  }, [areAllTablesFinished, moveToNextBoard]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Terminer le tournoi
  const handleEndTournament = () => {
    navigate('/tournament/results', {
      state: {
        tables,
        pairScores: tournamentState.pairScores,
      },
    });
  };

  // Fonction utilitaire pour obtenir les noms des joueurs
  const getPlayerNames = (player1Id: string, player2Id: string): string => {
    const player1 = mockPlayers.find(p => p.id === player1Id)?.name || '';
    const player2 = mockPlayers.find(p => p.id === player2Id)?.name || '';
    return `${player1} / ${player2}`;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Tournoi en cours
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Donne {tournamentState.currentBoard} / {tournamentState.totalBoards}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {tables.map((table, index) => {
            const tableState = tournamentState.tableStates[table.id];
            const displayTime = tableState.isFinished 
              ? formatTime(tableState.finishTime || 0)
              : formatTime(tableState.elapsedTime);

            return (
              <GridItem xs={12} md={6} key={table.id}>
                <Paper sx={{ 
                  p: 3,
                  backgroundColor: '#ffffff',
                  borderRadius: 2,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                  }
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Table {table.number}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body1">
                        {displayTime}
                      </Typography>
                      <Chip
                        label={tableState.isFinished ? "Donne terminée" : "Donne en cours"}
                        color={tableState.isFinished ? "success" : "primary"}
                      />
                    </Box>
                  </Box>

                  <Grid container spacing={2}>
                    <GridItem xs={12}>
                      <Typography variant="body1">
                        Nord/Sud: {mockPlayers.find(p => p.id === table.players.north)?.name} / {mockPlayers.find(p => p.id === table.players.south)?.name}
                      </Typography>
                      <Typography variant="body1">
                        Est/Ouest: {mockPlayers.find(p => p.id === table.players.east)?.name} / {mockPlayers.find(p => p.id === table.players.west)?.name}
                      </Typography>
                    </GridItem>
                  </Grid>
                </Paper>
              </GridItem>
            );
          })}
        </Grid>

        {tournamentState.currentBoard === tournamentState.totalBoards && areAllTablesFinished() && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleEndTournament}
            >
              Terminer le tournoi
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Classement provisoire Nord/Sud
          </Typography>
          <TableContainer 
            component={Paper} 
            sx={{ 
              mb: 4,
              backgroundColor: '#ffffff',
              borderRadius: 2,
              '& .MuiTable-root': {
                backgroundColor: 'transparent',
              },
              '& .MuiTableRow-root:nth-of-type(odd)': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              },
            }}
          >
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Paire</TableCell>
                  <TableCell>Table</TableCell>
                  <TableCell align="right">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tournamentState.pairScores
                  .filter(score => score.direction === 'NS')
                  .sort((a, b) => b.score - a.score)
                  .map((score, index) => (
                    <TableRow key={score.pairId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {getPlayerNames(score.players.player1Id, score.players.player2Id)}
                      </TableCell>
                      <TableCell>
                        Table {tables.find(t => t.id === score.tableId)?.number}
                      </TableCell>
                      <TableCell align="right">{score.score}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Typography variant="h6" gutterBottom>
            Classement provisoire Est/Ouest
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Position</TableCell>
                  <TableCell>Paire</TableCell>
                  <TableCell>Table</TableCell>
                  <TableCell align="right">Score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tournamentState.pairScores
                  .filter(score => score.direction === 'EW')
                  .sort((a, b) => b.score - a.score)
                  .map((score, index) => (
                    <TableRow key={score.pairId}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {getPlayerNames(score.players.player1Id, score.players.player2Id)}
                      </TableCell>
                      <TableCell>
                        Table {tables.find(t => t.id === score.tableId)?.number}
                      </TableCell>
                      <TableCell align="right">{score.score}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Container>
  );
} 