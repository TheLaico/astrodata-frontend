import React, { useEffect, useState } from "react";
import { Edit3, Eye, Moon, Plus, Star, Trash2 } from "lucide-react";
import { api } from "../../api";
import { Empty, Header, IconButton, Notice } from "../../components/ui";
import { initialForm, tipos } from "../../constants/astro";
import { buildObjectPayload, formFromObject } from "../../utils/objetosCelestes";
import ObjectDetail from "./ObjectDetail";
import ObjectForm from "./ObjectForm";

export default function AdminPage() {
  const [tipo, setTipo] = useState("");
  const [objetos, setObjetos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function load(nextTipo = tipo) {
    setLoading(true);
    setError("");
    try {
      setObjetos(await api.listObjects(nextTipo));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function selectTipo(value) {
    const nextTipo = tipo === value ? "" : value;
    setTipo(nextTipo);
    load(nextTipo);
  }

  function startCreate() {
    setEditing(null);
    setForm({ ...initialForm, tipo_objeto: tipo || "planeta" });
    setSelected(null);
  }

  function startEdit(objeto) {
    setEditing(objeto);
    setForm(formFromObject(objeto));
    setSelected(null);
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = buildObjectPayload(form);
      if (editing) {
        await api.updateObject(editing.id, payload);
        setMessage("Entidad actualizada.");
      } else {
        await api.createObject(payload);
        setMessage("Entidad creada.");
      }
      setEditing(null);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function remove(objeto) {
    const ok = window.confirm(`Borrar ${objeto.nombre}?`);
    if (!ok) return;
    setError("");
    try {
      await api.deleteObject(objeto.id);
      setSelected(null);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="module">
      <Header
        icon={Star}
        title="Administracion"
        subtitle="CRUD de entidades astronomicas"
        action={<button className="primary-button small" onClick={startCreate}><Plus size={17} /> Crear</button>}
      />
      <div className="entity-tabs">
        {tipos.map((item) => (
          <button
            className={tipo === item.value ? "active" : ""}
            key={item.value}
            onClick={() => selectTipo(item.value)}
          >
            {item.value === "luna" ? <Moon size={16} /> : <Star size={16} />}
            {item.label}
          </button>
        ))}
      </div>
      {error && <Notice type="error" text={error} />}
      {message && <Notice type="ok" text={message} />}
      <div className="admin-grid">
        <article className="panel">
          <div className="panel-heading">
            <h2>Listado</h2>
            <span>{loading ? "Cargando..." : `${objetos.length} registros`}</span>
          </div>
          <div className="object-list">
            {objetos.map((objeto) => (
              <div className="object-row" key={objeto.id}>
                <button className="object-main" onClick={() => setSelected(objeto)}>
                  <strong>{objeto.nombre}</strong>
                  <span>{objeto.tipo_objeto}</span>
                </button>
                <IconButton icon={Eye} label="Ver" onClick={() => setSelected(objeto)} />
                <IconButton icon={Edit3} label="Editar" onClick={() => startEdit(objeto)} />
                <IconButton icon={Trash2} label="Borrar" onClick={() => remove(objeto)} danger />
              </div>
            ))}
            {!objetos.length && <Empty text="No hay entidades cargadas para este filtro." />}
          </div>
        </article>
        <ObjectForm
          form={form}
          setForm={setForm}
          editing={editing}
          onSubmit={submit}
          onCancel={() => {
            setEditing(null);
            setForm(initialForm);
          }}
        />
      </div>
      {selected && <ObjectDetail objeto={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
