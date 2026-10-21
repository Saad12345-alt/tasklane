create table if not exists tasks (
  id          serial primary key,
  team_id     int not null references teams (id) on delete cascade,
  title       text not null,
  description text not null default '',
  status      text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  assignee_id int references users (id) on delete set null,
  due_date    date,
  created_by  int references users (id) on delete set null,
  created_at  timestamptz not null default now()
);

create index if not exists tasks_team_id_idx on tasks (team_id);
