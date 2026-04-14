/* eslint-disable react-refresh/only-export-components */
/**
 * AdminContext provides login state and authentication helpers to frontend components.
 * The app stores a token in localStorage and verifies it on initial load.
 */
import { createContext, useState, useEffect } from "react";
import apiService from "./apiService";

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // On app load, verify stored token from localStorage and update admin state.
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("admin_token");
      if (token) {
        try {
          const result = await apiService.adminVerify(token);
          setAdmin(result.valid);
        } catch {
          setAdmin(false);
          localStorage.removeItem("admin_token");
        }
      }
      setLoading(false);
    };
    verifyToken();
  }, []);

  // login persists the admin token and enables admin mode for the session.
  const login = async (password) => {
    const result = await apiService.adminLogin(password);
    localStorage.setItem("admin_token", result.token);
    setAdmin(true);
  };

  // logout clears the stored token and exits admin mode.
  const logout = async () => {
    await apiService.adminLogout();
    localStorage.removeItem("admin_token");
    setAdmin(false);
  };

  return (
    <AdminContext.Provider value={{ admin, login, logout, loading }}>
      {children}
    </AdminContext.Provider>
  );
}