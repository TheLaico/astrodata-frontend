import React from "react";
import { CheckCircle2 } from "lucide-react";
import { tipos } from "../../constants/astro";

export default function ObjectForm({ form, setForm, editing, onSubmit, onCancel }) {
  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <article className="panel">
      <div className="panel-heading">
        <h2>{editing ? "Editar entidad" : "Crear entidad"}</h2>
        {editing && <button className="ghost-button compact" onClick={onCancel}>Cancelar</button>}
      </div>
      <form className="object-form" onSubmit={onSubmit}>
        <label>
          Nombre
          <input value={form.nombre} onChange={(e) => update("nombre", e.target.value)} required minLength={2} />
        </label>
        <label>
          Tipo
          <select value={form.tipo_objeto} onChange={(e) => update("tipo_objeto", e.target.value)}>
            {tipos.map((item) => (
              <option key={item.value} value={item.value}>{item.label}</option>
            ))}
            <option value="nebulosa">Nebulosa</option>
            <option value="asteroide">Asteroide</option>
            <option value="cometa">Cometa</option>
            <option value="exoplaneta">Exoplaneta</option>
          </select>
        </label>
        <label className="wide">
          Descripcion
          <textarea value={form.descripcion} onChange={(e) => update("descripcion", e.target.value)} required minLength={10} />
        </label>
        <label>
          RA grados
          <input type="number" min="0" max="359.999" step="0.001" value={form.ascension_recta} onChange={(e) => update("ascension_recta", e.target.value)} />
        </label>
        <label>
          Dec grados
          <input type="number" min="-90" max="90" step="0.001" value={form.declinacion} onChange={(e) => update("declinacion", e.target.value)} />
        </label>
        <label>
          Distancia a.l.
          <input type="number" min="0" step="0.01" value={form.distancia_anios_luz} onChange={(e) => update("distancia_anios_luz", e.target.value)} />
        </label>
        <label>
          Masa Tierra
          <input type="number" min="0" step="0.01" value={form.masa_tierra} onChange={(e) => update("masa_tierra", e.target.value)} />
        </label>
        <label>
          Radio Tierra
          <input type="number" min="0" step="0.01" value={form.radio_tierra} onChange={(e) => update("radio_tierra", e.target.value)} />
        </label>
        <label>
          Temp. K
          <input type="number" min="0" step="1" value={form.temperatura_kelvin} onChange={(e) => update("temperatura_kelvin", e.target.value)} />
        </label>
        <label>
          Orbita dias
          <input type="number" min="0" step="0.01" value={form.periodo_orbital_dias} onChange={(e) => update("periodo_orbital_dias", e.target.value)} />
        </label>
        <label>
          Habitabilidad
          <input type="number" min="0" max="1" step="0.01" value={form.indice_habitabilidad} onChange={(e) => update("indice_habitabilidad", e.target.value)} />
        </label>
        <label className="wide">
          URL imagen
          <input value={form.imagen_url} onChange={(e) => update("imagen_url", e.target.value)} placeholder="https://..." />
        </label>
        <label className="wide">
          Etiquetas
          <input value={form.etiquetas} onChange={(e) => update("etiquetas", e.target.value)} placeholder="apod, demo, sistema solar" />
        </label>
        <button className="primary-button wide" type="submit">
          <CheckCircle2 size={18} />
          {editing ? "Guardar cambios" : "Crear entidad"}
        </button>
      </form>
    </article>
  );
}
