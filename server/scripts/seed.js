// Demo data: npm run seed --prefix server -- you@email.com
// Gives that account a "Payments" team with two teammates and 20 tasks (some late, some done).
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { pool, q } from '../src/db.js';

const email = process.argv[2]?.toLowerCase();
const [me] = email ? await q('select id from users where email = $1', [email]) : [];
if (!me) {
  console.error('Usage: npm run seed --prefix server -- <email of a registered account>');
  process.exit(1);
}

const hash = await bcrypt.hash(Math.random().toString(36), 10); // teammates can't sign in
const mate = async (name, mail) =>
  (await q('insert into users (name, email, password_hash) values ($1, $2, $3) on conflict (email) do update set name = excluded.name returning id', [name, mail, hash]))[0].id;
const [marcus, dana] = [await mate('Marcus Okafor', 'marcus@northpier.co'), await mate('Dana Kowalski', 'dana@northpier.co')];

const [team] = await q('insert into teams (name, owner_id) values ($1, $2) returning id', ['Payments', me.id]);
await q("insert into team_members (team_id, user_id, role) values ($1, $2, 'owner'), ($1, $3, 'member'), ($1, $4, 'member')", [team.id, me.id, marcus, dana]);

const day = (n) => new Date(Date.now() + n * 864e5).toLocaleDateString('en-CA'); // n days from today
const tasks = [
  ['Fix invoice rounding bug', 'doing', me.id, -3, 'Totals drift by one cent when a discount and tax are both applied. Round each line item before summing.'],
  ['Migrate staging DB', 'doing', marcus, 7], ['Reconcile Stripe payout totals', 'doing', dana, 9],
  ['Write runbook for failed payouts', 'todo', null, 14], ['Add retry to webhook sender', 'todo', dana, 16],
  ['Audit refund permissions', 'todo', marcus, 17], ['Add idempotency keys to charge API', 'todo', me.id, 21], ['Document ledger export format', 'todo', null, null],
  ...['Rotate Stripe API keys', 'Backfill missing receipt emails', 'Remove legacy refund endpoint', 'Archive 2024 settlement files', 'Fix timezone bug in daily report', 'Upgrade payment SDK',
    'Add currency to ledger rows', 'Delete unused webhook secrets', 'Move receipts to object storage', 'Speed up invoice search', 'Document dispute process', 'Add audit log for refunds']
    .map((title, i) => [title, 'done', [me.id, marcus, dana][i % 3], -6 - i]),
];
for (const [title, status, assignee, due, description = ''] of tasks) {
  await q('insert into tasks (team_id, title, description, status, assignee_id, due_date, created_by) values ($1, $2, $3, $4, $5, $6, $7)', [team.id, title, description, status, assignee, due === null ? null : day(due), me.id]);
}
console.log(`Seeded team "Payments" (${tasks.length} tasks) for ${email}`);
await pool.end();
