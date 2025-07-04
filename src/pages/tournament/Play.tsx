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
import { TableConfig, PairScore, BoardResult } from '../../types/tournament';
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
  boardResults: BoardResult[];
}

export default function TournamentPlay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tables } = location.state as { tables: TableConfig[] };
  
  // Initialiser l'état du tournoi
  const [tournamentState, setTournamentState] = useState<TournamentState>(() => {
    // Tenter de récupérer l'état sauvegardé
    const savedState = localStorage.getItem('tournament_state');
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      // Vérifier si l'état sauvegardé correspond aux tables actuelles
      const hasAllTables = tables.every(table => 
        parsedState.tableStates && parsedState.tableStates[table.id]
      );
      
      if (hasAllTables) {
        return {
          currentBoard: parsedState.currentBoard,
          totalBoards: parsedState.totalBoards,
          tableStates: parsedState.tableStates,
          pairScores: parsedState.pairScores,
          boardResults: parsedState.boardResults || []
        };
      }
    }

    // Si pas d'état sauvegardé ou état invalide, initialiser un nouvel état
    const initialTableStates: { [key: string]: TableState } = {};
    const initialPairScores: PairScore[] = [];
    const initialBoardResults: BoardResult[] = [];

    tables.forEach(table => {
      initialTableStates[table.id] = {
        elapsedTime: 0,
        isFinished: false,
        finishTime: 0
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

    const initialState = {
      currentBoard: 1,
      totalBoards: 6,
      tableStates: initialTableStates,
      pairScores: initialPairScores,
      boardResults: initialBoardResults,
    };

    // Sauvegarder l'état initial
    localStorage.setItem('tournament_state', JSON.stringify(initialState));
    return initialState;
  });

  // Sauvegarder l'état à chaque modification
  useEffect(() => {
    localStorage.setItem('tournament_state', JSON.stringify(tournamentState));
  }, [tournamentState]);

  // Simuler la fin de la donne pour une table
  useEffect(() => {
    tables.forEach(table => {
      // Générer un temps de fin aléatoire entre 1 et 5 secondes pour chaque table
      const finishTime = Math.floor(Math.random() * 5) + 1; // 1-5 secondes
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
        const newBoardResults: BoardResult[] = [...prev.boardResults];
        
        tables.forEach(table => {
          newTableStates[table.id] = {
            elapsedTime: 0,
            isFinished: false,
          };

          // Générer un score pour la table (entre 50 et 650 points)
          const nsScore = Math.floor(Math.random() * 600) + 50;
          const ewScore = Math.floor(Math.random() * 600) + 50;
          
          // Ajouter les résultats de la donne pour cette table
          newBoardResults.push({
            boardNumber: prev.currentBoard,
            tableId: table.id,
            nsScore: nsScore,
            ewScore: ewScore
          });
        });

        // Mettre à jour les scores des paires en fonction des résultats de la donne
        const newPairScores = prev.pairScores.map(pairScore => {
          const tableResults = newBoardResults
            .filter(result => 
              result.tableId === pairScore.tableId && 
              result.boardNumber === prev.currentBoard
            );
          
          const boardScore = tableResults.reduce((sum, result) => {
            // Utiliser le score approprié selon la direction de la paire
            const score = pairScore.direction === 'NS' ? result.nsScore : result.ewScore;
            return sum + score;
          }, 0);

          return {
            ...pairScore,
            score: pairScore.score + boardScore,
          };
        });

        const newState = {
          ...prev,
          currentBoard: prev.currentBoard + 1,
          tableStates: newTableStates,
          pairScores: newPairScores,
          boardResults: newBoardResults,
        };

        // Sauvegarder immédiatement le nouvel état
        localStorage.setItem('tournament_state', JSON.stringify(newState));
        return newState;
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
    // Nettoyer le localStorage avant de naviguer vers les résultats
    localStorage.removeItem('tournament_state');
    
    console.log('Board results before navigation:', tournamentState.boardResults);
    
    navigate('/tournament/results', {
      state: {
        tables,
        pairScores: tournamentState.pairScores,
        boardResults: tournamentState.boardResults,
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