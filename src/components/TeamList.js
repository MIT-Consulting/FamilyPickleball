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
  InputAdornment,
  Stack,
  Tooltip,
  Select,
  MenuItem
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
import ShieldIcon from '@mui/icons-material/Shield';
import CastleIcon from '@mui/icons-material/Castle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import RefreshIcon from '@mui/icons-material/Refresh';
import BoltIcon from '@mui/icons-material/Bolt';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import WavesIcon from '@mui/icons-material/Waves';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import FlareIcon from '@mui/icons-material/Flare';
import FilterVintageIcon from '@mui/icons-material/FilterVintage';
import PsychologyIcon from '@mui/icons-material/Psychology';
import CloudIcon from '@mui/icons-material/Cloud';
import EmojiNatureIcon from '@mui/icons-material/EmojiNature';
import AirIcon from '@mui/icons-material/Air';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import SortIcon from '@mui/icons-material/Sort';
import { getSkillLevelColor, getSkillLevelText } from '../utils/skillLevels';

const TEAM_ICONS = [
  { icon: StarIcon, name: 'Star' },
  { icon: BoltIcon, name: 'Lightning' },
  { icon: RocketLaunchIcon, name: 'Rocket' },
  { icon: LocalFireDepartmentIcon, name: 'Fire' },
  { icon: WavesIcon, name: 'Waves' },
  { icon: AcUnitIcon, name: 'Snowflake' },
  { icon: WhatshotIcon, name: 'Flame' },
  { icon: AutoAwesomeIcon, name: 'Sparkle' },
  { icon: FlareIcon, name: 'Flare' },
  { icon: FilterVintageIcon, name: 'Flower' },
  { icon: PsychologyIcon, name: 'Mind' },
  { icon: CloudIcon, name: 'Cloud' },
  { icon: EmojiNatureIcon, name: 'Leaf' },
  { icon: AirIcon, name: 'Wind' }
];

const TEAM_NAME_SUGGESTIONS = [
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

const FAMILY_ICONS = {
  Miller: ShieldIcon,
  Holcomb: CastleIcon,
  Burton: AccountBalanceIcon
};

const FAMILY_COLORS = {
  Miller: '#90caf9',  // Material-UI blue[200]
  Holcomb: '#c48b9f', // Matching burgundy
  Burton: '#81c784'   // Material-UI green[300]
};

const getTotalSkillColor = (total) => {
  // Scale from yellow (2) to red (10)
  if (total < 2) return '#808080';  // Gray for less than 2
  const colors = {
    2: '#FFD700',  // Yellow
    3: '#FFC300',
    4: '#FFB000',
    5: '#FF9700',
    6: '#FF7E00',
    7: '#FF6500',
    8: '#FF4C00',
    9: '#FF3300',
    10: '#FF0000'  // Red
  };
  return colors[total] || colors[10];  // Default to red if over 10
};

const TeamList = ({ 
  teams, 
  players, 
  onUpdateTeam, 
  onDeleteTeam, 
  onAssignPlayer, 
  onRandomizeTeams,
  onUpdatePlayer 
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [expandedTeams, setExpandedTeams] = useState({});
  const [sortBySkill, setSortBySkill] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [editSkillLevel, setEditSkillLevel] = useState('');
  const [openSkillDropdown, setOpenSkillDropdown] = useState(false);

  const getTeamSkillInfo = (team) => {
    if (!team || !team.playerIds) return { total: 0, average: 0 };
    const teamPlayers = (team.playerIds || [])
      .map(id => players.find(p => p.id === id))
      .filter(Boolean);
    
    const total = teamPlayers.reduce((sum, player) => sum + player.skillLevel, 0);
    const average = teamPlayers.length ? total / teamPlayers.length : 0;
    return { total, average };
  };

  const sortedTeams = useMemo(() => {
    if (!sortBySkill) return teams;
    return [...teams].sort((a, b) => {
      const aSkill = getTeamSkillInfo(a).total;
      const bSkill = getTeamSkillInfo(b).total;
      return bSkill - aSkill; // Sort in descending order
    });
  }, [teams, sortBySkill, players]);

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
    if (!team) return null;
    const iconConfig = TEAM_ICONS.find(icon => icon.name === team.iconName) || TEAM_ICONS[0];
    const IconComponent = iconConfig.icon;
    return <IconComponent sx={{ color: team.color, mr: 1 }} />;
  };

  const getRandomTeamName = () => {
    // Filter out existing team names except the current editing team
    const existingNames = new Set(teams.filter(t => t.id !== editingId).map(team => team.name));
    const availableNames = TEAM_NAME_SUGGESTIONS.filter(name => !existingNames.has(name));
    
    if (availableNames.length === 0) {
      // If all names are used, use the full list
      const randomIndex = Math.floor(Math.random() * TEAM_NAME_SUGGESTIONS.length);
      setEditName(TEAM_NAME_SUGGESTIONS[randomIndex]);
    } else {
      // Choose from available names
      const randomIndex = Math.floor(Math.random() * availableNames.length);
      setEditName(availableNames[randomIndex]);
    }
  };

  const getTeamFamilies = (team) => {
    if (!team || !team.playerIds) return new Set();
    return new Set((team.playerIds || [])
      .map(id => players.find(p => p.id === id))
      .filter(Boolean)
      .map(player => player.family));
  };

  const handleEditSkill = (player) => {
    setEditingSkill(player.id);
    setEditSkillLevel(player.skillLevel);
    // Set timeout to allow the Select to mount before opening
    setTimeout(() => setOpenSkillDropdown(true), 100);
  };

  const handleSaveSkill = (playerId, newSkillLevel) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      onUpdatePlayer(playerId, {
        ...player,
        skillLevel: newSkillLevel
      });
    }
    setEditingSkill(null);
    setOpenSkillDropdown(false);
  };

  const handleCancelSkill = () => {
    setEditingSkill(null);
    setOpenSkillDropdown(false);
  };

  const handleKeyPress = (event, playerId) => {
    if (event.key === 'Enter') {
      handleSaveSkill(playerId);
    }
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
          <Tooltip title={sortBySkill ? "Sort by original order" : "Sort by total skill level"}>
            <IconButton
              size="small"
              onClick={() => setSortBySkill(!sortBySkill)}
              sx={{
                backgroundColor: sortBySkill ? 'primary.main' : 'rgba(255, 255, 255, 0.1)',
                '&:hover': {
                  backgroundColor: sortBySkill ? 'primary.dark' : 'rgba(255, 255, 255, 0.2)',
                }
              }}
            >
              <SortIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Randomize team colors and icons">
            <IconButton 
              size="small" 
              onClick={onRandomizeTeams}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              <ShuffleIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title={isAllExpanded ? "Collapse All" : "Expand All"}>
            <IconButton 
              size="small" 
              onClick={handleExpandCollapseAll}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
              }}
            >
              {isAllExpanded ? <UnfoldLessIcon fontSize="small" /> : <UnfoldMoreIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <div className="team-list">
        <List sx={{ mt: 2 }}>
          {sortedTeams.map((team) => (
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
                    <input
                      type="color"
                      value={editColor}
                      onChange={(e) => setEditColor(e.target.value)}
                      style={{ 
                        width: 32, 
                        height: 32, 
                        padding: 0, 
                        border: 'none',
                        borderRadius: '4px',
                        backgroundColor: 'transparent',
                        cursor: 'pointer'
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
                      {(team.playerIds || []).length > 0 && (
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
                            color: getTotalSkillColor(getTeamSkillInfo(team).total)
                          }}
                        >
                          <StarIcon sx={{ fontSize: '0.9rem' }} />
                          {getTeamSkillInfo(team).total}
                        </Typography>
                      )}
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

                    <Stack direction="row" spacing={0.5} sx={{ mr: 1 }}>
                      {Array.from(getTeamFamilies(team)).map(family => {
                        const Icon = FAMILY_ICONS[family];
                        return (
                          <Icon 
                            key={family}
                            sx={{ 
                              color: FAMILY_COLORS[family],
                              fontSize: '1.2rem'
                            }}
                          />
                        );
                      })}
                    </Stack>

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
                        {player.family && FAMILY_ICONS[player.family] && React.createElement(FAMILY_ICONS[player.family], {
                          sx: { 
                            color: FAMILY_COLORS[player.family],
                            fontSize: '1.2rem',
                            mr: 1
                          }
                        })}
                        
                        <Box sx={{ width: 80 }}>
                          <Typography noWrap>{player.name}</Typography>
                        </Box>

                        <Box sx={{ width: 50 }}>
                          {editingSkill === player.id ? (
                            <Select
                              value={editSkillLevel}
                              onChange={(e) => {
                                setEditSkillLevel(e.target.value);
                                handleSaveSkill(player.id, e.target.value);
                              }}
                              size="small"
                              open={openSkillDropdown}
                              onOpen={() => setOpenSkillDropdown(true)}
                              onClose={() => {
                                setOpenSkillDropdown(false);
                                setEditingSkill(null);
                              }}
                              sx={{ 
                                minWidth: 120,
                                '.MuiOutlinedInput-input': {
                                  py: 0.5
                                }
                              }}
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
                          ) : (
                            <Box 
                              onDoubleClick={() => handleEditSkill(player)}
                              sx={{ cursor: 'pointer' }}
                            >
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
                          )}
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
        </List>
      </div>
    </Box>
  );
};

export default TeamList; 