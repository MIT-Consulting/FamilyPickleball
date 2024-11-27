import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ref, set, get } from 'firebase/database';
import { db } from '../firebase-config';
import * as Icons from '@mui/icons-material';
import ShieldIcon from '@mui/icons-material/Shield';
import CastleIcon from '@mui/icons-material/Castle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import StarIcon from '@mui/icons-material/Star';

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

const Match = ({ match, onWinnerSelect, players }) => {
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

  const TeamDisplay = ({ team, isWinner }) => {
    if (!team) return (
      <Box sx={{ p: 1, opacity: 0.5 }}>
        <Typography>TBD</Typography>
      </Box>
    );

    const totalSkill = calculateTeamSkill(team);
    const families = getTeamFamilies(team);

    return (
      <Box
        onClick={() => onWinnerSelect?.(team)}
        sx={{
          p: 1,
          cursor: 'pointer',
          borderRadius: 1,
          bgcolor: isWinner ? 'rgba(144, 202, 249, 0.16)' : 'transparent',
          '&:hover': { bgcolor: 'action.hover' },
          transition: 'background-color 0.2s',
          borderLeft: `4px solid ${team.color || '#666'}`,
          backgroundColor: isWinner ? 'rgba(144, 202, 249, 0.16)' : '#2d2d2d',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          {getTeamIcon(team)}
          <Typography>{team.name}</Typography>
          <Typography
            variant="caption"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              px: 1,
              py: 0.25,
              borderRadius: 1,
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              ml: 'auto'
            }}
          >
            <StarIcon sx={{ fontSize: '0.9rem' }} />
            {totalSkill}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} mt={0.5}>
          {Array.from(families).map(family => {
            const Icon = FAMILY_ICONS[family];
            return Icon ? (
              <Icon 
                key={family}
                sx={{ 
                  color: FAMILY_COLORS[family],
                  fontSize: '1.2rem'
                }}
              />
            ) : null;
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
      gap: 1
    }}>
      <Typography
        variant="caption"
        sx={{
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '0.8rem',
          fontFamily: 'monospace',
          fontWeight: 'bold'
        }}
      >
        {match.id}
      </Typography>
      <Card 
        id={match.id}
        sx={{ 
          width: '300px',
          bgcolor: 'background.paper',
          '&:hover': {
            boxShadow: 3
          },
          transition: 'box-shadow 0.2s',
          backgroundColor: '#2d2d2d',
        }}
      >
        <CardContent>
          <Stack spacing={1}>
            <TeamDisplay 
              team={match.team1} 
              isWinner={match.winner?.id === match.team1?.id}
            />
            <Box sx={{ 
              height: '1px', 
              bgcolor: 'divider',
              mx: 1 
            }} />
            <TeamDisplay 
              team={match.team2}
              isWinner={match.winner?.id === match.team2?.id}
            />
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

function Tournament() {
  const [bracket, setBracket] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);

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

    setBracket(initialBracket);
    set(ref(db, 'tournament'), initialBracket);
  };

  const handleWinnerSelect = (bracketType, roundIndex, matchIndex, winner) => {
    if (!bracket) return;

    const newBracket = { ...bracket };
    let match;
    let loser;

    if (bracketType === 'winners') {
      // Check if round and match exist
      if (!newBracket.winnersRounds[roundIndex]?.matches[matchIndex]) return;
      
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
        // Winner goes to finals
        if (newBracket.finals?.match) {
          newBracket.finals.match.team1 = winner;
        }
      } else {
        // Find the next match in any round
        const nextMatch = newBracket.winnersRounds.reduce((found, round) => {
          if (found) return found;
          return round.matches.find(m => m.id === nextMatchId);
        }, null);

        if (nextMatch) {
          // For matches W5-W8, winners from W1-W4 go to team2
          if (['W5', 'W6', 'W7', 'W8'].includes(nextMatch.id)) {
            nextMatch.team2 = winner;
          }
          // For W9-W11, first winner goes to team1, second to team2
          else if (!nextMatch.team1) {
            nextMatch.team1 = winner;
          } else {
            nextMatch.team2 = winner;
          }
        }
      }

      // Move loser to losers bracket based on the winners match ID
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

      // Find the destination match for the loser
      const destination = losersDestinationMap[match.id];
      if (destination) {
        // Find the correct match in the losers bracket
        const losersMatch = newBracket.losersRounds.reduce((found, round) => {
          if (found) return found;
          return round.matches.find(m => m.id === destination.id);
        }, null);

        if (losersMatch) {
          losersMatch[destination.position] = loser;
        }
      }
    } else if (bracketType === 'losers') {
      // Check if round and match exist
      if (!newBracket.losersRounds[roundIndex]?.matches[matchIndex]) return;
      
      match = newBracket.losersRounds[roundIndex].matches[matchIndex];
      match.winner = winner;

      // Update the losers progression map
      const loserProgressionMap = {
        // L1-L4 winners go to L5-L6
        'L1': { id: 'L5', position: 'team1' },
        'L2': { id: 'L5', position: 'team2' },
        'L3': { id: 'L6', position: 'team1' },
        'L4': { id: 'L6', position: 'team2' },
        // L5-L6 winners go to L7-L8
        'L5': { id: 'L7', position: 'team1' },
        'L6': { id: 'L8', position: 'team1' },
        // L7-L8 winners go to L9
        'L7': { id: 'L9', position: 'team1' },
        'L8': { id: 'L9', position: 'team2' },
        // L9 winner goes to L10
        'L9': { id: 'L10', position: 'team1' },
        // L10 winner goes to Finals team2 position
        'L10': { id: 'F1', position: 'team2' }
      };

      // Find next match using progression map
      const nextMatchId = loserProgressionMap[match.id];
      if (nextMatchId.id === 'F1') {
        // Winner goes to finals
        if (newBracket.finals?.match) {
          newBracket.finals.match.team2 = winner;
        }
      } else {
        // Find the next match in any round
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

      // If losers bracket winner wins, create true finals
      if (winner.id === match.team2.id && !newBracket.finals.trueFinals) {
        newBracket.finals.trueFinals = {
          id: 'F2',
          team1: match.team1,
          team2: match.team2,
          winner: null
        };
      }
    }

    setBracket(newBracket);
    set(ref(db, 'tournament'), newBracket);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmojiEventsIcon /> Tournament Bracket
        </Typography>
        <Tooltip title="Initialize New Tournament">
          <IconButton onClick={initializeBracket} color="primary">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Winners Bracket */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Winners Bracket</Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 8,
              overflowX: 'auto', 
              pb: 2
            }}>
              {(bracket.winnersRounds || []).map((round, roundIndex) => (
                <Box key={`winners-${roundIndex}`} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                    Round {roundIndex + 1}
                  </Typography>
                  {(round.matches || []).map((match, matchIndex) => (
                    <Match
                      key={match.id}
                      match={match}
                      players={players}
                      onWinnerSelect={(winner) => handleWinnerSelect('winners', roundIndex, matchIndex, winner)}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Finals */}
          {bracket.finals?.match && (
            <Box sx={{ alignSelf: 'center' }}>
              <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>Finals</Typography>
              <Match
                match={bracket.finals.match}
                players={players}
                onWinnerSelect={(winner) => handleWinnerSelect('finals', 0, 0, winner)}
              />
              {bracket.finals.trueFinals && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>True Finals</Typography>
                  <Match
                    match={bracket.finals.trueFinals}
                    players={players}
                    onWinnerSelect={(winner) => handleWinnerSelect('trueFinals', 0, 0, winner)}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Losers Bracket */}
          <Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Losers Bracket</Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 8,
              overflowX: 'auto', 
              pb: 2,
              flexDirection: 'row-reverse'
            }}>
              {(bracket.losersRounds || []).map((round, roundIndex) => (
                <Box key={`losers-${roundIndex}`} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <Typography variant="h6" sx={{ textAlign: 'center', mb: 2 }}>
                    Round {roundIndex + 1}
                  </Typography>
                  {(round.matches || []).map((match, matchIndex) => (
                    <Match
                      key={match.id}
                      match={match}
                      players={players}
                      onWinnerSelect={(winner) => handleWinnerSelect('losers', roundIndex, matchIndex, winner)}
                    />
                  ))}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default Tournament; 