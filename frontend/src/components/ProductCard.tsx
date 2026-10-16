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
import FavoriteIcon from "@mui/icons-material/Favorite";
import type { Product } from "../types/product";
import { formatPriceCLP } from "../utils/format";

interface Props {
  product: Product;
  variant?: "grid" | "list";
}

export const ProductCard = ({ product, variant = "grid" }: Props) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleGoToDetail = () => {
    navigate(`/producto/${product.id}`);
  };

  const inStockStoresCount = product.offers.filter((o) => o.inStock).length;
  const isList = variant === "list";

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`Ver ofertas de ${product.name}`}
      onClick={handleGoToDetail}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleGoToDetail();
        }
      }}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: isList ? { xs: "column", sm: "row" } : "column",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        borderRadius: "14px",
        transition:
          "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 220ms cubic-bezier(0.16, 1, 0.3, 1), border-color 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        "@media (hover: hover) and (pointer: fine)": {
          "&:hover": {
            transform: isList ? "translateY(-2px)" : "translateY(-4px)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 12px 28px -6px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 107, 0, 0.25)"
                : "0 12px 28px -6px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 107, 0, 0.2)",
            borderColor: "primary.main",
            "& .card-action-btn": {
              backgroundColor: "primary.main",
              color: "#ffffff",
            },
          },
        },
        "&:active": {
          transform: "scale(0.985)",
        },
        "&:focus-visible": {
          outline: (theme) => `2px solid ${theme.palette.primary.main}`,
          outlineOffset: "2px",
        },
      }}
    >
      {/* Imagen del producto con fondo blanco estricto para imágenes extraídas */}
      <Box
        sx={{
          position: "relative",
          width: isList ? { xs: "100%", sm: 220 } : "100%",
          minWidth: isList ? { sm: 220 } : "auto",
          pt: isList ? { xs: "65%", sm: 0 } : "70%",
          height: isList ? { sm: "auto" } : undefined,
          bgcolor: "#ffffff",
          borderBottom: isList ? { xs: "1px solid", sm: "none" } : "1px solid",
          borderRight: isList ? { sm: "1px solid" } : "none",
          borderColor: "divider",
          flexShrink: 0,
        }}
      >
        <CardMedia
          component="img"
          image={imgError ? "/placeholder-instrument.svg" : product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
          sx={{
            position: isList ? { xs: "absolute", sm: "static" } : "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: isList ? { sm: 190 } : "100%",
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
            zIndex: 1,
          }}
        />
        {(inStockStoresCount === 0 || product.minPrice <= 0) && (
          <Chip
            label="Agotado"
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              right: 10,
              fontWeight: 700,
              fontSize: "0.7rem",
              backgroundColor: "rgba(211, 47, 47, 0.85)",
              color: "#ffffff",
              backdropFilter: "blur(6px)",
              zIndex: 1,
            }}
          />
        )}
        {product.favoritesCount !== undefined && product.favoritesCount > 0 && (
          <Chip
            icon={<FavoriteIcon sx={{ fontSize: "12px !important", color: "#ff4d6d" }} />}
            label={`${product.favoritesCount}`}
            size="small"
            title={`${product.favoritesCount} favoritos en SoloTono`}
            sx={{
              position: "absolute",
              bottom: 8,
              right: 8,
              fontWeight: 700,
              fontSize: "0.72rem",
              height: 22,
              backgroundColor: "rgba(17, 24, 39, 0.8)",
              color: "#ffffff",
              backdropFilter: "blur(6px)",
              zIndex: 1,
              "& .MuiChip-icon": {
                ml: "4px",
                mr: "-4px",
              },
            }}
          />
        )}
      </Box>

      {/* Contenido */}
      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 2,
          pb: isList ? 2 : 1,
        }}
      >
        <Box>
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
              minHeight: isList ? "auto" : "2.6em",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              mb: 1.5,
            }}
          >
            {product.name}
          </Typography>
        </Box>

        {/* Info de precios y tiendas */}
        <Box
          sx={{
            mt: isList ? 1.5 : "auto",
            display: isList ? { sm: "flex" } : "block",
            alignItems: isList ? { sm: "flex-end" } : undefined,
            justifyContent: isList ? { sm: "space-between" } : undefined,
            gap: isList ? 2 : 0,
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
              {inStockStoresCount > 0 && product.minPrice > 0 ? "Desde" : "Disponibilidad"}
            </Typography>
            <Typography
              variant="h5"
              component="div"
              sx={{
                fontWeight: 800,
                color: inStockStoresCount > 0 && product.minPrice > 0 ? "primary.main" : "text.secondary",
                letterSpacing: "-0.5px",
                fontSize: inStockStoresCount > 0 && product.minPrice > 0 ? "1.45rem" : "1.1rem",
              }}
            >
              {inStockStoresCount > 0 && product.minPrice > 0 ? formatPriceCLP(product.minPrice) : "Sin stock disponible"}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8, mt: 0.75 }}>
              <StorefrontIcon fontSize="small" sx={{ color: "text.secondary", fontSize: 16 }} />
              <Typography variant="caption" color="text.secondary">
                {product.offers.length} {product.offers.length === 1 ? "tienda" : "tiendas"}
                {inStockStoresCount > 0 ? ` (${inStockStoresCount} con stock)` : " (agotado)"}
              </Typography>
            </Box>
          </Box>

          {isList && (
            <Button
              className="card-action-btn"
              variant="outlined"
              color="primary"
              endIcon={<ArrowForwardIcon />}
              tabIndex={-1}
              aria-hidden="true"
              onClick={(e) => {
                e.stopPropagation();
                handleGoToDetail();
              }}
              sx={{
                mt: { xs: 2, sm: 0 },
                fontWeight: 700,
                fontSize: "0.85rem",
                borderRadius: "8px",
                transition: "all 180ms ease",
              }}
            >
              Ver ofertas
            </Button>
          )}
        </Box>
      </CardContent>

      {/* Acciones para vista Grid */}
      {!isList && (
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button
            className="card-action-btn"
            fullWidth
            variant="outlined"
            color="primary"
            endIcon={<ArrowForwardIcon />}
            tabIndex={-1}
            aria-hidden="true"
            onClick={(e) => {
              e.stopPropagation();
              handleGoToDetail();
            }}
            sx={{
              fontWeight: 700,
              fontSize: "0.85rem",
              borderRadius: "8px",
              transition: "all 180ms ease",
            }}
          >
            Ver ofertas
          </Button>
        </CardActions>
      )}
    </Card>
  );
};
