import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import type { Product } from "../types/product";
import { formatPriceCLP } from "../utils/format";

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleGoToDetail = () => {
    navigate(`/producto/${product.id}`);
  };

  const inStockStoresCount = product.offers.filter((o) => o.inStock).length;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onClick={handleGoToDetail}
    >
      {/* Imagen del producto */}
      <Box sx={{ position: "relative", pt: "70%", backgroundColor: "action.hover" }}>
        <CardMedia
          component="img"
          image={imgError ? "/placeholder-instrument.svg" : product.imageUrl}
          alt={product.name}
          onError={() => setImgError(true)}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "contain",
            p: 1.5,
            bgcolor: "#ffffff",
          }}
        />
        <Chip
          label={product.category}
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            fontWeight: 600,
            fontSize: "0.7rem",
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            color: "#ffffff",
            backdropFilter: "blur(6px)",
          }}
        />
      </Box>

      {/* Contenido */}
      <CardContent sx={{ flexGrow: 1, pb: 1 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: "1px", display: "block" }}
        >
          {product.brand}
        </Typography>

        <Typography
          variant="subtitle1"
          component="h3"
          sx={{
            fontWeight: 700,
            lineHeight: 1.3,
            minHeight: "2.6em",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1.5,
          }}
        >
          {product.name}
        </Typography>

        {/* Info de precios y tiendas */}
        <Box sx={{ mt: "auto" }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
            Desde
          </Typography>
          <Typography
            variant="h5"
            component="div"
            sx={{
              fontWeight: 800,
              color: "primary.main",
              letterSpacing: "-0.5px",
            }}
          >
            {formatPriceCLP(product.minPrice)}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 1 }}>
            <StorefrontIcon fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
            <Typography variant="caption" color="text.secondary">
              {product.offers.length} {product.offers.length === 1 ? "tienda" : "tiendas"}
              {inStockStoresCount > 0 ? ` (${inStockStoresCount} con stock)` : " (sin stock)"}
            </Typography>
          </Box>
        </Box>
      </CardContent>

      {/* Acciones */}
      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          fullWidth
          variant="outlined"
          color="primary"
          endIcon={<ArrowForwardIcon />}
          onClick={(e) => {
            e.stopPropagation();
            handleGoToDetail();
          }}
          sx={{
            fontWeight: 700,
            fontSize: "0.85rem",
          }}
        >
          Ver ofertas
        </Button>
      </CardActions>
    </Card>
  );
};
