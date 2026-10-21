import { Plus, X } from './icons';

const row = 'relative flex w-full cursor-pointer items-center justify-between px-6 py-2 text-left hover:bg-tint/60';

function TeamList({ teams, teamId, onPick, onNew, divided }) {
  return (
    <ul className={divided ? 'border-t border-line' : ''}>
      {teams.map((t) => {
        const active = t.id === teamId;
        return (
          <li key={t.id}>
            <button onClick={() => onPick(t.id)} aria-current={active} className={`${row} ${divided ? 'border-b border-line py-3' : ''} ${active ? 'font-medium' : ''}`}>
              {active && <i className="absolute inset-y-0 left-0 w-[3px] bg-bar" />}
              {t.name}
              {t.open_count !== undefined && <span className="mono text-muted">{t.open_count}</span>}
            </button>
          </li>
        );
      })}
      <li>
        <button onClick={onNew} className={`${row} justify-start gap-3 ${divided ? 'py-3.5' : ''}`}>
          <Plus /> New team
        </button>
      </li>
    </ul>
  );
}

const Footer = ({ user, onSignOut, row: inline }) => (
  <div className={`border-t border-line px-6 py-4 ${inline ? 'flex items-baseline justify-between' : ''}`}>
    <div className="font-medium">{user.name}</div>
    <button onClick={onSignOut} className="link">Sign out</button>
  </div>
);

// Desktop: fixed 250px column.
export default function Sidebar({ user, onSignOut, ...list }) {
  return (
    <nav aria-label="Teams" className="flex min-h-screen flex-col">
      <div className="px-6 pb-5 pt-6 text-base font-semibold">Tasklane</div>
      <TeamList {...list} />
      <div className="mt-auto"><Footer user={user} onSignOut={onSignOut} /></div>
    </nav>
  );
}

// Phone: full-screen list opened from the team name.
export function TeamsDrawer({ user, onSignOut, onClose, ...list }) {
  return (
    <nav aria-label="Teams" className="fixed inset-0 z-20 flex flex-col bg-paper md:hidden">
      <div className="flex items-center justify-between px-6 py-3.5">
        <h2 className="text-base font-semibold">Teams</h2>
        <button aria-label="Close" onClick={onClose} className="-mr-2 grid size-10 cursor-pointer place-items-center"><X /></button>
      </div>
      <TeamList {...list} divided />
      <div className="mt-auto"><Footer user={user} onSignOut={onSignOut} row /></div>
    </nav>
  );
}
