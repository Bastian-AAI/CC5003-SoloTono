import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
            variant="overline"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              letterSpacing: 1.5,
              display: "block",
              lineHeight: 1,
              mb: 0.5,
            }}
          >
            MEJORES OFERTAS
          </Typography>
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
