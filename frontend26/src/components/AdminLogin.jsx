/**
 * AdminLogin displays a password prompt for admin authentication.
 * It delegates login state management to AdminContext.
 */
import { useState, useContext } from "react";
import { AdminContext } from "../services/adminContext";

export function AdminLogin({ onClose }) {
  const { login } = useContext(AdminContext);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // handleSubmit attempts to authenticate the admin password,
  // toggles loading UI, and reports an error message if authentication fails.
  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await login(password);
      onClose();
    } catch {
      setError("Incorrect password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">Admin Login</h2>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSubmit()}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:border-pink-500"
        />
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 rounded-full bg-pink-700 text-white hover:bg-pink-800 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}