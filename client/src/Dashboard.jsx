import { useEffect, useState } from 'react';
import { api } from './api';
import Sidebar, { TeamsDrawer } from './Sidebar';
import NewTeamModal from './NewTeamModal';
import { Chevron } from './icons';

export default function Dashboard({ user, onSignOut }) {
  const [teams, setTeams] = useState(null); // null = loading
  const [teamId, setTeamId] = useState(null);
  const [modal, setModal] = useState(null); // 'new-team'
  const [drawer, setDrawer] = useState(false); // phone team list
  const team = teams?.find((t) => t.id === teamId);

  useEffect(() => {
    api('/teams').then((list) => {
      setTeams(list);
      setTeamId(list[0]?.id ?? null);
    });
  }, []);

  const pick = (id) => {
    setTeamId(id);
    setDrawer(false);
  };
  const created = (t) => {
    setTeams((all) => [...all, t]);
    pick(t.id);
    setModal(null);
  };
  const nav = { user, onSignOut, teams: teams ?? [], teamId, onPick: pick, onNew: () => { setDrawer(false); setModal('new-team'); } };

  if (!teams) return null;
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[250px] shrink-0 border-r border-line md:block"><Sidebar {...nav} /></aside>
      <main className="min-w-0 flex-1">
        {team ? (
          <header className="flex h-[67px] items-center gap-4 border-b border-line px-5 md:px-6">
            <button onClick={() => setDrawer(true)} className="flex cursor-pointer items-center gap-1.5 text-[17px] font-semibold md:hidden">
              {team.name} <Chevron />
            </button>
            <h1 className="hidden text-xl font-semibold md:block">{team.name}</h1>
          </header>
        ) : (
          <div className="grid min-h-screen place-items-center px-6 text-center">
            <div className="space-y-4">
              <p>You’re not on a team yet.</p>
              <button onClick={nav.onNew} className="btn-line">Create a team</button>
              <div><button onClick={onSignOut} className="link text-muted">Sign out</button></div>
            </div>
          </div>
        )}
        {team && <p className="p-6 text-muted">Tasks will show up here.</p>}
      </main>
      {drawer && <TeamsDrawer {...nav} onClose={() => setDrawer(false)} />}
      {modal === 'new-team' && <NewTeamModal onClose={() => setModal(null)} onCreated={created} />}
    </div>
  );
}
