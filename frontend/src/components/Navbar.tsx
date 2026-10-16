import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import { alpha, styled } from "@mui/material/styles";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useAuth } from "../hooks/useAuth";
import { useThemeMode } from "../context/themeContext";
import { NAVIGATION_SECTIONS, type NavSection } from "../data/navigationData";
import { MegaMenu } from "./MegaMenu";

const SearchBox = styled("form")(({ theme }) => ({
  position: "relative",
  borderRadius: 24,
  backgroundColor: alpha(theme.palette.text.primary, 0.05),
  "&:hover": {
    backgroundColor: alpha(theme.palette.text.primary, 0.09),
  },
  marginRight: theme.spacing(2),
  marginLeft: theme.spacing(2),
  width: "100%",
  maxWidth: 280,
  display: "flex",
  alignItems: "center",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1.5),
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(0.8, 1, 0.8, 0),
    fontSize: "1rem", // 16px mínimo para evitar zoom en iOS Safari
  },
}));

export const Navbar = () => {
  const { mode, toggleColorMode } = useThemeMode();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<NavSection | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSectionToggle = (section: NavSection) => {
    setActiveSection((prev) => (prev?.id === section.id ? null : section));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/catalogo");
    }
  };

  const handleMobileItemClick = (sectionTitle: string, title: string, slug?: string) => {
    setMobileDrawerOpen(false);
    const params = new URLSearchParams();
    params.set("section", sectionTitle);
    params.set("category", slug || title);
    navigate(`/catalogo?${params.toString()}`);
  };

  const handleMobileCategoryAllClick = (sectionTitle: string, groupName: string, groupSlug?: string) => {
    setMobileDrawerOpen(false);
    const params = new URLSearchParams();
    params.set("section", sectionTitle);
    params.set("group", groupSlug || groupName);
    navigate(`/catalogo?${params.toString()}`);
  };

  return (
    <Box sx={{ position: "sticky", top: 0, zIndex: 1100 }}>
      <AppBar position="static" sx={{ pt: "env(safe-area-inset-top, 0px)" }}>
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
            {/* Botón Hamburger para Móviles */}
            <IconButton
              color="inherit"
              aria-label="abrir menú"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{ mr: 1, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Logo & Brand -> Lleva al inicio "/" */}
            <Box
              component={RouterLink}
              to="/"
              onClick={() => setActiveSection(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "text.primary",
                gap: 1,
                mr: 2,
              }}
            >
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: (theme) =>
                    `0 4px 10px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                <MusicNoteIcon />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  component="span"
                  sx={{
                    fontWeight: 800,
                    fontSize: "1.25rem",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Solo<Box component="span" sx={{ color: "primary.main" }}>Tono</Box>
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    fontSize: "0.68rem",
                    lineHeight: 1,
                    mt: -0.3,
                  }}
                >
                  Cotizador Musical
                </Typography>
              </Box>
            </Box>

            {/* Secciones Principales en Desktop: Instrumentos, Piezas y Repuestos, Equipos de sonido */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
                gap: 1,
              }}
            >
              {NAVIGATION_SECTIONS.map((sec) => {
                const isOpen = activeSection?.id === sec.id;

                return (
                  <Button
                    key={sec.id}
                    onClick={() => handleSectionToggle(sec)}
                    color="inherit"
                    endIcon={
                      isOpen ? (
                        <KeyboardArrowUpIcon sx={{ color: "primary.main" }} />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )
                    }
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.92rem",
                      px: 2,
                      py: 1,
                      color: isOpen ? "primary.main" : "text.primary",
                      bgcolor: isOpen ? "action.hover" : "transparent",
                      borderRadius: 2,
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: "action.hover",
                        color: "primary.main",
                      },
                    }}
                  >
                    {sec.title}
                  </Button>
                );
              })}
            </Box>

            {/* Buscador de barra rápida */}
            <SearchBox onSubmit={handleSearchSubmit}>
              <SearchIconWrapper>
                <SearchIcon fontSize="small" />
              </SearchIconWrapper>
              <StyledInputBase
                placeholder="Buscar instrumento, pastilla, micrófono..."
                inputProps={{ "aria-label": "buscar en catálogo" }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </SearchBox>

            {/* Toggle Modo Oscuro / Claro y Navegación de Sesión */}
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Tooltip title={`Cambiar a modo ${mode === "dark" ? "claro" : "oscuro"}`}>
                <IconButton
                  onClick={toggleColorMode}
                  color="inherit"
                  aria-label="alternar modo de color"
                >
                  {mode === "dark" ? (
                    <Brightness7Icon sx={{ color: "#ffb74d" }} />
                  ) : (
                    <Brightness4Icon sx={{ color: "#5c6bc0" }} />
                  )}
                </IconButton>
              </Tooltip>
              {user ? (
                <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 1, ml: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/favoritos"
                    variant="text"
                    color="inherit"
                    sx={{ fontWeight: 700 }}
                  >
                    Favoritos
                  </Button>
                  {(user.role === "admin" || user.role === "moderator") && (
                    <Button
                      component={RouterLink}
                      to="/admin"
                      variant="text"
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    >
                      Admin
                    </Button>
                  )}
                  <Typography variant="body2" sx={{ fontWeight: 600, mx: 0.5 }}>
                    Hola, {user.name || user.username}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={logout}
                    sx={{ fontWeight: 600 }}
                  >
                    Cerrar Sesión
                  </Button>
                </Box>
              ) : (
                <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1, ml: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/favoritos"
                    variant="text"
                    color="inherit"
                    sx={{ fontWeight: 600 }}
                  >
                    Favoritos
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="text"
                    color="inherit"
                    sx={{ fontWeight: 600 }}
                  >
                    Ingresar
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="primary"
                    sx={{
                      fontWeight: 700,
                    }}
                  >
                    Registrarse
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mega Menú desplegable para Desktop */}
      <MegaMenu
        section={activeSection}
        onClose={() => setActiveSection(null)}
      />

      {/* Drawer para Móviles / Tablets */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        transitionDuration={{ enter: 260, exit: 200 }}
        slotProps={{
          transition: {
            easing: {
              enter: "cubic-bezier(0.32, 0.72, 0, 1)",
              exit: "cubic-bezier(0.23, 1, 0.32, 1)",
            },
          },
        }}
        sx={{
          "& .MuiDrawer-paper": {
            width: 310,
            p: 2,
            pt: "calc(16px + env(safe-area-inset-top, 0px))",
            pb: "calc(16px + env(safe-area-inset-bottom, 0px))",
            boxSizing: "border-box",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MusicNoteIcon sx={{ color: "primary.main" }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Solo<Box component="span" sx={{ color: "primary.main" }}>Tono</Box>
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileDrawerOpen(false)} size="small" aria-label="cerrar menú">
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Buscador en Drawer Móvil */}
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 2 }}>
          <StyledInputBase
            placeholder="Buscar en catálogo..."
            inputProps={{ "aria-label": "Buscar en catálogo" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 2,
              px: 1.5,
              py: 0.5,
              width: "100%",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          {user ? (
            <>
              <Typography variant="body2" sx={{ fontWeight: 600, px: 1, py: 0.5 }}>
                Conectado como: {user.name || user.username}
              </Typography>
              <Button
                component={RouterLink}
                to="/favoritos"
                variant="outlined"
                fullWidth
                onClick={() => setMobileDrawerOpen(false)}
              >
                Mis Favoritos
              </Button>
              {(user.role === "admin" || user.role === "moderator") && (
                <Button
                  component={RouterLink}
                  to="/admin"
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={() => setMobileDrawerOpen(false)}
                >
                  Panel de Administración
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => {
                  logout();
                  setMobileDrawerOpen(false);
                }}
              >
                Cerrar Sesión
              </Button>
            </>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/favoritos"
                variant="outlined"
                fullWidth
                onClick={() => setMobileDrawerOpen(false)}
              >
                Favoritos
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={() => setMobileDrawerOpen(false)}
              >
                Iniciar Sesión
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                fullWidth
                startIcon={<PersonAddIcon />}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{ fontWeight: 700 }}
              >
                Crear Cuenta
              </Button>
            </>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        <List disablePadding>
          {NAVIGATION_SECTIONS.map((sec) => {
            const isExpanded = mobileExpandedSection === sec.id;

            return (
              <Box key={sec.id} sx={{ mb: 1 }}>
                <ListItemButton
                  onClick={() =>
                    setMobileExpandedSection(isExpanded ? null : sec.id)
                  }
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {sec.title}
                      </Typography>
                    }
                  />
                  {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </ListItemButton>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding sx={{ pl: 2 }}>
                    {sec.columns.map((col) => (
                      <Box key={col.categoryName} sx={{ my: 1.5 }}>
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: 700, color: "text.primary", display: "block" }}
                        >
                          {col.categoryName}
                        </Typography>
                        {col.items.map((item) => (
                          <ListItem key={item.title} disablePadding sx={{ py: 0.3 }}>
                            <ListItemButton
                              onClick={() => handleMobileItemClick(sec.title, item.title, item.slug)}
                              sx={{ py: 0.4, px: 1, borderRadius: 1 }}
                            >
                              <ListItemText
                                primary={
                                  <Typography
                                    sx={{
                                      fontSize: "0.82rem",
                                      color: "text.secondary",
                                    }}
                                  >
                                    {item.title}
                                  </Typography>
                                }
                              />
                            </ListItemButton>
                          </ListItem>
                        ))}
                        <ListItem disablePadding sx={{ py: 0.3 }}>
                          <ListItemButton
                            onClick={() => handleMobileCategoryAllClick(sec.title, col.categoryName, col.groupSlug)}
                            sx={{ py: 0.4, px: 1, borderRadius: 1 }}
                          >
                            <ListItemText
                              primary={
                                <Typography
                                  sx={{
                                    fontSize: "0.82rem",
                                    color: "primary.main",
                                    fontWeight: 700,
                                  }}
                                >
                                  Ver todos
                                </Typography>
                              }
                            />
                          </ListItemButton>
                        </ListItem>
                      </Box>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          })}
        </List>
      </Drawer>
    </Box>
  );
};
