import React, { useMemo, useRef, useState } from "react";
import { Braces, Database, Sparkles, Send } from "lucide-react";
import { api } from "../../api";
import { Header, Notice } from "../../components/ui";
import { consultas } from "../../constants/astro";

const autocompleteItems = [
  { label: "celestial_objects", insert: "celestial_objects", detail: "Coleccion de objetos celestes." },
  { label: "documents", insert: "documents", detail: "Coleccion de documentos APOD." },
  { label: "document_chunks", insert: "document_chunks", detail: "Chunks vectorizados de documentos." },
  { label: "query_history", insert: "query_history", detail: "Historial de consultas IA." },
  { label: "find", insert: "find", detail: "Operacion para listar documentos." },
  { label: "aggregate", insert: "aggregate", detail: "Operacion para pipelines de agregacion." },
  { label: "count_documents", insert: "count_documents", detail: "Operacion para contar documentos." },
  { label: "filtro", insert: "filtro", detail: "Objeto de filtros para find/count." },
  { label: "pipeline", insert: "pipeline", detail: "Lista de etapas para aggregate." },
  { label: "proyeccion", insert: "proyeccion", detail: "Campos incluidos o excluidos." },
  { label: "limite", insert: "limite", detail: "Maximo de resultados, hasta 100." },
  { label: "nombre", insert: "nombre", detail: "Campo de objetos celestes." },
  { label: "tipo_objeto", insert: "tipo_objeto", detail: "planeta, luna, estrella, galaxia..." },
  { label: "descripcion", insert: "descripcion", detail: "Descripcion textual." },
  { label: "etiquetas", insert: "etiquetas", detail: "Etiquetas de clasificacion." },
  { label: "propiedades_fisicas.indice_habitabilidad", insert: "propiedades_fisicas.indice_habitabilidad", detail: "Indice de habitabilidad." },
  { label: "$match", insert: "$match", detail: "Filtra documentos dentro de aggregate." },
  { label: "$group", insert: "$group", detail: "Agrupa documentos." },
  { label: "$project", insert: "$project", detail: "Define campos de salida." },
  { label: "$sort", insert: "$sort", detail: "Ordena resultados." },
  { label: "$limit", insert: "$limit", detail: "Limita resultados dentro del pipeline." },
  { label: "$sum", insert: "$sum", detail: "Acumulador para conteos/sumas." },
  { label: "$exists", insert: "$exists", detail: "Valida existencia de campo." },
  { label: "$ne", insert: "$ne", detail: "Diferente de." },
  {
    label: "snippet aggregate por tipo",
    insert: `{
  "coleccion": "celestial_objects",
  "operacion": "aggregate",
  "pipeline": [
    {
      "$group": {
        "_id": "$tipo_objeto",
        "total": { "$sum": 1 }
      }
    },
    {
      "$sort": { "total": -1 }
    }
  ],
  "limite": 20
}`,
    detail: "Plantilla completa para agrupar por tipo de objeto.",
  },
  {
    label: "snippet lunas habitables",
    insert: `{
  "coleccion": "celestial_objects",
  "operacion": "find",
  "filtro": {
    "tipo_objeto": "luna"
  },
  "proyeccion": {
    "_id": 0,
    "nombre": 1,
    "descripcion": 1,
    "propiedades_fisicas.indice_habitabilidad": 1
  },
  "limite": 10
}`,
    detail: "Plantilla para consultar lunas y habitabilidad.",
  },
];

const objectTypeTerms = [
  { terms: ["luna", "lunas", "lunna", "lunnas"], value: "luna" },
  { terms: ["planeta", "planetas"], value: "planeta" },
  { terms: ["estrella", "estrellas"], value: "estrella" },
  { terms: ["galaxia", "galaxias"], value: "galaxia" },
  { terms: ["sistema", "sistemas"], value: "sistema_estelar" },
  { terms: ["nebulosa", "nebulosas"], value: "nebulosa" },
  { terms: ["exoplaneta", "exoplanetas"], value: "exoplaneta" },
];

function getTokenBeforeCursor(text, cursor) {
  const before = text.slice(0, cursor);
  const match = before.match(/[\w.$-]+$/);
  return match?.[0] ?? "";
}

function findSuggestion(text, cursor) {
  const token = getTokenBeforeCursor(text, cursor);
  const normalized = token.toLowerCase();

  if (!normalized) {
    return null;
  }

  return autocompleteItems.find((item) => item.label.toLowerCase().startsWith(normalized));
}

function normalizeIntent(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function getFirstLineIntent(text) {
  const firstLine = text.split(/\r?\n/, 1)[0]?.trimStart() ?? "";
  if (!firstLine.startsWith("--")) return "";
  return firstLine.slice(2).trim();
}

function stripTerminalComments(text) {
  return text
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n")
    .trim();
}

function hasAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function inferObjectType(intent) {
  return objectTypeTerms.find((item) => hasAny(intent, item.terms))?.value;
}

function inferSearchTerm(intent) {
  const words = intent
    .split(/\s+/)
    .map((word) => word.replace(/[^\w-]/g, ""))
    .filter(Boolean);
  const ignored = new Set([
    "mostrar",
    "muestra",
    "listar",
    "lista",
    "buscar",
    "busca",
    "informacion",
    "base",
    "datos",
    "sobre",
    "todos",
    "todas",
    "los",
    "las",
    "del",
    "de",
    "la",
    "el",
    "con",
    "por",
    "que",
    "hay",
  ]);
  return words.find((word) => word.length > 3 && !ignored.has(word)) ?? "";
}

function buildQueryFromIntent(rawIntent) {
  const intent = normalizeIntent(rawIntent);
  const wantsCount = hasAny(intent, ["contar", "cuantos", "cuantas", "total"]);
  const wantsAggregate = hasAny(intent, ["agrupar", "agrupa", "agregacion", "aggregate", "por tipo"]);
  const wantsApod = hasAny(intent, ["apod", "documento", "documentos"]);
  const wantsChunks = hasAny(intent, ["chunk", "chunks", "embedding", "embeddings"]);
  const type = inferObjectType(intent);

  if (wantsChunks) {
    return {
      coleccion: "document_chunks",
      operacion: wantsCount ? "count_documents" : "find",
      filtro: { embedding: { $exists: true, $ne: null } },
      limite: 20,
    };
  }

  if (wantsApod) {
    return {
      coleccion: "documents",
      operacion: wantsCount ? "count_documents" : "find",
      filtro: { fuente: "apod" },
      limite: 20,
    };
  }

  if (wantsAggregate) {
    return {
      coleccion: "celestial_objects",
      operacion: "aggregate",
      pipeline: [
        {
          $group: {
            _id: "$tipo_objeto",
            total: { $sum: 1 },
          },
        },
        {
          $sort: { total: -1 },
        },
      ],
      limite: 20,
    };
  }

  if (wantsCount) {
    return {
      coleccion: "celestial_objects",
      operacion: "count_documents",
      filtro: type ? { tipo_objeto: type } : {},
      limite: 1,
    };
  }

  if (type) {
    return {
      coleccion: "celestial_objects",
      operacion: "find",
      filtro: { tipo_objeto: type },
      proyeccion: {
        _id: 0,
        nombre: 1,
        tipo_objeto: 1,
        descripcion: 1,
        propiedades_fisicas: 1,
      },
      limite: 20,
    };
  }

  const searchTerm = inferSearchTerm(intent);
  return {
    coleccion: "celestial_objects",
    operacion: "find",
    filtro: searchTerm
      ? {
          $or: [
            { nombre: { $regex: searchTerm, $options: "i" } },
            { descripcion: { $regex: searchTerm, $options: "i" } },
            { etiquetas: { $regex: searchTerm, $options: "i" } },
          ],
        }
      : {},
    limite: 20,
  };
}

function canGenerateFromComment(text, cursor) {
  const intent = getFirstLineIntent(text);
  if (!intent) return false;

  const firstLineEnd = text.search(/\r?\n/);
  const cursorIsOnComment = firstLineEnd === -1 || cursor <= firstLineEnd;
  const bodyAlreadyExists = stripTerminalComments(text).length > 0;

  return cursorIsOnComment || !bodyAlreadyExists;
}

export default function DatabaseConsolePage() {
  const [query, setQuery] = useState(JSON.stringify(consultas[0].payload, null, 2));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(query.length);
  const inputRef = useRef(null);
  const suggestion = useMemo(() => findSuggestion(query, cursor), [query, cursor]);
  const intent = getFirstLineIntent(query);
  const canGenerateIntent = canGenerateFromComment(query, cursor);

  async function execute() {
    setLoading(true);
    setError("");
    try {
      const payload = JSON.parse(stripTerminalComments(query));
      setResult(await api.dbQuery(payload));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function generateFromComment() {
    if (!intent || !inputRef.current) return;

    const nextQuery = `--${intent}\n${JSON.stringify(buildQueryFromIntent(intent), null, 2)}`;
    setQuery(nextQuery);
    setCursor(nextQuery.length);
    window.requestAnimationFrame(() => {
      inputRef.current.focus();
      inputRef.current.setSelectionRange(nextQuery.length, nextQuery.length);
    });
  }

  function updateCursor(event) {
    setCursor(event.target.selectionStart ?? 0);
  }

  function acceptSuggestion() {
    if (!suggestion || !inputRef.current) return;

    const textarea = inputRef.current;
    const start = textarea.selectionStart ?? cursor;
    const end = textarea.selectionEnd ?? start;
    const token = getTokenBeforeCursor(query, start);
    const replaceStart = Math.max(0, start - token.length);
    const nextQuery = `${query.slice(0, replaceStart)}${suggestion.insert}${query.slice(end)}`;
    const nextCursor = replaceStart + suggestion.insert.length;

    setQuery(nextQuery);
    setCursor(nextCursor);
    window.requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextCursor, nextCursor);
    });
  }

  function handleKeyDown(event) {
    if (event.key === "Tab" && canGenerateIntent) {
      event.preventDefault();
      generateFromComment();
      return;
    }

    if (event.key === "Tab" && suggestion) {
      event.preventDefault();
      acceptSuggestion();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      const start = event.target.selectionStart ?? cursor;
      const end = event.target.selectionEnd ?? start;
      const nextQuery = `${query.slice(0, start)}  ${query.slice(end)}`;
      const nextCursor = start + 2;
      setQuery(nextQuery);
      setCursor(nextCursor);
      window.requestAnimationFrame(() => {
        event.target.setSelectionRange(nextCursor, nextCursor);
      });
    }
  }

  return (
    <section className="module">
      <Header icon={Database} title="Consulta BD" subtitle="Terminal controlada para MongoDB" />
      <div className="query-toolbar">
        {consultas.map((item) => (
          <button key={item.label} onClick={() => setQuery(JSON.stringify(item.payload, null, 2))}>
            <Braces size={16} />
            {item.label}
          </button>
        ))}
      </div>
      <div className="terminal-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Consulta JSON</h2>
            <button className="primary-button small" onClick={execute} disabled={loading}>
              <Send size={17} />
              Ejecutar
            </button>
          </div>
          <textarea
            ref={inputRef}
            className="code-input assisted-code-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setCursor(e.target.selectionStart ?? 0);
            }}
            onClick={updateCursor}
            onKeyUp={updateCursor}
            onSelect={updateCursor}
            onKeyDown={handleKeyDown}
            spellCheck="false"
          />
          <div className="autocomplete-assistant">
            <div>
              <Sparkles size={16} />
              <span>
                {canGenerateIntent
                  ? "Generar consulta desde comentario"
                  : suggestion
                    ? suggestion.label
                    : "Escribe un campo, operador o coleccion"}
              </span>
            </div>
            <p>
              {canGenerateIntent
                ? `Interpretando: ${intent}`
                : suggestion
                  ? suggestion.detail
                  : "Tab inserta espacios. Escribe un prefijo para activar autocompletado."}
            </p>
            <kbd>{canGenerateIntent || suggestion ? "Tab" : "Tab = 2 espacios"}</kbd>
          </div>
        </article>
        <article className="panel">
          <div className="panel-heading">
            <h2>Resultados</h2>
            <Database size={18} />
          </div>
          {error && <Notice type="error" text={error} />}
          <pre>{JSON.stringify(result || { mensaje: "Ejecuta una consulta para ver resultados." }, null, 2)}</pre>
        </article>
      </div>
    </section>
  );
}
