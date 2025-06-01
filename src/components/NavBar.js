// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav style={{ marginBottom: '20px' }}>
      <Link to="/">Inicio</Link> |{" "}
      <Link to="/login">Login</Link> |{" "}
      <Link to="/dashboard">Dashboard</Link> |{" "}
      <Link to="/classrooms">Salones</Link>
    </nav>
  );
}
