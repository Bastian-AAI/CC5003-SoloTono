import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 5,
        mt: "auto",
        // Fondo coherente con la paleta Studio Slate
        backgroundColor: (theme) =>
          theme.palette.mode === "dark" ? "#060911" : "#edf2f7",
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MusicNoteIcon sx={{ color: "primary.main" }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              SoloTono
            </Typography>
            <Typography variant="body2" color="text.secondary">
              - Comparador de precios de instrumentos musicales en Chile
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary">
            Proyecto desarrollado para <strong>CC5003 - Aplicaciones Web Reactivas</strong>
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={3}
          sx={{
            justifyContent: "center",
            mt: 3,
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Link href="https://github.com" target="_blank" color="text.secondary" underline="hover" variant="caption">
            GitHub
          </Link>
          <Link href="/catalogo" color="text.secondary" underline="hover" variant="caption">
            Catálogo
          </Link>
          <Typography variant="caption" color="text.secondary">
            © {new Date().getFullYear()} SoloTono. Inspirado en SoloTodo.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
};
