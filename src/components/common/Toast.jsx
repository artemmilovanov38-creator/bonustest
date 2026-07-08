import { CheckCircle, XCircle, Info } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const Icon =
    toast.type === "success"
      ? CheckCircle
      : toast.type === "error"
        ? XCircle
        : Info;

  return (
    <div className={`toast ${toast.type || "info"}`}>
      <Icon />
      <div>
        <strong>{toast.title}</strong>
        {toast.text && <p>{toast.text}</p>}
      </div>

      <button onClick={onClose}>×</button>
    </div>
  );
}