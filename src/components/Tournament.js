import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stack,
  useTheme
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { ColorModeContext } from '../App';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase-config';
import * as Icons from '@mui/icons-material';
import ShieldIcon from '@mui/icons-material/Shield';
import CastleIcon from '@mui/icons-material/Castle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StarIcon from '@mui/icons-material/Star';
import { keyframes } from '@mui/system';

// Initial bracket structure for 12 teams
const createInitialBracket = (teams, players) => {
  // Sort teams by skill level for seeding
  const sortedTeams = [...teams].sort((a, b) => {
    const aSkill = a.playerIds?.reduce((sum, id) => {
      const player = players.find(p => p.id === id);
      return sum + (player?.skillLevel || 0);
    }, 0) || 0;
    const bSkill = b.playerIds?.reduce((sum, id) => {
      const player = players.find(p => p.id === id);
      return sum + (player?.skillLevel || 0);
    }, 0) || 0;
    return bSkill - aSkill;
  });

  // First round matches (8 teams, 4 matches)
  const firstRoundMatches = [
    { 
      id: 'W1', 
      team1: sortedTeams[4],   // 5th seed
      team2: sortedTeams[11],  // 12th seed
      winner: null 
    },
    { 
      id: 'W2', 
      team1: sortedTeams[5],   // 6th seed
      team2: sortedTeams[10],  // 11th seed
      winner: null 
    },
    { 
      id: 'W3', 
      team1: sortedTeams[6],   // 7th seed
      team2: sortedTeams[9],   // 10th seed
      winner: null 
    },
    { 
      id: 'W4', 
      team1: sortedTeams[7],   // 8th seed
      team2: sortedTeams[8],   // 9th seed
      winner: null 
    }
  ];

  // Second round matches (top 4 seeds with byes)
  const secondRoundMatches = [
    { 
      id: 'W5', 
      team1: sortedTeams[0],  // 1st seed
      team2: null,            // Winner of W1
      winner: null 
    },
    { 
      id: 'W6', 
      team1: sortedTeams[1],  // 2nd seed
      team2: null,            // Winner of W2
      winner: null 
    },
    { 
      id: 'W7', 
      team1: sortedTeams[2],  // 3rd seed
      team2: null,            // Winner of W3
      winner: null 
    },
    { 
      id: 'W8', 
      team1: sortedTeams[3],  // 4th seed
      team2: null,            // Winner of W4
      winner: null 
    }
  ];

  return {
    winnersRounds: [
      {
        // First round (4 matches)
        matches: firstRoundMatches
      },
      {
        // Second round (4 matches with byes)
        matches: secondRoundMatches
      },
      {
        // Semi-finals (2 matches)
        matches: [
          { id: 'W9', team1: null, team2: null, winner: null },
          { id: 'W10', team1: null, team2: null, winner: null }
        ]
      },
      {
        // Winners final
        matches: [
          { id: 'W11', team1: null, team2: null, winner: null }
        ]
      }
    ],
    losersRounds: [
      {
        // L1-L4: First losers from winners bracket
        matches: [
          { id: 'L1', team1: null, team2: null, winner: null },  // Loser from W1
          { id: 'L2', team1: null, team2: null, winner: null },  // Loser from W2
          { id: 'L3', team1: null, team2: null, winner: null },  // Loser from W3
          { id: 'L4', team1: null, team2: null, winner: null }   // Loser from W4
        ]
      },
      {
        // L5-L6: Second round losers
        matches: [
          { id: 'L5', team1: null, team2: null, winner: null },  // Loser from W5
          { id: 'L6', team1: null, team2: null, winner: null }   // Loser from W6
        ]
      },
      {
        // L7-L8: Third round losers
        matches: [
          { id: 'L7', team1: null, team2: null, winner: null },  // Loser from W7
          { id: 'L8', team1: null, team2: null, winner: null }   // Loser from W8
        ]
      },
      {
        // L9: Fourth round
        matches: [
          { id: 'L9', team1: null, team2: null, winner: null }   // Loser from W9
        ]
      },
      {
        // L10: Final losers match
        matches: [
          { id: 'L10', team1: null, team2: null, winner: null }  // Loser from W10
        ]
      }
    ],
    finals: {
      match: { id: 'F1', team1: null, team2: null, winner: null },
      trueFinals: null  // Created if losers bracket winner wins first finals
    }
  };
};

const FAMILY_ICONS = {
  Miller: ShieldIcon,
  Holcomb: CastleIcon,
  Burton: AccountBalanceIcon
};

const FAMILY_COLORS = {
  Miller: '#90caf9',
  Holcomb: '#c48b9f',
  Burton: '#81c784'
};

const Match = ({ match, onWinnerSelect, players, isFinals, handleTeamContextMenu }) => {
  const getTeamIcon = (team) => {
    if (!team) return null;
    const IconComponent = Icons[team.iconName] || Icons.EmojiEvents;
    return <IconComponent sx={{ color: team.color, fontSize: 20 }} />;
  };

  const calculateTeamSkill = (team) => {
    if (!team) return 0;
    return team.playerIds?.reduce((total, playerId) => {
      const player = players.find(p => p.id === playerId);
      return total + (player?.skillLevel || 0);
    }, 0) || 0;
  };

  const getTeamFamilies = (team) => {
    if (!team) return new Set();
    const families = team.playerIds?.map(playerId => {
      const player = players.find(p => p.id === playerId);
      return player?.family;
    }).filter(Boolean);
    return new Set(families);
  };

  const TeamDisplay = ({ team, isWinner, isFinals, matchId }) => {
    if (!team) return (
      <Box sx={{ p: 1, opacity: 0.5 }}>
        <Typography color="text.secondary">TBD</Typography>
      </Box>
    );

    const totalSkill = calculateTeamSkill(team);
    
    // Get players with their families
    const teamPlayers = team.playerIds?.map(playerId => {
      const player = players.find(p => p.id === playerId);
      return {
        name: player?.name,
        family: player?.family
      };
    }).filter(Boolean) || [];

    // Add color scale function
    const getSkillColor = (skill) => {
      if (skill <= 4) return theme => theme.palette.mode === 'dark' ? '#ffeb3b' : '#b2a429';
      if (skill <= 6) return theme => theme.palette.mode === 'dark' ? '#ffc107' : '#b28704';
      if (skill <= 8) return theme => theme.palette.mode === 'dark' ? '#ff9800' : '#b36a00';
      return theme => theme.palette.mode === 'dark' ? '#f44336' : '#aa2e25';
    };

    return (
      <Box
        onClick={() => onWinnerSelect?.(team)}
        onContextMenu={(e) => handleTeamContextMenu?.(e, team.id, matchId)}
        sx={{
          p: 1,
          cursor: 'pointer',
          borderRadius: 1,
          bgcolor: theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
          '&:hover': { 
            bgcolor: theme => theme.palette.mode === 'dark' ? '#383838' : '#e8e8e8'
          },
          transition: 'all 0.2s',
          borderLeft: `4px solid ${team.color || '#666'}`,
          ...(isWinner && {
            outline: theme => `2px solid ${theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.5)' : 'rgba(76, 175, 80, 0.7)'}`,
            outlineOffset: '-2px',
            boxShadow: theme => theme.palette.mode === 'dark' 
              ? '0 0 8px rgba(76, 175, 80, 0.3)'
              : '0 0 8px rgba(76, 175, 80, 0.2)',
            '& .MuiTypography-root': {
              color: theme => theme.palette.mode === 'dark' ? '#81c784' : '#2e7d32'
            }
          })
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ width: '100%' }}>
          {getTeamIcon(team)}
          <Typography sx={{ flexGrow: 1, color: 'text.primary' }}>{team.name}</Typography>
          <Typography
            variant="caption"
            sx={{
              color: getSkillColor(totalSkill),
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              ml: 'auto',
              fontWeight: 'bold'
            }}
          >
            <StarIcon sx={{ fontSize: '0.9rem' }} />
            {totalSkill}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} mt={1} sx={{ ml: 2 }}>
          {teamPlayers.map((player, index) => {
            const Icon = FAMILY_ICONS[player.family];
            return (
              <Box 
                key={index}
                sx={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {Icon && (
                  <Icon 
                    sx={{ 
                      color: FAMILY_COLORS[player.family],
                      fontSize: '1rem'
                    }}
                  />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.8rem'
                  }}
                >
                  {player.name}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      gap: 1,
      ...(isFinals && {
        transform: 'scale(1.1)',
        transformOrigin: 'center'
      })
    }}>
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          fontSize: isFinals ? '0.9rem' : '0.8rem',
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}
      >
        {match.id}
      </Typography>
      <Card 
        id={match.id}
        sx={{ 
          width: '100%',
          maxWidth: isFinals ? 'none' : '400px',
          bgcolor: 'background.paper',
          '&:hover': {
            boxShadow: 3
          },
          transition: 'box-shadow 0.2s',
          borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'
        }}
      >
        <CardContent>
          <Stack spacing={1}>
            <TeamDisplay 
              team={match.team1} 
              isWinner={match.winner?.id === match.team1?.id}
              isFinals={isFinals}
              matchId={match.id}
            />
            <Box sx={{ 
              height: '1px', 
              bgcolor: 'divider',
              mx: 1 
            }} />
            <TeamDisplay 
              team={match.team2}
              isWinner={match.winner?.id === match.team2?.id}
              isFinals={isFinals}
              matchId={match.id}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

// Add confetti animation keyframes
const confettiAnimation = keyframes`
  0% {
    transform: translateY(-100vh) rotate(0deg);
  }
  100% {
    transform: translateY(100vh) rotate(360deg);
  }
`;

// Add Confetti component
const Confetti = ({ isActive }) => {
  // Create 50 pieces of confetti with different colors, sizes, and delays
  const confettiPieces = Array.from({ length: 50 }).map((_, i) => {
    const colors = ['#f00', '#0f0', '#00f', '#ff0', '#0ff', '#f0f'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    const size = Math.random() * 10 + 5;
    const left = `${Math.random() * 100}%`;
    const animationDelay = `${Math.random() * 3}s`;
    const animationDuration = `${Math.random() * 3 + 2}s`;

    return (
      <Box
        key={i}
        sx={{
          position: 'fixed',
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: '50%',
          left,
          top: '-20px',
          opacity: isActive ? 1 : 0,
          animation: `${confettiAnimation} ${animationDuration} linear ${animationDelay} infinite`,
          transition: 'opacity 0.3s',
          zIndex: 9999
        }}
      />
    );
  });

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none'
      }}
    >
      {confettiPieces}
    </Box>
  );
};

const clearDownstreamMatches = (bracket, matchId) => {
  // Map of which matches affect which downstream matches
  const downstreamMap = {
    'W1': ['W5', 'L1'],
    'W2': ['W5', 'L1'],
    'W3': ['W6', 'L2'],
    'W4': ['W6', 'L2'],
    'W5': ['W9', 'L3'],
    'W6': ['W9', 'L3'],
    'W7': ['W10', 'L4'],
    'W8': ['W10', 'L4'],
    'W9': ['W11', 'L7'],
    'W10': ['W11', 'L8'],
    'W11': ['F1', 'L10'],
    'L1': ['L5'],
    'L2': ['L5'],
    'L3': ['L6'],
    'L4': ['L6'],
    'L5': ['L7'],
    'L6': ['L8'],
    'L7': ['L9'],
    'L8': ['L9'],
    'L9': ['L10'],
    'L10': ['F1'],
    'F1': ['F2']  // In case of true finals
  };

  const clearMatch = (matchId) => {
    // Find and clear the match
    let matchFound = false;
    
    // Check winners bracket
    bracket.winnersRounds.forEach(round => {
      round.matches.forEach(match => {
        if (match.id === matchId) {
          // Keep team1 for first round winners matches (W1-W8)
          if (match.id.startsWith('W') && parseInt(match.id.slice(1)) <= 8) {
            match.team2 = null;
          } else {
            match.team1 = null;
            match.team2 = null;
          }
          match.winner = null;
          matchFound = true;
        }
      });
    });

    // Check losers bracket
    if (!matchFound) {
      bracket.losersRounds.forEach(round => {
        round.matches.forEach(match => {
          if (match.id === matchId) {
            match.team1 = null;
            match.team2 = null;
            match.winner = null;
            matchFound = true;
          }
        });
      });
    }

    // Check finals
    if (!matchFound && matchId === 'F1' && bracket.finals?.match) {
      bracket.finals.match.team2 = null;
      bracket.finals.match.winner = null;
      bracket.finals.trueFinals = null;
    }

    // Clear downstream matches recursively
    const downstream = downstreamMap[matchId];
    if (downstream) {
      downstream.forEach(nextMatchId => clearMatch(nextMatchId));
    }
  };

  // Get downstream matches and clear them
  const downstream = downstreamMap[matchId];
  if (downstream) {
    downstream.forEach(matchId => clearMatch(matchId));
  }

  return bracket;
};

function Tournament() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [bracket, setBracket] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading tournament data...');
        const [teamsSnap, playersSnap, bracketSnap] = await Promise.all([
          get(ref(db, 'teams')),
          get(ref(db, 'players')),
          get(ref(db, 'tournament'))
        ]);

        const loadedTeams = teamsSnap.val() ? Object.values(teamsSnap.val()) : [];
        const loadedPlayers = playersSnap.val() ? Object.values(playersSnap.val()) : [];
        
        console.log('Loaded teams:', loadedTeams.length);
        console.log('Loaded players:', loadedPlayers.length);

        setTeams(loadedTeams);
        setPlayers(loadedPlayers);
        setBracket(bracketSnap.val() || null);
      } catch (error) {
        console.error('Error loading tournament data:', error);
      }
    };

    loadData();
  }, []);

  const initializeBracket = () => {
    // Add validation
    if (!teams || teams.length < 12) {
      alert('Need at least 12 teams to start the tournament');
      return;
    }

    if (!players || players.length === 0) {
      alert('No players available');
      return;
    }

    console.log('Creating bracket with teams:', teams.length);
    console.log('Available players:', players.length);

    const initialBracket = createInitialBracket(teams, players);
    console.log('Initial bracket created:', initialBracket);

    // Stop any confetti that might be playing
    setShowConfetti(false);

    setBracket(initialBracket);
    set(ref(db, 'tournament'), initialBracket);
  };

  const handleWinnerSelect = (bracketType, roundIndex, matchIndex, winner) => {
    if (!bracket) return;

    const newBracket = { ...bracket };
    let match;
    let loser;

    if (bracketType === 'winners') {
      match = newBracket.winnersRounds[roundIndex].matches[matchIndex];
      match.winner = winner;
      loser = winner.id === match.team1.id ? match.team2 : match.team1;

      // Move winner to next match based on the flow chart
      const winnerProgressionMap = {
        'W1': 'W5',
        'W2': 'W6',
        'W3': 'W7',
        'W4': 'W8',
        'W5': 'W9',
        'W6': 'W9',
        'W7': 'W10',
        'W8': 'W10',
        'W9': 'W11',
        'W10': 'W11',
        'W11': 'F'
      };

      const nextMatchId = winnerProgressionMap[match.id];
      if (nextMatchId === 'F') {
        if (newBracket.finals?.match) {
          newBracket.finals.match.team1 = winner;
        }
      } else {
        const nextMatch = newBracket.winnersRounds.reduce((found, round) => {
          if (found) return found;
          return round.matches.find(m => m.id === nextMatchId);
        }, null);

        if (nextMatch) {
          if (['W5', 'W6', 'W7', 'W8'].includes(nextMatch.id)) {
            nextMatch.team2 = winner;
          } else if (!nextMatch.team1) {
            nextMatch.team1 = winner;
          } else {
            nextMatch.team2 = winner;
          }
        }
      }

      // Move loser to losers bracket
      const losersDestinationMap = {
        'W1': { id: 'L1', position: 'team2' },
        'W2': { id: 'L1', position: 'team1' },
        'W3': { id: 'L2', position: 'team2' },
        'W4': { id: 'L2', position: 'team1' },
        'W5': { id: 'L3', position: 'team2' },
        'W6': { id: 'L3', position: 'team1' },
        'W7': { id: 'L4', position: 'team2' },
        'W8': { id: 'L4', position: 'team1' },
        'W9': { id: 'L7', position: 'team2' },
        'W10': { id: 'L8', position: 'team2' },
        'W11': { id: 'L10', position: 'team2' }
      };

      const destination = losersDestinationMap[match.id];
      if (destination) {
        const losersMatch = newBracket.losersRounds.reduce((found, round) => {
          if (found) return found;
          return round.matches.find(m => m.id === destination.id);
        }, null);

        if (losersMatch) {
          losersMatch[destination.position] = loser;
        }
      }
    } else if (bracketType === 'losers') {
      match = newBracket.losersRounds[roundIndex].matches[matchIndex];
      match.winner = winner;

      const loserProgressionMap = {
        'L1': { id: 'L5', position: 'team1' },
        'L2': { id: 'L5', position: 'team2' },
        'L3': { id: 'L6', position: 'team1' },
        'L4': { id: 'L6', position: 'team2' },
        'L5': { id: 'L7', position: 'team1' },
        'L6': { id: 'L8', position: 'team1' },
        'L7': { id: 'L9', position: 'team1' },
        'L8': { id: 'L9', position: 'team2' },
        'L9': { id: 'L10', position: 'team1' },
        'L10': { id: 'F1', position: 'team2' }
      };

      const nextMatchId = loserProgressionMap[match.id];
      if (nextMatchId.id === 'F1') {
        if (newBracket.finals?.match) {
          newBracket.finals.match.team2 = winner;
        }
      } else {
        const nextMatch = newBracket.losersRounds.reduce((found, round) => {
          if (found) return found;
          return round.matches.find(m => m.id === nextMatchId.id);
        }, null);

        if (nextMatch) {
          nextMatch[nextMatchId.position] = winner;
        }
      }
    } else if (bracketType === 'finals') {
      if (!newBracket.finals?.match) return;
      
      match = newBracket.finals.match;
      match.winner = winner;

      // Trigger confetti for finals winner
      setShowConfetti(true);

      // If losers bracket winner wins, create true finals
      if (winner.id === match.team2.id && !newBracket.finals.trueFinals) {
        newBracket.finals.trueFinals = {
          id: 'F2',
          team1: match.team1,
          team2: match.team2,
          winner: null
        };
        // Stop confetti if there will be true finals
        setShowConfetti(false);
      }
    } else if (bracketType === 'trueFinals') {
      // Trigger confetti for true finals winner
      setShowConfetti(true);
    }

    setBracket(newBracket);
    set(ref(db, 'tournament'), newBracket);
  };

  const handleTeamContextMenu = (e, teamId, matchId) => {
    e.preventDefault(); // Prevent default right-click menu
    
    if (!bracket) return;
    
    const newBracket = { ...bracket };
    
    // Function to find and clear team from a specific match
    const clearTeamFromMatch = (match) => {
      if (match.id === matchId) {
        if (match.team1?.id === teamId) {
          match.team1 = null;
          match.winner = null;
          return true;
        }
        if (match.team2?.id === teamId) {
          match.team2 = null;
          match.winner = null;
          return true;
        }
      }
      return false;
    };

    // Search through all matches for the specific matchId
    let found = false;
    
    // Check winners bracket
    newBracket.winnersRounds.forEach(round => {
      round.matches.forEach(match => {
        if (clearTeamFromMatch(match)) {
          found = true;
        }
      });
    });

    // Check losers bracket
    if (!found) {
      newBracket.losersRounds.forEach(round => {
        round.matches.forEach(match => {
          if (clearTeamFromMatch(match)) {
            found = true;
          }
        });
      });
    }

    // Check finals
    if (!found && newBracket.finals?.match) {
      if (clearTeamFromMatch(newBracket.finals.match)) {
        found = true;
      }
    }

    if (found) {
      setBracket(newBracket);
      set(ref(db, 'tournament'), newBracket);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Add Confetti component */}
      <Confetti isActive={showConfetti} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon /> Tournament Bracket
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Tooltip title="Toggle Dark/Light Mode">
            <IconButton onClick={colorMode.toggleColorMode} color="inherit">
              {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          <Tooltip title="Initialize New Tournament">
            <IconButton onClick={initializeBracket} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {!bracket && (
        <Button 
          variant="contained" 
          onClick={initializeBracket}
          sx={{ mt: 2 }}
        >
          Start Tournament
        </Button>
      )}

      {bracket && bracket.winnersRounds && bracket.losersRounds && (
        <Box sx={{ 
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          overflowX: 'auto'
        }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: `repeat(4, minmax(300px, 1fr)) minmax(330px, 1.1fr) repeat(5, minmax(300px, 1fr))`,
            gridTemplateRows: 'auto repeat(4, 1fr)',
            columnGap: '24px',
            rowGap: '32px',
            width: '100%',
            maxWidth: '100%'
          }}>
            {/* Headers Row */}
            {['Round 1', 'Round 2', 'Round 3', 'Round 4', 'Finals', 'Round 5', 'Round 4', 'Round 3', 'Round 2', 'Round 1'].map((title, index) => (
              <Typography 
                key={title + index}
                variant={title === 'Finals' ? 'h5' : 'h6'} 
                sx={{ 
                  gridRow: 1,
                  gridColumn: index + 1,
                  textAlign: 'center',
                  mb: 2,
                  ...(title === 'Finals' && {
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  })
                }}
              >
                {title}
              </Typography>
            ))}

            {/* Winners Bracket Games */}
            {bracket.winnersRounds[0].matches.map((match, index) => (
              <Box sx={{ gridColumn: 1, gridRow: index + 2 }}>
                <Match
                  key={match.id}
                  match={match}
                  players={players}
                  handleTeamContextMenu={handleTeamContextMenu}
                  onWinnerSelect={(winner) => handleWinnerSelect('winners', 0, index, winner)}
                />
              </Box>
            ))}

            {bracket.winnersRounds[1].matches.map((match, index) => (
              <Box sx={{ gridColumn: 2, gridRow: index + 2 }}>
                <Match
                  key={match.id}
                  match={match}
                  players={players}
                  handleTeamContextMenu={handleTeamContextMenu}
                  onWinnerSelect={(winner) => handleWinnerSelect('winners', 1, index, winner)}
                />
              </Box>
            ))}

            {bracket.winnersRounds[2].matches.map((match, index) => (
              <Box sx={{ 
                gridColumn: 3, 
                // W9 stays in row 2, W10 aligns with row 3 (same as W6)
                gridRow: index === 0 ? 2 : 3
              }}>
                <Match
                  key={match.id}
                  match={match}
                  players={players}
                  handleTeamContextMenu={handleTeamContextMenu}
                  onWinnerSelect={(winner) => handleWinnerSelect('winners', 2, index, winner)}
                />
              </Box>
            ))}

            {/* W11 */}
            <Box sx={{ gridColumn: 4, gridRow: 2 }}>
              <Match
                match={bracket.winnersRounds[3].matches[0]}
                players={players}
                handleTeamContextMenu={handleTeamContextMenu}
                onWinnerSelect={(winner) => handleWinnerSelect('winners', 3, 0, winner)}
              />
            </Box>

            {/* Finals */}
            <Box sx={{ 
              gridColumn: 5, 
              gridRow: '1 / span 5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              height: '100%',
              width: '100%'
            }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  fontSize: '1.5rem',
                  fontWeight: 'bold',
                  mb: 2
                }}
              >
                Finals
              </Typography>
              <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                alignItems: 'center',
                width: '100%'
              }}>
                {bracket.finals?.match && (
                  <>
                    <Box sx={{ width: '100%' }}>
                      <Match
                        match={bracket.finals.match}
                        players={players}
                        handleTeamContextMenu={handleTeamContextMenu}
                        onWinnerSelect={(winner) => handleWinnerSelect('finals', 0, 0, winner)}
                        isFinals={true}
                      />
                    </Box>
                    {bracket.finals.match.winner && (
                      <Box sx={{ width: '100%', mt: 4 }}>
                        <Typography 
                          variant="h5" 
                          sx={{ 
                            textAlign: 'center',
                            mb: 2,
                            color: 'gold',
                            textTransform: 'uppercase',
                            fontWeight: 'bold',
                            textShadow: '0 0 10px rgba(255,215,0,0.5)'
                          }}
                        >
                          Champion
                        </Typography>
                        <Card sx={{ 
                          width: '100%',
                          bgcolor: 'background.paper',
                          backgroundColor: '#2d2d2d',
                          border: '2px solid gold',
                          boxShadow: '0 0 20px rgba(255,215,0,0.3)'
                        }}>
                          <CardContent>
                            <Box
                              sx={{
                                p: 1,
                                borderRadius: 1,
                                borderLeft: `4px solid ${bracket.finals.match.winner.color || '#666'}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                              }}
                            >
                              <EmojiEventsIcon sx={{ color: 'gold', fontSize: 32 }} />
                              <Typography variant="h6">
                                {bracket.finals.match.winner.name}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Box>

            {/* L10 */}
            <Box sx={{ gridColumn: 6, gridRow: 2 }}>
              <Match
                match={bracket.losersRounds[4].matches[0]}
                players={players}
                handleTeamContextMenu={handleTeamContextMenu}
                onWinnerSelect={(winner) => handleWinnerSelect('losers', 4, 0, winner)}
              />
            </Box>

            {/* L9 */}
            <Box sx={{ gridColumn: 7, gridRow: 2 }}>
              <Match
                match={bracket.losersRounds[3].matches[0]}
                players={players}
                handleTeamContextMenu={handleTeamContextMenu}
                onWinnerSelect={(winner) => handleWinnerSelect('losers', 3, 0, winner)}
              />
            </Box>

            {/* Losers Bracket Games */}
            {bracket.losersRounds[2].matches.map((match, index) => (
              <Box sx={{ 
                gridColumn: 8, 
                // L7 in row 2, L8 in row 3 (under L7)
                gridRow: index === 0 ? 2 : 3
              }}>
                <Match
                  key={match.id}
                  match={match}
                  players={players}
                  handleTeamContextMenu={handleTeamContextMenu}
                  onWinnerSelect={(winner) => handleWinnerSelect('losers', 2, index, winner)}
                />
              </Box>
            ))}

            {bracket.losersRounds[1].matches.map((match, index) => (
              <Box sx={{ gridColumn: 9, gridRow: index + 2 }}>
                <Match
                  key={match.id}
                  match={match}
                  players={players}
                  handleTeamContextMenu={handleTeamContextMenu}
                  onWinnerSelect={(winner) => handleWinnerSelect('losers', 1, index, winner)}
                />
              </Box>
            ))}

            {bracket.losersRounds[0].matches.map((match, index) => (
              <Box sx={{ gridColumn: 10, gridRow: index + 2 }}>
                <Match
                  key={match.id}
                  match={match}
                  players={players}
                  handleTeamContextMenu={handleTeamContextMenu}
                  onWinnerSelect={(winner) => handleWinnerSelect('losers', 0, index, winner)}
                />
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Tournament; 