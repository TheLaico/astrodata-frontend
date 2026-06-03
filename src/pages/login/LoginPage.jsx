import React, { useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { AUTH_KEY, PASSWORD, USER } from "../../constants/auth";
import BlackHoleScene from "./BlackHoleScene";

export default function LoginPage({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error, setError] = useState("");

  function submit(event) {
    event.preventDefault();
    if (usuario.trim() === USER && contrasena === PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      onLogin();
      return;
    }
    setError("Credenciales invalidas.");
  }

  return (
    <main className="login-page">
      <BlackHoleScene />
      <section className="login-copy" aria-hidden="true">
        <span>TON 618 OBSERVATORY</span>
        <h2>Astro Data Lab</h2>
        <p>Gestion de datos astronomicos, exploracion visual y consulta RAG en un solo panel.</p>
      </section>
      <section className="login-panel">
        <div className="brand-mark">
          <Sparkles size={22} />
        </div>
        <h1>Astro Data Lab</h1>
        <p>Acceso administrativo para consultar MongoDB, datos astronomicos y RAG.</p>
        <form onSubmit={submit} className="login-form">
          <label>
            Usuario
            <input
              value={usuario}
              onChange={(event) => setUsuario(event.target.value)}
              autoComplete="username"
              placeholder="Usuario"
            />
          </label>
          <label>
            Contrasena
            <input
              value={contrasena}
              onChange={(event) => setContrasena(event.target.value)}
              type="password"
              autoComplete="current-password"
              placeholder="Contrasena"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button" type="submit">
            <CheckCircle2 size={18} />
            Ingresar
          </button>
        </form>
      </section>
    </main>
  );
}
