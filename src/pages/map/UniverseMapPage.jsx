import React, { useEffect, useRef, useState } from "react";
import { Braces, Orbit, Search } from "lucide-react";
import { Header } from "../../components/ui";
import { ALADIN_DSS2_COLOR_SURVEY, loadAladinLite } from "../../lib/aladin";

export default function UniverseMapPage() {
  const [target, setTarget] = useState("M31");
  const [coordinates, setCoordinates] = useState({ ra: 10.684, dec: 41.269 });
  const [command, setCommand] = useState({
    mode: "object",
    target: "M31",
    ra: 10.684,
    dec: 41.269,
    fov: 1.2,
  });

  function goToObject(event) {
    event.preventDefault();
    if (!target.trim()) return;
    setCommand({
      mode: "object",
      target: target.trim(),
      fov: 1.2,
    });
  }

  function goToCoordinates(event) {
    event.preventDefault();
    const ra = Number(coordinates.ra);
    const dec = Number(coordinates.dec);
    if (!Number.isFinite(ra) || !Number.isFinite(dec)) return;
    setCommand({
      mode: "coordinates",
      target: `${ra} ${dec}`,
      ra,
      dec,
      fov: 1.2,
    });
  }

  return (
    <section className="module map-module">
      <Header
        icon={Orbit}
        title="Mapa Universo"
        subtitle="Exploracion libre con Aladin Lite"
      />
      <div className="map-layout">
        <aside className="panel map-controls">
          <div className="panel-heading">
            <h2>Ir a objeto</h2>
            <Search size={18} />
          </div>
          <form className="map-form" onSubmit={goToObject}>
            <label>
              Nombre astronomico
              <input value={target} onChange={(event) => setTarget(event.target.value)} placeholder="M31, Mars, Orion Nebula..." />
            </label>
            <button className="primary-button" type="submit">
              <Search size={18} />
              Buscar
            </button>
          </form>
          <div className="panel-divider" />
          <div className="panel-heading">
            <h2>Ir a coordenadas</h2>
            <Braces size={18} />
          </div>
          <form className="map-form" onSubmit={goToCoordinates}>
            <label>
              RA grados
              <input
                type="number"
                min="0"
                max="359.999"
                step="0.001"
                value={coordinates.ra}
                onChange={(event) => setCoordinates((current) => ({ ...current, ra: event.target.value }))}
              />
            </label>
            <label>
              Dec grados
              <input
                type="number"
                min="-90"
                max="90"
                step="0.001"
                value={coordinates.dec}
                onChange={(event) => setCoordinates((current) => ({ ...current, dec: event.target.value }))}
              />
            </label>
            <button className="ghost-button" type="submit">
              <Orbit size={18} />
              Centrar
            </button>
          </form>
        </aside>
        <article className="panel full-map-panel">
          <FullAladinMap command={command} />
        </article>
      </div>
    </section>
  );
}

function FullAladinMap({ command }) {
  const containerRef = useRef(null);
  const containerIdRef = useRef(`aladin-map-${Math.random().toString(36).slice(2)}`);
  const aladinRef = useRef(null);
  const [status, setStatus] = useState("Cargando Aladin Lite...");

  useEffect(() => {
    let cancelled = false;

    async function initMap() {
      try {
        setStatus("Cargando mapa interactivo...");
        const A = await loadAladinLite();

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = "";
        const aladin = A.aladin(`#${containerIdRef.current}`, {
          survey: ALADIN_DSS2_COLOR_SURVEY,
          target: command.mode === "coordinates" ? `${command.ra} ${command.dec}` : command.target,
          fov: command.fov || 1.2,
          cooFrame: "ICRSd",
          showReticle: true,
          showCooGrid: true,
          showCooGridControl: true,
          showSimbadPointerControl: true,
          showFullscreenControl: true,
          showLayersControl: true,
          showGotoControl: true,
          showFrame: true,
          showProjectionControl: true,
        });

        aladinRef.current = aladin;
        setStatus("");
      } catch (err) {
        if (!cancelled) {
          setStatus(err.message || "No se pudo iniciar Aladin Lite.");
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      aladinRef.current = null;
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  useEffect(() => {
    const aladin = aladinRef.current;
    if (!aladin) return;

    if (command.mode === "coordinates") {
      aladin.gotoRaDec(Number(command.ra), Number(command.dec));
      return;
    }

    aladin.gotoObject(command.target, {
      success: () => setStatus(""),
      error: () => setStatus(`No se pudo resolver "${command.target}".`),
    });
  }, [command]);

  return (
    <div className="full-aladin-wrapper">
      <div id={containerIdRef.current} ref={containerRef} className="full-aladin-container" />
      {status && (
        <div className="aladin-status">
          <Orbit size={24} />
          <span>{status}</span>
        </div>
      )}
    </div>
  );
}
