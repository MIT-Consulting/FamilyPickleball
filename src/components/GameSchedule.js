import React, { useState, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Paper,
  IconButton,
  List,
  ListItem,
  Button,
  Stack,
  Divider,
  useTheme,
  Grid,
  Tooltip,
  Chip,
  Card,
  CardContent,
  Avatar,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import TimerIcon from '@mui/icons-material/Timer';
import SportsIcon from '@mui/icons-material/Sports';
import CoffeeIcon from '@mui/icons-material/Coffee';
import StarIcon from '@mui/icons-material/Star';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import { ref, onValue, get } from 'firebase/database';
import { db } from '../firebase-config';
import { keyframes } from '@mui/system';

// Animation for the timer pulse
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.02); }
  100% { transform: scale(1); }
`;

// Component to display a single game card
const GameCard = ({ game, isCurrent }) => {
  const getTeamSkill = (players) => {
    return players?.reduce((sum, player) => sum + (player?.skillLevel || 0), 0) || 0;
  };

  const TeamDisplay = ({ team, players, isWinner }) => {
    if (!team) return (
      <Box sx={{ p: 1, opacity: 0.5 }}>
        <Typography color="text.secondary">TBD</Typography>
      </Box>
    );

    const totalSkill = getTeamSkill(players);
    const validPlayers = players?.filter(player => player && player.name) || [];

    return (
      <Box sx={{ 
        p: 1,
        borderRadius: 1,
        bgcolor: theme => theme.palette.mode === 'dark' ? '#2d2d2d' : '#f5f5f5',
        borderLeft: `4px solid ${team.color || '#666'}`,
        ...(isWinner && {
          outline: '2px solid',
          outlineColor: 'success.main',
          outlineOffset: '-2px'
        })
      }}>
        <Stack spacing={1}>
          {/* Team Name and Skill */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ bgcolor: team.color || '#666', width: 24, height: 24 }}>
              <EmojiEventsIcon sx={{ fontSize: 16 }} />
            </Avatar>
            <Typography sx={{ flexGrow: 1, fontWeight: 'bold' }}>{team.name || 'TBD'}</Typography>
            <Chip
              icon={<StarIcon sx={{ fontSize: '0.9rem' }} />}
              label={totalSkill}
              size="small"
              variant="outlined"
              sx={{ borderColor: 'warning.main', color: 'warning.main' }}
            />
          </Stack>

          {/* Players */}
          {validPlayers.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              {validPlayers.map((player, index) => (
                <Chip
                  key={index}
                  size="small"
                  label={player.name}
                  icon={<GroupsIcon sx={{ fontSize: '0.9rem' }} />}
                  sx={{ 
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
                    '& .MuiChip-icon': { color: player.family === 'Miller' ? '#90caf9' : player.family === 'Holcomb' ? '#c48b9f' : '#81c784' }
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Box>
    );
  };

  return (
    <Card 
      elevation={isCurrent ? 3 : 1}
      sx={{ 
        position: 'relative',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: 4 }
      }}
    >
      <CardContent>
        {/* Match ID and Round */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Chip 
            label={game.roundName}
            size="small"
            color={game.bracketType === 'Winners' ? 'primary' : game.bracketType === 'Losers' ? 'secondary' : 'warning'}
          />
          <Typography variant="caption" color="text.secondary">
            Court {game.court}
          </Typography>
        </Stack>

        {/* Teams */}
        <Stack spacing={1}>
          <TeamDisplay 
            team={game.team1} 
            players={game.team1Players}
            isWinner={game.winner?.id === game.team1?.id}
          />
          <Box sx={{ 
            height: '1px', 
            bgcolor: 'divider',
            mx: 1 
          }} />
          <TeamDisplay 
            team={game.team2}
            players={game.team2Players}
            isWinner={game.winner?.id === game.team2?.id}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

// Constants
const GAME_DURATION = 300; // 5 minutes in seconds
const BREAK_DURATION = 120; // 2 minutes in seconds

// Helper function to format time
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Court assignments for each game
const COURT_ASSIGNMENTS = {
  'W1': 1, 'W2': 2,      // interval 1
  'W3': 1, 'W4': 2,      // interval 2
  'W5': 1, 'W6': 2,      // interval 3
  'W7': 1, 'W8': 2,      // interval 4
  'L1': 1, 'L2': 2,      // interval 5
  'L3': 1, 'L4': 2,      // interval 6
  'W9': 1, 'W10': 2,     // interval 7
  'L5': 1, 'L6': 2,      // interval 8
  'L7': 1, 'L8': 2,      // interval 9
  'W11': 1, 'L9': 2,     // interval 10
  'L10': 1,              // interval 11
  'F1': 1                // interval 12
};

// Define intervals data model
const INTERVALS = [
  { id: 1, type: 'game', games: ['W1', 'W2'] },
  { id: 2, type: 'break' },
  { id: 3, type: 'game', games: ['W3', 'W4'] },
  { id: 4, type: 'break' },
  { id: 5, type: 'game', games: ['W5', 'W6'] },
  { id: 6, type: 'break' },
  { id: 7, type: 'game', games: ['W7', 'W8'] },
  { id: 8, type: 'break' },
  { id: 9, type: 'game', games: ['L1', 'L2'] },
  { id: 10, type: 'break' },
  { id: 11, type: 'game', games: ['L3', 'L4'] },
  { id: 12, type: 'break' },
  { id: 13, type: 'game', games: ['W9', 'W10'] },
  { id: 14, type: 'break' },
  { id: 15, type: 'game', games: ['L5', 'L6'] },
  { id: 16, type: 'break' },
  { id: 17, type: 'game', games: ['L7', 'L8'] },
  { id: 18, type: 'break' },
  { id: 19, type: 'game', games: ['W11', 'L9'] },
  { id: 20, type: 'break' },
  { id: 21, type: 'game', games: ['L10'] },
  { id: 22, type: 'break' },
  { id: 23, type: 'game', games: ['F1'] }
];

const GameSchedule = () => {
  const theme = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const [tournament, setTournament] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const timerRef = useRef(null);
  const scheduleRef = useRef(null);

  // Load all tournament data
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading tournament data for schedule...');
        const [teamsSnap, playersSnap, bracketSnap] = await Promise.all([
          get(ref(db, 'teams')),
          get(ref(db, 'players')),
          get(ref(db, 'tournament'))
        ]);

        const loadedTeams = teamsSnap.val() ? Object.values(teamsSnap.val()) : [];
        const loadedPlayers = playersSnap.val() ? Object.values(playersSnap.val()) : [];
        const tournamentData = bracketSnap.val();
        
        console.log('Loaded teams:', loadedTeams.length);
        console.log('Loaded players:', loadedPlayers.length);

        setTeams(loadedTeams);
        setPlayers(loadedPlayers);
        if (tournamentData) {
          setTournament(tournamentData);
          generateSchedule(tournamentData, loadedTeams, loadedPlayers);
        }
      } catch (error) {
        console.error('Error loading tournament data:', error);
      }
    };

    loadData();

    // Set up real-time listener for tournament updates
    const unsubscribe = onValue(ref(db, 'tournament'), (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setTournament(data);
        generateSchedule(data, teams, players);
      }
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Update generateSchedule to use teams and players data
  const generateSchedule = (tournamentData, teams, players) => {
    if (!tournamentData) return;

    const games = [];
    
    // Process winners bracket
    tournamentData.winnersRounds.forEach((round, roundIndex) => {
      round.matches.forEach(match => {
        if (COURT_ASSIGNMENTS[match.id]) {
          games.push({
            ...match,
            id: match.id,
            bracketType: 'Winners',
            round: roundIndex + 1,
            team1: match.team1,
            team2: match.team2,
            winner: match.winner,
            court: COURT_ASSIGNMENTS[match.id],
            roundName: `Winners Round ${roundIndex + 1}`,
            team1Players: match.team1?.playerIds?.map(id => players.find(p => p.id === id)) || [],
            team2Players: match.team2?.playerIds?.map(id => players.find(p => p.id === id)) || []
          });
        }
      });
    });

    // Process losers bracket
    tournamentData.losersRounds.forEach((round, roundIndex) => {
      round.matches.forEach(match => {
        if (COURT_ASSIGNMENTS[match.id]) {
          games.push({
            ...match,
            id: match.id,
            bracketType: 'Losers',
            round: roundIndex + 1,
            team1: match.team1,
            team2: match.team2,
            winner: match.winner,
            court: COURT_ASSIGNMENTS[match.id],
            roundName: `Losers Round ${roundIndex + 1}`,
            team1Players: match.team1?.playerIds?.map(id => players.find(p => p.id === id)) || [],
            team2Players: match.team2?.playerIds?.map(id => players.find(p => p.id === id)) || []
          });
        }
      });
    });

    // Add finals
    if (tournamentData.finals?.match) {
      games.push({
        ...tournamentData.finals.match,
        id: 'F1',
        bracketType: 'Finals',
        round: 1,
        team1: tournamentData.finals.match.team1,
        team2: tournamentData.finals.match.team2,
        winner: tournamentData.finals.match.winner,
        court: COURT_ASSIGNMENTS['F1'],
        roundName: 'Finals',
        team1Players: tournamentData.finals.match.team1?.playerIds?.map(id => players.find(p => p.id === id)) || [],
        team2Players: tournamentData.finals.match.team2?.playerIds?.map(id => players.find(p => p.id === id)) || []
      });
    }

    // Add true finals if it exists
    if (tournamentData.finals?.trueFinals) {
      games.push({
        ...tournamentData.finals.trueFinals,
        id: 'F2',
        bracketType: 'True Finals',
        round: 2,
        team1: tournamentData.finals.trueFinals.team1,
        team2: tournamentData.finals.trueFinals.team2,
        winner: tournamentData.finals.trueFinals.winner,
        court: COURT_ASSIGNMENTS['F2'],
        roundName: 'True Finals',
        team1Players: tournamentData.finals.trueFinals.team1?.playerIds?.map(id => players.find(p => p.id === id)) || [],
        team2Players: tournamentData.finals.trueFinals.team2?.playerIds?.map(id => players.find(p => p.id === id)) || []
      });
    }

    setSchedule(games);
  };

  // Timer control functions
  const startTimer = () => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Move to next interval when timer reaches 0
          handleSkipNext();
          return getCurrentIntervalDuration();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      stopTimer();
    } else {
      startTimer();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    stopTimer();
    setIsRunning(false);
    setCurrentIntervalIndex(0);
    setTimeRemaining(GAME_DURATION);
  };

  const getCurrentIntervalDuration = () => {
    const currentInterval = INTERVALS[currentIntervalIndex];
    return currentInterval?.type === 'break' ? BREAK_DURATION : GAME_DURATION;
  };

  const handleSkipNext = () => {
    if (currentIntervalIndex < INTERVALS.length - 1) {
      setCurrentIntervalIndex(prev => prev + 1);
      setTimeRemaining(INTERVALS[currentIntervalIndex + 1]?.type === 'break' ? BREAK_DURATION : GAME_DURATION);
    } else {
      resetTimer();
    }
  };

  // Auto-scroll to current game
  useEffect(() => {
    if (!scheduleRef.current) return;

    const element = document.getElementById(`interval-${currentIntervalIndex}`);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentIntervalIndex]);

  const currentInterval = INTERVALS[currentIntervalIndex];

  // Find the current games in the schedule
  const getCurrentGames = () => {
    if (!currentInterval?.games || !schedule.length) return [];
    return currentInterval.games.map(gameId => 
      schedule.find(game => game.id === gameId)
    ).filter(Boolean);
  };

  // Add function to get next games, skipping breaks
  const getNextGames = () => {
    let nextIndex = currentIntervalIndex + 1;
    // Keep looking forward until we find games or reach the end
    while (nextIndex < INTERVALS.length) {
      const nextInterval = INTERVALS[nextIndex];
      if (nextInterval?.type === 'game' && nextInterval.games) {
        return nextInterval.games.map(gameId => 
          schedule.find(game => game.id === gameId)
        ).filter(Boolean);
      }
      nextIndex++;
    }
    return [];
  };

  // Add function to get previous game winners
  const getPreviousGameWinners = () => {
    let prevIndex = currentIntervalIndex - 1;
    while (prevIndex >= 0) {
      const prevInterval = INTERVALS[prevIndex];
      if (prevInterval?.type === 'game' && prevInterval.games) {
        return prevInterval.games.map(gameId => 
          schedule.find(game => game.id === gameId)
        ).filter(game => game?.winner); // Only return games with winners
      }
      prevIndex--;
    }
    return [];
  };

  const currentGames = getCurrentGames();
  const nextGames = getNextGames();
  const previousWinners = getPreviousGameWinners();

  return (
    <Box sx={{ p: 3, height: 'calc(100vh - 24px)', display: 'flex', flexDirection: 'column' }}>
      {/* Timer Section */}
      <Paper 
        elevation={3}
        sx={{ 
          p: 3, 
          mb: 4, 
          backgroundColor: theme => theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
          borderRadius: 2,
          flexShrink: 0
        }}
      >
        <Grid container spacing={3}>
          {/* Left Section - Current Games or Previous Winners */}
          <Grid item xs={12} md={4}>
            <Box sx={{ height: '100%', borderRight: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                {currentInterval?.type === 'break' ? 'Previous Winners' : 'Current Games'}
              </Typography>
              {currentInterval?.type === 'break' ? (
                previousWinners.length > 0 ? (
                  <Stack spacing={1}>
                    {previousWinners.map(game => (
                      <Box 
                        key={game.id}
                        sx={{ 
                          p: 1, 
                          borderRadius: 1,
                          bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(76, 175, 80, 0.1)' : 'rgba(76, 175, 80, 0.05)',
                          borderLeft: '4px solid',
                          borderColor: 'success.main'
                        }}
                      >
                        <Stack spacing={0.5}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip 
                              size="small" 
                              label={`Court ${game.court}`}
                              color={game.court === 1 ? 'primary' : 'secondary'}
                            />
                            <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                              {game.winner?.name} Won!
                            </Typography>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            vs {game.winner?.id === game.team1?.id ? game.team2?.name : game.team1?.name}
                          </Typography>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    No previous game results
                  </Typography>
                )
              ) : currentGames.length > 0 ? (
                <Stack spacing={1}>
                  {currentGames.map(game => (
                    <Box 
                      key={game.id}
                      sx={{ 
                        p: 1, 
                        borderRadius: 1,
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip 
                          size="small" 
                          label={`Court ${game.court}`}
                          color={game.court === 1 ? 'primary' : 'secondary'}
                        />
                        <Typography variant="body2">
                          {game.team1?.name || 'TBD'} vs {game.team2?.name || 'TBD'}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No games in progress
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Center Section - Timer */}
          <Grid item xs={12} md={4}>
            <Stack spacing={3} alignItems="center">
              {/* Interval Status */}
              <Stack direction="row" spacing={2} alignItems="center">
                {currentInterval?.type === 'game' && (
                  <Chip
                    icon={<SportsIcon />}
                    label={`Game ${currentInterval.games.join(' & ')}`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontSize: '1.1rem', py: 2 }}
                  />
                )}
                {currentInterval?.type === 'break' && (
                  <Chip
                    icon={<CoffeeIcon />}
                    label="Break Time"
                    color="secondary"
                    variant="outlined"
                    sx={{ fontSize: '1.1rem', py: 2 }}
                  />
                )}
              </Stack>

              {/* Timer Display */}
              <Box 
                sx={{ 
                  position: 'relative',
                  width: '200px',
                  height: '200px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    border: '4px solid',
                    borderColor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  }}
                />
                {/* Left Progress */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    border: '4px solid transparent',
                    borderLeftColor: 'primary.main',
                    transform: `rotate(${180 - (180 * timeRemaining / getCurrentIntervalDuration())}deg)`,
                    transition: 'transform 1s linear',
                    clipPath: 'polygon(0 0, 50% 0, 50% 100%, 0 100%)'
                  }}
                />
                {/* Right Progress */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    border: '4px solid transparent',
                    borderRightColor: 'primary.main',
                    transform: `rotate(${-180 + (180 * timeRemaining / getCurrentIntervalDuration())}deg)`,
                    transition: 'transform 1s linear',
                    clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)'
                  }}
                />
                <Stack alignItems="center" spacing={1}>
                  <Typography variant="h2" sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {formatTime(timeRemaining)}
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.7 }}>
                    {currentInterval?.type === 'game' ? 'Game Time' : 'Break Time'}
                  </Typography>
                </Stack>
              </Box>

              {/* Timer Controls */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                  onClick={toggleTimer}
                  sx={{ minWidth: '120px' }}
                >
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltIcon />}
                  onClick={resetTimer}
                >
                  Reset
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<SkipNextIcon />}
                  onClick={handleSkipNext}
                  disabled={currentIntervalIndex >= INTERVALS.length - 1}
                >
                  Skip
                </Button>
              </Stack>
            </Stack>
          </Grid>

          {/* Right Section - Next Up */}
          <Grid item xs={12} md={4}>
            <Box sx={{ height: '100%', borderLeft: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
                Next Up
              </Typography>
              {nextGames.length > 0 ? (
                <Stack spacing={1}>
                  {nextGames.map(game => (
                    <Box 
                      key={game.id}
                      sx={{ 
                        p: 1, 
                        borderRadius: 1,
                        bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip 
                          size="small" 
                          label={`Court ${game.court}`}
                          color={game.court === 1 ? 'primary' : 'secondary'}
                        />
                        <Typography variant="body2">
                          {game.team1?.name || 'TBD'} vs {game.team2?.name || 'TBD'}
                        </Typography>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  No more games scheduled
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Schedule List */}
      <Box 
        ref={scheduleRef} 
        sx={{ 
          flexGrow: 1,
          overflow: 'auto',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            background: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: theme => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
          }
        }}
      >
        <Stack spacing={1}>
          {INTERVALS.map((interval, index) => (
            <Box
              key={interval.id}
              id={`interval-${index}`}
              sx={{
                backgroundColor: index === currentIntervalIndex ? 
                  (interval.type === 'break' ? 
                    theme => theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)'
                    : 'rgba(144, 202, 249, 0.08)'
                  ) : 'transparent',
                borderRadius: 1,
                p: 1,
                border: index === currentIntervalIndex ? '1px solid' : 'none',
                borderColor: interval.type === 'break' ? 
                  theme => theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.5)' : 'rgba(211, 47, 47, 0.3)'
                  : 'primary.main'
              }}
            >
              {interval.type === 'game' ? (
                <Grid container spacing={2}>
                  {interval.games.map(gameId => {
                    const game = schedule.find(g => g.id === gameId);
                    return game ? (
                      <Grid item xs={12} md={6} key={game.id}>
                        <GameCard
                          game={game}
                          isCurrent={index === currentIntervalIndex}
                        />
                      </Grid>
                    ) : null;
                  })}
                </Grid>
              ) : (
                <Box 
                  sx={{ 
                    py: 0.25,
                    px: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    bgcolor: theme => theme.palette.mode === 'dark' ? 'rgba(211, 47, 47, 0.1)' : 'rgba(211, 47, 47, 0.05)',
                    borderRadius: 1,
                    my: 0.25
                  }}
                >
                  <CoffeeIcon 
                    sx={{ 
                      color: index === currentIntervalIndex ? '#d32f2f' : 'text.disabled',
                      fontSize: '1rem'
                    }} 
                  />
                  <Typography 
                    sx={{ 
                      color: index === currentIntervalIndex ? '#d32f2f' : 'text.disabled',
                      fontStyle: 'italic',
                      fontSize: '0.875rem'
                    }}
                  >
                    2 Minute Break
                  </Typography>
                </Box>
              )}
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};

export default GameSchedule; 