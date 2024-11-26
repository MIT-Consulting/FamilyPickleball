import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  IconButton,
  TextField,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const PlayerList = ({ players, teams, onUpdatePlayer, onDeletePlayer, onMovePlayer, onAssignPlayer }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSkillLevel, setEditSkillLevel] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);

  const handleEdit = (player) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditSkillLevel(player.skillLevel);
  };

  const handleSave = (playerId) => {
    if (editName.trim()) {
      onUpdatePlayer(playerId, {
        name: editName.trim(),
        skillLevel: editSkillLevel,
      });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const getSkillLevelText = (level) => {
    const levels = {
      1: 'Beginner',
      2: 'Novice',
      3: 'Intermediate',
      4: 'Advanced',
      5: 'Expert',
    };
    return levels[level] || 'Unknown';
  };

  const getTeamName = (teamId) => {
    if (!teamId) return '';
    const team = teams.find(t => t.id === teamId);
    return team ? { name: team.name, color: team.color } : { name: '', color: '' };
  };

  const handleTeamClick = (playerId) => {
    setEditingTeam(playerId);
  };

  const handleTeamChange = (playerId, teamId) => {
    onAssignPlayer(playerId, teamId);
    setEditingTeam(null);
  };

  const handleAddToTeamClick = (playerId, event) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (availableTeams.length === 1) {
      handleTeamChange(playerId, availableTeams[0].id);
      return;
    }
    
    setEditingTeam(playerId);
    setTimeout(() => {
      const selectElement = document.querySelector(`#team-select-${playerId}`);
      if (selectElement) {
        selectElement.click();
      }
    }, 50);
  };

  const isTeamFull = (team) => {
    return team.playerIds.length >= 2;
  };

  const availableTeams = teams.filter(team => !isTeamFull(team));

  const getNameColumnWidth = () => {
    if (players.length === 0) return 140; // default width
    
    // Create a temporary span to measure text width
    const span = document.createElement('span');
    span.style.visibility = 'hidden';
    span.style.position = 'absolute';
    span.style.fontSize = '0.9rem'; // match the font size we use
    document.body.appendChild(span);
    
    // Find the widest name
    const maxWidth = players.reduce((max, player) => {
      span.textContent = player.name;
      return Math.max(max, span.offsetWidth);
    }, 0);
    
    document.body.removeChild(span);
    return Math.min(Math.max(maxWidth + 24, 100), 200); // min 100px, max 200px, +24px for padding
  };

  const nameWidth = getNameColumnWidth();

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Players Ranking</Typography>
      <div className="player-list">
        <Box 
          sx={{ 
            display: 'flex',
            px: 1,
            mb: 1,
            color: 'gray',
            gap: 1,
            '& > *': { fontSize: '0.8rem' }
          }}
        >
          <Box sx={{ width: 24, flexShrink: 0 }}></Box>
          <Box sx={{ width: 24, flexShrink: 0 }}>#</Box>
          <Box sx={{ flex: 1.5, minWidth: 80 }}>Name</Box>
          <Box sx={{ flex: 1.5, minWidth: 100 }}>Team</Box>
          <Box sx={{ flex: 1, minWidth: 80 }}>Skill</Box>
          <Box sx={{ flex: 1, minWidth: 60 }}>Gender</Box>
          <Box sx={{ width: 60, flexShrink: 0 }}></Box>
        </Box>

        <Box sx={{ position: 'relative' }}>
          {players.map((player, index) => (
            <Paper
              key={player.id}
              sx={{
                py: 0.5,
                px: 1,
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#2d2d2d',
                position: 'absolute',
                top: index * 40,
                left: 0,
                right: 0,
                height: 32,
                transition: 'top 0.2s ease-in-out',
                '& .action-buttons': {
                  opacity: 0,
                  transition: 'opacity 0.2s'
                },
                '&:hover .action-buttons': {
                  opacity: 1
                },
                '& .MuiIconButton-root': {
                  padding: '4px',
                },
                '& .MuiTypography-root': {
                  fontSize: '0.9rem',
                },
                gap: 1,
              }}
            >
              <Box sx={{ width: 24, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
                <Box 
                  className="action-buttons"
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    '& .MuiIconButton-root': {
                      padding: 0,
                      height: '16px',
                      width: '20px',
                    }
                  }}
                >
                  <IconButton 
                    size="small" 
                    onClick={() => onMovePlayer(index, 'up')}
                    disabled={index === 0}
                  >
                    <KeyboardArrowUpIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    onClick={() => onMovePlayer(index, 'down')}
                    disabled={index === players.length - 1}
                  >
                    <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>

              <Typography sx={{ width: 24, flexShrink: 0 }}>
                #{index + 1}
              </Typography>

              {editingId === player.id ? (
                <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    size="small"
                    sx={{ 
                      width: nameWidth,
                      '& .MuiInputBase-root': {
                        height: '32px',
                      }
                    }}
                  />
                  <Select
                    value={editSkillLevel}
                    onChange={(e) => setEditSkillLevel(e.target.value)}
                    size="small"
                    sx={{ 
                      width: 150,
                      height: '32px'
                    }}
                  >
                    <MenuItem value={1}>Beginner (1.0-2.0)</MenuItem>
                    <MenuItem value={2}>Novice (2.5-3.0)</MenuItem>
                    <MenuItem value={3}>Intermediate (3.5-4.0)</MenuItem>
                    <MenuItem value={4}>Advanced (4.5-5.0)</MenuItem>
                    <MenuItem value={5}>Expert (5.5+)</MenuItem>
                  </Select>
                  <Box sx={{ width: 80, display: 'flex', gap: 0.5 }}>
                    <IconButton onClick={() => handleSave(player.id)} color="primary" size="small">
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={handleCancel} color="secondary" size="small">
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <Typography sx={{ flex: 1.5, minWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {player.name}
                  </Typography>

                  <Box sx={{ flex: 1.5, minWidth: 100 }}>
                    {editingTeam === player.id ? (
                      <Select
                        id={`team-select-${player.id}`}
                        value={player.teamId || ''}
                        onChange={(e) => handleTeamChange(player.id, e.target.value)}
                        size="small"
                        sx={{ 
                          width: '100%',
                          height: '24px',
                          '& .MuiSelect-select': {
                            py: 0
                          }
                        }}
                        MenuProps={{
                          onClose: () => setEditingTeam(null)
                        }}
                        autoFocus
                        open={true}
                        onClose={() => setEditingTeam(null)}
                      >
                        <MenuItem value="">No Team</MenuItem>
                        {availableTeams.map(team => (
                          <MenuItem 
                            key={team.id} 
                            value={team.id}
                            sx={{
                              borderLeft: `4px solid ${team.color}`,
                              pl: 1
                            }}
                          >
                            {team.name}
                          </MenuItem>
                        ))}
                      </Select>
                    ) : player.teamId ? (
                      <Typography 
                        onClick={() => handleTeamClick(player.id)}
                        sx={{ 
                          color: 'primary.main',
                          fontSize: '0.8rem',
                          backgroundColor: 'rgba(144, 202, 249, 0.1)',
                          px: 1,
                          py: 0.25,
                          borderRadius: 1,
                          cursor: 'pointer',
                          display: 'inline-block',
                          borderLeft: `3px solid ${getTeamName(player.teamId).color}`,
                          '&:hover': {
                            backgroundColor: 'rgba(144, 202, 249, 0.2)',
                          }
                        }}
                      >
                        {getTeamName(player.teamId).name}
                      </Typography>
                    ) : (
                      <Typography 
                        onClick={(e) => handleAddToTeamClick(player.id, e)}
                        sx={{ 
                          color: 'gray',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          '&:hover': {
                            color: 'primary.main',
                          }
                        }}
                      >
                        Add to team
                      </Typography>
                    )}
                  </Box>

                  <Typography sx={{ flex: 1, minWidth: 80, color: 'gray' }}>
                    {getSkillLevelText(player.skillLevel)}
                  </Typography>

                  <Typography sx={{ flex: 1, minWidth: 60, color: 'gray' }}>
                    {player.gender}
                  </Typography>

                  <Box className="action-buttons" sx={{ width: 60, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                    <IconButton onClick={() => handleEdit(player)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => onDeletePlayer(player.id)} color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </>
              )}
            </Paper>
          ))}
          {/* Spacer div to maintain container height */}
          <Box sx={{ height: players.length * 40 }} />
        </Box>
      </div>
    </Box>
  );
};

export default PlayerList; 