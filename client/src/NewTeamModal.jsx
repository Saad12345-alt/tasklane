import { useState } from 'react';
import { api } from './api';
import Modal, { bodyClass, footClass } from './Modal';

export default function NewTeamModal({ onClose, onCreated }) {
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    try {
      onCreated(await api('/teams', { method: 'POST', body: { name: new FormData(e.target).get('name') } }));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal title="New team" onClose={onClose}>
      <form onSubmit={submit}>
        <div className={bodyClass}>
          <label className="block">
            <span className="label">Team name</span>
            <input name="name" required autoFocus maxLength={60} aria-invalid={!!error} className="field" />
          </label>
          <p className={error ? 'text-accent' : 'text-muted'} role={error ? 'alert' : undefined}>
            {error || 'You’ll be the owner. Add members once the team exists.'}
          </p>
        </div>
        <div className={footClass}>
          <button type="button" onClick={onClose} className="btn-line">Cancel</button>
          <button className="btn">Create team</button>
        </div>
      </form>
    </Modal>
  );
}
