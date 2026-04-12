import { createContext, useState, useEffect } from "react";
import apiService from "./apiService";

export const AdminContext = createContext();

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // On app load, verify stored token
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

  const login = async (password) => {
    const result = await apiService.adminLogin(password);
    localStorage.setItem("admin_token", result.token);
    setAdmin(true);
  };

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