import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth, UserRole } from "../contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
  /**
   * Roles allowed to view this route. If omitted, any authenticated
   * user is permitted. Pass e.g. ["owner", "admin"] to lock a route
   * to the owner portal.
   */
  roles?: UserRole[];
};

/**
 * Route-level RBAC guard. Redirects unauthenticated visitors to /login
 * (remembering where they were headed) and sends authenticated users
 * without a required role to /unauthorized.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
