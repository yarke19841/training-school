import React from "react";
import { supabase } from "../services/supabaseClient";

export default function LogoutButton() {
  const handleLogout = async () => {
    await supabase.auth.signOut(); // Cierra sesión en Supabase

    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    // Redirige al login o página de inicio
    window.location.href = "/login";
  };

  return React.createElement(
    "button",
    { onClick: handleLogout },
    "Cerrar sesión"
  );
}
