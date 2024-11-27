import React, { useState, useMemo } from 'react';
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
import { getSkillLevelColor, getSkillLevelText, getSkillLevelFullText } from '../utils/skillLevels';

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

  const getTeamName = (teamId) => {
    if (!teamId) return { name: '', color: '' };
    const team = teams.find(t => t.id === teamId);
    return team ? { 
      name: team.name, 
      color: team.color,
      icon: getTeamIcon(team)
    } : { name: '', color: '' };
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
    if (!team || !team.playerIds) return false;
    return (team.playerIds || []).length >= 2;
  };

  const availableTeams = useMemo(() => {
    return teams.filter(team => {
      const isFull = isTeamFull(team);
      const isPlayerInTeam = team.playerIds?.includes(editingTeam);
      const isPlayersCurrentTeam = editingTeam ? team.id === players.find(p => p.id === editingTeam)?.teamId : false;

      return (!isFull || isPlayerInTeam) && !isPlayersCurrentTeam;
    });
  }, [teams, editingTeam, players, isTeamFull]);

  const getNameColumnWidth = () => {
    return 80; // Fixed width for first names
  };

  const nameWidth = getNameColumnWidth();

  const getTeamIcon = (team) => {
    if (!team) return null;
    const iconIndex = team.id % TEAM_ICONS.length;
    const IconComponent = TEAM_ICONS[iconIndex].icon;
    return <IconComponent sx={{ color: team.color, mr: 1 }} />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h4">Players</Typography>
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
          {players.length}
        </Typography>
      </Box>
      <div className="player-list">
        {[...players].sort((a, b) => a.rank - b.rank).map((player) => (
          <Paper
            key={player.id}
            sx={{
              mb: 1,
              backgroundColor: '#2d2d2d',
              borderRadius: '4px',
              overflow: 'hidden',
              '& .move-buttons, & .action-buttons': {
                opacity: 0,
                transition: 'opacity 0.2s'
              },
              '&:hover .move-buttons, &:hover .action-buttons': {
                opacity: 1
              },
              '&:hover': {
                backgroundColor: '#333333'
              }
            }}
          >
            <Box sx={{ 
              py: 0.5, 
              px: 1,
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: '#2d2d2d'
            }}>
              <Box className="move-buttons" sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                mr: 1,
                gap: '2px'
              }}>
                <IconButton
                  onClick={() => onMovePlayer(player.id, -1)}
                  disabled={player.rank === 1}
                  size="small"
                  sx={{ 
                    padding: 0,
                    width: 20,
                    height: 20,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1rem'
                    }
                  }}
                >
                  <KeyboardArrowUpIcon />
                </IconButton>
                <IconButton
                  onClick={() => onMovePlayer(player.id, 1)}
                  disabled={player.rank === players.length}
                  size="small"
                  sx={{ 
                    padding: 0,
                    width: 20,
                    height: 20,
                    '& .MuiSvgIcon-root': {
                      fontSize: '1rem'
                    }
                  }}
                >
                  <KeyboardArrowDownIcon />
                </IconButton>
              </Box>

              <Box sx={{ 
                minWidth: 32,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 1,
                fontSize: '0.75rem',
                color: 'rgba(255, 255, 255, 0.7)'
              }}>
                #{player.rank}
              </Box>

              {editingId === player.id ? (
                <>
                  <TextField
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    size="small"
                    sx={{ ml: 1, width: nameWidth }}
                  />
                  <Select
                    value={editSkillLevel}
                    onChange={(e) => setEditSkillLevel(e.target.value)}
                    size="small"
                    sx={{ ml: 1, minWidth: 120 }}
                  >
                    {[1, 2, 3, 4, 5].map((level) => (
                      <MenuItem key={level} value={level}>
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
                  <IconButton onClick={() => handleSave(player.id)} color="primary" size="small">
                    <SaveIcon fontSize="small" />
                  </IconButton>
                  <IconButton onClick={handleCancel} color="secondary" size="small">
                    <CancelIcon fontSize="small" />
                  </IconButton>
                </>
              ) : (
                <>
                  <Box sx={{ ml: 1, width: nameWidth }}>{player.name}</Box>
                  <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
                    <Typography
                      sx={{
                        px: 1,
                        py: 0.25,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        backgroundColor: getSkillLevelColor(player.skillLevel),
                        color: 'black',
                        lineHeight: 1.2
                      }}
                    >
                      Lvl {player.skillLevel}
                    </Typography>
                  </Box>
                </>
              )}

              {editingTeam === player.id ? (
                <Select
                  id={`team-select-${player.id}`}
                  value=""
                  size="small"
                  sx={{ 
                    ml: 1, 
                    minWidth: 120,
                    '.MuiOutlinedInput-input': {
                      py: 0.5
                    }
                  }}
                  onChange={(e) => handleTeamChange(player.id, e.target.value)}
                  onClose={() => setEditingTeam(null)}
                  autoFocus
                >
                  <MenuItem value="">
                    <em>No Team</em>
                  </MenuItem>
                  {availableTeams.map(team => (
                    <MenuItem key={team.id} value={team.id} sx={{ display: 'flex', alignItems: 'center' }}>
                      {getTeamIcon(team)}
                      {team.name}
                    </MenuItem>
                  ))}
                </Select>
              ) : (
                <Box 
                  onClick={(e) => handleAddToTeamClick(player.id, e)}
                  sx={{ 
                    ml: 1,
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    minWidth: 120,
                    p: 0.5,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.08)'
                    }
                  }}
                >
                  {player.teamId ? (
                    <>
                      {getTeamIcon(teams.find(t => t.id === player.teamId))}
                      <Typography>{getTeamName(player.teamId).name}</Typography>
                    </>
                  ) : (
                    <Typography sx={{ color: 'text.secondary' }}>Add to Team</Typography>
                  )}
                </Box>
              )}

              <Box className="action-buttons" sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <IconButton onClick={() => handleEdit(player)} size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  onClick={() => onDeletePlayer(player.id)}
                  color="error"
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        ))}
      </div>
    </Box>
  );
};

export default PlayerList; 