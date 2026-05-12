/**
 * AdminLogin displays a password prompt for admin authentication.
 * It delegates login state management to AdminContext.
 */
import { useState, useContext, useEffect, useRef } from "react";
import { AdminContext } from "../services/adminContext";

export function AdminLogin({ onClose }) {
  const { login } = useContext(AdminContext);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const failCountRef = useRef(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(cooldownRef.current);
  }, [cooldown]);

  // handleSubmit attempts to authenticate the admin password,
  // toggles loading UI, and reports an error message if authentication fails.
  const handleSubmit = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    setError("");
    try {
      await login(password);
      onClose();
    } catch {
      setError("Incorrect password.");
      failCountRef.current += 1;
      if (failCountRef.current > 4) {
        setCooldown(prev => Math.max(prev * 2, 3));
      }
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
            disabled={loading || cooldown > 0}
            className="px-5 py-2 rounded-full bg-pink-700 text-white hover:bg-pink-800 disabled:opacity-50"
          >
            {loading ? "Verifying..." : cooldown > 0 ? `Retry in ${cooldown}s` : "Login"}
          </button>
        </div>
      </div>
    </div>
  );
}