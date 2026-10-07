import { useState } from "react";
import { Link } from "react-router-dom";
import { AuthLayout } from "../components/layout/AuthLayout";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { API_URL } from "../services/apiConfig";
import { authService } from "../services/authService";

export function AccountHelp({
  mode,
}: {
  mode: "forgot" | "reset" | "verify" | "resend";
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [token] = useState(() => {
    const value =
      new URLSearchParams(window.location.hash.slice(1)).get("token") || "";
    if (value) window.history.replaceState(null, "", window.location.pathname);
    return value;
  });
  const needsEmail = mode === "forgot" || mode === "resend";
  const title = {
    forgot: "Forgot your password?",
    reset: "Set a new password",
    verify: "Verify your email",
    resend: "Confirm your college email",
  }[mode];
  const path = {
    forgot: "forgot-password",
    reset: "reset-password",
    verify: "verify-email",
    resend: "resend-verification",
  }[mode];
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (mode === "reset" && password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          needsEmail
            ? { email }
            : { token, ...(mode === "reset" ? { password } : {}) },
        ),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error?.message || "Unable to complete your request.",
        );
      if (mode === "reset") authService.logout();
      setMessage(result.data.message);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout title={title} subtitle="AI CLUB · SIET account assistance">
      {message ? (
        <p role="status" style={{ marginBottom: 24, lineHeight: 1.7 }}>
          {message}
        </p>
      ) : !needsEmail && !token ? (
        <p role="alert" style={{ marginBottom: 24 }}>
          This link is missing its security token. Please request a new email.
        </p>
      ) : (
        <form onSubmit={submit}>
          {needsEmail && (
            <Input
              label="College email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          )}
          {mode === "reset" && (
            <>
              <Input
                label="New password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <Input
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                maxLength={72}
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
              />
            </>
          )}
          {mode === "verify" && (
            <p style={{ marginBottom: 24 }}>
              Confirm this email address belongs to you to verify your club
              account.
            </p>
          )}
          {error && (
            <p className="form-error mb-4" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" isLoading={busy}>
            {mode === "verify"
              ? "Verify email"
              : mode === "reset"
                ? "Save new password"
                : "Send email"}
          </Button>
        </form>
      )}
      <div
        style={{
          marginTop: 24,
          display: "flex",
          gap: 20,
          flexWrap: "wrap",
          fontSize: 13,
        }}
      >
        <Link to="/login">Back to login</Link>
        <Link
          to={
            mode === "verify" || mode === "resend"
              ? "/resend-verification"
              : "/forgot-password"
          }
        >
          Request a new link
        </Link>
      </div>
    </AuthLayout>
  );
}
