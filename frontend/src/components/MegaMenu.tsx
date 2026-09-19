import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import type { NavSection } from "../data/navigationData";

interface Props {
  section: NavSection | null;
  onClose: () => void;
}

export const MegaMenu = ({ section, onClose }: Props) => {
  const navigate = useNavigate();

  if (!section) return null;

  const handleItemClick = (param: string) => {
    onClose();
    navigate(`/catalogo?q=${encodeURIComponent(param)}`);
  };

  const handleCategoryAllClick = (categoryName: string) => {
    onClose();
    navigate(`/catalogo?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Paper
        elevation={8}
        sx={{
          position: "absolute",
          top: "100%",
          left: 0,
          right: 0,
          zIndex: 1200,
          borderRadius: 0,
          borderBottom: "2px solid",
          borderColor: "primary.main",
          bgcolor: (theme) =>
            theme.palette.mode === "dark" ? "#12141c" : "#ffffff",
          py: 4,
          boxShadow: (theme) =>
            theme.palette.mode === "dark"
              ? "0 20px 30px rgba(0, 0, 0, 0.7)"
              : "0 20px 30px rgba(0, 0, 0, 0.12)",
          animation: "fadeInDown 0.18s ease-out",
          "@keyframes fadeInDown": {
            from: { opacity: 0, transform: "translateY(-6px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
        }}
      >
        <Container maxWidth="lg">
          {/* Título de la sección seleccionada */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 800,
                color: "primary.main",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Categorías en {section.title}
            </Typography>
          </Box>

          {/* Columnas estilo SoloTodo */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: `repeat(${section.columns.length}, 1fr)`,
              },
              gap: 3,
            }}
          >
            {section.columns.map((col) => (
              <Box key={col.categoryName} sx={{ minWidth: 160 }}>
                {/* Título de columna (Categoría) */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    color: "text.primary",
                    mb: 1.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    pb: 0.8,
                  }}
                >
                  {col.categoryName}
                </Typography>

                {/* Lista de tipos de instrumentos / partes */}
                <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
                  {col.items.map((item) => (
                    <Box component="li" key={item.title} sx={{ mb: 1 }}>
                      <Link
                        component="button"
                        type="button"
                        onClick={() => handleItemClick(item.queryParam)}
                        underline="none"
                        sx={{
                          color: "text.secondary",
                          fontSize: "0.86rem",
                          textAlign: "left",
                          fontWeight: 500,
                          transition: "color 0.15s ease",
                          "&:hover": {
                            color: "primary.main",
                          },
                        }}
                      >
                        {item.title}
                      </Link>
                    </Box>
                  ))}

                  {/* Enlace "Ver todos" naranja al fondo de cada columna */}
                  <Box component="li" sx={{ mt: 1.5 }}>
                    <Link
                      component="button"
                      type="button"
                      onClick={() => handleCategoryAllClick(col.allQueryParam)}
                      underline="hover"
                      sx={{
                        color: "primary.main",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        textAlign: "left",
                        display: "inline-block",
                      }}
                    >
                      Ver todos
                    </Link>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Container>
      </Paper>
    </ClickAwayListener>
  );
};
