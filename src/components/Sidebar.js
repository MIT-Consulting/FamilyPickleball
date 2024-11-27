import React from 'react';
import {
  Drawer,
  IconButton,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import GroupsIcon from '@mui/icons-material/Groups';  // For Teams
import PeopleIcon from '@mui/icons-material/People';  // For Players
import { useLocation, useNavigate } from 'react-router-dom';

const MENU_ITEMS = [
  {
    label: 'Teams',
    icon: GroupsIcon,
    path: '/teams'
  },
  {
    label: 'Players',
    icon: PeopleIcon,
    path: '/players'
  }
];

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

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
        <Typography variant="h6">Navigation</Typography>
        <IconButton onClick={onToggle} sx={{ color: 'white' }}>
          {isOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>
      </Box>

      <List sx={{ px: 1 }}>
        {MENU_ITEMS.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => navigate(item.path)}
                selected={isSelected}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(144, 202, 249, 0.16)',
                    '&:hover': {
                      backgroundColor: 'rgba(144, 202, 249, 0.24)',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ color: isSelected ? 'primary.main' : 'inherit', minWidth: 40 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText 
                  primary={item.label}
                  primaryTypographyProps={{
                    sx: { 
                      color: isSelected ? 'primary.main' : 'inherit',
                      fontWeight: isSelected ? 500 : 400
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

export default Sidebar; 