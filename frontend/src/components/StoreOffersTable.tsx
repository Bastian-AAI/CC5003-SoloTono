import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import StarIcon from "@mui/icons-material/Star";
import type { StoreOffer } from "../types/product";
import { formatPriceCLP } from "../utils/format";

interface Props {
  offers: StoreOffer[];
}

export const StoreOffersTable = ({ offers }: Props) => {
  // Ordenar ofertas por precio efectivo de menor a mayor
  const sortedOffers = [...offers].sort((a, b) => a.priceCash - b.priceCash);

  // Encontrar el precio más bajo en stock
  const bestOfferId = sortedOffers.find((o) => o.inStock)?.id;

  if (offers.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }} variant="outlined">
        <Typography color="text.secondary">
          No hay ofertas registradas actualmente para este instrumento.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Table sx={{ minWidth: 620 }} aria-label="tabla comparativa de precios">
        <TableHead sx={{ backgroundColor: "action.hover" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }}>Tienda</TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">
              Precio Efectivo / Transferencia
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="right">
              Precio Normal / Tarjeta
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Disponibilidad
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }} align="center">
              Ir a la tienda
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedOffers.map((offer) => {
            const isBest = offer.id === bestOfferId;

            return (
              <TableRow
                key={offer.id}
                sx={{
                  backgroundColor: isBest ? "action.selected" : "inherit",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                {/* Nombre de tienda y badge si es mejor precio */}
                <TableCell component="th" scope="row">
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                      {offer.storeName}
                    </Typography>
                    {isBest && (
                      <Chip
                        icon={<StarIcon sx={{ fontSize: "14px !important" }} />}
                        label="Mejor Precio"
                        size="small"
                        color="primary"
                        sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                      />
                    )}
                  </Box>
                </TableCell>

                {/* Precio Efectivo */}
                <TableCell align="right">
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 800,
                      color: isBest ? "primary.main" : "text.primary",
                    }}
                  >
                    {formatPriceCLP(offer.priceCash)}
                  </Typography>
                </TableCell>

                {/* Precio Normal */}
                <TableCell align="right">
                  <Typography variant="body2" color="text.secondary">
                    {formatPriceCLP(offer.priceNormal)}
                  </Typography>
                </TableCell>

                {/* Disponibilidad / Stock */}
                <TableCell align="center">
                  {offer.inStock ? (
                    <Chip
                      icon={<CheckCircleIcon sx={{ fontSize: "14px !important" }} />}
                      label="En Stock"
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 24, fontSize: "0.75rem" }}
                    />
                  ) : (
                    <Chip
                      icon={<CancelIcon sx={{ fontSize: "14px !important" }} />}
                      label="Agotado"
                      size="small"
                      color="error"
                      variant="outlined"
                      sx={{ fontWeight: 600, height: 24, fontSize: "0.75rem" }}
                    />
                  )}
                </TableCell>

                {/* Botón Ir a la Tienda */}
                <TableCell align="center">
                  <Button
                    variant={isBest ? "contained" : "outlined"}
                    color="primary"
                    size="small"
                    href={offer.productUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewIcon />}
                    disabled={!offer.inStock}
                    sx={{
                      fontSize: "0.8rem",
                      py: 0.6,
                      px: 1.5,
                      fontWeight: 700,
                    }}
                  >
                    {offer.inStock ? "Ir a la tienda" : "Sin stock"}
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
