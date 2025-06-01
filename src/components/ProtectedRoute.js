import React from 'react'
import { Navigate } from 'react-router-dom'
import useUserRole from '../hooks/useUserRole'

export default function ProtectedRoute({ allowedRoles, children }) {
  const { role, loading } = useUserRole()

  if (loading) return <p>Cargando...</p>

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/no-access" replace />
  }

  return children
}
