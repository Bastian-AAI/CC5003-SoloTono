export interface SubCategoryItem {
  title: string;
  queryParam: string;
}

export interface CategoryColumn {
  categoryName: string;
  items: SubCategoryItem[];
  allQueryParam: string;
}

export interface NavSection {
  id: string;
  title: string;
  columns: CategoryColumn[];
}

export const NAVIGATION_SECTIONS: NavSection[] = [
  {
    id: "instrumentos",
    title: "Instrumentos",
    columns: [
      {
        categoryName: "Cuerda",
        allQueryParam: "Cuerda",
        items: [
          { title: "Guitarras Eléctricas", queryParam: "Guitarras Eléctricas" },
          { title: "Guitarras Acústicas", queryParam: "Guitarras Acústicas" },
          { title: "Bajos Eléctricos", queryParam: "Bajos Eléctricos" },
          { title: "Guitarras Clásicas", queryParam: "Guitarras Clásicas" },
          { title: "Violines", queryParam: "Violines" },
          { title: "Ukeleles", queryParam: "Ukeleles" },
        ],
      },
      {
        categoryName: "Aire",
        allQueryParam: "Aire",
        items: [
          { title: "Flautas Traversas", queryParam: "Flautas Traversas" },
          { title: "Saxofones", queryParam: "Saxofones" },
          { title: "Trompetas", queryParam: "Trompetas" },
          { title: "Clarinetes", queryParam: "Clarinetes" },
          { title: "Armónicas", queryParam: "Armónicas" },
        ],
      },
      {
        categoryName: "Percusión",
        allQueryParam: "Percusión",
        items: [
          { title: "Baterías Acústicas", queryParam: "Baterías Acústicas" },
          { title: "Baterías Electrónicas", queryParam: "Baterías Electrónicas" },
          { title: "Cajas y Redoblantes", queryParam: "Cajas y Redoblantes" },
          { title: "Platillos", queryParam: "Platillos" },
          { title: "Percusión Latina", queryParam: "Percusión Latina" },
        ],
      },
      {
        categoryName: "Teclas",
        allQueryParam: "Teclas",
        items: [
          { title: "Pianos Digitales", queryParam: "Pianos Digitales" },
          { title: "Sintetizadores", queryParam: "Sintetizadores" },
          { title: "Teclados Controladores MIDI", queryParam: "Teclados Controladores MIDI" },
        ],
      },
    ],
  },
  {
    id: "piezas-y-repuestos",
    title: "Piezas y Repuestos",
    columns: [
      {
        categoryName: "Cuerdas y Afinación",
        allQueryParam: "Cuerdas y Afinación",
        items: [
          { title: "Cuerdas Guitarra y Bajo", queryParam: "Cuerdas Guitarra y Bajo" },
          { title: "Clavijeros y Afinadores", queryParam: "Clavijeros y Afinadores" },
          { title: "Puentes y Cejuelas", queryParam: "Puentes y Cejuelas" },
        ],
      },
      {
        categoryName: "Electrónica y Pastillas",
        allQueryParam: "Electrónica y Pastillas",
        items: [
          { title: "Pastillas / Cápsulas", queryParam: "Pastillas / Cápsulas" },
          { title: "Potenciómetros y Switches", queryParam: "Potenciómetros y Switches" },
          { title: "Jacks y Placas", queryParam: "Jacks y Placas" },
        ],
      },
      {
        categoryName: "Accesorios",
        allQueryParam: "Accesorios",
        items: [
          { title: "Correas / Straps", queryParam: "Correas / Straps" },
          { title: "Fundas y Estuches", queryParam: "Fundas y Estuches" },
          { title: "Soportes / Stands", queryParam: "Soportes / Stands" },
          { title: "Picks / Uñetas", queryParam: "Picks / Uñetas" },
        ],
      },
      {
        categoryName: "Mantenimiento",
        allQueryParam: "Mantenimiento",
        items: [
          { title: "Kits de Limpieza", queryParam: "Kits de Limpieza" },
          { title: "Aceites para Diapasón", queryParam: "Aceites para Diapasón" },
          { title: "Herramientas de Calibración", queryParam: "Herramientas de Calibración" },
        ],
      },
    ],
  },
  {
    id: "equipos-de-sonido",
    title: "Equipos de sonido",
    columns: [
      {
        categoryName: "Amplificación",
        allQueryParam: "Amplificación",
        items: [
          { title: "Amplificadores de Guitarra", queryParam: "Amplificadores de Guitarra" },
          { title: "Amplificadores de Bajo", queryParam: "Amplificadores de Bajo" },
          { title: "Cabezales y Cajas", queryParam: "Cabezales y Cajas" },
        ],
      },
      {
        categoryName: "Efectos",
        allQueryParam: "Efectos",
        items: [
          { title: "Pedales de Efectos", queryParam: "Pedales de Efectos" },
          { title: "Pedaleras Multiefectos", queryParam: "Pedaleras Multiefectos" },
          { title: "Preamps", queryParam: "Preamps" },
        ],
      },
      {
        categoryName: "Grabación y Estudio",
        allQueryParam: "Grabación y Estudio",
        items: [
          { title: "Interfaces de Audio", queryParam: "Interfaces de Audio" },
          { title: "Micrófonos de Estudio", queryParam: "Micrófonos de Estudio" },
          { title: "Monitores de Audio", queryParam: "Monitores de Audio" },
          { title: "Audífonos de Monitoreo", queryParam: "Audífonos de Monitoreo" },
        ],
      },
      {
        categoryName: "En Vivo y PA",
        allQueryParam: "En Vivo y PA",
        items: [
          { title: "Parlantes Activos / PA", queryParam: "Parlantes Activos / PA" },
          { title: "Consolas y Mezcladoras", queryParam: "Consolas y Mezcladoras" },
          { title: "Cables y Conectores", queryParam: "Cables y Conectores" },
        ],
      },
    ],
  },
];
