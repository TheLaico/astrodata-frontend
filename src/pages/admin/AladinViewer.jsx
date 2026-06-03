import React, { useEffect, useRef, useState } from "react";
import { Star } from "lucide-react";
import { ALADIN_DSS2_COLOR_SURVEY, getFovForObject, loadAladinLite } from "../../lib/aladin";

export default function AladinViewer({ objeto }) {
  const containerRef = useRef(null);
  const containerIdRef = useRef(`aladin-${Math.random().toString(36).slice(2)}`);
  const aladinRef = useRef(null);
  const initKeyRef = useRef("");
  const [status, setStatus] = useState("Cargando Aladin Lite...");
  const ra = Number(objeto.coordenadas?.ascension_recta);
  const dec = Number(objeto.coordenadas?.declinacion);
  const hasCoordinates = Number.isFinite(ra) && Number.isFinite(dec);

  useEffect(() => {
    let cancelled = false;

    async function initViewer() {
      try {
        const initKey = `${objeto.id || objeto.nombre}-${ra}-${dec}-${objeto.tipo_objeto}`;
        if (initKeyRef.current === initKey && aladinRef.current) {
          return;
        }
        initKeyRef.current = initKey;
        setStatus("Cargando mapa del cielo...");
        const A = await loadAladinLite();

        if (cancelled || !containerRef.current) {
          return;
        }

        containerRef.current.innerHTML = "";
        const aladin = A.aladin(`#${containerIdRef.current}`, {
          survey: ALADIN_DSS2_COLOR_SURVEY,
          target: hasCoordinates ? `${ra} ${dec}` : objeto.nombre,
          fov: getFovForObject(objeto.tipo_objeto),
          cooFrame: "ICRSd",
          showReticle: true,
          showCooGrid: true,
          showCooGridControl: true,
          showSimbadPointerControl: true,
          showFullscreenControl: true,
          showLayersControl: true,
          showGotoControl: true,
        });

        aladinRef.current = aladin;

        if (hasCoordinates) {
          aladin.gotoRaDec(ra, dec);
          setStatus("");
          return;
        }

        aladin.gotoObject(objeto.nombre, {
          success: () => {
            if (!cancelled) setStatus("");
          },
          error: () => {
            if (!cancelled) setStatus("No se pudo resolver este objeto por nombre en Aladin Lite.");
          },
        });
      } catch (err) {
        if (!cancelled) {
          setStatus(err.message || "No se pudo iniciar Aladin Lite.");
        }
      }
    }

    initViewer();

    return () => {
      cancelled = true;
      aladinRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [dec, hasCoordinates, objeto.nombre, objeto.tipo_objeto, ra]);

  return (
    <div className="aladin-wrapper">
      <div id={containerIdRef.current} ref={containerRef} className="aladin-container" />
      {status && (
        <div className="aladin-status">
          <Star size={22} />
          <span>{status}</span>
        </div>
      )}
      <div className="aladin-caption">
        {hasCoordinates ? `RA ${ra} / Dec ${dec}` : `Resolviendo ${objeto.nombre} con SIMBAD`}
      </div>
    </div>
  );
}
