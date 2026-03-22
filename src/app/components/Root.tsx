import { Outlet, Link, useLocation } from "react-router";
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  Avatar,
  Chip
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import HomeIcon from "@mui/icons-material/Home";
import DescriptionIcon from "@mui/icons-material/Description";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import FolderIcon from "@mui/icons-material/Folder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import LoginIcon from "@mui/icons-material/Login";
import { useState, useEffect } from "react";
import { getCurrentUser, logout } from "../utils/auth";

export function Root() {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(getCurrentUser());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  useEffect(() => {
    // Actualizar usuario cuando cambie
    setUser(getCurrentUser());
  }, [location]);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
  };

  const menuItems = [
    { path: "/", label: "Inicio", icon: <HomeIcon /> },
    { path: "/templates", label: "Plantillas", icon: <DescriptionIcon /> },
    { path: "/editor", label: "Crear PDF", icon: <EditIcon /> },
    { path: "/my-documents", label: "Mis PDFs", icon: <FolderIcon /> },
    { path: "/community", label: "Comunidad", icon: <PeopleIcon /> },
  ];

  const drawer = (
    <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static" sx={{ background: "linear-gradient(135deg, #1c5d15 0%, #0d350b 100%)" }}>
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700 }}>
            📄 PDF Creator Pro
          </Typography>
          {!isMobile && (
            <Box sx={{ display: "flex", gap: 1 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.path}
                  component={Link}
                  to={item.path}
                  color="inherit"
                  startIcon={item.icon}
                  sx={{
                    fontWeight: location.pathname === item.path ? 700 : 400,
                    borderBottom: location.pathname === item.path ? "2px solid white" : "none",
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Box>
          )}
          {user ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Chip
                label={user.name || user.email}
                avatar={<Avatar>{(user.name || user.email).charAt(0).toUpperCase()}</Avatar>}
                sx={{ 
                  bgcolor: "rgba(255,255,255,0.2)", 
                  color: "white",
                  "& .MuiAvatar-root": {
                    bgcolor: "#e8ff99",
                    color: "#1c5d15",
                    fontWeight: 700
                  }
                }}
              />
              <IconButton
                color="inherit"
                onClick={handleUserMenuOpen}
                size="small"
              >
                <AccountCircleIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
              >
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon sx={{ mr: 1 }} />
                  Cerrar sesión
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Button
              color="inherit"
              startIcon={<LoginIcon />}
              component={Link}
              to="/auth"
              sx={{ fontWeight: 600 }}
            >
              Ingresar
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {drawer}
      </Drawer>

      <Box sx={{ flex: 1, bgcolor: "#f5f5f5" }}>
        <Outlet />
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: "#1c5d15",
          color: "white",
          textAlign: "center",
        }}
      >
        <Typography variant="body2">
          © 2026 PDF Creator Pro - Sistema de creación colaborativa de PDFs
        </Typography>
      </Box>
    </Box>
  );
}