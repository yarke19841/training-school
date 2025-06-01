// src/components/NavBar.js (opcional)
import React from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <nav>
      <Link to="/">Inicio</Link> | 
      <Link to="/login">Login</Link> | 
      <Link to="/dashboard">Dashboard</Link> | 
      <Link to="/classrooms">Salones</Link>
    </nav>
  );
}
