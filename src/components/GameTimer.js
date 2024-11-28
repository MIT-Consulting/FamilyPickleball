import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Stack, 
  Typography, 
  Button, 
  Chip,
  Grid,
  useTheme 
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import SportsIcon from '@mui/icons-material/Sports';
import CoffeeIcon from '@mui/icons-material/Coffee';

const GAME_DURATION = 900; // 15 minutes in seconds
const BREAK_DURATION = 120; // 2 minutes in seconds

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const GameTimer = ({ currentGames = [], nextGames = [], compact = false }) => {
  const theme = useTheme();
  const [isRunning, setIsRunning] = useState(false);
  const [currentIntervalIndex, setCurrentIntervalIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(GAME_DURATION);
  const timerRef = useRef(null);

  const getCurrentIntervalDuration = () => {
    const currentInterval = currentGames.length > 0 ? GAME_DURATION : BREAK_DURATION;
    return currentInterval;
  };

  const startTimer = () => {
    if (timerRef.current) return;
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
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
    setTimeRemaining(getCurrentIntervalDuration());
  };

  const handleSkipNext = () => {
    setCurrentIntervalIndex(prev => prev + 1);
    setTimeRemaining(getCurrentIntervalDuration());
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const GameList = ({ games, title }) => (
    <Box sx={{ height: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
        {title}
      </Typography>
      {games.length > 0 ? (
        <Stack spacing={1}>
          {games.map(game => (
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
          No games scheduled
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        {!compact && (
          <Grid item xs={12} md={4}>
            <GameList title="Current Games" games={currentGames} />
          </Grid>
        )}

        <Grid item xs={12} md={compact ? 12 : 4}>
          <Stack spacing={3} alignItems="center">
            {/* Timer Display */}
            <Box 
              sx={{ 
                position: 'relative',
                width: compact ? '150px' : '200px',
                height: compact ? '150px' : '200px',
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
                <Typography 
                  variant={compact ? "h3" : "h2"} 
                  sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}
                >
                  {formatTime(timeRemaining)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.7 }}>
                  {currentGames.length > 0 ? 'Game Time' : 'Break Time'}
                </Typography>
              </Stack>
            </Box>

            {/* Timer Controls */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={isRunning ? <PauseIcon /> : <PlayArrowIcon />}
                onClick={toggleTimer}
                size={compact ? "small" : "medium"}
              >
                {isRunning ? 'Pause' : 'Start'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={resetTimer}
                size={compact ? "small" : "medium"}
              >
                Reset
              </Button>
              <Button
                variant="outlined"
                startIcon={<SkipNextIcon />}
                onClick={handleSkipNext}
                size={compact ? "small" : "medium"}
              >
                Skip
              </Button>
            </Stack>
          </Stack>
        </Grid>

        {!compact && (
          <Grid item xs={12} md={4}>
            <GameList title="Next Up" games={nextGames} />
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default GameTimer; 