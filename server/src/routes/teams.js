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

r.delete('/:id(\\d+)', owner, async (req, res) => {
  await q('delete from teams where id = $1', [req.params.id]);
  res.status(204).end();
});

export default r;
