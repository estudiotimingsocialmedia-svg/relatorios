import Link from "next/link";
import LogoutButton from "./logout-button";

export default function ProjetosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: "100vh" }}>
      <header style={{ borderBottom: "1px solid var(--border)" }}>
        <div
          className="wrap"
          style={{
            padding: "20px 24px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Link href="/projetos" style={{ textDecoration: "none" }}>
            <span className="display-italic" style={{ fontSize: 22 }}>
              Timing<span style={{ color: "var(--copper)" }}>.</span>
            </span>
          </Link>
          <LogoutButton />
        </div>
      </header>
      <main className="wrap" style={{ padding: "40px 24px" }}>
        {children}
      </main>
    </div>
  );
}
