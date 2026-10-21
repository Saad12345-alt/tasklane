import { useEffect, useState } from 'react';
import { api } from './api';
import Sidebar, { TeamsDrawer } from './Sidebar';
import NewTeamModal from './NewTeamModal';
import MembersModal from './MembersModal';
import TaskList from './TaskList';
import TaskDrawer from './TaskDrawer';
import Reminders from './Reminders';
import { Chevron, Plus } from './icons';

export default function Dashboard({ user, onSignOut }) {
  const [teams, setTeams] = useState(null); // null = loading
  const [teamId, setTeamId] = useState(null);
  const [modal, setModal] = useState(null); // 'new-team' | 'members'
  const [drawer, setDrawer] = useState(false); // phone team list
  const [members, setMembers] = useState([]);
  const [openTask, setOpenTask] = useState(null); // null = closed, {} = new task, task object = editing
  const [version, setVersion] = useState(0); // bumped after any change so the task list reloads
  const [mineSignal, setMineSignal] = useState(0); // bumped by the reminder's "Show my tasks"
  const team = teams?.find((t) => t.id === teamId);

  useEffect(() => {
    api('/teams').then((list) => {
      setTeams(list);
      setTeamId(list[0]?.id ?? null);
    });
  }, []);

  useEffect(() => {
    setMembers([]);
    if (teamId) api(`/teams/${teamId}/members`).then(setMembers);
  }, [teamId]);

  // Reload the task list and the sidebar's open-task counts.
  const refresh = () => {
    setVersion((v) => v + 1);
    api('/teams').then(setTeams);
  };
  const taskDone = () => {
    setOpenTask(null);
    refresh();
  };
  const teamDeleted = () => {
    const rest = teams.filter((t) => t.id !== teamId);
    setTeams(rest);
    setTeamId(rest[0]?.id ?? null);
    setModal(null);
  };
  const pick = (id) => {
    setTeamId(id);
    setOpenTask(null);
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
            <button onClick={() => setDrawer(true)} className="flex min-w-0 cursor-pointer items-center gap-1.5 text-[17px] font-semibold md:hidden">
              <span className="truncate">{team.name}</span> <Chevron />
            </button>
            <h1 className="hidden truncate text-xl font-semibold md:block">{team.name}</h1>
            <button onClick={() => setModal('members')} className="link shrink-0">Members {members.length}</button>
            <button onClick={() => setOpenTask({})} className="btn ml-auto min-h-9 shrink-0 md:hidden"><Plus /> New task</button>
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
        {team && <Reminders onShowMine={() => setMineSignal((n) => n + 1)} />}
        {team && <TaskList key={team.id} team={team} members={members} user={user} onOpen={setOpenTask} activeId={openTask?.id} version={version} mineSignal={mineSignal} />}
      </main>
      {team && openTask && (
        <TaskDrawer key={openTask.id ?? 'new'} task={openTask} team={team} members={members} user={user} onClose={() => setOpenTask(null)} onSaved={taskDone} onDeleted={taskDone} />
      )}
      {drawer && <TeamsDrawer {...nav} onClose={() => setDrawer(false)} />}
      {modal === 'new-team' && <NewTeamModal onClose={() => setModal(null)} onCreated={created} />}
      {modal === 'members' && <MembersModal team={team} members={members} onChange={setMembers} onClose={() => { setModal(null); refresh(); }} onDeleted={teamDeleted} />}
    </div>
  );
}
