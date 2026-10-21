import { useEffect, useState } from 'react';
import { api } from './api';
import TaskRow from './TaskRow';
import Toggle from './Toggle';
import { Plus, Search, StatusIcon } from './icons';
import { STATUSES } from './lib';

const DONE_PREVIEW = 3; // finished tasks shown before "Show all"
const byDue = (dir) => (a, b) => dir * ((a.due_date ?? (dir > 0 ? '9999' : '')).localeCompare(b.due_date ?? (dir > 0 ? '9999' : '')) || a.id - b.id);
const pad = 'px-5 md:px-6';

function Skeleton() {
  return (
    <div aria-busy="true" aria-label="Loading tasks" className="animate-pulse">
      {[3, 5, 3].map((n, g) => (
        <div key={g}>
          <div className={`border-b border-line py-3 ${pad}`}><i className="block h-2.5 w-20 rounded-sm bg-tint" /></div>
          {Array.from({ length: n }, (_, i) => (
            <div key={i} className={`flex items-center gap-4 border-b border-line py-3 ${pad}`}>
              <i className="h-2.5 w-14 rounded-sm bg-tint" /><i className="size-3.5 rounded-full bg-tint" /><i className="h-2.5 rounded-sm bg-tint" style={{ width: `${25 + ((g * 7 + i * 13) % 30)}%` }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// `version` changes whenever a task is saved elsewhere, which triggers a reload.
export default function TaskList({ team, members, user, onOpen, version = 0 }) {
  const [tasks, setTasks] = useState(null); // null until the first response
  const [failed, setFailed] = useState(false);
  const [search, setSearch] = useState('');
  const [assignee, setAssignee] = useState(''); // '' = everyone, otherwise a user id
  const [showDone, setShowDone] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false); // phones only
  const [attempt, setAttempt] = useState(0);
  const mine = assignee === String(user.id);
  const filtered = search.trim() !== '' || assignee !== '';

  useEffect(() => {
    let live = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ teamId: team.id, q: search.trim(), ...(assignee && { assigneeId: assignee }) });
      api(`/tasks?${params}`).then(
        (list) => live && (setTasks(list), setFailed(false)),
        () => live && setFailed(true),
      );
    }, search ? 250 : 0); // debounce typing only
    return () => { live = false; clearTimeout(timer); };
  }, [team.id, search, assignee, version, attempt]);

  const shown = failed ? null : tasks; // after a failed load, show only the error bar
  const clear = () => { setSearch(''); setAssignee(''); };
  const groups = STATUSES.map((s) => ({ ...s, items: (tasks ?? []).filter((t) => t.status === s.value).sort(byDue(s.value === 'done' ? -1 : 1)) }));

  return (
    <section>
      <div className={`flex flex-wrap items-center gap-2.5 border-b border-line py-2 ${pad}`}>
        <div className="relative min-w-0 flex-1 md:max-w-[292px]">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"><Search /></span>
          <input type="search" aria-label="Search tasks" placeholder="Search tasks" value={search} onChange={(e) => setSearch(e.target.value)} className="field min-h-9 pl-9" />
        </div>
        <button aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)} className="btn-line min-h-9 md:hidden">Filters{assignee && ' (1)'}</button>
        <div className={`${filtersOpen ? 'flex' : 'hidden'} w-full flex-wrap items-center gap-4 md:flex md:w-auto`}>
          <select aria-label="Filter by assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} className="field min-h-9 w-auto min-w-[183px]">
            <option value="">All assignees</option>
            {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <Toggle checked={mine} onChange={(on) => setAssignee(on ? String(user.id) : '')} label="Mine" />
        </div>
        <button disabled={!onOpen} onClick={() => onOpen({})} className="btn ml-auto hidden min-h-9 md:inline-flex"><Plus /> New task</button>
      </div>

      {failed && (
        <div role="alert" className={`flex items-center justify-between gap-3 border-b border-line bg-sheet py-3 ${pad}`}>
          <span>Couldn’t load tasks. Check your connection and retry.</span>
          <button onClick={() => setAttempt(attempt + 1)} className="btn-line min-h-8 shrink-0">Retry</button>
        </div>
      )}
      {!tasks && !failed && <Skeleton />}

      {shown?.length === 0 && (
        <div className="space-y-3 px-6 py-24 text-center">
          <p>{search.trim() ? <>No tasks match “{search.trim()}”.</> : filtered ? 'No tasks for that person.' : `No tasks in ${team.name} yet.`}</p>
          {filtered ? (
            <button onClick={clear} className="link">{search.trim() ? 'Clear search' : 'Show everyone'}</button>
          ) : (
            <button disabled={!onOpen} onClick={() => onOpen({})} className="btn-line"><Plus /> Create the first task</button>
          )}
        </div>
      )}

      {shown?.length > 0 && groups.filter((g) => g.items.length).map((g) => {
        const collapsed = g.value === 'done' && !showDone;
        const rows = collapsed ? g.items.slice(0, DONE_PREVIEW) : g.items;
        const hidden = g.items.length - rows.length;
        return (
          <div key={g.value}>
            <h2 className={`flex items-center gap-2.5 border-b border-line py-2 text-[13px] font-normal text-muted ${pad}`}>
              <span className="text-ink"><StatusIcon status={g.value} /></span> {g.label} <span className="mono">{g.items.length}</span>
              {g.value === 'done' && <button onClick={() => setShowDone(!showDone)} className="link ml-auto md:hidden">{showDone ? 'Hide' : 'Show'}</button>}
            </h2>
            <ul>
              {rows.map((t) => <TaskRow key={t.id} task={t} onOpen={onOpen} hideOnPhone={collapsed} />)}
              {g.value === 'done' && g.items.length > DONE_PREVIEW && (
                <li className={`flex items-center justify-between border-b border-line py-2 text-[13px] text-muted max-md:hidden ${pad}`}>
                  <span>{hidden > 0 ? `${hidden} more done` : `All ${g.items.length} done tasks shown`}</span>
                  <button onClick={() => setShowDone(!showDone)} className="link">{showDone ? 'Show fewer' : 'Show all'}</button>
                </li>
              )}
            </ul>
          </div>
        );
      })}
    </section>
  );
}
