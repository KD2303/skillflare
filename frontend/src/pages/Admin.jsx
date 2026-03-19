/**
 * Admin Dashboard Page
 * Wrapper for the admin panel component
 */

import { AdminPanel } from "../components/index.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import { isAdminUser } from "../utils/adminConfig.js";

export const AdminPage = () => {
  const { user } = useAuth();

  // Redirect non-admin users
  if (!user || !isAdminUser(user)) {
    return <Navigate to="/" replace />;
  }

  return <AdminPanel />;
};

export default AdminPage;
