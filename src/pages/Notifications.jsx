import { useEffect, useState } from "react";
import { Bell, Trash2 } from "lucide-react";

import Card from "../components/ui/Card";
import ConfirmModal from "../components/ui/ConfirmModal";

import {
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotification,
  deleteReadNotifications,
} from "../services/notificationService";

export default function Notifications({ user }) {
  const [notifications, setNotifications] = useState([]);
  const [confirm, setConfirm] = useState({
    open: false,
    type: null,
    notificationId: null,
  });

  useEffect(() => {
    if (user?.id) {
      loadNotifications();
    }
  }, [user]);

  async function loadNotifications() {
    try {
      const data = await getUserNotifications(user.id);
      setNotifications(data);
      await markNotificationsAsRead(user.id);
    } catch (error) {
      console.error(error);
    }
  }

  async function confirmDelete() {
    try {
      if (confirm.type === "all-read") {
        await deleteReadNotifications(user.id);
      }

      if (confirm.type === "one") {
        await deleteNotification(confirm.notificationId, user.id);
      }

      setConfirm({ open: false, type: null, notificationId: null });
      await loadNotifications();
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <main className="page notifications-page">
      <section className="page-hero">
        <h1>Уведомления</h1>
        <p>Все события по заданиям и выплатам.</p>
      </section>

      <div className="notifications-actions">
        <button
          className="delete-read-btn"
          onClick={() =>
            setConfirm({
              open: true,
              type: "all-read",
              notificationId: null,
            })
          }
        >
          <Trash2 size={18} />
          Удалить прочитанные
        </button>
      </div>

      {notifications.length === 0 ? (
        <Card className="empty-state">
          <Bell size={42} />
          <h2>Пока пусто</h2>
          <p>Когда появятся новые события, они будут отображаться здесь.</p>
        </Card>
      ) : (
        notifications.map((item) => (
          <Card key={item.id} className="notification-card">
            <strong>{item.title}</strong>
            <p>{item.text}</p>

            <small>{new Date(item.created_at).toLocaleString("ru-RU")}</small>

            <button
              className="notification-delete-btn"
              onClick={() =>
                setConfirm({
                  open: true,
                  type: "one",
                  notificationId: item.id,
                })
              }
            >
              Удалить
            </button>
          </Card>
        ))
      )}

      <ConfirmModal
        open={confirm.open}
        title={
          confirm.type === "all-read"
            ? "Удалить прочитанные?"
            : "Удалить уведомление?"
        }
        description="Это действие нельзя отменить."
        confirmText="Удалить"
        cancelText="Отмена"
        danger
        onConfirm={confirmDelete}
        onCancel={() =>
          setConfirm({ open: false, type: null, notificationId: null })
        }
      />
    </main>
  );
}