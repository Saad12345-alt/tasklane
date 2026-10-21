// Placeholder: the real dashboard arrives with the next feature branch.
export default function Dashboard({ user, onSignOut }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-3 p-6">
      <h1 className="text-lg font-semibold">Signed in as {user.name}</h1>
      <p className="text-muted">Teams and tasks come next.</p>
      <button onClick={onSignOut} className="link self-start">Sign out</button>
    </main>
  );
}
