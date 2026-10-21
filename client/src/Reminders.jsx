import { useEffect, useState } from 'react';
import { api } from './api';
import { code, dayDiff, today } from './lib';

// Shown once per login: your most urgent open task that is late or due within 3 days.
const when = (days) => (days > 0 ? `${days} ${days === 1 ? 'day' : 'days'} late` : days === 0 ? 'due today' : days === -1 ? 'due tomorrow' : `due in ${-days} days`);

export default function Reminders({ onShowMine }) {
  const [due, setDue] = useState([]);

  useEffect(() => {
    api(`/tasks/reminders?today=${today()}`).then(setDue, () => {});
  }, []);

  if (!due.length) return null;
  const [first, ...more] = due;
  const days = dayDiff(today(), first.due_date);
  return (
    <div role="status" className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-line bg-sheet px-5 py-3 md:px-6">
      <p>
        <span className="mono mr-1.5 text-muted">{code(first.id)}</span>
        {first.title} is <span className={days > 0 ? 'text-accent' : ''}>{when(days)}</span> and assigned to you.
        {more.length > 0 && <span className="text-muted"> {more.length} more due soon.</span>}
      </p>
      <div className="flex items-center gap-4">
        <button onClick={() => { onShowMine(); setDue([]); }} className="btn-line min-h-8">Show my tasks</button>
        <button onClick={() => setDue([])} className="link">Dismiss</button>
      </div>
    </div>
  );
}
