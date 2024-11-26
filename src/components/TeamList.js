import React, { useState } from 'react';
import {
  Typography,
  Box,
  Paper,
  IconButton,
  TextField,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Chip,
  InputAdornment
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import ColorLensIcon from '@mui/icons-material/ColorLens';

const TeamList = ({ teams, players, onUpdateTeam, onDeleteTeam, onAssignPlayer }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});

  const handleEdit = (team) => {
    setEditingId(team.id);
    setEditName(team.name);
    setEditColor(team.color);
  };

  const handleSave = (teamId) => {
    if (editName.trim()) {
      onUpdateTeam(teamId, { 
        name: editName.trim(),
        color: editColor 
      });
      setEditingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const toggleTeam = (teamId) => {
    setExpandedTeams(prev => ({
      ...prev,
      [teamId]: !prev[teamId]
    }));
  };

  const handleRemovePlayer = (teamId, playerId) => {
    // Remove player from team
    const team = teams.find(t => t.id === teamId);
    if (team) {
      onUpdateTeam(team.id, {
        playerIds: team.playerIds.filter(id => id !== playerId)
      });
    }
    // Update player's teamId to null
    onAssignPlayer(playerId, '');
  };

  const getSkillLevelColor = (level) => {
    const colors = {
      1: '#ff5252', // Red for beginners
      2: '#ff914d', // Orange for novice
      3: '#ffd740', // Yellow for intermediate
      4: '#69f0ae', // Green for advanced
      5: '#40c4ff', // Blue for expert
    };
    return colors[level] || '#757575';
  };

  const isTeamFull = (team) => {
    return team.playerIds.length >= 2;
  };

  const getTeamCapacityText = (team) => {
    return `${team.playerIds.length}/2`;
  };

  const getTeamPlayersInfo = (team) => {
    return team.playerIds.map(playerId => {
      const player = players.find(p => p.id === playerId);
      if (!player) return null;
      return `${player.name} (#${player.rank}, Lvl ${player.skillLevel})`;
    }).filter(Boolean).join(', ');
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Teams</Typography>
      <div className="team-list">
        {teams.map((team) => (
          <Paper
            key={team.id}
            sx={{
              mb: 1,
              backgroundColor: '#2d2d2d',
              borderLeft: `4px solid ${team.color}`,
              '& .action-buttons': {
                opacity: 0,
                transition: 'opacity 0.2s'
              },
              '&:hover .action-buttons': {
                opacity: 1
              }
            }}
          >
            <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
              <IconButton 
                size="small" 
                onClick={() => toggleTeam(team.id)}
              >
                {expandedTeams[team.id] ? 
                  <ExpandLessIcon fontSize="small" /> : 
                  <ExpandMoreIcon fontSize="small" />
                }
              </IconButton>

              {editingId === team.id ? (
                <Box sx={{ flex: 1, display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <input
                            type="color"
                            value={editColor}
                            onChange={(e) => setEditColor(e.target.value)}
                            style={{ width: 24, height: 24, padding: 0, border: 'none' }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <IconButton onClick={() => handleSave(team.id)} color="primary" size="small">
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={handleCancel} color="secondary" size="small">
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <>
                  <Box sx={{ flex: 1, ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography>{team.name}</Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        backgroundColor: isTeamFull(team) 
                          ? 'rgba(102, 187, 106, 0.1)' 
                          : 'rgba(255, 167, 38, 0.1)',
                        color: isTeamFull(team) 
                          ? '#66bb6a'
                          : '#ffa726',
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.7rem'
                      }}
                    >
                      {getTeamCapacityText(team)}
                    </Typography>
                    {!expandedTeams[team.id] && team.playerIds.length > 0 && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: 'gray',
                          display: 'flex',
                          gap: 0.5,
                          alignItems: 'center'
                        }}
                      >
                        • {getTeamPlayersInfo(team)}
                      </Typography>
                    )}
                  </Box>
                  <Box className="action-buttons">
                    <IconButton 
                      onClick={() => handleEdit(team)} 
                      size="small"
                      sx={{ color: team.color }}
                    >
                      <ColorLensIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleEdit(team)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => onDeleteTeam(team.id)} color="error" size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </>
              )}
            </Box>

            <Collapse in={expandedTeams[team.id]}>
              <List dense>
                {team.playerIds.map(playerId => {
                  const player = players.find(p => p.id === playerId);
                  return player ? (
                    <ListItem 
                      key={player.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        }
                      }}
                      secondaryAction={
                        <IconButton 
                          edge="end" 
                          size="small"
                          onClick={() => handleRemovePlayer(team.id, player.id)}
                          sx={{ 
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '.MuiListItem-root:hover &': {
                              opacity: 1
                            }
                          }}
                        >
                          <PersonRemoveIcon fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemText 
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography>{player.name}</Typography>
                            <Chip
                              label={`Level ${player.skillLevel}`}
                              size="small"
                              sx={{
                                backgroundColor: getSkillLevelColor(player.skillLevel),
                                color: 'black',
                                height: 20,
                                '& .MuiChip-label': {
                                  px: 1,
                                  fontSize: '0.7rem',
                                  fontWeight: 'bold'
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
                              sx={{ color: 'gray' }}
                            >
                              {player.gender}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ) : null;
                })}
              </List>
            </Collapse>
          </Paper>
        ))}
      </div>
    </Box>
  );
};

export default TeamList; 