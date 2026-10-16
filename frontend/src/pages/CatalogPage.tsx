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
import Pagination from "@mui/material/Pagination";
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
import BrandingWatermarkIcon from "@mui/icons-material/BrandingWatermark";
import LayersIcon from "@mui/icons-material/Layers";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import GridViewIcon from "@mui/icons-material/GridView";
import ViewListIcon from "@mui/icons-material/ViewList";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { productService } from "../services/products";
import type { Product } from "../types/product";
import { NAVIGATION_SECTIONS } from "../data/navigationData";
import { ProductCard } from "../components/ProductCard";

export const CatalogPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Estados de datos
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [stores, setStores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Estados de interacción local (Cambio de vista y Filtro reactivo de stock)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  // Por defecto, la vista del catálogo muestra SOLO productos con stock disponible
  const [onlyInStock, setOnlyInStock] = useState<boolean>(searchParams.get("in_stock") !== "false");

  // Valores de filtros sincronizados con URL Search Params
  const queryParam = searchParams.get("q") || "";
  const sectionParam = searchParams.get("section") || "Todas";
  const groupParam = searchParams.get("group") || "Todas";
  const categoryParam = searchParams.get("category") || "Todas";
  const brandParam = searchParams.get("brand") || "Todas";
  const storeParam = searchParams.get("store") || "Todas";
  const sortParam = searchParams.get("sort") || "price_asc";

  // Cargar categorías, marcas y tiendas disponibles
  useEffect(() => {
    Promise.all([
      productService.getCategories(),
      productService.getBrands(),
      productService.getStores(),
    ]).then(([cats, brs, sts]) => {
      setCategories(cats);
      setBrands(brs);
      setStores(sts);
    });
  }, []);

  // Cargar productos cada vez que cambien los parámetros
  useEffect(() => {
    let ignore = false;
    productService
      .getProducts({
        q: queryParam,
        section: sectionParam !== "Todas" ? sectionParam : undefined,
        group: groupParam !== "Todas" ? groupParam : undefined,
        category: categoryParam !== "Todas" ? categoryParam : undefined,
        brand: brandParam !== "Todas" ? brandParam : undefined,
        store: storeParam !== "Todas" ? storeParam : undefined,
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
  }, [queryParam, sectionParam, groupParam, categoryParam, brandParam, storeParam, sortParam]);

  // Paginación reactiva para grandes volúmenes de catálogo
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 24;

  // Opciones dinámicas según sección y grupo seleccionados
  const availableSections = useMemo(() => {
    return NAVIGATION_SECTIONS.map((s) => s.title);
  }, []);

  const availableGroups = useMemo(() => {
    if (sectionParam && sectionParam !== "Todas") {
      const sec = NAVIGATION_SECTIONS.find(
        (s) => s.title.toLowerCase() === sectionParam.toLowerCase() || s.id === sectionParam.toLowerCase(),
      );
      if (sec) {
        return sec.columns.map((c) => c.categoryName);
      }
    }
    const allGroups = new Set<string>();
    NAVIGATION_SECTIONS.forEach((s) => s.columns.forEach((c) => allGroups.add(c.categoryName)));
    return Array.from(allGroups);
  }, [sectionParam]);

  const availableCategories = useMemo(() => {
    if (groupParam && groupParam !== "Todas") {
      for (const sec of NAVIGATION_SECTIONS) {
        const col = sec.columns.find(
          (c) => c.categoryName.toLowerCase() === groupParam.toLowerCase() || c.groupSlug === groupParam.toLowerCase(),
        );
        if (col) {
          return col.items.map((i) => i.title);
        }
      }
    }
    if (sectionParam && sectionParam !== "Todas") {
      const sec = NAVIGATION_SECTIONS.find(
        (s) => s.title.toLowerCase() === sectionParam.toLowerCase() || s.id === sectionParam.toLowerCase(),
      );
      if (sec) {
        const catList: string[] = [];
        sec.columns.forEach((c) => c.items.forEach((i) => catList.push(i.title)));
        return catList;
      }
    }
    return categories.length > 0
      ? categories
      : Array.from(new Set(NAVIGATION_SECTIONS.flatMap((s) => s.columns.flatMap((c) => c.items.map((i) => i.title)))));
  }, [sectionParam, groupParam, categories]);

  // Manejadores de actualización de filtros en la URL
  const updateFilter = (key: string, value: string) => {
    setCurrentPage(1);
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

  const handleSectionChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === "Todas") {
      newParams.delete("section");
    } else {
      newParams.set("section", val);
    }
    newParams.delete("group");
    newParams.delete("category");
    setSearchParams(newParams);
  };

  const handleGroupChange = (e: SelectChangeEvent<string>) => {
    const val = e.target.value;
    setCurrentPage(1);
    const newParams = new URLSearchParams(searchParams);
    if (!val || val === "Todas") {
      newParams.delete("group");
    } else {
      newParams.set("group", val);
    }
    newParams.delete("category");
    setSearchParams(newParams);
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    updateFilter("category", e.target.value);
  };

  const handleBrandChange = (e: SelectChangeEvent<string>) => {
    updateFilter("brand", e.target.value);
  };

  const handleStoreChange = (e: SelectChangeEvent<string>) => {
    updateFilter("store", e.target.value);
  };

  const handleSortChange = (e: SelectChangeEvent<string>) => {
    updateFilter("sort", e.target.value);
  };

  const handleResetFilters = () => {
    setOnlyInStock(true);
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  // Filtrado reactivo en cliente con estado local (por defecto sólo productos en stock y con precio > 0)
  const displayedProducts = useMemo(() => {
    if (!onlyInStock) return products;
    return products.filter((p) => p.minPrice > 0 && p.offers.some((o) => o.inStock));
  }, [products, onlyInStock]);

  const totalPages = Math.max(1, Math.ceil(displayedProducts.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedProducts = useMemo(() => {
    const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
    return displayedProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [displayedProducts, safePage]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      queryParam ||
      (sectionParam && sectionParam !== "Todas") ||
      (groupParam && groupParam !== "Todas") ||
      (categoryParam && categoryParam !== "Todas") ||
      (brandParam && brandParam !== "Todas") ||
      (storeParam && storeParam !== "Todas") ||
      !onlyInStock
    );
  }, [queryParam, sectionParam, groupParam, categoryParam, brandParam, storeParam, onlyInStock]);

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "75vh" }}>
      {/* Encabezado del catálogo */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          Catálogo de Instrumentos Musicales
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Explora y compara ofertas entre las principales tiendas especializadas de Chile con clasificación exacta.
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

            <Stack spacing={2.5}>
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

              {/* Filtro por Sección */}
              <FormControl fullWidth size="small">
                <InputLabel id="section-filter-label">Sección</InputLabel>
                <Select
                  labelId="section-filter-label"
                  label="Sección"
                  value={sectionParam}
                  onChange={handleSectionChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <LayersIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Todas">Todas las secciones</MenuItem>
                  {availableSections.map((sec) => (
                    <MenuItem key={sec} value={sec}>
                      {sec}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro por Familia / Grupo */}
              <FormControl fullWidth size="small">
                <InputLabel id="group-filter-label">Familia / Grupo</InputLabel>
                <Select
                  labelId="group-filter-label"
                  label="Familia / Grupo"
                  value={groupParam}
                  onChange={handleGroupChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <AccountTreeIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Todas">Todas las familias</MenuItem>
                  {availableGroups.map((grp) => (
                    <MenuItem key={grp} value={grp}>
                      {grp}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Filtro por Categoría Canónica */}
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
                  {availableCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>
                      {cat}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Divider />

              {/* Filtro por Marca */}
              <FormControl fullWidth size="small">
                <InputLabel id="brand-filter-label">Marca</InputLabel>
                <Select
                  labelId="brand-filter-label"
                  label="Marca"
                  value={brandParam}
                  onChange={handleBrandChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <BrandingWatermarkIcon fontSize="small" sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="Todas">Todas las marcas</MenuItem>
                  {brands.map((br) => (
                    <MenuItem key={br} value={br}>
                      {br}
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

              <Divider />

              {/* Filtro interactivo con estado local: Solo en stock */}
              <FormControlLabel
                control={
                  <Switch
                    checked={onlyInStock}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setOnlyInStock(checked);
                      const newParams = new URLSearchParams(searchParams);
                      if (!checked) {
                        newParams.set("in_stock", "false");
                      } else {
                        newParams.delete("in_stock");
                      }
                      setSearchParams(newParams);
                    }}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                    <CheckCircleIcon fontSize="small" color={onlyInStock ? "primary" : "action"} />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Solo con stock
                    </Typography>
                  </Box>
                }
                sx={{ m: 0 }}
              />

              {/* Badges de filtros activos */}
              {hasActiveFilters && (
                <Box sx={{ pt: 1 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    Filtros aplicados:
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap", gap: 1 }}>
                    {!onlyInStock && (
                      <Chip
                        label="Incluye sin stock"
                        color="warning"
                        variant="outlined"
                        size="small"
                        onDelete={() => {
                          setOnlyInStock(true);
                          const newParams = new URLSearchParams(searchParams);
                          newParams.delete("in_stock");
                          setSearchParams(newParams);
                        }}
                      />
                    )}
                    {sectionParam !== "Todas" && (
                      <Chip
                        label={`Sección: ${sectionParam}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                        onDelete={() => updateFilter("section", "Todas")}
                      />
                    )}
                    {groupParam !== "Todas" && (
                      <Chip
                        label={`Familia: ${groupParam}`}
                        color="primary"
                        variant="outlined"
                        size="small"
                        onDelete={() => updateFilter("group", "Todas")}
                      />
                    )}
                    {categoryParam !== "Todas" && (
                      <Chip
                        label={categoryParam}
                        size="small"
                        onDelete={() => updateFilter("category", "Todas")}
                      />
                    )}
                    {brandParam !== "Todas" && (
                      <Chip
                        label={`Marca: ${brandParam}`}
                        size="small"
                        onDelete={() => updateFilter("brand", "Todas")}
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
              Mostrando{" "}
              <strong>
                {displayedProducts.length > 0
                  ? `${(currentPage - 1) * ITEMS_PER_PAGE + 1} - ${Math.min(
                      currentPage * ITEMS_PER_PAGE,
                      displayedProducts.length,
                    )}`
                  : 0}
              </strong>{" "}
              de {displayedProducts.length} instrumentos
              {totalPages > 1 && ` (Pág. ${currentPage}/${totalPages})`}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
              {/* Selector interactivo de vista Grid / List con estado local */}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, newMode: "grid" | "list" | null) => {
                  if (newMode) setViewMode(newMode);
                }}
                size="small"
                aria-label="modo de vista"
              >
                <ToggleButton value="grid" aria-label="vista en cuadrícula">
                  <GridViewIcon fontSize="small" />
                </ToggleButton>
                <ToggleButton value="list" aria-label="vista en lista">
                  <ViewListIcon fontSize="small" />
                </ToggleButton>
              </ToggleButtonGroup>

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
            </Box>
          </Paper>

          {/* Listado de Productos */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : displayedProducts.length === 0 ? (
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
            <>
              <Grid container spacing={3}>
                {paginatedProducts.map((product) => (
                  <Grid
                    key={product.id}
                    size={{
                      xs: 12,
                      sm: viewMode === "grid" ? 6 : 12,
                      md: viewMode === "grid" ? 4 : 12,
                    }}
                  >
                    <ProductCard product={product} />
                  </Grid>
                ))}
              </Grid>

              {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 5, mb: 2 }}>
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={(_, pageNum) => {
                      setCurrentPage(pageNum);
                    }}
                    color="primary"
                    shape="rounded"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};
