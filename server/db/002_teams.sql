create table if not exists teams (
  id         serial primary key,
  name       text not null,
  owner_id   int not null references users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists team_members (
  team_id int not null references teams (id) on delete cascade,
  user_id int not null references users (id) on delete cascade,
  role    text not null default 'member' check (role in ('owner', 'member')),
  primary key (team_id, user_id)
);
