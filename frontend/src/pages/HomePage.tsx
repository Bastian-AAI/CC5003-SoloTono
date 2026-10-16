import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Paper from "@mui/material/Paper";
import { productService } from "../services/products";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    productService
      .getProducts()
      .then((products) => {
        if (!ignore) {
          // Mostramos los primeros 6 para la sección de destacados
          setFeaturedProducts(products.slice(0, 6));
          setLoading(false);
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 5, minHeight: "75vh" }}>
      {/* Encabezado limpio de Instrumentos Destacados */}
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
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 800, letterSpacing: "-0.5px" }}
          >
            Instrumentos Destacados
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Compara precios de las alternativas más cotizadas en las tiendas de música de Chile.
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to="/catalogo"
          variant="outlined"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          sx={{ fontWeight: 700 }}
        >
          Ver todo el catálogo
        </Button>
      </Box>

      {/* Grid de Productos Destacados */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
          <CircularProgress color="primary" />
        </Box>
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
            No se pudieron cargar los instrumentos destacados
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
