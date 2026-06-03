export const ALADIN_SCRIPT_URL = "https://aladin.cds.unistra.fr/AladinLite/api/v3/latest/aladin.js";
export const ALADIN_DSS2_COLOR_SURVEY = "https://skies.esac.esa.int/DSSColor";

let aladinScriptPromise;

export function loadAladinLite() {
  if (window.A?.init) {
    return window.A.init.then(() => window.A);
  }

  if (!aladinScriptPromise) {
    aladinScriptPromise = new Promise((resolve, reject) => {
      const existingScript = document.querySelector(`script[src="${ALADIN_SCRIPT_URL}"]`);

      function resolveWhenReady() {
        if (!window.A?.init) {
          reject(new Error("Aladin Lite no expuso la API global A."));
          return;
        }
        window.A.init.then(() => resolve(window.A)).catch(reject);
      }

      if (existingScript) {
        existingScript.addEventListener("load", resolveWhenReady, { once: true });
        existingScript.addEventListener("error", () => reject(new Error("No se pudo cargar Aladin Lite.")), { once: true });
        return;
      }

      const script = document.createElement("script");
      script.src = ALADIN_SCRIPT_URL;
      script.async = true;
      script.charset = "utf-8";
      script.onload = resolveWhenReady;
      script.onerror = () => reject(new Error("No se pudo cargar Aladin Lite."));
      document.head.appendChild(script);
    });
  }

  return aladinScriptPromise;
}

export function getFovForObject(tipoObjeto) {
  const fovByType = {
    galaxia: 1.4,
    sistema_estelar: 4,
    estrella: 0.6,
    planeta: 0.35,
    luna: 0.25,
    nebulosa: 1.2,
    asteroide: 0.25,
    cometa: 0.5,
    exoplaneta: 0.35,
  };

  return fovByType[tipoObjeto] || 0.8;
}
