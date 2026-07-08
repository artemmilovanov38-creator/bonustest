export default function Skeleton({ type = "home" }) {
  if (type === "home") {
    return (
      <main className="page skeleton-page">
        <div className="skeleton-line short"></div>

        <div className="skeleton-card big"></div>

        <div className="skeleton-grid">
          <div className="skeleton-card small"></div>
          <div className="skeleton-card small"></div>
        </div>

        <div className="skeleton-line"></div>
        <div className="skeleton-card medium"></div>
        <div className="skeleton-card medium"></div>
      </main>
    );
  }

  return (
    <main className="page skeleton-page">
      <div className="skeleton-line short"></div>
      <div className="skeleton-card medium"></div>
      <div className="skeleton-card medium"></div>
    </main>
  );
}