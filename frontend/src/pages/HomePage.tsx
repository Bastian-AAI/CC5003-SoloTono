import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import SearchIcon from "@mui/icons-material/Search";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SavingsIcon from "@mui/icons-material/Savings";
import VerifiedIcon from "@mui/icons-material/Verified";
import { productService } from "../services/products";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

const CATEGORIES = [
  { name: "Guitarras", icon: "🎸", desc: "Eléctricas, acústicas y clásicas" },
  { name: "Bajos", icon: "🎻", desc: "4 y 5 cuerdas, pasivos y activos" },
  { name: "Teclados y Pianos", icon: "🎹", desc: "Sintetizadores y pianos digitales" },
  { name: "Baterías y Percusión", icon: "🥁", desc: "Acústicas y electrónicas" },
  { name: "Audio y Grabación", icon: "🎙️", desc: "Micrófonos e interfaces" },
];

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    productService
      .getProducts()
      .then((products) => {
        // Tomamos los primeros 6 para destacados
        setFeaturedProducts(products.slice(0, 6));
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogo?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/catalogo");
    }
  };

  return (
    <Box sx={{ pb: 8 }}>
      {/* Hero Section */}
      <Box
        sx={{
          py: { xs: 8, md: 12 },
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(circle at 50% 20%, rgba(255, 111, 0, 0.15) 0%, rgba(15, 17, 23, 1) 70%)"
              : "radial-gradient(circle at 50% 20%, rgba(255, 111, 0, 0.08) 0%, rgba(248, 250, 252, 1) 70%)",
          textAlign: "center",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="overline"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              letterSpacing: 2,
              display: "inline-block",
              mb: 1,
            }}
          >
            SOLOTODO PARA MÚSICOS
          </Typography>

          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.2rem", sm: "3.2rem", md: "3.8rem" },
              lineHeight: 1.15,
              mb: 2.5,
            }}
          >
            Compara precios de instrumentos musicales en{" "}
            <span style={{ color: "#ff6f00" }}>Chile</span>
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 400,
              maxWidth: 680,
              mx: "auto",
              mb: 4,
              fontSize: { xs: "1rem", sm: "1.15rem" },
            }}
          >
            Encuentra tu guitarra, bajo, piano o equipo de audio al menor precio.
            Monitoreamos tiendas como Audiomusica, Casa Amarilla, Promusic y Overdrive.
          </Typography>

          {/* Formulario de Búsqueda Hero */}
          <Paper
            component="form"
            onSubmit={handleSearchSubmit}
            elevation={4}
            sx={{
              p: "4px 8px",
              display: "flex",
              alignItems: "center",
              maxWidth: 620,
              mx: "auto",
              borderRadius: 30,
              border: "1px solid",
              borderColor: "primary.main",
            }}
          >
            <IconButton sx={{ p: "10px", color: "text.secondary" }} aria-label="buscar">
              <SearchIcon />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: "1.05rem" }}
              placeholder="¿Qué instrumento estás buscando? Ej: Fender Stratocaster"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                borderRadius: 25,
                px: 3,
                py: 1,
                fontWeight: 700,
              }}
            >
              Buscar
            </Button>
          </Paper>

          {/* Categorías Rápidas */}
          <Stack
            direction="row"
            spacing={1}
            sx={{
              justifyContent: "center",
              flexWrap: "wrap",
              mt: 3,
              gap: 1,
            }}
          >
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.name}
                component={RouterLink}
                to={`/catalogo?category=${encodeURIComponent(cat.name)}`}
                variant="outlined"
                size="small"
                sx={{
                  borderRadius: 20,
                  borderColor: "divider",
                  color: "text.secondary",
                  fontSize: "0.8rem",
                  "&:hover": {
                    borderColor: "primary.main",
                    color: "primary.main",
                  },
                }}
              >
                {cat.icon} {cat.name}
              </Button>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Grid de Categorías Principales */}
      <Container maxWidth="lg" sx={{ mt: 6 }}>
        <Box sx={{ mb: 4, textAlign: { xs: "center", sm: "left" } }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
            Explorar por Categoría
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selecciona una categoría para ver los instrumentos disponibles y comparar tiendas.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {CATEGORIES.map((cat) => (
            <Grid key={cat.name} size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Card
                variant="outlined"
                sx={{
                  height: "100%",
                  textAlign: "center",
                  borderColor: "divider",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <CardActionArea
                  component={RouterLink}
                  to={`/catalogo?category=${encodeURIComponent(cat.name)}`}
                  sx={{ p: 2.5, height: "100%" }}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Typography variant="h3" sx={{ mb: 1.5 }}>
                      {cat.icon}
                    </Typography>
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 700 }}>
                      {cat.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                      {cat.desc}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Sección Destacados */}
      <Container maxWidth="lg" sx={{ mt: 8 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mb: 4,
          }}
        >
          <Box>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 800 }}>
              Instrumentos Destacados
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Las mejores alternativas y los instrumentos más buscados en tiendas nacionales.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/catalogo"
            endIcon={<ArrowForwardIcon />}
            sx={{ fontWeight: 700 }}
          >
            Ver catálogo completo
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
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

      {/* Valor agregado de SoloTono */}
      <Container maxWidth="lg" sx={{ mt: 10 }}>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: "rgba(255, 111, 0, 0.12)",
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CompareArrowsIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Comparación en Tiempo Real
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Compara lado a lado los precios de distintas tiendas de música en un solo lugar.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: "rgba(0, 176, 255, 0.12)",
                    color: "secondary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <SavingsIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Precios Efectivo y Tarjetas
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Visualiza el descuento por transferencia bancaria frente al precio normal en cuotas.
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: "rgba(76, 175, 80, 0.12)",
                    color: "success.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <VerifiedIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Stock Verificado
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Evita sorpresas filtrando directamente las tiendas que cuentan con unidades disponibles.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};
