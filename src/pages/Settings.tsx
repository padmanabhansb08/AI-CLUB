import { PasswordSettings } from "../components/PasswordSettings";
import { Link, useNavigate } from "react-router-dom";
import { AdminLayout } from "../components/layout/AdminLayout";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { useAuth } from '../context/AuthContext';

export function Settings({ admin = false }: { admin?: boolean }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const content = (
    <div style={{ maxWidth: 650 }}>
      <section
        className="dashboard-section"
        style={{ padding: 28, marginBottom: 24 }}
      >
        <h2>Account</h2>
        <p style={{ color: "var(--text-secondary)", margin: "16px 0" }}>
          Signed in as {user?.email || user?.collegeEmail || "Member"}
        </p>
        <p>Access: {admin ? "Administrator" : "Student member"}</p>
        {!admin && (
          <Link
            to="/profile"
            style={{
              display: "inline-block",
              marginTop: 20,
              color: "var(--accent-color)",
            }}
          >
            Edit your profile →
          </Link>
        )}
      </section>
      <PasswordSettings />
      <section className="dashboard-section" style={{ padding: 28 }}>
        <h2>Session</h2>
        <p style={{ color: "var(--text-secondary)", margin: "16px 0" }}>
          Sign out when you finish using a shared device.
        </p>
        <button
          className="nav-item logout-btn"
          onClick={async () => {
            await logout();
            navigate(admin ? "/admin/login" : "/login", { replace: true });
          }}
        >
          Sign out of this device
        </button>
      </section>
    </div>
  );
  return admin ? (
    <AdminLayout pageTitle="Settings">{content}</AdminLayout>
  ) : (
    <DashboardLayout pageTitle="Settings">{content}</DashboardLayout>
  );
}
