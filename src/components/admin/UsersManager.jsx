import { useEffect, useMemo, useState } from "react";
import { Lock, Search, Unlock, Wallet } from "lucide-react";
import {
  getUsersForAdmin,
  toggleUserBlock,
  updateUserBalance,
} from "../../services/adminUserService";

export default function UsersManager() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [balanceValue, setBalanceValue] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await getUsersForAdmin();
      setUsers(data);
    } catch (error) {
      console.error("Users admin error:", error);
    }
  }

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.toLowerCase();

      return (
        String(user.telegram_id || "").includes(query) ||
        String(user.first_name || "").toLowerCase().includes(query) ||
        String(user.username || "").toLowerCase().includes(query)
      );
    });
  }, [users, search]);

  function startBalanceEdit(user) {
    setEditingUserId(user.id);
    setBalanceValue(user.balance || 0);
    setMessage("");
  }

  async function saveBalance(userId) {
    try {
      await updateUserBalance(userId, balanceValue);
      setEditingUserId(null);
      setBalanceValue("");
      setMessage("Баланс обновлён");
      await loadUsers();
    } catch (error) {
      setMessage(error.message || "Не удалось обновить баланс");
    }
  }

  async function handleToggleBlock(user) {
    try {
      await toggleUserBlock(user.id, !user.is_blocked);
      await loadUsers();
    } catch (error) {
      alert(error.message || "Не удалось изменить статус пользователя");
    }
  }

  return (
    <section className="admin-users-manager">
      <div className="section-head">
        <h2>Пользователи</h2>
        <span>{filteredUsers.length}</span>
      </div>

      <div className="search-box">
        <Search />
        <input
          placeholder="Поиск по имени, username или Telegram ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      {message && <p className="wallet-message">{message}</p>}

      <div className="admin-users-list">
        {filteredUsers.map((item) => (
          <article className="admin-user-card app-card" key={item.id}>
            <div className="admin-user-top">
              <div className="admin-user-avatar">
                {item.photo_url ? (
                  <img src={item.photo_url} alt="" />
                ) : (
                  <span>{item.first_name?.[0] || "U"}</span>
                )}
              </div>

              <div>
                <h3>{item.first_name || "Пользователь"}</h3>
                <p>@{item.username || "без username"}</p>
                <small>ID: {item.telegram_id}</small>
              </div>
            </div>

            <div className="admin-user-balance">
              <Wallet />
              <div>
                <span>Баланс</span>
                <strong>{Number(item.balance || 0).toLocaleString("ru-RU")} ₽</strong>
              </div>
            </div>

            {editingUserId === item.id ? (
              <div className="admin-balance-edit">
                <input
                  className="app-input"
                  type="number"
                  value={balanceValue}
                  onChange={(event) => setBalanceValue(event.target.value)}
                />

                <button className="approve-btn" onClick={() => saveBalance(item.id)}>
                  Сохранить
                </button>

                <button
                  className="reject-btn"
                  onClick={() => {
                    setEditingUserId(null);
                    setBalanceValue("");
                  }}
                >
                  Отмена
                </button>
              </div>
            ) : (
              <div className="admin-user-actions">
                <button onClick={() => startBalanceEdit(item)}>
                  Изменить баланс
                </button>

                <button
                  className={item.is_blocked ? "approve-action" : "danger-action"}
                  onClick={() => handleToggleBlock(item)}
                >
                  {item.is_blocked ? <Unlock /> : <Lock />}
                  {item.is_blocked ? "Разблокировать" : "Заблокировать"}
                </button>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}