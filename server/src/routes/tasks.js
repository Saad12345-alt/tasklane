import { Router } from 'express';
import Joi from 'joi';
import { q } from '../db.js';
import { validate, roleIn } from '../middleware.js';

const r = Router();
const withAssignee = 'select t.*, u.name as assignee_name from tasks t left join users u on u.id = t.assignee_id';
const one = async (id) => (await q(`${withAssignee} where t.id = $1`, [id]))[0];

const filters = Joi.object({
  teamId: Joi.number().integer(),
  assigneeId: Joi.number().integer(),
  q: Joi.string().trim().allow('').default(''),
});
const body = Joi.object({
  teamId: Joi.number().integer().required(),
  title: Joi.string().trim().min(1).max(120).required(),
  description: Joi.string().trim().allow('').max(2000).default(''),
  status: Joi.string().valid('todo', 'doing', 'done').default('todo'),
  assigneeId: Joi.number().integer().allow(null).default(null),
  dueDate: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).empty('').allow(null).default(null),
});

// Returns [status, message] if the caller may not put this task on that team, otherwise undefined.
const problem = async (userId, teamId, assigneeId) => {
  if (!(await roleIn(teamId, userId))) return [403, 'You are not on that team'];
  if (assigneeId && !(await roleIn(teamId, assigneeId))) return [400, 'The assignee is not on this team'];
};

// Only tasks from the caller's own teams are ever returned; filters narrow them further.
r.get('/', validate(filters, 'query'), async (req, res) => {
  const { teamId, assigneeId, q: search } = req.query;
  res.json(
    await q(
      `${withAssignee}
       where t.team_id in (select team_id from team_members where user_id = $1)
         and ($2::int is null or t.team_id = $2)
         and ($3::int is null or t.assignee_id = $3)
         and ($4::text is null or t.title ilike '%' || $4 || '%' or t.description ilike '%' || $4 || '%')
       order by t.status = 'done', t.due_date nulls last, t.id`,
      [req.user.id, teamId ?? null, assigneeId ?? null, search || null],
    ),
  );
});

r.post('/', validate(body), async (req, res) => {
  const b = req.body;
  const bad = await problem(req.user.id, b.teamId, b.assigneeId);
  if (bad) return res.status(bad[0]).json({ error: bad[1] });
  const [task] = await q(
    `insert into tasks (team_id, title, description, status, assignee_id, due_date, created_by)
     values ($1, $2, $3, $4, $5, $6, $7) returning id`,
    [b.teamId, b.title, b.description, b.status, b.assigneeId, b.dueDate, req.user.id],
  );
  res.status(201).json(await one(task.id));
});

r.put('/:id(\\d+)', validate(body.fork('teamId', (s) => s.optional())), async (req, res) => {
  const [old] = await q('select * from tasks where id = $1', [req.params.id]);
  if (!old || !(await roleIn(old.team_id, req.user.id))) return res.status(404).json({ error: 'Task not found' });
  const b = req.body;
  const bad = await problem(req.user.id, old.team_id, b.assigneeId);
  if (bad) return res.status(bad[0]).json({ error: bad[1] });
  await q('update tasks set title = $2, description = $3, status = $4, assignee_id = $5, due_date = $6 where id = $1', [
    old.id, b.title, b.description, b.status, b.assigneeId, b.dueDate,
  ]);
  res.json(await one(old.id));
});

// Team owners can delete any task; members can delete the ones they created.
r.delete('/:id(\\d+)', async (req, res) => {
  const [task] = await q('select * from tasks where id = $1', [req.params.id]);
  const role = task && (await roleIn(task.team_id, req.user.id));
  if (!role) return res.status(404).json({ error: 'Task not found' });
  if (role !== 'owner' && task.created_by !== req.user.id) return res.status(403).json({ error: 'Only the team owner or the creator can delete this task' });
  await q('delete from tasks where id = $1', [task.id]);
  res.status(204).end();
});

export default r;
