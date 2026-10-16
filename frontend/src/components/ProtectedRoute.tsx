import { type ReactNode } from "react";
import { Navigate, useLocation, Link as RouterLink } from "react-router-dom";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 12, minHeight: "65vh" }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  // Si no hay sesión activa, redirige a /login recordando la ruta solicitada
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Si la ruta requiere rol de administrador, valida el rol del usuario autenticado
  if (requireAdmin && user.role !== "admin" && user.role !== "moderator") {
    return (
      <Container maxWidth="sm" sx={{ py: 8, minHeight: "65vh" }}>
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
          <LockOutlinedIcon color="error" sx={{ fontSize: 48, mb: 1.5 }} />
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
            Acceso Restringido
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Esta sección requiere permisos de administrador para gestionar el catálogo y las entidades del sistema.
          </Typography>
          <Button component={RouterLink} to="/catalogo" variant="contained" color="primary">
            Volver al Catálogo
          </Button>
        </Paper>
      </Container>
    );
  }

  return <>{children}</>;
};
