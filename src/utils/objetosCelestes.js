function toNumberOrNull(value) {
  if (value === "" || value === null || value === undefined) return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function buildObjectPayload(form) {
  const metadatos = {};
  if (form.imagen_url.trim()) {
    metadatos.imagen_url = form.imagen_url.trim();
  }

  return {
    nombre: form.nombre.trim(),
    tipo_objeto: form.tipo_objeto,
    descripcion: form.descripcion.trim(),
    coordenadas: {
      ascension_recta: Number(form.ascension_recta),
      declinacion: Number(form.declinacion),
    },
    propiedades_fisicas: {
      distancia_anios_luz: toNumberOrNull(form.distancia_anios_luz),
      masa_tierra: toNumberOrNull(form.masa_tierra),
      radio_tierra: toNumberOrNull(form.radio_tierra),
      temperatura_kelvin: toNumberOrNull(form.temperatura_kelvin),
      periodo_orbital_dias: toNumberOrNull(form.periodo_orbital_dias),
      indice_habitabilidad: toNumberOrNull(form.indice_habitabilidad),
    },
    etiquetas: form.etiquetas
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    metadatos,
  };
}

function formFromObject(objeto) {
  return {
    nombre: objeto.nombre || "",
    tipo_objeto: objeto.tipo_objeto || "planeta",
    descripcion: objeto.descripcion || "",
    ascension_recta: objeto.coordenadas?.ascension_recta ?? 0,
    declinacion: objeto.coordenadas?.declinacion ?? 0,
    distancia_anios_luz: objeto.propiedades_fisicas?.distancia_anios_luz ?? "",
    masa_tierra: objeto.propiedades_fisicas?.masa_tierra ?? "",
    radio_tierra: objeto.propiedades_fisicas?.radio_tierra ?? "",
    temperatura_kelvin: objeto.propiedades_fisicas?.temperatura_kelvin ?? "",
    periodo_orbital_dias: objeto.propiedades_fisicas?.periodo_orbital_dias ?? "",
    indice_habitabilidad: objeto.propiedades_fisicas?.indice_habitabilidad ?? "",
    imagen_url: objeto.metadatos?.imagen_url || "",
    etiquetas: objeto.etiquetas?.join(", ") || "",
  };
}

export { buildObjectPayload, formFromObject };
