import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import "../src/lib/telegram";

import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);
    }

    loadUser();
  }, []);

  if (loading) {
    return <h2>Загрузка...</h2>;
  }

  if (!user) {
    return <Auth />;
  }

  return <Dashboard user={user} />;
}