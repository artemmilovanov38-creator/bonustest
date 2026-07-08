export default function Progress({ value = 0 }) {
  const safeValue = Math.min(100, Math.max(0, value));

  return (
    <div className="ui-progress">
      <span style={{ width: `${safeValue}%` }}></span>
    </div>
  );
}