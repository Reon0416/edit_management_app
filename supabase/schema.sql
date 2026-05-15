create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  role text not null check (role in ('manager', 'editor', 'both')),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text,
  manager_id uuid not null references public.users(id),
  editor_id uuid not null references public.users(id),
  status text not null check (status in ('未着手', '素材確認中', '編集中', '初稿提出済み', '修正依頼あり', '修正対応中', '再提出済み', '完成')),
  due_date date,
  memo text,
  drive_folder_url text not null,
  drive_folder_id text,
  script_url text,
  script_file_id text,
  material_folder_url text,
  material_folder_id text,
  first_draft_folder_url text,
  first_draft_folder_id text,
  revision_folder_url text,
  revision_folder_id text,
  final_folder_url text,
  final_folder_id text,
  last_drive_sync_at timestamptz,
  latest_file_name text,
  latest_file_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_histories (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  type text not null check (type in ('初稿提出', '修正依頼', '再提出', '完成', 'メモ', 'Drive同期', 'ステータス変更')),
  content text,
  file_url text,
  file_id text,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.drive_files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  drive_file_id text not null,
  name text not null,
  mime_type text not null,
  web_view_link text,
  parent_folder_id text,
  detected_type text not null check (detected_type in ('script', 'material', 'first_draft', 'revision', 'final', 'other')),
  size bigint,
  created_time timestamptz,
  modified_time timestamptz,
  is_trashed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(project_id, drive_file_id)
);

create table if not exists public.status_suggestions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  suggested_status text not null check (suggested_status in ('未着手', '素材確認中', '編集中', '初稿提出済み', '修正依頼あり', '修正対応中', '再提出済み', '完成')),
  reason text not null,
  related_file_id text,
  is_resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_projects_status on public.projects(status);
create index if not exists idx_projects_manager on public.projects(manager_id);
create index if not exists idx_projects_editor on public.projects(editor_id);
create index if not exists idx_drive_files_project_type on public.drive_files(project_id, detected_type);
create index if not exists idx_status_suggestions_project_unresolved on public.status_suggestions(project_id, is_resolved);
