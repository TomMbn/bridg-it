import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { mockPlayers } from '../../mocks/data';
import { TableConfig, PairScore, BoardResult } from '../../types/tournament';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { GridWrapper } from '../../components/common/GridWrapper';

export default function TournamentResults() {
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('Location state:', location.state); // Pour déboguer
  
  const { tables, pairScores, boardResults } = location.state as { 
    tables: TableConfig[],
    pairScores: PairScore[],
    boardResults: BoardResult[]
  };

  const getPlayerNames = (player1Id: string, player2Id: string): string => {
    const player1 = mockPlayers.find(p => p.id === player1Id)?.name || '';
    const player2 = mockPlayers.find(p => p.id === player2Id)?.name || '';
    return `${player1} / ${player2}`;
  };

  const getBoardScoresForTable = (tableId: string) => {
    // Récupérer tous les résultats pour cette table
    const tableResults = boardResults
      .filter(result => result.tableId === tableId)
      .sort((a, b) => a.boardNumber - b.boardNumber);

    // Vérifier si nous avons tous les résultats
    console.log(`Table ${tableId} results:`, tableResults);
    
    return tableResults;
  };

  const renderPairScoresTable = (scores: PairScore[], direction: 'NS' | 'EW') => {
    const directionLabel = direction === 'NS' ? 'Nord/Sud' : 'Est/Ouest';
    
    return (
      <Paper sx={{ 
        p: 4, 
        mb: 4,
        backgroundColor: '#ffffff',
        borderRadius: 2,
        '& .MuiTableRow-root:nth-of-type(odd)': {
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        },
        '& .MuiTableRow-root:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      }}>
        <Typography variant="h5" gutterBottom>
          Classement final {directionLabel}
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Position</TableCell>
                <TableCell>Paire</TableCell>
                <TableCell>Table</TableCell>
                <TableCell align="right">Score final</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores
                .filter(score => score.direction === direction)
                .sort((a, b) => b.score - a.score)
                .map((score, index) => (
                  <TableRow
                    key={score.pairId}
                    sx={index === 0 ? { backgroundColor: 'rgba(255, 215, 0, 0.1)' } : {}}
                  >
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>
                      {getPlayerNames(score.players.player1Id, score.players.player2Id)}
                    </TableCell>
                    <TableCell>
                      Table {tables.find(t => t.id === score.tableId)?.number}
                    </TableCell>
                    <TableCell align="right">
                      <Accordion 
                        sx={{ 
                          '&.MuiAccordion-root': {
                            boxShadow: 'none',
                            '&:before': {
                              display: 'none',
                            },
                          }
                        }}
                        TransitionProps={{ unmountOnExit: true }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ 
                            backgroundColor: 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(0, 0, 0, 0.05)',
                            },
                            '& .MuiAccordionSummary-content': {
                              margin: 0,
                              justifyContent: 'flex-end',
                            }
                          }}
                        >
                          <strong>{score.score}</strong>
                        </AccordionSummary>
                        <AccordionDetails sx={{ padding: 0 }}>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Donne</TableCell>
                                  <TableCell align="right">Score</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {getBoardScoresForTable(score.tableId).map((boardResult) => (
                                  <TableRow key={boardResult.boardNumber}>
                                    <TableCell>Donne {boardResult.boardNumber}</TableCell>
                                    <TableCell align="right">
                                      {score.direction === 'NS' ? boardResult.nsScore : boardResult.ewScore}
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow>
                                  <TableCell><strong>Total</strong></TableCell>
                                  <TableCell align="right">
                                    <strong>{score.score}</strong>
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  const handleNewTournament = () => {
    navigate('/dashboard');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Titre du document
    doc.setFontSize(20);
    doc.text('Résultats du tournoi de Bridge', doc.internal.pageSize.width / 2, 20, { align: 'center' });
    
    // Date du tournoi
    const today = new Date().toLocaleDateString('fr-FR');
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, doc.internal.pageSize.width / 2, 30, { align: 'center' });

    // Classement Nord/Sud
    doc.setFontSize(16);
    doc.text('Classement Nord/Sud', 14, 45);

    const nsData = pairScores
      .filter(score => score.direction === 'NS')
      .sort((a, b) => b.score - a.score)
      .map((score, index) => [
        (index + 1).toString(),
        getPlayerNames(score.players.player1Id, score.players.player2Id),
        `Table ${tables.find(t => t.id === score.tableId)?.number}`,
        score.score.toString()
      ]);

    autoTable(doc, {
      head: [['Position', 'Paire', 'Table', 'Score']],
      body: nsData,
      startY: 50,
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Classement Est/Ouest
    doc.setFontSize(16);
    doc.text('Classement Est/Ouest', 14, doc.lastAutoTable.finalY + 20);

    const ewData = pairScores
      .filter(score => score.direction === 'EW')
      .sort((a, b) => b.score - a.score)
      .map((score, index) => [
        (index + 1).toString(),
        getPlayerNames(score.players.player1Id, score.players.player2Id),
        `Table ${tables.find(t => t.id === score.tableId)?.number}`,
        score.score.toString()
      ]);

    autoTable(doc, {
      head: [['Position', 'Paire', 'Table', 'Score']],
      body: ewData,
      startY: doc.lastAutoTable.finalY + 25,
      theme: 'grid',
      headStyles: { fillColor: [25, 118, 210] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Pied de page
    doc.setFontSize(10);
    doc.text("Bridg'it", doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });

    // Sauvegarder le PDF
    doc.save('resultats-tournoi-bridge.pdf');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Résultats du tournoi
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileDownloadIcon />}
            onClick={exportToPDF}
          >
            Exporter en PDF
          </Button>
        </Box>

        {renderPairScoresTable(pairScores, 'NS')}
        {renderPairScoresTable(pairScores, 'EW')}

        <GridWrapper container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
          <GridWrapper isItem>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleNewTournament}
            >
              Nouveau tournoi
            </Button>
          </GridWrapper>
        </GridWrapper>
      </Box>
    </Container>
  );
} 