import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Paper from "@mui/material/Paper";
import { keyframes, useTheme } from "@mui/material/styles";
import type { NavSection } from "../data/navigationData";
import drums from "../assets/decor/drums.png";
import electricGuitar from "../assets/decor/electric-guitar.png";
import vinyl from "../assets/decor/vinyl.png";

/* ------------------------------------------------------------------ */
/* Ilustración decorativa de la esquina inferior derecha de cada menú  */
/* ------------------------------------------------------------------ */

interface MenuDecor {
  src: string;
  rotate: number; // grados
  right: string;
  bottom: string;
  spin?: boolean; // true = gira lento (vinilo)
}

// La clave es el `id` de la sección en data/navigationData.ts.
// Para cambiar la imagen de una pestaña, cambia el `src`.
const MENU_DECOR: Record<string, MenuDecor> = {
  instrumentos: { src: drums, rotate: 0, right: "2%", bottom: "-8px" },
  "piezas-y-repuestos": { src: electricGuitar, rotate: -17, right: "0%", bottom: "12px" },
  "equipos-de-sonido": { src: vinyl, rotate: 0, right: "-2%", bottom: "-70px", spin: true },
};

// El ancho crece con el espacio libre a la derecha de las columnas
// (la grilla mide como máximo 1200px y va centrada) y se limita entre 110 y 230px.
const DECOR_WIDTH = "clamp(110px, calc((100vw - 1200px) / 2 + 150px), 230px)";

const spin = keyframes`
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0) rotate(var(--r)); }
  50%      { transform: translateY(-7px) rotate(calc(var(--r) + 2deg)); }
`;

interface Props {
  section: NavSection | null;
  onClose: () => void;
}

export const MegaMenu = ({ section, onClose }: Props) => {
  const navigate = useNavigate();
  const isDark = useTheme().palette.mode === "dark";

  if (!section) return null;

  const decor = MENU_DECOR[section.id];

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
          overflow: "hidden", // recorta la ilustración decorativa en los bordes
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
        {decor && (
          <Box
            component="img"
            src={decor.src}
            alt=""
            aria-hidden="true"
            draggable={false}
            sx={{
              "--r": `${decor.rotate}deg`,
              // El menú de escritorio aparece desde 900px (md); en pantallas más
              // angostas se muestra más pequeña y pegada a la esquina.
              display: { xs: "none", md: "block" },
              position: "absolute",
              right: decor.right,
              bottom: decor.bottom,
              width: DECOR_WIDTH,
              height: "auto",
              zIndex: 0,
              pointerEvents: "none",
              userSelect: "none",
              transform: "rotate(var(--r))",
              // Las ilustraciones son negras: en modo oscuro se invierten
              filter: isDark ? "invert(1)" : "none",
              opacity: isDark ? 0.8 : 0.9,
              animation: decor.spin
                ? `${spin} 30s linear infinite`
                : `${float} 8s ease-in-out infinite`,
              "@media (prefers-reduced-motion: reduce)": { animation: "none" },
            }}
          />
        )}

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
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
