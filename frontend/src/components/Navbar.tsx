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
import { alpha, styled } from "@mui/material/styles";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import SearchIcon from "@mui/icons-material/Search";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useThemeMode } from "../context/themeContext";

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
  maxWidth: 320,
  display: "flex",
  alignItems: "center",
  border: `1px solid ${alpha(theme.palette.divider, 0.2)}`,
  [theme.breakpoints.down("sm")]: {
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
    fontSize: "0.9rem",
  },
}));

export const Navbar = () => {
  const { mode, toggleColorMode } = useThemeMode();
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/catalogo");
    }
  };

  return (
    <AppBar position="sticky">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: "space-between", py: 1 }}>
          {/* Logo & Brand */}
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              color: "text.primary",
              gap: 1,
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "10px",
                background: "linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                boxShadow: "0 4px 10px rgba(255, 111, 0, 0.35)",
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
                Solo<span style={{ color: "#ff6f00" }}>Tono</span>
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

                Comparador Musical
              </Typography>
            </Box>
          </Box>

          {/* Buscador de barra rápida */}
          <SearchBox onSubmit={handleSearchSubmit}>
            <SearchIconWrapper>
              <SearchIcon fontSize="small" />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Buscar guitarra, bajo, piano..."
              inputProps={{ "aria-label": "buscar instrumentos" }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </SearchBox>

          {/* Links y Switch Modo */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              component={RouterLink}
              to="/"
              color="inherit"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Inicio
            </Button>
            <Button
              component={RouterLink}
              to="/catalogo"
              variant="text"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              Catálogo
            </Button>

            <Tooltip title={`Cambiar a modo ${mode === "dark" ? "claro" : "oscuro"}`}>
              <IconButton
                onClick={toggleColorMode}
                color="inherit"
                sx={{ ml: 1 }}
                aria-label="alternar modo de color"
              >
                {mode === "dark" ? (
                  <Brightness7Icon sx={{ color: "#ffb74d" }} />
                ) : (
                  <Brightness4Icon sx={{ color: "#5c6bc0" }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};
