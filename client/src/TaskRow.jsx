import Avatar from './Avatar';
import { StatusIcon } from './icons';
import { code, daysLate, fmtDate } from './lib';

// One task: a single line on desktop, two lines on phones. Becomes a button when `onOpen` is given.
export default function TaskRow({ task: t, onOpen, hideOnPhone }) {
  const late = daysLate(t);
  const done = t.status === 'done';
  const id = <span className="mono w-14 shrink-0 text-muted">{code(t.id)}</span>;
  const title = <span className={`min-w-0 flex-1 truncate ${done ? 'text-muted line-through' : ''}`}>{t.title}</span>;
  const due = (
    <span className="mono whitespace-nowrap">
      <span className={late ? 'text-accent' : done ? 'text-muted' : ''}>{fmtDate(t.due_date)}</span>
      {late > 0 && <span className="ml-2 text-muted">{late}d late</span>}
    </span>
  );

  return (
    <li className={hideOnPhone ? 'max-md:hidden' : ''}>
      <button disabled={!onOpen} onClick={() => onOpen(t)} className="block w-full cursor-pointer border-b border-line px-5 py-2 text-left hover:bg-tint/60 disabled:cursor-default disabled:hover:bg-transparent md:px-6">
        <span className="hidden items-center gap-3 md:flex">
          {id}
          <StatusIcon status={t.status} />
          {title}
          <Avatar name={t.assignee_name} />
          <span className="w-[120px] pl-4">{due}</span>
        </span>
        <span className="flex gap-3 py-0.5 md:hidden">
          <span className="pt-[3px]"><StatusIcon status={t.status} /></span>
          <span className="min-w-0 flex-1">
            <span className={`block truncate ${done ? 'text-muted line-through' : ''}`}>{t.title}</span>
            <span className="mt-1 flex items-center gap-2.5 text-[13px]">
              <span className="mono text-muted">{code(t.id)}</span>
              <Avatar name={t.assignee_name} />
              {due}
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}
