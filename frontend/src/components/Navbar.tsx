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
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import { alpha, styled } from "@mui/material/styles";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import LogoutIcon from "@mui/icons-material/Logout";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useAuth } from "../hooks/useAuth";
import { useThemeMode } from "../context/themeContext";
import { NAVIGATION_SECTIONS, type NavSection } from "../data/navigationData";
import { MegaMenu } from "./MegaMenu";

/**
 * Contenedor de búsqueda refinado con estética de cápsula (pill-shaped)
 * y microinteracciones de Emil Kowalski.
 */
const SearchContainer = styled("form")(({ theme }) => ({
  position: "relative",
  display: "flex",
  alignItems: "center",
  width: "100%",
  borderRadius: 9999,
  backgroundColor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.06 : 0.04),
  border: `1px solid ${alpha(theme.palette.divider, theme.palette.mode === "dark" ? 0.2 : 0.18)}`,
  transition:
    "border-color 160ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 160ms cubic-bezier(0.23, 1, 0.32, 1), background-color 160ms ease",
  "@media (hover: hover) and (pointer: fine)": {
    "&:hover": {
      backgroundColor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.09 : 0.07),
      borderColor: alpha(theme.palette.primary.main, 0.45),
    },
  },
  "&:focus-within": {
    backgroundColor: theme.palette.mode === "dark" ? "#171a23" : "#ffffff",
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.2)}`,
  },
}));

export const Navbar = () => {
  const { mode, toggleColorMode } = useThemeMode();
  const { user, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState<NavSection | null>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>(null);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const isUserMenuOpen = Boolean(userMenuAnchor);

  const handleSectionToggle = (section: NavSection) => {
    setActiveSection((prev) => (prev?.id === section.id ? null : section));
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = searchTerm.trim();
    if (trimmed) {
      navigate(`/catalogo?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/catalogo");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setUserMenuAnchor(null);
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
        {/* ================================================================= */}
        {/* NIVEL 1 (Superior): Logo, Buscador Protagónico y Acciones Usuario */}
        {/* ================================================================= */}
        <Container maxWidth="lg">
          <Toolbar
            disableGutters
            sx={{
              justifyContent: "space-between",
              alignItems: "center",
              minHeight: { xs: 58, md: 66 },
              gap: { xs: 1, md: 3 },
            }}
          >
            {/* Botón Menú Hamburguesa para Móviles */}
            <IconButton
              color="inherit"
              aria-label="abrir menú de navegación"
              edge="start"
              onClick={() => setMobileDrawerOpen(true)}
              sx={{
                display: { md: "none" },
                mr: 0.5,
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
                "&:active": { transform: "scale(0.92)" },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Identidad de Marca: SoloTono */}
            <Box
              component={RouterLink}
              to="/"
              onClick={() => setActiveSection(null)}
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "text.primary",
                gap: 1.25,
                flexShrink: 0,
                transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
                "&:active": { transform: "scale(0.97)" },
              }}
            >
              <Box
                sx={{
                  width: { xs: 34, md: 40 },
                  height: { xs: 34, md: 40 },
                  borderRadius: "11px",
                  background: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  boxShadow: (theme) =>
                    `0 4px 12px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              >
                <MusicNoteIcon sx={{ fontSize: { xs: "1.2rem", md: "1.45rem" } }} />
              </Box>
              <Box>
                <Typography
                  variant="h6"
                  component="span"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "1.15rem", md: "1.32rem" },
                    letterSpacing: "-0.5px",
                    lineHeight: 1.1,
                    display: "block",
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
                    fontWeight: 600,
                    letterSpacing: "0.2px",
                    lineHeight: 1,
                    mt: 0.2,
                  }}
                >
                  Cotizador Musical
                </Typography>
              </Box>
            </Box>

            {/* Buscador Central Protagónico para Desktop (formato cápsula) */}
            <Box
              sx={{
                display: { xs: "none", md: "flex" },
                flex: 1,
                maxWidth: 620,
                mx: { md: 2, lg: 4 },
              }}
            >
              <SearchContainer onSubmit={handleSearchSubmit}>
                <Box
                  sx={{
                    pl: 2,
                    pr: 0.5,
                    display: "flex",
                    alignItems: "center",
                    color: "text.secondary",
                    pointerEvents: "none",
                  }}
                >
                  <SearchIcon sx={{ fontSize: "1.2rem" }} />
                </Box>
                <InputBase
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="¿Qué instrumento o equipo estás buscando?"
                  inputProps={{ "aria-label": "buscar en catálogo de instrumentos" }}
                  sx={{
                    flex: 1,
                    color: "inherit",
                    "& .MuiInputBase-input": {
                      py: 1,
                      px: 1,
                      fontSize: "0.94rem",
                      "&::placeholder": {
                        opacity: 0.7,
                      },
                    },
                  }}
                />
                {searchTerm && (
                  <IconButton
                    size="small"
                    onClick={handleClearSearch}
                    aria-label="Limpiar término de búsqueda"
                    sx={{
                      p: 0.5,
                      mr: 0.5,
                      color: "text.secondary",
                      transition: "color 140ms ease, transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
                      "&:hover": { color: "text.primary" },
                      "&:active": { transform: "scale(0.9)" },
                    }}
                  >
                    <ClearIcon sx={{ fontSize: "1.1rem" }} />
                  </IconButton>
                )}
                <Box sx={{ pr: 0.6, py: 0.5 }}>
                  <IconButton
                    type="submit"
                    aria-label="Ejecutar búsqueda"
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      bgcolor: "primary.main",
                      color: "#ffffff",
                      boxShadow: "0 2px 6px rgba(255, 111, 0, 0.35)",
                      transition:
                        "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease, box-shadow 140ms ease",
                      "@media (hover: hover) and (pointer: fine)": {
                        "&:hover": {
                          bgcolor: "primary.dark",
                          boxShadow: "0 4px 10px rgba(255, 111, 0, 0.45)",
                        },
                      },
                      "&:active": {
                        transform: "scale(0.92)",
                      },
                    }}
                  >
                    <SearchIcon sx={{ fontSize: "1.15rem" }} />
                  </IconButton>
                </Box>
              </SearchContainer>
            </Box>

            {/* Grupo de Utilidades y Acceso de Usuario (Extremo Derecho) */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                flexShrink: 0,
              }}
            >
              {/* Botón Favoritos */}
              <Tooltip title="Mis Favoritos">
                <IconButton
                  component={RouterLink}
                  to="/favoritos"
                  color="inherit"
                  aria-label="ir a mis favoritos"
                  sx={{
                    transition:
                      "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), color 140ms ease",
                    "@media (hover: hover) and (pointer: fine)": {
                      "&:hover": { color: "primary.main" },
                    },
                    "&:active": { transform: "scale(0.92)" },
                  }}
                >
                  <FavoriteBorderIcon sx={{ fontSize: "1.3rem" }} />
                </IconButton>
              </Tooltip>

              {/* Botón Modo Claro/Oscuro */}
              <Tooltip title={`Cambiar a modo ${mode === "dark" ? "claro" : "oscuro"}`}>
                <IconButton
                  onClick={toggleColorMode}
                  color="inherit"
                  aria-label="alternar modo de color"
                  sx={{
                    transition:
                      "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), color 140ms ease",
                    "&:active": { transform: "scale(0.92)" },
                  }}
                >
                  {mode === "dark" ? (
                    <Brightness7Icon sx={{ color: "#ffb74d", fontSize: "1.3rem" }} />
                  ) : (
                    <Brightness4Icon sx={{ color: "#5c6bc0", fontSize: "1.3rem" }} />
                  )}
                </IconButton>
              </Tooltip>

              {/* Estado de Sesión del Usuario */}
              {user ? (
                <>
                  {/* Botón de Perfil interactivo con menú */}
                  <Button
                    onClick={handleOpenUserMenu}
                    color="inherit"
                    aria-label="menú de usuario"
                    aria-controls={isUserMenuOpen ? "user-account-menu" : undefined}
                    aria-haspopup="true"
                    aria-expanded={isUserMenuOpen ? "true" : undefined}
                    startIcon={
                      <AccountCircleIcon
                        sx={{
                          color: user.role === "admin" ? "primary.main" : "text.secondary",
                          fontSize: "1.35rem !important",
                        }}
                      />
                    }
                    endIcon={
                      <KeyboardArrowDownIcon
                        sx={{
                          fontSize: "1.1rem !important",
                          transition: "transform 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                          transform: isUserMenuOpen ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    }
                    sx={{
                      display: { xs: "none", sm: "inline-flex" },
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      px: 1.5,
                      py: 0.7,
                      borderRadius: "10px",
                      border: "1px solid",
                      borderColor: (theme) => alpha(theme.palette.divider, 0.25),
                      bgcolor: (theme) =>
                        alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.04 : 0.03),
                      transition:
                        "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease",
                      "&:active": { transform: "scale(0.97)" },
                    }}
                  >
                    <Typography
                      variant="body2"
                      component="span"
                      sx={{
                        fontWeight: 700,
                        maxWidth: 130,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {user.name || user.username}
                    </Typography>
                  </Button>

                  {/* Menú contextual refinado de Usuario */}
                  <Menu
                    id="user-account-menu"
                    anchorEl={userMenuAnchor}
                    open={isUserMenuOpen}
                    onClose={handleCloseUserMenu}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                    slotProps={{
                      paper: {
                        elevation: 6,
                        sx: {
                          minWidth: 220,
                          mt: 1,
                          borderRadius: "12px",
                          border: "1px solid",
                          borderColor: "divider",
                          p: 0.5,
                          boxShadow: (theme) =>
                            theme.palette.mode === "dark"
                              ? "0 10px 25px rgba(0,0,0,0.6)"
                              : "0 10px 25px rgba(0,0,0,0.1)",
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {user.name || user.username}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                        @{user.username}
                      </Typography>
                      {user.role && user.role !== "user" && (
                        <Chip
                          label={user.role === "admin" ? "Administrador" : "Moderador"}
                          size="small"
                          color="primary"
                          sx={{ mt: 0.8, height: 20, fontSize: "0.68rem", fontWeight: 700 }}
                        />
                      )}
                    </Box>
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      component={RouterLink}
                      to="/favoritos"
                      onClick={handleCloseUserMenu}
                      sx={{ borderRadius: "8px", py: 1, gap: 1.5 }}
                    >
                      <FavoriteBorderIcon fontSize="small" sx={{ color: "text.secondary" }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Mis Favoritos
                      </Typography>
                    </MenuItem>
                    {(user.role === "admin" || user.role === "moderator") && (
                      <MenuItem
                        component={RouterLink}
                        to="/admin"
                        onClick={handleCloseUserMenu}
                        sx={{ borderRadius: "8px", py: 1, gap: 1.5 }}
                      >
                        <AdminPanelSettingsIcon fontSize="small" sx={{ color: "primary.main" }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Panel de Administración
                        </Typography>
                      </MenuItem>
                    )}
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      onClick={() => {
                        handleCloseUserMenu();
                        logout();
                      }}
                      sx={{ borderRadius: "8px", py: 1, gap: 1.5, color: "error.main" }}
                    >
                      <LogoutIcon fontSize="small" />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Cerrar Sesión
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box
                  sx={{
                    display: { xs: "none", sm: "flex" },
                    alignItems: "center",
                    gap: 1,
                    ml: 0.5,
                  }}
                >
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="text"
                    color="inherit"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.88rem",
                      px: 1.8,
                      borderRadius: "8px",
                      transition:
                        "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease",
                      "&:active": { transform: "scale(0.97)" },
                    }}
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
                      fontSize: "0.88rem",
                      px: 2,
                      borderRadius: "8px",
                      boxShadow: "0 2px 8px rgba(255, 111, 0, 0.28)",
                      transition:
                        "transform 140ms cubic-bezier(0.23, 1, 0.32, 1), background-color 140ms ease, box-shadow 140ms ease",
                      "@media (hover: hover) and (pointer: fine)": {
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(255, 111, 0, 0.38)",
                        },
                      },
                      "&:active": {
                        transform: "scale(0.97)",
                      },
                    }}
                  >
                    Registrarse
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>

        {/* ================================================================= */}
        {/* BUSCADOR MÓVIL DIRECTO (Accesible en pantalla pequeña sin abrir cajón) */}
        {/* ================================================================= */}
        <Box
          sx={{
            display: { xs: "block", md: "none" },
            px: 2,
            pb: 1.25,
            pt: 0.25,
          }}
        >
          <SearchContainer onSubmit={handleSearchSubmit}>
            <Box
              sx={{
                pl: 1.5,
                pr: 0.5,
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                pointerEvents: "none",
              }}
            >
              <SearchIcon sx={{ fontSize: "1.1rem" }} />
            </Box>
            <InputBase
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar instrumentos, piezas, marcas..."
              inputProps={{ "aria-label": "buscar en catálogo" }}
              sx={{
                flex: 1,
                color: "inherit",
                "& .MuiInputBase-input": {
                  py: 0.8,
                  px: 0.8,
                  fontSize: "1rem", // 16px para evitar zoom en iOS
                },
              }}
            />
            {searchTerm && (
              <IconButton
                size="small"
                onClick={handleClearSearch}
                aria-label="Limpiar búsqueda"
                sx={{ p: 0.5, mr: 0.5, color: "text.secondary" }}
              >
                <ClearIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            )}
            <Box sx={{ pr: 0.5, py: 0.4 }}>
              <IconButton
                type="submit"
                aria-label="Buscar"
                sx={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "#ffffff",
                  "&:active": { transform: "scale(0.92)" },
                }}
              >
                <SearchIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </Box>
          </SearchContainer>
        </Box>

        {/* ================================================================= */}
        {/* NIVEL 2 (Inferior): Categorías (MegaMenu) y Accesos de Catálogo   */}
        {/* ================================================================= */}
        <Box
          sx={{
            display: { xs: "none", md: "block" },
            borderTop: "1px solid",
            borderColor: (theme) => alpha(theme.palette.divider, 0.1),
          }}
        >
          <Container maxWidth="lg">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: 44,
                py: 0.4,
              }}
            >
              {/* Secciones de Categorías con despliegue de MegaMenu */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {NAVIGATION_SECTIONS.map((sec) => {
                  const isOpen = activeSection?.id === sec.id;

                  return (
                    <Button
                      key={sec.id}
                      onClick={() => handleSectionToggle(sec)}
                      color="inherit"
                      endIcon={
                        <KeyboardArrowDownIcon
                          sx={{
                            fontSize: "1.15rem",
                            transition: "transform 180ms cubic-bezier(0.23, 1, 0.32, 1)",
                            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                            color: isOpen ? "primary.main" : "text.secondary",
                          }}
                        />
                      }
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.88rem",
                        px: 1.7,
                        py: 0.65,
                        color: isOpen ? "primary.main" : "text.primary",
                        bgcolor: isOpen
                          ? (theme) =>
                              alpha(
                                theme.palette.primary.main,
                                theme.palette.mode === "dark" ? 0.14 : 0.08,
                              )
                          : "transparent",
                        borderRadius: "8px",
                        transition:
                          "background-color 140ms ease, color 140ms ease, transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
                        "@media (hover: hover) and (pointer: fine)": {
                          "&:hover": {
                            bgcolor: (theme) => alpha(theme.palette.action.hover, 0.8),
                            color: "primary.main",
                          },
                        },
                        "&:active": {
                          transform: "scale(0.97)",
                        },
                      }}
                    >
                      {sec.title}
                    </Button>
                  );
                })}
              </Box>

              {/* Accesos rápidos: Catálogo Completo y Ofertas */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Button
                  component={RouterLink}
                  to="/catalogo"
                  onClick={() => setActiveSection(null)}
                  startIcon={<StorefrontIcon sx={{ fontSize: "1.05rem !important", color: "text.secondary" }} />}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.86rem",
                    color: "text.secondary",
                    px: 1.5,
                    py: 0.6,
                    borderRadius: "8px",
                    transition:
                      "color 140ms ease, transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
                    "@media (hover: hover) and (pointer: fine)": {
                      "&:hover": {
                        color: "text.primary",
                        bgcolor: "transparent",
                      },
                    },
                    "&:active": {
                      transform: "scale(0.97)",
                    },
                  }}
                >
                  Catálogo Completo
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>
      </AppBar>

      {/* Mega Menú desplegable para Desktop (posicionado inmediatamente bajo el AppBar) */}
      <MegaMenu
        section={activeSection}
        onClose={() => setActiveSection(null)}
      />

      {/* Drawer Lateral para Dispositivos Móviles */}
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
        {/* Cabecera del Drawer */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "8px",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
              }}
            >
              <MusicNoteIcon sx={{ fontSize: "1.1rem" }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.15rem" }}>
              Solo<Box component="span" sx={{ color: "primary.main" }}>Tono</Box>
            </Typography>
          </Box>
          <IconButton
            onClick={() => setMobileDrawerOpen(false)}
            size="small"
            aria-label="cerrar menú"
            sx={{
              transition: "transform 140ms cubic-bezier(0.23, 1, 0.32, 1)",
              "&:active": { transform: "scale(0.9)" },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Sección de Sesión en el Drawer */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          {user ? (
            <>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                  mb: 0.5,
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  {user.name || user.username}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  @{user.username}
                </Typography>
                {user.role && user.role !== "user" && (
                  <Chip
                    label={user.role === "admin" ? "Admin" : "Moderador"}
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 18, fontSize: "0.62rem", fontWeight: 700 }}
                  />
                )}
              </Box>
              <Button
                component={RouterLink}
                to="/favoritos"
                variant="outlined"
                fullWidth
                startIcon={<FavoriteBorderIcon />}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{ borderRadius: "8px", fontWeight: 600 }}
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
                  startIcon={<AdminPanelSettingsIcon />}
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{ borderRadius: "8px", fontWeight: 600 }}
                >
                  Panel de Administración
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                fullWidth
                startIcon={<LogoutIcon />}
                onClick={() => {
                  logout();
                  setMobileDrawerOpen(false);
                }}
                sx={{ borderRadius: "8px", fontWeight: 600 }}
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
                startIcon={<FavoriteBorderIcon />}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{ borderRadius: "8px", fontWeight: 600 }}
              >
                Mis Favoritos
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={() => setMobileDrawerOpen(false)}
                sx={{ borderRadius: "8px", fontWeight: 600 }}
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
                sx={{ borderRadius: "8px", fontWeight: 700 }}
              >
                Crear Cuenta
              </Button>
            </>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Accesos directos a Catálogo y Ofertas en móvil */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, mb: 2 }}>
          <Button
            component={RouterLink}
            to="/catalogo"
            fullWidth
            startIcon={<StorefrontIcon />}
            onClick={() => setMobileDrawerOpen(false)}
            sx={{
              justifyContent: "flex-start",
              px: 1.5,
              py: 1,
              fontWeight: 600,
              fontSize: "0.92rem",
              borderRadius: 2,
            }}
          >
            Catálogo Completo
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Acordeón de Categorías del Catálogo */}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: "text.secondary",
            letterSpacing: "1px",
            textTransform: "uppercase",
            px: 1,
            mb: 1,
            display: "block",
          }}
        >
          Categorías
        </Typography>
        <List disablePadding>
          {NAVIGATION_SECTIONS.map((sec) => {
            const isExpanded = mobileExpandedSection === sec.id;

            return (
              <Box key={sec.id} sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() =>
                    setMobileExpandedSection(isExpanded ? null : sec.id)
                  }
                  sx={{ borderRadius: 2, py: 0.9 }}
                >
                  <ListItemText
                    primary={
                      <Typography sx={{ fontWeight: 700, fontSize: "0.93rem" }}>
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
                          sx={{ fontWeight: 800, color: "text.primary", display: "block", mb: 0.5 }}
                        >
                          {col.categoryName}
                        </Typography>
                        {col.items.map((item) => (
                          <ListItem key={item.title} disablePadding sx={{ py: 0.2 }}>
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
                        <ListItem disablePadding sx={{ py: 0.2 }}>
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
