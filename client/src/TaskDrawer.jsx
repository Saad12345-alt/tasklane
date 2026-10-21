import { useEffect, useState } from 'react';
import { api } from './api';
import Avatar from './Avatar';
import { StatusIcon, X } from './icons';
import { STATUSES, code, daysLate, shortName } from './lib';

const Field = ({ id, label, children }) => (
  <div>
    <label htmlFor={id} className="label">{label}</label>
    {children}
  </div>
);

// Create (task = {}) or edit a task. Docked beside the list on desktop, full screen on phones.
export default function TaskDrawer({ task, team, members, user, onClose, onSaved, onDeleted }) {
  const isNew = !task.id;
  const [f, setF] = useState({ title: task.title ?? '', description: task.description ?? '', status: task.status ?? 'todo', assigneeId: task.assignee_id ?? '', dueDate: task.due_date ?? '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (key) => (e) => setF({ ...f, [key]: e.target.value });
  const late = daysLate({ status: f.status, due_date: f.dueDate });
  const canDelete = !isNew && (team.role === 'owner' || task.created_by === user.id);
  const assignee = members.find((m) => String(m.id) === String(f.assigneeId));

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const body = { ...f, teamId: team.id, assigneeId: f.assigneeId ? Number(f.assigneeId) : null };
      onSaved(await api(isNew ? '/tasks' : `/tasks/${task.id}`, { method: isNew ? 'POST' : 'PUT', body }));
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };
  const remove = async () => {
    if (!confirm(`Delete ${code(task.id)}? This can’t be undone.`)) return;
    try {
      await api(`/tasks/${task.id}`, { method: 'DELETE' });
      onDeleted(task);
    } catch (err) {
      setError(err.message);
    }
  };
  const del = canDelete && <button type="button" onClick={remove} className="link">Delete task</button>;

  return (
    <aside className="fixed inset-0 z-20 bg-sheet md:sticky md:top-0 md:z-auto md:h-screen md:w-[457px] md:shrink-0 md:border-l md:border-line">
      <form onSubmit={submit} aria-label={isNew ? 'New task' : 'Edit task'} className="flex h-full flex-col">
        <div className="flex h-[67px] shrink-0 items-center justify-between border-b border-line px-6">
          <div className="flex items-baseline gap-3">
            {!isNew && <span className="mono text-muted">{code(task.id)}</span>}
            <h2 className="text-[17px] font-semibold">{isNew ? 'New task' : 'Edit task'}</h2>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="-mr-2 grid size-10 cursor-pointer place-items-center rounded hover:bg-tint"><X /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
          <Field id="task-title" label="Title">
            <input id="task-title" required autoFocus maxLength={120} value={f.title} onChange={set('title')} placeholder="What needs doing?" className="field" />
          </Field>
          <Field id="task-desc" label="Description">
            <textarea id="task-desc" rows={4} maxLength={2000} value={f.description} onChange={set('description')} placeholder="Add context, links or what done looks like" className="field py-2.5 leading-relaxed" />
          </Field>
          <Field id="task-status" label="Status">
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"><StatusIcon status={f.status} /></span>
              <select id="task-status" value={f.status} onChange={set('status')} className="field pl-9">
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </Field>
          <Field id="task-assignee" label="Assignee">
            <div className="relative">
              <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2"><Avatar name={assignee?.name} /></span>
              <select id="task-assignee" value={f.assigneeId} onChange={set('assigneeId')} className="field pl-[52px]">
                <option value="">Unassigned</option>
                {members.map((m) => <option key={m.id} value={m.id}>{shortName(m.name)}</option>)}
              </select>
            </div>
          </Field>
          <Field id="task-due" label="Due date">
            <input id="task-due" type="date" value={f.dueDate} onChange={set('dueDate')} className="field" />
            {late > 0 && <p className="mt-2 text-accent">{late} {late === 1 ? 'day' : 'days'} late</p>}
          </Field>
          <div className="md:hidden">{del}</div>
          {error && <p role="alert" className="text-accent">{error}</p>}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-3 border-t border-line px-6 py-4">
          <span className="max-md:hidden">{del}</span>
          <div className="flex gap-2 max-md:flex-1">
            <button type="button" onClick={onClose} className="btn-line max-md:hidden">Cancel</button>
            <button disabled={busy} className="btn min-h-11 max-md:flex-1 md:min-h-10">{isNew ? 'Create task' : 'Save task'}</button>
          </div>
        </div>
      </form>
    </aside>
  );
}
