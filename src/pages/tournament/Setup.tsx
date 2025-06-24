import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  IconButton,
  ListItemIcon,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { mockPlayers, mockBridgeIts } from '../../mocks/data';
import { TableConfig } from '../../types/tournament';
import { GridWrapper } from '../../components/common/GridWrapper';

interface LocationState {
  selectedBridgeIts: string[];
}

const steps = ['Attribution des tables', 'Assignation des joueurs', 'Import PBN'];

// Composant pour un élément de fichier triable
function SortableFileItem({ file, index, onDelete }: { file: File; index: number; onDelete: (index: number) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.name });

  const style = {
    display: 'flex',
    alignItems: 'center',
    position: 'relative' as const,
    opacity: isDragging ? 0.5 : 1,
    transform: CSS.Transform.toString(transform),
    transition,
    bgcolor: isDragging ? 'action.hover' : 'background.paper',
    '&:hover': {
      bgcolor: 'action.hover',
    },
    mb: 1,
    borderRadius: 1,
    border: isDragging ? '1px solid' : 'none',
    borderColor: 'primary.main',
  };

  return (
    <ListItem
      ref={setNodeRef}
      sx={style}
    >
      <Box {...attributes} {...listeners} sx={{ display: 'flex', alignItems: 'center', width: 'calc(100% - 48px)', cursor: 'grab' }}>
        <ListItemIcon>
          <DragIndicatorIcon />
        </ListItemIcon>
        <ListItemIcon>
          <DescriptionIcon />
        </ListItemIcon>
        <ListItemText
          primary={file.name}
          secondary={`Taille: ${(file.size / 1024).toFixed(2)} KB`}
        />
      </Box>
      <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
        <IconButton
          edge="end"
          aria-label="delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(index);
          }}
          sx={{ 
            '&:hover': { 
              bgcolor: 'error.light',
              color: 'common.white',
            }
          }}
        >
          <DeleteIcon />
        </IconButton>
      </Box>
    </ListItem>
  );
}

export default function TournamentSetup() {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedBridgeIts: selectedBridgeItIds } = (location.state as LocationState) || { selectedBridgeIts: [] };
  const [activeStep, setActiveStep] = useState(0);
  const [tables, setTables] = useState<TableConfig[]>(
    selectedBridgeItIds.map((_: string, index: number) => ({
      id: `table-${index + 1}`,
      number: index + 1,
      bridgeIt: null,
      players: {
        north: null,
        south: null,
        east: null,
        west: null,
      },
    }))
  );
  const [pbnFiles, setPbnFiles] = useState<File[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handlePlayerAssignment = (
    tableId: string,
    position: 'north' | 'south' | 'east' | 'west',
    playerId: string | null
  ) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? {
              ...table,
              players: {
                ...table.players,
                [position]: playerId,
              },
            }
          : table
      )
    );
  };

  const handlePBNUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList) {
      const newFiles = Array.from(fileList) as File[];
      setPbnFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

  const handleDeleteFile = (index: number) => {
    setPbnFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPbnFiles((files) => {
        const oldIndex = files.findIndex((file) => file.name === active.id);
        const newIndex = files.findIndex((file) => file.name === over.id);
        return arrayMove(files, oldIndex, newIndex);
      });
    }
  };

  const handleBridgeItAssignment = (tableId: string, bridgeItId: string | null) => {
    setTables(prevTables =>
      prevTables.map(table =>
        table.id === tableId
          ? { ...table, bridgeIt: bridgeItId }
          : table
      )
    );
  };

  const handleStartTournament = () => {
    navigate('/tournament/play', {
      state: {
        tables,
        pbnFiles: pbnFiles.map(file => file.name),
      },
    });
  };

  const isStepComplete = (step: number): boolean => {
    switch (step) {
      case 0:
        return tables.every(table => table.bridgeIt !== null);
      case 1:
        return tables.every(table =>
          Object.values(table.players).every(player => player !== null)
        );
      case 2:
        return pbnFiles.length > 0;
      default:
        return false;
    }
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0: // Attribution des tables
        return (
          <GridWrapper container spacing={3}>
            {tables.map((table: TableConfig) => (
              <GridWrapper isItem xs={12} md={6} key={table.id}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Table {table.number}
                  </Typography>
                  <FormControl 
                    fullWidth 
                    sx={{
                      backgroundColor: '#ffffff',
                      borderRadius: 1,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  >
                    <InputLabel>Bridg'it</InputLabel>
                    <Select
                      value={table.bridgeIt || ''}
                      onChange={(e) => handleBridgeItAssignment(table.id, e.target.value)}
                      label="Bridg'it"
                    >
                      {mockBridgeIts
                        .filter(bridgeIt => 
                          // Vérifier si le bridg'it fait partie des bridg'its sélectionnés
                          selectedBridgeItIds.includes(bridgeIt.id) &&
                          // Et qu'il n'est pas déjà attribué à une autre table
                          !tables.some(t => 
                            t.id !== table.id && t.bridgeIt === bridgeIt.id
                          )
                        )
                        .map(bridgeIt => (
                          <MenuItem key={bridgeIt.id} value={bridgeIt.id}>
                            {bridgeIt.name} (ID: {bridgeIt.id})
                          </MenuItem>
                        ))
                      }
                    </Select>
                  </FormControl>
                </Paper>
              </GridWrapper>
            ))}
          </GridWrapper>
        );

      case 1: // Assignation des joueurs
        return (
          <GridWrapper container spacing={3}>
            {tables.map((table: TableConfig) => (
              <GridWrapper isItem xs={12} md={6} key={table.id}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Table {table.number}
                  </Typography>
                  <GridWrapper container spacing={2}>
                    {(['north', 'south', 'east', 'west'] as const).map(position => (
                      <GridWrapper isItem xs={12} sm={6} md={3} key={position}>
                        <FormControl 
                          fullWidth 
                          sx={{
                            backgroundColor: '#ffffff',
                            borderRadius: 1,
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        >
                          <InputLabel>
                            {position.charAt(0).toUpperCase() + position.slice(1)}
                          </InputLabel>
                          <Select
                            value={table.players[position] || ''}
                            onChange={(e) => handlePlayerAssignment(table.id, position, e.target.value)}
                            label={position.charAt(0).toUpperCase() + position.slice(1)}
                          >
                            {mockPlayers
                              .filter(player => {
                                // Vérifier si le joueur est déjà utilisé dans une autre table
                                const isUsedInOtherTable = tables.some(t => 
                                  t.id !== table.id && (
                                    t.players.north === player.id ||
                                    t.players.south === player.id ||
                                    t.players.east === player.id ||
                                    t.players.west === player.id
                                  )
                                );

                                // Vérifier si le joueur est déjà utilisé dans la table courante
                                const isUsedInCurrentTable = Object.entries(table.players)
                                  .some(([pos, playerId]) => 
                                    pos !== position && playerId === player.id
                                  );

                                // Le joueur est disponible s'il n'est pas utilisé dans une autre table
                                // ET s'il n'est pas déjà utilisé dans la table courante
                                return !isUsedInOtherTable && !isUsedInCurrentTable;
                              })
                              .map(player => (
                                <MenuItem key={player.id} value={player.id}>
                                  {player.name} (Classement: {player.ranking})
                                </MenuItem>
                              ))}
                          </Select>
                        </FormControl>
                      </GridWrapper>
                    ))}
                  </GridWrapper>
                </Paper>
              </GridWrapper>
            ))}
          </GridWrapper>
        );

      case 2: // Import PBN
        return (
          <Box>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Import des fichiers PBN
              </Typography>
              <Box sx={{ mb: 3 }}>
                <input
                  accept=".pbn"
                  style={{ display: 'none' }}
                  id="pbn-file-upload"
                  multiple
                  type="file"
                  onChange={handlePBNUpload}
                />
                <label htmlFor="pbn-file-upload">
                  <Button variant="contained" component="span">
                    Sélectionner les fichiers PBN
                  </Button>
                </label>
              </Box>
              {pbnFiles.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={pbnFiles.map(file => file.name)}
                      strategy={verticalListSortingStrategy}
                    >
                      <List sx={{
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        minHeight: '50px',
                      }}>
                        {pbnFiles.map((file, index) => (
                          <SortableFileItem
                            key={file.name}
                            file={file}
                            index={index}
                            onDelete={handleDeleteFile}
                          />
                        ))}
                      </List>
                    </SortableContext>
                  </DndContext>
                </Box>
              )}
            </Paper>
          </Box>
        );

      default:
        return 'Étape inconnue';
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Configuration du tournoi
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {getStepContent(activeStep)}

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
          <Button
            color="inherit"
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ mr: 1 }}
          >
            Retour
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleStartTournament}
              disabled={!isStepComplete(activeStep)}
            >
              Lancer le tournoi
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!isStepComplete(activeStep)}
            >
              Suivant
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
} 