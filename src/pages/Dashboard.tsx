import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
} from '@mui/material';
import { mockBridgeIts } from '../mocks/data';
import { GridItem } from '../components/common/GridItem';

export default function Dashboard() {
  const navigate = useNavigate();
  const [selectedBridgeIts, setSelectedBridgeIts] = useState<string[]>([]);

  const handleBridgeItSelect = (id: string) => {
    setSelectedBridgeIts(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const handleCreateTournament = () => {
    navigate('/tournament/setup', { state: { selectedBridgeIts } });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sélection des distributeurs
        </Typography>
        <Typography variant="body1" sx={{ mb: 4 }}>
          Sélectionnez les distributeurs Bridge-it à utiliser pour le tournoi
        </Typography>

        <Grid container spacing={3}>
          {mockBridgeIts.map(bridgeIt => (
            <GridItem xs={12} sm={6} md={4} key={bridgeIt.id}>
              <Card sx={{ 
                backgroundColor: '#ffffff',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {bridgeIt.name}
                  </Typography>
                  <Chip
                    label={bridgeIt.status}
                    color={
                      bridgeIt.status === 'available'
                        ? 'success'
                        : bridgeIt.status === 'busy'
                        ? 'warning'
                        : 'error'
                    }
                    sx={{ mb: 2 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Dernière maintenance: {bridgeIt.lastMaintenance}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    variant={selectedBridgeIts.includes(bridgeIt.id) ? "contained" : "outlined"}
                    onClick={() => handleBridgeItSelect(bridgeIt.id)}
                    disabled={bridgeIt.status !== 'available'}
                  >
                    {selectedBridgeIts.includes(bridgeIt.id) ? 'Sélectionné' : 'Sélectionner'}
                  </Button>
                </CardActions>
              </Card>
            </GridItem>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateTournament}
            disabled={selectedBridgeIts.length === 0}
          >
            Créer le tournoi ({selectedBridgeIts.length} distributeurs)
          </Button>
        </Box>
      </Box>
    </Container>
  );
} 