import React, { useState } from "react";
import { AUTH_KEY } from "./constants/auth";
import Shell from "./layout/Shell";
import LoginPage from "./pages/login/LoginPage";

function App() {
  const [authenticated, setAuthenticated] = useState(
    localStorage.getItem(AUTH_KEY) === "true",
  );

  if (!authenticated) {
    return <LoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return <Shell onLogout={() => setAuthenticated(false)} />;
}

export default App;
