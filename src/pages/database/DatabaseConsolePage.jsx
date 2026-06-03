import React, { useState } from "react";
import { Braces, Database, Send } from "lucide-react";
import { api } from "../../api";
import { Header, Notice } from "../../components/ui";
import { consultas } from "../../constants/astro";

export default function DatabaseConsolePage() {
  const [query, setQuery] = useState(JSON.stringify(consultas[0].payload, null, 2));
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function execute() {
    setLoading(true);
    setError("");
    try {
      const payload = JSON.parse(query);
      setResult(await api.dbQuery(payload));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
          <textarea className="code-input" value={query} onChange={(e) => setQuery(e.target.value)} spellCheck="false" />
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
