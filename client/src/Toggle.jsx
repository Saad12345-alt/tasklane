export default function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-[18px] w-9 shrink-0 cursor-pointer rounded border border-ink/70 ${checked ? 'bg-ink' : 'bg-tint'}`}>
        <i className={`absolute top-1/2 size-2.5 -translate-y-1/2 rounded-[2px] ${checked ? 'left-[21px] bg-paper' : 'left-[3px] bg-ink/70'}`} />
      </button>
      {label}
    </label>
  );
}
