import React, { useState, useMemo } from 'react';
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
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import CloseIcon from '@mui/icons-material/Close';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import StarIcon from '@mui/icons-material/Star';
import DiamondIcon from '@mui/icons-material/Diamond';
import BoltIcon from '@mui/icons-material/Bolt';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PsychologyIcon from '@mui/icons-material/Psychology';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import FlareIcon from '@mui/icons-material/Flare';
import PublicIcon from '@mui/icons-material/Public';
import AdjustIcon from '@mui/icons-material/Adjust';
import PolylineIcon from '@mui/icons-material/Polyline';
import HexagonIcon from '@mui/icons-material/Hexagon';
import ShapeLineIcon from '@mui/icons-material/ShapeLine';
import ChangeHistoryIcon from '@mui/icons-material/ChangeHistory';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import { getSkillLevelColor } from '../utils/skillLevels';

const TEAM_ICONS = [
  { icon: StarIcon, name: 'Star' },
  { icon: DiamondIcon, name: 'Diamond' },
  { icon: BoltIcon, name: 'Lightning' },
  { icon: LocalFireDepartmentIcon, name: 'Fire' },
  { icon: PsychologyIcon, name: 'Brain' },
  { icon: AutoAwesomeIcon, name: 'Sparkle' },
  { icon: RocketLaunchIcon, name: 'Rocket' },
  { icon: FlareIcon, name: 'Flare' },
  { icon: PublicIcon, name: 'Globe' },
  { icon: AdjustIcon, name: 'Circle' },
  { icon: PolylineIcon, name: 'Lines' },
  { icon: HexagonIcon, name: 'Hexagon' },
  { icon: ShapeLineIcon, name: 'Shape' },
  { icon: ChangeHistoryIcon, name: 'Triangle' },
  { icon: CrisisAlertIcon, name: 'Alert' }
];

const TeamList = ({ teams, players, onUpdateTeam, onDeleteTeam, onAssignPlayer }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});

  const isAllExpanded = useMemo(() => {
    return teams.length > 0 && teams.every(team => expandedTeams[team.id]);
  }, [teams, expandedTeams]);

  const handleExpandCollapseAll = () => {
    if (isAllExpanded) {
      setExpandedTeams({});
    } else {
      setExpandedTeams(teams.reduce((acc, team) => ({ ...acc, [team.id]: true }), {}));
    }
  };

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
        playerIds: (team.playerIds || []).filter(id => id !== playerId)
      });
    }
    // Update player's teamId to null
    onAssignPlayer(playerId, '');
  };

  const isTeamFull = (team) => {
    if (!team || !team.playerIds) return false;
    return (team.playerIds || []).length >= 2;
  };

  const getTeamCapacityText = (team) => {
    if (!team || !team.playerIds) return '0/2';
    return `${(team.playerIds || []).length}/2`;
  };

  const getTeamPlayersInfo = (team) => {
    if (!team || !team.playerIds) return '';
    return (team.playerIds || []).map(playerId => {
      const player = players.find(p => p.id === playerId);
      if (!player) return null;
      return `${player.name} (#${player.rank}, Lvl ${player.skillLevel})`;
    }).filter(Boolean).join(', ');
  };

  const getTeamIcon = (team) => {
    const iconIndex = team.id % TEAM_ICONS.length;
    const IconComponent = TEAM_ICONS[iconIndex].icon;
    return <IconComponent sx={{ color: team.color, mr: 1 }} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h4">Teams</Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.9rem'
          }}
        >
          {teams.length}
        </Typography>
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.5 }}>
          <IconButton 
            size="small" 
            onClick={handleExpandCollapseAll}
            sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
            }}
            title={isAllExpanded ? "Collapse All" : "Expand All"}
          >
            {isAllExpanded ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
          </IconButton>
        </Box>
      </Box>
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
            <Box sx={{ 
              p: 1, 
              display: 'flex', 
              alignItems: 'center',
              borderBottom: expandedTeams[team.id] ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              backgroundColor: '#2d2d2d'
            }}>
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
                    inputProps={{ spellCheck: 'true' }}
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
                    {getTeamIcon(team)}
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
                    {!expandedTeams[team.id] && (team.playerIds || []).length > 0 && (
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
              <List dense sx={{ 
                py: 0,
                backgroundColor: '#262626'
              }}>
                {(team.playerIds || []).map(playerId => {
                  const player = players.find(p => p.id === playerId);
                  return player ? (
                    <ListItem 
                      key={player.id}
                      sx={{
                        display: 'flex',
                        gap: 2,
                        pl: 2,
                        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        },
                      }}
                    >
                      <Box sx={{ width: 80 }}>
                        <Typography noWrap>{player.name}</Typography>
                      </Box>

                      <Box sx={{ width: 50 }}>
                        <Chip
                          label={`Lvl ${player.skillLevel}`}
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
                      </Box>

                      <Box sx={{ width: 30 }}>
                        <Typography variant="caption" sx={{ color: 'gray' }}>
                          {player.gender === 'Male' ? 'M' : 'F'}
                        </Typography>
                      </Box>

                      <Box sx={{ width: 30 }}>
                        <Typography variant="caption" sx={{ color: 'gray' }}>
                          #{player.rank}
                        </Typography>
                      </Box>

                      <IconButton 
                        size="small"
                        onClick={() => handleRemovePlayer(team.id, player.id)}
                        sx={{ 
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          padding: 0,
                          ml: 1,
                          '.MuiListItem-root:hover &': {
                            opacity: 1
                          }
                        }}
                      >
                        <CloseIcon sx={{ fontSize: 16 }} />
                      </IconButton>
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