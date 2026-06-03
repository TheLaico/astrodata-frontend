import React from "react";
import { X } from "lucide-react";
import AladinViewer from "./AladinViewer";

export default function ObjectDetail({ objeto, onClose }) {
  return (
    <div className="detail-overlay" role="presentation" onClick={onClose}>
      <article
        className="detail-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button className="icon-button detail-close" onClick={onClose} aria-label="Cerrar detalle" title="Cerrar detalle">
          <X size={18} />
        </button>
        <div className="detail-media">
          <AladinViewer objeto={objeto} />
        </div>
        <div className="detail-body">
          <span className="status-pill">{objeto.tipo_objeto}</span>
          <h2 id="detail-title">{objeto.nombre}</h2>
          <p>{objeto.descripcion}</p>
          <dl>
            <div><dt>Ascension recta</dt><dd>{objeto.coordenadas?.ascension_recta ?? "N/D"}</dd></div>
            <div><dt>Declinacion</dt><dd>{objeto.coordenadas?.declinacion ?? "N/D"}</dd></div>
            <div><dt>Distancia a.l.</dt><dd>{objeto.propiedades_fisicas?.distancia_anios_luz ?? "N/D"}</dd></div>
            <div><dt>Masa Tierra</dt><dd>{objeto.propiedades_fisicas?.masa_tierra ?? "N/D"}</dd></div>
            <div><dt>Radio Tierra</dt><dd>{objeto.propiedades_fisicas?.radio_tierra ?? "N/D"}</dd></div>
            <div><dt>Temperatura K</dt><dd>{objeto.propiedades_fisicas?.temperatura_kelvin ?? "N/D"}</dd></div>
            <div><dt>Periodo orbital</dt><dd>{objeto.propiedades_fisicas?.periodo_orbital_dias ?? "N/D"}</dd></div>
            <div><dt>Habitabilidad</dt><dd>{objeto.propiedades_fisicas?.indice_habitabilidad ?? "N/D"}</dd></div>
          </dl>
          {objeto.etiquetas?.length > 0 && (
            <div className="tag-list">
              {objeto.etiquetas.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
