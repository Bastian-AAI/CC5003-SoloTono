import { useEffect, useState, type FormEvent } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import IconButton from "@mui/material/IconButton";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/Add";
import { productService } from "../services/products";
import type { Product, StoreDetail, CategoryDetail } from "../types/product";
import type { User, Role } from "../types";
import { formatPriceCLP } from "../utils/format";
import { getErrorMessage } from "../utils/errors";

export const AdminPage = () => {
  const [tab, setTab] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Datos de las entidades
  const [products, setProducts] = useState<Product[]>([]);
  const [stores, setStores] = useState<StoreDetail[]>([]);
  const [categories, setCategories] = useState<CategoryDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // Estado formulario de Producto
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodName, setProdName] = useState("");
  const [prodBrand, setProdBrand] = useState("");
  const [prodCategory, setProdCategory] = useState("Guitarras Eléctricas");
  const [prodImage, setProdImage] = useState("");
  const [prodDesc, setProdDesc] = useState("");

  // Estado formulario de Tienda
  const [editingStoreId, setEditingStoreId] = useState<string | null>(null);
  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [storeEngine, setStoreEngine] = useState("Shopify");
  const [storeActive, setStoreActive] = useState(true);

  // Estado formulario de Categoría
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [catName, setCatName] = useState("");
  const [catOrdering, setCatOrdering] = useState("0");

  useEffect(() => {
    let ignore = false;
    Promise.all([
      productService.getProducts(),
      productService.getDetailedStores(),
      productService.getDetailedCategories(),
      productService.getUsers(),
    ])
      .then(([prods, sts, cats, usrs]) => {
        if (!ignore) {
          setProducts(prods);
          setStores(sts);
          setCategories(cats);
          setUsers(usrs);
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

  // --- Acciones CRUD de Productos ---
  const resetProductForm = () => {
    setEditingProductId(null);
    setProdName("");
    setProdBrand("");
    setProdCategory("Guitarras Eléctricas");
    setProdImage("");
    setProdDesc("");
  };

  const handleProductSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingProductId) {
        const updated = await productService.updateProduct(editingProductId, {
          name: prodName,
          brand: prodBrand,
          category: prodCategory,
          imageUrl: prodImage,
          description: prodDesc,
        });
        setProducts((prev) => prev.map((p) => (p.id === editingProductId ? updated : p)));
        setSuccess("Producto actualizado correctamente.");
      } else {
        const created = await productService.createProduct({
          name: prodName,
          brand: prodBrand,
          category: prodCategory,
          imageUrl: prodImage || "/placeholder-instrument.svg",
          description: prodDesc,
        });
        setProducts((prev) => [created, ...prev]);
        setSuccess("Producto creado correctamente.");
      }
      resetProductForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setProdName(p.name);
    setProdBrand(p.brand);
    setProdCategory(p.category);
    setProdImage(p.imageUrl);
    setProdDesc(p.description);
  };

  const handleDeleteProduct = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await productService.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setSuccess("Producto eliminado correctamente.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  // --- Acciones CRUD de Tiendas ---
  const resetStoreForm = () => {
    setEditingStoreId(null);
    setStoreName("");
    setStoreUrl("");
    setStoreEngine("Shopify");
    setStoreActive(true);
  };

  const handleStoreSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      if (editingStoreId) {
        const updated = await productService.updateStore(editingStoreId, {
          name: storeName,
          websiteUrl: storeUrl,
          engineType: storeEngine,
          isActive: storeActive,
        });
        setStores((prev) => prev.map((s) => (s.id === editingStoreId ? updated : s)));
        setSuccess("Tienda actualizada correctamente.");
      } else {
        const created = await productService.createStore({
          name: storeName,
          websiteUrl: storeUrl,
          engineType: storeEngine,
          isActive: storeActive,
        });
        setStores((prev) => [...prev, created]);
        setSuccess("Tienda creada correctamente.");
      }
      resetStoreForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleEditStore = (s: StoreDetail) => {
    setEditingStoreId(s.id);
    setStoreName(s.name);
    setStoreUrl(s.websiteUrl);
    setStoreEngine(s.engineType);
    setStoreActive(s.isActive);
  };

  const handleDeleteStore = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await productService.deleteStore(id);
      setStores((prev) => prev.filter((s) => s.id !== id));
      setSuccess("Tienda eliminada correctamente.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  // --- Acciones CRUD de Categorías ---
  const resetCategoryForm = () => {
    setEditingCategoryId(null);
    setCatName("");
    setCatOrdering("0");
  };

  const handleCategorySubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const numericOrder = Number(catOrdering) || 0;
      if (editingCategoryId) {
        const updated = await productService.updateCategory(editingCategoryId, {
          name: catName,
          ordering: numericOrder,
        });
        setCategories((prev) => prev.map((c) => (c.id === editingCategoryId ? updated : c)));
        setSuccess("Categoría actualizada correctamente.");
      } else {
        const created = await productService.createCategory({
          name: catName,
          ordering: numericOrder,
        });
        setCategories((prev) => [...prev, created]);
        setSuccess("Categoría creada correctamente.");
      }
      resetCategoryForm();
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    setError(null);
    setSuccess(null);
    try {
      await productService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setSuccess("Categoría eliminada correctamente.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  // --- Acciones CRUD de Usuarios ---
  const handleRoleChange = async (userId: string, newRole: Role) => {
    setError(null);
    setSuccess(null);
    try {
      const updated = await productService.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setSuccess(`Rol de ${updated.username} actualizado a ${updated.role}.`);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    setError(null);
    setSuccess(null);
    try {
      await productService.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setSuccess("Usuario eliminado correctamente.");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, minHeight: "75vh" }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          <AdminPanelSettingsIcon color="primary" fontSize="large" />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 800 }}>
            Panel de Administración
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Gestión centralizada de productos canónicos, tiendas monitoreadas, categorías y permisos de usuarios.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_e, newVal: number) => setTab(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab label={`Productos (${products.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Tiendas (${stores.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Categorías (${categories.length})`} sx={{ fontWeight: 700 }} />
          <Tab label={`Usuarios (${users.length})`} sx={{ fontWeight: 700 }} />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : (
            <>
              {/* TAB 0: PRODUCTOS */}
              {tab === 0 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    {editingProductId ? "Editar Producto" : "Crear Nuevo Producto"}
                  </Typography>
                  <Box component="form" onSubmit={handleProductSubmit} sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12, sm: 5 }}>
                        <TextField
                          label="Nombre del instrumento"
                          size="small"
                          fullWidth
                          required
                          value={prodName}
                          onChange={(e) => setProdName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label="Marca"
                          size="small"
                          fullWidth
                          required
                          value={prodBrand}
                          onChange={(e) => setProdBrand(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Categoría"
                          size="small"
                          fullWidth
                          required
                          value={prodCategory}
                          onChange={(e) => setProdCategory(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="URL de Imagen"
                          size="small"
                          fullWidth
                          value={prodImage}
                          onChange={(e) => setProdImage(e.target.value)}
                          placeholder="/images/products/fender-player-strat.jpg"
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Descripción"
                          size="small"
                          fullWidth
                          value={prodDesc}
                          onChange={(e) => setProdDesc(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                          <Button
                            type="submit"
                            variant="contained"
                            startIcon={<AddCircleOutlineIcon />}
                          >
                            {editingProductId ? "Guardar Cambios" : "Crear Producto"}
                          </Button>
                          {editingProductId && (
                            <Button variant="outlined" onClick={resetProductForm}>
                              Cancelar
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer>
                    <Table size="small" sx={{ minWidth: 620 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Marca</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Categoría</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Mejor Precio</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {products.slice(0, 50).map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell>{p.id}</TableCell>
                            <TableCell>{p.brand}</TableCell>
                            <TableCell>{p.name}</TableCell>
                            <TableCell>
                              <Chip label={p.category} size="small" />
                            </TableCell>
                            <TableCell>
                              {p.minPrice > 0 ? formatPriceCLP(p.minPrice) : "Sin stock"}
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                aria-label={`Editar producto ${p.name}`}
                                onClick={() => handleEditProduct(p)}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                aria-label={`Eliminar producto ${p.name}`}
                                onClick={() => handleDeleteProduct(p.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* TAB 1: TIENDAS */}
              {tab === 1 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    {editingStoreId ? "Editar Tienda" : "Registrar Nueva Tienda"}
                  </Typography>
                  <Box component="form" onSubmit={handleStoreSubmit} sx={{ mb: 4 }}>
                    <Grid container spacing={2} sx={{ alignItems: "center" }}>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label="Nombre de Tienda"
                          size="small"
                          fullWidth
                          required
                          value={storeName}
                          onChange={(e) => setStoreName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                          label="Sitio Web (URL)"
                          size="small"
                          fullWidth
                          required
                          value={storeUrl}
                          onChange={(e) => setStoreUrl(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label="Plataforma E-Commerce"
                          size="small"
                          fullWidth
                          value={storeEngine}
                          onChange={(e) => setStoreEngine(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={storeActive}
                              onChange={(e) => setStoreActive(e.target.checked)}
                            />
                          }
                          label="Activa"
                        />
                      </Grid>
                      <Grid size={{ xs: 12 }}>
                        <Box sx={{ display: "flex", gap: 1.5 }}>
                          <Button type="submit" variant="contained">
                            {editingStoreId ? "Guardar Tienda" : "Agregar Tienda"}
                          </Button>
                          {editingStoreId && (
                            <Button variant="outlined" onClick={resetStoreForm}>
                              Cancelar
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer>
                    <Table size="small" sx={{ minWidth: 580 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Plataforma</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Estado</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stores.map((s) => (
                          <TableRow key={s.id} hover>
                            <TableCell>{s.id}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{s.name}</TableCell>
                            <TableCell>{s.slug}</TableCell>
                            <TableCell>{s.engineType}</TableCell>
                            <TableCell>
                              <Chip
                                label={s.isActive ? "Activa" : "Inactiva"}
                                color={s.isActive ? "success" : "default"}
                                size="small"
                              />
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                aria-label={`Editar tienda ${s.name}`}
                                onClick={() => handleEditStore(s)}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                aria-label={`Eliminar tienda ${s.name}`}
                                onClick={() => handleDeleteStore(s.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* TAB 2: CATEGORÍAS */}
              {tab === 2 && (
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    {editingCategoryId ? "Editar Categoría" : "Nueva Categoría"}
                  </Typography>
                  <Box component="form" onSubmit={handleCategorySubmit} sx={{ mb: 4 }}>
                    <Grid container spacing={2} sx={{ alignItems: "center" }}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          label="Nombre de Categoría"
                          size="small"
                          fullWidth
                          required
                          value={catName}
                          onChange={(e) => setCatName(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                          label="Orden"
                          type="number"
                          size="small"
                          fullWidth
                          value={catOrdering}
                          onChange={(e) => setCatOrdering(e.target.value)}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 3 }}>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button type="submit" variant="contained" fullWidth>
                            {editingCategoryId ? "Actualizar" : "Crear"}
                          </Button>
                          {editingCategoryId && (
                            <Button variant="outlined" onClick={resetCategoryForm}>
                              Cancelar
                            </Button>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer>
                    <Table size="small" sx={{ minWidth: 500 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Slug</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Orden</TableCell>
                          <TableCell sx={{ fontWeight: 700 }} align="right">
                            Acciones
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {categories.map((c) => (
                          <TableRow key={c.id} hover>
                            <TableCell>{c.id}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{c.name}</TableCell>
                            <TableCell>{c.slug}</TableCell>
                            <TableCell>{c.ordering}</TableCell>
                            <TableCell align="right">
                              <IconButton
                                size="small"
                                color="primary"
                                aria-label={`Editar categoría ${c.name}`}
                                onClick={() => {
                                  setEditingCategoryId(c.id);
                                  setCatName(c.name);
                                  setCatOrdering(String(c.ordering));
                                }}
                              >
                                <EditOutlinedIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                aria-label={`Eliminar categoría ${c.name}`}
                                onClick={() => handleDeleteCategory(c.id)}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {/* TAB 3: USUARIOS */}
              {tab === 3 && (
                <TableContainer>
                  <Table size="small" sx={{ minWidth: 550 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Usuario</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Nombre</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Rol</TableCell>
                        <TableCell sx={{ fontWeight: 700 }} align="right">
                          Acciones
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id} hover>
                          <TableCell>{u.id}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{u.username}</TableCell>
                          <TableCell>{u.name}</TableCell>
                          <TableCell>
                            <Select
                              size="small"
                              value={u.role}
                              inputProps={{ "aria-label": `Rol para usuario ${u.username}` }}
                              onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                              sx={{ minWidth: 130, fontSize: "0.85rem" }}
                            >
                              <MenuItem value="user">user</MenuItem>
                              <MenuItem value="admin">admin</MenuItem>
                              <MenuItem value="moderator">moderator</MenuItem>
                            </Select>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              aria-label={`Eliminar usuario ${u.username}`}
                              disabled={u.username === "admin"}
                              onClick={() => handleDeleteUser(u.id)}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Container>
  );
};
