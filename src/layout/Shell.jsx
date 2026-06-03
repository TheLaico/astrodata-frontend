import React, { useState } from "react";
import { Bot, Database, LayoutDashboard, LogOut, Orbit, Sparkles, Star } from "lucide-react";
import { AUTH_KEY } from "../constants/auth";
import AdminPage from "../pages/admin/AdminPage";
import ChatPage from "../pages/chat/ChatPage";
import DashboardPage from "../pages/dashboard/DashboardPage";
import DatabaseConsolePage from "../pages/database/DatabaseConsolePage";
import UniverseMapPage from "../pages/map/UniverseMapPage";
import NavButton from "./NavButton";

export default function Shell({ onLogout }) {
  const [section, setSection] = useState("dashboard");

  function logout() {
    localStorage.removeItem(AUTH_KEY);
    onLogout();
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">
            <Sparkles size={20} />
          </div>
          <div>
            <strong>Astro Data Lab</strong>
            <span>Panel LAICO</span>
          </div>
        </div>
        <nav>
          <NavButton icon={LayoutDashboard} label="Dashboard" active={section === "dashboard"} onClick={() => setSection("dashboard")} />
          <NavButton icon={Star} label="Administracion" active={section === "admin"} onClick={() => setSection("admin")} />
          <NavButton icon={Orbit} label="Mapa universo" active={section === "map"} onClick={() => setSection("map")} />
          <NavButton icon={Database} label="Consulta BD" active={section === "database"} onClick={() => setSection("database")} />
          <NavButton icon={Bot} label="Consulta IA" active={section === "chat"} onClick={() => setSection("chat")} />
        </nav>
        <button className="ghost-button logout" onClick={logout}>
          <LogOut size={18} />
          Salir
        </button>
      </aside>
      <main className="workspace">
        {section === "dashboard" && <DashboardPage />}
        {section === "admin" && <AdminPage />}
        {section === "map" && <UniverseMapPage />}
        {section === "database" && <DatabaseConsolePage />}
        {section === "chat" && <ChatPage />}
      </main>
    </div>
  );
}
