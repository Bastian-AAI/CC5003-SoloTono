import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { productService } from "../services/products";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    productService
      .getTopFavorited(9)
      .then((products) => {
        if (!ignore) {
          setFeaturedProducts(products);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Error al cargar los instrumentos destacados:", err);
          setError("No se pudieron cargar los instrumentos destacados.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, minHeight: "75vh" }}>
      {/* Cabecera limpia y elegante de Instrumentos Destacados */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "flex-end" },
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          mb: 4,
          borderBottom: "1px solid",
          borderColor: "divider",
          pb: 2.5,
        }}
      >
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Chip
              icon={<FavoriteIcon sx={{ fontSize: "14px !important", color: "#ff4d6d" }} />}
              label="Top 9 Más Guardados"
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.74rem",
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                border: "1px solid",
                borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
              }}
            />
          </Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 800, letterSpacing: "-0.5px", fontSize: { xs: "1.75rem", md: "2.1rem" } }}
          >
            Instrumentos Destacados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 650 }}>
            Los 9 instrumentos más guardados por la comunidad de músicos en Chile con stock disponible y comparación de precios en tiempo real.
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to="/catalogo"
          variant="outlined"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 700, flexShrink: 0 }}
        >
          Ver todo el catálogo
        </Button>
      </Box>

      {/* Grid de los 9 Productos con más Favoritos */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      ) : featuredProducts.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 3,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            No se encontraron instrumentos destacados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Puedes explorar directamente el catálogo completo para ver todas las ofertas disponibles.
          </Typography>
          <Button
            component={RouterLink}
            to="/catalogo"
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
          >
            Ir al Catálogo
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {featuredProducts.map((product) => (
            <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <ProductCard product={product} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};
