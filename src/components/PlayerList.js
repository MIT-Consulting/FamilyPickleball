import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Typography,
  Box,
  Paper,
  IconButton,
  TextField,
  Select,
  MenuItem,
  Autocomplete,
  Button,
  ButtonGroup,
  FormControl,
  InputLabel,
  Collapse
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import StarIcon from '@mui/icons-material/Star';
import ShieldIcon from '@mui/icons-material/Shield';
import CastleIcon from '@mui/icons-material/Castle';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
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
import ClearIcon from '@mui/icons-material/Clear';
import SortIcon from '@mui/icons-material/Sort';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getSkillLevelColor, getSkillLevelText, getSkillLevelFullText } from '../utils/skillLevels';
import { maleNames, femaleNames, predictGender } from '../utils/genderPredictor';

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

const PlayerList = ({ players, teams, onUpdatePlayer, onDeletePlayer, onMovePlayer, onAssignPlayer, onAddPlayer }) => {
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSkillLevel, setEditSkillLevel] = useState('');
  const [editFamily, setEditFamily] = useState('');
  const [editingTeam, setEditingTeam] = useState(null);
  const [familyFilter, setFamilyFilter] = useState(null);
  const [openSkillDropdown, setOpenSkillDropdown] = useState(false);
  const [sortBySkill, setSortBySkill] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [skillLevel, setSkillLevel] = useState(1);
  const [isMale, setIsMale] = useState(true);
  const [family, setFamily] = useState('Miller');
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const playerNameInputRef = useRef(null);

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

  // Add this effect to focus the input when expanded
  useEffect(() => {
    if (isAddPlayerOpen && playerNameInputRef.current) {
      playerNameInputRef.current.focus();
    }
  }, [isAddPlayerOpen]);

  const handleEdit = (player, fromSkillLevel = false) => {
    setEditingId(player.id);
    setEditName(player.name);
    setEditSkillLevel(player.skillLevel);
    setEditFamily(player.family || 'Miller');
    if (fromSkillLevel) {
      // Set timeout to allow the Select to mount before opening
      setTimeout(() => setOpenSkillDropdown(true), 100);
    }
  };

  const handleSave = (playerId) => {
    if (editName.trim()) {
      onUpdatePlayer(playerId, {
        name: editName.trim(),
        skillLevel: editSkillLevel,
        family: editFamily,
      });
      setEditingId(null);
      setOpenSkillDropdown(false);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setOpenSkillDropdown(false);
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
    const iconConfig = TEAM_ICONS.find(icon => icon.name === team.iconName) || TEAM_ICONS[0];
    const IconComponent = iconConfig.icon;
    return <IconComponent sx={{ color: team.color, mr: 1 }} />;
  };

  // Combine male and female names for autocomplete
  const allNames = useMemo(() => {
    const names = new Set([...maleNames, ...femaleNames]);
    return Array.from(names).map(name => name.charAt(0).toUpperCase() + name.slice(1));
  }, []);

  // Filter players based on selected family
  const filteredPlayers = useMemo(() => {
    if (!familyFilter) return players;
    return players.filter(player => player.family === familyFilter);
  }, [players, familyFilter]);

  const handleKeyPress = (event, playerId) => {
    if (event.key === 'Enter') {
      handleSave(playerId);
    }
  };

  // Sort players based on current sort mode
  const sortedPlayers = useMemo(() => {
    const filtered = familyFilter ? players.filter(player => player.family === familyFilter) : players;
    return [...filtered].sort((a, b) => {
      if (sortBySkill) {
        return b.skillLevel - a.skillLevel || a.rank - b.rank; // Secondary sort by rank
      }
      return a.rank - b.rank;
    });
  }, [players, familyFilter, sortBySkill]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (playerName.trim() && skillLevel) {
      onAddPlayer(playerName.trim(), skillLevel, isMale ? 'Male' : 'Female', family);
      setPlayerName('');
      setSkillLevel(1);
      setIsMale(true);
    }
  };

  // Helper function to get button styles
  const getFamilyButtonStyle = (familyName) => ({
    flex: 1,
    bgcolor: family === familyName ? FAMILY_COLORS[familyName] : 'transparent',
    '&:hover': {
      bgcolor: family === familyName 
        ? FAMILY_COLORS[familyName] 
        : `${FAMILY_COLORS[familyName]}33` // 20% opacity version of the color
    },
    color: family === familyName ? 'black' : FAMILY_COLORS[familyName]
  });

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }  // Responsive padding
    }}>
      {/* Add Player Controls */}
      <Paper 
        sx={{ 
          mb: 3,
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 1,
        }}
      >
        <Box
          onClick={() => setIsAddPlayerOpen(!isAddPlayerOpen)}
          sx={{ 
            p: { xs: 1, sm: 2 },  // Responsive padding
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.03)'
            }
          }}
        >
          <Typography variant="subtitle1">Add New Player</Typography>
          <IconButton 
            size="small"
            sx={{ color: 'inherit' }}
          >
            {isAddPlayerOpen ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={isAddPlayerOpen}>
          <Box 
            component="form" 
            onSubmit={handleSubmit}
            sx={{ 
              p: { xs: 1, sm: 2 },  // Responsive padding
              pt: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
            }}
          >
            {/* Name and Gender row */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },  // Stack on mobile
              gap: 2 
            }}>
              <TextField
                inputRef={playerNameInputRef}
                label="Player Name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                variant="outlined"
                size="small"
                inputProps={{ spellCheck: 'true' }}
                sx={{ flex: 1 }}
              />
              
              <ButtonGroup 
                variant="contained" 
                sx={{ 
                  minWidth: { xs: '100%', sm: 200 },  // Full width on mobile
                  '& .MuiButton-root': {
                    flex: 1
                  }
                }}
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
            </Box>

            {/* Skill Level and Family row */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },  // Stack on mobile
              gap: 2,
              alignItems: 'flex-start'
            }}>
              <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }}>
                <InputLabel id="skill-level-label">Skill Level</InputLabel>
                <Select
                  labelId="skill-level-label"
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  size="small"
                  label="Skill Level"
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
              </FormControl>

              <ButtonGroup 
                variant="contained" 
                sx={{ 
                  minWidth: { xs: '100%', sm: 300 },  // Full width on mobile
                  '& .MuiButton-root': {
                    flex: 1
                  }
                }}
              >
                <Button
                  onClick={() => setFamily('Miller')}
                  variant={family === 'Miller' ? "contained" : "outlined"}
                  sx={getFamilyButtonStyle('Miller')}
                >
                  Miller
                </Button>
                <Button
                  onClick={() => setFamily('Holcomb')}
                  variant={family === 'Holcomb' ? "contained" : "outlined"}
                  sx={getFamilyButtonStyle('Holcomb')}
                >
                  Holcomb
                </Button>
                <Button
                  onClick={() => setFamily('Burton')}
                  variant={family === 'Burton' ? "contained" : "outlined"}
                  sx={getFamilyButtonStyle('Burton')}
                >
                  Burton
                </Button>
              </ButtonGroup>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!playerName.trim() || !skillLevel}
            >
              Add Player
            </Button>
          </Box>
        </Collapse>
      </Paper>

      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1, 
        mb: 2,
        flexWrap: 'wrap'
      }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>Players</Typography>
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
          {sortedPlayers.length}
          {familyFilter && ` / ${players.length}`}
        </Typography>

        <Box sx={{ 
          ml: { xs: 0, sm: 'auto' },
          mt: { xs: 1, sm: 0 },
          width: { xs: '100%', sm: 'auto' },
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          justifyContent: { xs: 'center', sm: 'flex-end' }
        }}>
          {/* Sort toggle button */}
          <IconButton
            onClick={() => setSortBySkill(!sortBySkill)}
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              bgcolor: sortBySkill ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
            size="small"
            title={`Sort by ${sortBySkill ? 'rank' : 'skill level'}`}
          >
            {sortBySkill ? (
              <SortIcon />
            ) : (
              <FormatListNumberedIcon />
            )}
          </IconButton>
        </Box>
      </Box>

      <div className="player-list">
        {sortedPlayers.map((player) => (
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
              px: { xs: 1, sm: 1 },
              display: 'flex', 
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: { xs: 1, sm: 2 }
            }}>
              <Box className="move-buttons" sx={{ 
                display: { xs: 'none', sm: 'flex' },  // Hide on mobile
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
                color: 'rgba(255, 255, 255, 0.7)',
                mr: 1,
                order: { xs: -1, sm: 0 }  // First on mobile
              }}>
                #{player.rank}
              </Box>

              {editingId === player.id ? (
                <>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 1,
                    flex: 1
                  }}>
                    <Autocomplete
                      freeSolo
                      value={editName}
                      onChange={(event, newValue) => setEditName(newValue || '')}
                      onInputChange={(event, newValue) => setEditName(newValue)}
                      options={allNames}
                      size="small"
                      sx={{ width: { xs: '100%', sm: nameWidth + 40 } }}
                      open={false}
                      onKeyPress={(e) => handleKeyPress(e, player.id)}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          size="small"
                          autoFocus
                        />
                      )}
                    />

                    <Select
                      value={editFamily}
                      onChange={(e) => setEditFamily(e.target.value)}
                      size="small"
                      onKeyPress={(e) => handleKeyPress(e, player.id)}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: 100 },
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.5
                        }
                      }}
                    >
                      {Object.entries(FAMILY_ICONS).map(([family, Icon]) => (
                        <MenuItem 
                          key={family} 
                          value={family}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5
                          }}
                        >
                          <Icon sx={{ color: FAMILY_COLORS[family], fontSize: '1.2rem' }} />
                          {family}
                        </MenuItem>
                      ))}
                    </Select>

                    <Select
                      value={editSkillLevel}
                      onChange={(e) => {
                        setEditSkillLevel(e.target.value);
                        onUpdatePlayer(player.id, {
                          ...player,
                          skillLevel: e.target.value
                        });
                      }}
                      size="small"
                      open={openSkillDropdown}
                      onOpen={() => setOpenSkillDropdown(true)}
                      onClose={() => {
                        setOpenSkillDropdown(false);
                        setEditSkillLevel(null);
                      }}
                      sx={{ 
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { sm: 120 },
                        '& .MuiOutlinedInput-input': {
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

                    <Box sx={{ 
                      display: 'flex', 
                      gap: 0.5,
                      justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                      mt: { xs: 1, sm: 0 }
                    }}>
                      <IconButton onClick={() => handleSave(player.id)} color="primary" size="small">
                        <SaveIcon fontSize="small" />
                      </IconButton>
                      <IconButton onClick={handleCancel} color="secondary" size="small">
                        <CancelIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: { xs: 1, sm: 2 },
                    flex: 1
                  }}>
                    <Box sx={{ 
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      width: { xs: '100%', sm: 'auto' }
                    }}>
                      {player.family && FAMILY_ICONS[player.family] && React.createElement(FAMILY_ICONS[player.family], {
                        sx: { 
                          color: FAMILY_COLORS[player.family],
                          fontSize: '1.2rem'
                        }
                      })}
                      <Typography>{player.name}</Typography>
                    </Box>

                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        width: { xs: '100%', sm: 'auto' },
                        justifyContent: { xs: 'space-between', sm: 'flex-start' }
                      }}
                    >
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8
                          }
                        }}
                        onDoubleClick={() => handleEdit(player, true)}
                      >
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

                      {editingTeam === player.id ? (
                        <Select
                          id={`team-select-${player.id}`}
                          value=""
                          size="small"
                          sx={{ 
                            width: { xs: '100%', sm: 'auto' },
                            minWidth: { sm: 120 },
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
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            minWidth: { sm: 120 },
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
                    </Box>
                  </Box>

                  <Box className="action-buttons" sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5,
                    ml: { xs: 0, sm: 'auto' },
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'flex-end', sm: 'flex-start' },
                    mt: { xs: 1, sm: 0 }
                  }}>
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
                </>
              )}
            </Box>
          </Paper>
        ))}
      </div>
    </Box>
  );
};

export default PlayerList; 