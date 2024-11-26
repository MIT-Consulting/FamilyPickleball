import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from './components/Sidebar';
import PlayerList from './components/PlayerList';
import TeamList from './components/TeamList';
import './App.css';
import { HashRouter as Router } from 'react-router-dom';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
  },
});

const TEAM_COLORS = [
  '#7CB9E8', // bright blue
  '#F0B6D5', // bright pink
  '#98FB98', // pale green
  '#FFB347', // pastel orange
  '#87CEEB', // sky blue
  '#DDA0DD', // plum
  '#F4C430', // saffron
  '#FF69B4', // hot pink
  '#98FF98', // mint green
  '#E6E6FA', // lavender
  '#FFA07A', // light salmon
  '#9370DB', // medium purple
  '#40E0D0', // turquoise
  '#FFBF00', // amber
];

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleAddPlayer = (playerName, skillLevel, gender) => {
    const newPlayer = {
      id: Date.now(),
      name: playerName,
      skillLevel: skillLevel,
      gender: gender,
      rank: players.length + 1
    };
    setPlayers([...players, newPlayer]);
  };

  const handleUpdatePlayer = (playerId, updates) => {
    setPlayers(players.map(player => 
      player.id === playerId ? { ...player, ...updates } : player
    ));
  };

  const handleDeletePlayer = (playerId) => {
    // First remove player from their team if they're in one
    const playerToDelete = players.find(p => p.id === playerId);
    if (playerToDelete && playerToDelete.teamId) {
      const team = teams.find(t => t.id === playerToDelete.teamId);
      if (team) {
        handleUpdateTeam(team.id, {
          playerIds: team.playerIds.filter(id => id !== playerId)
        });
      }
    }
    // Then remove the player
    setPlayers(players.filter(player => player.id !== playerId));
  };

  const handleMovePlayer = (currentIndex, direction) => {
    if (
      (direction === 'up' && currentIndex === 0) || 
      (direction === 'down' && currentIndex === players.length - 1)
    ) {
      return; // Don't move if at the edges
    }

    const newPlayers = [...players];
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap players
    [newPlayers[currentIndex], newPlayers[newIndex]] = 
    [newPlayers[newIndex], newPlayers[currentIndex]];
    
    // Update ranks
    setPlayers(newPlayers.map((player, index) => ({
      ...player,
      rank: index + 1
    })));
  };

  const getNextTeamColor = () => {
    const usedColors = new Set(teams.map(team => team.color));
    return TEAM_COLORS.find(color => !usedColors.has(color)) || TEAM_COLORS[0];
  };

  const handleAddTeam = (teamName) => {
    const newTeam = {
      id: Date.now(),
      name: teamName,
      playerIds: [],
      color: getNextTeamColor()
    };
    setTeams([...teams, newTeam]);
  };

  const handleUpdateTeam = (teamId, updates) => {
    setTeams(teams.map(team => 
      team.id === teamId ? { ...team, ...updates } : team
    ));
  };

  const handleDeleteTeam = (teamId) => {
    // Remove team and unassign its players
    const team = teams.find(t => t.id === teamId);
    if (team) {
      setPlayers(players.map(player => 
        player.teamId === teamId
          ? { ...player, teamId: null }
          : player
      ));
    }
    setTeams(teams.filter(team => team.id !== teamId));
  };

  const handleAssignPlayer = (playerId, teamId) => {
    // Remove player from previous team if any
    const previousTeam = teams.find(team => team.playerIds.includes(playerId));
    if (previousTeam) {
      handleUpdateTeam(previousTeam.id, {
        playerIds: previousTeam.playerIds.filter(id => id !== playerId)
      });
    }

    // Add player to new team
    if (teamId) {
      handleUpdateTeam(teamId, {
        playerIds: [...teams.find(t => t.id === teamId).playerIds, playerId]
      });
    }

    // Update player's teamId
    setPlayers(players.map(player =>
      player.id === playerId ? { ...player, teamId } : player
    ));
  };

  return (
    <Router>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: 'flex', minHeight: '100vh', overflow: 'hidden' }}>
          <Sidebar 
            isOpen={isSidebarOpen}
            onToggle={toggleSidebar}
            onAddPlayer={handleAddPlayer}
            onAddTeam={handleAddTeam}
            teams={teams}
          />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 1,
              transition: 'all 0.2s',
              width: '100%'
            }}
          >
            {!isSidebarOpen && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={toggleSidebar}
                edge="start"
                sx={{ mb: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Box sx={{ display: 'flex', gap: 1, flexDirection: 'column' }}>
              <PlayerList
                players={players}
                teams={teams}
                onUpdatePlayer={handleUpdatePlayer}
                onDeletePlayer={handleDeletePlayer}
                onMovePlayer={handleMovePlayer}
                onAssignPlayer={handleAssignPlayer}
              />
              <TeamList
                teams={teams}
                players={players}
                onUpdateTeam={handleUpdateTeam}
                onDeleteTeam={handleDeleteTeam}
                onAssignPlayer={handleAssignPlayer}
              />
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </Router>
  );
}

export default App; 