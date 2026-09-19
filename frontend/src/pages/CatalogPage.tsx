import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import type { SelectChangeEvent } from "@mui/material/Select";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import StorefrontIcon from "@mui/icons-material/Storefront";
import CategoryIcon from "@mui/icons-material/Category";
import { productService } from "../services/products";
import type { Product } from "../types/product";
import { ProductCard } from "../components/ProductCard";

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de datos
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Valores de filtros sincronizados con URL Search Params
  const queryParam = searchParams.get("q") || "";
  const categoryParam = searchParams.get("category") || "Todas";
  const storeParam = searchParams.get("store") || "Todas";
  const sortParam = searchParams.get("sort") || "price_asc";

  // Cargar categorías y tiendas disponibles una vez
  useEffect(() => {
    Promise.all([productService.getCategories(), productService.getStores()]).then(
      ([cats, sts]) => {
        setCategories(cats);
        setStores(sts);
      }
    );
  }, []);

  // Cargar productos cada vez que cambien los parámetros
  useEffect(() => {
    let ignore = false;
    productService
      .getProducts({
        q: queryParam,
        category: categoryParam,
        store: storeParam,
        sort: sortParam,
      })
      .then((data) => {
        if (!ignore) {
          setProducts(data);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [queryParam, categoryParam, storeParam, sortParam]);

  // Manejadores de actualización de filtros en la URL
  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (!value || value === "Todas") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFilter("q", e.target.value);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    updateFilter("category", e.target.value);
  };

  const handleStoreChange = (e: SelectChangeEvent<string>) => {
    updateFilter("store", e.target.value);
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    updateFilter("sort", e.target.value);
  };

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = useMemo(() => {
    return Boolean(queryParam || (categoryParam && categoryParam !== "Todas") || (storeParam && storeParam !== "Todas"));
  }, [queryParam, categoryParam, storeParam]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "75vh" }}>
      {/* Encabezado del catálogo */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          Catálogo de Instrumentos Musicales
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explora y compara ofertas entre las principales tiendas especializadas de Chile.
        </Typography>
      </Box>

      {/* Grid Principal: Filtros laterales + Listado de Productos */}
      <Grid container spacing={3}>
        {/* Columna de Filtros */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              borderColor: "divider",
              position: { md: "sticky" },
              top: { md: 90 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2.5,
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Filtros
              </Typography>
              {hasActiveFilters && (
                <Button
                  size="small"
                  startIcon={<FilterAltOffIcon />}
                  onClick={handleResetFilters}
                  color="inherit"
                  sx={{ fontSize: "0.75rem", p: 0.5 }}
                >
                  Limpiar
                </Button>
              )}
            </Box>

            <Stack spacing={3}>
              {/* Búsqueda por texto */}
              <TextField
                label="Búsqueda libre"
                size="small"
                fullWidth
                placeholder="Marca, modelo..."
                value={queryParam}
                onChange={handleSearchChange}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Divider />

              {/* Filtro por Categoría */}
              <FormControl fullWidth size="small">
                <InputLabel id="category-filter-label">Categoría</InputLabel>
                <Select
                  labelId="category-filter-label"
                  label="Categoría"
                  value={categoryParam}
                  onChange={handleCategoryChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Todas">Todas las categorías</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro por Tienda */}
              <FormControl fullWidth size="small">
                <InputLabel id="store-filter-label">Tienda</InputLabel>
                <Select
                  labelId="store-filter-label"
                  label="Tienda"
                  value={storeParam}
                  onChange={handleStoreChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <StorefrontIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Todas">Todas las tiendas</MenuItem>
                  {stores.map((store) => (
                    <MenuItem key={store} value={store}>
                      {store}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Badges de filtros activos */}
              {hasActiveFilters && (
                <Box sx={{ pt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Filtros aplicados:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    {categoryParam !== "Todas" && (
                      <Chip
                        label={categoryParam}
                        size="small"
                        onDelete={() => updateFilter("category", "Todas")}
                      />
                    )}
                    {storeParam !== "Todas" && (
                      <Chip
                        label={`Tienda: ${storeParam}`}
                        size="small"
                        onDelete={() => updateFilter("store", "Todas")}
                      />
                    )}
                    {queryParam && (
                      <Chip
                        label={`"${queryParam}"`}
                        size="small"
                        onDelete={() => updateFilter("q", "")}
                      />
                    )}
                  </Stack>
                </Box>
              )}
            </Stack>
          </Paper>
        </Grid>

        {/* Columna de Resultados */}
        <Grid size={{ xs: 12, md: 9 }}>
          {/* Barra superior de resultados y ordenamiento */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 3,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary">
              Mostrando <strong>{products.length}</strong> instrumentos
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="caption" color="text.secondary">
                Ordenar por:
              </Typography>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <Select value={sortParam} onChange={handleSortChange}>
                  <MenuItem value="price_asc">Menor precio primero</MenuItem>
                  <MenuItem value="price_desc">Mayor precio primero</MenuItem>
                  <MenuItem value="name_asc">Nombre (A-Z)</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Paper>

          {/* Listado de Productos */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : products.length === 0 ? (
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
                No se encontraron instrumentos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Intenta modificar o limpiar los filtros seleccionados para ver más resultados.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleResetFilters}
                startIcon={<FilterAltOffIcon />}
              >
                Limpiar todos los filtros
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid key={product.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <ProductCard product={product} />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
