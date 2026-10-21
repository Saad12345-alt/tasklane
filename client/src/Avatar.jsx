const initials = (name) => name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

// Boxed initials, or a dashed dash when nobody is assigned.
export default function Avatar({ name }) {
  const box = 'mono grid h-5 min-w-[30px] shrink-0 place-items-center rounded-[3px] border px-1 text-[11px]';
  return name ? (
    <span title={name} className={`${box} border-ink font-medium`}>{initials(name)}</span>
  ) : (
    <span title="Unassigned" className={`${box} border-dashed border-muted text-muted`}>–</span>
  );
}
