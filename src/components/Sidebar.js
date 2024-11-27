import React, { useState, useEffect } from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ButtonGroup,
  InputAdornment,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import { predictGender } from '../utils/genderPredictor';
import { getSkillLevelColor, getSkillLevelText } from '../utils/skillLevels';

const TEAM_NAME_SUGGESTIONS = [
  // Miller Family Inspired Names
  'Dill-icious Dynamos',
  'Mighty Picklers',
  'Smash and Dash',
  'The Pickle Paddlers',
  'Net Ninjas',
  'Dill Pickle Power',
  'The Court Jesters',
  'Rally Rascals',
  'Paddle Pushers',
  'The Pickleball Wizards',
  // Holcomb Family Inspired Names
  'Holcomb Heroes',
  'The Dilly Dallyers',
  'Ace Avengers',
  'The Smash Bros',
  'Pickleball Pirates',
  'The Net Setters',
  'Rally Rebels',
  'The Court Crushers',
  'Paddle Warriors',
  'The Pickleball Posse',
  // Burton Family Inspired Names
  'Burton Ballers',
  'The Pickleball Panthers',
  'Dill-ightful Players',
  'The Smash Sisters/Brothers',
  'The Net Navigators',
  'Rally Rockstars',
  'The Paddle Pals',
  'The Court Commanders',
  'The Pickleball Phantoms',
  'Dill-ight Brigade'
];

const Sidebar = ({ isOpen, onToggle, onAddPlayer, onAddTeam, teams }) => {
  const [playerName, setPlayerName] = useState('');
  const [skillLevel, setSkillLevel] = useState(1);
  const [isMale, setIsMale] = useState(true);
  const [teamName, setTeamName] = useState('');

  const getRandomTeamName = () => {
    // Filter out existing team names
    const existingNames = new Set(teams.map(team => team.name));
    const availableNames = TEAM_NAME_SUGGESTIONS.filter(name => !existingNames.has(name));
    
    if (availableNames.length === 0) {
      // If all names are used, use the full list
      const randomIndex = Math.floor(Math.random() * TEAM_NAME_SUGGESTIONS.length);
      setTeamName(TEAM_NAME_SUGGESTIONS[randomIndex]);
    } else {
      // Choose from available names
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      setTeamName(availableNames[randomIndex]);
    }
  };

  // Predict gender when name changes
  useEffect(() => {
    if (playerName.trim()) {
      const prediction = predictGender(playerName);
      if (prediction === 'male') {
        setIsMale(true);
      } else if (prediction === 'female') {
        setIsMale(false);
      }
      // For 'unknown', we keep the current selection
    }
  }, [playerName]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && skillLevel) {
      onAddPlayer(playerName.trim(), skillLevel, isMale ? 'Male' : 'Female');
      setPlayerName('');
      setSkillLevel(1);
      setIsMale(true);
    }
  };

  const handleTeamSubmit = (e) => {
    e.preventDefault();
    if (teamName.trim()) {
      onAddTeam(teamName.trim());
      setTeamName('');
    }
  };

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={isOpen}
      sx={{
        width: isOpen ? 276 : 0,
        flexShrink: 0,
        position: 'relative',
        '& .MuiDrawer-paper': {
          width: 276,
          boxSizing: 'border-box',
          backgroundColor: '#1e1e1e',
          color: 'white',
          position: 'relative',
          transition: 'transform 0.2s ease-in-out',
          transform: isOpen ? 'none' : 'translateX(-100%)'
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2, justifyContent: 'space-between' }}>
        <Typography variant="h6">Team & Player Management</Typography>
        <IconButton onClick={onToggle} sx={{ color: 'white' }}>
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <Box component="form" onSubmit={handleTeamSubmit} sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Add New Team</Typography>
        
        <TextField
          fullWidth
          label="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          margin="normal"
          variant="outlined"
          inputProps={{ spellCheck: 'true' }}
          sx={{ mb: 2 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={getRandomTeamName}
                  edge="end"
                  size="small"
                  title="Get random team name"
                >
                  <RefreshIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!teamName.trim()}
        >
          Add Team
        </Button>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Add New Player</Typography>
        
        <TextField
          fullWidth
          label="Player Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          margin="normal"
          variant="outlined"
          inputProps={{ spellCheck: 'true' }}
          sx={{ mb: 2 }}
        />

        <ButtonGroup 
          variant="contained" 
          fullWidth 
          sx={{ mb: 2 }}
        >
          <Button
            onClick={() => setIsMale(true)}
            variant={isMale ? "contained" : "outlined"}
            sx={{ 
              flex: 1,
              bgcolor: isMale ? 'primary.main' : 'transparent'
            }}
          >
            Male
          </Button>
          <Button
            onClick={() => setIsMale(false)}
            variant={!isMale ? "contained" : "outlined"}
            sx={{ 
              flex: 1,
              bgcolor: !isMale ? 'primary.main' : 'transparent'
            }}
          >
            Female
          </Button>
        </ButtonGroup>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Skill Level</InputLabel>
          <Select
            value={skillLevel}
            label="Skill Level"
            onChange={(e) => setSkillLevel(e.target.value)}
            sx={{
              '& .MuiSelect-select': {
                paddingRight: '32px !important'
              },
              minWidth: '200px',
              maxWidth: '220px'
            }}
          >
            {[1, 2, 3, 4, 5].map((level) => (
              <MenuItem key={level} value={level} sx={{ minWidth: '200px' }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  backgroundColor: getSkillLevelColor(level),
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  color: 'black',
                }}>
                  Lvl {level} - {getSkillLevelText(level)}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={!playerName.trim() || !skillLevel}
        >
          Add Player
        </Button>
      </Box>
    </Drawer>
  );
};

export default Sidebar; 