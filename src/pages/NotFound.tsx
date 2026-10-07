import { Link } from "react-router-dom";
export function NotFound() {
  return (
    <section
      style={{ width: "100%", padding: "15vh 24px", textAlign: "center" }}
    >
      <p style={{ color: "var(--accent-color)" }}>404</p>
      <h1 style={{ margin: "20px 0" }}>This page couldn’t be found.</h1>
      <p style={{ marginBottom: 28 }}>
        The link may have changed. Let’s get you back to the club.
      </p>
      <Link to="/" style={{ textDecoration: "underline" }}>
        Back to AI CLUB · SIET
      </Link>
    </section>
  );
}
