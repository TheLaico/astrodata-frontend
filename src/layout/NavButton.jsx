import React from "react";
export default function NavButton({ icon: Icon, label, active, onClick }) {
  return (
    <button className={"nav-button " + (active ? "active" : "")} onClick={onClick}>
      <Icon size={18} />
      {label}
    </button>
  );
}
