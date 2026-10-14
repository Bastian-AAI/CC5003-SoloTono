import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Box from "@mui/material/Box";
import { ThemeModeProvider } from "./context/ThemeModeContext";
import { getNotebookBackground } from "./theme";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { CatalogPage } from "./pages/CatalogPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { LoginPage, RegisterPage } from './pages/AuthPages'
import { AuthProvider } from './context/AuthProvider'
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";

const ScrollManager = () => {
  const location = useLocation();

  useEffect(() => {
    const storageKey = `solotono-scroll:${location.key}`;
    const saved = sessionStorage.getItem(storageKey);
    if (saved !== null) {
      window.scrollTo(0, Number(saved));
    } else {
      window.scrollTo(0, 0);
    }
  }, [location.key]);

  useEffect(() => {
    const storageKey = `solotono-scroll:${location.key}`;
    const onScroll = () => {
      sessionStorage.setItem(storageKey, String(window.scrollY));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [location.key]);

  return null;
};

function App() {
  return (
    <ThemeModeProvider>
      <AuthProvider>
      <BrowserRouter>
        <ScrollManager />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            minHeight: "100vh",
            bgcolor: "background.default",
            color: "text.primary",
          }}
        >
          <Navbar />

          <Box
            component="main"
            sx={(theme) => ({
              flexGrow: 1,
              ...getNotebookBackground(theme.palette.mode),
            })}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/catalogo"
                element={
                  <ProtectedRoute>
                    <CatalogPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/producto/:id"
                element={
                  <ProtectedRoute>
                    <ProductDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
              <Route
                path="/login"
                element={
                  <PublicOnlyRoute>
                    <LoginPage />
                  </PublicOnlyRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicOnlyRoute>
                    <RegisterPage />
                  </PublicOnlyRoute>
                }
              />
            </Routes>
          </Box>

          <Footer />
        </Box>
      </BrowserRouter>
      </AuthProvider>
    </ThemeModeProvider>
  );
}

export default App;
