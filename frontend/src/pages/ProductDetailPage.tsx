import { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { productService } from "../services/products";
import type { Product } from "../types/product";
import { StoreOffersTable } from "../components/StoreOffersTable";
import { formatPriceCLP } from "../utils/format";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let ignore = false;

    productService
      .getProductById(id)
      .then((data) => {
        if (!ignore) {
          setProduct(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error(err);
          setError("No se pudo cargar el instrumento o no existe.");
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 10, textAlign: "center", minHeight: "70vh" }}>
        <CircularProgress color="primary" />
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 8, minHeight: "70vh" }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || "Instrumento no encontrado"}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          variant="contained"
          onClick={() => navigate("/catalogo")}
        >
          Volver al Catálogo
        </Button>
      </Container>
    );
  }

  const inStockStores = product.offers.filter((o) => o.inStock);

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "80vh" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link component={RouterLink} to="/" underline="hover" color="inherit">
          Inicio
        </Link>
        <Link component={RouterLink} to="/catalogo" underline="hover" color="inherit">
          Catálogo
        </Link>
        <Link
          component={RouterLink}
          to={`/catalogo?category=${encodeURIComponent(product.category)}`}
          underline="hover"
          color="inherit"
        >
          {product.category}
        </Link>
        <Typography color="text.primary" sx={{ fontWeight: 600 }}>
          {product.name}
        </Typography>
      </Breadcrumbs>

      {/* Botón Volver */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3, color: "text.secondary" }}
        size="small"
      >
        Volver
      </Button>

      {/* Ficha Principal del Instrumento */}
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          borderColor: "divider",
          mb: 5,
        }}
      >
        <Grid container spacing={5} sx={{ alignItems: "center" }}>
          {/* Imagen del Instrumento */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Box
              sx={{
                width: "100%",
                height: 380,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "action.hover",
                position: "relative",
              }}
            >
              <Box
                component="img"
                src={product.imageUrl}
                alt={product.name}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/placeholder-instrument.svg";
                }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  p: 2,
                  bgcolor: "#ffffff",
                }}
              />
            </Box>
          </Grid>

          {/* Información y Precio Mínimo */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
              <Chip
                label={product.brand}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ fontWeight: 700 }}
              />
              <Chip label={product.category} size="small" />
            </Stack>

            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                lineHeight: 1.2,
                mb: 2,
              }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 3, lineHeight: 1.6 }}
            >
              {product.description}
            </Typography>

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? "rgba(255, 111, 0, 0.06)"
                    : "rgba(255, 111, 0, 0.04)",
                borderColor: "primary.main",
              }}
            >
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                Mejor precio encontrado
              </Typography>
              <Typography
                variant="h3"
                component="div"
                sx={{
                  fontWeight: 900,
                  color: "primary.main",
                  letterSpacing: "-1px",
                  my: 0.5,
                }}
              >
                {formatPriceCLP(product.minPrice)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <StorefrontIcon fontSize="small" sx={{ color: "text.secondary" }} />
                <Typography variant="body2" color="text.secondary">
                  Disponible en {product.offers.length} tiendas (
                  <strong>{inStockStores.length} con stock inmediato</strong>)
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Sección Comparativa de Precios por Tienda */}
      <Box sx={{ mb: 6 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 800 }}>
            Comparativa de Ofertas por Tienda
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Compara precios de contado/transferencia frente a pagos con tarjetas y revisa la
            disponibilidad de stock antes de comprar.
          </Typography>
        </Box>

        {/* Tabla de tiendas */}
        <StoreOffersTable offers={product.offers} />
      </Box>
    </Container>
  );
};
