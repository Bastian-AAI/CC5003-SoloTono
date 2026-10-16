import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { productService } from "../services/products";
import type { FavoriteItem } from "../types/product";
import { formatPriceCLP } from "../utils/format";
import { getErrorMessage } from "../utils/errors";

export const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Estado local de edición de notas y precio objetivo por favorito
  const [notesDraft, setNotesDraft] = useState<Record<string, string>>({});
  const [targetPriceDraft, setTargetPriceDraft] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    productService
      .getFavorites()
      .then((data) => {
        if (!ignore) {
          setFavorites(data);
          const initialNotes: Record<string, string> = {};
          const initialPrices: Record<string, string> = {};
          data.forEach((fav) => {
            initialNotes[fav.id] = fav.notes || "";
            initialPrices[fav.id] = fav.targetPrice ? String(fav.targetPrice) : "";
          });
          setNotesDraft(initialNotes);
          setTargetPriceDraft(initialPrices);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(getErrorMessage(err));
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  const handleSaveFavorite = async (favId: string) => {
    setSavingId(favId);
    setError(null);
    setSuccessMsg(null);
    try {
      const rawPrice = targetPriceDraft[favId]?.trim();
      const parsedPrice = rawPrice ? Number(rawPrice) : null;
      const updated = await productService.updateFavorite(favId, {
        notes: notesDraft[favId] ?? "",
        targetPrice: parsedPrice && !isNaN(parsedPrice) && parsedPrice > 0 ? parsedPrice : null,
      });
      setFavorites((prev) => prev.map((f) => (f.id === favId ? updated : f)));
      setSuccessMsg("Preferencias de seguimiento actualizadas.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setSavingId(null);
    }
  };

  const handleRemoveFavorite = async (favId: string) => {
    setError(null);
    setSuccessMsg(null);
    try {
      await productService.removeFavorite(favId);
      setFavorites((prev) => prev.filter((f) => f.id !== favId));
      setSuccessMsg("Instrumento eliminado de tu lista de favoritos.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "75vh" }}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <FavoriteIcon color="primary" fontSize="large" />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Mis Instrumentos Favoritos
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Guarda los instrumentos que estás cotizando, define un precio objetivo y haz seguimiento de sus ofertas en tiempo real.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : favorites.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{ p: 6, textAlign: "center", borderRadius: 3, borderColor: "divider" }}
        >
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
            Aún no tienes instrumentos en favoritos
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Explora el catálogo y agrega instrumentos a tu lista personal para comparar precios y configurar alertas.
          </Typography>
          <Button
            component={RouterLink}
            to="/catalogo"
            variant="contained"
            color="primary"
            endIcon={<ArrowForwardIcon />}
          >
            Explorar Catálogo
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {favorites.map((fav) => {
            const product = fav.product;
            if (!product) return null;

            const inStockCount = product.offers.filter((o) => o.inStock).length;
            const reachedTarget =
              fav.targetPrice !== null &&
              product.minPrice > 0 &&
              inStockCount > 0 &&
              product.minPrice <= fav.targetPrice;

            return (
              <Grid key={fav.id} size={{ xs: 12, md: 6 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    borderColor: reachedTarget ? "success.main" : "divider",
                  }}
                >
                  <Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <Box
                        component="img"
                        src={product.imageUrl || "/placeholder-instrument.svg"}
                        alt={product.name}
                        sx={{
                          width: 96,
                          height: 96,
                          objectFit: "contain",
                          bgcolor: "#ffffff",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          p: 1,
                          flexShrink: 0,
                        }}
                      />
                      <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                          <Chip label={product.brand} size="small" variant="outlined" />
                          <Chip label={product.category} size="small" />
                          {reachedTarget && (
                            <Chip
                              icon={<NotificationsActiveIcon />}
                              label="Precio objetivo alcanzado"
                              color="success"
                              size="small"
                            />
                          )}
                        </Box>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 800, lineHeight: 1.25, mb: 0.5 }}
                        >
                          {product.name}
                        </Typography>
                        <Typography variant="h6" color="primary.main" sx={{ fontWeight: 900 }}>
                          {inStockCount > 0 && product.minPrice > 0
                            ? formatPriceCLP(product.minPrice)
                            : "Sin stock disponible"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.offers.length} tiendas ({inStockCount} con stock)
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: 1.5 }} />

                    <Grid container spacing={1.5} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          label="Precio objetivo (CLP)"
                          type="number"
                          size="small"
                          fullWidth
                          value={targetPriceDraft[fav.id] ?? ""}
                          onChange={(e) =>
                            setTargetPriceDraft((prev) => ({ ...prev, [fav.id]: e.target.value }))
                          }
                          placeholder="Ej: 450000"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 7 }}>
                        <TextField
                          label="Nota personal"
                          size="small"
                          fullWidth
                          value={notesDraft[fav.id] ?? ""}
                          onChange={(e) =>
                            setNotesDraft((prev) => ({ ...prev, [fav.id]: e.target.value }))
                          }
                          placeholder="Ej: Comparar con modelo japonés"
                        />
                      </Grid>
                    </Grid>
                  </Box>

                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SaveOutlinedIcon />}
                        disabled={savingId === fav.id}
                        onClick={() => handleSaveFavorite(fav.id)}
                      >
                        Guardar nota
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        variant="text"
                        startIcon={<DeleteOutlineIcon />}
                        onClick={() => handleRemoveFavorite(fav.id)}
                      >
                        Quitar
                      </Button>
                    </Box>
                    <Button
                      size="small"
                      variant="contained"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => navigate(`/producto/${product.id}`)}
                    >
                      Ver ficha
                    </Button>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};
