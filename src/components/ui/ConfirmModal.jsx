import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({
  open,
  title,
  description,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">

        <div className="confirm-icon">
          <AlertTriangle />
        </div>

        <h2>{title}</h2>

        <p>{description}</p>

        <div className="confirm-buttons">

          <button
            className={
              danger
                ? "confirm-btn danger"
                : "confirm-btn"
            }
            onClick={onConfirm}
          >
            {confirmText}
          </button>

          <button
            className="cancel-btn"
            onClick={onCancel}
          >
            {cancelText}
          </button>

        </div>

      </div>
    </div>
  );
}