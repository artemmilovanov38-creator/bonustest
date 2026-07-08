export default function HomeSkeleton() {
  return (
    <main className="page home-page premium-home">
      <div className="skeleton-line short"></div>

      <div className="skeleton-card hero"></div>

      <div className="skeleton-card balance"></div>

      <div className="skeleton-card hot"></div>

      <div className="skeleton-line"></div>

      <div className="skeleton-actions">
        <div className="skeleton-card action"></div>
        <div className="skeleton-card action"></div>
        <div className="skeleton-card action"></div>
        <div className="skeleton-card action"></div>
      </div>
    </main>
  );
}