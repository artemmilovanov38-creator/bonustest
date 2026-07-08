export default function EmptyState({ icon = "📭", title, text }) {
  return (
    <div className="ui-empty">
      <span>{icon}</span>
      <h2>{title}</h2>
      <p>{text}</p>
    </div>
  );
}