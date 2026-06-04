import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp() {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data.user;

    if (user) {
  const { data: insertData, error: insertError } =
    await supabase
      .from("users")
      .insert({
        auth_id: user.id,
        email: user.email,
        balance: 0,
      });

  console.log("INSERT DATA:", insertData);
  console.log("INSERT ERROR:", insertError);

  if (insertError) {
    alert(insertError.message);
  }
}

    alert("Аккаунт создан");
  }

  async function signIn() {
    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      alert(error.message);
    } else {
      window.location.reload();
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>BONUSTEST</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <br />
      <br />

      <button onClick={signUp}>
        Регистрация
      </button>

      <button
        onClick={signIn}
        style={{ marginLeft: 10 }}
      >
        Войти
      </button>
    </div>
  );
}