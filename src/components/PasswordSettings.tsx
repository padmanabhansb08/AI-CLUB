import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { API_URL } from "../services/apiConfig";
import { useAuth } from '../context/AuthContext';
export function PasswordSettings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ currentPassword, password }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message || "Your password was not changed.",
        );
      await logout();
      navigate("/login", {
        replace: true,
        state: { message: result.data.message },
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to connect. Please retry.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      className="dashboard-section"
      style={{ padding: 28, marginBottom: 24 }}
    >
      <h2 style={{ marginBottom: 20 }}>Password and email</h2>
      <form onSubmit={submit}>
        <Input
          label="Current password"
          type="password"
          autoComplete="current-password"
          required
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <Input
          label="New password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          maxLength={72}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Input
          label="Confirm new password"
          type="password"
          autoComplete="new-password"
          required
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && (
          <p className="form-error mb-4" role="alert">
            {error}
          </p>
        )}
        <Button type="submit" isLoading={busy}>
          Change password
        </Button>
      </form>
      <p
        style={{ marginTop: 20, fontSize: 13, color: "var(--text-secondary)" }}
      >
        Changing your password signs you out on all devices.
      </p>
      <Link
        to="/resend-verification"
        style={{
          display: "inline-block",
          marginTop: 16,
          color: "var(--accent-color)",
        }}
      >
        Request email verification →
      </Link>
    </section>
  );
}
