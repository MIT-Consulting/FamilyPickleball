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
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { predictGender } from '../utils/genderPredictor';

const Sidebar = ({ isOpen, onToggle, onAddPlayer, onAddTeam }) => {
  const [playerName, setPlayerName] = useState('');
  const [skillLevel, setSkillLevel] = useState(1);
  const [isMale, setIsMale] = useState(true);
  const [teamName, setTeamName] = useState('');

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
        width: isOpen ? 240 : 0,
        flexShrink: 0,
        position: 'relative',
        '& .MuiDrawer-paper': {
          width: 240,
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
        <Typography variant="h6">Player Management</Typography>
        <IconButton onClick={onToggle} sx={{ color: 'white' }}>
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Add New Player</Typography>
        
        <TextField
          fullWidth
          label="Player Name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          margin="normal"
          variant="outlined"
          sx={{ mb: 2 }}
        />

        <Typography variant="body2" sx={{ mb: 1 }}>Gender</Typography>
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
          >
            <MenuItem value={1}>Beginner (1.0-2.0)</MenuItem>
            <MenuItem value={2}>Novice (2.5-3.0)</MenuItem>
            <MenuItem value={3}>Intermediate (3.5-4.0)</MenuItem>
            <MenuItem value={4}>Advanced (4.5-5.0)</MenuItem>
            <MenuItem value={5}>Expert (5.5+)</MenuItem>
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

      <Box component="form" onSubmit={handleTeamSubmit} sx={{ p: 2, mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>Add New Team</Typography>
        
        <TextField
          fullWidth
          label="Team Name"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          margin="normal"
          variant="outlined"
          sx={{ mb: 2 }}
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
    </Drawer>
  );
};

export default Sidebar; 