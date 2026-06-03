import React, { useEffect, useState } from "react";
import { FileSearch, LayoutDashboard, RefreshCcw } from "lucide-react";
import { api } from "../../api";
import { Empty, Header, IconButton, Metric, Notice } from "../../components/ui";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [db, setDb] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [statsData, dbData, docsData] = await Promise.all([
        api.stats(),
        api.dbPing(),
        api.listDocuments(),
      ]);
      setStats(statsData);
      setDb(dbData);
      setDocuments(docsData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="module">
      <Header
        icon={LayoutDashboard}
        title="Dashboard"
        subtitle={`API: ${api.baseUrl}`}
        action={<IconButton icon={RefreshCcw} label="Actualizar" onClick={load} />}
      />
      {error && <Notice type="error" text={`No se pudo conectar con el backend: ${error}`} />}
      <div className="metrics-grid">
        <Metric label="Objetos celestes" value={stats?.total_objetos_celestes ?? "-"} />
        <Metric label="Documentos" value={stats?.total_documentos ?? "-"} />
        <Metric label="Chunks" value={stats?.total_chunks ?? "-"} />
        <Metric label="Embeddings" value={stats?.total_chunks_con_embedding ?? "-"} />
      </div>
      <div className="split">
        <article className="panel">
          <div className="panel-heading">
            <h2>Estado MongoDB</h2>
            <span className={`status-pill ${db?.conectado ? "ok" : "warn"}`}>
              {loading ? "Cargando" : db?.conectado ? "Conectado" : "Sin conexion"}
            </span>
          </div>
          <pre>{JSON.stringify(db || stats || { mensaje: "Esperando backend" }, null, 2)}</pre>
        </article>
        <article className="panel">
          <div className="panel-heading">
            <h2>Documentos recientes</h2>
            <FileSearch size={18} />
          </div>
          <div className="document-list">
            {documents.slice(0, 5).map((doc) => (
              <div className="document-row" key={doc.id}>
                <strong>{doc.titulo}</strong>
                <span>{doc.fecha_publicacion || doc.fuente}</span>
              </div>
            ))}
            {!documents.length && <Empty text="No hay documentos para mostrar." />}
          </div>
        </article>
      </div>
    </section>
  );
}
