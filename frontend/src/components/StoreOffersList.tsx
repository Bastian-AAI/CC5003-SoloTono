import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import StarIcon from "@mui/icons-material/Star";
import type { StoreOffer } from "../types/product";
import { formatPriceCLP } from "../utils/format";

interface Props {
  offers: StoreOffer[];
}

/**
 * Lista compacta de ofertas por tienda (estilo SoloTodo).
 * Cada oferta es una tarjeta clickeable que lleva a la tienda.
 * Reemplaza a StoreOffersTable en la ficha de producto, porque una tabla
 * de 5 columnas no cabe en la columna lateral.
 */
export const StoreOffersList = ({ offers }: Props) => {
  // Ordenar por precio efectivo de menor a mayor
  const sortedOffers = [...offers].sort((a, b) => a.priceCash - b.priceCash);

  // La mejor oferta es la más barata que tenga stock
  const bestOfferId = sortedOffers.find((o) => o.inStock)?.id;

  return (
    <Box component="section" aria-labelledby="offers-heading">
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          id="offers-heading"
          variant="subtitle1"
          component="h2"
          sx={{ fontWeight: 800 }}
        >
          Ofertas por tienda
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {offers.length} {offers.length === 1 ? "tienda" : "tiendas"}
        </Typography>
      </Box>

      {offers.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 2, textAlign: "center", borderRadius: "10px" }}>
          <Typography variant="body2" color="text.secondary">
            No hay ofertas registradas actualmente para este instrumento.
          </Typography>
        </Paper>
      ) : (
        <Box
          sx={{
            display: "grid",
            gap: 1,
            // En pantallas medianas (lista debajo de la ficha) usa 2 columnas
            // para aprovechar el ancho; en la columna lateral queda en 1.
            gridTemplateColumns: {
              xs: "minmax(0, 1fr)",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "minmax(0, 1fr)",
            },
          }}
        >
          {sortedOffers.map((offer) => {
            const isBest = offer.id === bestOfferId;

            return (
              <Paper
                key={offer.id}
                variant="outlined"
                sx={(theme) => ({
                  borderRadius: "10px",
                  overflow: "hidden",
                  borderColor: isBest ? "primary.main" : "divider",
                  bgcolor: isBest
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "background.paper",
                  opacity: offer.inStock ? 1 : 0.7,
                })}
              >
                <ButtonBase
                  component="a"
                  href={offer.inStock ? offer.productUrl : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  disabled={!offer.inStock}
                  aria-label={
                    offer.inStock
                      ? `Ir a ${offer.storeName} (se abre en una pestaña nueva)`
                      : `${offer.storeName}: sin stock`
                  }
                  sx={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    px: 1.5,
                    py: 1.25,
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {/* Fila superior: tienda, badge y stock */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 0.75,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        noWrap
                        sx={{ fontWeight: 800, color: "primary.main" }}
                      >
                        {offer.storeName}
                      </Typography>
                      {isBest && (
                        <Chip
                          icon={<StarIcon sx={{ fontSize: "12px !important" }} />}
                          label="Mejor precio"
                          size="small"
                          color="primary"
                          sx={{
                            height: 20,
                            fontSize: "0.68rem",
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.4,
                          color: offer.inStock ? "success.main" : "error.main",
                        }}
                      >
                        {offer.inStock ? (
                          <CheckCircleIcon sx={{ fontSize: 14 }} />
                        ) : (
                          <CancelIcon sx={{ fontSize: 14 }} />
                        )}
                        <Typography variant="caption" sx={{ fontWeight: 600, color: "inherit" }}>
                          {offer.inStock ? "En stock" : "Agotado"}
                        </Typography>
                      </Box>
                      {offer.inStock && (
                        <OpenInNewIcon sx={{ fontSize: 15, color: "text.secondary" }} />
                      )}
                    </Box>
                  </Box>

                  {/* Precios: efectivo | normal */}
                  <Box sx={{ display: "flex", gap: 1.5 }}>
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", lineHeight: 1.2 }}
                      >
                        Efectivo / transf.
                      </Typography>
                      <Typography
                        component="div"
                        sx={{
                          fontSize: "1.1rem",
                          fontWeight: 800,
                          lineHeight: 1.3,
                          color: isBest ? "primary.main" : "text.primary",
                        }}
                      >
                        {formatPriceCLP(offer.priceCash)}
                      </Typography>
                    </Box>

                    <Divider orientation="vertical" flexItem />

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", lineHeight: 1.2 }}
                      >
                        Normal / tarjeta
                      </Typography>
                      <Typography
                        component="div"
                        sx={{
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          lineHeight: 1.3,
                          color: "text.secondary",
                        }}
                      >
                        {formatPriceCLP(offer.priceNormal)}
                      </Typography>
                    </Box>
                  </Box>
                </ButtonBase>
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
};
