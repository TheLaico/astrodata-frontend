import React, { useEffect, useState } from "react";
import { Bot, Search, Send } from "lucide-react";
import { api } from "../../api";
import { Empty, Header, Notice } from "../../components/ui";

export default function ChatPage() {
  const [question, setQuestion] = useState("Que objetos astronomicos aparecen en los documentos APOD?");
  const [answer, setAnswer] = useState(null);
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    try {
      setHistory(await api.history());
    } catch {
      setHistory([]);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  async function ask(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await api.ask(question);
      setAnswer(data);
      await loadHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runSearch(event) {
    event.preventDefault();
    if (!searchTerm.trim()) return;
    setError("");
    try {
      setSearchResult(await api.search(searchTerm));
    } catch (err) {
      setError(err.message);
    }
  }

  async function clear() {
    await api.clearHistory();
    setHistory([]);
  }

  return (
    <section className="module">
      <Header
        icon={Bot}
        title="Consulta IA"
        subtitle="RAG con embeddings y recuperacion semantica"
        action={<button className="ghost-button compact" onClick={clear}>Limpiar historial</button>}
      />
      {error && <Notice type="error" text={error} />}
      <div className="chat-grid">
        <article className="panel chat-panel">
          <form onSubmit={ask} className="ask-form">
            <textarea value={question} onChange={(e) => setQuestion(e.target.value)} minLength={3} />
            <button className="primary-button" disabled={loading}>
              <Send size={18} />
              Consultar
            </button>
          </form>
          {answer ? (
            <div className="answer">
              <h2>Respuesta</h2>
              <p>{answer.respuesta}</p>
              <h3>Fuentes recuperadas</h3>
              {answer.fuentes?.map((fuente) => (
                <div className="source-row" key={fuente.chunk_id}>
                  <strong>Score {fuente.score?.toFixed?.(4) ?? "N/D"}</strong>
                  <span>{fuente.texto}</span>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="Haz una pregunta para activar el flujo RAG." />
          )}
        </article>
        <aside className="panel">
          <div className="panel-heading">
            <h2>Busqueda textual</h2>
            <Search size={18} />
          </div>
          <form className="search-form" onSubmit={runSearch}>
            <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="mars, nebula, galaxy..." />
            <button className="icon-button" title="Buscar" aria-label="Buscar" type="submit">
              <Search size={17} />
            </button>
          </form>
          <pre>{JSON.stringify(searchResult || { mensaje: "Busca en objetos y documentos." }, null, 2)}</pre>
          <div className="history">
            <h2>Historial</h2>
            {history.map((item) => (
              <button key={item.id} onClick={() => setAnswer(item)}>
                {item.pregunta}
              </button>
            ))}
            {!history.length && <Empty text="Sin preguntas guardadas." />}
          </div>
        </aside>
      </div>
    </section>
  );
}
