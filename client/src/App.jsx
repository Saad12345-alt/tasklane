import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Auth from '@/features/auth/Auth';
import Dashboard from '@/pages/Dashboard';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = still checking the session
  useEffect(() => {
    api('/auth/me').then(setUser, () => setUser(null));
  }, []);

  if (user === undefined) return null;
  const signOut = () => api('/auth/logout', { method: 'POST' }).then(() => setUser(null));
  return user ? <Dashboard user={user} onSignOut={signOut} /> : <Auth onAuth={setUser} />;
}
