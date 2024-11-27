import React, { useState, useEffect } from 'react';
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
import { ref, onValue, set, remove } from 'firebase/database';
import { db } from './firebase-config';

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

  // Load data when component mounts
  useEffect(() => {
    const playersRef = ref(db, 'players');
    const teamsRef = ref(db, 'teams');

    onValue(playersRef, (snapshot) => {
      const data = snapshot.val();
      setPlayers(data ? Object.values(data) : []);
    });

    onValue(teamsRef, (snapshot) => {
      const data = snapshot.val();
      setTeams(data ? Object.values(data) : []);
    });
  }, []);

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
    set(ref(db, `players/${newPlayer.id}`), newPlayer);
  };

  const handleUpdatePlayer = (playerId, updates) => {
    const playerRef = ref(db, `players/${playerId}`);
    const playerToUpdate = players.find(p => p.id === playerId);
    set(playerRef, { ...playerToUpdate, ...updates });
  };

  const handleDeletePlayer = (playerId) => {
    remove(ref(db, `players/${playerId}`));
    // Update team if player was assigned
    const playerToDelete = players.find(p => p.id === playerId);
    if (playerToDelete?.teamId) {
      const team = teams.find(t => t.id === playerToDelete.teamId);
      if (team) {
        const updatedPlayerIds = team.playerIds.filter(id => id !== playerId);
        set(ref(db, `teams/${team.id}/playerIds`), updatedPlayerIds);
      }
    }
  };

  const handleMovePlayer = (playerId, direction) => {
    const sortedPlayers = [...players].sort((a, b) => a.rank - b.rank);
    const currentIndex = sortedPlayers.findIndex(p => p.id === playerId);
    const newIndex = currentIndex + direction;

    if (newIndex < 0 || newIndex >= sortedPlayers.length) {
      return;
    }

    // Swap ranks between the two players
    const player1 = sortedPlayers[currentIndex];
    const player2 = sortedPlayers[newIndex];
    const tempRank = player1.rank;
    player1.rank = player2.rank;
    player2.rank = tempRank;

    // Update both players in Firebase
    set(ref(db, `players/${player1.id}`), player1);
    set(ref(db, `players/${player2.id}`), player2);
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
    set(ref(db, `teams/${newTeam.id}`), newTeam);
  };

  const handleUpdateTeam = (teamId, updates) => {
    const teamRef = ref(db, `teams/${teamId}`);
    const teamToUpdate = teams.find(t => t.id === teamId);
    set(teamRef, { ...teamToUpdate, ...updates });
  };

  const handleDeleteTeam = (teamId) => {
    // Remove team and unassign its players
    const team = teams.find(t => t.id === teamId);
    if (team) {
      // Update all players that were in this team
      team.playerIds?.forEach(playerId => {
        const playerRef = ref(db, `players/${playerId}`);
        const player = players.find(p => p.id === playerId);
        if (player) {
          set(playerRef, { ...player, teamId: null });
        }
      });

      // Remove the team from Firebase
      remove(ref(db, `teams/${teamId}`));
    }
  };

  const handleAssignPlayer = (playerId, teamId) => {
    // Remove player from previous team if any
    const previousTeam = teams.find(team => team.playerIds?.includes(playerId));
    if (previousTeam) {
      const updatedPlayerIds = previousTeam.playerIds?.filter(id => id !== playerId) || [];
      set(ref(db, `teams/${previousTeam.id}/playerIds`), updatedPlayerIds);
    }

    // Add player to new team
    if (teamId) {
      const team = teams.find(t => t.id === teamId);
      const updatedPlayerIds = [...(team.playerIds || []), playerId];
      set(ref(db, `teams/${teamId}/playerIds`), updatedPlayerIds);
    }

    // Update player's teamId
    const playerRef = ref(db, `players/${playerId}`);
    const playerToUpdate = players.find(p => p.id === playerId);
    set(playerRef, { ...playerToUpdate, teamId });
  };

  const isTeamFull = (team) => {
    if (!team || !team.playerIds) return false;
    return (team.playerIds || []).length >= 2;
  };

  const getTeamCapacityText = (team) => {
    return `${(team.playerIds || []).length}/2`;
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