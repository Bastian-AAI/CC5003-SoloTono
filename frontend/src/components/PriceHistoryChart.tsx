import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import Tooltip from "@mui/material/Tooltip";
import { alpha, useTheme } from "@mui/material/styles";
import type { PriceHistoryPoint } from "../types/product";
import { formatPriceCLP } from "../utils/format";

interface Props {
  history: PriceHistoryPoint[];
}

const STORE_PALETTE = [
  "#2563eb", // Azul
  "#d97706", // Ámbar
  "#16a34a", // Verde
  "#dc2626", // Rojo
  "#9333ea", // Morado
  "#0891b2", // Cian
  "#ea580c", // Naranja
  "#4f46e5", // Índigo
];

export const PriceHistoryChart = ({ history }: Props) => {
  const theme = useTheme();
  const [priceType, setPriceType] = useState<"cash" | "normal">("cash");
  const [selectedStore, setSelectedStore] = useState<string | null>(null);

  // Agrupar tiendas únicas
  const stores = useMemo(() => {
    return Array.from(new Set(history.map((h) => h.storeName)));
  }, [history]);

  // Asignar colores a cada tienda
  const storeColorMap = useMemo(() => {
    const map = new Map<string, string>();
    stores.forEach((store, idx) => {
      map.set(store, STORE_PALETTE[idx % STORE_PALETTE.length]);
    });
    return map;
  }, [stores]);

  // Filtrar y ordenar puntos cronológicamente
  const sortedPoints = useMemo(() => {
    const filtered = selectedStore
      ? history.filter((h) => h.storeName === selectedStore)
      : history;
    return [...filtered].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  }, [history, selectedStore]);

  // Calcular mínimos y máximos para la escala del gráfico
  const { minPrice, maxPrice, timeExtent } = useMemo(() => {
    if (sortedPoints.length === 0) {
      return { minPrice: 0, maxPrice: 100000, timeExtent: { min: 0, max: 1 } };
    }
    const prices = sortedPoints.map((p) =>
      priceType === "cash" ? p.priceCash : p.priceNormal,
    ).filter((p) => p > 0);

    const minP = prices.length > 0 ? Math.min(...prices) : 0;
    const maxP = prices.length > 0 ? Math.max(...prices) : 100000;

    // Margen del 10% arriba y abajo para que no queden pegados a los bordes
    const padding = (maxP - minP) * 0.1 || maxP * 0.1 || 10000;
    const finalMin = Math.max(0, Math.floor((minP - padding) / 1000) * 1000);
    const finalMax = Math.ceil((maxP + padding) / 1000) * 1000;

    const times = sortedPoints.map((p) => new Date(p.timestamp).getTime());
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    return {
      minPrice: finalMin,
      maxPrice: finalMax === finalMin ? finalMin + 10000 : finalMax,
      timeExtent: {
        min: minTime,
        max: maxTime === minTime ? minTime + 86400000 : maxTime,
      },
    };
  }, [sortedPoints, priceType]);

  // Dimensiones del SVG
  const width = 640;
  const height = 240;
  const padLeft = 75;
  const padRight = 30;
  const padTop = 20;
  const padBottom = 35;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  // Funciones de proyección
  const getX = (timestamp: string) => {
    const t = new Date(timestamp).getTime();
    if (timeExtent.max === timeExtent.min) return padLeft + plotWidth / 2;
    const ratio = (t - timeExtent.min) / (timeExtent.max - timeExtent.min);
    return padLeft + ratio * plotWidth;
  };

  const getY = (price: number) => {
    if (maxPrice === minPrice) return padTop + plotHeight / 2;
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    return padTop + plotHeight - ratio * plotHeight;
  };

  // Trazados por tienda
  const storeSeries = useMemo(() => {
    const seriesByStore: Record<string, PriceHistoryPoint[]> = {};
    sortedPoints.forEach((pt) => {
      if (!seriesByStore[pt.storeName]) seriesByStore[pt.storeName] = [];
      seriesByStore[pt.storeName].push(pt);
    });
    return seriesByStore;
  }, [sortedPoints]);

  if (history.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: "12px", mt: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <TimelineIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Historial de Precios
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          No hay registros históricos de precios disponibles para este instrumento aún.
        </Typography>
      </Paper>
    );
  }

  // Generar etiquetas del eje Y (3 marcas)
  const yTicks = [
    minPrice,
    Math.round((minPrice + maxPrice) / 2),
    maxPrice,
  ];

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: "12px",
        mt: 3,
        bgcolor: "background.paper",
      }}
    >
      {/* Encabezado con selector de tipo de precio */}
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ShowChartIcon color="primary" />
          <Box>
            <Typography variant="subtitle1" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Historial de Precios
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Evolución y seguimiento de ofertas (estilo SoloTodo)
            </Typography>
          </Box>
        </Box>

        <ToggleButtonGroup
          size="small"
          value={priceType}
          exclusive
          onChange={(_e, val) => val && setPriceType(val)}
          sx={{ height: 32 }}
        >
          <ToggleButton value="cash" sx={{ px: 1.5, fontSize: "0.75rem", fontWeight: 700 }}>
            Efectivo / Transf.
          </ToggleButton>
          <ToggleButton value="normal" sx={{ px: 1.5, fontSize: "0.75rem", fontWeight: 700 }}>
            Normal / Tarjeta
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Filtro por tienda (badges) */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1.5 }}>
        <Chip
          label="Todas las tiendas"
          size="small"
          onClick={() => setSelectedStore(null)}
          variant={selectedStore === null ? "filled" : "outlined"}
          color={selectedStore === null ? "primary" : "default"}
          sx={{ fontWeight: 700, fontSize: "0.72rem" }}
        />
        {stores.map((store) => {
          const color = storeColorMap.get(store) || "#666";
          const isSelected = selectedStore === store;
          return (
            <Chip
              key={store}
              label={store}
              size="small"
              onClick={() => setSelectedStore(isSelected ? null : store)}
              variant={isSelected ? "filled" : "outlined"}
              sx={{
                fontWeight: 700,
                fontSize: "0.72rem",
                borderColor: color,
                color: isSelected ? "#fff" : color,
                bgcolor: isSelected ? color : "transparent",
                "&:hover": { bgcolor: alpha(color, 0.15) },
              }}
            />
          );
        })}
      </Box>

      {/* SVG Interactivo */}
      <Box
        sx={{
          width: "100%",
          overflowX: "auto",
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderRadius: "8px",
          p: 1,
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", display: "block", minWidth: 460 }}
        >
          {/* Líneas horizontales de guía (Eje Y) */}
          {yTicks.map((tick, i) => {
            const y = getY(tick);
            return (
              <g key={i}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={theme.palette.divider}
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="600"
                  fill={theme.palette.text.secondary}
                >
                  {formatPriceCLP(tick)}
                </text>
              </g>
            );
          })}

          {/* Trazados por tienda */}
          {Object.entries(storeSeries).map(([store, points]) => {
            const color = storeColorMap.get(store) || "#2563eb";

            // Si hay más de un punto, dibujar línea
            const pathData = points
              .map((pt, idx) => {
                const price = priceType === "cash" ? pt.priceCash : pt.priceNormal;
                const x = getX(pt.timestamp);
                const y = getY(price);
                return `${idx === 0 ? "M" : "L"} ${x} ${y}`;
              })
              .join(" ");

            return (
              <g key={store}>
                {points.length > 1 && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke={color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Puntos de cada registro */}
                {points.map((pt) => {
                  const price = priceType === "cash" ? pt.priceCash : pt.priceNormal;
                  const cx = getX(pt.timestamp);
                  const cy = getY(price);
                  const dateStr = new Date(pt.timestamp).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <Tooltip
                      key={pt.id}
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, display: "block" }}>
                            {store}
                          </Typography>
                          <Typography variant="caption" sx={{ display: "block" }}>
                            {dateStr}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: "primary.light" }}>
                            {formatPriceCLP(price)}
                          </Typography>
                          <Typography variant="caption" color={pt.inStock ? "success.light" : "error.light"}>
                            {pt.inStock ? "En stock" : "Agotado"}
                          </Typography>
                        </Box>
                      }
                      arrow
                    >
                      <circle
                        cx={cx}
                        cy={cy}
                        r="5"
                        fill={color}
                        stroke="#fff"
                        strokeWidth="2"
                        style={{ cursor: "pointer", transition: "r 0.2s" }}
                      />
                    </Tooltip>
                  );
                })}
              </g>
            );
          })}

          {/* Eje X (Línea base) */}
          <line
            x1={padLeft}
            y1={height - padBottom}
            x2={width - padRight}
            y2={height - padBottom}
            stroke={theme.palette.divider}
            strokeWidth="1.5"
          />

          {/* Etiquetas temporales de inicio y fin */}
          <text
            x={padLeft}
            y={height - padBottom + 18}
            fontSize="10"
            fill={theme.palette.text.secondary}
          >
            {new Date(timeExtent.min).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
          </text>
          <text
            x={width - padRight}
            y={height - padBottom + 18}
            textAnchor="end"
            fontSize="10"
            fill={theme.palette.text.secondary}
          >
            {new Date(timeExtent.max).toLocaleDateString("es-CL", { day: "numeric", month: "short" })}
          </text>
        </svg>
      </Box>

      {/* Nota informativa al pie */}
      <Box sx={{ mt: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Mostrando {sortedPoints.length} toma(s) de precio registradas por el motor de scraping.
        </Typography>
        <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
          SoloTono Tracker v2.0
        </Typography>
      </Box>
    </Paper>
  );
};
