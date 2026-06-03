import React from "react";

export function Header({ icon: Icon, title, subtitle, action }) {
  return (
    <header className="module-header">
      <div>
        <span className="section-icon"><Icon size={21} /></span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </header>
  );
}

export function Metric({ label, value }) {
  return (
    <article className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

export function Notice({ type, text }) {
  return <p className={`notice ${type}`}>{text}</p>;
}

export function Empty({ text }) {
  return <p className="empty">{text}</p>;
}

export function IconButton({ icon: Icon, label, onClick, danger }) {
  return (
    <button
      className={`icon-button ${danger ? "danger" : ""}`}
      onClick={onClick}
      title={label}
      aria-label={label}
      type="button"
    >
      <Icon size={17} />
    </button>
  );
}
