import { useEffect, useState } from "react";
import { useParams, Link as RouterLink, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { alpha } from "@mui/material/styles";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { productService } from "../services/products";
import type { Product } from "../types/product";
import { StoreOffersList } from "../components/StoreOffersList";
import { formatPriceCLP } from "../utils/format";

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setImgError(false);
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

  // Características que se muestran como lista "etiqueta: valor" (como en SoloTodo)
  const specs: { label: string; value: string }[] = [
    { label: "Marca", value: product.brand },
    { label: "Categoría", value: product.category },
    ...(product.section ? [{ label: "Sección", value: product.section }] : []),
    ...(product.subCategory
      ? [{ label: "Subcategoría", value: product.subCategory }]
      : []),
  ];

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 1.5, md: 2 }, px: { xs: 1.5, sm: 2, md: 3 } }}
    >
      {/* Volver + Breadcrumbs en una sola fila para ahorrar altura */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1.5 }}>
        <IconButton
          aria-label="Volver"
          size="small"
          onClick={() => navigate(-1)}
          sx={{ color: "text.secondary" }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ fontSize: "0.85rem", minWidth: 0 }}
        >
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
          <Typography
            color="text.primary"
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: "inherit",
              maxWidth: { xs: 140, sm: 320, md: 480 },
            }}
          >
            {product.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/*
        Grilla principal. Se reorganiza según el ancho de la ventana:
          lg+  : [ imagen | nombre + mejor precio | ofertas ]
                 [ imagen | descripción + caract. | ofertas ]
          md   : [ imagen | descripción + caract. | ofertas ]
                 [ nombre + mejor precio (2 cols) | ofertas ]
          sm   : [ imagen | nombre + mejor precio ]
                 [ imagen | descripción + caract. ]
                 [ ofertas (2 columnas)            ]
          xs   : una sola columna
      */}
      <Box
        sx={{
          display: "grid",
          alignItems: "start",
          columnGap: { xs: 1.5, md: 2.5 },
          rowGap: { xs: 1.5, md: 2, lg: 1.5 },
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "minmax(160px, 220px) minmax(0, 1fr)",
            md: "220px minmax(0, 1fr) 340px",
            lg: "280px minmax(0, 1fr) 380px",
          },
          // La fila "1fr" absorbe el espacio sobrante para que el contenido
          // quede pegado arriba y no se separe cuando la imagen es más alta.
          gridTemplateRows: {
            sm: "auto 1fr auto",
            md: "auto 1fr",
            lg: "auto 1fr",
          },
          gridTemplateAreas: {
            xs: '"image" "title" "desc" "offers"',
            sm: '"image title" "image desc" "offers offers"',
            md: '"image desc offers" "title title offers"',
            lg: '"image title offers" "image desc offers"',
          },
        }}
      >
        {/* Imagen del instrumento */}
        <Box
          sx={{
            gridArea: "image",
            width: "100%",
            aspectRatio: { xs: "16 / 10", sm: "1 / 1" },
            maxHeight: { xs: 220, sm: "none" },
            borderRadius: "12px",
            overflow: "hidden",
            bgcolor: "#ffffff",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box
            component="img"
            src={imgError ? "/placeholder-instrument.svg" : product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            sx={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "contain",
              p: 1.5,
            }}
          />
        </Box>

        {/* Nombre y mejor precio */}
        <Box sx={{ gridArea: "title", minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              lineHeight: 1.2,
              fontSize: { xs: "1.3rem", md: "1.55rem" },
              mb: 1,
            }}
          >
            {product.name}
          </Typography>

          {/* Mejor precio, compacto */}
          <Paper
            variant="outlined"
            sx={(theme) => ({
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              columnGap: 2,
              rowGap: 0.25,
              px: 1.5,
              py: 1,
              borderRadius: "10px",
              borderColor: "primary.main",
              // Tinte naranja sobre fondo sólido, para que no se vea la cuadrícula detrás
              bgcolor: "background.paper",
              backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.07)}, ${alpha(theme.palette.primary.main, 0.07)})`,
            })}
          >
            <Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: "block", lineHeight: 1.2 }}
              >
                Mejor precio encontrado
              </Typography>
              <Typography
                component="div"
                sx={{
                  fontSize: { xs: "1.6rem", md: "1.9rem" },
                  fontWeight: 900,
                  lineHeight: 1.2,
                  color: "primary.main",
                  letterSpacing: "-0.5px",
                }}
              >
                {formatPriceCLP(product.minPrice)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
              <StorefrontIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                En {product.offers.length} tiendas (
                <strong>{inStockStores.length} con stock</strong>)
              </Typography>
            </Box>
          </Paper>

        </Box>

        {/* Descripción y características */}
        <Box sx={{ gridArea: "desc", minWidth: 0 }}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 1.5, lineHeight: 1.55 }}
          >
            {product.description}
          </Typography>

          {/* Características */}
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{ fontWeight: 800, color: "primary.main", mb: 0.5 }}
          >
            Características
          </Typography>
          <Box
            component="dl"
            sx={{
              display: "grid",
              gridTemplateColumns: "max-content minmax(0, 1fr)",
              columnGap: 1.5,
              rowGap: 0.5,
              m: 0,
            }}
          >
            {specs.map((spec) => (
              <Box key={spec.label} sx={{ display: "contents" }}>
                <Typography
                  component="dt"
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontWeight: 700 }}
                >
                  {spec.label}
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0 }}>
                  {spec.value}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Ofertas por tienda: queda junto a la imagen, sin tener que scrollear */}
        <Box
          sx={{
            gridArea: "offers",
            minWidth: 0,
            // En md+ el panel queda fijo a la vista y scrollea por dentro
            // si hay muchas tiendas.
            position: { md: "sticky" },
            top: { md: 16 },
            maxHeight: { md: "calc(100vh - 32px)" },
            overflowY: { md: "auto" },
          }}
        >
          <StoreOffersList offers={product.offers} />
        </Box>
      </Box>
    </Container>
  );
};
