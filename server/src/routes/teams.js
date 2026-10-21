import { Router } from 'express';
import Joi from 'joi';
import { q } from '../db.js';
import { validate, roleIn } from '../middleware.js';

const r = Router();
const nameBody = Joi.object({ name: Joi.string().trim().min(1).max(60).required() });
const owner = (req, res, next) =>
  req.role === 'owner' ? next() : res.status(403).json({ error: 'Only the team owner can do that' });

r.get('/', async (req, res) =>
  res.json(
    await q(
      `select t.id, t.name, t.owner_id, m.role from teams t
       join team_members m on m.team_id = t.id where m.user_id = $1 order by t.id`,
      [req.user.id],
    ),
  ),
);

r.post('/', validate(nameBody), async (req, res) => {
  const [team] = await q(
    `with t as (insert into teams (name, owner_id) values ($1, $2) returning *),
          m as (insert into team_members (team_id, user_id, role) select id, owner_id, 'owner' from t)
     select * from t`,
    [req.body.name, req.user.id],
  );
  res.status(201).json({ ...team, role: 'owner' });
});

// Everything below needs the caller to be on the team (otherwise it looks like the team doesn't exist).
r.use('/:id(\\d+)', async (req, res, next) => {
  req.role = await roleIn(req.params.id, req.user.id);
  req.role ? next() : res.status(404).json({ error: 'Team not found' });
});

r.get('/:id(\\d+)', async (req, res) => {
  const [team] = await q('select id, name, owner_id from teams where id = $1', [req.params.id]);
  res.json({ ...team, role: req.role });
});

r.patch('/:id(\\d+)', owner, validate(nameBody), async (req, res) => {
  const [team] = await q('update teams set name = $2 where id = $1 returning id, name, owner_id', [req.params.id, req.body.name]);
  res.json({ ...team, role: req.role });
});

r.get('/:id(\\d+)/members', async (req, res) =>
  res.json(
    await q(
      `select u.id, u.name, u.email, m.role from team_members m
       join users u on u.id = m.user_id where m.team_id = $1 order by (m.role = 'owner') desc, u.id`,
      [req.params.id],
    ),
  ),
);

r.post('/:id(\\d+)/members', owner, validate(Joi.object({ email: Joi.string().trim().lowercase().email().required() })), async (req, res) => {
  const [user] = await q('select id, name, email from users where email = $1', [req.body.email]);
  if (!user) return res.status(404).json({ error: `No account uses ${req.body.email} yet.` });
  const added = await q(
    "insert into team_members (team_id, user_id, role) values ($1, $2, 'member') on conflict do nothing returning user_id",
    [req.params.id, user.id],
  );
  added.length ? res.status(201).json({ ...user, role: 'member' }) : res.status(409).json({ error: `${user.name} is already on this team.` });
});

r.delete('/:id(\\d+)/members/:userId(\\d+)', owner, async (req, res) => {
  const [member] = await q('select role from team_members where team_id = $1 and user_id = $2', [req.params.id, req.params.userId]);
  if (!member) return res.status(404).json({ error: 'That person isn’t on this team' });
  if (member.role === 'owner') return res.status(400).json({ error: 'The owner can’t be removed. Delete the team instead.' });
  await q('delete from team_members where team_id = $1 and user_id = $2', [req.params.id, req.params.userId]);
  res.status(204).end();
});

r.delete('/:id(\\d+)', owner, async (req, res) => {
  await q('delete from teams where id = $1', [req.params.id]);
  res.status(204).end();
});

export default r;
