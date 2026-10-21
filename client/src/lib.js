// Local calendar date as YYYY-MM-DD (not UTC, so "today" matches the user's clock).
const iso = (d) => d.toLocaleDateString('en-CA');
export const today = () => iso(new Date());

export const code = (id) => `TL-${id}`;
export const fmtDate = (d) => (d ? new Date(`${d}T00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '–');
export const dayDiff = (a, b) => Math.round((new Date(`${a}T00:00`) - new Date(`${b}T00:00`)) / 864e5);

// Whole days overdue, or 0 when the task is done, undated or not yet due.
export const daysLate = (task) => (task.status !== 'done' && task.due_date ? Math.max(0, dayDiff(today(), task.due_date)) : 0);

export const STATUSES = [
  { value: 'doing', label: 'Doing' },
  { value: 'todo', label: 'Todo' },
  { value: 'done', label: 'Done' },
];
