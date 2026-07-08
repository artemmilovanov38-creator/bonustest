export default function SectionTitle({ title, action }) {
  return (
    <div className="ui-section-title">
      <h2>{title}</h2>
      {action}
    </div>
  );
}