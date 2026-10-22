import { useState } from 'react';
import { api } from '@/lib/api';
import Modal from '@/components/Modal';
import Avatar from '@/components/Avatar';

export default function MembersModal({ team, members, onChange, onClose, onDeleted }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [unknown, setUnknown] = useState(false); // the typed email has no account: offer an invite
  const isOwner = team.role === 'owner';

  const add = async (e) => {
    e.preventDefault();
    setError(''); setNotice(''); setUnknown(false);
    try {
      onChange([...members, await api(`/teams/${team.id}/members`, { method: 'POST', body: { email } })]);
      setEmail('');
    } catch (err) {
      setError(err.message);
      setUnknown(err.status === 404);
    }
  };
  const invite = async () => {
    const res = await api('/invites', { method: 'POST', body: { teamId: team.id, email } });
    setError(''); setUnknown(false); setNotice(res.message);
  };
  const remove = async (m) => {
    await api(`/teams/${team.id}/members/${m.id}`, { method: 'DELETE' });
    onChange(members.filter((x) => x.id !== m.id));
  };
  const deleteTeam = async () => {
    if (!confirm(`Delete ${team.name} and all its tasks? This can’t be undone.`)) return;
    await api(`/teams/${team.id}`, { method: 'DELETE' });
    onDeleted();
  };

  return (
    <Modal title={`${team.name} members`} onClose={onClose} full>
      <ul>
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 border-b border-line px-6 py-2.5 first:border-t max-sm:px-5">
            <Avatar name={m.name} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">{m.name}</div>
              <div className="truncate text-[13px] text-muted">{m.email}</div>
            </div>
            <span className="text-muted max-sm:hidden">{m.role === 'owner' ? 'Owner' : 'Member'}</span>
            {isOwner && m.role !== 'owner' ? (
              <button onClick={() => remove(m)} aria-label={`Remove ${m.name}`} className="link w-14 text-right">Remove</button>
            ) : (
              <span className="w-14 text-right text-muted sm:hidden">{m.role === 'owner' ? 'Owner' : ''}</span>
            )}
          </li>
        ))}
      </ul>

      {isOwner && (
        <form onSubmit={add} className="px-6 py-5 max-sm:px-5">
          <label htmlFor="member-email" className="label">Add by email</label>
          <div className="flex gap-2 max-sm:flex-col">
            <input id="member-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} className="field flex-1" />
            <button className="btn min-h-11">Add member</button>
          </div>
          {(error || notice) && (
            <p role={error ? 'alert' : 'status'} className="mt-3 text-muted">
              {error || notice}{' '}
              {unknown && <button type="button" onClick={invite} className="link text-ink">Send an invite</button>}
            </p>
          )}
        </form>
      )}

      <div className="flex items-center justify-between border-t border-line px-6 py-4 max-sm:border-t-0 max-sm:px-5">
        {isOwner ? <button onClick={deleteTeam} className="link">Delete team</button> : <span />}
        <button onClick={onClose} className="btn-line max-sm:hidden">Done</button>
      </div>
    </Modal>
  );
}
