export interface SubCategoryItem {
  title: string;
  slug?: string;
  queryParam: string;
}

export interface CategoryColumn {
  categoryName: string;
  groupSlug?: string;
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
        groupSlug: "cuerda",
        allQueryParam: "Cuerda",
        items: [
          { title: "Guitarras Eléctricas", slug: "guitarras-electricas", queryParam: "Guitarras Eléctricas" },
          { title: "Guitarras Acústicas", slug: "guitarras-acusticas", queryParam: "Guitarras Acústicas" },
          { title: "Bajos Eléctricos", slug: "bajos-electricos", queryParam: "Bajos Eléctricos" },
          { title: "Guitarras Clásicas", slug: "guitarras-clasicas", queryParam: "Guitarras Clásicas" },
          { title: "Violines", slug: "violines", queryParam: "Violines" },
          { title: "Ukeleles", slug: "ukeleles", queryParam: "Ukeleles" },
        ],
      },
      {
        categoryName: "Aire",
        groupSlug: "aire",
        allQueryParam: "Aire",
        items: [
          { title: "Flautas Traversas", slug: "flautas-traversas", queryParam: "Flautas Traversas" },
          { title: "Saxofones", slug: "saxofones", queryParam: "Saxofones" },
          { title: "Trompetas", slug: "trompetas", queryParam: "Trompetas" },
          { title: "Clarinetes", slug: "clarinetes", queryParam: "Clarinetes" },
          { title: "Armónicas", slug: "armonicas", queryParam: "Armónicas" },
        ],
      },
      {
        categoryName: "Percusión",
        groupSlug: "percusion",
        allQueryParam: "Percusión",
        items: [
          { title: "Baterías Acústicas", slug: "baterias-acusticas", queryParam: "Baterías Acústicas" },
          { title: "Baterías Electrónicas", slug: "baterias-electronicas", queryParam: "Baterías Electrónicas" },
          { title: "Cajas y Redoblantes", slug: "cajas-y-redoblantes", queryParam: "Cajas y Redoblantes" },
          { title: "Platillos", slug: "platillos", queryParam: "Platillos" },
          { title: "Percusión Latina", slug: "percusion-latina", queryParam: "Percusión Latina" },
        ],
      },
      {
        categoryName: "Teclas",
        groupSlug: "teclas",
        allQueryParam: "Teclas",
        items: [
          { title: "Pianos Digitales", slug: "pianos-digitales", queryParam: "Pianos Digitales" },
          { title: "Sintetizadores", slug: "sintetizadores", queryParam: "Sintetizadores" },
          { title: "Teclados Controladores MIDI", slug: "teclados-controladores-midi", queryParam: "Teclados Controladores MIDI" },
          { title: "Teclados Portátiles", slug: "teclados-portatiles", queryParam: "Teclados Portátiles" },
          { title: "Acordeones y Melódicas", slug: "acordeones-y-melodicas", queryParam: "Acordeones y Melódicas" },
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
        groupSlug: "cuerdas-y-afinacion",
        allQueryParam: "Cuerdas y Afinación",
        items: [
          { title: "Cuerdas Guitarra y Bajo", slug: "cuerdas-guitarra-y-bajo", queryParam: "Cuerdas Guitarra y Bajo" },
          { title: "Clavijeros y Afinadores", slug: "clavijeros-y-afinadores", queryParam: "Clavijeros y Afinadores" },
          { title: "Puentes y Cejuelas", slug: "puentes-y-cejuelas", queryParam: "Puentes y Cejuelas" },
        ],
      },
      {
        categoryName: "Electrónica y Pastillas",
        groupSlug: "electronica-y-pastillas",
        allQueryParam: "Electrónica y Pastillas",
        items: [
          { title: "Pastillas / Cápsulas", slug: "pastillas-capsulas", queryParam: "Pastillas / Cápsulas" },
          { title: "Potenciómetros y Switches", slug: "potenciometros-y-switches", queryParam: "Potenciómetros y Switches" },
          { title: "Jacks y Placas", slug: "jacks-y-placas", queryParam: "Jacks y Placas" },
        ],
      },
      {
        categoryName: "Accesorios",
        groupSlug: "accesorios",
        allQueryParam: "Accesorios",
        items: [
          { title: "Correas / Straps", slug: "correas-straps", queryParam: "Correas / Straps" },
          { title: "Fundas y Estuches", slug: "fundas-y-estuches", queryParam: "Fundas y Estuches" },
          { title: "Soportes / Stands", slug: "soportes-stands", queryParam: "Soportes / Stands" },
          { title: "Picks / Uñetas", slug: "picks-unetas", queryParam: "Picks / Uñetas" },
          { title: "Cejillos / Capos", slug: "cejillos-capos", queryParam: "Cejillos / Capos" },
          { title: "Parches y Baquetas", slug: "parches-y-baquetas", queryParam: "Parches y Baquetas" },
          { title: "Fuentes de Poder y Pedalboards", slug: "fuentes-y-pedalboards", queryParam: "Fuentes de Poder y Pedalboards" },
          { title: "Boquillas, Cañas y Viento", slug: "boquillas-y-canas", queryParam: "Boquillas, Cañas y Viento" },
        ],
      },
      {
        categoryName: "Mantenimiento",
        groupSlug: "mantenimiento",
        allQueryParam: "Mantenimiento",
        items: [
          { title: "Kits de Limpieza", slug: "kits-de-limpieza", queryParam: "Kits de Limpieza" },
          { title: "Aceites para Diapasón", slug: "aceites-para-diapason", queryParam: "Aceites para Diapasón" },
          { title: "Herramientas de Calibración", slug: "herramientas-de-calibracion", queryParam: "Herramientas de Calibración" },
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
        groupSlug: "amplificacion",
        allQueryParam: "Amplificación",
        items: [
          { title: "Amplificadores de Guitarra", slug: "amplificadores-de-guitarra", queryParam: "Amplificadores de Guitarra" },
          { title: "Amplificadores de Bajo", slug: "amplificadores-de-bajo", queryParam: "Amplificadores de Bajo" },
          { title: "Cabezales y Cajas", slug: "cabezales-y-cajas", queryParam: "Cabezales y Cajas" },
        ],
      },
      {
        categoryName: "Efectos",
        groupSlug: "efectos",
        allQueryParam: "Efectos",
        items: [
          { title: "Pedales de Efectos", slug: "pedales-de-efectos", queryParam: "Pedales de Efectos" },
          { title: "Pedaleras Multiefectos", slug: "pedaleras-multiefectos", queryParam: "Pedaleras Multiefectos" },
          { title: "Preamps", slug: "preamps", queryParam: "Preamps" },
        ],
      },
      {
        categoryName: "Grabación y Estudio",
        groupSlug: "grabacion-y-estudio",
        allQueryParam: "Grabación y Estudio",
        items: [
          { title: "Interfaces de Audio", slug: "interfaces-de-audio", queryParam: "Interfaces de Audio" },
          { title: "Micrófonos de Estudio", slug: "microfonos-de-estudio", queryParam: "Micrófonos de Estudio" },
          { title: "Monitores de Audio", slug: "monitores-de-audio", queryParam: "Monitores de Audio" },
          { title: "Audífonos de Monitoreo", slug: "audifonos-de-monitoreo", queryParam: "Audífonos de Monitoreo" },
        ],
      },
      {
        categoryName: "En Vivo y PA",
        groupSlug: "en-vivo-y-pa",
        allQueryParam: "En Vivo y PA",
        items: [
          { title: "Parlantes Activos / PA", slug: "parlantes-activos-pa", queryParam: "Parlantes Activos / PA" },
          { title: "Consolas y Mezcladoras", slug: "consolas-y-mezcladoras", queryParam: "Consolas y Mezcladoras" },
          { title: "Cables y Conectores", slug: "cables-y-conectores", queryParam: "Cables y Conectores" },
          { title: "Sistemas Inalámbricos", slug: "sistemas-inalambricos", queryParam: "Sistemas Inalámbricos" },
          { title: "Equipos DJ y Tornamesas", slug: "equipos-dj-y-tornamesas", queryParam: "Equipos DJ y Tornamesas" },
          { title: "Iluminación y Escenario", slug: "iluminacion-y-escenario", queryParam: "Iluminación y Escenario" },
        ],
      },
    ],
  },
];
