import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, user, requiredRole }) => {
  if (!user) {
    return <Navigate to="/signIn" />;
  }

  if (!user.emailVerified) {
    return <Navigate to="/signIn" />;
  }

  if (requiredRole && (!user.roles || !user.roles.includes(requiredRole))) {
    return <Navigate to="/" />;
  }

  return children;
};
 
export default ProtectedRoute;
