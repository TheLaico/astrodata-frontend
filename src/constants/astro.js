export const tipos = [
  { label: "Sistema", value: "sistema_estelar" },
  { label: "Galaxia", value: "galaxia" },
  { label: "Estrella", value: "estrella" },
  { label: "Planeta", value: "planeta" },
  { label: "Luna", value: "luna" },
];

export const consultas = [
  { label: "Planetas", payload: { coleccion: "objetos_celestes", operacion: "find", filtro: { tipo_objeto: "planeta" }, limite: 10 } },
  { label: "Documentos APOD", payload: { coleccion: "documentos", operacion: "find", filtro: { fuente: "apod" }, limite: 5 } },
  { label: "Chunks con embedding", payload: { coleccion: "chunks_documentos", operacion: "count_documents", filtro: { embedding: { $exists: true, $ne: null } }, limite: 1 } },
];

export const initialForm = {
  nombre: "",
  tipo_objeto: "planeta",
  descripcion: "",
  ascension_recta: 0,
  declinacion: 0,
  distancia_anios_luz: "",
  masa_tierra: "",
  radio_tierra: "",
  temperatura_kelvin: "",
  periodo_orbital_dias: "",
  indice_habitabilidad: "",
  imagen_url: "",
  etiquetas: "",
};
